const fs = require('fs');
const path = require('path');

// 1. Read teachers from teachersData.ts
const teachersCode = fs.readFileSync(path.join(__dirname, '../src/data/teachersData.ts'), 'utf8');
const teacherMatch = teachersCode.match(/export const TEACHERS_DATA: TeacherProfile\[\] = (\[[\s\S]*?\]);\n\nexport function/);
if (!teacherMatch) {
  throw new Error('Failed to parse TEACHERS_DATA from teachersData.ts');
}
const teachers = JSON.parse(teacherMatch[1]);
console.log('Loaded', teachers.length, 'teachers.');

// 2. Read 2700 students from dataFake/Student_data.txt
const studentDataRaw = fs.readFileSync(path.join(__dirname, '../../dataFake/Student_data.txt'), 'utf8');
const studentLines = studentDataRaw.trim().split('\n').slice(1);

const students = studentLines.map(line => {
  const [id, name, department, course, year, division, classroom, batch, email] = line.split('\t');
  return {
    id: id.trim(),
    name: name.trim(),
    department: department.trim(),
    course: course.trim(),
    year: year.trim(),
    division: division.trim(),
    classroom: classroom.trim(),
    batch: batch ? batch.trim() : 'A',
    email: email.trim(),
    status: 'Enrolled'
  };
});
console.log('Loaded', students.length, 'students.');

// 3. Extract 51 unique divisions
const divisionsMap = {};
students.forEach(s => {
  const key = `${s.course}_${s.year}_${s.division}`;
  if (!divisionsMap[key]) {
    divisionsMap[key] = {
      key,
      course: s.course,
      year: s.year,
      division: s.division,
      classroom: s.classroom,
      department: s.department
    };
  }
});
const divisions = Object.values(divisionsMap);
console.log('Identified', divisions.length, 'unique divisions.');

// 4. Curriculum
const curriculum = {
  'BSc IT': {
    FY: ['Programming in C', 'Database Management Systems', 'Web Development', 'Mathematics', 'Computer Fundamentals', 'Digital Electronics'],
    SY: ['Data Structures', 'Java Programming', 'Operating Systems', 'Computer Networks', 'Python Programming', 'Software Engineering'],
    TY: ['Cyber Security', 'Cloud Computing', 'Artificial Intelligence', 'Advanced Web Development', 'Software Testing', 'Project Management']
  },
  'BSc CS': {
    FY: ['Programming in C', 'Computer Fundamentals', 'Mathematics', 'Digital Electronics', 'Database Systems', 'Communication Skills'],
    SY: ['Data Structures', 'Java Programming', 'Operating Systems', 'Computer Networks', 'Python Programming', 'Software Engineering'],
    TY: ['Artificial Intelligence', 'Cyber Security', 'Cloud Computing', 'Software Testing', 'Advanced Algorithms', 'Project']
  },
  'B.Com': {
    FY: ['Financial Accounting', 'Business Economics', 'Business Communication', 'Business Mathematics', 'Principles of Management', 'Commercial Geography'],
    SY: ['Corporate Accounting', 'Cost Accounting', 'Business Law', 'Marketing Management', 'Business Statistics', 'Banking'],
    TY: ['Advanced Accounting', 'Taxation', 'Auditing', 'Financial Management', 'Economics', 'Business Management']
  },
  'BFM': {
    FY: ['Financial Accounting', 'Economics', 'Financial Markets', 'Business Mathematics', 'Business Communication', 'Introduction to Finance'],
    SY: ['Corporate Finance', 'Investment Analysis', 'Security Analysis', 'Financial Management', 'Statistics', 'Banking'],
    TY: ['Portfolio Management', 'Derivatives', 'Risk Management', 'International Finance', 'Financial Modelling', 'Wealth Management']
  },
  'BMS': {
    FY: ['Principles of Management', 'Business Communication', 'Business Economics', 'Business Mathematics', 'Financial Accounting', 'Introduction to Management'],
    SY: ['Marketing Management', 'Human Resource Management', 'Business Law', 'Operations Management', 'Business Statistics', 'Organizational Behaviour'],
    TY: ['Strategic Management', 'Project Management', 'Entrepreneurship', 'International Business', 'Leadership & Management', 'Business Research']
  },
  'BBI': {
    FY: ['Financial Accounting', 'Banking Fundamentals', 'Business Economics', 'Business Communication', 'Business Mathematics', 'Introduction to Insurance'],
    SY: ['Banking Operations', 'Insurance Management', 'Financial Management', 'Business Law', 'Risk Management', 'Statistics'],
    TY: ['Investment Management', 'Life Insurance', 'General Insurance', 'Banking Technology', 'Financial Services', 'Risk & Compliance']
  },
  'BBA': {
    FY: ['Principles of Management', 'Business Communication', 'Business Economics', 'Financial Accounting', 'Business Mathematics', 'Fundamentals of Marketing'],
    SY: ['Marketing Management', 'Human Resource Management', 'Operations Management', 'Business Law', 'Business Statistics', 'Organizational Behaviour'],
    TY: ['Strategic Management', 'Entrepreneurship', 'Business Analytics', 'Digital Marketing', 'International Business', 'Project Management']
  },
  'BA': {
    FY: ['English', 'Economics', 'Psychology', 'Sociology', 'History', 'Political Science'],
    SY: ['English', 'Economics', 'Psychology', 'Sociology', 'History', 'Political Science'],
    TY: ['English', 'Economics', 'Psychology', 'Sociology', 'History', 'Political Science']
  }
};

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const timeSlots = [
  '09:00 - 10:00',
  '10:00 - 11:00',
  '11:00 - 12:00',
  '01:00 - 02:00',
  '02:00 - 03:00'
];

function normalize(s) {
  return s.toLowerCase().replace(/[^a-z0-9]/g, ' ').trim();
}

function getCandidateTeachers(subject, dept) {
  const normSub = normalize(subject);
  const candidates = [];
  
  for (const t of teachers) {
    if (t.department !== dept) continue;
    let score = 0;
    for (const ts of t.subjects) {
      const normTs = normalize(ts);
      if (normTs === normSub) score = Math.max(score, 100);
      else if (normTs.includes(normSub) || normSub.includes(normTs)) score = Math.max(score, 80);
      else {
        const wordsSub = normSub.split(' ').filter(w => w.length > 2);
        const wordsTs = normTs.split(' ').filter(w => w.length > 2);
        const common = wordsSub.filter(w => wordsTs.includes(w));
        if (common.length > 0) score = Math.max(score, 60 + common.length * 5);
      }
    }
    
    // Alias / Keyword mappings
    if (score < 50) {
      if ((normSub.includes('dbms') || normSub.includes('database')) && t.subjects.some(s => normalize(s).includes('dbms') || normalize(s).includes('database'))) score = 95;
      if ((normSub.includes('c programming') || normSub.includes('programming in c')) && t.subjects.some(s => normalize(s).includes('c'))) score = 95;
      if ((normSub.includes('ai') || normSub.includes('artificial intelligence')) && t.subjects.some(s => normalize(s).includes('ai') || normalize(s).includes('artificial intelligence'))) score = 95;
      if ((normSub.includes('math') || normSub.includes('statistics')) && t.subjects.some(s => normalize(s).includes('math') || normalize(s).includes('statistics'))) score = 90;
      if ((normSub.includes('account') || normSub.includes('financial')) && t.subjects.some(s => normalize(s).includes('account') || normalize(s).includes('financial'))) score = 90;
      if ((normSub.includes('manage') || normSub.includes('business')) && t.subjects.some(s => normalize(s).includes('manage') || normalize(s).includes('business'))) score = 85;
      if ((normSub.includes('econ') || normSub.includes('market')) && t.subjects.some(s => normalize(s).includes('econ') || normalize(s).includes('market'))) score = 85;
      if ((normSub.includes('english') || normSub.includes('history') || normSub.includes('political') || normSub.includes('sociology') || normSub.includes('psychology')) && t.subjects.some(s => normalize(s).includes('english') || normalize(s).includes('history') || normalize(s).includes('political') || normalize(s).includes('sociology') || normalize(s).includes('psychology'))) score = 90;
    }

    if (score < 40) score = 40;
    candidates.push({ teacher: t, score });
  }
  candidates.sort((a, b) => b.score - a.score);
  return candidates.map(c => c.teacher);
}

// Track busy state: busyTeacher[teacherId][day][timeSlot] = true
const busyTeacher = {};
const teacherLectureCount = {};
teachers.forEach(t => {
  busyTeacher[t.id] = {};
  teacherLectureCount[t.id] = 0;
  days.forEach(d => {
    busyTeacher[t.id][d] = {};
  });
});

const allLectures = [];
let lectureIdSeq = 1;

// For each division, generate 25 periods
for (const div of divisions) {
  const courseSubs = curriculum[div.course]?.[div.year] || [
    'Core Subject 1', 'Core Subject 2', 'Core Subject 3', 'Core Subject 4', 'Core Subject 5', 'Core Subject 6'
  ];
  
  // Weekly slots: 5 days x 5 slots = 25 slots
  const subjectSlotPlan = [];
  for (let dIdx = 0; dIdx < 5; dIdx++) {
    for (let sIdx = 0; sIdx < 5; sIdx++) {
      const subIndex = (dIdx * 5 + sIdx) % 6;
      subjectSlotPlan.push({
        day: days[dIdx],
        time: timeSlots[sIdx],
        subject: courseSubs[subIndex]
      });
    }
  }

  for (const slot of subjectSlotPlan) {
    const candidates = getCandidateTeachers(slot.subject, div.department);
    let assigned = null;
    let minLoad = 999999;
    
    for (const t of candidates) {
      if (!busyTeacher[t.id][slot.day][slot.time]) {
        const load = teacherLectureCount[t.id];
        if (load < minLoad) {
          minLoad = load;
          assigned = t;
        }
      }
    }

    if (!assigned) {
      for (const t of teachers.filter(tc => tc.department === div.department)) {
        if (!busyTeacher[t.id][slot.day][slot.time]) {
          assigned = t;
          break;
        }
      }
    }

    if (!assigned) {
      throw new Error(`Could not find free teacher for slot: ${div.key} ${slot.day} ${slot.time}`);
    }

    busyTeacher[assigned.id][slot.day][slot.time] = true;
    teacherLectureCount[assigned.id]++;
    
    allLectures.push({
      id: `lec-${lectureIdSeq++}`,
      divisionKey: div.key,
      course: div.course,
      year: div.year,
      division: div.division,
      department: div.department,
      classroom: div.classroom,
      day: slot.day,
      time: slot.time,
      subject: slot.subject,
      teacherId: assigned.id,
      teacherName: assigned.title,
      status: 'Scheduled'
    });
  }
}

console.log('Total generated lectures:', allLectures.length);

// CONFLICT AUDIT
let teacherConflicts = 0;
let roomConflicts = 0;
let divisionConflicts = 0;

const teacherAudit = {};
const roomAudit = {};
const divAudit = {};

for (const lec of allLectures) {
  const tKey = `${lec.teacherId}_${lec.day}_${lec.time}`;
  if (teacherAudit[tKey]) {
    teacherConflicts++;
    console.error('Teacher Conflict:', tKey);
  }
  teacherAudit[tKey] = true;

  const rKey = `${lec.classroom}_${lec.day}_${lec.time}`;
  if (roomAudit[rKey]) {
    roomConflicts++;
    console.error('Room Conflict:', rKey);
  }
  roomAudit[rKey] = true;

  const dKey = `${lec.divisionKey}_${lec.day}_${lec.time}`;
  if (divAudit[dKey]) {
    divisionConflicts++;
    console.error('Division Conflict:', dKey);
  }
  divAudit[dKey] = true;
}

console.log('=============================');
console.log('CONFLICT AUDIT REPORT:');
console.log('Teacher Conflicts:', teacherConflicts);
console.log('Room Conflicts:', roomConflicts);
console.log('Division Conflicts:', divisionConflicts);
console.log('=============================');

if (teacherConflicts === 0 && roomConflicts === 0 && divisionConflicts === 0) {
  console.log('SUCCESS: Generated 100% CONFLICT-FREE Timetable for all 51 divisions!');
} else {
  throw new Error('Audit failed with conflicts!');
}

// 5. Generate src/data/studentsData.ts
const studentsFilePath = path.join(__dirname, '../src/data/studentsData.ts');
const studentsFileContent = `// Student Directory Dataset (2,700 official college students from Student_data.txt)

export interface Student {
  id: string;
  name: string;
  department: string;
  course: string;
  year: 'FY' | 'SY' | 'TY' | string;
  division: string;
  classroom: string;
  batch: string;
  email: string;
  status: 'Enrolled' | 'Graduated' | 'Suspended';
}

export const TOTAL_CAMPUS_STUDENTS_COUNT = 2700;

export const STUDENTS_DATA: Student[] = ${JSON.stringify(students, null, 2)};

export const INITIAL_STUDENTS_DATA: Student[] = STUDENTS_DATA;

/**
 * Multi-query student search matcher.
 * Matches:
 * - Exact college email (stu0001@sonopantcollege.edu.in)
 * - Gmail aliases (stu0001@gmail.com, yash.pawar@gmail.com, yashpawar@gmail.com)
 * - Student ID (STU0001, stu0001, 1)
 * - Student Name (Yash Pawar, case-insensitive)
 * - Email prefix
 */
export function findStudentByQuery(query: string): Student | undefined {
  if (!query) return undefined;
  const q = query.trim().toLowerCase();

  // 1. Exact college email match
  let found = STUDENTS_DATA.find(s => s.email.toLowerCase() === q);
  if (found) return found;

  // 2. Exact Student ID match (e.g. STU0001, stu0001, STU2700)
  found = STUDENTS_DATA.find(s => s.id.toLowerCase() === q);
  if (found) return found;

  // If query is just a number like "1" or "0001", format as STU0001
  if (/^\\d+$/.test(q)) {
    const formattedId = 'stu' + q.padStart(4, '0');
    found = STUDENTS_DATA.find(s => s.id.toLowerCase() === formattedId);
    if (found) return found;
  }

  // 3. Gmail alias match (e.g. stu0001@gmail.com -> STU0001)
  if (q.endsWith('@gmail.com') || q.endsWith('@campus.edu')) {
    const local = q.split('@')[0];
    if (local.startsWith('stu')) {
      found = STUDENTS_DATA.find(s => s.id.toLowerCase() === local);
      if (found) return found;
    }
    // Name-based gmail: yash.pawar@gmail.com -> Yash Pawar
    const dotName = local.replace(/[^a-z0-9]/g, ' ');
    found = STUDENTS_DATA.find(s => s.name.toLowerCase() === dotName);
    if (found) return found;
  }

  // 4. Exact full name match
  found = STUDENTS_DATA.find(s => s.name.toLowerCase() === q);
  if (found) return found;

  // 5. Partial name match
  found = STUDENTS_DATA.find(s => s.name.toLowerCase().includes(q));
  if (found) return found;

  // 6. Email prefix match
  const userPrefix = q.split('@')[0];
  found = STUDENTS_DATA.find(s => s.email.toLowerCase().startsWith(userPrefix));

  return found;
}
`;

fs.writeFileSync(studentsFilePath, studentsFileContent, 'utf8');
console.log('Successfully wrote src/data/studentsData.ts (' + students.length + ' students)');

// 6. Generate src/data/timetableData.ts
const timetableFilePath = path.join(__dirname, '../src/data/timetableData.ts');
const timetableFileContent = `// Master College Timetable (1,275 conflict-free scheduled lectures for 51 divisions & 135 faculty)
import type { Lecture } from './mockData';
import type { Student } from './studentsData';

export interface ScheduledLecture {
  id: string;
  divisionKey: string;
  course: string;
  year: string;
  division: string;
  department: string;
  classroom: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | string;
  time: string;
  subject: string;
  teacherId: string;
  teacherName: string;
  status: 'Scheduled' | 'Completed' | 'Ongoing' | 'Rescheduled' | 'Cancelled';
}

export const COLLEGE_CURRICULUM = ${JSON.stringify(curriculum, null, 2)};

export const MASTER_TIMETABLE: ScheduledLecture[] = ${JSON.stringify(allLectures, null, 2)};

/**
 * Returns the 25 weekly conflict-free scheduled lectures for a specific student's division.
 */
export function getLecturesForStudent(student: Student): Lecture[] {
  const divKey = \`\${student.course}_\${student.year}_\${student.division}\`;
  const divLectures = MASTER_TIMETABLE.filter(l => l.divisionKey === divKey);
  
  if (divLectures.length === 0) {
    // Fallback: match by course and year
    const fallback = MASTER_TIMETABLE.filter(l => l.course === student.course && l.year === student.year);
    if (fallback.length > 0) return fallback.slice(0, 25).map(toLectureFormat);
  }

  return divLectures.map(toLectureFormat);
}

/**
 * Returns all conflict-free scheduled lectures taught by a specific teacher across the college.
 */
export function getLecturesForTeacherId(teacherId: string): Lecture[] {
  const teacherLectures = MASTER_TIMETABLE.filter(l => l.teacherId.toLowerCase() === teacherId.toLowerCase());
  return teacherLectures.map(toLectureFormat);
}

/**
 * Returns the 6 curriculum subjects for a student's course and year.
 */
export function getSubjectsForStudent(student: Student): string[] {
  const courseSubs = (COLLEGE_CURRICULUM as Record<string, Record<string, string[]>>)[student.course]?.[student.year];
  return courseSubs || [
    'Core Subject 1', 'Core Subject 2', 'Core Subject 3', 'Core Subject 4', 'Core Subject 5', 'Core Subject 6'
  ];
}

/**
 * Returns the assigned teachers for a student's division.
 */
export function getAssignedTeachersForStudent(student: Student): { subject: string; teacherName: string; teacherId: string }[] {
  const divKey = \`\${student.course}_\${student.year}_\${student.division}\`;
  const divLectures = MASTER_TIMETABLE.filter(l => l.divisionKey === divKey);
  const map = new Map<string, { subject: string; teacherName: string; teacherId: string }>();

  divLectures.forEach(l => {
    if (!map.has(l.subject)) {
      map.set(l.subject, {
        subject: l.subject,
        teacherName: l.teacherName,
        teacherId: l.teacherId
      });
    }
  });

  return Array.from(map.values());
}

function toLectureFormat(sl: ScheduledLecture): Lecture {
  let semNumber = 1;
  if (sl.year === 'SY') semNumber = 3;
  if (sl.year === 'TY') semNumber = 5;

  return {
    id: sl.id,
    time: sl.time,
    subject: sl.subject,
    teacher: sl.teacherName,
    room: sl.classroom,
    department: sl.department,
    course: sl.course,
    semester: semNumber,
    division: sl.division,
    day: sl.day,
    status: sl.status as 'Scheduled'
  };
}
`;

fs.writeFileSync(timetableFilePath, timetableFileContent, 'utf8');
console.log('Successfully wrote src/data/timetableData.ts (' + allLectures.length + ' scheduled lectures)');

