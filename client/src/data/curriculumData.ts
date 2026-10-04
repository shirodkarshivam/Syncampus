// Master Academic Curriculum & Subjects (8 courses, 24 years, 144 subject allocations from college.txt)

export interface CourseYearCurriculum {
  year: 'FY' | 'SY' | 'TY';
  yearName: string;
  subjects: string[];
}

export interface CourseCurriculum {
  id: string;
  course: string;
  fullName: string;
  department: string;
  departmentCode: 'SCI_TECH' | 'COMMERCE' | 'MGMT' | 'ARTS';
  totalDivisions: number;
  years: CourseYearCurriculum[];
}

export const CURRICULUM_DATA: CourseCurriculum[] = [
  {
    "id": "bsc-it",
    "course": "BSc IT",
    "fullName": "Bachelor of Science in Information Technology",
    "department": "Science & Technology",
    "departmentCode": "SCI_TECH",
    "totalDivisions": 6,
    "years": [
      {
        "year": "FY",
        "yearName": "First Year",
        "subjects": [
          "Programming in C",
          "Database Management Systems",
          "Web Development",
          "Mathematics",
          "Computer Fundamentals",
          "Digital Electronics"
        ]
      },
      {
        "year": "SY",
        "yearName": "Second Year",
        "subjects": [
          "Data Structures",
          "Java Programming",
          "Operating Systems",
          "Computer Networks",
          "Python Programming",
          "Software Engineering"
        ]
      },
      {
        "year": "TY",
        "yearName": "Third Year",
        "subjects": [
          "Cyber Security",
          "Cloud Computing",
          "Artificial Intelligence",
          "Advanced Web Development",
          "Software Testing",
          "Project Management"
        ]
      }
    ]
  },
  {
    "id": "bsc-cs",
    "course": "BSc CS",
    "fullName": "Bachelor of Science in Computer Science",
    "department": "Science & Technology",
    "departmentCode": "SCI_TECH",
    "totalDivisions": 6,
    "years": [
      {
        "year": "FY",
        "yearName": "First Year",
        "subjects": [
          "Programming in C",
          "Computer Fundamentals",
          "Mathematics",
          "Digital Electronics",
          "Database Systems",
          "Communication Skills"
        ]
      },
      {
        "year": "SY",
        "yearName": "Second Year",
        "subjects": [
          "Data Structures",
          "Java Programming",
          "Operating Systems",
          "Computer Networks",
          "Python Programming",
          "Software Engineering"
        ]
      },
      {
        "year": "TY",
        "yearName": "Third Year",
        "subjects": [
          "Artificial Intelligence",
          "Cyber Security",
          "Cloud Computing",
          "Software Testing",
          "Advanced Algorithms",
          "Project"
        ]
      }
    ]
  },
  {
    "id": "b-com",
    "course": "B.Com",
    "fullName": "Bachelor of Commerce",
    "department": "Commerce",
    "departmentCode": "COMMERCE",
    "totalDivisions": 9,
    "years": [
      {
        "year": "FY",
        "yearName": "First Year",
        "subjects": [
          "Financial Accounting",
          "Business Economics",
          "Business Communication",
          "Business Mathematics",
          "Principles of Management",
          "Commercial Geography"
        ]
      },
      {
        "year": "SY",
        "yearName": "Second Year",
        "subjects": [
          "Corporate Accounting",
          "Cost Accounting",
          "Business Law",
          "Marketing Management",
          "Business Statistics",
          "Banking"
        ]
      },
      {
        "year": "TY",
        "yearName": "Third Year",
        "subjects": [
          "Advanced Accounting",
          "Taxation",
          "Auditing",
          "Financial Management",
          "Economics",
          "Business Management"
        ]
      }
    ]
  },
  {
    "id": "bfm",
    "course": "BFM",
    "fullName": "Bachelor of Financial Markets",
    "department": "Commerce",
    "departmentCode": "COMMERCE",
    "totalDivisions": 6,
    "years": [
      {
        "year": "FY",
        "yearName": "First Year",
        "subjects": [
          "Financial Accounting",
          "Economics",
          "Financial Markets",
          "Business Mathematics",
          "Business Communication",
          "Introduction to Finance"
        ]
      },
      {
        "year": "SY",
        "yearName": "Second Year",
        "subjects": [
          "Corporate Finance",
          "Investment Analysis",
          "Security Analysis",
          "Financial Management",
          "Statistics",
          "Banking"
        ]
      },
      {
        "year": "TY",
        "yearName": "Third Year",
        "subjects": [
          "Portfolio Management",
          "Derivatives",
          "Risk Management",
          "International Finance",
          "Financial Modelling",
          "Wealth Management"
        ]
      }
    ]
  },
  {
    "id": "bms",
    "course": "BMS",
    "fullName": "Bachelor of Management Studies",
    "department": "Commerce",
    "departmentCode": "COMMERCE",
    "totalDivisions": 6,
    "years": [
      {
        "year": "FY",
        "yearName": "First Year",
        "subjects": [
          "Principles of Management",
          "Business Communication",
          "Business Economics",
          "Business Mathematics",
          "Financial Accounting",
          "Introduction to Management"
        ]
      },
      {
        "year": "SY",
        "yearName": "Second Year",
        "subjects": [
          "Marketing Management",
          "Human Resource Management",
          "Business Law",
          "Operations Management",
          "Business Statistics",
          "Organizational Behaviour"
        ]
      },
      {
        "year": "TY",
        "yearName": "Third Year",
        "subjects": [
          "Strategic Management",
          "Project Management",
          "Entrepreneurship",
          "International Business",
          "Leadership & Management",
          "Business Research"
        ]
      }
    ]
  },
  {
    "id": "bbi",
    "course": "BBI",
    "fullName": "Bachelor of Banking & Insurance",
    "department": "Commerce",
    "departmentCode": "COMMERCE",
    "totalDivisions": 6,
    "years": [
      {
        "year": "FY",
        "yearName": "First Year",
        "subjects": [
          "Financial Accounting",
          "Banking Fundamentals",
          "Business Economics",
          "Business Communication",
          "Business Mathematics",
          "Introduction to Insurance"
        ]
      },
      {
        "year": "SY",
        "yearName": "Second Year",
        "subjects": [
          "Banking Operations",
          "Insurance Management",
          "Financial Management",
          "Business Law",
          "Risk Management",
          "Statistics"
        ]
      },
      {
        "year": "TY",
        "yearName": "Third Year",
        "subjects": [
          "Investment Management",
          "Life Insurance",
          "General Insurance",
          "Banking Technology",
          "Financial Services",
          "Risk & Compliance"
        ]
      }
    ]
  },
  {
    "id": "bba",
    "course": "BBA",
    "fullName": "Bachelor of Business Administration",
    "department": "Management",
    "departmentCode": "MGMT",
    "totalDivisions": 6,
    "years": [
      {
        "year": "FY",
        "yearName": "First Year",
        "subjects": [
          "Principles of Management",
          "Business Communication",
          "Business Economics",
          "Financial Accounting",
          "Business Mathematics",
          "Fundamentals of Marketing"
        ]
      },
      {
        "year": "SY",
        "yearName": "Second Year",
        "subjects": [
          "Marketing Management",
          "Human Resource Management",
          "Operations Management",
          "Business Law",
          "Business Statistics",
          "Organizational Behaviour"
        ]
      },
      {
        "year": "TY",
        "yearName": "Third Year",
        "subjects": [
          "Strategic Management",
          "Entrepreneurship",
          "Business Analytics",
          "Digital Marketing",
          "International Business",
          "Project Management"
        ]
      }
    ]
  },
  {
    "id": "ba",
    "course": "BA",
    "fullName": "Bachelor of Arts",
    "department": "Arts",
    "departmentCode": "ARTS",
    "totalDivisions": 6,
    "years": [
      {
        "year": "FY",
        "yearName": "First Year",
        "subjects": [
          "English",
          "Economics",
          "Psychology",
          "Sociology",
          "History",
          "Political Science"
        ]
      },
      {
        "year": "SY",
        "yearName": "Second Year",
        "subjects": [
          "English",
          "Economics",
          "Psychology",
          "Sociology",
          "History",
          "Political Science"
        ]
      },
      {
        "year": "TY",
        "yearName": "Third Year",
        "subjects": [
          "English",
          "Economics",
          "Psychology",
          "Sociology",
          "History",
          "Political Science"
        ]
      }
    ]
  }
];
