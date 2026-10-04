const assert = require('assert');

// Simulate the timetableStore conflict detection logic
const mockLectures = [
  {
    id: 'lec-1',
    subject: 'Web Technologies',
    teacher: 'Prof. Rahul Patil',
    room: 'Room 101',
    day: 'Monday',
    time: '09:00 - 10:00',
    course: 'BSc IT',
    year: 'FY',
    division: 'A',
    divisionKey: 'BSc IT_FY_A',
    status: 'Scheduled'
  },
  {
    id: 'lec-2',
    subject: 'Operating Systems',
    teacher: 'Prof. Neha Kulkarni',
    room: 'Room 103',
    day: 'Monday',
    time: '09:00 - 10:00',
    course: 'BSc IT',
    year: 'SY',
    division: 'A',
    divisionKey: 'BSc IT_SY_A',
    status: 'Scheduled'
  },
  {
    id: 'lec-3',
    subject: 'Computer Networks',
    teacher: 'Prof. Amit Shah',
    room: 'Room 104',
    day: 'Monday',
    time: '10:00 - 11:00',
    course: 'BSc CS',
    year: 'FY',
    division: 'A',
    divisionKey: 'BSc CS_FY_A',
    status: 'Scheduled'
  }
];

function checkConflict(all, params) {
  const conflicts = [];
  const normTime = (params.time || '').replace(/\s+/g, '');
  const normDay = (params.day || '').trim().toLowerCase();
  const normRoom = (params.room || '').trim().toLowerCase();
  const normTeacher = (params.teacher || '').trim().toLowerCase();

  for (const l of all) {
    if (params.lectureId && l.id === params.lectureId) continue;
    if (l.status === 'Cancelled') continue;
    
    const lTime = (l.time || '').replace(/\s+/g, '');
    const lDay = (l.day || '').trim().toLowerCase();
    if (lDay !== normDay || lTime !== normTime) continue;

    // Check Room Conflict
    if (normRoom && (l.room || '').trim().toLowerCase() === normRoom) {
      conflicts.push({
        type: 'room',
        conflictingLecture: l,
        message: `Classroom "${params.room}" is already occupied on ${params.day} (${params.time}) by ${l.teacher} for "${l.subject}" (${l.course} Div ${l.division}).`
      });
    }

    // Check Teacher Conflict
    if (normTeacher && (l.teacher || '').trim().toLowerCase() === normTeacher) {
      conflicts.push({
        type: 'teacher',
        conflictingLecture: l,
        message: `Faculty "${params.teacher}" already has another lecture "${l.subject}" scheduled in ${l.room} on ${params.day} (${params.time}).`
      });
    }

    // Check Division Conflict
    if (params.divisionKey && l.divisionKey === params.divisionKey) {
      conflicts.push({
        type: 'division',
        conflictingLecture: l,
        message: `Division "${params.divisionKey}" already has "${l.subject}" scheduled with ${l.teacher} in ${l.room} on ${params.day} (${params.time}).`
      });
    }
  }

  return {
    hasConflict: conflicts.length > 0,
    conflict: conflicts[0],
    conflicts
  };
}

console.log('--- Testing Room Conflict Management ---');

// Test 1: Prof Rahul Patil tries to change 'lec-1' (Room 101 on Monday 09:00 - 10:00) to 'Room 103'.
// 'Room 103' is occupied by Prof. Neha Kulkarni on Monday 09:00 - 10:00.
const conflict1 = checkConflict(mockLectures, {
  lectureId: 'lec-1',
  day: 'Monday',
  time: '09:00 - 10:00',
  room: 'Room 103'
});

assert.strictEqual(conflict1.hasConflict, true, 'Room 103 must be detected as occupied');
assert.strictEqual(conflict1.conflict.type, 'room');
assert.strictEqual(conflict1.conflict.conflictingLecture.teacher, 'Prof. Neha Kulkarni');
console.log('✓ Room 103 conflict detected successfully:');
console.log('  ' + conflict1.conflict.message);

// Test 2: Try changing 'lec-1' to 'Room 105' (vacant at that time)
const conflict2 = checkConflict(mockLectures, {
  lectureId: 'lec-1',
  day: 'Monday',
  time: '09:00 - 10:00',
  room: 'Room 105'
});
assert.strictEqual(conflict2.hasConflict, false, 'Room 105 must be free');
console.log('✓ Vacant Room 105 allowed without conflict');

// Test 3: If lec-2 is cancelled, Room 103 becomes free
mockLectures[1].status = 'Cancelled';
const conflict3 = checkConflict(mockLectures, {
  lectureId: 'lec-1',
  day: 'Monday',
  time: '09:00 - 10:00',
  room: 'Room 103'
});
assert.strictEqual(conflict3.hasConflict, false, 'Cancelled lecture room should be free');
console.log('✓ Room 103 freed up when previous lecture was cancelled');

console.log('\n--- ALL CONFLICT LOGIC TESTS PASSED! ---');
