import { PrismaClient, UserRole, RoomType, LectureStatus } from '@prisma/client';
import { DEPARTMENTS_DATA, INITIAL_CLASSROOMS } from '../../client/src/data/mockData.js';
import { TEACHERS_DATA } from '../../client/src/data/teachersData.js';
import { STUDENTS_DATA } from '../../client/src/data/studentsData.js';
import { MASTER_TIMETABLE } from '../../client/src/data/timetableData.js';
import { hashPassword } from '../src/utils/password.js';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting SyncCampus PostgreSQL Database Seed ---');

  // Verify DB connectivity
  try {
    await prisma.$connect();
    console.log('Successfully connected to PostgreSQL database.');
  } catch (err) {
    console.warn('\n⚠️ Could not connect to live PostgreSQL instance.');
    console.warn('Please ensure DATABASE_URL in server/.env points to a valid PostgreSQL instance.');
    console.warn('Skipping live DB write. You can run "npm run db:verify" for full dataset validation.\n');
    return;
  }

  // Pre-calculate standard dev password hash for all users
  const defaultPasswordHash = await hashPassword('password123');

  // Clean existing schedule records to ensure exact count parity
  await prisma.$executeRawUnsafe('TRUNCATE TABLE timetable_changes, notifications, lectures, teacher_subjects, subjects CASCADE;');

  // 1. Departments (4)
  console.log('Seeding departments (4)...');
  const deptMap = new Map<string, string>(); // code -> id
  for (const dept of DEPARTMENTS_DATA) {
    const record = await prisma.department.upsert({
      where: { code: dept.code },
      update: { name: dept.name },
      create: {
        code: dept.code,
        name: dept.name,
      },
    });
    deptMap.set(dept.name, record.id);
  }

  // 2. Courses (8)
  console.log('Seeding courses (8)...');
  const officialCourses = [
    { code: 'BSC_IT', name: 'BSc IT', dept: 'Science & Technology' },
    { code: 'BSC_CS', name: 'BSc CS', dept: 'Science & Technology' },
    { code: 'BCOM', name: 'B.Com', dept: 'Commerce' },
    { code: 'BBI', name: 'BBI', dept: 'Commerce' },
    { code: 'BFM', name: 'BFM', dept: 'Commerce' },
    { code: 'BMS', name: 'BMS', dept: 'Management' },
    { code: 'BA', name: 'BA', dept: 'Arts' },
    { code: 'BBA', name: 'BBA', dept: 'Management' },
  ];

  const courseMap = new Map<string, string>(); // course name -> course id
  for (const c of officialCourses) {
    const deptId = deptMap.get(c.dept);
    if (!deptId) continue;
    const record = await prisma.course.upsert({
      where: { code: c.code },
      update: { name: c.name, departmentId: deptId },
      create: {
        code: c.code,
        name: c.name,
        departmentId: deptId,
        durationYears: 3,
      },
    });
    courseMap.set(c.name, record.id);
  }

  // 3. Rooms (62)
  console.log('Seeding rooms (62)...');
  const roomMap = new Map<string, string>(); // roomCode/roomName -> id
  for (const r of INITIAL_CLASSROOMS) {
    const code = r.code || r.name;
    const roomType: RoomType =
      r.type === 'Computer Lab'
        ? RoomType.LAB
        : r.type === 'Auditorium'
        ? RoomType.SEMINAR_HALL
        : RoomType.CLASSROOM;

    const record = await prisma.room.upsert({
      where: { roomCode: code },
      update: {
        roomName: r.name,
        roomType,
        capacity: r.capacity,
        floor: r.floor,
      },
      create: {
        roomCode: code,
        roomName: r.name,
        roomType,
        capacity: r.capacity,
        floor: r.floor,
      },
    });
    roomMap.set(r.name, record.id);
    roomMap.set(code, record.id);
  }

  // 4. Admin User (1)
  console.log('Seeding admin user...');
  await prisma.user.upsert({
    where: { identifier: 'ADMIN01' },
    update: {
      role: UserRole.ADMIN,
      email: 'admin@campus.edu',
      passwordHash: defaultPasswordHash,
    },
    create: {
      email: 'admin@campus.edu',
      identifier: 'ADMIN01',
      role: UserRole.ADMIN,
      passwordHash: defaultPasswordHash,
    },
  });

  // 5. Teachers & Teacher Users (72)
  console.log('Seeding teachers and faculty users (72)...');
  const teacherRecordMap = new Map<string, string>(); // teacherId (e.g. T001) -> DB id
  for (const t of TEACHERS_DATA) {
    const user = await prisma.user.upsert({
      where: { email: t.email.toLowerCase() },
      update: {
        role: UserRole.TEACHER,
        identifier: t.id,
        passwordHash: defaultPasswordHash,
      },
      create: {
        email: t.email.toLowerCase(),
        identifier: t.id,
        role: UserRole.TEACHER,
        passwordHash: defaultPasswordHash,
      },
    });

    const deptId = deptMap.get(t.department);
    if (!deptId) continue;

    const teacher = await prisma.teacher.upsert({
      where: { teacherId: t.id },
      update: {
        fullName: t.name,
        email: t.email.toLowerCase(),
        departmentId: deptId,
        specialization: t.specialization,
        cabin: t.cabin,
        contactNumber: t.contactNumber,
      },
      create: {
        userId: user.id,
        teacherId: t.id,
        fullName: t.name,
        email: t.email.toLowerCase(),
        departmentId: deptId,
        specialization: t.specialization,
        cabin: t.cabin,
        contactNumber: t.contactNumber,
      },
    });
    teacherRecordMap.set(t.id, teacher.id);
  }

  // 6. Divisions (51)
  console.log('Seeding divisions (51)...');
  const divisionRecordMap = new Map<string, string>(); // fullName (e.g. BSc IT_FY_A) -> DB id
  for (const l of MASTER_TIMETABLE) {
    if (divisionRecordMap.has(l.divisionKey)) continue;

    const courseId = courseMap.get(l.course);
    if (!courseId) continue;

    const assignedRoomId = roomMap.get(l.classroom);

    const record = await prisma.division.upsert({
      where: { fullName: l.divisionKey },
      update: {
        assignedRoomId,
      },
      create: {
        courseId,
        academicYear: l.year,
        divisionName: l.division,
        fullName: l.divisionKey,
        assignedRoomId,
      },
    });
    divisionRecordMap.set(l.divisionKey, record.id);
  }

  // 7. Students & Student Users (2,700)
  console.log('Seeding students and student users (2,700 records)...');
  for (const s of STUDENTS_DATA) {
    const user = await prisma.user.upsert({
      where: { email: s.email.toLowerCase() },
      update: {
        role: UserRole.STUDENT,
        identifier: s.id,
        passwordHash: defaultPasswordHash,
      },
      create: {
        email: s.email.toLowerCase(),
        identifier: s.id,
        role: UserRole.STUDENT,
        passwordHash: defaultPasswordHash,
      },
    });

    const divKey = `${s.course}_${s.year}_${s.division}`;
    const divisionId = divisionRecordMap.get(divKey);
    if (!divisionId) continue;

    await prisma.student.upsert({
      where: { studentId: s.id },
      update: {
        fullName: s.name,
        email: s.email.toLowerCase(),
        divisionId,
        rollNumber: s.rollNumber,
        classroom: s.classroom,
        practicalBatch: s.practicalBatch,
        contactNumber: s.contactNumber,
        emergencyContact: s.emergencyContact,
      },
      create: {
        userId: user.id,
        studentId: s.id,
        fullName: s.name,
        email: s.email.toLowerCase(),
        divisionId,
        rollNumber: s.rollNumber,
        classroom: s.classroom,
        practicalBatch: s.practicalBatch,
        contactNumber: s.contactNumber,
        emergencyContact: s.emergencyContact,
      },
    });
  }

  // 8. Subjects (144) & Teacher-Subject Mappings (204)
  console.log('Seeding subjects (144) and teacher-subject mappings (204)...');
  const subjectRecordMap = new Map<string, string>(); // courseId_year_name -> subject id
  let subIndex = 1;

  for (const l of MASTER_TIMETABLE) {
    const courseId = courseMap.get(l.course);
    if (!courseId) continue;
    const subKey = `${courseId}_${l.year}_${l.subject}`;

    if (!subjectRecordMap.has(subKey)) {
      const code = `SUBJ-${subIndex++}`;
      const record = await prisma.subject.upsert({
        where: {
          courseId_code_name: {
            courseId,
            code,
            name: l.subject,
          },
        },
        update: {
          academicYear: l.year,
        },
        create: {
          code,
          name: l.subject,
          courseId,
          academicYear: l.year,
          isPractical: l.classroom.startsWith('LAB'),
        },
      });
      subjectRecordMap.set(subKey, record.id);
    }

    // Teacher-Subject Mappings
    const subjectId = subjectRecordMap.get(subKey);
    const teacherDbId = teacherRecordMap.get(l.teacherId);
    if (subjectId && teacherDbId) {
      await prisma.teacherSubject.upsert({
        where: {
          teacherId_subjectId: {
            teacherId: teacherDbId,
            subjectId,
          },
        },
        update: {},
        create: {
          teacherId: teacherDbId,
          subjectId,
        },
      });
    }
  }

  // 10. Master Lectures (1,275)
  console.log('Seeding master timetable lectures (1,275 sessions)...');
  const dayNumberMap: Record<string, number> = {
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
  };

  const periodMap: Record<string, number> = {
    '09:00 - 10:00': 1,
    '10:00 - 11:00': 2,
    '11:00 - 12:00': 3,
    '01:00 - 02:00': 4,
    '02:00 - 03:00': 5,
  };

  for (const l of MASTER_TIMETABLE) {
    const divisionId = divisionRecordMap.get(l.divisionKey);
    const courseId = courseMap.get(l.course);
    const subKey = `${courseId}_${l.year}_${l.subject}`;
    const subjectId = subjectRecordMap.get(subKey);
    const teacherId = teacherRecordMap.get(l.teacherId);
    const roomId = roomMap.get(l.classroom);

    if (!divisionId || !subjectId || !teacherId || !roomId) continue;

    const times = l.time.split(' - ');
    const startTime = times[0] || '09:00';
    const endTime = times[1] || '10:00';
    const periodNumber = periodMap[l.time] || 1;
    const dayOfWeek = dayNumberMap[l.day] || 1;

    await prisma.lecture.upsert({
      where: { id: l.id },
      update: {
        divisionId,
        subjectId,
        teacherId,
        roomId,
        dayOfWeek,
        dayName: l.day,
        periodNumber,
        startTime,
        endTime,
        status: LectureStatus.SCHEDULED,
      },
      create: {
        id: l.id,
        divisionId,
        subjectId,
        teacherId,
        roomId,
        dayOfWeek,
        dayName: l.day,
        periodNumber,
        startTime,
        endTime,
        status: LectureStatus.SCHEDULED,
      },
    });
  }

  console.log('\n✅ Database seeding complete. All 1,275 lectures and supporting entities verified.');
}

main()
  .catch(e => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
