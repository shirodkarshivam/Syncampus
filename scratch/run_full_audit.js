const fs = require('fs');
const path = require('path');

console.log('=== RUNNING FULL AUDIT ANALYSIS SCRIPT ===\n');

// 1. Load studentsData.ts
const studentsFile = fs.readFileSync(path.join(__dirname, '../client/src/data/studentsData.ts'), 'utf8');
const studentJsonMatch = studentsFile.match(/export const STUDENTS_DATA: Student\[\] = (\[[\s\S]*?\]);\n\nexport function/);
let students = [];
if (studentJsonMatch) {
  students = JSON.parse(studentJsonMatch[1]);
} else {
  // alternative parse
  const start = studentsFile.indexOf('export const STUDENTS_DATA: Student[] = [');
  const end = studentsFile.indexOf('export function findStudentByQuery');
  const jsonStr = studentsFile.slice(start + 'export const STUDENTS_DATA: Student[] = '.length, end).trim().replace(/;$/, '');
  students = JSON.parse(jsonStr);
}

// 2. Load teachersData.ts
const teachersFile = fs.readFileSync(path.join(__dirname, '../client/src/data/teachersData.ts'), 'utf8');
const tStart = teachersFile.indexOf('export const TEACHERS_DATA: TeacherProfile[] = [');
const tEnd = teachersFile.indexOf('export function findTeacherByQuery');
const tJson = teachersFile.slice(tStart + 'export const TEACHERS_DATA: TeacherProfile[] = '.length, tEnd).trim().replace(/;$/, '');
const teachers = JSON.parse(tJson);

// 3. Load mockData.ts rooms
const mockDataFile = fs.readFileSync(path.join(__dirname, '../client/src/data/mockData.ts'), 'utf8');
const rStart = mockDataFile.indexOf('export const INITIAL_CLASSROOMS: Classroom[] = [');
const rEnd = mockDataFile.indexOf('export const DEPARTMENTS_DATA');
const rJson = mockDataFile.slice(rStart + 'export const INITIAL_CLASSROOMS: Classroom[] = '.length, rEnd).trim().replace(/;$/, '');
const rooms = JSON.parse(rJson);

// 4. Load timetableData.ts lectures
const timetableFile = fs.readFileSync(path.join(__dirname, '../client/src/data/timetableData.ts'), 'utf8');
const lStart = timetableFile.indexOf('export const MASTER_TIMETABLE: ScheduledLecture[] = [');
const lEnd = timetableFile.indexOf('export const INITIAL_ALL_LECTURES: Lecture[] =');
const lJson = timetableFile.slice(lStart + 'export const MASTER_TIMETABLE: ScheduledLecture[] = '.length, lEnd).trim().replace(/;$/, '');
const masterTimetable = JSON.parse(lJson);

console.log('--- 1. MASTER DATASET COUNTS ---');
console.log('Students count:', students.length);
console.log('Teachers count:', teachers.length);
console.log('Rooms count:', rooms.length);
console.log('Master timetable lectures count:', masterTimetable.length);

// Student breakdown
const studentDepts = {};
const studentCourses = {};
const studentDivs = {};
const studentYears = {};
students.forEach(s => {
  studentDepts[s.department] = (studentDepts[s.department] || 0) + 1;
  studentCourses[s.course] = (studentCourses[s.course] || 0) + 1;
  studentYears[s.year] = (studentYears[s.year] || 0) + 1;
  const divKey = `${s.course}_${s.year}_${s.division}`;
  studentDivs[divKey] = (studentDivs[divKey] || 0) + 1;
});

console.log('\nStudent Departments:', studentDepts);
console.log('Student Courses:', studentCourses);
console.log('Student Years:', studentYears);
console.log('Student Unique Divisions Count:', Object.keys(studentDivs).length);

// Teacher breakdown
const teacherDepts = {};
teachers.forEach(t => {
  teacherDepts[t.department] = (teacherDepts[t.department] || 0) + 1;
});
console.log('\nTeacher Departments:', teacherDepts);

// Rooms breakdown
const roomTypes = {};
rooms.forEach(r => {
  roomTypes[r.type] = (roomTypes[r.type] || 0) + 1;
});
console.log('\nRoom Types in mockData:', roomTypes);

// Timetable breakdown & Conflict check
console.log('\n--- 2. MASTER TIMETABLE INTEGRITY & CONFLICT AUDIT ---');
let teacherConflicts = 0;
let roomConflicts = 0;
let divisionConflicts = 0;
const teacherMap = new Map();
const roomMap = new Map();
const divMap = new Map();

masterTimetable.forEach(l => {
  const slotKey = `${l.day}_${l.time}`;
  
  // Teacher check
  const tKey = `${slotKey}_${l.teacherName.toLowerCase().trim()}`;
  if (teacherMap.has(tKey)) {
    teacherConflicts++;
    console.log(`[TEACHER CLASH] ${tKey} already booked by ${teacherMap.get(tKey).subject}, clash with ${l.subject}`);
  } else {
    teacherMap.set(tKey, l);
  }

  // Room check
  const rKey = `${slotKey}_${l.classroom.toLowerCase().trim()}`;
  if (roomMap.has(rKey)) {
    roomConflicts++;
    console.log(`[ROOM CLASH] ${rKey} already booked by ${roomMap.get(rKey).subject}, clash with ${l.subject}`);
  } else {
    roomMap.set(rKey, l);
  }

  // Division check
  const dKey = `${slotKey}_${l.divisionKey}`;
  if (divMap.has(dKey)) {
    divisionConflicts++;
    console.log(`[DIVISION CLASH] ${dKey} already booked by ${divMap.get(dKey).subject}, clash with ${l.subject}`);
  } else {
    divMap.set(dKey, l);
  }
});

console.log(`\nConflict Summary in MASTER_TIMETABLE:`);
console.log(`  Teacher Conflicts: ${teacherConflicts}`);
console.log(`  Room Conflicts: ${roomConflicts}`);
console.log(`  Division Conflicts: ${divisionConflicts}`);

// Check references
const teacherNames = new Set(teachers.map(t => t.name.toLowerCase().trim()));
const teacherTitles = new Set(teachers.map(t => t.title.toLowerCase().trim()));
const teacherIds = new Set(teachers.map(t => t.id.toLowerCase().trim()));
const roomNames = new Set(rooms.map(r => r.name.toLowerCase().trim()));

let missingTeacherRefs = 0;
let missingRoomRefs = 0;

masterTimetable.forEach(l => {
  const tName = l.teacherName.toLowerCase().trim();
  const tId = l.teacherId.toLowerCase().trim();
  if (!teacherTitles.has(tName) && !teacherNames.has(tName) && !teacherIds.has(tId)) {
    missingTeacherRefs++;
    // console.log(`Unknown teacher: ${l.teacherName} (${l.teacherId})`);
  }

  const rName = l.classroom.toLowerCase().trim();
  if (!roomNames.has(rName)) {
    missingRoomRefs++;
    // console.log(`Unknown room: ${l.classroom}`);
  }
});

console.log(`\nReference Checks in MASTER_TIMETABLE:`);
console.log(`  Lectures with unknown teachers: ${missingTeacherRefs}`);
console.log(`  Lectures with unknown rooms: ${missingRoomRefs}`);

console.log('\n=== AUDIT SCRIPT COMPLETE ===');
