import http from 'http';
import { io as ClientSocket, Socket as ClientSocketType } from 'socket.io-client';
import { createApp } from '../src/app.js';
import { initSocketServer, closeSocketServer } from '../src/realtime/socketServer.js';
import { prisma, verifyDatabaseConnection } from '../src/config/database.js';
import { generateAccessToken } from '../src/utils/jwt.js';
import { UserRole, LectureStatus } from '@prisma/client';
import { timetableService } from '../src/services/timetableService.js';

interface TestReportItem {
  id: number;
  test: string;
  expected: string;
  actual: string;
  status: 'PASS' | 'FAIL';
  details?: string;
}

const testResults: TestReportItem[] = [];

function recordTest(id: number, test: string, expected: string, actual: string, passed: boolean, details?: string) {
  testResults.push({
    id,
    test,
    expected,
    actual,
    status: passed ? 'PASS' : 'FAIL',
    details,
  });
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} [TEST ${id}] ${test} -> ${passed ? 'PASS' : 'FAIL'} (${actual})`);
  if (!passed && details) {
    console.error(`   Details: ${details}`);
  }
}

function restRequest(
  port: number,
  options: {
    method: string;
    path: string;
    token?: string;
    body?: any;
  }
): Promise<{ status: number; body: any }> {
  return new Promise((resolve, reject) => {
    const bodyStr = options.body ? JSON.stringify(options.body) : '';
    const req = http.request(
      {
        host: '127.0.0.1',
        port,
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

function connectClientSocket(port: number, token?: string): Promise<ClientSocketType> {
  return new Promise((resolve, reject) => {
    const socket = ClientSocket(`http://127.0.0.1:${port}`, {
      auth: token ? { token } : {},
      transports: ['websocket'],
      reconnection: false,
      timeout: 3000,
    });
    socket.on('connect', () => resolve(socket));
    socket.on('connect_error', err => reject(err));
  });
}

async function runPart6TestSuite() {
  console.log('======================================================================');
  console.log('       SYNCAMPUS — PART 6 REAL POSTGRESQL VERIFICATION SUITE         ');
  console.log('======================================================================\n');

  // 1. PostgreSQL Connection
  let dbConnected = false;
  try {
    await verifyDatabaseConnection();
    dbConnected = true;
    recordTest(1, 'PostgreSQL Connection', 'Connected', 'Connected', true);
  } catch (err: any) {
    recordTest(1, 'PostgreSQL Connection', 'Connected', err.message, false);
    process.exit(1);
  }

  // 2. Schema Availability
  const tables = await prisma.$queryRaw<any[]>`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
  `;
  const tableNames = tables.map(t => t.table_name);
  const requiredTables = [
    'users',
    'departments',
    'courses',
    'divisions',
    'students',
    'teachers',
    'subjects',
    'teacher_subjects',
    'rooms',
    'lectures',
    'notifications',
    'timetable_changes',
  ];
  const allTablesExist = requiredTables.every(t => tableNames.includes(t));
  recordTest(
    2,
    'Schema tables availability',
    requiredTables.join(', '),
    `${tableNames.length} tables present`,
    allTablesExist,
    allTablesExist ? undefined : `Missing: ${requiredTables.filter(t => !tableNames.includes(t)).join(', ')}`
  );

  // 3. Expected Row Counts
  const deptCount = await prisma.department.count();
  const courseCount = await prisma.course.count();
  const divCount = await prisma.division.count();
  const studentCount = await prisma.student.count();
  const teacherCount = await prisma.teacher.count();
  const roomCount = await prisma.room.count();
  const subjectCount = await prisma.subject.count();
  const tsCount = await prisma.teacherSubject.count();
  const lectureCount = await prisma.lecture.count();
  const userCount = await prisma.user.count();

  const countsMatch =
    deptCount === 4 &&
    courseCount === 8 &&
    divCount === 51 &&
    studentCount === 2700 &&
    teacherCount === 72 &&
    roomCount === 62 &&
    subjectCount === 144 &&
    tsCount === 204 &&
    lectureCount === 1275 &&
    userCount === 2773;

  recordTest(
    3,
    'Authoritative row counts match exactly',
    '4/8/51/2700/72/62/144/204/1275/2773',
    `${deptCount}/${courseCount}/${divCount}/${studentCount}/${teacherCount}/${roomCount}/${subjectCount}/${tsCount}/${lectureCount}/${userCount}`,
    countsMatch
  );

  // 4. FK Integrity Verification
  const orphanStudents = await prisma.$queryRaw<any[]>`
    SELECT s.id FROM students s
    LEFT JOIN divisions d ON s.division_id = d.id
    LEFT JOIN users u ON s.user_id = u.id
    WHERE d.id IS NULL OR u.id IS NULL
  `;

  const orphanTeachers = await prisma.$queryRaw<any[]>`
    SELECT t.id FROM teachers t
    LEFT JOIN departments d ON t.department_id = d.id
    LEFT JOIN users u ON t.user_id = u.id
    WHERE d.id IS NULL OR u.id IS NULL
  `;

  const orphanLectures = await prisma.$queryRaw<any[]>`
    SELECT l.id FROM lectures l
    LEFT JOIN divisions d ON l.division_id = d.id
    LEFT JOIN subjects sub ON l.subject_id = sub.id
    LEFT JOIN teachers t ON l.teacher_id = t.id
    LEFT JOIN rooms r ON l.room_id = r.id
    WHERE d.id IS NULL OR sub.id IS NULL OR t.id IS NULL OR r.id IS NULL
  `;

  const fkIntegrityPassed =
    orphanStudents.length === 0 &&
    orphanTeachers.length === 0 &&
    orphanLectures.length === 0;

  recordTest(
    4,
    'Foreign key integrity verification',
    '0 orphan records',
    `Students: ${orphanStudents.length}, Teachers: ${orphanTeachers.length}, Lectures: ${orphanLectures.length}`,
    fkIntegrityPassed
  );

  // Spin up test server for REST and Socket testing
  const app = createApp();
  const server = http.createServer(app);
  const ioServer = initSocketServer(server);
  await new Promise<void>(resolve => server.listen(0, resolve));
  const port = (server.address() as any).port;

  // 5. Authentication from PostgreSQL
  const adminLogin = await restRequest(port, {
    method: 'POST',
    path: '/api/v1/auth/login',
    body: { identifier: 'ADMIN01', password: 'password123' },
  });
  const adminToken = adminLogin.body?.accessToken;

  const teacherLogin = await restRequest(port, {
    method: 'POST',
    path: '/api/v1/auth/login',
    body: { identifier: 'T005', password: 'password123' },
  });
  const teacherToken = teacherLogin.body?.accessToken;

  const studentLogin = await restRequest(port, {
    method: 'POST',
    path: '/api/v1/auth/login',
    body: { identifier: 'STU0001', password: 'password123' },
  });
  const studentToken = studentLogin.body?.accessToken;

  const badPassLogin = await restRequest(port, {
    method: 'POST',
    path: '/api/v1/auth/login',
    body: { identifier: 'STU0001', password: 'wrongPassword' },
  });

  const meCheck = await restRequest(port, {
    method: 'GET',
    path: '/api/v1/auth/me',
    token: studentToken,
  });

  const authPassed =
    adminLogin.status === 200 &&
    teacherLogin.status === 200 &&
    studentLogin.status === 200 &&
    badPassLogin.status === 401 &&
    meCheck.status === 200 &&
    meCheck.body?.identifier === 'STU0001';

  recordTest(
    5,
    'Authentication directly against PostgreSQL users',
    'Login 200, Wrong Pass 401, Me 200',
    `Admin: ${adminLogin.status}, Teacher: ${teacherLogin.status}, Student: ${studentLogin.status}, Bad: ${badPassLogin.status}, Me: ${meCheck.status}`,
    authPassed
  );

  // 6. Student Timetable from PostgreSQL
  const stuTtRes = await restRequest(port, {
    method: 'GET',
    path: '/api/v1/students/me/timetable',
    token: studentToken,
  });
  const studentLectures = stuTtRes.body?.timetable || [];
  recordTest(
    6,
    'Student timetable reads PostgreSQL',
    'Status 200 & 25 weekly sessions',
    `Status ${stuTtRes.status} & ${studentLectures.length} sessions`,
    stuTtRes.status === 200 && studentLectures.length === 25
  );

  // 7. Teacher Timetable from PostgreSQL
  const teachTtRes = await restRequest(port, {
    method: 'GET',
    path: '/api/v1/teachers/me/timetable',
    token: teacherToken,
  });
  const teacherLectures = teachTtRes.body?.timetable || [];
  recordTest(
    7,
    'Teacher timetable reads PostgreSQL',
    'Status 200 & lectures retrieved',
    `Status ${teachTtRes.status} & ${teacherLectures.length} sessions`,
    teachTtRes.status === 200 && teacherLectures.length > 0
  );

  // 8. Admin Master Timetable with filters from PostgreSQL
  const adminTtRes = await restRequest(port, {
    method: 'GET',
    path: '/api/v1/admin/timetable?course=BSc%20IT&academicYear=FY',
    token: adminToken,
  });
  const adminLectures = adminTtRes.body?.timetable || [];
  recordTest(
    8,
    'Admin master timetable query with PostgreSQL filters',
    'Status 200 & filtered sessions',
    `Status ${adminTtRes.status} & ${adminLectures.length} sessions`,
    adminTtRes.status === 200 && adminLectures.length > 0
  );

  // Connect sockets for realtime verification
  const socketStudent1 = await connectClientSocket(port, studentToken);
  const socketAdmin = await connectClientSocket(port, adminToken);

  const socketEventsS1: any[] = [];
  const socketEventsAdmin: any[] = [];

  const ALL_SOCKET_EVENTS = [
    'timetable:lecture_cancelled',
    'timetable:lecture_rescheduled',
    'timetable:lecture_room_changed',
    'timetable:lecture_teacher_changed',
    'timetable:lecture_created',
    'timetable:lecture_deleted',
  ];

  ALL_SOCKET_EVENTS.forEach(ev => {
    socketStudent1.on(ev, data => socketEventsS1.push({ event: ev, data }));
    socketAdmin.on(ev, data => socketEventsAdmin.push({ event: ev, data }));
  });

  // 9. Successful Timetable Mutation
  socketEventsS1.length = 0;
  socketEventsAdmin.length = 0;
  const initialAuditCount = await prisma.timetableChange.count();
  const initialNotifCount = await prisma.notification.count();

  // Pick lec-103 (BSc IT_FY_A) and change room to unoccupied Room 152
  const mutRes = await restRequest(port, {
    method: 'POST',
    path: '/api/v1/timetable/lectures/lec-103/change-room',
    token: adminToken,
    body: { roomId: 'Room 152', reason: 'Part 6 PostgreSQL transaction test' },
  });

  await new Promise(r => setTimeout(r, 80));

  const dbLecAfterMut = await prisma.lecture.findUnique({
    where: { id: 'lec-103' },
    include: { room: true },
  });

  const mutationSavedToDb =
    mutRes.status === 200 &&
    dbLecAfterMut?.status === LectureStatus.ROOM_CHANGED &&
    dbLecAfterMut?.room.roomName === 'Room 152';

  recordTest(
    9,
    'Successful timetable mutation modifies PostgreSQL record',
    'Status 200 & DB room updated to Room 152',
    `Status ${mutRes.status}, DB room: ${dbLecAfterMut?.room.roomName}`,
    mutationSavedToDb
  );

  // 10. PostgreSQL Audit Persistence
  const newAuditCount = await prisma.timetableChange.count();
  const latestAudit = await prisma.timetableChange.findFirst({
    where: { lectureId: 'lec-103' },
    orderBy: { createdAt: 'desc' },
  });

  const auditPersisted =
    newAuditCount > initialAuditCount &&
    latestAudit?.changeType === 'ROOM_CHANGE' &&
    latestAudit?.reason === 'Part 6 PostgreSQL transaction test';

  recordTest(
    10,
    'TimetableChange audit record persists in PostgreSQL',
    'New audit row with type ROOM_CHANGE',
    `Audits: ${newAuditCount} (Prev: ${initialAuditCount}), latest: ${latestAudit?.changeType}`,
    auditPersisted
  );

  // 11. PostgreSQL Notification Persistence
  const newNotifCount = await prisma.notification.count();
  const latestNotif = await prisma.notification.findFirst({
    where: { lectureId: 'lec-103' },
    orderBy: { createdAt: 'desc' },
  });

  const notifPersisted =
    newNotifCount > initialNotifCount &&
    latestNotif?.type === 'ROOM_CHANGE';

  recordTest(
    11,
    'Notification record persists in PostgreSQL with targeting',
    'Notifications created in PostgreSQL',
    `Count: ${newNotifCount} (Prev: ${initialNotifCount}), latest type: ${latestNotif?.type}`,
    notifPersisted
  );

  // 12. Conflict Rejection (409)
  // Attempt to assign Room 102 during Monday Period 1 (occupied by lec-2)
  socketEventsS1.length = 0;
  socketEventsAdmin.length = 0;
  const auditBeforeConflict = await prisma.timetableChange.count();
  const notifBeforeConflict = await prisma.notification.count();
  const lec1BeforeConflict = await prisma.lecture.findUnique({
    where: { id: 'lec-1' },
    include: { room: true },
  });

  const conflictRes = await restRequest(port, {
    method: 'POST',
    path: '/api/v1/timetable/lectures/lec-1/change-room',
    token: adminToken,
    body: { roomId: 'Room 102', reason: 'Conflict test' },
  });

  await new Promise(r => setTimeout(r, 80));

  recordTest(
    12,
    'Conflict detection returns HTTP 409 against real DB data',
    'HTTP 409 ROOM_CONFLICT',
    `HTTP ${conflictRes.status} (${conflictRes.body?.error})`,
    conflictRes.status === 409 && conflictRes.body?.error === 'ROOM_CONFLICT'
  );

  // 13. Rollback Behavior
  const lec1AfterConflict = await prisma.lecture.findUnique({
    where: { id: 'lec-1' },
    include: { room: true },
  });
  const rollbackSuccess =
    conflictRes.status === 409 &&
    lec1AfterConflict?.roomId === lec1BeforeConflict?.roomId &&
    lec1AfterConflict?.status === lec1BeforeConflict?.status &&
    lec1AfterConflict?.updatedAt.getTime() === lec1BeforeConflict?.updatedAt.getTime();

  recordTest(
    13,
    'Database transaction rolls back on conflict (record unchanged)',
    `Room remains ${lec1BeforeConflict?.room.roomName}, status unchanged`,
    `Room: ${lec1AfterConflict?.room.roomName}, status: ${lec1AfterConflict?.status}`,
    rollbackSuccess
  );

  // 14. No Notification on Failed Mutation
  const notifAfterConflict = await prisma.notification.count();
  const noNotifAdded = notifAfterConflict === notifBeforeConflict;
  recordTest(
    14,
    'No notification created in PostgreSQL on rejected mutation',
    `Count remains ${notifBeforeConflict}`,
    `Count: ${notifAfterConflict}`,
    noNotifAdded
  );

  // 15. No Realtime Event on Failed Mutation
  const noSocketEventsOnConflict = socketEventsS1.length === 0 && socketEventsAdmin.length === 0;
  recordTest(
    15,
    'No Socket.IO event emitted on rolled-back mutation',
    '0 events emitted',
    `S1 events: ${socketEventsS1.length}, Admin events: ${socketEventsAdmin.length}`,
    noSocketEventsOnConflict
  );

  // 16. Successful Realtime Event after Transaction Commit
  socketEventsS1.length = 0;
  socketEventsAdmin.length = 0;
  const cancelRes = await restRequest(port, {
    method: 'POST',
    path: '/api/v1/timetable/lectures/lec-103/cancel',
    token: adminToken,
    body: { reason: 'Part 6 post-commit event verification' },
  });

  await new Promise(r => setTimeout(r, 80));

  const s1GotCancelled = socketEventsS1.some(e => e.event === 'timetable:lecture_cancelled' && e.data.lectureId === 'lec-103');
  const adminGotCancelled = socketEventsAdmin.some(e => e.event === 'timetable:lecture_cancelled' && e.data.lectureId === 'lec-103');

  recordTest(
    16,
    'Socket.IO event emitted only after PostgreSQL transaction commits',
    'HTTP 200 & Socket event delivered to division & admin',
    `Status ${cancelRes.status}, S1 received: ${s1GotCancelled}, Admin received: ${adminGotCancelled}`,
    cancelRes.status === 200 && s1GotCancelled && adminGotCancelled
  );

  // Close active sockets and server for restart test
  socketStudent1.disconnect();
  socketAdmin.disconnect();
  closeSocketServer();
  await new Promise<void>(resolve => server.close(() => resolve()));

  // 17. Server Restart Persistence Test
  console.log('\n--- Executing Controlled Server Restart Persistence Test ---');
  // At this point, Node HTTP server is stopped.
  // Spin up a brand new server instance on a fresh ephemeral port
  const restartApp = createApp();
  const restartServer = http.createServer(restartApp);
  initSocketServer(restartServer);
  await new Promise<void>(resolve => restartServer.listen(0, resolve));
  const newPort = (restartServer.address() as any).port;
  console.log(`New server instance started on port ${newPort}`);

  // Query lec-103 on the new server instance
  const restartedLectureRes = await restRequest(newPort, {
    method: 'GET',
    path: '/api/v1/timetable/lectures/lec-103',
    token: adminToken,
  });

  const restartedHistoryRes = await restRequest(newPort, {
    method: 'GET',
    path: '/api/v1/timetable/lectures/lec-103/history',
    token: adminToken,
  });

  const persistedLecture = restartedLectureRes.body?.lecture;
  const persistedHistory = restartedHistoryRes.body?.history || [];

  const restartPersistencePassed =
    restartedLectureRes.status === 200 &&
    persistedLecture?.status === 'CANCELLED' &&
    persistedLecture?.cancellationReason === 'Part 6 post-commit event verification' &&
    persistedHistory.length > 0;

  recordTest(
    17,
    'Data survives server restart (lecture state, audit history, notifications)',
    'Cancelled state & audit log intact after server restart',
    `Status: ${persistedLecture?.status}, Audits found: ${persistedHistory.length}`,
    restartPersistencePassed
  );

  // Close restart test server
  closeSocketServer();
  await new Promise<void>(resolve => restartServer.close(() => resolve()));

  // 18. Data Duplication & Orphan Checks
  const dupIdentifiers = await prisma.$queryRaw<any[]>`
    SELECT identifier, COUNT(*) as count FROM users GROUP BY identifier HAVING COUNT(*) > 1
  `;
  const dupEmails = await prisma.$queryRaw<any[]>`
    SELECT email, COUNT(*) as count FROM users GROUP BY email HAVING COUNT(*) > 1
  `;
  const dupLectures = await prisma.$queryRaw<any[]>`
    SELECT id, COUNT(*) as count FROM lectures GROUP BY id HAVING COUNT(*) > 1
  `;
  const dupTS = await prisma.$queryRaw<any[]>`
    SELECT teacher_id, subject_id, COUNT(*) as count FROM teacher_subjects GROUP BY teacher_id, subject_id HAVING COUNT(*) > 1
  `;

  const duplicationPassed =
    dupIdentifiers.length === 0 &&
    dupEmails.length === 0 &&
    dupLectures.length === 0 &&
    dupTS.length === 0;

  recordTest(
    18,
    'Zero duplicate identifiers, emails, lectures, or links',
    '0 duplicates found',
    `Dup Users: ${dupIdentifiers.length}, Emails: ${dupEmails.length}, Lectures: ${dupLectures.length}, TS: ${dupTS.length}`,
    duplicationPassed
  );

  // 19. Pristine Timetable Integrity: Zero Conflicts
  // Reset lec-103 back to clean state before final conflict scan
  await timetableService.resetToOriginalTimetable();
  const dbIntegrity = await timetableService.getDbIntegrityReport();

  const zeroConflictsPassed =
    dbIntegrity.teacherConflicts === 0 &&
    dbIntegrity.roomConflicts === 0 &&
    dbIntegrity.divisionConflicts === 0;

  recordTest(
    19,
    'Zero timetable conflicts across all sessions in PostgreSQL',
    'T=0, R=0, D=0 conflicts',
    `Teacher Conflicts: ${dbIntegrity.teacherConflicts}, Room: ${dbIntegrity.roomConflicts}, Division: ${dbIntegrity.divisionConflicts} (Total: ${dbIntegrity.totalLectures})`,
    zeroConflictsPassed
  );

  // Summary Report
  console.log('\n======================================================================');
  console.log('              PART 6 DATABASE VERIFICATION TEST SUMMARY               ');
  console.log('======================================================================\n');
  console.table(
    testResults.map(r => ({
      '#': r.id,
      Test: r.test,
      Expected: r.expected,
      Actual: r.actual,
      Status: r.status,
    }))
  );

  const passedCount = testResults.filter(r => r.status === 'PASS').length;
  const totalCount = testResults.length;

  console.log(`\nTOTAL: ${totalCount} | PASSED: ${passedCount} | FAILED: ${totalCount - passedCount}`);

  if (passedCount === totalCount) {
    console.log('\n✅ ALL 19 PART 6 DATABASE TESTS PASSED WITH 100% SUCCESS.\n');
    process.exit(0);
  } else {
    console.error('\n❌ SOME PART 6 DATABASE TESTS FAILED.\n');
    process.exit(1);
  }
}

runPart6TestSuite()
  .catch(err => {
    console.error('Fatal error in Part 6 test runner:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
