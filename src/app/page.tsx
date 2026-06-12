"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  CalendarDays,
  DollarSign,
  ClipboardCheck,
  Megaphone,
  Bell,
  Settings,
  Search,
  Plus,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  LogOut,
  Filter,
  SlidersHorizontal,
  Eye,
  Trash2,
  Mail,
  Phone,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  FileText,
  Check,
} from "lucide-react";

import {
  initialTeachers,
  initialStudents,
  initialClasses,
  initialAttendance,
  initialEvents,
  initialFinanceTransactions,
  initialNotices,
  Teacher,
  Student,
  ClassRoom,
  AttendanceRecord,
} from "./data";

import {
  isSupabaseConfigured,
  dbGetTeachers, dbAddTeacher, dbDeleteTeacher,
  dbGetStudents, dbAddStudent, dbUpdateStudent, dbDeleteStudent,
  dbGetClasses, dbAddClass, dbUpdateClass,
  dbGetAttendance, dbSaveAttendance,
  dbGetEvents, dbAddEvent,
  dbGetTransactions, dbAddTransaction,
  dbGetNotices, dbAddNotice, dbDeleteNotice,
  dbGetUserProfile,
  supabase,
} from "../lib/supabase";

export default function App() {
  const [activePage, setActivePage] = useState<string>("dashboard");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [events, setEvents] = useState<typeof initialEvents>([]);
  const [financeTransactions, setFinanceTransactions] = useState<typeof initialFinanceTransactions>([]);
  const [notices, setNotices] = useState<typeof initialNotices>([]);

  const [userRole, setUserRole] = useState<string>("admin");
  const [permissions, setPermissions] = useState<string[]>([
    "view_dashboard",
    "manage_teachers",
    "manage_students",
    "manage_classes",
    "manage_attendance",
    "manage_finance",
    "manage_noticeboard",
    "view_students",
    "view_classes",
    "view_attendance",
    "view_noticeboard"
  ]);
  const [userName, setUserName] = useState<string>("Oscar Hansen");

  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const [teacherSpecFilter, setTeacherSpecFilter] = useState<string>("All");
  const [teacherStatusFilter, setTeacherStatusFilter] = useState<string>("All");
  const [studentGradeFilter, setStudentGradeFilter] = useState<string>("All");
  const [studentStatusFilter, setStudentStatusFilter] = useState<string>("All");
  const [classGradeFilter, setClassGradeFilter] = useState<string>("All");
  const [noticeCategoryFilter, setNoticeCategoryFilter] = useState<string>("All");

  const [teacherPage, setTeacherPage] = useState<number>(1);
  const [studentPage, setStudentPage] = useState<number>(1);

  const [newTeacherForm, setNewTeacherForm] = useState({
    name: "",
    specialization: "Mathematics & Physics",
    email: "",
    phone: "",
    status: "Full-time" as "Full-time" | "Part-time",
    classes: ""
  });

  const [newStudentForm, setNewStudentForm] = useState({
    name: "",
    classId: "8C",
    grade: "Grade 8" as "Grade 7" | "Grade 8" | "Grade 9",
    gpa: 3.5,
    attendanceRate: 95,
    status: "Active" as "Active" | "On Leave" | "Suspended",
    email: "",
  });

  const [newClassForm, setNewClassForm] = useState({
    id: "",
    grade: "Grade 8" as "Grade 7" | "Grade 8" | "Grade 9",
    teacherName: "Dr. Sarah Miller",
    room: "",
  });

  const [newNoticeForm, setNewNoticeForm] = useState({
    title: "",
    category: "Academic",
    content: "",
    author: "Oscar Hansen",
    pinned: false,
  });

  const [newTransactionForm, setNewTransactionForm] = useState({
    type: "Income" as "Income" | "Expense",
    category: "Tuition Fees",
    studentName: "",
    amount: 0,
    status: "Paid",
  });

  const [attendanceDate, setAttendanceDate] = useState<string>("2025-03-24");
  const [selectedAttendanceClass, setSelectedAttendanceClass] = useState<string>("8C");
  const [tempMarks, setTempMarks] = useState<Record<string, 'P' | 'A' | 'L' | 'S'>>({
    "S-2121": "P",
    "S-2122": "L",
    "S-2123": "A",
    "S-2124": "P",
    "S-2125": "P",
  });

  const [expandedClasses, setExpandedClasses] = useState<Record<string, boolean>>({
    "7A": true,
    "8C": true,
  });

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setDbError(null);
      
      if (isSupabaseConfigured()) {
        try {
          if (supabase) {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
              window.location.href = '/login';
              return;
            }
            const profile = await dbGetUserProfile(session.user.id);
            if (profile) {
              setUserRole(profile.role);
              setPermissions(profile.permissions);
              setUserName(profile.fullName);
            }
          }

          const [t, s, c, a, ev, tx, n] = await Promise.all([
            dbGetTeachers(),
            dbGetStudents(),
            dbGetClasses(),
            dbGetAttendance(),
            dbGetEvents(),
            dbGetTransactions(),
            dbGetNotices(),
          ]);
          setTeachers(t);
          setStudents(s);
          setClasses(c);
          setAttendance(a);
          setEvents(ev);
          setFinanceTransactions(tx);
          setNotices(n);
        } catch (err: any) {
          console.error('Supabase load error:', err.message || err);
          setDbError('Failed to load data from database. Showing mock data.');
          setTeachers(initialTeachers);
          setStudents(initialStudents);
          setClasses(initialClasses);
          setAttendance(initialAttendance);
          setEvents(initialEvents);
          setFinanceTransactions(initialFinanceTransactions);
          setNotices(initialNotices);
        }
      } else {
        setTeachers(initialTeachers);
        setStudents(initialStudents);
        setClasses(initialClasses);
        setAttendance(initialAttendance);
        setEvents(initialEvents);
        setFinanceTransactions(initialFinanceTransactions);
        setNotices(initialNotices);
      }
      setIsLoading(false);
    };
    loadData();
  }, []);

  // Protect routes based on role/permissions
  useEffect(() => {
    if (activePage === "finance" && !permissions.includes("manage_finance") && userRole !== "admin") {
      setActivePage("dashboard");
    }
    if (activePage === "teachers" && !permissions.includes("manage_teachers") && userRole !== "admin") {
      setActivePage("dashboard");
    }
  }, [activePage, permissions, userRole]);

  const handleLogout = async () => {
    if (isSupabaseConfigured() && supabase) {
      await supabase.auth.signOut();
    }
    window.location.href = '/login';
  };

  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => {
      setSuccessToast(null);
    }, 4000);
  };

  const stats = useMemo(() => {
    const totalStudents = students.length;
    const totalTeachers = teachers.length;
    const activeClasses = classes.length;
    const avgAttendance = Math.round(
      students.reduce((acc, s) => acc + s.attendanceRate, 0) / (students.length || 1)
    );
    const onActiveDuty = teachers.filter(t => t.active).length;
    return {
      totalStudents, totalTeachers, activeClasses, avgAttendance,
      onActiveDuty, onLeaveTeachers: 4, applications: 26,
      g7Count: students.filter(s => s.grade === "Grade 7").length,
      g8Count: students.filter(s => s.grade === "Grade 8").length,
      g9Count: students.filter(s => s.grade === "Grade 9").length,
    };
  }, [students, teachers, classes]);

  const handleHireTeacherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacherForm.name || !newTeacherForm.email) return;
    const newTeacher: Teacher = {
      id: `T-${Math.floor(1000 + Math.random() * 9000)}`,
      name: newTeacherForm.name,
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
      specialization: newTeacherForm.specialization,
      classes: newTeacherForm.classes ? newTeacherForm.classes.split(",").map(c => c.trim()) : ["General"],
      email: newTeacherForm.email,
      phone: newTeacherForm.phone || "+1 (555) 012-9999",
      status: newTeacherForm.status,
      active: true,
    };
    const newLogEvent = {
      id: String(events.length + 1),
      title: "New Teacher Onboarded",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: "Today",
      details: `${newTeacher.name} joined ${newTeacher.specialization}`,
      type: "onboard"
    };

    if (isSupabaseConfigured()) {
      try {
        await dbAddTeacher(newTeacher);
        await dbAddEvent(newLogEvent);
      } catch (err: any) {
        console.error(err);
        alert("Database Error: " + (err.message || "Unknown error"));
        return;
      }
    }
    setTeachers([newTeacher, ...teachers]);
    setActiveModal(null);
    setNewTeacherForm({ name: "", specialization: "Mathematics & Physics", email: "", phone: "", status: "Full-time", classes: "" });
    setEvents([newLogEvent, ...events]);
    triggerToast(`Successfully registered faculty member ${newTeacher.name}!`);
  };

  const handleAddStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentForm.name || !newStudentForm.email) return;
    const newStudent: Student = {
      id: `S-${Math.floor(2000 + Math.random() * 8000)}`,
      name: newStudentForm.name,
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150",
      classId: newStudentForm.classId,
      grade: newStudentForm.grade,
      gpa: Number(newStudentForm.gpa),
      performance: newStudentForm.gpa >= 3.5 ? "Good" : newStudentForm.gpa >= 2.8 ? "Needs Support" : "At Risk",
      attendanceRate: Number(newStudentForm.attendanceRate),
      status: newStudentForm.status,
      email: newStudentForm.email,
    };
    const updatedClasses = classes.map(c =>
      c.id === newStudent.classId ? { ...c, studentCount: c.studentCount + 1 } : c
    );
    if (isSupabaseConfigured()) {
      try {
        await dbAddStudent(newStudent);
        const updatedClass = updatedClasses.find(c => c.id === newStudent.classId);
        if (updatedClass) {
          await dbUpdateClass(updatedClass);
        }
      } catch (err: any) {
        console.error(err);
        alert("Database Error: " + (err.message || "Unknown error"));
        return;
      }
    }
    setStudents([newStudent, ...students]);
    setClasses(updatedClasses);
    setActiveModal(null);
    setNewStudentForm({ name: "", classId: "8C", grade: "Grade 8", gpa: 3.5, attendanceRate: 95, status: "Active", email: "" });
    triggerToast(`Successfully enrolled student ${newStudent.name}!`);
  };

  const handleCreateClassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassForm.id || !newClassForm.room) return;
    const newClass: ClassRoom = {
      id: newClassForm.id.toUpperCase(),
      grade: newClassForm.grade,
      teacherId: newClassForm.teacherName,
      room: newClassForm.room,
      studentCount: 0,
      subjectProgress: [
        { subject: "Mathematics", progress: 0 },
        { subject: "World Sciences", progress: 0 },
        { subject: "Language Arts", progress: 0 }
      ]
    };
    if (isSupabaseConfigured()) {
      try {
        await dbAddClass(newClass);
      } catch (err: any) {
        console.error("Database Error creating class:", err);
        alert("Database Error: " + (err.message || "Could not create class section (check if it already exists)"));
        return;
      }
    }
    setClasses([...classes, newClass]);
    setActiveModal(null);
    setNewClassForm({ id: "", grade: "Grade 8", teacherName: "Dr. Sarah Miller", room: "" });
    triggerToast(`Successfully created class ${newClass.id}!`);
  };

  const handlePostNoticeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoticeForm.title || !newNoticeForm.content) return;
    const newNotice = {
      id: `n${notices.length + 1}`,
      title: newNoticeForm.title,
      category: newNoticeForm.category,
      date: new Date().toLocaleDateString("en-US", { month: 'short', day: '2-digit', year: 'numeric' }),
      content: newNoticeForm.content,
      author: newNoticeForm.author,
      pinned: newNoticeForm.pinned
    };
    if (isSupabaseConfigured()) {
      try {
        await dbAddNotice(newNotice);
      } catch (err: any) {
        console.error("Database Error posting notice:", err);
        alert("Database Error: " + (err.message || "Could not broadcast notice"));
        return;
      }
    }
    setNotices([newNotice, ...notices]);
    setActiveModal(null);
    setNewNoticeForm({ title: "", category: "Academic", content: "", author: "Oscar Hansen", pinned: false });
    triggerToast("Announced new notice on the board!");
  };

  const handleAddTransactionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTransactionForm.amount <= 0) return;
    const newTx = {
      id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
      type: newTransactionForm.type,
      category: newTransactionForm.category,
      studentName: newTransactionForm.studentName || "-",
      amount: Number(newTransactionForm.amount),
      date: new Date().toISOString().split('T')[0],
      status: newTransactionForm.status,
    };
    if (isSupabaseConfigured()) {
      try {
        await dbAddTransaction(newTx);
      } catch (err: any) {
        console.error("Database Error logging transaction:", err);
        alert("Database Error: " + (err.message || "Could not record transaction"));
        return;
      }
    }
    setFinanceTransactions([newTx, ...financeTransactions]);
    setActiveModal(null);
    setNewTransactionForm({ type: "Income", category: "Tuition Fees", studentName: "", amount: 0, status: "Paid" });
    triggerToast(`Added ${newTx.type} transaction of $${newTx.amount}`);
  };

  const handleRemoveTeacher = async (id: string) => {
    const teacher = teachers.find(t => t.id === id);
    if (confirm(`Are you sure you want to remove teacher ${teacher?.name}?`)) {
      if (isSupabaseConfigured()) { try { await dbDeleteTeacher(id); } catch (err) { console.error(err); } }
      setTeachers(teachers.filter(t => t.id !== id));
      triggerToast(`Removed ${teacher?.name} from staff list.`);
    }
  };

  const handleRemoveStudent = async (id: string) => {
    const student = students.find(s => s.id === id);
    if (confirm(`Are you sure you want to remove student ${student?.name}?`)) {
      if (isSupabaseConfigured()) { try { await dbDeleteStudent(id); } catch (err) { console.error(err); } }
      setStudents(students.filter(s => s.id !== id));
      triggerToast(`Removed student ${student?.name}.`);
    }
  };

  return (
    <div className="flex h-screen bg-[#F4F6FC] font-sans overflow-hidden text-slate-800 antialiased">
      
      {/* SUCCESS TOAST */}
      {successToast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 bg-emerald-600 text-white px-5 py-4 rounded-xl shadow-2xl toast-enter">
          <CheckCircle className="w-6 h-6" />
          <div>
            <p className="font-semibold">Action Complete</p>
            <p className="text-sm opacity-90">{successToast}</p>
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden" onClick={() => setSidebarOpen(false)}></div>
      )}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-300 transform md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-20 border-b border-slate-100 flex items-center px-6 gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-none">Schola</h1>
            <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider">Admin Management</span>
          </div>
          <button className="md:hidden ml-auto p-1.5 rounded-lg hover:bg-slate-100 text-slate-500" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {[
            { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, perm: "view_dashboard" },
            { id: "teachers", label: "Teachers", icon: Users, perm: "manage_teachers" },
            { id: "students", label: "Students", icon: GraduationCap, perm: "view_students" },
            { id: "classes", label: "Classes", icon: FileText, perm: "view_classes" },
            { id: "attendance", label: "Attendance", icon: ClipboardCheck, perm: "view_attendance" },
            { id: "finance", label: "Finance", icon: DollarSign, perm: "manage_finance" },
            { id: "noticeboard", label: "Notice Board", icon: Megaphone, perm: "view_noticeboard" },
          ].filter(item => {
            if (userRole === "admin") return true;
            return permissions.includes(item.perm);
          }).map((item) => {
            const IconComp = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActivePage(item.id); setSearchQuery(""); }}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${isActive ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25" : "text-slate-600 hover:bg-slate-100/75 hover:text-slate-900"}`}
              >
                <IconComp className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-400"}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="bg-indigo-50/70 border border-indigo-100/50 rounded-2xl p-4 mb-3 relative overflow-hidden">
            <div className="absolute -right-3 -bottom-3 w-16 h-16 bg-indigo-500/10 rounded-full blur-lg"></div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <span className="text-xs font-bold text-indigo-950">New Tools Available</span>
            </div>
            <p className="text-[11px] text-indigo-700 leading-relaxed mb-3">Smarter updates for easier school management. Check classroom performance levels.</p>
            <button className="w-full py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors" onClick={() => triggerToast("Version 2.4 update release logs downloaded!")}>
              See Updates
            </button>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50/75 transition-colors">
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN LAYOUT */}
      <div className="flex-1 flex flex-col md:pl-64 overflow-hidden">
        
        {/* Topbar */}
        <header className="h-20 bg-white border-b border-slate-200/80 flex items-center justify-between px-6 md:px-8 shrink-0">
          <div className="flex items-center gap-4 flex-1 max-w-lg">
            <button className="md:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-500" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search students, teachers, or files..."
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-100/60 border border-transparent focus:bg-white focus:border-indigo-600/30 rounded-xl outline-none transition-all placeholder:text-slate-400 text-slate-800"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-slate-200">
                  <X className="w-3 h-3 text-slate-500" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button onClick={() => setNotificationsOpen(!notificationsOpen)} className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-indigo-600 border-2 border-white rounded-full"></span>
              </button>
              {notificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-4 animate-fade-in">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                    <h4 className="font-bold text-slate-900 text-sm">Notifications</h4>
                    <button onClick={() => setNotificationsOpen(false)} className="text-xs text-indigo-600 font-semibold hover:underline">Clear all</button>
                  </div>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {events.map(ev => (
                      <div key={ev.id} className="flex gap-2.5 text-xs text-slate-700 hover:bg-slate-50 p-1.5 rounded-lg">
                        <div className="w-2 h-2 mt-1.5 rounded-full bg-indigo-600 shrink-0"></div>
                        <div>
                          <p className="font-semibold text-slate-900">{ev.title}</p>
                          <p className="text-slate-500 text-[10px]">{ev.details}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors">
              <Settings className="w-5 h-5" />
            </button>
            <div className="w-px h-8 bg-slate-200"></div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white font-bold flex items-center justify-center text-sm shadow-md shadow-indigo-600/10">
                {userName.split(" ").map(n => n[0]).join("").toUpperCase()}
              </div>
              <div className="hidden sm:block leading-none">
                <p className="text-sm font-bold text-slate-900 leading-none">{userName}</p>
                <span className="text-[10.5px] text-slate-400 font-semibold capitalize">{userRole}</span>
              </div>
            </div>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {isLoading ? (
            <div className="space-y-6 animate-pulse-slow">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-white border border-slate-200/80 rounded-2xl p-5">
                    <div className="skeleton h-3 w-24 mb-3"></div>
                    <div className="skeleton h-8 w-16 mb-3"></div>
                    <div className="skeleton h-2 w-32"></div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6">
                  <div className="skeleton h-6 w-48 mb-5"></div>
                  <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="skeleton h-12 w-full"></div>)}</div>
                </div>
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6">
                  <div className="skeleton h-6 w-32 mb-4"></div>
                  <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="skeleton h-16 w-full"></div>)}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="page-transition">

              {/* DASHBOARD */}
              {activePage === "dashboard" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {[
                      { label: "Total Students", value: stats.totalStudents, change: "+4% from last term", sub: "G7-G9 enrolled", icon: GraduationCap, color: "text-indigo-600 bg-indigo-50 border-indigo-100/50" },
                      { label: "Faculty Members", value: stats.totalTeachers, change: `${stats.onActiveDuty} Active Duty`, sub: "4 On Leave", icon: Users, color: "text-emerald-600 bg-emerald-50 border-emerald-100/50" },
                      { label: "Active Classes", value: stats.activeClasses, change: "Fully Staffed", sub: "Grade 7 to 9 Sections", icon: FileText, color: "text-violet-600 bg-violet-50 border-violet-100/50" },
                      { label: "Avg Attendance", value: `${stats.avgAttendance}%`, change: "Last 30 Days", sub: "Daily Tracker Rate", icon: ClipboardCheck, color: "text-rose-600 bg-rose-50 border-rose-100/50" },
                    ].map((stat, idx) => {
                      const IconComp = stat.icon;
                      return (
                        <div key={idx} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</span>
                              <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{stat.value}</h3>
                            </div>
                            <div className={`p-2.5 rounded-xl border ${stat.color}`}>
                              <IconComp className="w-5 h-5" />
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs">
                            <span className="font-semibold text-slate-900">{stat.change}</span>
                            <span className="text-slate-400">•</span>
                            <span className="text-slate-400">{stat.sub}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
                      <h4 className="font-bold text-slate-900 text-lg mb-5">Departmental Distribution</h4>
                      <div className="space-y-4">
                        {[
                          { name: "Science & Mathematics", count: 42, color: "bg-indigo-600" },
                          { name: "Languages & Literature", count: 31, color: "bg-indigo-600" },
                          { name: "Social Sciences", count: 28, color: "bg-indigo-600" },
                          { name: "Physical Education", count: 15, color: "bg-teal-500" },
                        ].map((dep, idx) => {
                          const pct = Math.round((dep.count / 116) * 100);
                          return (
                            <div key={idx} className="space-y-1">
                              <div className="flex justify-between text-xs font-semibold">
                                <span className="text-slate-800">{dep.name}</span>
                                <span className="text-slate-500">{dep.count} Teachers</span>
                              </div>
                              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className={`h-full ${dep.color} rounded-full`} style={{ width: `${pct}%` }}></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-bold text-slate-900 text-lg">Staff Updates</h4>
                          <button className="text-xs font-bold text-indigo-600 hover:underline" onClick={() => setActivePage("noticeboard")}>View All Events</button>
                        </div>
                        <div className="space-y-3.5">
                          {events.map((ev) => (
                            <div key={ev.id} className="p-3 border border-slate-100 rounded-xl hover:border-slate-200 transition-all flex gap-3">
                              <div className="mt-0.5">
                                {ev.type === "meeting" && <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full"></div>}
                                {ev.type === "onboard" && <div className="w-2.5 h-2.5 bg-emerald-600 rounded-full"></div>}
                                {ev.type === "leave" && <div className="w-2.5 h-2.5 bg-amber-600 rounded-full"></div>}
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between items-start gap-1">
                                  <p className="text-xs font-bold text-slate-900">{ev.title}</p>
                                  <span className="text-[10px] text-slate-400">{ev.time}</span>
                                </div>
                                <p className="text-[11px] text-slate-500 mt-0.5">{ev.details}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TEACHERS */}
              {activePage === "teachers" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: "Total Faculty", value: teachers.length, sub: "Registered teachers" },
                      { label: "On Active Duty", value: teachers.filter(t => t.active).length, sub: "Teaching schedules live" },
                      { label: "On Leave", value: 4, sub: "Approved leaves" },
                      { label: "Applications", value: 26, sub: "Awaiting interviews" }
                    ].map((c, i) => (
                      <div key={i} className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">{c.label}</span>
                        <h4 className="text-2xl font-extrabold text-slate-900 mt-1">{c.value}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">{c.sub}</p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm">
                    <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg">Teacher Directory</h3>
                        <p className="text-xs text-slate-400">Manage school faculty members, assignments, and contact cards.</p>
                      </div>
                      {permissions.includes('manage_teachers') && (
                        <button onClick={() => setActiveModal("hire-teacher")} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-indigo-600/10 transition-all cursor-pointer">
                          <Plus className="w-4 h-4" />
                          Hire Teacher
                        </button>
                      )}
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50/50 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            <th className="py-3.5 px-6">Teacher Name</th>
                            <th className="py-3.5 px-6">Specialization</th>
                            <th className="py-3.5 px-6">Assigned Classes</th>
                            <th className="py-3.5 px-6">Contact</th>
                            <th className="py-3.5 px-6">Status</th>
                            <th className="py-3.5 px-6 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                          {teachers.map((teacher) => (
                            <tr key={teacher.id} className="hover:bg-indigo-50/30 transition-colors duration-200">
                              <td className="py-4 px-6 flex items-center gap-3">
                                <img src={teacher.avatar} alt={teacher.name} className="w-10 h-10 rounded-xl object-cover border border-slate-200" />
                                <div>
                                  <p className="font-bold text-slate-900 text-sm">{teacher.name}</p>
                                  <span className="text-[10px] text-slate-400">Faculty ID: {teacher.id}</span>
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-semibold">{teacher.specialization}</span>
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex gap-1.5 flex-wrap">
                                  {teacher.classes.map((c, idx) => (
                                    <span key={idx} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold">{c}</span>
                                  ))}
                                </div>
                              </td>
                              <td className="py-4 px-6 leading-relaxed">
                                <div className="flex items-center gap-1.5 text-slate-500">
                                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                                  <span>{teacher.email}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-slate-500 mt-1">
                                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                                  <span>{teacher.phone}</span>
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${teacher.status === 'Full-time' ? 'bg-emerald-50 text-emerald-700' : 'bg-indigo-50 text-indigo-700'}`}>
                                  {teacher.status}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-right">
                                <button onClick={() => handleRemoveTeacher(teacher.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* STUDENTS */}
              {activePage === "students" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: "Total Students", value: students.length, pct: "+4%" },
                      { label: "Grade 7", value: stats.g7Count, pct: "Lower Secondary" },
                      { label: "Grade 8", value: stats.g8Count, pct: "Middle Secondary" },
                      { label: "Grade 9", value: stats.g9Count, pct: "Senior High Prep" }
                    ].map((stat, i) => (
                      <div key={i} className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm flex items-center justify-between hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                        <div>
                          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">{stat.label}</span>
                          <h4 className="text-2xl font-extrabold text-slate-900 mt-1">{stat.value}</h4>
                        </div>
                        <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md">{stat.pct}</span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm">
                    <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg">Students List</h3>
                        <p className="text-xs text-slate-400">Add, view, and monitor enrolled student records.</p>
                      </div>
                      <button onClick={() => setActiveModal("add-student")} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-indigo-600/10 transition-all cursor-pointer">
                        <Plus className="w-4 h-4" />
                        Add Student
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50/50 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            <th className="py-3.5 px-6">Student</th>
                            <th className="py-3.5 px-6">Class</th>
                            <th className="py-3.5 px-6">GPA</th>
                            <th className="py-3.5 px-6">Performance</th>
                            <th className="py-3.5 px-6">Attendance</th>
                            <th className="py-3.5 px-6">Status</th>
                            <th className="py-3.5 px-6 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                          {students.map((student) => (
                            <tr key={student.id} className="hover:bg-indigo-50/30 transition-colors duration-200">
                              <td className="py-4 px-6 flex items-center gap-3">
                                <img src={student.avatar} alt={student.name} className="w-10 h-10 rounded-xl object-cover border border-slate-200" />
                                <div>
                                  <p className="font-bold text-slate-900 text-sm">{student.name}</p>
                                  <span className="text-[10px] text-slate-400">ID: {student.id}</span>
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <span className="font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg">{student.classId}</span>
                              </td>
                              <td className="py-4 px-6 font-bold text-slate-900">{student.gpa}</td>
                              <td className="py-4 px-6">
                                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded font-bold text-[10px] ${
                                  student.performance === 'Good' ? 'bg-emerald-50 text-emerald-700' : student.performance === 'Needs Support' ? 'bg-indigo-50 text-indigo-700' : 'bg-rose-50 text-rose-700'
                                }`}>
                                  {student.performance}
                                </span>
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-2">
                                  <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full ${student.attendanceRate > 90 ? 'bg-emerald-600' : student.attendanceRate > 80 ? 'bg-indigo-600' : 'bg-rose-600'}`} style={{ width: `${student.attendanceRate}%` }}></div>
                                  </div>
                                  <span className="font-bold text-slate-700">{student.attendanceRate}%</span>
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${student.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : student.status === 'On Leave' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'}`}>
                                  {student.status}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-right">
                                <button onClick={() => handleRemoveStudent(student.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* CLASSES */}
              {activePage === "classes" && (
                <div className="space-y-6">
                  <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm">
                    <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg">Classes List</h3>
                        <p className="text-xs text-slate-400">Manage class sections and subjects.</p>
                      </div>
                      <button onClick={() => setActiveModal("add-class")} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer">
                        <Plus className="w-4 h-4" />
                        Add Section
                      </button>
                    </div>
                    <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {classes.map(c => (
                        <div key={c.id} className="border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="font-extrabold text-slate-900 text-xl">{c.id}</h4>
                              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{c.grade}</span>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">Students</p>
                              <span className="text-lg font-bold text-slate-700">{c.studentCount}</span>
                            </div>
                          </div>
                          <div className="mb-4">
                            <p className="text-xs text-slate-500 font-semibold mb-1">Teacher</p>
                            <p className="text-sm text-slate-800 font-bold">{c.teacherId}</p>
                            <p className="text-xs text-slate-500 font-semibold mt-2 mb-1">Room</p>
                            <p className="text-sm text-slate-800 font-bold">{c.room}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-2">Subject Progress</p>
                            <div className="space-y-2">
                              {c.subjectProgress.map((sp, idx) => (
                                <div key={idx} className="space-y-1">
                                  <div className="flex justify-between text-[10px] font-bold text-slate-600">
                                    <span>{sp.subject}</span>
                                    <span>{sp.progress}%</span>
                                  </div>
                                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${sp.progress}%` }}></div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ATTENDANCE */}
              {activePage === "attendance" && (
                <div className="space-y-6">
                  <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg">Daily Attendance Tracker</h3>
                        <p className="text-xs text-slate-400">Record attendance for the selected date and class.</p>
                      </div>
                      <div className="flex gap-3">
                        <select 
                          className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2 outline-none font-semibold"
                          value={selectedAttendanceClass}
                          onChange={(e) => setSelectedAttendanceClass(e.target.value)}
                        >
                          {classes.map(c => <option key={c.id} value={c.id}>{c.id} ({c.grade})</option>)}
                        </select>
                        <input 
                          type="date" 
                          className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2 outline-none font-semibold"
                          value={attendanceDate}
                          onChange={(e) => setAttendanceDate(e.target.value)}
                        />
                        <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors shadow-sm" onClick={() => triggerToast('Attendance saved successfully for ' + selectedAttendanceClass)}>
                          Save Records
                        </button>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-white border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            <th className="py-3 px-6">Student</th>
                            <th className="py-3 px-6 text-center">Present</th>
                            <th className="py-3 px-6 text-center">Absent</th>
                            <th className="py-3 px-6 text-center">Late</th>
                            <th className="py-3 px-6 text-center">Sick</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700 bg-white">
                          {students.filter(s => s.classId === selectedAttendanceClass).map((student) => {
                            const currentMark = tempMarks[student.id] || 'P';
                            return (
                              <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="py-3 px-6 flex items-center gap-3">
                                  <img src={student.avatar} alt={student.name} className="w-8 h-8 rounded-lg object-cover" />
                                  <span className="font-bold">{student.name}</span>
                                </td>
                                {['P', 'A', 'L', 'S'].map((status) => (
                                  <td key={status} className="py-3 px-6 text-center">
                                    <button 
                                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mx-auto text-xs font-bold transition-all ${
                                        currentMark === status 
                                          ? (status === 'P' ? 'bg-emerald-500 border-emerald-500 text-white' : 
                                             status === 'A' ? 'bg-rose-500 border-rose-500 text-white' : 
                                             status === 'L' ? 'bg-amber-500 border-amber-500 text-white' : 
                                             'bg-blue-500 border-blue-500 text-white')
                                          : 'border-slate-200 text-slate-400 hover:border-slate-300'
                                      }`}
                                      onClick={() => setTempMarks({...tempMarks, [student.id]: status as any})}
                                    >
                                      {status}
                                    </button>
                                  </td>
                                ))}
                              </tr>
                            );
                          })}
                          {students.filter(s => s.classId === selectedAttendanceClass).length === 0 && (
                            <tr>
                              <td colSpan={5} className="py-8 text-center text-slate-400 text-sm">No students found for this class.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* FINANCE */}
              {activePage === "finance" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {[
                      { label: "Total Income", value: `$${financeTransactions.filter(t => t.type === 'Income').reduce((a, b) => a + b.amount, 0).toLocaleString()}`, color: "text-emerald-600" },
                      { label: "Total Expense", value: `$${financeTransactions.filter(t => t.type === 'Expense').reduce((a, b) => a + b.amount, 0).toLocaleString()}`, color: "text-rose-600" },
                      { label: "Net Balance", value: `$${(financeTransactions.filter(t => t.type === 'Income').reduce((a, b) => a + b.amount, 0) - financeTransactions.filter(t => t.type === 'Expense').reduce((a, b) => a + b.amount, 0)).toLocaleString()}`, color: "text-indigo-600" }
                    ].map((stat, i) => (
                      <div key={i} className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm text-center">
                        <span className="text-xs font-bold uppercase text-slate-400 tracking-wider block mb-1">{stat.label}</span>
                        <h4 className={`text-3xl font-extrabold ${stat.color}`}>{stat.value}</h4>
                      </div>
                    ))}
                  </div>

                  <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm">
                    <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg">Financial Transactions</h3>
                        <p className="text-xs text-slate-400">View and manage income and expenses.</p>
                      </div>
                      <button onClick={() => setActiveModal("add-transaction")} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all">
                        <Plus className="w-4 h-4" />
                        Add Transaction
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50/50 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            <th className="py-3.5 px-6">Date</th>
                            <th className="py-3.5 px-6">Transaction ID</th>
                            <th className="py-3.5 px-6">Type</th>
                            <th className="py-3.5 px-6">Category</th>
                            <th className="py-3.5 px-6">Student Name</th>
                            <th className="py-3.5 px-6">Amount</th>
                            <th className="py-3.5 px-6">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                          {financeTransactions.map(tx => (
                            <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="py-4 px-6">{tx.date}</td>
                              <td className="py-4 px-6 font-bold">{tx.id}</td>
                              <td className="py-4 px-6">
                                <span className={`inline-flex px-2 py-0.5 rounded font-bold ${tx.type === 'Income' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                                  {tx.type}
                                </span>
                              </td>
                              <td className="py-4 px-6">{tx.category}</td>
                              <td className="py-4 px-6">{tx.studentName || '-'}</td>
                              <td className="py-4 px-6 font-bold text-slate-900">${tx.amount.toLocaleString()}</td>
                              <td className="py-4 px-6">
                                <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${tx.status === 'Paid' || tx.status === 'Cleared' ? 'bg-indigo-50 text-indigo-700' : 'bg-amber-50 text-amber-700'}`}>
                                  {tx.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* NOTICE BOARD */}
              {activePage === "noticeboard" && (
                <div className="space-y-6">
                  <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm">
                    <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg">Notice Board</h3>
                        <p className="text-xs text-slate-400">School announcements and upcoming events.</p>
                      </div>
                      <button onClick={() => setActiveModal("post-notice")} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all">
                        <Plus className="w-4 h-4" />
                        Post Notice
                      </button>
                    </div>
                    <div className="p-5 space-y-4">
                      {notices.map(notice => (
                        <div key={notice.id} className={`p-5 rounded-xl border transition-all ${notice.pinned ? 'border-indigo-300 bg-indigo-50/30' : 'border-slate-200 hover:border-slate-300'}`}>
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex gap-3 items-center">
                              {notice.pinned && <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></div>}
                              <h4 className="font-bold text-slate-900 text-base">{notice.title}</h4>
                              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold uppercase tracking-wider">{notice.category}</span>
                            </div>
                            <span className="text-xs text-slate-400 font-semibold">{notice.date}</span>
                          </div>
                          <p className="text-sm text-slate-600 leading-relaxed mb-4">
                            {notice.content}
                          </p>
                          <div className="flex justify-between items-center pt-3 border-t border-slate-100/60">
                            <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
                              <div className="w-5 h-5 bg-slate-200 rounded-full flex items-center justify-center text-[8px] text-slate-600">
                                {notice.author.charAt(0)}
                              </div>
                              {notice.author}
                            </div>
                            <button className="text-xs text-indigo-600 font-bold hover:underline">Read Full Notice &rarr;</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}
        </main>

        <footer className="h-14 bg-white border-t border-slate-200/80 flex items-center justify-between px-6 md:px-8 text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0">
          <span>Copyright © 2026 Schola Systems. All rights reserved.</span>
          <div className="flex gap-4">
            <a href="#" className="hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">Terms of Service</a>
            <a href="#" className="hover:underline">Support Center</a>
          </div>
        </footer>
      </div>

      {/* MODALS */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setActiveModal(null)}></div>
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md p-6 relative z-10 animate-scale-in">
            <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-lg">
                {activeModal === "hire-teacher" && "Register New Teacher"}
                {activeModal === "add-student" && "Enroll New Student"}
                {activeModal === "add-class" && "Create New Section"}
                {activeModal === "post-notice" && "Post Notice Board Announcement"}
                {activeModal === "add-transaction" && "Record New Financial Transaction"}
              </h3>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {activeModal === "hire-teacher" && (
              <form onSubmit={handleHireTeacherSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
                <div>
                  <label className="block mb-1 text-slate-500">Teacher Name</label>
                  <input type="text" required value={newTeacherForm.name} onChange={(e) => setNewTeacherForm({...newTeacherForm, name: e.target.value})} placeholder="Full Name" className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-600/30" />
                </div>
                <div>
                  <label className="block mb-1 text-slate-500">Email</label>
                  <input type="email" required value={newTeacherForm.email} onChange={(e) => setNewTeacherForm({...newTeacherForm, email: e.target.value})} placeholder="Email" className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-600/30" />
                </div>
                <div>
                  <label className="block mb-1 text-slate-500">Contact Phone</label>
                  <input type="text" value={newTeacherForm.phone} onChange={(e) => setNewTeacherForm({...newTeacherForm, phone: e.target.value})} placeholder="Phone" className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-600/30" />
                </div>
                <div>
                  <label className="block mb-1 text-slate-500">Specialization</label>
                  <input type="text" value={newTeacherForm.specialization} onChange={(e) => setNewTeacherForm({...newTeacherForm, specialization: e.target.value})} placeholder="e.g. Mathematics, History" className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-600/30" />
                </div>
                <div>
                  <label className="block mb-1 text-slate-500">Status</label>
                  <select value={newTeacherForm.status} onChange={(e) => setNewTeacherForm({...newTeacherForm, status: e.target.value as any})} className="w-full p-2.5 border border-slate-200 bg-white rounded-xl outline-none focus:border-indigo-600/30">
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 text-slate-500">Assign Initial Class</label>
                  <select value={newTeacherForm.classes} onChange={(e) => setNewTeacherForm({...newTeacherForm, classes: e.target.value})} className="w-full p-2.5 border border-slate-200 bg-white rounded-xl outline-none focus:border-indigo-600/30">
                    <option value="">Unassigned</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.id} ({c.grade})</option>)}
                  </select>
                </div>
                <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors cursor-pointer">Complete Hiring Onboarding</button>
              </form>
            )}

            {activeModal === "add-student" && (
              <form onSubmit={handleAddStudentSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
                <div>
                  <label className="block mb-1 text-slate-500">Student Name</label>
                  <input type="text" required value={newStudentForm.name} onChange={(e) => setNewStudentForm({...newStudentForm, name: e.target.value})} placeholder="Student Name" className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-600/30" />
                </div>
                <div>
                  <label className="block mb-1 text-slate-500">Email</label>
                  <input type="email" required value={newStudentForm.email} onChange={(e) => setNewStudentForm({...newStudentForm, email: e.target.value})} placeholder="Email" className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-600/30" />
                </div>
                <div>
                  <label className="block mb-1 text-slate-500">Class Section</label>
                  <select value={newStudentForm.classId} onChange={(e) => {
                    const selectedClass = classes.find(c => c.id === e.target.value);
                    setNewStudentForm({
                      ...newStudentForm,
                      classId: e.target.value,
                      grade: selectedClass ? selectedClass.grade : "Grade 8"
                    });
                  }} className="w-full p-2.5 border border-slate-200 bg-white rounded-xl outline-none focus:border-indigo-600/30">
                    {classes.map(c => <option key={c.id} value={c.id}>{c.id} ({c.grade})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block mb-1 text-slate-500">GPA (e.g. 3.8)</label>
                  <input type="number" step="0.01" min="0" max="4" required value={newStudentForm.gpa} onChange={(e) => setNewStudentForm({...newStudentForm, gpa: Number(e.target.value)})} className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-600/30" />
                </div>
                <div>
                  <label className="block mb-1 text-slate-500">Attendance Rate % (e.g. 95)</label>
                  <input type="number" min="0" max="100" required value={newStudentForm.attendanceRate} onChange={(e) => setNewStudentForm({...newStudentForm, attendanceRate: Number(e.target.value)})} className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-600/30" />
                </div>
                <div>
                  <label className="block mb-1 text-slate-500">Status</label>
                  <select value={newStudentForm.status} onChange={(e) => setNewStudentForm({...newStudentForm, status: e.target.value as any})} className="w-full p-2.5 border border-slate-200 bg-white rounded-xl outline-none focus:border-indigo-600/30">
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
                <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors cursor-pointer">Enroll Student</button>
              </form>
            )}

            {activeModal === "add-class" && (
              <form onSubmit={handleCreateClassSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
                <div>
                  <label className="block mb-1 text-slate-500">Class Section Name (e.g. 7A)</label>
                  <input type="text" required value={newClassForm.id} onChange={(e) => setNewClassForm({...newClassForm, id: e.target.value})} placeholder="e.g. 7A" className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-600/30" />
                </div>
                <div>
                  <label className="block mb-1 text-slate-500">Grade Level</label>
                  <select value={newClassForm.grade} onChange={(e) => setNewClassForm({...newClassForm, grade: e.target.value as any})} className="w-full p-2.5 border border-slate-200 bg-white rounded-xl outline-none focus:border-indigo-600/30">
                    <option value="Grade 7">Grade 7</option>
                    <option value="Grade 8">Grade 8</option>
                    <option value="Grade 9">Grade 9</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 text-slate-500">Assigned Teacher</label>
                  <select value={newClassForm.teacherName} onChange={(e) => setNewClassForm({...newClassForm, teacherName: e.target.value})} className="w-full p-2.5 border border-slate-200 bg-white rounded-xl outline-none focus:border-indigo-600/30">
                    <option value="">Unassigned</option>
                    {teachers.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block mb-1 text-slate-500">Room Number/Name</label>
                  <input type="text" required value={newClassForm.room} onChange={(e) => setNewClassForm({...newClassForm, room: e.target.value})} placeholder="e.g. Room 204 or Room 5" className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-600/30" />
                </div>
                <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors cursor-pointer">Complete Adding Class Section</button>
              </form>
            )}

            {activeModal === "post-notice" && (
              <form onSubmit={handlePostNoticeSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
                <div>
                  <label className="block mb-1 text-slate-500">Title</label>
                  <input type="text" required value={newNoticeForm.title} onChange={(e) => setNewNoticeForm({...newNoticeForm, title: e.target.value})} placeholder="Notice Title" className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-600/30" />
                </div>
                <div>
                  <label className="block mb-1 text-slate-500">Category</label>
                  <input type="text" required value={newNoticeForm.category} onChange={(e) => setNewNoticeForm({...newNoticeForm, category: e.target.value})} placeholder="e.g. Academic, Holiday, Sports" className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-600/30" />
                </div>
                <div>
                  <label className="block mb-1 text-slate-500">Author</label>
                  <input type="text" required value={newNoticeForm.author} onChange={(e) => setNewNoticeForm({...newNoticeForm, author: e.target.value})} placeholder="Author Name" className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-600/30" />
                </div>
                <div>
                  <label className="block mb-1 text-slate-500">Content</label>
                  <textarea required rows={4} value={newNoticeForm.content} onChange={(e) => setNewNoticeForm({...newNoticeForm, content: e.target.value})} placeholder="Notice content..." className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-600/30"></textarea>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="notice-pinned" checked={newNoticeForm.pinned} onChange={(e) => setNewNoticeForm({...newNoticeForm, pinned: e.target.checked})} className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
                  <label htmlFor="notice-pinned" className="text-slate-600 select-none">Pin this notice to the top</label>
                </div>
                <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors cursor-pointer">Broadcast Notice</button>
              </form>
            )}

            {activeModal === "add-transaction" && (
              <form onSubmit={handleAddTransactionSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
                <div>
                  <label className="block mb-1 text-slate-500">Transaction Type</label>
                  <select value={newTransactionForm.type} onChange={(e) => setNewTransactionForm({...newTransactionForm, type: e.target.value as any})} className="w-full p-2.5 border border-slate-200 bg-white rounded-xl outline-none focus:border-indigo-600/30">
                    <option value="Income">Income</option>
                    <option value="Expense">Expense</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 text-slate-500">Category</label>
                  <input type="text" required value={newTransactionForm.category} onChange={(e) => setNewTransactionForm({...newTransactionForm, category: e.target.value})} placeholder="e.g. Tuition Fees, Lab Equipment" className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-600/30" />
                </div>
                <div>
                  <label className="block mb-1 text-slate-500">Student Name (Optional, for Income)</label>
                  <select value={newTransactionForm.studentName} onChange={(e) => setNewTransactionForm({...newTransactionForm, studentName: e.target.value})} className="w-full p-2.5 border border-slate-200 bg-white rounded-xl outline-none focus:border-indigo-600/30">
                    <option value="-">-</option>
                    {students.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block mb-1 text-slate-500">Amount ($)</label>
                  <input type="number" required min="1" value={newTransactionForm.amount || ""} onChange={(e) => setNewTransactionForm({...newTransactionForm, amount: Number(e.target.value)})} placeholder="Amount" className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-indigo-600/30" />
                </div>
                <div>
                  <label className="block mb-1 text-slate-500">Status</label>
                  <select value={newTransactionForm.status} onChange={(e) => setNewTransactionForm({...newTransactionForm, status: e.target.value})} className="w-full p-2.5 border border-slate-200 bg-white rounded-xl outline-none focus:border-indigo-600/30">
                    <option value="Paid">Paid</option>
                    <option value="Cleared">Cleared</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
                <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors cursor-pointer">Log Record</button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}