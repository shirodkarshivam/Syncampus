export interface DepartmentSummary {
  id: string;
  name: string;
  code: string;
  coursesCount: number;
  divisionsCount: number;
  description: string;
  courses: string[];
}

export interface CourseDetail {
  id: string;
  code: string;
  name: string;
  department: string;
  departmentCode: string;
  durationYears: number;
  totalDivisions: number;
  years: {
    year: 'FY' | 'SY' | 'TY';
    divisions: string[];
    divisionCount: number;
  }[];
}

export interface AcademicDivisionEntry {
  no: number;
  department: string;
  departmentCode: string;
  course: string;
  courseCode: string;
  year: 'FY' | 'SY' | 'TY';
  divisions: string[];
  divisionNames: string;
  divisionCount: number;
}

export interface Lecture {
  id: string;
  time: string;
  subject: string;
  teacher: string;
  room: string;
  department: string;
  course: string;
  semester: number;
  division: string;
  day: string;
  status: 'Scheduled' | 'Rescheduled' | 'Cancelled';
  originalTime?: string;
  originalRoom?: string;
}

export interface Classroom {
  id: string;
  name: string;
  capacity: number;
  floor: string;
  type: 'Classroom' | 'Computer Lab' | 'Auditorium';
  status: 'Available' | 'Occupied' | 'Maintenance';
  currentLecture?: string;
}

export interface Examination {
  id: string;
  subject: string;
  course: string;
  semester: number;
  date: string;
  time: string;
  room: string;
  status: 'Published' | 'Draft' | 'Completed';
}

export interface Announcement {
  id: string;
  title: string;
  audience: string;
  message: string;
  date: string;
  priority: 'Normal' | 'Important' | 'Critical';
}

export interface ActivityLog {
  id: string;
  time: string;
  title: string;
  detail: string;
  type: 'room_change' | 'reschedule' | 'announcement' | 'status';
}

// ==========================================
// OFFICIAL COLLEGE STRUCTURE FROM college.txt
// ==========================================

export const COLLEGE_METRICS = {
  targetStudents: '2,700',
  departments: 4,
  courses: 8,
  divisions: 51,
  totalTeachers: 135,
  generalClassrooms: 54,
  computerLabs: 6,
  seminarHalls: 2,
  teachingDays: 'Monday-Friday',
  regularPeriodsPerDay: 5
};

export const DEPARTMENTS_DATA: DepartmentSummary[] = [
  {
    id: 'dept-sci',
    name: 'Science & Technology',
    code: 'SCI_TECH',
    coursesCount: 2,
    divisionsCount: 12,
    description: 'Information Technology, Computer Science & Computing Labs',
    courses: ['BSc IT', 'BSc CS']
  },
  {
    id: 'dept-comm',
    name: 'Commerce',
    code: 'COMMERCE',
    coursesCount: 4,
    divisionsCount: 27,
    description: 'Accounting, Financial Markets, Banking & Insurance, Management Studies',
    courses: ['B.Com', 'BBI', 'BFM', 'BMS']
  },
  {
    id: 'dept-arts',
    name: 'Arts',
    code: 'ARTS',
    coursesCount: 1,
    divisionsCount: 6,
    description: 'Humanities, Economics, Psychology, English & Social Sciences',
    courses: ['BA']
  },
  {
    id: 'dept-mgmt',
    name: 'Management',
    code: 'MGMT',
    coursesCount: 1,
    divisionsCount: 6,
    description: 'Business Administration, Strategic Management & Marketing',
    courses: ['BBA']
  }
];

export const ACADEMIC_DIVISIONS_DATA: AcademicDivisionEntry[] = [
  { no: 1, department: 'Science & Technology', departmentCode: 'SCI_TECH', course: 'BSc IT', courseCode: 'BSCIT', year: 'FY', divisions: ['A', 'B'], divisionNames: 'A, B', divisionCount: 2 },
  { no: 2, department: 'Science & Technology', departmentCode: 'SCI_TECH', course: 'BSc IT', courseCode: 'BSCIT', year: 'SY', divisions: ['A', 'B'], divisionNames: 'A, B', divisionCount: 2 },
  { no: 3, department: 'Science & Technology', departmentCode: 'SCI_TECH', course: 'BSc IT', courseCode: 'BSCIT', year: 'TY', divisions: ['A', 'B'], divisionNames: 'A, B', divisionCount: 2 },
  { no: 4, department: 'Science & Technology', departmentCode: 'SCI_TECH', course: 'BSc CS', courseCode: 'BSCCS', year: 'FY', divisions: ['A', 'B'], divisionNames: 'A, B', divisionCount: 2 },
  { no: 5, department: 'Science & Technology', departmentCode: 'SCI_TECH', course: 'BSc CS', courseCode: 'BSCCS', year: 'SY', divisions: ['A', 'B'], divisionNames: 'A, B', divisionCount: 2 },
  { no: 6, department: 'Science & Technology', departmentCode: 'SCI_TECH', course: 'BSc CS', courseCode: 'BSCCS', year: 'TY', divisions: ['A', 'B'], divisionNames: 'A, B', divisionCount: 2 },
  
  { no: 7, department: 'Commerce', departmentCode: 'COMMERCE', course: 'B.Com', courseCode: 'BCOM', year: 'FY', divisions: ['A', 'B', 'C'], divisionNames: 'A, B, C', divisionCount: 3 },
  { no: 8, department: 'Commerce', departmentCode: 'COMMERCE', course: 'B.Com', courseCode: 'BCOM', year: 'SY', divisions: ['A', 'B', 'C'], divisionNames: 'A, B, C', divisionCount: 3 },
  { no: 9, department: 'Commerce', departmentCode: 'COMMERCE', course: 'B.Com', courseCode: 'BCOM', year: 'TY', divisions: ['A', 'B', 'C'], divisionNames: 'A, B, C', divisionCount: 3 },
  
  { no: 10, department: 'Commerce', departmentCode: 'COMMERCE', course: 'BBI', courseCode: 'BBI', year: 'FY', divisions: ['A', 'B'], divisionNames: 'A, B', divisionCount: 2 },
  { no: 11, department: 'Commerce', departmentCode: 'COMMERCE', course: 'BBI', courseCode: 'BBI', year: 'SY', divisions: ['A', 'B'], divisionNames: 'A, B', divisionCount: 2 },
  { no: 12, department: 'Commerce', departmentCode: 'COMMERCE', course: 'BBI', courseCode: 'BBI', year: 'TY', divisions: ['A', 'B'], divisionNames: 'A, B', divisionCount: 2 },
  
  { no: 13, department: 'Commerce', departmentCode: 'COMMERCE', course: 'BFM', courseCode: 'BFM', year: 'FY', divisions: ['A', 'B'], divisionNames: 'A, B', divisionCount: 2 },
  { no: 14, department: 'Commerce', departmentCode: 'COMMERCE', course: 'BFM', courseCode: 'BFM', year: 'SY', divisions: ['A', 'B'], divisionNames: 'A, B', divisionCount: 2 },
  { no: 15, department: 'Commerce', departmentCode: 'COMMERCE', course: 'BFM', courseCode: 'BFM', year: 'TY', divisions: ['A', 'B'], divisionNames: 'A, B', divisionCount: 2 },
  
  { no: 16, department: 'Commerce', departmentCode: 'COMMERCE', course: 'BMS', courseCode: 'BMS', year: 'FY', divisions: ['A', 'B'], divisionNames: 'A, B', divisionCount: 2 },
  { no: 17, department: 'Commerce', departmentCode: 'COMMERCE', course: 'BMS', courseCode: 'BMS', year: 'SY', divisions: ['A', 'B'], divisionNames: 'A, B', divisionCount: 2 },
  { no: 18, department: 'Commerce', departmentCode: 'COMMERCE', course: 'BMS', courseCode: 'BMS', year: 'TY', divisions: ['A', 'B'], divisionNames: 'A, B', divisionCount: 2 },
  
  { no: 19, department: 'Arts', departmentCode: 'ARTS', course: 'BA', courseCode: 'BA', year: 'FY', divisions: ['A', 'B'], divisionNames: 'A, B', divisionCount: 2 },
  { no: 20, department: 'Arts', departmentCode: 'ARTS', course: 'BA', courseCode: 'BA', year: 'SY', divisions: ['A', 'B'], divisionNames: 'A, B', divisionCount: 2 },
  { no: 21, department: 'Arts', departmentCode: 'ARTS', course: 'BA', courseCode: 'BA', year: 'TY', divisions: ['A', 'B'], divisionNames: 'A, B', divisionCount: 2 },
  
  { no: 22, department: 'Management', departmentCode: 'MGMT', course: 'BBA', courseCode: 'BBA', year: 'FY', divisions: ['A', 'B'], divisionNames: 'A, B', divisionCount: 2 },
  { no: 23, department: 'Management', departmentCode: 'MGMT', course: 'BBA', courseCode: 'BBA', year: 'SY', divisions: ['A', 'B'], divisionNames: 'A, B', divisionCount: 2 },
  { no: 24, department: 'Management', departmentCode: 'MGMT', course: 'BBA', courseCode: 'BBA', year: 'TY', divisions: ['A', 'B'], divisionNames: 'A, B', divisionCount: 2 },
];

export const INITIAL_STATS = {
  totalStudents: '2,700',
  departments: '4',
  courses: '8',
  totalDivisions: '51',
  schedule: {
    totalLectures: 185,
    scheduled: 172,
    rescheduled: 8,
    cancelled: 5,
  }
};

export const INITIAL_ACTIVITIES: ActivityLog[] = [
  {
    id: 'act-1',
    time: '10:42 AM',
    title: 'Division B.Com FY (Div C) room allocated',
    detail: 'Room 102 &bull; 60 capacity allocation verified',
    type: 'room_change'
  },
  {
    id: 'act-2',
    time: '10:20 AM',
    title: 'Department hierarchy updated',
    detail: 'Science & Technology (SCI_TECH): 12 divisions confirmed',
    type: 'status'
  },
  {
    id: 'act-3',
    time: '09:55 AM',
    title: 'Academic calendar published',
    detail: 'Term 2026-27: 51 divisions active across 8 courses',
    type: 'announcement'
  },
  {
    id: 'act-4',
    time: '09:15 AM',
    title: 'Classroom master audit complete',
    detail: '54 General classrooms & 6 Computer labs active',
    type: 'status'
  }
];

export * from './teachersData';
export * from './curriculumData';

export const INITIAL_LECTURES: Lecture[] = [
  {
    id: 'lec-1',
    time: '09:00 - 10:00',
    subject: 'Computer Networks',
    teacher: 'Prof. Vivek Joshi',
    room: 'Room 201',
    department: 'Science & Technology',
    course: 'BSc IT',
    semester: 3,
    division: 'A',
    day: 'Monday',
    status: 'Scheduled'
  },
  {
    id: 'lec-2',
    time: '10:00 - 11:00',
    subject: 'Database Management Systems',
    teacher: 'Prof. Rahul Patil',
    room: 'Room 204',
    department: 'Science & Technology',
    course: 'BSc IT',
    semester: 3,
    division: 'A',
    day: 'Monday',
    status: 'Rescheduled',
    originalTime: '10:00 - 11:00',
    originalRoom: 'Room 204'
  },
  {
    id: 'lec-3',
    time: '11:00 - 12:00',
    subject: 'Web Development',
    teacher: 'Prof. Neha Kulkarni',
    room: 'Room 302',
    department: 'Science & Technology',
    course: 'BSc IT',
    semester: 3,
    division: 'A',
    day: 'Monday',
    status: 'Scheduled'
  },
  {
    id: 'lec-4',
    time: '01:00 - 02:00',
    subject: 'Financial Accounting',
    teacher: 'Prof. Meera Kulkarni',
    room: 'Room 101',
    department: 'Commerce',
    course: 'B.Com',
    semester: 1,
    division: 'A',
    day: 'Monday',
    status: 'Scheduled'
  },
  {
    id: 'lec-5',
    time: '02:00 - 03:00',
    subject: 'Principles of Management',
    teacher: 'Prof. Arjun Mehta',
    room: 'Room 105',
    department: 'Management',
    course: 'BBA',
    semester: 1,
    division: 'A',
    day: 'Monday',
    status: 'Scheduled'
  },
  {
    id: 'lec-6',
    time: '03:00 - 04:00',
    subject: 'English & Communication',
    teacher: 'Prof. Anjali More',
    room: 'Room 108',
    department: 'Arts',
    course: 'BA',
    semester: 1,
    division: 'A',
    day: 'Monday',
    status: 'Cancelled'
  }
];

export const INITIAL_CLASSROOMS: Classroom[] = [
  { id: 'c-101', name: 'Room 101', capacity: 60, floor: '1st Floor', type: 'Classroom', status: 'Available' },
  { id: 'c-204', name: 'Room 204', capacity: 70, floor: '2nd Floor', type: 'Classroom', status: 'Occupied', currentLecture: 'DBMS (BSc IT Sem 3 Div A)' },
  { id: 'c-lab1', name: 'Computer Lab 1', capacity: 40, floor: '3rd Floor', type: 'Computer Lab', status: 'Occupied', currentLecture: 'Programming in C (BSc IT FY Div A)' },
  { id: 'c-lab2', name: 'Computer Lab 2', capacity: 40, floor: '3rd Floor', type: 'Computer Lab', status: 'Available' },
  { id: 'c-302', name: 'Room 302', capacity: 65, floor: '3rd Floor', type: 'Classroom', status: 'Available' },
  { id: 'c-305', name: 'Room 305', capacity: 65, floor: '3rd Floor', type: 'Classroom', status: 'Maintenance' },
  { id: 'c-audi1', name: 'Seminar Hall 1', capacity: 250, floor: 'Ground Floor', type: 'Auditorium', status: 'Available' },
  { id: 'c-audi2', name: 'Seminar Hall 2', capacity: 250, floor: 'Ground Floor', type: 'Auditorium', status: 'Available' }
];

export const INITIAL_EXAMINATIONS: Examination[] = [
  {
    id: 'ex-1',
    subject: 'Database Management Systems',
    course: 'BSc IT',
    semester: 3,
    date: '12 October 2026',
    time: '10:00 AM – 01:00 PM',
    room: 'Room 204',
    status: 'Published'
  },
  {
    id: 'ex-2',
    subject: 'Financial Accounting',
    course: 'B.Com',
    semester: 1,
    date: '14 October 2026',
    time: '10:00 AM – 01:00 PM',
    room: 'Room 101',
    status: 'Published'
  },
  {
    id: 'ex-3',
    subject: 'Principles of Management',
    course: 'BBA',
    semester: 1,
    date: '16 October 2026',
    time: '02:00 PM – 05:00 PM',
    room: 'Room 105',
    status: 'Draft'
  },
  {
    id: 'ex-4',
    subject: 'Introduction to Psychology',
    course: 'BA',
    semester: 1,
    date: '19 October 2026',
    time: '10:00 AM – 01:00 PM',
    room: 'Room 108',
    status: 'Published'
  }
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Academic Term 2026-27 Division Structure Activated',
    audience: 'Entire College',
    message: 'Official academic divisions (51 divisions across 8 courses) are synchronized and active for the semester.',
    date: 'Today, 09:55 AM',
    priority: 'Critical'
  },
  {
    id: 'ann-2',
    title: 'Department Timetable Confirmation',
    audience: 'Science & Technology Dept',
    message: 'All 12 divisions across BSc IT and BSc CS timetable allocations have been verified for laboratory sessions.',
    date: 'Yesterday, 04:30 PM',
    priority: 'Normal'
  },
  {
    id: 'ann-3',
    title: 'Commerce Department B.Com Division C Classroom Allocation',
    audience: 'Commerce Department',
    message: 'B.Com FY, SY, and TY Division C classrooms have been assigned on the 1st and 2nd academic wings.',
    date: '01 Oct 2026',
    priority: 'Important'
  }
];
