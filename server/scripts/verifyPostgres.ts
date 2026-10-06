import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Verifying Real PostgreSQL Counts ---');
  await prisma.$connect();
  
  const [
    departments,
    courses,
    divisions,
    students,
    teachers,
    rooms,
    subjects,
    teacherSubjects,
    lectures,
    users
  ] = await Promise.all([
    prisma.department.count(),
    prisma.course.count(),
    prisma.division.count(),
    prisma.student.count(),
    prisma.teacher.count(),
    prisma.room.count(),
    prisma.subject.count(),
    prisma.teacherSubject.count(),
    prisma.lecture.count(),
    prisma.user.count(),
  ]);

  console.log('PostgreSQL Table Counts:');
  console.log('  Departments:            ', departments, '(Expected: 4)');
  console.log('  Courses:                ', courses, '(Expected: 8)');
  console.log('  Divisions:              ', divisions, '(Expected: 51)');
  console.log('  Students:               ', students, '(Expected: 2700)');
  console.log('  Teachers:               ', teachers, '(Expected: 72)');
  console.log('  Rooms:                  ', rooms, '(Expected: 62)');
  console.log('  Subjects:               ', subjects, '(Expected: 144)');
  console.log('  Teacher-Subject Links:  ', teacherSubjects, '(Expected: 204)');
  console.log('  Lectures:               ', lectures, '(Expected: 1275)');
  console.log('  Users:                  ', users, '(Expected: 2773)');

  const isPassing =
    departments === 4 &&
    courses === 8 &&
    divisions === 51 &&
    students === 2700 &&
    teachers === 72 &&
    rooms === 62 &&
    subjects === 144 &&
    teacherSubjects === 204 &&
    lectures === 1275 &&
    users === 2773;

  if (isPassing) {
    console.log('\n✅ ALL 10 POSTGRESQL TABLE COUNTS MATCH AUTHORITATIVE DATA EXACTLY!');
  } else {
    console.error('\n❌ POSTGRESQL TABLE COUNT MISMATCH');
    process.exit(1);
  }
}

main()
  .catch(err => {
    console.error('PostgreSQL verification failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
