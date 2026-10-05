import http from 'http';
import { io as ClientSocket, Socket as ClientSocketType } from 'socket.io-client';
import { createApp } from '../src/app.js';
import { initSocketServer, closeSocketServer } from '../src/realtime/socketServer.js';
import { generateAccessToken } from '../src/utils/jwt.js';
import { UserRole } from '@prisma/client';
import { loadFallbackStudents } from '../src/data/authFallback.js';

interface TestResult {
  num: number;
  name: string;
  expected: string;
  actual: string;
  status: 'PASS' | 'FAIL';
  details?: string;
}

const testResults: TestResult[] = [];

function recordTest(num: number, name: string, expected: string, actual: string, passed: boolean, details?: string) {
  testResults.push({
    num,
    name,
    expected,
    actual,
    status: passed ? 'PASS' : 'FAIL',
    details,
  });
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

    socket.on('connect', () => {
      resolve(socket);
    });

    socket.on('connect_error', (err) => {
      reject(err);
    });
  });
}

async function runPart5RealtimeTests() {
  console.log('===========================================================');
  console.log('    SYNCAMPUS — PART 5 REAL-TIME & NOTIFICATIONS SUITE    ');
  console.log('===========================================================\n');

  const app = createApp();
  const server = http.createServer(app);
  const ioServer = initSocketServer(server);

  await new Promise<void>(resolve => server.listen(0, resolve));
  const port = (server.address() as any).port;
  console.log(`Ephemeral real-time test server running on http://127.0.0.1:${port}\n`);

  // Prepare users
  const students = loadFallbackStudents();
  const student1 = students[0]; // e.g. STU0001 (BSc IT_FY_A)
  const student2 = students.find(s => s.division !== student1.division) || students[50]; // e.g. BSc CS_FY_A

  console.log(`Test Student 1: ${student1.identifier} (Division: ${student1.division})`);
  console.log(`Test Student 2: ${student2.identifier} (Division: ${student2.division})\n`);

  const student1Token = generateAccessToken({
    sub: student1.id,
    identifier: student1.identifier,
    email: student1.email,
    role: UserRole.STUDENT,
  });

  const student2Token = generateAccessToken({
    sub: student2.id,
    identifier: student2.identifier,
    email: student2.email,
    role: UserRole.STUDENT,
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

  // 1. Authenticated socket connection with valid JWT
  try {
    const s1 = await connectClientSocket(port, student1Token);
    recordTest(1, 'Authenticated socket connection with valid JWT succeeds', 'Connected', 'Connected', s1.connected);
    s1.disconnect();
  } catch (err: any) {
    recordTest(1, 'Authenticated socket connection with valid JWT succeeds', 'Connected', err.message, false);
  }

  // 2. Unauthenticated socket connection is rejected
  try {
    await connectClientSocket(port, undefined);
    recordTest(2, 'Unauthenticated socket rejected without token', 'Rejected', 'Connected', false);
  } catch (err: any) {
    recordTest(2, 'Unauthenticated socket rejected without token', 'Rejected', err.message, true, err.message);
  }

  // 3. Tampered / invalid token rejected
  try {
    await connectClientSocket(port, 'invalid.tampered.token');
    recordTest(3, 'Socket connection rejected with invalid/tampered token', 'Rejected', 'Connected', false);
  } catch (err: any) {
    recordTest(3, 'Socket connection rejected with invalid/tampered token', 'Rejected', err.message, true, err.message);
  }

  // Establish persistent sockets for multi-user real-time testing
  const socketStudent1 = await connectClientSocket(port, student1Token);
  const socketStudent2 = await connectClientSocket(port, student2Token);
  const socketTeacher = await connectClientSocket(port, teacherT001Token);
  const socketAdmin = await connectClientSocket(port, adminToken);

  // 4. Server-enforced room membership: inspect server socket rooms for Student 1
  const serverSocketS1 = ioServer.sockets.sockets.get(socketStudent1.id);
  const roomsS1 = serverSocketS1 ? Array.from(serverSocketS1.rooms) : [];
  const expectedDivRoom = `division:${student1.division}`;
  const hasExpectedDiv = roomsS1.includes(expectedDivRoom);
  const hasAdminRoom = roomsS1.includes('admin');
  const hasTeacherRoom = roomsS1.some(r => r.startsWith('teacher:'));

  recordTest(
    4,
    `Student joins only authorized division room (${expectedDivRoom})`,
    expectedDivRoom,
    roomsS1.join(', '),
    hasExpectedDiv && !hasAdminRoom && !hasTeacherRoom
  );

  // 5. Student cannot subscribe to unauthorized division or teacher rooms
  const studentCannotSpoof = !hasAdminRoom && !hasTeacherRoom;
  recordTest(
    5,
    'Student cannot join admin or teacher rooms',
    'Restricted',
    studentCannotSpoof ? 'Restricted' : 'Spoofed',
    studentCannotSpoof
  );

  // 6. Teacher joins authorized teacher room (teacher:T001)
  const serverSocketTeacher = ioServer.sockets.sockets.get(socketTeacher.id);
  const roomsTeacher = serverSocketTeacher ? Array.from(serverSocketTeacher.rooms) : [];
  const hasTeacherT001 = roomsTeacher.includes('teacher:T001');
  recordTest(6, 'Teacher joins authorized room teacher:T001', 'teacher:T001', roomsTeacher.join(', '), hasTeacherT001);

  // 7. Admin joins authorized admin room
  const serverSocketAdmin = ioServer.sockets.sockets.get(socketAdmin.id);
  const roomsAdmin = serverSocketAdmin ? Array.from(serverSocketAdmin.rooms) : [];
  const hasAdmin = roomsAdmin.includes('admin');
  recordTest(7, 'Admin joins authorized admin room', 'admin', roomsAdmin.join(', '), hasAdmin);

  // Wire up event listeners on all client sockets
  const eventsS1: any[] = [];
  const eventsS2: any[] = [];
  const eventsTeacher: any[] = [];
  const eventsAdmin: any[] = [];

  const ALL_EVENTS = [
    'timetable:lecture_cancelled',
    'timetable:lecture_rescheduled',
    'timetable:lecture_room_changed',
    'timetable:lecture_teacher_changed',
    'timetable:lecture_created',
    'timetable:lecture_deleted',
  ];

  ALL_EVENTS.forEach(ev => {
    socketStudent1.on(ev, (data) => eventsS1.push({ event: ev, data }));
    socketStudent2.on(ev, (data) => eventsS2.push({ event: ev, data }));
    socketTeacher.on(ev, (data) => eventsTeacher.push({ event: ev, data }));
    socketAdmin.on(ev, (data) => eventsAdmin.push({ event: ev, data }));
  });

  // Find a lecture belonging to Student 1's division (BSc IT_FY_A) and taught by T001
  // Find a lecture belonging to Student 1's division (BSc IT_FY_A)
  const lec1Res = await restRequest(port, {
    method: 'GET',
    path: '/api/v1/timetable/lectures/lec-1',
    token: adminToken,
  });

  const testLec = lec1Res.body.lecture;
  console.log(`Using Test Lecture: ${testLec.id} (${testLec.divisionId} • ${testLec.subject?.name || testLec.subjectId} • Teacher: ${testLec.teacherId})\n`);

  // Token of the teacher for testLec (lec-1 is taught by T005)
  const testLecTeacherToken = generateAccessToken({
    sub: `teach-${testLec.teacherId}`,
    identifier: testLec.teacherId,
    email: `${testLec.teacherId.toLowerCase()}@syncampus.ac.in`,
    role: UserRole.TEACHER,
  });

  // Connect socket for testLec's teacher so we can verify teacher-targeted events
  const socketLecTeacher = await connectClientSocket(port, testLecTeacherToken);
  socketLecTeacher.on('timetable:lecture_cancelled', (data) => eventsTeacher.push({ event: 'timetable:lecture_cancelled', data }));
  socketLecTeacher.on('timetable:lecture_rescheduled', (data) => eventsTeacher.push({ event: 'timetable:lecture_rescheduled', data }));
  socketLecTeacher.on('timetable:lecture_room_changed', (data) => eventsTeacher.push({ event: 'timetable:lecture_room_changed', data }));
  socketLecTeacher.on('timetable:lecture_teacher_changed', (data) => eventsTeacher.push({ event: 'timetable:lecture_teacher_changed', data }));

  // 8. Successful cancellation via REST emits targeted real-time event
  eventsS1.length = 0;
  eventsS2.length = 0;
  eventsTeacher.length = 0;
  eventsAdmin.length = 0;

  const cancelRes = await restRequest(port, {
    method: 'POST',
    path: `/api/v1/timetable/lectures/${testLec.id}/cancel`,
    token: testLecTeacherToken,
    body: { reason: 'Faculty attending syllabus conference' },
  });

  // Give event loop 60ms to dispatch socket messages
  await new Promise(r => setTimeout(r, 80));

  const s1GotCancelled = eventsS1.some(e => e.event === 'timetable:lecture_cancelled' && e.data.lectureId === testLec.id);
  const s2GotCancelled = eventsS2.some(e => e.event === 'timetable:lecture_cancelled' && e.data.lectureId === testLec.id);
  const teacherGotCancelled = eventsTeacher.some(e => e.event === 'timetable:lecture_cancelled' && e.data.lectureId === testLec.id);
  const adminGotCancelled = eventsAdmin.some(e => e.event === 'timetable:lecture_cancelled' && e.data.lectureId === testLec.id);

  recordTest(
    8,
    'Successful cancellation emits timetable:lecture_cancelled to affected division, teacher, and admin',
    'Emitted & Received',
    s1GotCancelled ? 'Emitted & Received' : 'Not received',
    cancelRes.status === 200 && s1GotCancelled && teacherGotCancelled && adminGotCancelled
  );

  // 9. Student targeting: unrelated student in different division does NOT receive event
  recordTest(
    9,
    'Unrelated student in different division does NOT receive targeted cancellation event',
    'No event',
    s2GotCancelled ? 'Received event (LEAK)' : 'No event',
    !s2GotCancelled
  );

  // 10. Successful reschedule via REST emits timetable:lecture_rescheduled
  eventsS1.length = 0;
  eventsS2.length = 0;
  eventsAdmin.length = 0;

  // Fetch Student 1's actual lectures from their division
  const s1TimetableRes = await restRequest(port, {
    method: 'GET',
    path: '/api/v1/students/me/timetable',
    token: student1Token,
  });
  const s1Lectures = s1TimetableRes.body.timetable || s1TimetableRes.body.lectures || s1TimetableRes.body;

  // 10. Extra lecture creation via REST emits timetable:lecture_created
  // Monday Period 1 was freed up by cancelling lec-1 in test 8
  eventsS1.length = 0;
  eventsAdmin.length = 0;

  const extraLecRes = await restRequest(port, {
    method: 'POST',
    path: '/api/v1/timetable/lectures/extra',
    token: adminToken,
    body: {
      divisionId: student1.division,
      subjectId: 'sub-it-01',
      teacherId: 'T005',
      roomId: 'Room 152',
      dayOfWeek: 1,
      periodNumber: 1,
      reason: 'Remedial revision session',
    },
  });

  await new Promise(r => setTimeout(r, 80));

  const s1GotCreated = eventsS1.some(e => e.event === 'timetable:lecture_created');
  const adminGotCreated = eventsAdmin.some(e => e.event === 'timetable:lecture_created');
  const createdLecId = extraLecRes.body?.lecture?.id;

  recordTest(
    10,
    'Extra lecture creation emits timetable:lecture_created',
    'Emitted',
    s1GotCreated ? 'Emitted' : 'Not received',
    extraLecRes.status === 201 && s1GotCreated && adminGotCreated
  );

  // 11. Successful room change via REST emits timetable:lecture_room_changed
  eventsS1.length = 0;
  eventsAdmin.length = 0;
  const targetLecForRoomChange = Array.isArray(s1Lectures) && s1Lectures[2] ? s1Lectures[2] : { id: 'lec-3' };
  const roomChangeRes = await restRequest(port, {
    method: 'POST',
    path: `/api/v1/timetable/lectures/${targetLecForRoomChange.id}/change-room`,
    token: adminToken,
    body: {
      roomId: 'Room 152',
      reason: 'Projector upgrade maintenance in Room 101',
    },
  });

  await new Promise(r => setTimeout(r, 80));

  const s1GotRoomChange = eventsS1.some(e => e.event === 'timetable:lecture_room_changed');
  const adminGotRoomChange = eventsAdmin.some(e => e.event === 'timetable:lecture_room_changed');
  recordTest(
    11,
    'Successful room change emits timetable:lecture_room_changed',
    'Emitted',
    s1GotRoomChange ? 'Emitted' : 'Not received',
    roomChangeRes.status === 200 && s1GotRoomChange && adminGotRoomChange
  );

  // 12. Successful teacher change via REST emits timetable:lecture_teacher_changed
  eventsS1.length = 0;
  eventsAdmin.length = 0;
  const targetLecForTeacher = Array.isArray(s1Lectures) && s1Lectures[3] ? s1Lectures[3] : { id: 'lec-4' };
  const teacherChangeRes = await restRequest(port, {
    method: 'POST',
    path: `/api/v1/timetable/lectures/${targetLecForTeacher.id}/change-teacher`,
    token: adminToken,
    body: {
      teacherId: 'T072',
      reason: 'Medical leave coverage',
    },
  });

  await new Promise(r => setTimeout(r, 80));

  const s1GotTeacherChange = eventsS1.some(e => e.event === 'timetable:lecture_teacher_changed');
  const adminGotTeacherChange = eventsAdmin.some(e => e.event === 'timetable:lecture_teacher_changed');
  recordTest(
    12,
    'Successful teacher change emits timetable:lecture_teacher_changed',
    'Emitted',
    s1GotTeacherChange ? 'Emitted' : 'Not received',
    teacherChangeRes.status === 200 && s1GotTeacherChange && adminGotTeacherChange
  );

  // 13. Successful reschedule via REST emits timetable:lecture_rescheduled
  // Free up Friday Period 5 by cancelling a lecture, then reschedule the extra lecture into it
  const FridayP5Lec = Array.isArray(s1Lectures) ? s1Lectures.find((l: any) => l.dayOfWeek === 5 && l.periodNumber === 5) : null;
  if (FridayP5Lec) {
    await restRequest(port, {
      method: 'POST',
      path: `/api/v1/timetable/lectures/${FridayP5Lec.id}/cancel`,
      token: adminToken,
      body: { reason: 'Cancelling to allow reschedule test' },
    });
  }

  eventsS1.length = 0;
  eventsAdmin.length = 0;

  const rescheduleRes = await restRequest(port, {
    method: 'POST',
    path: `/api/v1/timetable/lectures/${createdLecId || 'lec-2'}/reschedule`,
    token: adminToken,
    body: {
      dayOfWeek: 5,
      periodNumber: 5,
      reason: 'Administrative slot optimization',
    },
  });

  await new Promise(r => setTimeout(r, 80));

  const s1GotRescheduled = eventsS1.some(e => e.event === 'timetable:lecture_rescheduled');
  const adminGotRescheduled = eventsAdmin.some(e => e.event === 'timetable:lecture_rescheduled');

  recordTest(
    13,
    'Successful reschedule emits timetable:lecture_rescheduled',
    'Emitted',
    s1GotRescheduled ? 'Emitted' : 'Not received',
    rescheduleRes.status === 200 && s1GotRescheduled && adminGotRescheduled
  );

  // 14. Delete lecture via REST emits timetable:lecture_deleted
  eventsS1.length = 0;
  eventsAdmin.length = 0;

  const deleteRes = await restRequest(port, {
    method: 'DELETE',
    path: `/api/v1/timetable/lectures/${createdLecId || 'lec-5'}`,
    token: adminToken,
  });

  await new Promise(r => setTimeout(r, 80));

  const s1GotDeleted = eventsS1.some(e => e.event === 'timetable:lecture_deleted');
  const adminGotDeleted = eventsAdmin.some(e => e.event === 'timetable:lecture_deleted');
  recordTest(
    14,
    'Delete lecture emits timetable:lecture_deleted',
    'Emitted',
    s1GotDeleted ? 'Emitted' : 'Not received',
    deleteRes.status === 200 && s1GotDeleted && adminGotDeleted
  );

  // 15. Conflict scenario: 409 Conflict must NOT emit any real-time event
  eventsS1.length = 0;
  eventsAdmin.length = 0;

  // Intentionally trigger a conflict: Room 102 is occupied during Monday Period 1 by lec-2
  const conflictRes = await restRequest(port, {
    method: 'POST',
    path: '/api/v1/timetable/lectures/lec-1/change-room',
    token: adminToken,
    body: {
      roomId: 'Room 102',
      reason: 'Conflict test moving to occupied room',
    },
  });

  await new Promise(r => setTimeout(r, 80));

  const conflictEmittedS1 = eventsS1.length > 0;
  const conflictEmittedAdmin = eventsAdmin.length > 0;

  recordTest(
    15,
    '409 Conflict does NOT emit any real-time event to clients',
    'Status 409 & 0 events',
    `Status ${conflictRes.status} & ${eventsS1.length} events`,
    conflictRes.status === 409 && !conflictEmittedS1 && !conflictEmittedAdmin
  );

  // 16. Validation failure (400 Bad Request) does NOT emit any real-time event
  eventsS1.length = 0;
  const badReqRes = await restRequest(port, {
    method: 'POST',
    path: '/api/v1/timetable/lectures/lec-6/cancel',
    token: adminToken,
    body: { reason: '' }, // empty reason -> 400
  });

  await new Promise(r => setTimeout(r, 60));

  recordTest(
    16,
    'Validation failure (400) does NOT emit any real-time event',
    'Status 400 & 0 events',
    `Status ${badReqRes.status} & ${eventsS1.length} events`,
    badReqRes.status === 400 && eventsS1.length === 0
  );

  // 17. Reconnection scenario: socket disconnects and reconnects, preserving rooms and syncing
  let reconnectSuccess = false;
  try {
    socketStudent1.disconnect();
    const reconnectedSocket = await connectClientSocket(port, student1Token);
    const serverReconnected = ioServer.sockets.sockets.get(reconnectedSocket.id);
    const reconnectedRooms = serverReconnected ? Array.from(serverReconnected.rooms) : [];
    reconnectSuccess = reconnectedRooms.includes(expectedDivRoom);
    reconnectedSocket.disconnect();
  } catch (err: any) {
    reconnectSuccess = false;
  }

  recordTest(
    17,
    'Reconnection automatically restores authorized room subscriptions',
    expectedDivRoom,
    reconnectSuccess ? expectedDivRoom : 'Failed',
    reconnectSuccess
  );

  // Clean up sockets and server
  socketStudent1.disconnect();
  socketStudent2.disconnect();
  socketTeacher.disconnect();
  socketAdmin.disconnect();
  closeSocketServer();
  await new Promise<void>(resolve => server.close(() => resolve()));

  // Display summary table
  console.log('\n===========================================================');
  console.log('                 PART 5 TEST RESULTS SUMMARY               ');
  console.log('===========================================================');
  console.table(
    testResults.map(r => ({
      '#': r.num,
      Test: r.name,
      Expected: r.expected,
      Actual: r.actual,
      Status: r.status,
    }))
  );

  const passedCount = testResults.filter(r => r.status === 'PASS').length;
  const totalCount = testResults.length;

  console.log(`\nTOTAL: ${totalCount} | PASSED: ${passedCount} | FAILED: ${totalCount - passedCount}`);

  if (passedCount === totalCount) {
    console.log('\n✅ ALL PART 5 REAL-TIME EVENT SYNCHRONIZATION TESTS PASSED WITH 100% SUCCESS.\n');
    process.exit(0);
  } else {
    console.error('\n❌ SOME REAL-TIME TESTS FAILED.\n');
    process.exit(1);
  }
}

runPart5RealtimeTests().catch(err => {
  console.error('Fatal error running Part 5 realtime tests:', err);
  process.exit(1);
});
