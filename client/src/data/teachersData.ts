// Master Teacher Faculty List (72 official faculty members from college.txt)

export interface TeacherProfile {
  id: string;
  name: string;
  title: string;
  department: string;
  departmentCode: 'SCI_TECH' | 'COMMERCE' | 'MGMT' | 'ARTS';
  subjects: string[];
  email: string;
  room: string;
  status: 'Active' | 'On Leave';
}

export const TEACHER_FACULTY_BREAKDOWN = {
  total: 72,
  departments: [
    { name: 'Science & Technology', code: 'SCI_TECH', count: 30, courses: ['BSc IT', 'BSc CS'] },
    { name: 'Commerce', code: 'COMMERCE', count: 25, courses: ['B.Com', 'BFM', 'BBI', 'BMS'] },
    { name: 'Management', code: 'MGMT', count: 10, courses: ['BBA'] },
    { name: 'Arts', code: 'ARTS', count: 7, courses: ['BA'] }
  ]
};

export const TEACHERS_DATA: TeacherProfile[] = [
  {
    "id": "T001",
    "name": "Rahul Patil",
    "title": "Prof. Rahul Patil",
    "department": "Science & Technology",
    "departmentCode": "SCI_TECH",
    "subjects": [
      "DBMS",
      "Database Systems",
      "Software Testing",
      "Project Management"
    ],
    "email": "rahul.patil.t001@campus.edu",
    "room": "Faculty Cabin T001",
    "status": "Active"
  },
  {
    "id": "T002",
    "name": "Sneha Joshi",
    "title": "Prof. Sneha Joshi",
    "department": "Science & Technology",
    "departmentCode": "SCI_TECH",
    "subjects": [
      "Java Programming",
      "OOP",
      "Software Engineering",
      "Advanced Algorithms"
    ],
    "email": "sneha.joshi.t002@campus.edu",
    "room": "Faculty Cabin T002",
    "status": "Active"
  },
  {
    "id": "T003",
    "name": "Amit Shah",
    "title": "Prof. Amit Shah",
    "department": "Science & Technology",
    "departmentCode": "SCI_TECH",
    "subjects": [
      "Python Programming",
      "Artificial Intelligence",
      "Data Analytics",
      "AI Fundamentals"
    ],
    "email": "amit.shah.t003@campus.edu",
    "room": "Faculty Cabin T003",
    "status": "Active"
  },
  {
    "id": "T004",
    "name": "Neha Kulkarni",
    "title": "Prof. Neha Kulkarni",
    "department": "Science & Technology",
    "departmentCode": "SCI_TECH",
    "subjects": [
      "Web Development",
      "Advanced Web Development",
      "HTML/CSS/JavaScript",
      "Digital Technologies"
    ],
    "email": "neha.kulkarni.t004@campus.edu",
    "room": "Faculty Cabin T004",
    "status": "Active"
  },
  {
    "id": "T005",
    "name": "Karan Mehta",
    "title": "Prof. Karan Mehta",
    "department": "Science & Technology",
    "departmentCode": "SCI_TECH",
    "subjects": [
      "Data Structures",
      "Advanced Algorithms",
      "Algorithms",
      "Programming in C"
    ],
    "email": "karan.mehta.t005@campus.edu",
    "room": "Faculty Cabin T005",
    "status": "Active"
  },
  {
    "id": "T006",
    "name": "Pooja More",
    "title": "Prof. Pooja More",
    "department": "Science & Technology",
    "departmentCode": "SCI_TECH",
    "subjects": [
      "Software Engineering",
      "Project Management",
      "Software Testing",
      "Project"
    ],
    "email": "pooja.more.t006@campus.edu",
    "room": "Faculty Cabin T006",
    "status": "Active"
  },
  {
    "id": "T007",
    "name": "Rohan Desai",
    "title": "Prof. Rohan Desai",
    "department": "Science & Technology",
    "departmentCode": "SCI_TECH",
    "subjects": [
      "Cyber Security",
      "Network Security",
      "Security Fundamentals",
      "Risk & Security"
    ],
    "email": "rohan.desai.t007@campus.edu",
    "room": "Faculty Cabin T007",
    "status": "Active"
  },
  {
    "id": "T008",
    "name": "Anjali Singh",
    "title": "Prof. Anjali Singh",
    "department": "Science & Technology",
    "departmentCode": "SCI_TECH",
    "subjects": [
      "Mathematics",
      "Business Mathematics",
      "Statistics",
      "Quantitative Methods"
    ],
    "email": "anjali.singh.t008@campus.edu",
    "room": "Faculty Cabin T008",
    "status": "Active"
  },
  {
    "id": "T009",
    "name": "Vivek Joshi",
    "title": "Prof. Vivek Joshi",
    "department": "Science & Technology",
    "departmentCode": "SCI_TECH",
    "subjects": [
      "Computer Networks",
      "Networking",
      "Cloud Computing",
      "Network Security"
    ],
    "email": "vivek.joshi.t009@campus.edu",
    "room": "Faculty Cabin T009",
    "status": "Active"
  },
  {
    "id": "T010",
    "name": "Priyanka Nair",
    "title": "Prof. Priyanka Nair",
    "department": "Science & Technology",
    "departmentCode": "SCI_TECH",
    "subjects": [
      "Operating Systems",
      "Computer Fundamentals",
      "System Administration",
      "Computer Architecture"
    ],
    "email": "priyanka.nair.t010@campus.edu",
    "room": "Faculty Cabin T010",
    "status": "Active"
  },
  {
    "id": "T011",
    "name": "Akash Sharma",
    "title": "Prof. Akash Sharma",
    "department": "Science & Technology",
    "departmentCode": "SCI_TECH",
    "subjects": [
      "Programming in C",
      "C Programming",
      "Data Structures",
      "Algorithms"
    ],
    "email": "akash.sharma.t011@campus.edu",
    "room": "Faculty Cabin T011",
    "status": "Active"
  },
  {
    "id": "T012",
    "name": "Nisha Patil",
    "title": "Prof. Nisha Patil",
    "department": "Science & Technology",
    "departmentCode": "SCI_TECH",
    "subjects": [
      "Digital Electronics",
      "Computer Fundamentals",
      "Computer Architecture",
      "Digital Systems"
    ],
    "email": "nisha.patil.t012@campus.edu",
    "room": "Faculty Cabin T012",
    "status": "Active"
  },
  {
    "id": "T013",
    "name": "Sagar Deshmukh",
    "title": "Prof. Sagar Deshmukh",
    "department": "Science & Technology",
    "departmentCode": "SCI_TECH",
    "subjects": [
      "Database Systems",
      "DBMS",
      "Data Management",
      "Software Testing"
    ],
    "email": "sagar.deshmukh.t013@campus.edu",
    "room": "Faculty Cabin T013",
    "status": "Active"
  },
  {
    "id": "T014",
    "name": "Riya Mehta",
    "title": "Prof. Riya Mehta",
    "department": "Science & Technology",
    "departmentCode": "SCI_TECH",
    "subjects": [
      "Web Development",
      "Advanced Web Development",
      "Java Programming",
      "HTML/CSS/JavaScript"
    ],
    "email": "riya.mehta.t014@campus.edu",
    "room": "Faculty Cabin T014",
    "status": "Active"
  },
  {
    "id": "T015",
    "name": "Manish Kulkarni",
    "title": "Prof. Manish Kulkarni",
    "department": "Science & Technology",
    "departmentCode": "SCI_TECH",
    "subjects": [
      "Java Programming",
      "Software Engineering",
      "OOP",
      "Software Testing"
    ],
    "email": "manish.kulkarni.t015@campus.edu",
    "room": "Faculty Cabin T015",
    "status": "Active"
  },
  {
    "id": "T016",
    "name": "Kavita Joshi",
    "title": "Prof. Kavita Joshi",
    "department": "Science & Technology",
    "departmentCode": "SCI_TECH",
    "subjects": [
      "Python Programming",
      "Data Analytics",
      "Artificial Intelligence",
      "Statistics"
    ],
    "email": "kavita.joshi.t016@campus.edu",
    "room": "Faculty Cabin T016",
    "status": "Active"
  },
  {
    "id": "T017",
    "name": "Pratik Shah",
    "title": "Prof. Pratik Shah",
    "department": "Science & Technology",
    "departmentCode": "SCI_TECH",
    "subjects": [
      "Data Structures",
      "Algorithms",
      "Programming in C",
      "Advanced Algorithms"
    ],
    "email": "pratik.shah.t017@campus.edu",
    "room": "Faculty Cabin T017",
    "status": "Active"
  },
  {
    "id": "T018",
    "name": "Snehal Patil",
    "title": "Prof. Snehal Patil",
    "department": "Science & Technology",
    "departmentCode": "SCI_TECH",
    "subjects": [
      "Operating Systems",
      "Computer Fundamentals",
      "Computer Architecture",
      "System Administration"
    ],
    "email": "snehal.patil.t018@campus.edu",
    "room": "Faculty Cabin T018",
    "status": "Active"
  },
  {
    "id": "T019",
    "name": "Nitin More",
    "title": "Prof. Nitin More",
    "department": "Science & Technology",
    "departmentCode": "SCI_TECH",
    "subjects": [
      "Computer Networks",
      "Cyber Security",
      "Network Security",
      "Cloud Computing"
    ],
    "email": "nitin.more.t019@campus.edu",
    "room": "Faculty Cabin T019",
    "status": "Active"
  },
  {
    "id": "T020",
    "name": "Swati Desai",
    "title": "Prof. Swati Desai",
    "department": "Science & Technology",
    "departmentCode": "SCI_TECH",
    "subjects": [
      "Mathematics",
      "Statistics",
      "Business Mathematics",
      "Quantitative Methods"
    ],
    "email": "swati.desai.t020@campus.edu",
    "room": "Faculty Cabin T020",
    "status": "Active"
  },
  {
    "id": "T021",
    "name": "Rohit Kulkarni",
    "title": "Prof. Rohit Kulkarni",
    "department": "Science & Technology",
    "departmentCode": "SCI_TECH",
    "subjects": [
      "Software Testing",
      "Software Engineering",
      "Project Management",
      "Quality Assurance"
    ],
    "email": "rohit.kulkarni.t021@campus.edu",
    "room": "Faculty Cabin T021",
    "status": "Active"
  },
  {
    "id": "T022",
    "name": "Priti Sharma",
    "title": "Prof. Priti Sharma",
    "department": "Science & Technology",
    "departmentCode": "SCI_TECH",
    "subjects": [
      "Cloud Computing",
      "Computer Networks",
      "Distributed Systems",
      "Network Administration"
    ],
    "email": "priti.sharma.t022@campus.edu",
    "room": "Faculty Cabin T022",
    "status": "Active"
  },
  {
    "id": "T023",
    "name": "Kunal Patil",
    "title": "Prof. Kunal Patil",
    "department": "Science & Technology",
    "departmentCode": "SCI_TECH",
    "subjects": [
      "Cloud Computing",
      "Advanced Web Development",
      "Web Development",
      "Distributed Systems"
    ],
    "email": "kunal.patil.t023@campus.edu",
    "room": "Faculty Cabin T023",
    "status": "Active"
  },
  {
    "id": "T024",
    "name": "Megha Shah",
    "title": "Prof. Megha Shah",
    "department": "Science & Technology",
    "departmentCode": "SCI_TECH",
    "subjects": [
      "Artificial Intelligence",
      "Python Programming",
      "Data Analytics",
      "Machine Learning"
    ],
    "email": "megha.shah.t024@campus.edu",
    "room": "Faculty Cabin T024",
    "status": "Active"
  },
  {
    "id": "T025",
    "name": "Arjun Joshi",
    "title": "Prof. Arjun Joshi",
    "department": "Science & Technology",
    "departmentCode": "SCI_TECH",
    "subjects": [
      "Cyber Security",
      "Network Security",
      "Computer Networks",
      "Security Fundamentals"
    ],
    "email": "arjun.joshi.t025@campus.edu",
    "room": "Faculty Cabin T025",
    "status": "Active"
  },
  {
    "id": "T026",
    "name": "Varsha More",
    "title": "Prof. Varsha More",
    "department": "Science & Technology",
    "departmentCode": "SCI_TECH",
    "subjects": [
      "Software Testing",
      "Project Management",
      "Software Engineering",
      "Quality Assurance"
    ],
    "email": "varsha.more.t026@campus.edu",
    "room": "Faculty Cabin T026",
    "status": "Active"
  },
  {
    "id": "T027",
    "name": "Sameer Desai",
    "title": "Prof. Sameer Desai",
    "department": "Science & Technology",
    "departmentCode": "SCI_TECH",
    "subjects": [
      "Programming in C",
      "Data Structures",
      "Algorithms",
      "Computer Fundamentals"
    ],
    "email": "sameer.desai.t027@campus.edu",
    "room": "Faculty Cabin T027",
    "status": "Active"
  },
  {
    "id": "T028",
    "name": "Rakesh Mehta",
    "title": "Prof. Rakesh Mehta",
    "department": "Science & Technology",
    "departmentCode": "SCI_TECH",
    "subjects": [
      "Java Programming",
      "Advanced Algorithms",
      "OOP",
      "Data Structures"
    ],
    "email": "rakesh.mehta.t028@campus.edu",
    "room": "Faculty Cabin T028",
    "status": "Active"
  },
  {
    "id": "T029",
    "name": "Aarti Kulkarni",
    "title": "Prof. Aarti Kulkarni",
    "department": "Science & Technology",
    "departmentCode": "SCI_TECH",
    "subjects": [
      "Communication Skills",
      "Project Management",
      "Professional Communication",
      "Presentation Skills"
    ],
    "email": "aarti.kulkarni.t029@campus.edu",
    "room": "Faculty Cabin T029",
    "status": "Active"
  },
  {
    "id": "T030",
    "name": "Deepak Patil",
    "title": "Prof. Deepak Patil",
    "department": "Science & Technology",
    "departmentCode": "SCI_TECH",
    "subjects": [
      "Digital Electronics",
      "Computer Fundamentals",
      "Digital Systems",
      "Computer Architecture"
    ],
    "email": "deepak.patil.t030@campus.edu",
    "room": "Faculty Cabin T030",
    "status": "Active"
  },
  {
    "id": "T031",
    "name": "Meera Kulkarni",
    "title": "Prof. Meera Kulkarni",
    "department": "Commerce",
    "departmentCode": "COMMERCE",
    "subjects": [
      "Financial Accounting",
      "Corporate Accounting",
      "Advanced Accounting",
      "Accounting"
    ],
    "email": "meera.kulkarni.t031@campus.edu",
    "room": "Faculty Cabin T031",
    "status": "Active"
  },
  {
    "id": "T032",
    "name": "Rajesh Joshi",
    "title": "Prof. Rajesh Joshi",
    "department": "Commerce",
    "departmentCode": "COMMERCE",
    "subjects": [
      "Business Law",
      "Commercial Law",
      "Banking Law",
      "Corporate Law"
    ],
    "email": "rajesh.joshi.t032@campus.edu",
    "room": "Faculty Cabin T032",
    "status": "Active"
  },
  {
    "id": "T033",
    "name": "Kavita Shah",
    "title": "Prof. Kavita Shah",
    "department": "Commerce",
    "departmentCode": "COMMERCE",
    "subjects": [
      "Economics",
      "Business Economics",
      "Financial Markets",
      "International Finance"
    ],
    "email": "kavita.shah.t033@campus.edu",
    "room": "Faculty Cabin T033",
    "status": "Active"
  },
  {
    "id": "T034",
    "name": "Priya Nair",
    "title": "Prof. Priya Nair",
    "department": "Commerce",
    "departmentCode": "COMMERCE",
    "subjects": [
      "Financial Management",
      "Corporate Finance",
      "Investment Management",
      "Financial Modelling"
    ],
    "email": "priya.nair.t034@campus.edu",
    "room": "Faculty Cabin T034",
    "status": "Active"
  },
  {
    "id": "T035",
    "name": "Sameer Khan",
    "title": "Prof. Sameer Khan",
    "department": "Commerce",
    "departmentCode": "COMMERCE",
    "subjects": [
      "Banking",
      "Banking Operations",
      "Financial Services",
      "Banking & Insurance"
    ],
    "email": "sameer.khan.t035@campus.edu",
    "room": "Faculty Cabin T035",
    "status": "Active"
  },
  {
    "id": "T036",
    "name": "Ritu Sharma",
    "title": "Prof. Ritu Sharma",
    "department": "Commerce",
    "departmentCode": "COMMERCE",
    "subjects": [
      "Marketing Management",
      "Marketing",
      "Business Communication",
      "Consumer Behaviour"
    ],
    "email": "ritu.sharma.t036@campus.edu",
    "room": "Faculty Cabin T036",
    "status": "Active"
  },
  {
    "id": "T037",
    "name": "Anil Deshmukh",
    "title": "Prof. Anil Deshmukh",
    "department": "Commerce",
    "departmentCode": "COMMERCE",
    "subjects": [
      "Business Communication",
      "Communication Skills",
      "Professional Communication",
      "Business English"
    ],
    "email": "anil.deshmukh.t037@campus.edu",
    "room": "Faculty Cabin T037",
    "status": "Active"
  },
  {
    "id": "T038",
    "name": "Asha Patil",
    "title": "Prof. Asha Patil",
    "department": "Commerce",
    "departmentCode": "COMMERCE",
    "subjects": [
      "Cost Accounting",
      "Management Accounting",
      "Financial Accounting",
      "Advanced Accounting"
    ],
    "email": "asha.patil.t038@campus.edu",
    "room": "Faculty Cabin T038",
    "status": "Active"
  },
  {
    "id": "T039",
    "name": "Nitin More",
    "title": "Prof. Nitin More",
    "department": "Commerce",
    "departmentCode": "COMMERCE",
    "subjects": [
      "Taxation",
      "Direct Tax",
      "Accounting",
      "Business Law"
    ],
    "email": "nitin.more.t039@campus.edu",
    "room": "Faculty Cabin T039",
    "status": "Active"
  },
  {
    "id": "T040",
    "name": "Swati Joshi",
    "title": "Prof. Swati Joshi",
    "department": "Commerce",
    "departmentCode": "COMMERCE",
    "subjects": [
      "Auditing",
      "Advanced Accounting",
      "Accounting",
      "Corporate Accounting"
    ],
    "email": "swati.joshi.t040@campus.edu",
    "room": "Faculty Cabin T040",
    "status": "Active"
  },
  {
    "id": "T041",
    "name": "Snehal Shah",
    "title": "Prof. Snehal Shah",
    "department": "Commerce",
    "departmentCode": "COMMERCE",
    "subjects": [
      "Business Statistics",
      "Statistics",
      "Business Mathematics",
      "Quantitative Methods"
    ],
    "email": "snehal.shah.t041@campus.edu",
    "room": "Faculty Cabin T041",
    "status": "Active"
  },
  {
    "id": "T042",
    "name": "Rohit Mehta",
    "title": "Prof. Rohit Mehta",
    "department": "Commerce",
    "departmentCode": "COMMERCE",
    "subjects": [
      "Investment Management",
      "Security Analysis",
      "Portfolio Management",
      "Financial Markets"
    ],
    "email": "rohit.mehta.t042@campus.edu",
    "room": "Faculty Cabin T042",
    "status": "Active"
  },
  {
    "id": "T043",
    "name": "Varsha Nair",
    "title": "Prof. Varsha Nair",
    "department": "Commerce",
    "departmentCode": "COMMERCE",
    "subjects": [
      "Corporate Finance",
      "Financial Management",
      "Financial Markets",
      "Investment Management"
    ],
    "email": "varsha.nair.t043@campus.edu",
    "room": "Faculty Cabin T043",
    "status": "Active"
  },
  {
    "id": "T044",
    "name": "Manish Desai",
    "title": "Prof. Manish Desai",
    "department": "Commerce",
    "departmentCode": "COMMERCE",
    "subjects": [
      "Financial Markets",
      "Investment Management",
      "Derivatives",
      "Security Analysis"
    ],
    "email": "manish.desai.t044@campus.edu",
    "room": "Faculty Cabin T044",
    "status": "Active"
  },
  {
    "id": "T045",
    "name": "Poonam Kulkarni",
    "title": "Prof. Poonam Kulkarni",
    "department": "Commerce",
    "departmentCode": "COMMERCE",
    "subjects": [
      "Human Resource Management",
      "Organizational Behaviour",
      "Business Management",
      "Leadership"
    ],
    "email": "poonam.kulkarni.t045@campus.edu",
    "room": "Faculty Cabin T045",
    "status": "Active"
  },
  {
    "id": "T046",
    "name": "Deepak Patil",
    "title": "Prof. Deepak Patil",
    "department": "Commerce",
    "departmentCode": "COMMERCE",
    "subjects": [
      "Operations Management",
      "Management",
      "Business Management",
      "Project Management"
    ],
    "email": "deepak.patil.t046@campus.edu",
    "room": "Faculty Cabin T046",
    "status": "Active"
  },
  {
    "id": "T047",
    "name": "Jyoti Sharma",
    "title": "Prof. Jyoti Sharma",
    "department": "Commerce",
    "departmentCode": "COMMERCE",
    "subjects": [
      "Organizational Behaviour",
      "Business Management",
      "Human Resource Management",
      "Leadership"
    ],
    "email": "jyoti.sharma.t047@campus.edu",
    "room": "Faculty Cabin T047",
    "status": "Active"
  },
  {
    "id": "T048",
    "name": "Suresh Joshi",
    "title": "Prof. Suresh Joshi",
    "department": "Commerce",
    "departmentCode": "COMMERCE",
    "subjects": [
      "Entrepreneurship",
      "Business Management",
      "Innovation",
      "Business Communication"
    ],
    "email": "suresh.joshi.t048@campus.edu",
    "room": "Faculty Cabin T048",
    "status": "Active"
  },
  {
    "id": "T049",
    "name": "Alka Shah",
    "title": "Prof. Alka Shah",
    "department": "Commerce",
    "departmentCode": "COMMERCE",
    "subjects": [
      "Financial Accounting",
      "Cost Accounting",
      "Corporate Accounting",
      "Management Accounting"
    ],
    "email": "alka.shah.t049@campus.edu",
    "room": "Faculty Cabin T049",
    "status": "Active"
  },
  {
    "id": "T050",
    "name": "Mahesh Kulkarni",
    "title": "Prof. Mahesh Kulkarni",
    "department": "Commerce",
    "departmentCode": "COMMERCE",
    "subjects": [
      "Economics",
      "Business Economics",
      "Business Statistics",
      "Commercial Geography"
    ],
    "email": "mahesh.kulkarni.t050@campus.edu",
    "room": "Faculty Cabin T050",
    "status": "Active"
  },
  {
    "id": "T051",
    "name": "Rekha Patil",
    "title": "Prof. Rekha Patil",
    "department": "Commerce",
    "departmentCode": "COMMERCE",
    "subjects": [
      "Business Communication",
      "Marketing",
      "Communication Skills",
      "Consumer Behaviour"
    ],
    "email": "rekha.patil.t051@campus.edu",
    "room": "Faculty Cabin T051",
    "status": "Active"
  },
  {
    "id": "T052",
    "name": "Sanjay More",
    "title": "Prof. Sanjay More",
    "department": "Commerce",
    "departmentCode": "COMMERCE",
    "subjects": [
      "Banking",
      "Financial Services",
      "Banking Operations",
      "Insurance"
    ],
    "email": "sanjay.more.t052@campus.edu",
    "room": "Faculty Cabin T052",
    "status": "Active"
  },
  {
    "id": "T053",
    "name": "Neeta Desai",
    "title": "Prof. Neeta Desai",
    "department": "Commerce",
    "departmentCode": "COMMERCE",
    "subjects": [
      "Insurance",
      "Risk Management",
      "Banking & Insurance",
      "Financial Services"
    ],
    "email": "neeta.desai.t053@campus.edu",
    "room": "Faculty Cabin T053",
    "status": "Active"
  },
  {
    "id": "T054",
    "name": "Pravin Joshi",
    "title": "Prof. Pravin Joshi",
    "department": "Commerce",
    "departmentCode": "COMMERCE",
    "subjects": [
      "Financial Markets",
      "Derivatives",
      "Security Analysis",
      "Investment Management"
    ],
    "email": "pravin.joshi.t054@campus.edu",
    "room": "Faculty Cabin T054",
    "status": "Active"
  },
  {
    "id": "T055",
    "name": "Ramesh Shah",
    "title": "Prof. Ramesh Shah",
    "department": "Commerce",
    "departmentCode": "COMMERCE",
    "subjects": [
      "Portfolio Management",
      "Investment Analysis",
      "Security Analysis",
      "Wealth Management"
    ],
    "email": "ramesh.shah.t055@campus.edu",
    "room": "Faculty Cabin T055",
    "status": "Active"
  },
  {
    "id": "T056",
    "name": "Arjun Mehta",
    "title": "Prof. Arjun Mehta",
    "department": "Management",
    "departmentCode": "MGMT",
    "subjects": [
      "Principles of Management",
      "Business Management",
      "Strategic Management",
      "Leadership"
    ],
    "email": "arjun.mehta.t056@campus.edu",
    "room": "Faculty Cabin T056",
    "status": "Active"
  },
  {
    "id": "T057",
    "name": "Priya Desai",
    "title": "Prof. Priya Desai",
    "department": "Management",
    "departmentCode": "MGMT",
    "subjects": [
      "Marketing Management",
      "Digital Marketing",
      "Marketing",
      "Consumer Behaviour"
    ],
    "email": "priya.desai.t057@campus.edu",
    "room": "Faculty Cabin T057",
    "status": "Active"
  },
  {
    "id": "T058",
    "name": "Rahul Sharma",
    "title": "Prof. Rahul Sharma",
    "department": "Management",
    "departmentCode": "MGMT",
    "subjects": [
      "Business Communication",
      "Leadership",
      "Professional Communication",
      "Business English"
    ],
    "email": "rahul.sharma.t058@campus.edu",
    "room": "Faculty Cabin T058",
    "status": "Active"
  },
  {
    "id": "T059",
    "name": "Sneha Patil",
    "title": "Prof. Sneha Patil",
    "department": "Management",
    "departmentCode": "MGMT",
    "subjects": [
      "Finance",
      "Financial Management",
      "Financial Accounting",
      "Corporate Finance"
    ],
    "email": "sneha.patil.t059@campus.edu",
    "room": "Faculty Cabin T059",
    "status": "Active"
  },
  {
    "id": "T060",
    "name": "Amit Joshi",
    "title": "Prof. Amit Joshi",
    "department": "Management",
    "departmentCode": "MGMT",
    "subjects": [
      "Business Analytics",
      "Business Statistics",
      "Data Analytics",
      "Quantitative Methods"
    ],
    "email": "amit.joshi.t060@campus.edu",
    "room": "Faculty Cabin T060",
    "status": "Active"
  },
  {
    "id": "T061",
    "name": "Priti Shah",
    "title": "Prof. Priti Shah",
    "department": "Management",
    "departmentCode": "MGMT",
    "subjects": [
      "Human Resources",
      "Human Resource Management",
      "Organizational Behaviour",
      "Leadership"
    ],
    "email": "priti.shah.t061@campus.edu",
    "room": "Faculty Cabin T061",
    "status": "Active"
  },
  {
    "id": "T062",
    "name": "Rakesh More",
    "title": "Prof. Rakesh More",
    "department": "Management",
    "departmentCode": "MGMT",
    "subjects": [
      "Entrepreneurship",
      "Innovation",
      "Business Management",
      "Strategic Management"
    ],
    "email": "rakesh.more.t062@campus.edu",
    "room": "Faculty Cabin T062",
    "status": "Active"
  },
  {
    "id": "T063",
    "name": "Nisha Mehta",
    "title": "Prof. Nisha Mehta",
    "department": "Management",
    "departmentCode": "MGMT",
    "subjects": [
      "Operations Management",
      "Project Management",
      "Business Management",
      "Operations"
    ],
    "email": "nisha.mehta.t063@campus.edu",
    "room": "Faculty Cabin T063",
    "status": "Active"
  },
  {
    "id": "T064",
    "name": "Kunal Desai",
    "title": "Prof. Kunal Desai",
    "department": "Management",
    "departmentCode": "MGMT",
    "subjects": [
      "Business Law",
      "Corporate Law",
      "Commercial Law",
      "Business Ethics"
    ],
    "email": "kunal.desai.t064@campus.edu",
    "room": "Faculty Cabin T064",
    "status": "Active"
  },
  {
    "id": "T065",
    "name": "Riya Kulkarni",
    "title": "Prof. Riya Kulkarni",
    "department": "Management",
    "departmentCode": "MGMT",
    "subjects": [
      "Digital Marketing",
      "Marketing",
      "Business Communication",
      "Consumer Behaviour"
    ],
    "email": "riya.kulkarni.t065@campus.edu",
    "room": "Faculty Cabin T065",
    "status": "Active"
  },
  {
    "id": "T066",
    "name": "Kavita Desai",
    "title": "Prof. Kavita Desai",
    "department": "Arts",
    "departmentCode": "ARTS",
    "subjects": [
      "Psychology",
      "Sociology",
      "Social Psychology",
      "Human Behaviour"
    ],
    "email": "kavita.desai.t066@campus.edu",
    "room": "Faculty Cabin T066",
    "status": "Active"
  },
  {
    "id": "T067",
    "name": "Anjali More",
    "title": "Prof. Anjali More",
    "department": "Arts",
    "departmentCode": "ARTS",
    "subjects": [
      "English",
      "Communication Skills",
      "English Literature",
      "Business English"
    ],
    "email": "anjali.more.t067@campus.edu",
    "room": "Faculty Cabin T067",
    "status": "Active"
  },
  {
    "id": "T068",
    "name": "Mahesh Patil",
    "title": "Prof. Mahesh Patil",
    "department": "Arts",
    "departmentCode": "ARTS",
    "subjects": [
      "Sociology",
      "Political Science",
      "Social Studies",
      "Human Society"
    ],
    "email": "mahesh.patil.t068@campus.edu",
    "room": "Faculty Cabin T068",
    "status": "Active"
  },
  {
    "id": "T069",
    "name": "Rekha Shah",
    "title": "Prof. Rekha Shah",
    "department": "Arts",
    "departmentCode": "ARTS",
    "subjects": [
      "History",
      "Sociology",
      "Indian History",
      "Cultural Studies"
    ],
    "email": "rekha.shah.t069@campus.edu",
    "room": "Faculty Cabin T069",
    "status": "Active"
  },
  {
    "id": "T070",
    "name": "Sunil Joshi",
    "title": "Prof. Sunil Joshi",
    "department": "Arts",
    "departmentCode": "ARTS",
    "subjects": [
      "Political Science",
      "History",
      "Public Administration",
      "Indian Politics"
    ],
    "email": "sunil.joshi.t070@campus.edu",
    "room": "Faculty Cabin T070",
    "status": "Active"
  },
  {
    "id": "T071",
    "name": "Neeta Kulkarni",
    "title": "Prof. Neeta Kulkarni",
    "department": "Arts",
    "departmentCode": "ARTS",
    "subjects": [
      "Communication Skills",
      "English",
      "Presentation Skills",
      "English Literature"
    ],
    "email": "neeta.kulkarni.t071@campus.edu",
    "room": "Faculty Cabin T071",
    "status": "Active"
  },
  {
    "id": "T072",
    "name": "Ashwini Patil",
    "title": "Prof. Ashwini Patil",
    "department": "Arts",
    "departmentCode": "ARTS",
    "subjects": [
      "Psychology",
      "Sociology",
      "Human Behaviour",
      "Social Psychology"
    ],
    "email": "ashwini.patil.t072@campus.edu",
    "room": "Faculty Cabin T072",
    "status": "Active"
  }
];

export function findTeacherByQuery(query: string): TeacherProfile | undefined {
  if (!query) return undefined;
  const clean = query.trim().toLowerCase();

  // Special developer user resolution
  if (clean === 'shirodkarshivam068@gmail.com' || clean === 't-shivam' || clean === 'prof. shivam shirodkar' || clean === 'shivam shirodkar') {
    return {
      id: 'T001',
      name: 'Shivam Shirodkar',
      title: 'Prof. Shivam Shirodkar',
      department: 'Science & Technology',
      departmentCode: 'SCI_TECH',
      subjects: ['Database Management Systems', 'Web Development', 'Python Programming', 'Software Engineering'],
      email: 'shirodkarshivam068@gmail.com',
      room: 'Faculty Cabin T-SHIVAM',
      status: 'Active',
    };
  }

  return TEACHERS_DATA.find(t => {
    if (t.id.toLowerCase() === clean) return true;
    if (t.email.toLowerCase() === clean) return true;
    if (t.name.toLowerCase() === clean) return true;
    if (t.title.toLowerCase() === clean) return true;
    if (t.email.toLowerCase().includes(clean)) return true;
    if (t.name.toLowerCase().includes(clean)) return true;
    return false;
  });
}

export function getLecturesForTeacher(teacher: TeacherProfile) {
  const primarySub = teacher.subjects[0] || 'Core Subject';
  const secondarySub = teacher.subjects[1] || teacher.subjects[0] || 'Elective Subject';
  let primaryCourse = 'BSc IT';
  let secondaryCourse = 'BSc CS';
  let primaryRoom = 'Room 204';
  let labRoom = 'Computer Lab 1';
  if (teacher.department === 'Commerce') {
    primaryCourse = 'B.Com'; secondaryCourse = 'BFM'; primaryRoom = 'Room 101'; labRoom = 'Room 102';
  } else if (teacher.department === 'Management') {
    primaryCourse = 'BBA'; secondaryCourse = 'BBA'; primaryRoom = 'Room 105'; labRoom = 'Room 106';
  } else if (teacher.department === 'Arts') {
    primaryCourse = 'BA'; secondaryCourse = 'BA'; primaryRoom = 'Room 108'; labRoom = 'Room 109';
  }
  return [
    { id: `lec-${teacher.id}-1`, time: '10:00 - 11:00', subject: primarySub, teacher: teacher.title, room: primaryRoom, department: teacher.department, course: primaryCourse, semester: 1, division: 'A', day: 'Monday', status: 'Scheduled' as const },
    { id: `lec-${teacher.id}-2`, time: '11:00 - 12:00', subject: primarySub, teacher: teacher.title, room: primaryRoom, department: teacher.department, course: primaryCourse, semester: 1, division: 'B', day: 'Monday', status: 'Scheduled' as const },
    { id: `lec-${teacher.id}-3`, time: '02:00 - 03:00', subject: secondarySub, teacher: teacher.title, room: 'Room 201', department: teacher.department, course: secondaryCourse, semester: 3, division: 'A', day: 'Monday', status: 'Scheduled' as const },
    { id: `lec-${teacher.id}-4`, time: '09:00 - 10:00', subject: `${primarySub} Practical / Lab`, teacher: teacher.title, room: labRoom, department: teacher.department, course: primaryCourse, semester: 1, division: 'B', day: 'Tuesday', status: 'Scheduled' as const },
    { id: `lec-${teacher.id}-5`, time: '01:00 - 02:00', subject: secondarySub, teacher: teacher.title, room: primaryRoom, department: teacher.department, course: secondaryCourse, semester: 3, division: 'B', day: 'Wednesday', status: 'Scheduled' as const }
  ];
}
