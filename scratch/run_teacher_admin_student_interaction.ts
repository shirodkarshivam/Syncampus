// Simulated LocalStorage
class LocalStorageMock {
  store: Record<string, string> = {};
  getItem(key: string) { return this.store[key] || null; }
  setItem(key: string, val: string) { this.store[key] = String(val); }
  removeItem(key: string) { delete this.store[key]; }
  clear() { this.store = {}; }
}

(global as any).localStorage = new LocalStorageMock();
(global as any).window = {
  dispatchEvent: () => {},
  addEventListener: () => {}
};
(global as any).CustomEvent = class CustomEvent {};

import { timetableStore } from '../client/src/data/timetableStore';
import { STUDENTS_DATA } from '../client/src/data/studentsData';
import { TEACHERS_DATA } from '../client/src/data/teachersData';

console.log('================================================================');
console.log('SECOND AUDIT: TRI-PORTAL (ADMIN <-> TEACHER <-> STUDENT) TESTING');
console.log('================================================================');

// Teacher T001
const t1 = TEACHERS_DATA[0]; // e.g. T001
const t2 = TEACHERS_DATA[1]; // e.g. T002
const t1Lectures = timetableStore.getLecturesForTeacherId(t1.id, t1.name);
console.log(`Teacher 1: ${t1.title} (${t1.id}) has ${t1Lectures.length} scheduled periods.`);

if (t1Lectures.length === 0) throw new Error('Teacher 1 has no lectures');

const targetLecture = t1Lectures[0];
console.log(`Action Target: "${targetLecture.subject}" for ${targetLecture.course} ${targetLecture.divisionKey || targetLecture.division}`);

// Find a student enrolled in that exact division
const affectedStudent = STUDENTS_DATA.find(s => 
  s.course === targetLecture.course && 
  (targetLecture.divisionKey ? targetLecture.divisionKey.includes(s.year) : true) &&
  s.division === targetLecture.division
)!;
console.log(`Affected Student found: ${affectedStudent.name} (${affectedStudent.id}) in ${affectedStudent.course} ${affectedStudent.year} Div ${affectedStudent.division}`);

// STEP 1: Teacher initiates cancellation
console.log('\nSTEP 1: Teacher initiates cancellation from Teacher Dashboard...');
timetableStore.cancelLecture(targetLecture.id, 'Faculty Medical Leave', t1.title);

// Verify Teacher's view
const t1LecturesAfter = timetableStore.getLecturesForTeacherId(t1.id, t1.name);
const t1Target = t1LecturesAfter.find(l => l.id === targetLecture.id)!;
console.log(`Teacher sees status: ${t1Target.status}`);
if (t1Target.status !== 'Cancelled') throw new Error('Teacher view did not reflect cancellation');

// Verify Student's view
const studentLecturesAfter = timetableStore.getLecturesForStudent(affectedStudent);
const studentTarget = studentLecturesAfter.find(l => l.id === targetLecture.id)!;
console.log(`Student sees status: ${studentTarget.status}`);
if (studentTarget.status !== 'Cancelled') throw new Error('Student view did not reflect teacher cancellation');

// Verify Admin's view
const adminLecturesAfter = timetableStore.getAllLectures();
const adminTarget = adminLecturesAfter.find(l => l.id === targetLecture.id)!;
console.log(`Admin sees status: ${adminTarget.status}`);
if (adminTarget.status !== 'Cancelled') throw new Error('Admin view did not reflect cancellation');

console.log('✓ STEP 1 VERIFIED: Teacher cancellation immediately reflected in Teacher, Student, and Admin views!');

// STEP 2: Admin reassigns a different lecture to Teacher 2
console.log('\nSTEP 2: Admin substitutes faculty on lecture 2...');
const targetLecture2 = t1Lectures[1];
timetableStore.changeTeacher(targetLecture2.id, t2.title, t2.id, 'Admin');

// Verify Teacher 1 no longer has it
const t1LecturesAfterReassign = timetableStore.getLecturesForTeacherId(t1.id, t1.name);
const t1HasLecture2 = t1LecturesAfterReassign.some(l => l.id === targetLecture2.id);
console.log(`Teacher 1 still assigned? ${t1HasLecture2}`);
if (t1HasLecture2) throw new Error('Teacher 1 still has reassigned lecture');

// Verify Teacher 2 now has it
const t2Lectures = timetableStore.getLecturesForTeacherId(t2.id, t2.name);
const t2HasLecture2 = t2Lectures.some(l => l.id === targetLecture2.id);
console.log(`Teacher 2 now assigned? ${t2HasLecture2}`);
if (!t2HasLecture2) throw new Error('Teacher 2 does not have reassigned lecture');

// Verify Student sees Teacher 2
const student2 = STUDENTS_DATA.find(s => 
  targetLecture2.divisionKey.includes(s.course) && 
  targetLecture2.divisionKey.includes(s.year) &&
  targetLecture2.divisionKey.endsWith(s.division)
)!;

const studentLecturesAfterReassign = timetableStore.getLecturesForStudent(student2);
const studentTarget2 = studentLecturesAfterReassign.find(l => l.id === targetLecture2.id)!;
console.log(`Student in ${targetLecture2.divisionKey} sees instructor: "${studentTarget2.teacher}"`);
if (studentTarget2.teacher !== t2.title) throw new Error('Student did not see new instructor');

console.log('✓ STEP 2 VERIFIED: Teacher reassignment immediately transferred across Teacher 1, Teacher 2, and Student views!');

// STEP 3: Teacher 2 changes classroom to Computer Lab 3
console.log('\nSTEP 3: Teacher changes room from Room 101 to Computer Lab 3...');
timetableStore.changeRoom(targetLecture2.id, 'Computer Lab 3', t2.title);

const studentLecturesAfterRoom = timetableStore.getLecturesForStudent(student2);
const studentTargetRoom = studentLecturesAfterRoom.find(l => l.id === targetLecture2.id)!;
console.log(`Student sees room: "${studentTargetRoom.room}" (Was: ${studentTargetRoom.originalRoom})`);
if (studentTargetRoom.room !== 'Computer Lab 3') throw new Error('Student did not see new room');

console.log('✓ STEP 3 VERIFIED: Room relocation immediately reflected on Student view!');

// Cleanup
timetableStore.resetToDefaults();
console.log('\n================================================================');
console.log('DOUBLE-CHECK AUDIT PASSED 100% CLEANLY!');
console.log('================================================================');
