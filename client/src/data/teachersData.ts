// Master Teacher Faculty List (135 official faculty members from college.txt)

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
  total: 135,
  departments: [
    { name: 'Science & Technology', code: 'SCI_TECH', count: 60, courses: ['BSc IT', 'BSc CS'] },
    { name: 'Commerce', code: 'COMMERCE', count: 40, courses: ['B.Com', 'BFM', 'BBI', 'BMS'] },
    { name: 'Management', code: 'MGMT', count: 20, courses: ['BBA'] },
    { name: 'Arts', code: 'ARTS', count: 15, courses: ['BA'] }
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
      "Database Systems"
    ],
    "email": "rahul.patil.t001@campus.edu",
    "room": "Faculty Wing A-301",
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
      "OOP"
    ],
    "email": "sneha.joshi.t002@campus.edu",
    "room": "Faculty Wing A-302",
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
      "AI"
    ],
    "email": "amit.shah.t003@campus.edu",
    "room": "Faculty Wing A-303",
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
      "Advanced Web Development"
    ],
    "email": "neha.kulkarni.t004@campus.edu",
    "room": "Faculty Wing A-304",
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
      "Advanced Algorithms"
    ],
    "email": "karan.mehta.t005@campus.edu",
    "room": "Faculty Wing A-305",
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
      "Project Management"
    ],
    "email": "pooja.more.t006@campus.edu",
    "room": "Faculty Wing A-306",
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
      "Network Security"
    ],
    "email": "rohan.desai.t007@campus.edu",
    "room": "Faculty Wing A-307",
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
      "Business Mathematics"
    ],
    "email": "anjali.singh.t008@campus.edu",
    "room": "Faculty Wing A-308",
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
      "Networking"
    ],
    "email": "vivek.joshi.t009@campus.edu",
    "room": "Faculty Wing A-309",
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
      "Computer Fundamentals"
    ],
    "email": "priyanka.nair.t010@campus.edu",
    "room": "Faculty Wing A-310",
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
      "C Programming"
    ],
    "email": "akash.sharma.t011@campus.edu",
    "room": "Faculty Wing A-311",
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
      "Computer Fundamentals"
    ],
    "email": "nisha.patil.t012@campus.edu",
    "room": "Faculty Wing A-312",
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
      "DBMS"
    ],
    "email": "sagar.deshmukh.t013@campus.edu",
    "room": "Faculty Wing A-313",
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
      "HTML/CSS/JavaScript"
    ],
    "email": "riya.mehta.t014@campus.edu",
    "room": "Faculty Wing A-314",
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
      "Software Engineering"
    ],
    "email": "manish.kulkarni.t015@campus.edu",
    "room": "Faculty Wing A-315",
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
      "Data Analytics"
    ],
    "email": "kavita.joshi.t016@campus.edu",
    "room": "Faculty Wing A-316",
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
      "Algorithms"
    ],
    "email": "pratik.shah.t017@campus.edu",
    "room": "Faculty Wing A-317",
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
      "Computer Fundamentals"
    ],
    "email": "snehal.patil.t018@campus.edu",
    "room": "Faculty Wing A-318",
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
      "Cyber Security"
    ],
    "email": "nitin.more.t019@campus.edu",
    "room": "Faculty Wing A-319",
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
      "Statistics"
    ],
    "email": "swati.desai.t020@campus.edu",
    "room": "Faculty Wing A-320",
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
      "Software Engineering"
    ],
    "email": "rohit.kulkarni.t021@campus.edu",
    "room": "Faculty Wing A-321",
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
      "Computer Networks"
    ],
    "email": "priti.sharma.t022@campus.edu",
    "room": "Faculty Wing A-322",
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
      "Advanced Web Development"
    ],
    "email": "kunal.patil.t023@campus.edu",
    "room": "Faculty Wing A-323",
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
      "Python"
    ],
    "email": "megha.shah.t024@campus.edu",
    "room": "Faculty Wing A-324",
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
      "Network Security"
    ],
    "email": "arjun.joshi.t025@campus.edu",
    "room": "Faculty Wing A-325",
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
      "Project Management"
    ],
    "email": "varsha.more.t026@campus.edu",
    "room": "Faculty Wing A-326",
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
      "Data Structures"
    ],
    "email": "sameer.desai.t027@campus.edu",
    "room": "Faculty Wing A-327",
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
      "Advanced Algorithms"
    ],
    "email": "rakesh.mehta.t028@campus.edu",
    "room": "Faculty Wing A-328",
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
      "Project Management"
    ],
    "email": "aarti.kulkarni.t029@campus.edu",
    "room": "Faculty Wing A-329",
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
      "Computer Fundamentals"
    ],
    "email": "deepak.patil.t030@campus.edu",
    "room": "Faculty Wing A-330",
    "status": "Active"
  },
  {
    "id": "T031",
    "name": "Komal Joshi",
    "title": "Prof. Komal Joshi",
    "department": "Science & Technology",
    "departmentCode": "SCI_TECH",
    "subjects": [
      "Database Systems",
      "Software Testing"
    ],
    "email": "komal.joshi.t031@campus.edu",
    "room": "Faculty Wing A-331",
    "status": "Active"
  },
  {
    "id": "T032",
    "name": "Sachin Shah",
    "title": "Prof. Sachin Shah",
    "department": "Science & Technology",
    "departmentCode": "SCI_TECH",
    "subjects": [
      "Web Development",
      "Digital Electronics"
    ],
    "email": "sachin.shah.t032@campus.edu",
    "room": "Faculty Wing A-332",
    "status": "Active"
  },
  {
    "id": "T033",
    "name": "Priya Deshmukh",
    "title": "Prof. Priya Deshmukh",
    "department": "Science & Technology",
    "departmentCode": "SCI_TECH",
    "subjects": [
      "Artificial Intelligence",
      "Python"
    ],
    "email": "priya.deshmukh.t033@campus.edu",
    "room": "Faculty Wing A-333",
    "status": "Active"
  },
  {
    "id": "T034",
    "name": "Omkar Mehta",
    "title": "Prof. Omkar Mehta",
    "department": "Science & Technology",
    "departmentCode": "SCI_TECH",
    "subjects": [
      "Computer Networks",
      "Cloud Computing"
    ],
    "email": "omkar.mehta.t034@campus.edu",
    "room": "Faculty Wing A-334",
    "status": "Active"
  },
  {
    "id": "T035",
    "name": "Sonali Patil",
    "title": "Prof. Sonali Patil",
    "department": "Science & Technology",
    "departmentCode": "SCI_TECH",
    "subjects": [
      "Mathematics",
      "Statistics"
    ],
    "email": "sonali.patil.t035@campus.edu",
    "room": "Faculty Wing A-335",
    "status": "Active"
  },
  {
    "id": "T036",
    "name": "Harsh Kulkarni",
    "title": "Prof. Harsh Kulkarni",
    "department": "Science & Technology",
    "departmentCode": "SCI_TECH",
    "subjects": [
      "Cyber Security",
      "Software Testing"
    ],
    "email": "harsh.kulkarni.t036@campus.edu",
    "room": "Faculty Wing A-336",
    "status": "Active"
  },
  {
    "id": "T037",
    "name": "Mansi Shah",
    "title": "Prof. Mansi Shah",
    "department": "Science & Technology",
    "departmentCode": "SCI_TECH",
    "subjects": [
      "Java Programming",
      "Web Development"
    ],
    "email": "mansi.shah.t037@campus.edu",
    "room": "Faculty Wing A-337",
    "status": "Active"
  },
  {
    "id": "T038",
    "name": "Abhishek Joshi",
    "title": "Prof. Abhishek Joshi",
    "department": "Science & Technology",
    "departmentCode": "SCI_TECH",
    "subjects": [
      "Data Structures",
      "Algorithms"
    ],
    "email": "abhishek.joshi.t038@campus.edu",
    "room": "Faculty Wing A-338",
    "status": "Active"
  },
  {
    "id": "T039",
    "name": "Neelam More",
    "title": "Prof. Neelam More",
    "department": "Science & Technology",
    "departmentCode": "SCI_TECH",
    "subjects": [
      "Operating Systems",
      "Computer Fundamentals"
    ],
    "email": "neelam.more.t039@campus.edu",
    "room": "Faculty Wing A-339",
    "status": "Active"
  },
  {
    "id": "T040",
    "name": "Varun Desai",
    "title": "Prof. Varun Desai",
    "department": "Science & Technology",
    "departmentCode": "SCI_TECH",
    "subjects": [
      "DBMS",
      "Database Systems"
    ],
    "email": "varun.desai.t040@campus.edu",
    "room": "Faculty Wing A-340",
    "status": "Active"
  },
  {
    "id": "T041",
    "name": "Radhika Patil",
    "title": "Prof. Radhika Patil",
    "department": "Science & Technology",
    "departmentCode": "SCI_TECH",
    "subjects": [
      "Python",
      "Artificial Intelligence"
    ],
    "email": "radhika.patil.t041@campus.edu",
    "room": "Faculty Wing A-341",
    "status": "Active"
  },
  {
    "id": "T042",
    "name": "Tejas Kulkarni",
    "title": "Prof. Tejas Kulkarni",
    "department": "Science & Technology",
    "departmentCode": "SCI_TECH",
    "subjects": [
      "Cloud Computing",
      "Cyber Security"
    ],
    "email": "tejas.kulkarni.t042@campus.edu",
    "room": "Faculty Wing A-342",
    "status": "Active"
  },
  {
    "id": "T043",
    "name": "Shweta Mehta",
    "title": "Prof. Shweta Mehta",
    "department": "Science & Technology",
    "departmentCode": "SCI_TECH",
    "subjects": [
      "Software Engineering",
      "Software Testing"
    ],
    "email": "shweta.mehta.t043@campus.edu",
    "room": "Faculty Wing A-343",
    "status": "Active"
  },
  {
    "id": "T044",
    "name": "Yash Shah",
    "title": "Prof. Yash Shah",
    "department": "Science & Technology",
    "departmentCode": "SCI_TECH",
    "subjects": [
      "Advanced Web Development",
      "Web Development"
    ],
    "email": "yash.shah.t044@campus.edu",
    "room": "Faculty Wing A-344",
    "status": "Active"
  },
  {
    "id": "T045",
    "name": "Pankaj Joshi",
    "title": "Prof. Pankaj Joshi",
    "department": "Science & Technology",
    "departmentCode": "SCI_TECH",
    "subjects": [
      "Programming in C",
      "Java"
    ],
    "email": "pankaj.joshi.t045@campus.edu",
    "room": "Faculty Wing A-345",
    "status": "Active"
  },
  {
    "id": "T046",
    "name": "Divya Deshmukh",
    "title": "Prof. Divya Deshmukh",
    "department": "Science & Technology",
    "departmentCode": "SCI_TECH",
    "subjects": [
      "Mathematics",
      "Communication Skills"
    ],
    "email": "divya.deshmukh.t046@campus.edu",
    "room": "Faculty Wing A-346",
    "status": "Active"
  },
  {
    "id": "T047",
    "name": "Ajay Patil",
    "title": "Prof. Ajay Patil",
    "department": "Science & Technology",
    "departmentCode": "SCI_TECH",
    "subjects": [
      "Computer Networks",
      "Operating Systems"
    ],
    "email": "ajay.patil.t047@campus.edu",
    "room": "Faculty Wing A-347",
    "status": "Active"
  },
  {
    "id": "T048",
    "name": "Rutuja Kulkarni",
    "title": "Prof. Rutuja Kulkarni",
    "department": "Science & Technology",
    "departmentCode": "SCI_TECH",
    "subjects": [
      "Project Management",
      "Software Engineering"
    ],
    "email": "rutuja.kulkarni.t048@campus.edu",
    "room": "Faculty Wing A-348",
    "status": "Active"
  },
  {
    "id": "T049",
    "name": "Ganesh More",
    "title": "Prof. Ganesh More",
    "department": "Science & Technology",
    "departmentCode": "SCI_TECH",
    "subjects": [
      "Data Structures",
      "Programming in C"
    ],
    "email": "ganesh.more.t049@campus.edu",
    "room": "Faculty Wing A-349",
    "status": "Active"
  },
  {
    "id": "T050",
    "name": "Isha Shah",
    "title": "Prof. Isha Shah",
    "department": "Science & Technology",
    "departmentCode": "SCI_TECH",
    "subjects": [
      "Artificial Intelligence",
      "Python"
    ],
    "email": "isha.shah.t050@campus.edu",
    "room": "Faculty Wing A-350",
    "status": "Active"
  },
  {
    "id": "T051",
    "name": "Mohit Desai",
    "title": "Prof. Mohit Desai",
    "department": "Science & Technology",
    "departmentCode": "SCI_TECH",
    "subjects": [
      "Cyber Security",
      "Cloud Computing"
    ],
    "email": "mohit.desai.t051@campus.edu",
    "room": "Faculty Wing A-351",
    "status": "Active"
  },
  {
    "id": "T052",
    "name": "Neha Patil",
    "title": "Prof. Neha Patil",
    "department": "Science & Technology",
    "departmentCode": "SCI_TECH",
    "subjects": [
      "Database Systems",
      "DBMS"
    ],
    "email": "neha.patil.t052@campus.edu",
    "room": "Faculty Wing A-352",
    "status": "Active"
  },
  {
    "id": "T053",
    "name": "Siddharth Joshi",
    "title": "Prof. Siddharth Joshi",
    "department": "Science & Technology",
    "departmentCode": "SCI_TECH",
    "subjects": [
      "Java Programming",
      "Software Engineering"
    ],
    "email": "siddharth.joshi.t053@campus.edu",
    "room": "Faculty Wing A-353",
    "status": "Active"
  },
  {
    "id": "T054",
    "name": "Payal Mehta",
    "title": "Prof. Payal Mehta",
    "department": "Science & Technology",
    "departmentCode": "SCI_TECH",
    "subjects": [
      "Web Development",
      "Advanced Web Development"
    ],
    "email": "payal.mehta.t054@campus.edu",
    "room": "Faculty Wing A-354",
    "status": "Active"
  },
  {
    "id": "T055",
    "name": "Aniket Shah",
    "title": "Prof. Aniket Shah",
    "department": "Science & Technology",
    "departmentCode": "SCI_TECH",
    "subjects": [
      "Operating Systems",
      "Computer Networks"
    ],
    "email": "aniket.shah.t055@campus.edu",
    "room": "Faculty Wing A-355",
    "status": "Active"
  },
  {
    "id": "T056",
    "name": "Shruti Kulkarni",
    "title": "Prof. Shruti Kulkarni",
    "department": "Science & Technology",
    "departmentCode": "SCI_TECH",
    "subjects": [
      "Mathematics",
      "Statistics"
    ],
    "email": "shruti.kulkarni.t056@campus.edu",
    "room": "Faculty Wing A-356",
    "status": "Active"
  },
  {
    "id": "T057",
    "name": "Chetan Patil",
    "title": "Prof. Chetan Patil",
    "department": "Science & Technology",
    "departmentCode": "SCI_TECH",
    "subjects": [
      "Software Testing",
      "Cyber Security"
    ],
    "email": "chetan.patil.t057@campus.edu",
    "room": "Faculty Wing A-357",
    "status": "Active"
  },
  {
    "id": "T058",
    "name": "Monika Desai",
    "title": "Prof. Monika Desai",
    "department": "Science & Technology",
    "departmentCode": "SCI_TECH",
    "subjects": [
      "Communication Skills",
      "Project Management"
    ],
    "email": "monika.desai.t058@campus.edu",
    "room": "Faculty Wing A-358",
    "status": "Active"
  },
  {
    "id": "T059",
    "name": "Raj More",
    "title": "Prof. Raj More",
    "department": "Science & Technology",
    "departmentCode": "SCI_TECH",
    "subjects": [
      "Cloud Computing",
      "Computer Networks"
    ],
    "email": "raj.more.t059@campus.edu",
    "room": "Faculty Wing A-359",
    "status": "Active"
  },
  {
    "id": "T060",
    "name": "Tanvi Joshi",
    "title": "Prof. Tanvi Joshi",
    "department": "Science & Technology",
    "departmentCode": "SCI_TECH",
    "subjects": [
      "Artificial Intelligence",
      "Data Analytics"
    ],
    "email": "tanvi.joshi.t060@campus.edu",
    "room": "Faculty Wing A-360",
    "status": "Active"
  },
  {
    "id": "T061",
    "name": "Meera Kulkarni",
    "title": "Prof. Meera Kulkarni",
    "department": "Commerce",
    "departmentCode": "COMMERCE",
    "subjects": [
      "Financial Accounting",
      "Corporate Accounting"
    ],
    "email": "meera.kulkarni.t061@campus.edu",
    "room": "Faculty Wing B-261",
    "status": "Active"
  },
  {
    "id": "T062",
    "name": "Rajesh Joshi",
    "title": "Prof. Rajesh Joshi",
    "department": "Commerce",
    "departmentCode": "COMMERCE",
    "subjects": [
      "Business Law",
      "Commercial Law"
    ],
    "email": "rajesh.joshi.t062@campus.edu",
    "room": "Faculty Wing B-262",
    "status": "Active"
  },
  {
    "id": "T063",
    "name": "Kavita Shah",
    "title": "Prof. Kavita Shah",
    "department": "Commerce",
    "departmentCode": "COMMERCE",
    "subjects": [
      "Economics",
      "Business Economics"
    ],
    "email": "kavita.shah.t063@campus.edu",
    "room": "Faculty Wing B-263",
    "status": "Active"
  },
  {
    "id": "T064",
    "name": "Priya Nair",
    "title": "Prof. Priya Nair",
    "department": "Commerce",
    "departmentCode": "COMMERCE",
    "subjects": [
      "Financial Management",
      "Corporate Finance"
    ],
    "email": "priya.nair.t064@campus.edu",
    "room": "Faculty Wing B-264",
    "status": "Active"
  },
  {
    "id": "T065",
    "name": "Sameer Khan",
    "title": "Prof. Sameer Khan",
    "department": "Commerce",
    "departmentCode": "COMMERCE",
    "subjects": [
      "Banking",
      "Banking Operations"
    ],
    "email": "sameer.khan.t065@campus.edu",
    "room": "Faculty Wing B-265",
    "status": "Active"
  },
  {
    "id": "T066",
    "name": "Ritu Sharma",
    "title": "Prof. Ritu Sharma",
    "department": "Commerce",
    "departmentCode": "COMMERCE",
    "subjects": [
      "Marketing Management",
      "Marketing"
    ],
    "email": "ritu.sharma.t066@campus.edu",
    "room": "Faculty Wing B-266",
    "status": "Active"
  },
  {
    "id": "T067",
    "name": "Anil Deshmukh",
    "title": "Prof. Anil Deshmukh",
    "department": "Commerce",
    "departmentCode": "COMMERCE",
    "subjects": [
      "Business Communication"
    ],
    "email": "anil.deshmukh.t067@campus.edu",
    "room": "Faculty Wing B-267",
    "status": "Active"
  },
  {
    "id": "T068",
    "name": "Asha Patil",
    "title": "Prof. Asha Patil",
    "department": "Commerce",
    "departmentCode": "COMMERCE",
    "subjects": [
      "Cost Accounting",
      "Management Accounting"
    ],
    "email": "asha.patil.t068@campus.edu",
    "room": "Faculty Wing B-268",
    "status": "Active"
  },
  {
    "id": "T069",
    "name": "Nitin More",
    "title": "Prof. Nitin More",
    "department": "Commerce",
    "departmentCode": "COMMERCE",
    "subjects": [
      "Taxation",
      "Direct Tax"
    ],
    "email": "nitin.more.t069@campus.edu",
    "room": "Faculty Wing B-269",
    "status": "Active"
  },
  {
    "id": "T070",
    "name": "Swati Joshi",
    "title": "Prof. Swati Joshi",
    "department": "Commerce",
    "departmentCode": "COMMERCE",
    "subjects": [
      "Auditing",
      "Advanced Accounting"
    ],
    "email": "swati.joshi.t070@campus.edu",
    "room": "Faculty Wing B-270",
    "status": "Active"
  },
  {
    "id": "T071",
    "name": "Snehal Shah",
    "title": "Prof. Snehal Shah",
    "department": "Commerce",
    "departmentCode": "COMMERCE",
    "subjects": [
      "Business Statistics",
      "Statistics"
    ],
    "email": "snehal.shah.t071@campus.edu",
    "room": "Faculty Wing B-271",
    "status": "Active"
  },
  {
    "id": "T072",
    "name": "Rohit Mehta",
    "title": "Prof. Rohit Mehta",
    "department": "Commerce",
    "departmentCode": "COMMERCE",
    "subjects": [
      "Investment Management",
      "Security Analysis"
    ],
    "email": "rohit.mehta.t072@campus.edu",
    "room": "Faculty Wing B-272",
    "status": "Active"
  },
  {
    "id": "T073",
    "name": "Varsha Nair",
    "title": "Prof. Varsha Nair",
    "department": "Commerce",
    "departmentCode": "COMMERCE",
    "subjects": [
      "Corporate Finance",
      "Financial Management"
    ],
    "email": "varsha.nair.t073@campus.edu",
    "room": "Faculty Wing B-273",
    "status": "Active"
  },
  {
    "id": "T074",
    "name": "Manish Desai",
    "title": "Prof. Manish Desai",
    "department": "Commerce",
    "departmentCode": "COMMERCE",
    "subjects": [
      "Financial Markets",
      "Investment Management"
    ],
    "email": "manish.desai.t074@campus.edu",
    "room": "Faculty Wing B-274",
    "status": "Active"
  },
  {
    "id": "T075",
    "name": "Poonam Kulkarni",
    "title": "Prof. Poonam Kulkarni",
    "department": "Commerce",
    "departmentCode": "COMMERCE",
    "subjects": [
      "Human Resource Management",
      "Organizational Behaviour"
    ],
    "email": "poonam.kulkarni.t075@campus.edu",
    "room": "Faculty Wing B-275",
    "status": "Active"
  },
  {
    "id": "T076",
    "name": "Deepak Patil",
    "title": "Prof. Deepak Patil",
    "department": "Commerce",
    "departmentCode": "COMMERCE",
    "subjects": [
      "Operations Management",
      "Management"
    ],
    "email": "deepak.patil.t076@campus.edu",
    "room": "Faculty Wing B-276",
    "status": "Active"
  },
  {
    "id": "T077",
    "name": "Jyoti Sharma",
    "title": "Prof. Jyoti Sharma",
    "department": "Commerce",
    "departmentCode": "COMMERCE",
    "subjects": [
      "Organizational Behaviour",
      "Business Management"
    ],
    "email": "jyoti.sharma.t077@campus.edu",
    "room": "Faculty Wing B-277",
    "status": "Active"
  },
  {
    "id": "T078",
    "name": "Suresh Joshi",
    "title": "Prof. Suresh Joshi",
    "department": "Commerce",
    "departmentCode": "COMMERCE",
    "subjects": [
      "Entrepreneurship",
      "Business Management"
    ],
    "email": "suresh.joshi.t078@campus.edu",
    "room": "Faculty Wing B-278",
    "status": "Active"
  },
  {
    "id": "T079",
    "name": "Alka Shah",
    "title": "Prof. Alka Shah",
    "department": "Commerce",
    "departmentCode": "COMMERCE",
    "subjects": [
      "Financial Accounting",
      "Cost Accounting"
    ],
    "email": "alka.shah.t079@campus.edu",
    "room": "Faculty Wing B-279",
    "status": "Active"
  },
  {
    "id": "T080",
    "name": "Mahesh Kulkarni",
    "title": "Prof. Mahesh Kulkarni",
    "department": "Commerce",
    "departmentCode": "COMMERCE",
    "subjects": [
      "Economics",
      "Business Economics"
    ],
    "email": "mahesh.kulkarni.t080@campus.edu",
    "room": "Faculty Wing B-280",
    "status": "Active"
  },
  {
    "id": "T081",
    "name": "Rekha Patil",
    "title": "Prof. Rekha Patil",
    "department": "Commerce",
    "departmentCode": "COMMERCE",
    "subjects": [
      "Business Communication",
      "Marketing"
    ],
    "email": "rekha.patil.t081@campus.edu",
    "room": "Faculty Wing B-281",
    "status": "Active"
  },
  {
    "id": "T082",
    "name": "Sanjay More",
    "title": "Prof. Sanjay More",
    "department": "Commerce",
    "departmentCode": "COMMERCE",
    "subjects": [
      "Banking",
      "Financial Services"
    ],
    "email": "sanjay.more.t082@campus.edu",
    "room": "Faculty Wing B-282",
    "status": "Active"
  },
  {
    "id": "T083",
    "name": "Neeta Desai",
    "title": "Prof. Neeta Desai",
    "department": "Commerce",
    "departmentCode": "COMMERCE",
    "subjects": [
      "Insurance",
      "Risk Management"
    ],
    "email": "neeta.desai.t083@campus.edu",
    "room": "Faculty Wing B-283",
    "status": "Active"
  },
  {
    "id": "T084",
    "name": "Pravin Joshi",
    "title": "Prof. Pravin Joshi",
    "department": "Commerce",
    "departmentCode": "COMMERCE",
    "subjects": [
      "Financial Markets",
      "Derivatives"
    ],
    "email": "pravin.joshi.t084@campus.edu",
    "room": "Faculty Wing B-284",
    "status": "Active"
  },
  {
    "id": "T085",
    "name": "Ramesh Shah",
    "title": "Prof. Ramesh Shah",
    "department": "Commerce",
    "departmentCode": "COMMERCE",
    "subjects": [
      "Portfolio Management",
      "Investment Analysis"
    ],
    "email": "ramesh.shah.t085@campus.edu",
    "room": "Faculty Wing B-285",
    "status": "Active"
  },
  {
    "id": "T086",
    "name": "Archana Patil",
    "title": "Prof. Archana Patil",
    "department": "Commerce",
    "departmentCode": "COMMERCE",
    "subjects": [
      "Taxation",
      "Accounting"
    ],
    "email": "archana.patil.t086@campus.edu",
    "room": "Faculty Wing B-286",
    "status": "Active"
  },
  {
    "id": "T087",
    "name": "Vinay Kulkarni",
    "title": "Prof. Vinay Kulkarni",
    "department": "Commerce",
    "departmentCode": "COMMERCE",
    "subjects": [
      "Auditing",
      "Accounting"
    ],
    "email": "vinay.kulkarni.t087@campus.edu",
    "room": "Faculty Wing B-287",
    "status": "Active"
  },
  {
    "id": "T088",
    "name": "Seema Mehta",
    "title": "Prof. Seema Mehta",
    "department": "Commerce",
    "departmentCode": "COMMERCE",
    "subjects": [
      "Business Mathematics",
      "Statistics"
    ],
    "email": "seema.mehta.t088@campus.edu",
    "room": "Faculty Wing B-288",
    "status": "Active"
  },
  {
    "id": "T089",
    "name": "Dinesh Joshi",
    "title": "Prof. Dinesh Joshi",
    "department": "Commerce",
    "departmentCode": "COMMERCE",
    "subjects": [
      "Business Law",
      "Banking Law"
    ],
    "email": "dinesh.joshi.t089@campus.edu",
    "room": "Faculty Wing B-289",
    "status": "Active"
  },
  {
    "id": "T090",
    "name": "Shilpa Deshmukh",
    "title": "Prof. Shilpa Deshmukh",
    "department": "Commerce",
    "departmentCode": "COMMERCE",
    "subjects": [
      "Financial Management",
      "Investment Management"
    ],
    "email": "shilpa.deshmukh.t090@campus.edu",
    "room": "Faculty Wing B-290",
    "status": "Active"
  },
  {
    "id": "T091",
    "name": "Ashok Patil",
    "title": "Prof. Ashok Patil",
    "department": "Commerce",
    "departmentCode": "COMMERCE",
    "subjects": [
      "Banking",
      "Insurance"
    ],
    "email": "ashok.patil.t091@campus.edu",
    "room": "Faculty Wing B-291",
    "status": "Active"
  },
  {
    "id": "T092",
    "name": "Madhuri Shah",
    "title": "Prof. Madhuri Shah",
    "department": "Commerce",
    "departmentCode": "COMMERCE",
    "subjects": [
      "Marketing",
      "Business Communication"
    ],
    "email": "madhuri.shah.t092@campus.edu",
    "room": "Faculty Wing B-292",
    "status": "Active"
  },
  {
    "id": "T093",
    "name": "Rajiv More",
    "title": "Prof. Rajiv More",
    "department": "Commerce",
    "departmentCode": "COMMERCE",
    "subjects": [
      "Cost Accounting",
      "Financial Accounting"
    ],
    "email": "rajiv.more.t093@campus.edu",
    "room": "Faculty Wing B-293",
    "status": "Active"
  },
  {
    "id": "T094",
    "name": "Sonam Joshi",
    "title": "Prof. Sonam Joshi",
    "department": "Commerce",
    "departmentCode": "COMMERCE",
    "subjects": [
      "Human Resource Management",
      "Organizational Behaviour"
    ],
    "email": "sonam.joshi.t094@campus.edu",
    "room": "Faculty Wing B-294",
    "status": "Active"
  },
  {
    "id": "T095",
    "name": "Hemant Desai",
    "title": "Prof. Hemant Desai",
    "department": "Commerce",
    "departmentCode": "COMMERCE",
    "subjects": [
      "Operations Management",
      "Business Management"
    ],
    "email": "hemant.desai.t095@campus.edu",
    "room": "Faculty Wing B-295",
    "status": "Active"
  },
  {
    "id": "T096",
    "name": "Nandini Patil",
    "title": "Prof. Nandini Patil",
    "department": "Commerce",
    "departmentCode": "COMMERCE",
    "subjects": [
      "Entrepreneurship",
      "Business Communication"
    ],
    "email": "nandini.patil.t096@campus.edu",
    "room": "Faculty Wing B-296",
    "status": "Active"
  },
  {
    "id": "T097",
    "name": "Kiran Mehta",
    "title": "Prof. Kiran Mehta",
    "department": "Commerce",
    "departmentCode": "COMMERCE",
    "subjects": [
      "Financial Markets",
      "Security Analysis"
    ],
    "email": "kiran.mehta.t097@campus.edu",
    "room": "Faculty Wing B-297",
    "status": "Active"
  },
  {
    "id": "T098",
    "name": "Umesh Shah",
    "title": "Prof. Umesh Shah",
    "department": "Commerce",
    "departmentCode": "COMMERCE",
    "subjects": [
      "Risk Management",
      "Insurance"
    ],
    "email": "umesh.shah.t098@campus.edu",
    "room": "Faculty Wing B-298",
    "status": "Active"
  },
  {
    "id": "T099",
    "name": "Sheetal Kulkarni",
    "title": "Prof. Sheetal Kulkarni",
    "department": "Commerce",
    "departmentCode": "COMMERCE",
    "subjects": [
      "Economics",
      "Business Statistics"
    ],
    "email": "sheetal.kulkarni.t099@campus.edu",
    "room": "Faculty Wing B-299",
    "status": "Active"
  },
  {
    "id": "T100",
    "name": "Prakash Joshi",
    "title": "Prof. Prakash Joshi",
    "department": "Commerce",
    "departmentCode": "COMMERCE",
    "subjects": [
      "Corporate Finance",
      "Financial Markets"
    ],
    "email": "prakash.joshi.t100@campus.edu",
    "room": "Faculty Wing B-200",
    "status": "Active"
  },
  {
    "id": "T101",
    "name": "Arjun Mehta",
    "title": "Prof. Arjun Mehta",
    "department": "Management",
    "departmentCode": "MGMT",
    "subjects": [
      "Principles of Management",
      "Business Management"
    ],
    "email": "arjun.mehta.t101@campus.edu",
    "room": "Faculty Wing C-101",
    "status": "Active"
  },
  {
    "id": "T102",
    "name": "Priya Desai",
    "title": "Prof. Priya Desai",
    "department": "Management",
    "departmentCode": "MGMT",
    "subjects": [
      "Marketing Management",
      "Digital Marketing"
    ],
    "email": "priya.desai.t102@campus.edu",
    "room": "Faculty Wing C-102",
    "status": "Active"
  },
  {
    "id": "T103",
    "name": "Rahul Sharma",
    "title": "Prof. Rahul Sharma",
    "department": "Management",
    "departmentCode": "MGMT",
    "subjects": [
      "Business Communication",
      "Leadership"
    ],
    "email": "rahul.sharma.t103@campus.edu",
    "room": "Faculty Wing C-103",
    "status": "Active"
  },
  {
    "id": "T104",
    "name": "Sneha Patil",
    "title": "Prof. Sneha Patil",
    "department": "Management",
    "departmentCode": "MGMT",
    "subjects": [
      "Finance",
      "Financial Management"
    ],
    "email": "sneha.patil.t104@campus.edu",
    "room": "Faculty Wing C-104",
    "status": "Active"
  },
  {
    "id": "T105",
    "name": "Amit Joshi",
    "title": "Prof. Amit Joshi",
    "department": "Management",
    "departmentCode": "MGMT",
    "subjects": [
      "Business Analytics",
      "Business Statistics"
    ],
    "email": "amit.joshi.t105@campus.edu",
    "room": "Faculty Wing C-105",
    "status": "Active"
  },
  {
    "id": "T106",
    "name": "Priti Shah",
    "title": "Prof. Priti Shah",
    "department": "Management",
    "departmentCode": "MGMT",
    "subjects": [
      "Human Resources",
      "Organizational Behaviour"
    ],
    "email": "priti.shah.t106@campus.edu",
    "room": "Faculty Wing C-106",
    "status": "Active"
  },
  {
    "id": "T107",
    "name": "Rakesh More",
    "title": "Prof. Rakesh More",
    "department": "Management",
    "departmentCode": "MGMT",
    "subjects": [
      "Entrepreneurship",
      "Innovation"
    ],
    "email": "rakesh.more.t107@campus.edu",
    "room": "Faculty Wing C-107",
    "status": "Active"
  },
  {
    "id": "T108",
    "name": "Nisha Mehta",
    "title": "Prof. Nisha Mehta",
    "department": "Management",
    "departmentCode": "MGMT",
    "subjects": [
      "Operations Management"
    ],
    "email": "nisha.mehta.t108@campus.edu",
    "room": "Faculty Wing C-108",
    "status": "Active"
  },
  {
    "id": "T109",
    "name": "Kunal Desai",
    "title": "Prof. Kunal Desai",
    "department": "Management",
    "departmentCode": "MGMT",
    "subjects": [
      "Business Law",
      "Corporate Law"
    ],
    "email": "kunal.desai.t109@campus.edu",
    "room": "Faculty Wing C-109",
    "status": "Active"
  },
  {
    "id": "T110",
    "name": "Riya Kulkarni",
    "title": "Prof. Riya Kulkarni",
    "department": "Management",
    "departmentCode": "MGMT",
    "subjects": [
      "Digital Marketing",
      "Marketing"
    ],
    "email": "riya.kulkarni.t110@campus.edu",
    "room": "Faculty Wing C-110",
    "status": "Active"
  },
  {
    "id": "T111",
    "name": "Manav Shah",
    "title": "Prof. Manav Shah",
    "department": "Management",
    "departmentCode": "MGMT",
    "subjects": [
      "Strategic Management",
      "Business Management"
    ],
    "email": "manav.shah.t111@campus.edu",
    "room": "Faculty Wing C-111",
    "status": "Active"
  },
  {
    "id": "T112",
    "name": "Ayesha Patil",
    "title": "Prof. Ayesha Patil",
    "department": "Management",
    "departmentCode": "MGMT",
    "subjects": [
      "Human Resource Management",
      "Leadership"
    ],
    "email": "ayesha.patil.t112@campus.edu",
    "room": "Faculty Wing C-112",
    "status": "Active"
  },
  {
    "id": "T113",
    "name": "Rohit Desai",
    "title": "Prof. Rohit Desai",
    "department": "Management",
    "departmentCode": "MGMT",
    "subjects": [
      "Business Analytics",
      "Statistics"
    ],
    "email": "rohit.desai.t113@campus.edu",
    "room": "Faculty Wing C-113",
    "status": "Active"
  },
  {
    "id": "T114",
    "name": "Kavya Joshi",
    "title": "Prof. Kavya Joshi",
    "department": "Management",
    "departmentCode": "MGMT",
    "subjects": [
      "Business Communication",
      "English"
    ],
    "email": "kavya.joshi.t114@campus.edu",
    "room": "Faculty Wing C-114",
    "status": "Active"
  },
  {
    "id": "T115",
    "name": "Sandeep More",
    "title": "Prof. Sandeep More",
    "department": "Management",
    "departmentCode": "MGMT",
    "subjects": [
      "Operations Management",
      "Project Management"
    ],
    "email": "sandeep.more.t115@campus.edu",
    "room": "Faculty Wing C-115",
    "status": "Active"
  },
  {
    "id": "T116",
    "name": "Neha Shah",
    "title": "Prof. Neha Shah",
    "department": "Management",
    "departmentCode": "MGMT",
    "subjects": [
      "Finance",
      "Financial Accounting"
    ],
    "email": "neha.shah.t116@campus.edu",
    "room": "Faculty Wing C-116",
    "status": "Active"
  },
  {
    "id": "T117",
    "name": "Vivek Mehta",
    "title": "Prof. Vivek Mehta",
    "department": "Management",
    "departmentCode": "MGMT",
    "subjects": [
      "Entrepreneurship",
      "Strategic Management"
    ],
    "email": "vivek.mehta.t117@campus.edu",
    "room": "Faculty Wing C-117",
    "status": "Active"
  },
  {
    "id": "T118",
    "name": "Rohan Patil",
    "title": "Prof. Rohan Patil",
    "department": "Management",
    "departmentCode": "MGMT",
    "subjects": [
      "Digital Marketing",
      "Marketing"
    ],
    "email": "rohan.patil.t118@campus.edu",
    "room": "Faculty Wing C-118",
    "status": "Active"
  },
  {
    "id": "T119",
    "name": "Shreya Deshmukh",
    "title": "Prof. Shreya Deshmukh",
    "department": "Management",
    "departmentCode": "MGMT",
    "subjects": [
      "Human Resources",
      "Organizational Behaviour"
    ],
    "email": "shreya.deshmukh.t119@campus.edu",
    "room": "Faculty Wing C-119",
    "status": "Active"
  },
  {
    "id": "T120",
    "name": "Aditya Kulkarni",
    "title": "Prof. Aditya Kulkarni",
    "department": "Management",
    "departmentCode": "MGMT",
    "subjects": [
      "Business Law",
      "Business Communication"
    ],
    "email": "aditya.kulkarni.t120@campus.edu",
    "room": "Faculty Wing C-120",
    "status": "Active"
  },
  {
    "id": "T121",
    "name": "Kavita Desai",
    "title": "Prof. Kavita Desai",
    "department": "Arts",
    "departmentCode": "ARTS",
    "subjects": [
      "Psychology"
    ],
    "email": "kavita.desai.t121@campus.edu",
    "room": "Faculty Wing D-121",
    "status": "Active"
  },
  {
    "id": "T122",
    "name": "Anjali More",
    "title": "Prof. Anjali More",
    "department": "Arts",
    "departmentCode": "ARTS",
    "subjects": [
      "English",
      "Communication Skills"
    ],
    "email": "anjali.more.t122@campus.edu",
    "room": "Faculty Wing D-122",
    "status": "Active"
  },
  {
    "id": "T123",
    "name": "Mahesh Patil",
    "title": "Prof. Mahesh Patil",
    "department": "Arts",
    "departmentCode": "ARTS",
    "subjects": [
      "Sociology"
    ],
    "email": "mahesh.patil.t123@campus.edu",
    "room": "Faculty Wing D-123",
    "status": "Active"
  },
  {
    "id": "T124",
    "name": "Rekha Shah",
    "title": "Prof. Rekha Shah",
    "department": "Arts",
    "departmentCode": "ARTS",
    "subjects": [
      "History"
    ],
    "email": "rekha.shah.t124@campus.edu",
    "room": "Faculty Wing D-124",
    "status": "Active"
  },
  {
    "id": "T125",
    "name": "Sunil Joshi",
    "title": "Prof. Sunil Joshi",
    "department": "Arts",
    "departmentCode": "ARTS",
    "subjects": [
      "Political Science"
    ],
    "email": "sunil.joshi.t125@campus.edu",
    "room": "Faculty Wing D-125",
    "status": "Active"
  },
  {
    "id": "T126",
    "name": "Neeta Kulkarni",
    "title": "Prof. Neeta Kulkarni",
    "department": "Arts",
    "departmentCode": "ARTS",
    "subjects": [
      "Communication Skills",
      "English"
    ],
    "email": "neeta.kulkarni.t126@campus.edu",
    "room": "Faculty Wing D-126",
    "status": "Active"
  },
  {
    "id": "T127",
    "name": "Ashwini Patil",
    "title": "Prof. Ashwini Patil",
    "department": "Arts",
    "departmentCode": "ARTS",
    "subjects": [
      "Psychology",
      "Sociology"
    ],
    "email": "ashwini.patil.t127@campus.edu",
    "room": "Faculty Wing D-127",
    "status": "Active"
  },
  {
    "id": "T128",
    "name": "Rajendra More",
    "title": "Prof. Rajendra More",
    "department": "Arts",
    "departmentCode": "ARTS",
    "subjects": [
      "History",
      "Political Science"
    ],
    "email": "rajendra.more.t128@campus.edu",
    "room": "Faculty Wing D-128",
    "status": "Active"
  },
  {
    "id": "T129",
    "name": "Pooja Shah",
    "title": "Prof. Pooja Shah",
    "department": "Arts",
    "departmentCode": "ARTS",
    "subjects": [
      "English",
      "Communication Skills"
    ],
    "email": "pooja.shah.t129@campus.edu",
    "room": "Faculty Wing D-129",
    "status": "Active"
  },
  {
    "id": "T130",
    "name": "Suresh Kulkarni",
    "title": "Prof. Suresh Kulkarni",
    "department": "Arts",
    "departmentCode": "ARTS",
    "subjects": [
      "Economics"
    ],
    "email": "suresh.kulkarni.t130@campus.edu",
    "room": "Faculty Wing D-130",
    "status": "Active"
  },
  {
    "id": "T131",
    "name": "Madhavi Joshi",
    "title": "Prof. Madhavi Joshi",
    "department": "Arts",
    "departmentCode": "ARTS",
    "subjects": [
      "Psychology"
    ],
    "email": "madhavi.joshi.t131@campus.edu",
    "room": "Faculty Wing D-131",
    "status": "Active"
  },
  {
    "id": "T132",
    "name": "Pradeep Desai",
    "title": "Prof. Pradeep Desai",
    "department": "Arts",
    "departmentCode": "ARTS",
    "subjects": [
      "Sociology",
      "Political Science"
    ],
    "email": "pradeep.desai.t132@campus.edu",
    "room": "Faculty Wing D-132",
    "status": "Active"
  },
  {
    "id": "T133",
    "name": "Smita Patil",
    "title": "Prof. Smita Patil",
    "department": "Arts",
    "departmentCode": "ARTS",
    "subjects": [
      "History",
      "Sociology"
    ],
    "email": "smita.patil.t133@campus.edu",
    "room": "Faculty Wing D-133",
    "status": "Active"
  },
  {
    "id": "T134",
    "name": "Vinod Shah",
    "title": "Prof. Vinod Shah",
    "department": "Arts",
    "departmentCode": "ARTS",
    "subjects": [
      "Political Science",
      "History"
    ],
    "email": "vinod.shah.t134@campus.edu",
    "room": "Faculty Wing D-134",
    "status": "Active"
  },
  {
    "id": "T135",
    "name": "Rina More",
    "title": "Prof. Rina More",
    "department": "Arts",
    "departmentCode": "ARTS",
    "subjects": [
      "English",
      "Communication Skills"
    ],
    "email": "rina.more.t135@campus.edu",
    "room": "Faculty Wing D-135",
    "status": "Active"
  }
];

export function findTeacherByQuery(query: string): TeacherProfile | undefined {
  if (!query) return undefined;
  const q = query.trim().toLowerCase();

  // 1. Direct email match
  let found = TEACHERS_DATA.find(t => t.email.toLowerCase() === q);
  if (found) return found;

  // 2. Simplified email match without ID (e.g. "rahul.patil@campus.edu", "neha.kulkarni@campus.edu")
  found = TEACHERS_DATA.find(t => {
    const simpleEmail = t.name.toLowerCase().replace(/[^a-z0-9]/g, '.') + '@campus.edu';
    return simpleEmail === q;
  });
  if (found) return found;

  // 3. Match Teacher ID (e.g. "T001", "t001", "t082")
  found = TEACHERS_DATA.find(t => t.id.toLowerCase() === q);
  if (found) return found;

  // 4. Exact Name match or Title match (e.g. "Rahul Patil", "Prof. Rahul Patil", "Neha Kulkarni")
  found = TEACHERS_DATA.find(t => 
    t.name.toLowerCase() === q || 
    t.title.toLowerCase() === q
  );
  if (found) return found;

  // 5. Partial name match (e.g. "rahul", "neha kulkarni")
  found = TEACHERS_DATA.find(t => 
    t.name.toLowerCase().includes(q) ||
    t.title.toLowerCase().includes(q)
  );
  if (found) return found;

  // 6. Username prefix before @
  const userPrefix = q.split('@')[0];
  found = TEACHERS_DATA.find(t => {
    const tUser = t.email.toLowerCase().split('@')[0];
    const simpleUser = t.name.toLowerCase().replace(/[^a-z0-9]/g, '.');
    return tUser === userPrefix || simpleUser === userPrefix || tUser.startsWith(userPrefix);
  });

  return found;
}

export function getLecturesForTeacher(teacher: TeacherProfile) {
  const primarySub = teacher.subjects[0] || 'Core Subject';
  const secondarySub = teacher.subjects[1] || teacher.subjects[0] || 'Elective Subject';

  // Determine course based on department
  let primaryCourse = 'BSc IT';
  let secondaryCourse = 'BSc CS';
  let primaryRoom = 'Room 204';
  let labRoom = 'Computer Lab 1';

  if (teacher.department === 'Commerce') {
    primaryCourse = 'B.Com';
    secondaryCourse = 'BFM';
    primaryRoom = 'Room 101';
    labRoom = 'Room 102';
  } else if (teacher.department === 'Management') {
    primaryCourse = 'BBA';
    secondaryCourse = 'BBA';
    primaryRoom = 'Room 105';
    labRoom = 'Room 106';
  } else if (teacher.department === 'Arts') {
    primaryCourse = 'BA';
    secondaryCourse = 'BA';
    primaryRoom = 'Room 108';
    labRoom = 'Room 109';
  }

  return [
    {
      id: `lec-${teacher.id}-1`,
      time: '10:00 - 11:00',
      subject: primarySub,
      teacher: teacher.title,
      room: primaryRoom,
      department: teacher.department,
      course: primaryCourse,
      semester: 1,
      division: 'A',
      day: 'Monday',
      status: 'Scheduled' as const
    },
    {
      id: `lec-${teacher.id}-2`,
      time: '11:00 - 12:00',
      subject: primarySub,
      teacher: teacher.title,
      room: primaryRoom,
      department: teacher.department,
      course: primaryCourse,
      semester: 1,
      division: 'B',
      day: 'Monday',
      status: 'Scheduled' as const
    },
    {
      id: `lec-${teacher.id}-3`,
      time: '02:00 - 03:00',
      subject: secondarySub,
      teacher: teacher.title,
      room: 'Room 201',
      department: teacher.department,
      course: secondaryCourse,
      semester: 3,
      division: 'A',
      day: 'Monday',
      status: 'Scheduled' as const
    },
    {
      id: `lec-${teacher.id}-4`,
      time: '09:00 - 10:00',
      subject: `${primarySub} Practical / Lab`,
      teacher: teacher.title,
      room: labRoom,
      department: teacher.department,
      course: primaryCourse,
      semester: 1,
      division: 'B',
      day: 'Tuesday',
      status: 'Scheduled' as const
    },
    {
      id: `lec-${teacher.id}-5`,
      time: '01:00 - 02:00',
      subject: secondarySub,
      teacher: teacher.title,
      room: primaryRoom,
      department: teacher.department,
      course: secondaryCourse,
      semester: 3,
      division: 'B',
      day: 'Wednesday',
      status: 'Scheduled' as const
    }
  ];
}
