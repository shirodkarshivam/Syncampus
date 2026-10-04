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

console.log('========================================================');
console.log('SYNCAMPUS FULL TIMETABLE SYNCHRONIZATION AUDIT SUITE');
console.log('========================================================');

// Test Student 1: Yash Pawar (BSc IT FY Div A)
const stuYash = STUDENTS_DATA.find(s => s.id === 'STU0001')!;
console.log(`Test Subject 1: ${stuYash.name} (${stuYash.id}) - ${stuYash.course} ${stuYash.year} Div ${stuYash.division}`);

// Initial state
const yashLecturesInitial = timetableStore.getLecturesForStudent(stuYash);
console.log(`1. Initial periods count for ${stuYash.name}: ${yashLecturesInitial.length}`);
if (yashLecturesInitial.length !== 25) throw new Error('Expected 25 periods per week');

const targetLecture = yashLecturesInitial[0]; // Monday 09:00 - 10:00
console.log(`Target Lecture to test: "${targetLecture.subject}" by ${targetLecture.teacher} on ${targetLecture.day} at ${targetLecture.time}`);

// ---------------------------------------------------------------------
// TEST 1: CANCELLATION REFLECTION ON STUDENT
// ---------------------------------------------------------------------
console.log('\n--- TEST 1: CANCELLATION ---');
const cancelResult = timetableStore.cancelLecture(targetLecture.id, 'Prof. Sharma attending University Symposium', 'Prof. Rajesh Sharma');
if (!cancelResult) throw new Error('Cancel failed');

// Check student's view
const yashLecturesAfterCancel = timetableStore.getLecturesForStudent(stuYash);
const yashTargetAfterCancel = yashLecturesAfterCancel.find(l => l.id === targetLecture.id)!;

console.log(`Student lecture status after cancel: ${yashTargetAfterCancel.status}`);
console.log(`Student cancellation reason: ${yashTargetAfterCancel.cancelReason}`);

if (yashTargetAfterCancel.status !== 'Cancelled') {
  throw new Error(`TEST 1 FAILED: Expected status Cancelled, got ${yashTargetAfterCancel.status}`);
}

const studentAlerts = timetableStore.getAlertsForStudent(stuYash);
console.log(`Student active alerts count: ${studentAlerts.length}`);
console.log(`Alert details: Type=${studentAlerts[0].type}, Subject=${studentAlerts[0].subject}, Reason=${studentAlerts[0].reason}`);

if (studentAlerts.length === 0 || studentAlerts[0].type !== 'cancelled') {
  throw new Error('TEST 1 FAILED: Student did not receive cancellation alert');
}

// Check that an unrelated student in BSc IT FY Div B was NOT affected
const stuDivB = STUDENTS_DATA.find(s => s.course === 'BSc IT' && s.year === 'FY' && s.division === 'B')!;
const divBLectures = timetableStore.getLecturesForStudent(stuDivB);
const divBCancelled = divBLectures.filter(l => l.status === 'Cancelled');
console.log(`Unrelated student (${stuDivB.name} in Div B) cancelled lectures: ${divBCancelled.length}`);
if (divBCancelled.length !== 0) {
  throw new Error('TEST 1 FAILED: Cancellation leaked to another division!');
}
console.log('✓ TEST 1 PASSED: Cancellation accurately reflects on affected student ONLY');

// ---------------------------------------------------------------------
// TEST 2: SCHEDULE RESCHEDULING (TIME & ROOM)
// ---------------------------------------------------------------------
console.log('\n--- TEST 2: RESCHEDULING ---');
const secondLecture = yashLecturesInitial[1]; // Monday 10:00 - 11:00
console.log(`Rescheduling: "${secondLecture.subject}" from ${secondLecture.time} in ${secondLecture.room} -> to 02:00 - 03:00 in Computer Lab 1`);

const rescheduleResult = timetableStore.rescheduleLecture(
  secondLecture.id,
  '02:00 - 03:00',
  'Computer Lab 1',
  'Monday',
  undefined,
  'Academic Dean'
);

if (!rescheduleResult) throw new Error('Reschedule failed');

const yashLecturesAfterReschedule = timetableStore.getLecturesForStudent(stuYash);
const yashSecondAfterReschedule = yashLecturesAfterReschedule.find(l => l.id === secondLecture.id)!;

console.log(`Student lecture status after reschedule: ${yashSecondAfterReschedule.status}`);
console.log(`New time: ${yashSecondAfterReschedule.time} (Was: ${yashSecondAfterReschedule.originalTime})`);
console.log(`New room: ${yashSecondAfterReschedule.room} (Was: ${yashSecondAfterReschedule.originalRoom})`);

if (yashSecondAfterReschedule.status !== 'Rescheduled' || yashSecondAfterReschedule.time !== '02:00 - 03:00' || yashSecondAfterReschedule.room !== 'Computer Lab 1') {
  throw new Error('TEST 2 FAILED: Reschedule details not reflected on student');
}
console.log('✓ TEST 2 PASSED: Reschedule accurately reflects on affected student');

// ---------------------------------------------------------------------
// TEST 3: FACULTY / TEACHER REASSIGNMENT
// ---------------------------------------------------------------------
console.log('\n--- TEST 3: TEACHER REASSIGNMENT ---');
const thirdLecture = yashLecturesInitial[2];
console.log(`Reassigning teacher for: "${thirdLecture.subject}" (Original: ${thirdLecture.teacher}) -> to "Dr. Priya Patel"`);

const teacherResult = timetableStore.changeTeacher(thirdLecture.id, 'Dr. Priya Patel', 'T002', 'Admin');
if (!teacherResult) throw new Error('Change teacher failed');

const yashLecturesAfterTeacher = timetableStore.getLecturesForStudent(stuYash);
const yashThirdAfterTeacher = yashLecturesAfterTeacher.find(l => l.id === thirdLecture.id)!;

console.log(`Student lecture teacher after update: ${yashThirdAfterTeacher.teacher} (Was: ${yashThirdAfterTeacher.originalTeacher})`);
if (yashThirdAfterTeacher.teacher !== 'Dr. Priya Patel') {
  throw new Error('TEST 3 FAILED: Teacher change not reflected on student');
}
console.log('✓ TEST 3 PASSED: Teacher reassignment accurately reflects on affected student');

// ---------------------------------------------------------------------
// TEST 4: ROOM RELOCATION
// ---------------------------------------------------------------------
console.log('\n--- TEST 4: ROOM RELOCATION ---');
const fourthLecture = yashLecturesInitial[3];
console.log(`Changing room for: "${fourthLecture.subject}" from ${fourthLecture.room} -> to "Seminar Hall 1"`);

const roomResult = timetableStore.changeRoom(fourthLecture.id, 'Seminar Hall 1', 'Admin');
if (!roomResult) throw new Error('Change room failed');

const yashLecturesAfterRoom = timetableStore.getLecturesForStudent(stuYash);
const yashFourthAfterRoom = yashLecturesAfterRoom.find(l => l.id === fourthLecture.id)!;

console.log(`Student lecture room after update: ${yashFourthAfterRoom.room} (Was: ${yashFourthAfterRoom.originalRoom})`);
if (yashFourthAfterRoom.room !== 'Seminar Hall 1') {
  throw new Error('TEST 4 FAILED: Room relocation not reflected on student');
}
console.log('✓ TEST 4 PASSED: Room relocation accurately reflects on affected student');

// ---------------------------------------------------------------------
// TEST 5: RESTORE TO DEFAULT
// ---------------------------------------------------------------------
console.log('\n--- TEST 5: RESTORE TO DEFAULT ---');
timetableStore.resetToDefaults();
const yashLecturesAfterReset = timetableStore.getLecturesForStudent(stuYash);
const cancelledCountAfterReset = yashLecturesAfterReset.filter(l => l.status === 'Cancelled').length;
const rescheduledCountAfterReset = yashLecturesAfterReset.filter(l => l.status === 'Rescheduled').length;
console.log(`After Reset - Cancelled: ${cancelledCountAfterReset}, Rescheduled: ${rescheduledCountAfterReset}`);
if (cancelledCountAfterReset !== 0 || rescheduledCountAfterReset !== 0) {
  throw new Error('TEST 5 FAILED: Reset failed');
}
console.log('✓ TEST 5 PASSED: Reset restored clean default timetable');

console.log('\n========================================================');
console.log('ALL SYNCHRONIZATION TESTS PASSED WITH 100% SUCCESS!');
console.log('========================================================');
