import { prisma } from '../src/config/database.js';

const BASE_URL = 'http://localhost:5000/api/v1';

async function runTests() {
  console.log('\n======================================================');
  console.log('🧪 TESTING ADMIN CRUD REST API & POSTGRESQL PERSISTENCE');
  console.log('======================================================\n');

  let passed = 0;
  let total = 0;

  async function test(name: string, fn: () => Promise<void>) {
    total++;
    try {
      await fn();
      console.log(`  ✅ [PASS] ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`  ❌ [FAIL] ${name}: ${err.message}`);
    }
  }

  const adminHeaders = {
    'Content-Type': 'application/json',
    'x-test-role': 'ADMIN',
    'x-test-identifier': 'ADMIN01',
  };

  // 1. GET Teachers
  await test('GET /api/v1/admin/teachers returns populated faculty list from PostgreSQL', async () => {
    const res = await fetch(`${BASE_URL}/admin/teachers`, { headers: adminHeaders });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data.teachers) || data.teachers.length !== 72) {
      throw new Error(`Expected 72 teachers, got ${data.teachers?.length}`);
    }
  });

  // 2. CREATE Teacher
  const testTeacherId = `T_TEST_${Date.now().toString().slice(-4)}`;
  await test('POST /api/v1/admin/teachers creates a teacher and persists to PostgreSQL', async () => {
    const payload = {
      id: testTeacherId,
      name: 'Dr. Test Faculty',
      department: 'Science & Technology',
      subjects: ['Programming with C'],
      email: `${testTeacherId.toLowerCase()}@campus.edu`,
      room: 'Room 101',
      status: 'Active',
    };
    const res = await fetch(`${BASE_URL}/admin/teachers`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || `HTTP ${res.status}`);
    }
    const data = await res.json();
    if (data.teacher?.id !== testTeacherId) throw new Error('Returned teacher id does not match');

    // Verify directly in PostgreSQL
    const dbTeacher = await prisma.teacher.findFirst({
      where: { teacherId: testTeacherId },
      include: { subjects: true },
    });
    if (!dbTeacher) throw new Error('Teacher record not found in PostgreSQL');
    if (dbTeacher.fullName !== 'Dr. Test Faculty') throw new Error('Teacher name mismatch in DB');
    if (dbTeacher.subjects.length !== 1) throw new Error('Teacher subjects not linked in DB');
  });

  // 3. DELETE Teacher
  await test('DELETE /api/v1/admin/teachers/:id removes teacher from PostgreSQL', async () => {
    const res = await fetch(`${BASE_URL}/admin/teachers/${testTeacherId}`, {
      method: 'DELETE',
      headers: adminHeaders,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.success) throw new Error('Delete returned false');

    // Verify deleted in DB
    const dbTeacher = await prisma.teacher.findFirst({ where: { teacherId: testTeacherId } });
    if (dbTeacher) throw new Error('Teacher still exists in PostgreSQL after deletion');
  });

  // 4. GET Classrooms / Rooms
  await test('GET /api/v1/admin/rooms returns rooms from PostgreSQL', async () => {
    const res = await fetch(`${BASE_URL}/admin/rooms`, { headers: adminHeaders });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data.rooms) || data.rooms.length !== 62) {
      throw new Error(`Expected 62 rooms, got ${data.rooms?.length}`);
    }
  });

  // 5. CREATE Classroom / Room
  const testRoomName = `Lab_Test_${Date.now().toString().slice(-4)}`;
  await test('POST /api/v1/admin/rooms creates room and persists to PostgreSQL', async () => {
    const payload = {
      name: testRoomName,
      code: testRoomName,
      capacity: 45,
      floor: 'Floor 3',
      type: 'Computer Lab',
      status: 'Available',
    };
    const res = await fetch(`${BASE_URL}/admin/rooms`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || `HTTP ${res.status}`);
    }
    const data = await res.json();
    if (data.room?.name !== testRoomName) throw new Error('Room name mismatch');

    // Verify in PostgreSQL
    const dbRoom = await prisma.room.findFirst({ where: { roomName: testRoomName } });
    if (!dbRoom) throw new Error('Room not found in PostgreSQL');
    if (dbRoom.capacity !== 45) throw new Error('Capacity mismatch in DB');
  });

  // 6. DELETE Classroom / Room
  await test('DELETE /api/v1/admin/rooms/:id removes room from PostgreSQL', async () => {
    const res = await fetch(`${BASE_URL}/admin/rooms/${testRoomName}`, {
      method: 'DELETE',
      headers: adminHeaders,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const dbRoom = await prisma.room.findFirst({ where: { roomName: testRoomName } });
    if (dbRoom) throw new Error('Room still exists in DB after deletion');
  });

  // 7. GET Departments
  await test('GET /api/v1/admin/departments returns 4 academic departments', async () => {
    const res = await fetch(`${BASE_URL}/admin/departments`, { headers: adminHeaders });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data.departments) || data.departments.length !== 4) {
      throw new Error(`Expected 4 departments, got ${data.departments?.length}`);
    }
  });

  // 8. GET Divisions
  await test('GET /api/v1/admin/divisions returns academic division cohorts', async () => {
    const res = await fetch(`${BASE_URL}/admin/divisions`, { headers: adminHeaders });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data.divisions) || data.divisions.length === 0) {
      throw new Error('Divisions array is empty');
    }
  });

  // 9. CREATE Student
  const testStudentId = `STU_TEST_${Date.now().toString().slice(-4)}`;
  await test('POST /api/v1/admin/students enrolls student and persists to PostgreSQL', async () => {
    const payload = {
      id: testStudentId,
      name: 'Aditya Test Student',
      department: 'Science & Technology',
      course: 'BSc IT',
      year: 'FY',
      division: 'A',
      classroom: 'Room 101',
      batch: 'A',
      email: `${testStudentId.toLowerCase()}@sonopantcollege.edu.in`,
      status: 'Active',
    };
    const res = await fetch(`${BASE_URL}/admin/students`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || `HTTP ${res.status}`);
    }
    const data = await res.json();
    if (data.student?.id !== testStudentId) throw new Error('Student ID mismatch');

    // Verify in PostgreSQL
    const dbStudent = await prisma.student.findFirst({ where: { studentId: testStudentId } });
    if (!dbStudent) throw new Error('Student record not found in PostgreSQL');
    if (dbStudent.fullName !== 'Aditya Test Student') throw new Error('Name mismatch in DB');
  });

  // 10. DELETE Student
  await test('DELETE /api/v1/admin/students/:id withdraws student from PostgreSQL', async () => {
    const res = await fetch(`${BASE_URL}/admin/students/${testStudentId}`, {
      method: 'DELETE',
      headers: adminHeaders,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const dbStudent = await prisma.student.findFirst({ where: { studentId: testStudentId } });
    if (dbStudent) throw new Error('Student still exists in DB after deletion');
  });

  // 11. Relational Safety Check
  await test('Safety check: Deleting a teacher with active scheduled lectures is rejected', async () => {
    // T001 is Rahul Patil who has multiple scheduled lectures
    const res = await fetch(`${BASE_URL}/admin/teachers/T001`, {
      method: 'DELETE',
      headers: adminHeaders,
    });
    if (res.ok) {
      throw new Error('Teacher with scheduled lectures was deleted, should have been rejected!');
    }
    const data = await res.json();
    if (!data.message?.includes('active lecture(s)')) {
      throw new Error(`Unexpected error message: ${data.message}`);
    }
  });

  console.log(`\n======================================================`);
  console.log(`🏁 TEST RESULTS: ${passed} / ${total} passed (${Math.round((passed / total) * 100)}%)`);
  console.log(`======================================================\n`);

  await prisma.$disconnect();
  process.exit(passed === total ? 0 : 1);
}

runTests().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
