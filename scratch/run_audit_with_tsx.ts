import { STUDENTS_DATA } from '../client/src/data/studentsData';
import { TEACHERS_DATA } from '../client/src/data/teachersData';
import { INITIAL_CLASSROOMS } from '../client/src/data/mockData';
import { MASTER_TIMETABLE, INITIAL_ALL_LECTURES } from '../client/src/data/timetableData';

console.log('=== EXACT REPOSITORY AUDIT VIA TYPESCRIPT RUNTIME ===\n');

// 1. DATASET COUNTS
console.log('--- 1. MASTER COUNTS ---');
console.log('Students count:', STUDENTS_DATA.length);
console.log('Teachers count:', TEACHERS_DATA.length);
console.log('Rooms count:', INITIAL_CLASSROOMS.length);
console.log('MASTER_TIMETABLE count:', MASTER_TIMETABLE.length);
console.log('INITIAL_ALL_LECTURES count:', INITIAL_ALL_LECTURES.length);

// 2. STUDENT BREAKDOWN
const studentDepts: Record<string, number> = {};
const studentCourses: Record<string, number> = {};
const studentYears: Record<string, number> = {};
const studentDivs: Record<string, number> = {};

STUDENTS_DATA.forEach(s => {
  studentDepts[s.department] = (studentDepts[s.department] || 0) + 1;
  studentCourses[s.course] = (studentCourses[s.course] || 0) + 1;
  studentYears[s.year] = (studentYears[s.year] || 0) + 1;
  const divKey = `${s.course}_${s.year}_${s.division}`;
  studentDivs[divKey] = (studentDivs[divKey] || 0) + 1;
});

console.log('\n--- 2. STUDENT BREAKDOWN ---');
console.log('Departments:', studentDepts);
console.log('Courses:', studentCourses);
console.log('Years:', studentYears);
console.log('Unique Divisions Count:', Object.keys(studentDivs).length);
console.log('Unique Divisions List:', Object.keys(studentDivs).sort());

// 3. TEACHER BREAKDOWN
const teacherDepts: Record<string, number> = {};
TEACHERS_DATA.forEach(t => {
  teacherDepts[t.department] = (teacherDepts[t.department] || 0) + 1;
});
console.log('\n--- 3. TEACHER BREAKDOWN ---');
console.log('Teachers by department:', teacherDepts);

// 4. ROOMS BREAKDOWN
const roomTypes: Record<string, number> = {};
INITIAL_CLASSROOMS.forEach(r => {
  roomTypes[r.type] = (roomTypes[r.type] || 0) + 1;
});
console.log('\n--- 4. ROOMS BREAKDOWN ---');
console.log('Rooms by type:', roomTypes);

// 5. TIMETABLE INTEGRITY & CONFLICT AUDIT
console.log('\n--- 5. TIMETABLE CONFLICT CHECK ---');
let teacherConflicts = 0;
let roomConflicts = 0;
let divisionConflicts = 0;
const teacherMap = new Map();
const roomMap = new Map();
const divMap = new Map();

MASTER_TIMETABLE.forEach(l => {
  const slotKey = `${l.day}_${l.time}`;
  
  // Teacher check
  const tKey = `${slotKey}_${l.teacherName.toLowerCase().trim()}`;
  if (teacherMap.has(tKey)) {
    teacherConflicts++;
    console.log(`[TEACHER CLASH] Slot ${slotKey}: Teacher "${l.teacherName}" booked for "${teacherMap.get(tKey).subject}" AND "${l.subject}"`);
  } else {
    teacherMap.set(tKey, l);
  }

  // Room check
  const rKey = `${slotKey}_${l.classroom.toLowerCase().trim()}`;
  if (roomMap.has(rKey)) {
    roomConflicts++;
    console.log(`[ROOM CLASH] Slot ${slotKey}: Room "${l.classroom}" booked for "${roomMap.get(rKey).subject}" (${roomMap.get(rKey).divisionKey}) AND "${l.subject}" (${l.divisionKey})`);
  } else {
    roomMap.set(rKey, l);
  }

  // Division check
  const dKey = `${slotKey}_${l.divisionKey}`;
  if (divMap.has(dKey)) {
    divisionConflicts++;
    console.log(`[DIVISION CLASH] Slot ${slotKey}: Division "${l.divisionKey}" booked for "${divMap.get(dKey).subject}" AND "${l.subject}"`);
  } else {
    divMap.set(dKey, l);
  }
});

console.log(`Teacher Conflicts: ${teacherConflicts}`);
console.log(`Room Conflicts: ${roomConflicts}`);
console.log(`Division Conflicts: ${divisionConflicts}`);

// 6. REFERENCE INTEGRITY
console.log('\n--- 6. REFERENCE INTEGRITY ---');
const validTeacherTitles = new Set(TEACHERS_DATA.map(t => t.title.toLowerCase().trim()));
const validTeacherNames = new Set(TEACHERS_DATA.map(t => t.name.toLowerCase().trim()));
const validTeacherIds = new Set(TEACHERS_DATA.map(t => t.id.toLowerCase().trim()));
const validRoomNames = new Set(INITIAL_CLASSROOMS.map(r => r.name.toLowerCase().trim()));

let unknownTeachers = 0;
let unknownRooms = 0;

MASTER_TIMETABLE.forEach(l => {
  const tName = l.teacherName.toLowerCase().trim();
  const tId = l.teacherId.toLowerCase().trim();
  if (!validTeacherTitles.has(tName) && !validTeacherNames.has(tName) && !validTeacherIds.has(tId)) {
    unknownTeachers++;
    console.log(`[UNKNOWN TEACHER] ${l.teacherName} (${l.teacherId}) in lecture ${l.id}`);
  }

  const rName = l.classroom.toLowerCase().trim();
  if (!validRoomNames.has(rName)) {
    unknownRooms++;
    console.log(`[UNKNOWN ROOM] "${l.classroom}" in lecture ${l.id}`);
  }
});

console.log(`Total Unknown Teacher References: ${unknownTeachers}`);
console.log(`Total Unknown Room References: ${unknownRooms}`);

// 7. TIME SLOTS & DAYS
const distinctDays = new Set(MASTER_TIMETABLE.map(l => l.day));
const distinctPeriods = new Set(MASTER_TIMETABLE.map(l => l.time));
const distinctSubjects = new Set(MASTER_TIMETABLE.map(l => l.subject));
console.log('\n--- 7. TIMETABLE METRICS ---');
console.log('Distinct Days:', Array.from(distinctDays));
console.log('Distinct Periods:', Array.from(distinctPeriods));
console.log('Distinct Subjects in Timetable:', distinctSubjects.size);

console.log('\n=== AUDIT COMPLETE ===');
