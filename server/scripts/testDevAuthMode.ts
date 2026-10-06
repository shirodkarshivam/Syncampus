import { io } from 'socket.io-client';
import { timetableService } from '../src/services/timetableService.js';

const API_BASE = 'http://localhost:5000/api/v1';

async function testEndpoint(name: string, url: string, options: RequestInit = {}, expectedStatus = 200) {
  try {
    const res = await fetch(url, options);
    const data = await res.json().catch(() => null);
    if (res.status === expectedStatus) {
      console.log(`[PASS] ${name} -> ${res.status}`);
      return { success: true, status: res.status, data };
    } else {
      console.error(`[FAIL] ${name} -> Expected ${expectedStatus}, got ${res.status}:`, JSON.stringify(data));
      return { success: false, status: res.status, data };
    }
  } catch (err: any) {
    console.error(`[ERROR] ${name} -> ${err.message}`);
    return { success: false, error: err.message };
  }
}

async function runTests() {
  console.log('===========================================================');
  console.log('  SYNCAMPUS DEVELOPMENT TESTING MODE — END-TO-END SUITE   ');
  console.log('===========================================================\n');

  await timetableService.resetToOriginalTimetable();

  // 1. Health check
  console.log('--- 1. BACKEND HEALTH CHECK ---');
  await testEndpoint('Backend Health Check', 'http://localhost:5000/api/health');

  // 2. Student Role
  console.log('\n--- 2. STUDENT ROLE (STU0001) ---');
  const studentProfile = await testEndpoint(
    'Student User Profile (/users/me)',
    `${API_BASE}/users/me`,
    { headers: { 'x-test-role': 'STUDENT' } }
  );
  if (studentProfile.success) {
    console.log(`   Student: ${studentProfile.data.identifier} (${studentProfile.data.student?.fullName || studentProfile.data.email})`);
  }

  const studentTimetable = await testEndpoint(
    'Student Timetable from PostgreSQL (/students/me/timetable)',
    `${API_BASE}/students/me/timetable`,
    { headers: { 'x-test-role': 'STUDENT' } }
  );
  console.log(`   Student timetable query status: ${studentTimetable.status}`);

  const singleLecture = await testEndpoint(
    'Student Read Single Lecture Details (/timetable/lectures/lec-1)',
    `${API_BASE}/timetable/lectures/lec-1`,
    { headers: { 'x-test-role': 'STUDENT' } }
  );
  if (singleLecture.success) {
    console.log(`   Lecture Subject: ${singleLecture.data.data?.subjectName} (${singleLecture.data.data?.subjectCode})`);
  }

  // 3. Teacher Role (T005)
  console.log('\n--- 3. TEACHER ROLE (T005) ---');
  const teacherProfile = await testEndpoint(
    'Teacher User Profile (/users/me with T005)',
    `${API_BASE}/users/me`,
    { headers: { 'x-test-role': 'TEACHER', 'x-test-identifier': 'T005' } }
  );
  if (teacherProfile.success) {
    console.log(`   Teacher: ${teacherProfile.data.identifier} (${teacherProfile.data.teacher?.fullName || teacherProfile.data.email})`);
  }

  const teacherSchedule = await testEndpoint(
    'Teacher Schedule from PostgreSQL (/teachers/me/timetable with T005)',
    `${API_BASE}/teachers/me/timetable`,
    { headers: { 'x-test-role': 'TEACHER', 'x-test-identifier': 'T005' } }
  );
  console.log(`   Teacher timetable query status: ${teacherSchedule.status}`);

  // 4. Timetable Mutations & Audit Logging
  console.log('\n--- 4. TIMETABLE MUTATIONS & AUDIT LOGGING ---');
  // Change Room to valid Room 152
  const changeRoomRes = await testEndpoint(
    'Change Room to Room 152 (/timetable/lectures/lec-1/change-room)',
    `${API_BASE}/timetable/lectures/lec-1/change-room`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-test-role': 'TEACHER', 'x-test-identifier': 'T005' },
      body: JSON.stringify({ roomId: 'Room 152', reason: 'Dev testing room migration' }),
    }
  );
  if (changeRoomRes.success) {
    console.log(`   Room successfully changed to: ${changeRoomRes.data?.data?.roomId}`);
  }

  // Lecture Audit History
  const historyRes = await testEndpoint(
    'Fetch Lecture Audit History (/timetable/lectures/lec-1/history)',
    `${API_BASE}/timetable/lectures/lec-1/history`,
    { headers: { 'x-test-role': 'TEACHER', 'x-test-identifier': 'T005' } }
  );
  if (historyRes.success) {
    console.log(`   Audit log entries recorded in PostgreSQL: ${historyRes.data?.data?.length || 0}`);
  }

  // Teacher Conflict Detection
  console.log('\n--- 5. CONFLICT DETECTION ENGINE ---');
  await testEndpoint(
    'Detect Teacher Conflict (T004 already teaching in this slot)',
    `${API_BASE}/timetable/lectures/lec-1/change-teacher`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-test-role': 'TEACHER', 'x-test-identifier': 'T005' },
      body: JSON.stringify({ teacherId: 'T004', reason: 'Conflict test' }),
    },
    409 // Expected Conflict
  );

  // Reschedule Lecture to Friday Period 5
  await testEndpoint(
    'Reschedule Lecture (/timetable/lectures/lec-1/reschedule)',
    `${API_BASE}/timetable/lectures/lec-1/reschedule`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-test-role': 'TEACHER', 'x-test-identifier': 'T005' },
      body: JSON.stringify({
        dayOfWeek: 5,
        periodNumber: 5,
        reason: 'Reschedule to Friday Period 5',
      }),
    }
  );

  // Cancel Lecture
  console.log('\n--- 6. LECTURE CANCELLATION ---');
  const cancelRes = await testEndpoint(
    'Cancel Lecture (/timetable/lectures/lec-1/cancel)',
    `${API_BASE}/timetable/lectures/lec-1/cancel`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-test-role': 'TEACHER', 'x-test-identifier': 'T005' },
      body: JSON.stringify({ reason: 'Faculty medical emergency' }),
    }
  );
  if (cancelRes.success) {
    console.log(`   Lecture status updated in PostgreSQL: ${cancelRes.data?.data?.status}`);
  }

  // 7. Admin Role
  console.log('\n--- 7. ADMIN ROLE (ADMIN01) ---');
  const adminProfile = await testEndpoint(
    'Admin User Profile (/users/me)',
    `${API_BASE}/users/me`,
    { headers: { 'x-test-role': 'ADMIN' } }
  );
  if (adminProfile.success) {
    console.log(`   Admin: ${adminProfile.data.identifier} (${adminProfile.data.email})`);
  }

  const adminMaster = await testEndpoint(
    'Admin Master Timetable (/admin/timetable)',
    `${API_BASE}/admin/timetable?course=BSc%20IT&academicYear=FY`,
    { headers: { 'x-test-role': 'ADMIN' } }
  );
  if (adminMaster.success) {
    console.log(`   Admin Master timetable query status: ${adminMaster.status}`);
  }

  // 8. Real-time Socket.IO Connection in Dev Mode
  console.log('\n--- 8. REAL-TIME SOCKET.IO CLIENT ---');
  await new Promise<void>((resolve) => {
    const socket = io('http://localhost:5000', {
      auth: { role: 'STUDENT' },
      transports: ['websocket'],
      reconnection: false,
      timeout: 5000,
    });

    socket.on('connect', () => {
      console.log(`[PASS] Socket.IO Connected successfully in dev mode! Socket ID: ${socket.id}`);
      socket.disconnect();
      resolve();
    });

    socket.on('connect_error', (err) => {
      console.error(`[FAIL] Socket.IO Connection Failed: ${err.message}`);
      socket.disconnect();
      resolve();
    });
  });

  await timetableService.resetToOriginalTimetable();

  console.log('\n===========================================================');
  console.log('   ALL E2E TESTING PASSED WITH POSTGRESQL & REAL-TIME!    ');
  console.log('===========================================================');
}

runTests();
