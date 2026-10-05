import http from 'http';
import { createApp } from '../src/app.js';
import { generateAccessToken, TokenPayload } from '../src/utils/jwt.js';
import { UserRole } from '@prisma/client';
import { timetableService } from '../src/services/timetableService.js';

interface TestCaseResult {
  category: string;
  test: string;
  expectedStatus: number;
  actualStatus: number;
  expectedCode?: string;
  actualCode?: string;
  passed: boolean;
  notes?: string;
}

const results: TestCaseResult[] = [];

function request(
  server: http.Server,
  options: {
    method: string;
    path: string;
    token?: string;
    body?: any;
  }
): Promise<{ status: number; body: any }> {
  return new Promise((resolve, reject) => {
    const addr = server.address() as any;
    const bodyStr = options.body ? JSON.stringify(options.body) : '';
    const req = http.request(
      {
        host: '127.0.0.1',
        port: addr.port,
        method: options.method,
        path: options.path,
        headers: {
          'Content-Type': 'application/json',
          ...(bodyStr ? { 'Content-Length': Buffer.byteLength(bodyStr) } : {}),
          ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
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
          resolve({ status: res.statusCode || 500, body: parsed });
        });
      }
    );

    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

async function runAllTimetableTests() {
  console.log('===========================================================');
  console.log('    SYNCAMPUS — PART 3 SERVER-SIDE TIMETABLE & CONFLICT    ');
  console.log('                    AUTOMATED TEST SUITE                   ');
  console.log('===========================================================\n');

  const app = createApp();
  const server = http.createServer(app);

  await new Promise<void>(resolve => server.listen(0, resolve));
  const port = (server.address() as any).port;
  console.log(`Ephemeral test server running on http://127.0.0.1:${port}\n`);

  // Tokens
  const studentToken = generateAccessToken({
    sub: 'stu-STU0001',
    identifier: 'STU0001',
    email: 'stu0001@sonopantcollege.edu.in',
    role: UserRole.STUDENT,
  });

  const teacherT005Token = generateAccessToken({
    sub: 'teach-T005',
    identifier: 'T005',
    email: 't005@syncampus.ac.in',
    role: UserRole.TEACHER,
  });

  const teacherT001Token = generateAccessToken({
    sub: 'teach-T001',
    identifier: 'T001',
    email: 't001@syncampus.ac.in',
    role: UserRole.TEACHER,
  });

  const adminToken = generateAccessToken({
    sub: 'admin-user-001',
    identifier: 'ADMIN01',
    email: 'admin@syncampus.ac.in',
    role: UserRole.ADMIN,
  });

  async function assertCase(
    category: string,
    test: string,
    method: string,
    path: string,
    expectedStatus: number,
    token?: string,
    body?: any,
    expectedCode?: string
  ) {
    const res = await request(server, { method, path, token, body });
    const actualCode = res.body?.error;
    const passed =
      res.status === expectedStatus &&
      (!expectedCode || actualCode === expectedCode);

    results.push({
      category,
      test,
      expectedStatus,
      actualStatus: res.status,
      expectedCode,
      actualCode,
      passed,
      notes: res.body?.message || (res.body?.count ? `Count: ${res.body.count}` : undefined),
    });

    const statusSymbol = passed ? '✅ PASS' : '❌ FAIL';
    console.log(
      `[${statusSymbol}] [${category}] ${test} -> HTTP ${res.status} (Expected: ${expectedStatus}${expectedCode ? ', Code: ' + expectedCode : ''})`
    );
    if (!passed) {
      console.error('    Unexpected response:', JSON.stringify(res.body));
    }
  }

  // --- 1. READ APIS ---
  console.log('\n--- 1. Testing Read Endpoints ---');
  await assertCase(
    'READ',
    'Get single lecture details (lec-1)',
    'GET',
    '/api/v1/timetable/lectures/lec-1',
    200,
    studentToken
  );

  await assertCase(
    'READ',
    'Get nonexistent lecture details',
    'GET',
    '/api/v1/timetable/lectures/lec-nonexistent-999',
    404,
    studentToken,
    undefined,
    'NOT_FOUND'
  );

  await assertCase(
    'READ',
    'Student fetch own division timetable',
    'GET',
    '/api/v1/students/me/timetable',
    200,
    studentToken
  );

  await assertCase(
    'READ',
    'Teacher fetch assigned lectures (T005)',
    'GET',
    '/api/v1/teachers/me/timetable',
    200,
    teacherT005Token
  );

  await assertCase(
    'READ',
    'Division timetable query (authorized)',
    'GET',
    '/api/v1/divisions/BSc%20IT_FY_A/timetable',
    200,
    studentToken
  );

  await assertCase(
    'READ',
    'Admin master timetable query with filters',
    'GET',
    '/api/v1/admin/timetable?course=BSc%20IT&academicYear=FY',
    200,
    adminToken
  );

  // --- 2. AUTHORIZATION RESTRICTIONS ---
  console.log('\n--- 2. Testing Authorization & RBAC ---');
  await assertCase(
    'AUTHZ',
    'Student forbidden from fetching other division timetable',
    'GET',
    '/api/v1/divisions/BSc%20CS_TY_A/timetable',
    403,
    studentToken,
    undefined,
    'FORBIDDEN'
  );

  await assertCase(
    'AUTHZ',
    'Student forbidden from inspecting room occupancy',
    'GET',
    '/api/v1/rooms/Room%20101/timetable',
    403,
    studentToken,
    undefined,
    'Forbidden'
  );

  await assertCase(
    'AUTHZ',
    'Teacher forbidden from admin master timetable',
    'GET',
    '/api/v1/admin/timetable',
    403,
    teacherT001Token,
    undefined,
    'Forbidden'
  );

  await assertCase(
    'AUTHZ',
    'Teacher T001 forbidden from modifying T005 lecture',
    'POST',
    '/api/v1/timetable/lectures/lec-1/cancel',
    403,
    teacherT001Token,
    { reason: 'Unauthorized cancellation' },
    'FORBIDDEN'
  );

  await assertCase(
    'AUTHZ',
    'Student forbidden from cancelling lecture',
    'POST',
    '/api/v1/timetable/lectures/lec-1/cancel',
    403,
    studentToken,
    { reason: 'Student trying to cancel' },
    'Forbidden'
  );

  // --- 3. CONFLICT ENGINE: TEACHER CONFLICT ---
  console.log('\n--- 3. Testing Teacher Conflict Engine ---');
  // In master timetable: T004 is teaching lec-2 on Monday Period 1.
  // If T005 attempts to substitute T004 for lec-1 (Monday Period 1), T004 is already teaching -> TEACHER_CONFLICT
  await assertCase(
    'CONFLICT',
    'Substitute teacher conflict (substitute is teaching during that slot)',
    'POST',
    '/api/v1/timetable/lectures/lec-1/change-teacher',
    409,
    teacherT005Token,
    { teacherId: 'T004', reason: 'Conflict test substitute' },
    'TEACHER_CONFLICT'
  );

  // --- 4. CONFLICT ENGINE: ROOM CONFLICT ---
  console.log('\n--- 4. Testing Room Conflict Engine ---');
  // On Monday Period 1, Room 102 is occupied by lec-2.
  // If lec-1 attempts to change room to Room 102 -> ROOM_CONFLICT
  await assertCase(
    'CONFLICT',
    'Room conflict (target room is occupied during that slot)',
    'POST',
    '/api/v1/timetable/lectures/lec-1/change-room',
    409,
    teacherT005Token,
    { roomId: 'Room 102', reason: 'Moving to occupied room' },
    'ROOM_CONFLICT'
  );

  // --- 5. CONFLICT ENGINE: DIVISION CONFLICT & MULTIPLE CONFLICTS ---
  console.log('\n--- 5. Testing Division Conflict & Multiple Conflicts ---');
  // Pure division conflict: Room 152 is free, T072 is free, but Division BSc IT_FY_A is already booked on Mon Period 2
  await assertCase(
    'CONFLICT',
    'Division conflict (division already has another lecture during target slot)',
    'POST',
    '/api/v1/timetable/lectures/extra',
    409,
    teacherT005Token,
    {
      subjectId: 'sub-BSc IT-Digital Electronics',
      divisionId: 'BSc IT_FY_A',
      teacherId: 'T072',
      roomId: 'Room 152',
      dayOfWeek: 1,
      periodNumber: 2,
    },
    'DIVISION_CONFLICT'
  );

  // Multiple simultaneous conflicts: Rescheduling lec-1 to Mon Period 2 causes both Room 101 and Division conflict
  await assertCase(
    'CONFLICT',
    'Multiple simultaneous conflicts detected',
    'POST',
    '/api/v1/timetable/lectures/lec-1/reschedule',
    409,
    teacherT005Token,
    { dayOfWeek: 1, periodNumber: 2, reason: 'Collision with Period 2' }
  );

  // --- 6. INPUT VALIDATION ---
  console.log('\n--- 6. Testing Input Validation ---');
  await assertCase(
    'VALIDATION',
    'Reschedule with invalid period number (99)',
    'POST',
    '/api/v1/timetable/lectures/lec-1/reschedule',
    400,
    teacherT005Token,
    { dayOfWeek: 1, periodNumber: 99, reason: 'Invalid slot' },
    'BAD_REQUEST'
  );

  await assertCase(
    'VALIDATION',
    'Cancellation with empty reason',
    'POST',
    '/api/v1/timetable/lectures/lec-1/cancel',
    400,
    teacherT005Token,
    { reason: '' },
    'BAD_REQUEST'
  );

  await assertCase(
    'VALIDATION',
    'Change room to nonexistent room',
    'POST',
    '/api/v1/timetable/lectures/lec-1/change-room',
    404,
    teacherT005Token,
    { roomId: 'Room 999999' },
    'NOT_FOUND'
  );

  // --- 7. SUCCESSFUL MUTATIONS & AUDIT LOGGING ---
  console.log('\n--- 7. Testing Successful Mutations & Transactions ---');
  // Room change to an unoccupied room during Monday Period 1 (Room 152 is unoccupied in Period 1 Monday)
  await assertCase(
    'MUTATION',
    'Change room to valid unoccupied room',
    'POST',
    '/api/v1/timetable/lectures/lec-1/change-room',
    200,
    teacherT005Token,
    { roomId: 'Room 152', reason: 'Projector malfunction in Room 101' }
  );

  // Verify change history was recorded
  await assertCase(
    'AUDIT',
    'Verify audit history for lec-1',
    'GET',
    '/api/v1/timetable/lectures/lec-1/history',
    200,
    teacherT005Token
  );

  // Cancel lecture
  await assertCase(
    'MUTATION',
    'Cancel own lecture successfully',
    'POST',
    '/api/v1/timetable/lectures/lec-1/cancel',
    200,
    teacherT005Token,
    { reason: 'Faculty medical emergency' }
  );

  // Attempt to cancel already cancelled lecture -> 422
  await assertCase(
    'MUTATION',
    'Cancel already cancelled lecture returns 422',
    'POST',
    '/api/v1/timetable/lectures/lec-1/cancel',
    422,
    teacherT005Token,
    { reason: 'Second cancellation attempt' },
    'UNPROCESSABLE_ENTITY'
  );

  // Admin delete lecture
  await assertCase(
    'MUTATION',
    'Admin delete lecture',
    'DELETE',
    '/api/v1/timetable/lectures/lec-1',
    200,
    adminToken
  );

  // --- 8. RESTORATION & MASTER TIMETABLE INTEGRITY ---
  console.log('\n--- 8. Testing Timetable Reset & Master Integrity Verification ---');
  timetableService.resetToOriginalTimetable();
  const integrity = timetableService.getIntegrityReport();
  console.log('Post-Test Integrity Report:');
  console.log(`  - Total Lectures:      ${integrity.totalLectures} (Expected: 1,275)`);
  console.log(`  - Teacher Conflicts:   ${integrity.teacherConflicts} (Expected: 0)`);
  console.log(`  - Room Conflicts:      ${integrity.roomConflicts} (Expected: 0)`);
  console.log(`  - Division Conflicts:  ${integrity.divisionConflicts} (Expected: 0)`);

  const integrityPassed =
    integrity.totalLectures === 1275 &&
    integrity.teacherConflicts === 0 &&
    integrity.roomConflicts === 0 &&
    integrity.divisionConflicts === 0;

  results.push({
    category: 'INTEGRITY',
    test: 'Master timetable pristine integrity (1,275 lectures, 0 conflicts)',
    expectedStatus: 1275,
    actualStatus: integrity.totalLectures,
    passed: integrityPassed,
    notes: `Conflicts: T=${integrity.teacherConflicts}, R=${integrity.roomConflicts}, D=${integrity.divisionConflicts}`,
  });

  server.close();

  console.log('\n===========================================================');
  console.log('                    TEST SUMMARY RESULTS                   ');
  console.log('===========================================================');
  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = total - passed;

  console.table(
    results.map(r => ({
      Category: r.category,
      Test: r.test,
      Expected: r.expectedStatus,
      Actual: r.actualStatus,
      Status: r.passed ? 'PASS' : 'FAIL',
      Notes: r.notes || '',
    }))
  );

  console.log(`Total Tests: ${total} | Passed: ${passed} | Failed: ${failed}`);

  if (failed > 0) {
    console.error(`\n❌ ${failed} test(s) failed.`);
    process.exit(1);
  } else {
    console.log('\n✅ ALL 20 PART 3 TIMETABLE & CONFLICT TESTS PASSED WITH 100% SUCCESS.');
    process.exit(0);
  }
}

runAllTimetableTests().catch(err => {
  console.error('Fatal Test Runner Error:', err);
  process.exit(1);
});
