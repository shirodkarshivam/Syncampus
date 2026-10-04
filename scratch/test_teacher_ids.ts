import { MASTER_TIMETABLE } from '../client/src/data/timetableData';

console.log('=== CHECKING TEACHER CONFLICTS WITH TEACHER ID ===');
let teacherIdConflicts = 0;
const teacherIdMap = new Map();

MASTER_TIMETABLE.forEach(l => {
  const slotKey = `${l.day}_${l.time}`;
  const tKey = `${slotKey}_${l.teacherId}`;
  if (teacherIdMap.has(tKey)) {
    teacherIdConflicts++;
    console.log(`[REAL TEACHER ID CLASH] Slot ${slotKey}: ID ${l.teacherId} (${l.teacherName}) booked for "${teacherIdMap.get(tKey).subject}" AND "${l.subject}"`);
  } else {
    teacherIdMap.set(tKey, l);
  }
});

console.log('Total True Teacher ID Conflicts in MASTER_TIMETABLE:', teacherIdConflicts);
