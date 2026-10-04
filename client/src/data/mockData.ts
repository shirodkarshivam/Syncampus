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
  originalTeacher?: string;
  year?: string;
  divisionKey?: string;
  teacherId?: string;
  cancelReason?: string;
  updatedAt?: string;
}

export interface Classroom {
  id: string;
  name: string;
  capacity: number;
  floor: string;
  type: 'Classroom' | 'Computer Lab' | 'Auditorium';
  status: 'Available' | 'Occupied' | 'Maintenance';
  currentLecture?: string;
  code?: string;
  departmentUse?: string;
  facilities?: string;
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
  totalTeachers: 72,
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
  {
    "id": "room-001",
    "code": "ROOM-001",
    "name": "Room 101",
    "capacity": 55,
    "floor": "1st Floor",
    "type": "Classroom",
    "status": "Occupied",
    "currentLecture": "BSc IT FY Div A",
    "departmentUse": "All Departments",
    "facilities": "Projector, Whiteboard"
  },
  {
    "id": "room-002",
    "code": "ROOM-002",
    "name": "Room 102",
    "capacity": 55,
    "floor": "1st Floor",
    "type": "Classroom",
    "status": "Occupied",
    "currentLecture": "BSc IT FY Div B",
    "departmentUse": "All Departments",
    "facilities": "Projector, Whiteboard"
  },
  {
    "id": "room-003",
    "code": "ROOM-003",
    "name": "Room 103",
    "capacity": 60,
    "floor": "1st Floor",
    "type": "Classroom",
    "status": "Occupied",
    "currentLecture": "BSc IT SY Div A",
    "departmentUse": "All Departments",
    "facilities": "Projector, Whiteboard"
  },
  {
    "id": "room-004",
    "code": "ROOM-004",
    "name": "Room 104",
    "capacity": 55,
    "floor": "1st Floor",
    "type": "Classroom",
    "status": "Occupied",
    "currentLecture": "BSc IT SY Div B",
    "departmentUse": "All Departments",
    "facilities": "Projector, Whiteboard"
  },
  {
    "id": "room-005",
    "code": "ROOM-005",
    "name": "Room 105",
    "capacity": 55,
    "floor": "1st Floor",
    "type": "Classroom",
    "status": "Occupied",
    "currentLecture": "BSc IT TY Div A",
    "departmentUse": "All Departments",
    "facilities": "Projector, Whiteboard"
  },
  {
    "id": "room-006",
    "code": "ROOM-006",
    "name": "Room 106",
    "capacity": 60,
    "floor": "1st Floor",
    "type": "Classroom",
    "status": "Occupied",
    "currentLecture": "BSc IT TY Div B",
    "departmentUse": "All Departments",
    "facilities": "Projector, Whiteboard"
  },
  {
    "id": "room-007",
    "code": "ROOM-007",
    "name": "Room 107",
    "capacity": 55,
    "floor": "1st Floor",
    "type": "Classroom",
    "status": "Occupied",
    "currentLecture": "BSc CS FY Div A",
    "departmentUse": "All Departments",
    "facilities": "Projector, Whiteboard"
  },
  {
    "id": "room-008",
    "code": "ROOM-008",
    "name": "Room 108",
    "capacity": 55,
    "floor": "1st Floor",
    "type": "Classroom",
    "status": "Occupied",
    "currentLecture": "BSc CS FY Div B",
    "departmentUse": "All Departments",
    "facilities": "Projector, Whiteboard"
  },
  {
    "id": "room-009",
    "code": "ROOM-009",
    "name": "Room 109",
    "capacity": 60,
    "floor": "1st Floor",
    "type": "Classroom",
    "status": "Occupied",
    "currentLecture": "BSc CS SY Div A",
    "departmentUse": "All Departments",
    "facilities": "Projector, Whiteboard"
  },
  {
    "id": "room-010",
    "code": "ROOM-010",
    "name": "Room 110",
    "capacity": 55,
    "floor": "1st Floor",
    "type": "Classroom",
    "status": "Occupied",
    "currentLecture": "BSc CS SY Div B",
    "departmentUse": "All Departments",
    "facilities": "Projector, Whiteboard"
  },
  {
    "id": "room-011",
    "code": "ROOM-011",
    "name": "Room 111",
    "capacity": 55,
    "floor": "1st Floor",
    "type": "Classroom",
    "status": "Occupied",
    "currentLecture": "BSc CS TY Div A",
    "departmentUse": "All Departments",
    "facilities": "Projector, Whiteboard"
  },
  {
    "id": "room-012",
    "code": "ROOM-012",
    "name": "Room 112",
    "capacity": 60,
    "floor": "1st Floor",
    "type": "Classroom",
    "status": "Occupied",
    "currentLecture": "BSc CS TY Div B",
    "departmentUse": "All Departments",
    "facilities": "Projector, Whiteboard"
  },
  {
    "id": "room-013",
    "code": "ROOM-013",
    "name": "Room 113",
    "capacity": 55,
    "floor": "1st Floor",
    "type": "Classroom",
    "status": "Occupied",
    "currentLecture": "B.Com FY Div A",
    "departmentUse": "All Departments",
    "facilities": "Projector, Whiteboard"
  },
  {
    "id": "room-014",
    "code": "ROOM-014",
    "name": "Room 114",
    "capacity": 55,
    "floor": "1st Floor",
    "type": "Classroom",
    "status": "Occupied",
    "currentLecture": "B.Com FY Div B",
    "departmentUse": "All Departments",
    "facilities": "Projector, Whiteboard"
  },
  {
    "id": "room-015",
    "code": "ROOM-015",
    "name": "Room 115",
    "capacity": 60,
    "floor": "1st Floor",
    "type": "Classroom",
    "status": "Occupied",
    "currentLecture": "B.Com FY Div C",
    "departmentUse": "All Departments",
    "facilities": "Projector, Whiteboard"
  },
  {
    "id": "room-016",
    "code": "ROOM-016",
    "name": "Room 116",
    "capacity": 55,
    "floor": "1st Floor",
    "type": "Classroom",
    "status": "Occupied",
    "currentLecture": "B.Com SY Div A",
    "departmentUse": "All Departments",
    "facilities": "Projector, Whiteboard"
  },
  {
    "id": "room-017",
    "code": "ROOM-017",
    "name": "Room 117",
    "capacity": 55,
    "floor": "1st Floor",
    "type": "Classroom",
    "status": "Occupied",
    "currentLecture": "B.Com SY Div B",
    "departmentUse": "All Departments",
    "facilities": "Projector, Whiteboard"
  },
  {
    "id": "room-018",
    "code": "ROOM-018",
    "name": "Room 118",
    "capacity": 60,
    "floor": "1st Floor",
    "type": "Classroom",
    "status": "Occupied",
    "currentLecture": "B.Com SY Div C",
    "departmentUse": "All Departments",
    "facilities": "Projector, Whiteboard"
  },
  {
    "id": "room-019",
    "code": "ROOM-019",
    "name": "Room 119",
    "capacity": 55,
    "floor": "2nd Floor",
    "type": "Classroom",
    "status": "Occupied",
    "currentLecture": "B.Com TY Div A",
    "departmentUse": "All Departments",
    "facilities": "Projector, Whiteboard"
  },
  {
    "id": "room-020",
    "code": "ROOM-020",
    "name": "Room 120",
    "capacity": 55,
    "floor": "2nd Floor",
    "type": "Classroom",
    "status": "Occupied",
    "currentLecture": "B.Com TY Div B",
    "departmentUse": "All Departments",
    "facilities": "Projector, Whiteboard"
  },
  {
    "id": "room-021",
    "code": "ROOM-021",
    "name": "Room 121",
    "capacity": 60,
    "floor": "2nd Floor",
    "type": "Classroom",
    "status": "Occupied",
    "currentLecture": "B.Com TY Div C",
    "departmentUse": "All Departments",
    "facilities": "Projector, Whiteboard"
  },
  {
    "id": "room-022",
    "code": "ROOM-022",
    "name": "Room 122",
    "capacity": 55,
    "floor": "2nd Floor",
    "type": "Classroom",
    "status": "Occupied",
    "currentLecture": "BFM FY Div A",
    "departmentUse": "All Departments",
    "facilities": "Projector, Whiteboard"
  },
  {
    "id": "room-023",
    "code": "ROOM-023",
    "name": "Room 123",
    "capacity": 55,
    "floor": "2nd Floor",
    "type": "Classroom",
    "status": "Occupied",
    "currentLecture": "BFM FY Div B",
    "departmentUse": "All Departments",
    "facilities": "Projector, Whiteboard"
  },
  {
    "id": "room-024",
    "code": "ROOM-024",
    "name": "Room 124",
    "capacity": 60,
    "floor": "2nd Floor",
    "type": "Classroom",
    "status": "Occupied",
    "currentLecture": "BFM SY Div A",
    "departmentUse": "All Departments",
    "facilities": "Projector, Whiteboard"
  },
  {
    "id": "room-025",
    "code": "ROOM-025",
    "name": "Room 125",
    "capacity": 55,
    "floor": "2nd Floor",
    "type": "Classroom",
    "status": "Occupied",
    "currentLecture": "BFM SY Div B",
    "departmentUse": "All Departments",
    "facilities": "Projector, Whiteboard"
  },
  {
    "id": "room-026",
    "code": "ROOM-026",
    "name": "Room 126",
    "capacity": 55,
    "floor": "2nd Floor",
    "type": "Classroom",
    "status": "Occupied",
    "currentLecture": "BFM TY Div A",
    "departmentUse": "All Departments",
    "facilities": "Projector, Whiteboard"
  },
  {
    "id": "room-027",
    "code": "ROOM-027",
    "name": "Room 127",
    "capacity": 60,
    "floor": "2nd Floor",
    "type": "Classroom",
    "status": "Occupied",
    "currentLecture": "BFM TY Div B",
    "departmentUse": "All Departments",
    "facilities": "Projector, Whiteboard"
  },
  {
    "id": "room-028",
    "code": "ROOM-028",
    "name": "Room 128",
    "capacity": 55,
    "floor": "2nd Floor",
    "type": "Classroom",
    "status": "Occupied",
    "currentLecture": "BBI FY Div A",
    "departmentUse": "All Departments",
    "facilities": "Projector, Whiteboard"
  },
  {
    "id": "room-029",
    "code": "ROOM-029",
    "name": "Room 129",
    "capacity": 55,
    "floor": "2nd Floor",
    "type": "Classroom",
    "status": "Occupied",
    "currentLecture": "BBI FY Div B",
    "departmentUse": "All Departments",
    "facilities": "Projector, Whiteboard"
  },
  {
    "id": "room-030",
    "code": "ROOM-030",
    "name": "Room 130",
    "capacity": 60,
    "floor": "2nd Floor",
    "type": "Classroom",
    "status": "Occupied",
    "currentLecture": "BBI SY Div A",
    "departmentUse": "All Departments",
    "facilities": "Projector, Whiteboard"
  },
  {
    "id": "room-031",
    "code": "ROOM-031",
    "name": "Room 131",
    "capacity": 55,
    "floor": "2nd Floor",
    "type": "Classroom",
    "status": "Occupied",
    "currentLecture": "BBI SY Div B",
    "departmentUse": "All Departments",
    "facilities": "Projector, Whiteboard"
  },
  {
    "id": "room-032",
    "code": "ROOM-032",
    "name": "Room 132",
    "capacity": 55,
    "floor": "2nd Floor",
    "type": "Classroom",
    "status": "Occupied",
    "currentLecture": "BBI TY Div A",
    "departmentUse": "All Departments",
    "facilities": "Projector, Whiteboard"
  },
  {
    "id": "room-033",
    "code": "ROOM-033",
    "name": "Room 133",
    "capacity": 60,
    "floor": "2nd Floor",
    "type": "Classroom",
    "status": "Occupied",
    "currentLecture": "BBI TY Div B",
    "departmentUse": "All Departments",
    "facilities": "Projector, Whiteboard"
  },
  {
    "id": "room-034",
    "code": "ROOM-034",
    "name": "Room 134",
    "capacity": 55,
    "floor": "2nd Floor",
    "type": "Classroom",
    "status": "Occupied",
    "currentLecture": "BMS FY Div A",
    "departmentUse": "All Departments",
    "facilities": "Projector, Whiteboard"
  },
  {
    "id": "room-035",
    "code": "ROOM-035",
    "name": "Room 135",
    "capacity": 55,
    "floor": "2nd Floor",
    "type": "Classroom",
    "status": "Occupied",
    "currentLecture": "BMS FY Div B",
    "departmentUse": "All Departments",
    "facilities": "Projector, Whiteboard"
  },
  {
    "id": "room-036",
    "code": "ROOM-036",
    "name": "Room 136",
    "capacity": 60,
    "floor": "2nd Floor",
    "type": "Classroom",
    "status": "Occupied",
    "currentLecture": "BMS SY Div A",
    "departmentUse": "All Departments",
    "facilities": "Projector, Whiteboard"
  },
  {
    "id": "room-037",
    "code": "ROOM-037",
    "name": "Room 137",
    "capacity": 55,
    "floor": "3rd Floor",
    "type": "Classroom",
    "status": "Occupied",
    "currentLecture": "BMS SY Div B",
    "departmentUse": "All Departments",
    "facilities": "Projector, Whiteboard"
  },
  {
    "id": "room-038",
    "code": "ROOM-038",
    "name": "Room 138",
    "capacity": 55,
    "floor": "3rd Floor",
    "type": "Classroom",
    "status": "Occupied",
    "currentLecture": "BMS TY Div A",
    "departmentUse": "All Departments",
    "facilities": "Projector, Whiteboard"
  },
  {
    "id": "room-039",
    "code": "ROOM-039",
    "name": "Room 139",
    "capacity": 60,
    "floor": "3rd Floor",
    "type": "Classroom",
    "status": "Occupied",
    "currentLecture": "BMS TY Div B",
    "departmentUse": "All Departments",
    "facilities": "Projector, Whiteboard"
  },
  {
    "id": "room-040",
    "code": "ROOM-040",
    "name": "Room 140",
    "capacity": 55,
    "floor": "3rd Floor",
    "type": "Classroom",
    "status": "Occupied",
    "currentLecture": "BA FY Div A",
    "departmentUse": "All Departments",
    "facilities": "Projector, Whiteboard"
  },
  {
    "id": "room-041",
    "code": "ROOM-041",
    "name": "Room 141",
    "capacity": 55,
    "floor": "3rd Floor",
    "type": "Classroom",
    "status": "Occupied",
    "currentLecture": "BA FY Div B",
    "departmentUse": "All Departments",
    "facilities": "Projector, Whiteboard"
  },
  {
    "id": "room-042",
    "code": "ROOM-042",
    "name": "Room 142",
    "capacity": 60,
    "floor": "3rd Floor",
    "type": "Classroom",
    "status": "Occupied",
    "currentLecture": "BA SY Div A",
    "departmentUse": "All Departments",
    "facilities": "Projector, Whiteboard"
  },
  {
    "id": "room-043",
    "code": "ROOM-043",
    "name": "Room 143",
    "capacity": 55,
    "floor": "3rd Floor",
    "type": "Classroom",
    "status": "Occupied",
    "currentLecture": "BA SY Div B",
    "departmentUse": "All Departments",
    "facilities": "Projector, Whiteboard"
  },
  {
    "id": "room-044",
    "code": "ROOM-044",
    "name": "Room 144",
    "capacity": 55,
    "floor": "3rd Floor",
    "type": "Classroom",
    "status": "Occupied",
    "currentLecture": "BA TY Div A",
    "departmentUse": "All Departments",
    "facilities": "Projector, Whiteboard"
  },
  {
    "id": "room-045",
    "code": "ROOM-045",
    "name": "Room 145",
    "capacity": 60,
    "floor": "3rd Floor",
    "type": "Classroom",
    "status": "Occupied",
    "currentLecture": "BA TY Div B",
    "departmentUse": "All Departments",
    "facilities": "Projector, Whiteboard"
  },
  {
    "id": "room-046",
    "code": "ROOM-046",
    "name": "Room 146",
    "capacity": 55,
    "floor": "3rd Floor",
    "type": "Classroom",
    "status": "Occupied",
    "currentLecture": "BBA FY Div A",
    "departmentUse": "All Departments",
    "facilities": "Projector, Whiteboard"
  },
  {
    "id": "room-047",
    "code": "ROOM-047",
    "name": "Room 147",
    "capacity": 55,
    "floor": "3rd Floor",
    "type": "Classroom",
    "status": "Occupied",
    "currentLecture": "BBA FY Div B",
    "departmentUse": "All Departments",
    "facilities": "Projector, Whiteboard"
  },
  {
    "id": "room-048",
    "code": "ROOM-048",
    "name": "Room 148",
    "capacity": 60,
    "floor": "3rd Floor",
    "type": "Classroom",
    "status": "Occupied",
    "currentLecture": "BBA SY Div A",
    "departmentUse": "All Departments",
    "facilities": "Projector, Whiteboard"
  },
  {
    "id": "room-049",
    "code": "ROOM-049",
    "name": "Room 149",
    "capacity": 55,
    "floor": "3rd Floor",
    "type": "Classroom",
    "status": "Occupied",
    "currentLecture": "BBA SY Div B",
    "departmentUse": "All Departments",
    "facilities": "Projector, Whiteboard"
  },
  {
    "id": "room-050",
    "code": "ROOM-050",
    "name": "Room 150",
    "capacity": 55,
    "floor": "3rd Floor",
    "type": "Classroom",
    "status": "Occupied",
    "currentLecture": "BBA TY Div A",
    "departmentUse": "All Departments",
    "facilities": "Projector, Whiteboard"
  },
  {
    "id": "room-051",
    "code": "ROOM-051",
    "name": "Room 151",
    "capacity": 60,
    "floor": "3rd Floor",
    "type": "Classroom",
    "status": "Occupied",
    "currentLecture": "BBA TY Div B",
    "departmentUse": "All Departments",
    "facilities": "Projector, Whiteboard"
  },
  {
    "id": "room-052",
    "code": "ROOM-052",
    "name": "Room 152",
    "capacity": 55,
    "floor": "3rd Floor",
    "type": "Classroom",
    "status": "Available",
    "departmentUse": "All Departments",
    "facilities": "Projector, Whiteboard"
  },
  {
    "id": "room-053",
    "code": "ROOM-053",
    "name": "Room 153",
    "capacity": 55,
    "floor": "3rd Floor",
    "type": "Classroom",
    "status": "Available",
    "departmentUse": "All Departments",
    "facilities": "Projector, Whiteboard"
  },
  {
    "id": "room-054",
    "code": "ROOM-054",
    "name": "Room 154",
    "capacity": 60,
    "floor": "3rd Floor",
    "type": "Classroom",
    "status": "Available",
    "departmentUse": "All Departments",
    "facilities": "Projector, Whiteboard"
  },
  {
    "id": "lab-001",
    "code": "LAB-001",
    "name": "Computer Lab 1",
    "capacity": 60,
    "floor": "3rd Floor (Tech Wing)",
    "type": "Computer Lab",
    "status": "Available",
    "departmentUse": "Science & Technology",
    "facilities": "60 Computers, Projector, Internet"
  },
  {
    "id": "lab-002",
    "code": "LAB-002",
    "name": "Computer Lab 2",
    "capacity": 60,
    "floor": "3rd Floor (Tech Wing)",
    "type": "Computer Lab",
    "status": "Available",
    "departmentUse": "Science & Technology",
    "facilities": "60 Computers, Projector, Internet"
  },
  {
    "id": "lab-003",
    "code": "LAB-003",
    "name": "Computer Lab 3",
    "capacity": 55,
    "floor": "3rd Floor (Tech Wing)",
    "type": "Computer Lab",
    "status": "Available",
    "departmentUse": "Science & Technology",
    "facilities": "55 Computers, Projector, Internet"
  },
  {
    "id": "lab-004",
    "code": "LAB-004",
    "name": "Computer Lab 4",
    "capacity": 55,
    "floor": "3rd Floor (Tech Wing)",
    "type": "Computer Lab",
    "status": "Available",
    "departmentUse": "Science & Technology",
    "facilities": "55 Computers, Projector, Internet"
  },
  {
    "id": "lab-005",
    "code": "LAB-005",
    "name": "Networking Lab",
    "capacity": 50,
    "floor": "3rd Floor (Tech Wing)",
    "type": "Computer Lab",
    "status": "Available",
    "departmentUse": "Science & Technology",
    "facilities": "Networking Equipment, Computers, Internet"
  },
  {
    "id": "lab-006",
    "code": "LAB-006",
    "name": "Project Lab",
    "capacity": 50,
    "floor": "3rd Floor (Tech Wing)",
    "type": "Computer Lab",
    "status": "Available",
    "departmentUse": "Science & Technology",
    "facilities": "Computers, Projector, Development Equipment"
  },
  {
    "id": "hall-001",
    "code": "HALL-001",
    "name": "Seminar Hall 1",
    "capacity": 180,
    "floor": "Ground Floor (Central Wing)",
    "type": "Auditorium",
    "status": "Available",
    "departmentUse": "All Departments",
    "facilities": "Projector, Sound System, Microphones, Stage"
  },
  {
    "id": "hall-002",
    "code": "HALL-002",
    "name": "Seminar Hall 2",
    "capacity": 120,
    "floor": "Ground Floor (Central Wing)",
    "type": "Auditorium",
    "status": "Available",
    "departmentUse": "All Departments",
    "facilities": "Projector, Sound System, Microphones"
  }
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
