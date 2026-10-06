import http from 'http';
import jwt from 'jsonwebtoken';
import { createApp } from '../src/app.js';
import { ENV } from '../src/config/env.js';
import { UserRole } from '@prisma/client';
import { prisma, isDbConfigured } from '../src/config/database.js';
import { hashPassword } from '../src/utils/password.js';

interface TestResult {
  name: string;
  passed: boolean;
  expectedStatus: number;
  actualStatus: number;
  details?: string;
}

const results: TestResult[] = [];

function request(
  server: http.Server,
  options: {
    method: string;
    path: string;
    headers?: Record<string, string>;
    body?: any;
  }
): Promise<{ status: number; body: any; headers: http.IncomingHttpHeaders }> {
  return new Promise((resolve, reject) => {
    const addr = server.address() as any;
    const req = http.request(
      {
        host: '127.0.0.1',
        port: addr.port,
        method: options.method,
        path: options.path,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
        },
      },
      res => {
        let data = '';
        res.on('data', chunk => (data += chunk));
        res.on('end', () => {
          let parsed: any;
          try {
            parsed = JSON.parse(data);
          } catch {
            parsed = data;
          }
          resolve({ status: res.statusCode || 500, body: parsed, headers: res.headers });
        });
      }
    );

    req.on('error', reject);

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('\n======================================================');
  console.log('   SYNCAMPUS — AUTHENTICATION & RBAC TEST SUITE      ');
  console.log('======================================================\n');

  const app = createApp();
  const server = app.listen(0); // Random free port

  async function resetTestUserPassword() {
    if (isDbConfigured) {
      try {
        const hash = await hashPassword('password123');
        await prisma.user.updateMany({
          where: { identifier: 'STU0001' },
          data: { passwordHash: hash },
        });
      } catch {
        // Ignored
      }
    }
  }

  try {
    await resetTestUserPassword();
    // 1. Health check
    const healthRes = await request(server, { method: 'GET', path: '/api/health' });
    assertTest('GET /api/health returns 200', 200, healthRes.status, healthRes.body?.status === 'ok');

    // 2. Successful Student Login
    const stuLogin = await request(server, {
      method: 'POST',
      path: '/api/v1/auth/login',
      body: { identifier: 'STU0001', password: 'password123' },
    });
    const stuToken = stuLogin.body?.accessToken;
    const stuRefresh = stuLogin.body?.refreshToken;
    const stuRole = stuLogin.body?.user?.role;
    assertTest(
      'Student login with ID returns 200 & JWT',
      200,
      stuLogin.status,
      stuToken && stuRole === 'STUDENT' && !stuLogin.body?.user?.passwordHash
    );

    // 3. Successful Student Login with Email
    const stuEmailLogin = await request(server, {
      method: 'POST',
      path: '/api/v1/auth/login',
      body: { identifier: 'stu0001@sonopantcollege.edu.in', password: 'password123' },
    });
    assertTest(
      'Student login with institutional email returns 200',
      200,
      stuEmailLogin.status,
      stuEmailLogin.body?.accessToken && stuEmailLogin.body?.user?.role === 'STUDENT'
    );

    // 4. Successful Teacher Login
    const teachLogin = await request(server, {
      method: 'POST',
      path: '/api/v1/auth/login',
      body: { identifier: 'T001', password: 'password123' },
    });
    const teachToken = teachLogin.body?.accessToken;
    assertTest(
      'Teacher login with ID returns 200 & TEACHER role',
      200,
      teachLogin.status,
      teachToken && teachLogin.body?.user?.role === 'TEACHER'
    );

    // 5. Successful Admin Login
    const adminLogin = await request(server, {
      method: 'POST',
      path: '/api/v1/auth/login',
      body: { identifier: 'ADMIN01', password: 'password123' },
    });
    const adminToken = adminLogin.body?.accessToken;
    assertTest(
      'Admin login returns 200 & ADMIN role',
      200,
      adminLogin.status,
      adminToken && adminLogin.body?.user?.role === 'ADMIN'
    );

    // 6. Wrong password returns 401
    const wrongPass = await request(server, {
      method: 'POST',
      path: '/api/v1/auth/login',
      body: { identifier: 'STU0001', password: 'incorrectPassword' },
    });
    assertTest('Wrong password returns 401 Unauthorized', 401, wrongPass.status, wrongPass.body?.message === 'Invalid credentials');

    // 7. Unknown identifier returns 401
    const unknownUser = await request(server, {
      method: 'POST',
      path: '/api/v1/auth/login',
      body: { identifier: 'UNKNOWN_99999', password: 'password123' },
    });
    assertTest('Unknown identifier returns 401 Unauthorized', 401, unknownUser.status, unknownUser.body?.message === 'Invalid credentials');

    // 8. Missing password returns 400
    const missingPass = await request(server, {
      method: 'POST',
      path: '/api/v1/auth/login',
      body: { identifier: 'STU0001' },
    });
    assertTest('Missing password returns 400 Bad Request', 400, missingPass.status);

    // 9. Missing identifier returns 400
    const missingId = await request(server, {
      method: 'POST',
      path: '/api/v1/auth/login',
      body: { password: 'password123' },
    });
    assertTest('Missing identifier returns 400 Bad Request', 400, missingId.status);

    // 10. Protected endpoint without token returns 401
    const noTokenRes = await request(server, {
      method: 'GET',
      path: '/api/v1/auth/test',
    });
    assertTest('Protected endpoint without token returns 401', 401, noTokenRes.status);

    // 11. Protected endpoint with valid token returns 200
    const validTokenRes = await request(server, {
      method: 'GET',
      path: '/api/v1/auth/test',
      headers: { Authorization: `Bearer ${stuToken}` },
    });
    assertTest('Protected endpoint with student token returns 200', 200, validTokenRes.status, validTokenRes.body?.authenticated === true);

    // 12. Invalid token returns 401
    const invalidTokenRes = await request(server, {
      method: 'GET',
      path: '/api/v1/auth/test',
      headers: { Authorization: 'Bearer this.is.a.completely.invalid.token' },
    });
    assertTest('Invalid token returns 401', 401, invalidTokenRes.status);

    // 13. Expired token returns 401
    const expiredToken = jwt.sign(
      { sub: 'test-user', role: 'STUDENT', identifier: 'STU0001', email: 's@test.com' },
      ENV.JWT_ACCESS_SECRET,
      { expiresIn: '0s' } // Expired immediately
    );
    const expiredRes = await request(server, {
      method: 'GET',
      path: '/api/v1/auth/test',
      headers: { Authorization: `Bearer ${expiredToken}` },
    });
    assertTest('Expired token returns 401', 401, expiredRes.status);

    // 14. RBAC: Student accessing admin-only route returns 403
    const stuToAdmin = await request(server, {
      method: 'GET',
      path: '/api/v1/auth/admin-only',
      headers: { Authorization: `Bearer ${stuToken}` },
    });
    assertTest('Student accessing Admin route returns 403 Forbidden', 403, stuToAdmin.status);

    // 15. RBAC: Teacher accessing admin-only route returns 403
    const teachToAdmin = await request(server, {
      method: 'GET',
      path: '/api/v1/auth/admin-only',
      headers: { Authorization: `Bearer ${teachToken}` },
    });
    assertTest('Teacher accessing Admin route returns 403 Forbidden', 403, teachToAdmin.status);

    // 16. RBAC: Admin accessing admin-only route returns 200
    const adminToAdmin = await request(server, {
      method: 'GET',
      path: '/api/v1/auth/admin-only',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assertTest('Admin accessing Admin route returns 200 OK', 200, adminToAdmin.status);

    // 17. Security: Role Tampering attempt during login is ignored
    const tamperLogin = await request(server, {
      method: 'POST',
      path: '/api/v1/auth/login',
      body: { identifier: 'STU0001', password: 'password123', role: 'ADMIN' },
    });
    const tamperedToken = tamperLogin.body?.accessToken;
    const tamperedRole = tamperLogin.body?.user?.role;
    const tamperAccess = await request(server, {
      method: 'GET',
      path: '/api/v1/auth/admin-only',
      headers: { Authorization: `Bearer ${tamperedToken}` },
    });
    assertTest(
      'Role tampering during login is ignored (Role remains STUDENT, Admin route returns 403)',
      403,
      tamperAccess.status,
      tamperedRole === 'STUDENT'
    );

    // 18. Refresh Token Rotation
    const refreshRes = await request(server, {
      method: 'POST',
      path: '/api/v1/auth/refresh',
      body: { refreshToken: stuRefresh },
    });
    assertTest(
      'Refresh token returns 200 with new accessToken & refreshToken',
      200,
      refreshRes.status,
      refreshRes.body?.accessToken && refreshRes.body?.refreshToken
    );

    // 19. Password Change Workflow
    // A. Wrong current password -> 400
    const badChange = await request(server, {
      method: 'POST',
      path: '/api/v1/auth/change-password',
      headers: { Authorization: `Bearer ${stuToken}` },
      body: { currentPassword: 'wrongPassword', newPassword: 'newSecurePassword2026' },
    });
    assertTest('Change password with wrong current password returns 400', 400, badChange.status);

    // B. Successful password change
    const goodChange = await request(server, {
      method: 'POST',
      path: '/api/v1/auth/change-password',
      headers: { Authorization: `Bearer ${stuToken}` },
      body: { currentPassword: 'password123', newPassword: 'newSecurePassword2026' },
    });
    assertTest('Change password with valid credentials returns 200', 200, goodChange.status);

    // C. Old password no longer works -> 401
    const oldPassLogin = await request(server, {
      method: 'POST',
      path: '/api/v1/auth/login',
      body: { identifier: 'STU0001', password: 'password123' },
    });
    assertTest('Old password login now returns 401', 401, oldPassLogin.status);

    // D. New password works -> 200
    const newPassLogin = await request(server, {
      method: 'POST',
      path: '/api/v1/auth/login',
      body: { identifier: 'STU0001', password: 'newSecurePassword2026' },
    });
    assertTest('New password login returns 200', 200, newPassLogin.status, newPassLogin.body?.accessToken);

    // 20. Sensitive Data Isolation: Verify no password_hash in GET /api/v1/auth/me or GET /api/v1/users/me
    const meRes = await request(server, {
      method: 'GET',
      path: '/api/v1/auth/me',
      headers: { Authorization: `Bearer ${newPassLogin.body?.accessToken}` },
    });
    const meString = JSON.stringify(meRes.body);
    const hasLeak = meString.includes('password') || meString.includes('$2a$') || meString.includes('$2b$');
    assertTest('GET /api/v1/auth/me returns user data without exposing password/hash', 200, meRes.status, !hasLeak);

    console.log('\n======================================================');
    const passedCount = results.filter(r => r.passed).length;
    const allPassed = passedCount === results.length;
    console.log(`TEST SUMMARY: ${passedCount} / ${results.length} PASSED (${allPassed ? '✅ 100% SUCCESS' : '❌ FAILURES DETECTED'})`);
    console.log('======================================================\n');

  } finally {
    await resetTestUserPassword();
    server.close();
  }
}

function assertTest(name: string, expectedStatus: number, actualStatus: number, extraCondition: boolean = true) {
  const passed = expectedStatus === actualStatus && extraCondition;
  results.push({ name, passed, expectedStatus, actualStatus });
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} [${actualStatus}] ${name}`);
}

runTests().catch(err => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
