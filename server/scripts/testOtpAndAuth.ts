import http from 'http';
import { createApp } from '../src/app.js';
import { verifyDatabaseConnection } from '../src/config/database.js';

let server: http.Server;
const PORT = 5005;
const BASE_URL = `http://localhost:${PORT}`;

async function request(path: string, options: any = {}) {
  const url = `${BASE_URL}${path}`;
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });

  let data: any = null;
  const text = await response.text();
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }

  return { status: response.status, headers: response.headers, data };
}

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`✅ ${testName}`);
    passed++;
  } else {
    console.error(`❌ FAILED: ${testName} ${detail ? `(${detail})` : ''}`);
    failed++;
  }
}

async function runTests() {
  console.log('\n======================================================');
  console.log('   SYNCAMPUS — OTP & AUTHENTICATION VERIFICATION      ');
  console.log('======================================================\n');

  await verifyDatabaseConnection();

  const app = createApp();
  await new Promise<void>((resolve) => {
    server = app.listen(PORT, () => {
      resolve();
    });
  });

  try {
    // 1. Health Check
    const health = await request('/api/health');
    assert(health.status === 200 && health.data.status === 'ok', '[200] GET /api/health');

    // 2. Request OTP for unregistered account
    const unreg = await request('/api/v1/auth/request-otp', {
      method: 'POST',
      body: JSON.stringify({ identifier: 'nonexistent@campus.edu', requestedRole: 'STUDENT' }),
    });
    assert(unreg.status === 404, '[404] Request OTP for unknown email rejected');

    // 3. Role Mismatch Rejection (Student trying Admin portal)
    const roleMismatch = await request('/api/v1/auth/request-otp', {
      method: 'POST',
      body: JSON.stringify({ identifier: 'stu0001@sonopantcollege.edu.in', requestedRole: 'ADMIN' }),
    });
    assert(roleMismatch.status === 403, '[403] Role mismatch rejected (Student requesting Admin)');

    // 4. Request OTP for valid Student
    const studentOtpReq = await request('/api/v1/auth/request-otp', {
      method: 'POST',
      body: JSON.stringify({ identifier: 'stu0001@sonopantcollege.edu.in', requestedRole: 'STUDENT' }),
    });
    assert(
      studentOtpReq.status === 200 && !!studentOtpReq.data.devCode && studentOtpReq.data.devCode.length === 6,
      '[200] Student OTP request succeeded with dynamic 6-digit code'
    );
    const validStudentOtp = studentOtpReq.data.devCode;

    // 5. Hardcoded 123456 must be REJECTED if it does not match the generated code
    if (validStudentOtp !== '123456') {
      const demoAttempt = await request('/api/v1/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({
          identifier: 'stu0001@sonopantcollege.edu.in',
          otp: '123456',
          requestedRole: 'STUDENT',
        }),
      });
      assert(demoAttempt.status === 401, '[401] Hardcoded demo OTP 123456 strictly rejected');
    }

    // 6. Invalid OTP (e.g. 000000) rejected
    const invalidAttempt = await request('/api/v1/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({
        identifier: 'stu0001@sonopantcollege.edu.in',
        otp: '000000',
        requestedRole: 'STUDENT',
      }),
    });
    assert(invalidAttempt.status === 401, '[401] Incorrect OTP 000000 rejected');

    // 7. Verify with real generated OTP
    const verifySuccess = await request('/api/v1/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({
        identifier: 'stu0001@sonopantcollege.edu.in',
        otp: validStudentOtp,
        requestedRole: 'STUDENT',
      }),
    });
    assert(
      verifySuccess.status === 200 &&
        !!verifySuccess.data.accessToken &&
        !!verifySuccess.data.refreshToken &&
        verifySuccess.data.user.role === 'STUDENT',
      '[200] Real OTP verification succeeded, issued tokens for STUDENT'
    );
    const studentAccessToken = verifySuccess.data.accessToken;
    const studentRefreshToken = verifySuccess.data.refreshToken;

    // 8. One-time use: Re-using the same OTP must fail
    const reuseAttempt = await request('/api/v1/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({
        identifier: 'stu0001@sonopantcollege.edu.in',
        otp: validStudentOtp,
        requestedRole: 'STUDENT',
      }),
    });
    assert(reuseAttempt.status === 400, '[400] Re-use of consumed OTP rejected (Single-use enforcement)');

    // 9. Session Refresh via POST /api/v1/auth/refresh
    const refreshRes = await request('/api/v1/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: studentRefreshToken }),
    });
    assert(
      refreshRes.status === 200 && !!refreshRes.data.accessToken && !!refreshRes.data.refreshToken,
      '[200] POST /api/v1/auth/refresh successfully rotated tokens'
    );

    // 10. Refresh without token returns 400 (graceful unauthenticated response)
    const emptyRefresh = await request('/api/v1/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    assert(emptyRefresh.status === 400, '[400] POST /api/v1/auth/refresh without token returns 400 Bad Request');

    // 11. Teacher OTP Flow
    const teacherOtpReq = await request('/api/v1/auth/request-otp', {
      method: 'POST',
      body: JSON.stringify({ identifier: 'rahul.patil.t001@campus.edu', requestedRole: 'TEACHER' }),
    });
    assert(teacherOtpReq.status === 200, '[200] Teacher OTP requested successfully');
    const teacherVerify = await request('/api/v1/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({
        identifier: 'rahul.patil.t001@campus.edu',
        otp: teacherOtpReq.data.devCode,
        requestedRole: 'TEACHER',
      }),
    });
    assert(
      teacherVerify.status === 200 && teacherVerify.data.user.role === 'TEACHER',
      '[200] Teacher OTP verified, issued TEACHER credentials'
    );

    // 12. Admin OTP Flow
    const adminOtpReq = await request('/api/v1/auth/request-otp', {
      method: 'POST',
      body: JSON.stringify({ identifier: 'admin@campus.edu', requestedRole: 'ADMIN' }),
    });
    assert(adminOtpReq.status === 200, '[200] Admin OTP requested successfully');
    const adminVerify = await request('/api/v1/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({
        identifier: 'admin@campus.edu',
        otp: adminOtpReq.data.devCode,
        requestedRole: 'ADMIN',
      }),
    });
    assert(
      adminVerify.status === 200 && adminVerify.data.user.role === 'ADMIN',
      '[200] Admin OTP verified, issued ADMIN credentials'
    );
    const adminAccessToken = adminVerify.data.accessToken;

    // 13. RBAC Authorization: Student cannot access Admin route
    const studentToAdmin = await request('/api/v1/auth/admin-only', {
      headers: { Authorization: `Bearer ${studentAccessToken}` },
    });
    assert(studentToAdmin.status === 403, '[403] Student forbidden from admin route');

    // 14. RBAC Authorization: Admin can access Admin route
    const adminToAdmin = await request('/api/v1/auth/admin-only', {
      headers: { Authorization: `Bearer ${adminAccessToken}` },
    });
    assert(adminToAdmin.status === 200, '[200] Admin allowed on admin route');

    console.log('\n======================================================');
    console.log(`TEST SUMMARY: ${passed} / ${passed + failed} PASSED (${failed === 0 ? '✅ 100% SUCCESS' : '❌ FAILURES DETECTED'})`);
    console.log('======================================================\n');
  } finally {
    server.close();
  }
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  if (server) server.close();
  process.exit(1);
});
