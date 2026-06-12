export interface Teacher {
  id: string; // e.g. T-8492
  name: string;
  avatar: string;
  specialization: string;
  classes: string[];
  email: string;
  phone: string;
  status: 'Full-time' | 'Part-time';
  active: boolean;
}

export interface Student {
  id: string; // e.g. S-2121
  name: string;
  avatar: string;
  classId: string; // e.g. 7A, 8C
  grade: 'Grade 7' | 'Grade 8' | 'Grade 9';
  gpa: number;
  performance: 'Good' | 'Needs Support' | 'At Risk';
  attendanceRate: number;
  status: 'Active' | 'On Leave' | 'Suspended';
  email: string;
}

export interface ClassRoom {
  id: string; // e.g. 7A
  grade: 'Grade 7' | 'Grade 8' | 'Grade 9';
  teacherId: string; // Teacher name/id
  room: string;
  studentCount: number;
  subjectProgress: {
    subject: string;
    progress: number;
  }[];
}

export interface AttendanceRecord {
  studentId: string;
  date: string; // YYYY-MM-DD
  status: 'P' | 'A' | 'L' | 'S'; // Present, Absent, Late, Sick
}

export const initialTeachers: Teacher[] = [
  {
    id: "T-8492",
    name: "Dr. Sarah Miller",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    specialization: "Mathematics & Physics",
    classes: ["Class 10A", "Class 12B"],
    email: "s.miller@schola.edu",
    phone: "+1 (555) 012-3456",
    status: "Full-time",
    active: true,
  },
  {
    id: "T-8501",
    name: "Marcus Chen",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    specialization: "Modern History",
    classes: ["Class 11C", "Class 9A"],
    email: "m.chen@schola.edu",
    phone: "+1 (555) 012-7890",
    status: "Part-time",
    active: true,
  },
  {
    id: "T-8422",
    name: "Elena Rossi",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150",
    specialization: "Biology & Chemistry",
    classes: ["Class 12A"],
    email: "e.rossi@schola.edu",
    phone: "+1 (555) 012-1122",
    status: "Full-time",
    active: true,
  },
  {
    id: "T-8399",
    name: "Dr. Alan Turing",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
    specialization: "Computer Science",
    classes: ["Class 11A", "Class 12C"],
    email: "a.turing@schola.edu",
    phone: "+1 (555) 012-9988",
    status: "Full-time",
    active: true,
  },
  {
    id: "T-8204",
    name: "Eleanor Vance",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
    specialization: "English Literature",
    classes: ["Class 7A"],
    email: "e.vance@schola.edu",
    phone: "+1 (555) 012-2233",
    status: "Full-time",
    active: true,
  },
  {
    id: "T-8115",
    name: "Julian Ross",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
    specialization: "World Languages",
    classes: ["Class 7B"],
    email: "j.ross@schola.edu",
    phone: "+1 (555) 012-4455",
    status: "Full-time",
    active: true,
  }
];

export const initialStudents: Student[] = [
  {
    id: "S-2121",
    name: "Michael Chen",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150",
    classId: "8C",
    grade: "Grade 8",
    gpa: 3.8,
    performance: "Good",
    attendanceRate: 95,
    status: "Active",
    email: "michael.c@schola.edu",
  },
  {
    id: "S-2122",
    name: "Emma Williams",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
    classId: "8C",
    grade: "Grade 8",
    gpa: 2.9,
    performance: "Needs Support",
    attendanceRate: 87,
    status: "Active",
    email: "emma.w@schola.edu",
  },
  {
    id: "S-2123",
    name: "Rajesh Kumar",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150",
    classId: "8C",
    grade: "Grade 8",
    gpa: 2.4,
    performance: "At Risk",
    attendanceRate: 72,
    status: "On Leave",
    email: "rajesh.k@schola.edu",
  },
  {
    id: "S-2124",
    name: "Hannah Lee",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150",
    classId: "8C",
    grade: "Grade 8",
    gpa: 3.6,
    performance: "Good",
    attendanceRate: 93,
    status: "Active",
    email: "hannah.l@schola.edu",
  },
  {
    id: "S-2125",
    name: "Isabella Rossi",
    avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150",
    classId: "8C",
    grade: "Grade 8",
    gpa: 3.9,
    performance: "Good",
    attendanceRate: 97,
    status: "Active",
    email: "isabella.r@schola.edu",
  },
  {
    id: "S-2101",
    name: "Fatima Noor",
    avatar: "https://images.unsplash.com/photo-1554151228-14d9def656e4?w=150",
    classId: "7A",
    grade: "Grade 7",
    gpa: 3.7,
    performance: "Good",
    attendanceRate: 98,
    status: "Active",
    email: "fatima.n@schola.edu",
  },
  {
    id: "S-2102",
    name: "Alicia Gomez",
    avatar: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150",
    classId: "7A",
    grade: "Grade 7",
    gpa: 3.2,
    performance: "Good",
    attendanceRate: 94,
    status: "Active",
    email: "alicia.g@schola.edu",
  },
  {
    id: "S-2103",
    name: "Daniel Park",
    avatar: "https://images.unsplash.com/photo-1500048993953-d23a436266cf?w=150",
    classId: "7B",
    grade: "Grade 7",
    gpa: 3.5,
    performance: "Good",
    attendanceRate: 96,
    status: "Active",
    email: "daniel.p@schola.edu",
  }
];

export const initialClasses: ClassRoom[] = [
  {
    id: "7A",
    grade: "Grade 7",
    teacherId: "Eleanor Vance",
    room: "Room 204",
    studentCount: 28,
    subjectProgress: [
      { subject: "Mathematics", progress: 85 },
      { subject: "Language Arts", progress: 92 },
      { subject: "World Sciences", progress: 78 }
    ]
  },
  {
    id: "7B",
    grade: "Grade 7",
    teacherId: "Julian Ross",
    room: "Room 205",
    studentCount: 30,
    subjectProgress: [
      { subject: "Mathematics", progress: 75 },
      { subject: "Language Arts", progress: 88 },
      { subject: "World Sciences", progress: 82 }
    ]
  },
  {
    id: "8C",
    grade: "Grade 8",
    teacherId: "Dr. Sarah Miller",
    room: "Room 301",
    studentCount: 24,
    subjectProgress: [
      { subject: "Mathematics", progress: 82 },
      { subject: "World Sciences", progress: 64 },
      { subject: "Language Arts", progress: 95 }
    ]
  },
  {
    id: "9A",
    grade: "Grade 9",
    teacherId: "Marcus Chen",
    room: "Room 402",
    studentCount: 32,
    subjectProgress: [
      { subject: "Mathematics", progress: 90 },
      { subject: "World Sciences", progress: 86 },
      { subject: "Language Arts", progress: 89 }
    ]
  }
];

export const initialAttendance: AttendanceRecord[] = [
  { studentId: "S-2121", date: "2025-03-24", status: "P" },
  { studentId: "S-2122", date: "2025-03-24", status: "L" },
  { studentId: "S-2123", date: "2025-03-24", status: "A" },
  { studentId: "S-2124", date: "2025-03-24", status: "P" },
  { studentId: "S-2125", date: "2025-03-24", status: "P" }
];

export const initialEvents = [
  {
    id: "1",
    title: "Faculty Meeting",
    time: "2:00 PM",
    date: "Today",
    details: "Conference Hall • Starting in 15 mins",
    type: "meeting",
  },
  {
    id: "2",
    title: "New Teacher Onboarded",
    time: "08:30 AM",
    date: "Today",
    details: "Dr. Alan Turing joined Mathematics",
    type: "onboard",
  },
  {
    id: "3",
    title: "Leave Request: Mr. Smith",
    time: "3 days",
    date: "Pending Approval",
    details: "Personal reasons",
    type: "leave",
  }
];

export const initialFinanceTransactions = [
  { id: "TX-1001", type: "Income", category: "Tuition Fees", studentName: "Michael Chen", amount: 1500, date: "2025-03-20", status: "Paid" },
  { id: "TX-1002", type: "Expense", category: "Lab Equipment", studentName: "-", amount: 450, date: "2025-03-19", status: "Cleared" },
  { id: "TX-1003", type: "Income", category: "Admission Fee", studentName: "Daniel Park", amount: 300, date: "2025-03-18", status: "Paid" },
  { id: "TX-1004", type: "Income", category: "Tuition Fees", studentName: "Emma Williams", amount: 1500, date: "2025-03-17", status: "Pending" },
  { id: "TX-1005", type: "Expense", category: "Library Books", studentName: "-", amount: 120, date: "2025-03-15", status: "Cleared" },
];

export const initialNotices = [
  {
    id: "n1",
    title: "Annual Science Fair 2025 Guidelines",
    category: "Academic",
    date: "June 04, 2026",
    content: "The annual science fair will take place next month. Registration details, template guidelines, and rubrics have been updated in the portal. All Grade 7-9 science students are encouraged to enroll.",
    author: "Dr. Sarah Miller",
    pinned: true,
  },
  {
    id: "n2",
    title: "School Closure Notification - Summer Break",
    category: "Holiday",
    date: "June 01, 2026",
    content: "Please note that the school will remain closed for summer break starting from June 15th to July 31st. Regular classes will resume on August 1st. Have a restful holiday!",
    author: "Office Administration",
    pinned: true,
  },
  {
    id: "n3",
    title: "Sports Day Tryouts Scheduled",
    category: "Sports",
    date: "May 28, 2026",
    content: "Athletics track and field tryouts are scheduled for Wednesday after school. Please contact Mr. Julian Ross for signing up and gear guidelines.",
    author: "Julian Ross",
    pinned: false,
  },
  {
    id: "n4",
    title: "Quarterly Parent-Teacher Conference",
    category: "Academic",
    date: "May 25, 2026",
    content: "The Parent-Teacher conferences are scheduled for the coming Friday. Individual appointment slots are now open on the school scheduling app.",
    author: "Admin Office",
    pinned: false,
  }
];
