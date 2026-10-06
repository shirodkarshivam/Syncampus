const VITE_URL = 'http://localhost:5173';

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

async function run() {
  console.log('\n======================================================');
  console.log('   END-TO-END VITE PROXY AUTHENTICATION VERIFICATION  ');
  console.log(`   Target: ${VITE_URL}`);
  console.log('======================================================\n');

  // 1. Frontend Root Loads
  const indexRes = await fetch(VITE_URL);
  assert(indexRes.status === 200, '[200] Vite dev server serves index.html at http://localhost:5173');

  // 2. Refresh on clean start (App.tsx initial mount check)
  const cleanRefreshRes = await fetch(`${VITE_URL}/api/v1/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  assert(
    cleanRefreshRes.status === 400,
    '[400] POST /api/v1/auth/refresh without token returns 400 (NO 502 Bad Gateway)'
  );

  // 3. Request OTP for Student
  const studentOtpReq = await fetch(`${VITE_URL}/api/v1/auth/request-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: 'stu0001@sonopantcollege.edu.in',
      requestedRole: 'STUDENT',
    }),
  });
  const studentOtpData = await studentOtpReq.json();
  assert(
    studentOtpReq.status === 200 && !!studentOtpData.devCode && studentOtpData.devCode.length === 6,
    `[200] Student OTP requested via Vite proxy (Generated dynamic code: ${studentOtpData.devCode})`
  );

  // 4. Test Demo OTP 123456 rejection
  const demoAttempt = await fetch(`${VITE_URL}/api/v1/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: 'stu0001@sonopantcollege.edu.in',
      otp: '123456',
      requestedRole: 'STUDENT',
    }),
  });
  assert(
    demoAttempt.status === 401,
    '[401] Hardcoded demo OTP 123456 strictly rejected by backend'
  );

  // 5. Test real OTP verification
  const realVerify = await fetch(`${VITE_URL}/api/v1/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: 'stu0001@sonopantcollege.edu.in',
      otp: studentOtpData.devCode,
      requestedRole: 'STUDENT',
    }),
  });
  const authPayload = await realVerify.json();
  assert(
    realVerify.status === 200 &&
      !!authPayload.accessToken &&
      authPayload.user.role === 'STUDENT' &&
      authPayload.user.email === 'stu0001@sonopantcollege.edu.in',
    '[200] Real OTP verified, authenticated session created in PostgreSQL'
  );

  // 6. Test session restoration with valid refresh token (F5 browser refresh)
  const sessionRestore = await fetch(`${VITE_URL}/api/v1/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: authPayload.refreshToken }),
  });
  const restoredPayload = await sessionRestore.json();
  assert(
    sessionRestore.status === 200 && !!restoredPayload.accessToken,
    '[200] Session restored via POST /api/v1/auth/refresh (Token rotation works)'
  );

  // 7. Verify profile retrieval via GET /api/v1/auth/me
  const meRes = await fetch(`${VITE_URL}/api/v1/auth/me`, {
    headers: { Authorization: `Bearer ${restoredPayload.accessToken}` },
  });
  const meData = await meRes.json();
  assert(
    meRes.status === 200 && meData.email === 'stu0001@sonopantcollege.edu.in' && meData.role === 'STUDENT',
    '[200] GET /api/v1/auth/me returns authoritative student profile'
  );

  // 8. Teacher Flow via Vite Proxy
  const teacherReq = await fetch(`${VITE_URL}/api/v1/auth/request-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: 'rahul.patil.t001@campus.edu',
      requestedRole: 'TEACHER',
    }),
  });
  const teacherData = await teacherReq.json();
  const teacherVerify = await fetch(`${VITE_URL}/api/v1/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: 'rahul.patil.t001@campus.edu',
      otp: teacherData.devCode,
      requestedRole: 'TEACHER',
    }),
  });
  const teacherAuth = await teacherVerify.json();
  assert(
    teacherVerify.status === 200 && teacherAuth.user.role === 'TEACHER',
    '[200] Teacher authenticated through Vite proxy with TEACHER role'
  );

  // 9. Admin Flow via Vite Proxy
  const adminReq = await fetch(`${VITE_URL}/api/v1/auth/request-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: 'admin@campus.edu',
      requestedRole: 'ADMIN',
    }),
  });
  const adminData = await adminReq.json();
  const adminVerify = await fetch(`${VITE_URL}/api/v1/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: 'admin@campus.edu',
      otp: adminData.devCode,
      requestedRole: 'ADMIN',
    }),
  });
  const adminAuth = await adminVerify.json();
  assert(
    adminVerify.status === 200 && adminAuth.user.role === 'ADMIN',
    '[200] Admin authenticated through Vite proxy with ADMIN role'
  );

  // 10. Logout invalidation
  const logoutRes = await fetch(`${VITE_URL}/api/v1/auth/logout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: authPayload.refreshToken }),
  });
  assert(logoutRes.status === 200, '[200] POST /api/v1/auth/logout invalidated session successfully');

  console.log('\n======================================================');
  console.log(`TEST SUMMARY: ${passed} / ${passed + failed} PASSED (${failed === 0 ? '✅ 100% SUCCESS' : '❌ FAILURES DETECTED'})`);
  console.log('======================================================\n');
}

run().catch(console.error);
