import { createBrowserClient } from '@supabase/ssr';
import { Teacher, Student, ClassRoom, AttendanceRecord } from '../app/data';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// createBrowserClient stores tokens in COOKIES (not localStorage)
// so the server-side proxy.ts can read and verify them
export const supabase = supabaseUrl
  ? createBrowserClient(supabaseUrl, supabaseAnonKey)
  : null;

// Check if configured
export function isSupabaseConfigured(): boolean {
  return (
    !!supabaseUrl &&
    !!supabaseAnonKey &&
    supabaseUrl !== 'your-supabase-project-url.supabase.co' &&
    supabaseAnonKey !== 'your-supabase-anon-key-here'
  );
}

// Helper to look up class DB id by name (e.g. '8C')
export async function getClassIdByName(className: string): Promise<number | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('classes')
    .select('id')
    .eq('name', className)
    .maybeSingle();
  if (error || !data) return null;
  return Number(data.id);
}

// Helper to look up teacher DB id by name
export async function getTeacherIdByName(teacherName: string): Promise<number | null> {
  if (!supabase) return null;
  
  // Try querying profiles first to find linked teacher
  const { data: profileData } = await supabase
    .from('profiles')
    .select('id')
    .eq('full_name', teacherName)
    .maybeSingle();

  if (profileData) {
    const { data: teacherData } = await supabase
      .from('teachers')
      .select('id')
      .eq('profile_id', profileData.id)
      .maybeSingle();
    if (teacherData) return Number(teacherData.id);
  }
  return null;
}

// ----------------------------------------------------
// Auth & Users
// ----------------------------------------------------
export async function dbGetSession() {
  if (!supabase) return { data: { session: null } };
  return await supabase.auth.getSession();
}

export interface UserProfile {
  fullName: string;
  role: string;
  permissions: string[];
  classId?: string;
  avatarUrl?: string;
  userId: string;
}

export async function dbGetUserProfile(userId: string): Promise<UserProfile | null> {
  if (!supabase) return null;

  try {
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select(`
        full_name,
        avatar_url,
        role_id,
        roles (
          name
        )
      `)
      .eq('id', userId)
      .maybeSingle();

    if (profileError || !profileData) {
      console.warn("Profile not found in public.profiles table. Using fallback auth metadata.");
      // Safely attempt to get auth user details
      let user = null;
      if (isSupabaseConfigured()) {
        try {
          const { data: authData } = await supabase.auth.getUser();
          user = authData.user;
        } catch (authErr) {
          console.error('Supabase getUser failed:', authErr);
        }
      }
      // Build minimal profile regardless of auth fetch success
      return {
        userId: user?.id || "",
        fullName: user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || "Admin User",
        role: user?.user_metadata?.role || "admin",
        permissions: [
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
        ],
        avatarUrl: user?.user_metadata?.avatar_url,
        classId: undefined
      };
    }

    const roleName = (profileData.roles as any)?.name || 'teacher';

    const { data: permissionData, error: permError } = await supabase
      .from('role_permissions')
      .select(`
        permissions (
          name
        )
      `)
      .eq('role_id', profileData.role_id);

    const permissions = (permissionData || [])
      .map((rp: any) => rp.permissions?.name)
      .filter(Boolean);

    let classId: string | undefined;
    if (roleName === 'teacher') {
      const { data: teacherData } = await supabase
        .from('teachers')
        .select('id')
        .eq('profile_id', userId)
        .maybeSingle();

      if (teacherData) {
        const { data: classData } = await supabase
          .from('classes')
          .select('name')
          .eq('teacher_id', teacherData.id)
          .maybeSingle();
        classId = classData?.name;
      }
    }

    return {
      userId,
      fullName: profileData.full_name,
      avatarUrl: profileData.avatar_url,
      role: roleName,
      permissions,
      classId
    };
  } catch (err) {
    console.error('Error fetching user profile:', err);
    // Return a minimal profile to keep UI functional
    return {
      userId,
      fullName: 'Unknown',
      role: 'guest',
      permissions: [],
      avatarUrl: undefined,
      classId: undefined
    };
  }
}

export async function dbGetUserRole(userId: string): Promise<string | null> {
  const profile = await dbGetUserProfile(userId);
  return profile ? profile.role : null;
}

// ----------------------------------------------------
// Teachers Mapping & Queries
// ----------------------------------------------------
export async function dbGetTeachers(): Promise<Teacher[]> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data: teachersData, error: teachersError } = await supabase
    .from('teachers')
    .select(`
      id,
      department,
      specialization,
      phone,
      status,
      active,
      profile_id,
      profiles (
        full_name,
        email
      )
    `)
    .order('created_at', { ascending: false });
  if (teachersError) throw teachersError;

  const { data: classesData } = await supabase
    .from('classes')
    .select('name, teacher_id');

  const classesMap: Record<number, string[]> = {};
  if (classesData) {
    classesData.forEach((c: any) => {
      if (c.teacher_id) {
        if (!classesMap[c.teacher_id]) classesMap[c.teacher_id] = [];
        classesMap[c.teacher_id].push(c.name);
      }
    });
  }

  return (teachersData || []).map((db: any) => ({
    id: `T-${db.id}`,
    name: db.profiles?.full_name || 'Pending Onboarding',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    specialization: db.specialization || db.department || 'General',
    classes: classesMap[Number(db.id)] || [],
    email: db.profiles?.email || 'N/A',
    phone: db.phone || '',
    status: db.status || 'Full-time',
    active: db.active !== false
  }));
}

export async function dbAddTeacher(teacher: Teacher): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');
  
  // Try to find a profile with matching email first to link the teacher
  let profileId: string | null = null;
  const { data: profileData } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', teacher.email)
    .maybeSingle();

  if (profileData) {
    profileId = profileData.id;
  }

  const { data, error } = await supabase
    .from('teachers')
    .insert([{
      profile_id: profileId,
      specialization: teacher.specialization,
      phone: teacher.phone,
      status: teacher.status,
      active: teacher.active
    }])
    .select()
    .single();
  if (error) throw error;

  if (teacher.classes && teacher.classes.length > 0 && data) {
    const teacherDbId = Number(data.id);
    for (const className of teacher.classes) {
      const classDbId = await getClassIdByName(className);
      if (classDbId) {
        await supabase
          .from('classes')
          .update({ teacher_id: teacherDbId })
          .eq('id', classDbId);
      }
    }
  }
}

export async function dbDeleteTeacher(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');
  const dbId = Number(id.replace('T-', ''));
  const { error } = await supabase
    .from('teachers')
    .delete()
    .eq('id', dbId);
  if (error) throw error;
}

// ----------------------------------------------------
// Students Mapping & Queries
// ----------------------------------------------------
export async function dbGetStudents(): Promise<Student[]> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('students')
    .select(`
      id,
      full_name,
      email,
      gpa,
      performance,
      attendance_rate,
      status,
      class_id,
      classes (
        name,
        grade
      )
    `)
    .order('created_at', { ascending: false });
  if (error) throw error;

  return (data || []).map((db: any) => ({
    id: `S-${db.id}`,
    name: db.full_name,
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    classId: db.classes?.name || '',
    grade: (db.classes?.grade || 'Grade 8') as 'Grade 7' | 'Grade 8' | 'Grade 9',
    gpa: Number(db.gpa || 0),
    performance: (db.performance || 'Good') as 'Good' | 'Needs Support' | 'At Risk',
    attendanceRate: Number(db.attendance_rate || 0),
    status: (db.status || 'Active') as 'Active' | 'On Leave' | 'Suspended',
    email: db.email || ''
  }));
}

export async function dbAddStudent(student: Student): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');
  const classDbId = await getClassIdByName(student.classId);
  const { error } = await supabase
    .from('students')
    .insert([{
      full_name: student.name,
      email: student.email,
      class_id: classDbId,
      gpa: student.gpa,
      performance: student.performance,
      attendance_rate: student.attendanceRate,
      status: student.status
    }]);
  if (error) throw error;
}

export async function dbUpdateStudent(student: Student): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');
  const classDbId = await getClassIdByName(student.classId);
  const studentDbId = Number(student.id.replace('S-', ''));
  const { error } = await supabase
    .from('students')
    .update({
      full_name: student.name,
      email: student.email,
      class_id: classDbId,
      gpa: student.gpa,
      performance: student.performance,
      attendance_rate: student.attendanceRate,
      status: student.status
    })
    .eq('id', studentDbId);
  if (error) throw error;
}

export async function dbDeleteStudent(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');
  const studentDbId = Number(id.replace('S-', ''));
  const { error } = await supabase
    .from('students')
    .delete()
    .eq('id', studentDbId);
  if (error) throw error;
}

// ----------------------------------------------------
// Classes Mapping & Queries
// ----------------------------------------------------
export async function dbGetClasses(): Promise<ClassRoom[]> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('classes')
    .select(`
      id,
      name,
      grade,
      room,
      subject_progress,
      teacher_id,
      teachers (
        specialization,
        profile_id,
        profiles (
          full_name
        )
      )
    `)
    .order('id', { ascending: true });
  if (error) throw error;

  const { data: studentCounts } = await supabase
    .from('students')
    .select('class_id');
  
  const countsMap: Record<number, number> = {};
  if (studentCounts) {
    studentCounts.forEach((s: any) => {
      if (s.class_id) {
        countsMap[s.class_id] = (countsMap[s.class_id] || 0) + 1;
      }
    });
  }

  return (data || []).map((db: any) => {
    const teacherName = db.teachers?.profiles?.full_name || 'Unassigned';
    return {
      id: db.name,
      grade: (db.grade || 'Grade 8') as 'Grade 7' | 'Grade 8' | 'Grade 9',
      teacherId: teacherName,
      room: db.room || '',
      studentCount: countsMap[Number(db.id)] || 0,
      subjectProgress: db.subject_progress || []
    };
  });
}

export async function dbAddClass(classroom: ClassRoom): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');
  const teacherId = await getTeacherIdByName(classroom.teacherId);
  const { error } = await supabase
    .from('classes')
    .insert([{
      name: classroom.id,
      grade: classroom.grade,
      teacher_id: teacherId,
      room: classroom.room,
      subject_progress: classroom.subjectProgress
    }]);
  if (error) throw error;
}

export async function dbUpdateClass(classroom: ClassRoom): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');
  const teacherId = await getTeacherIdByName(classroom.teacherId);
  const classDbId = await getClassIdByName(classroom.id);
  if (!classDbId) return;

  const { error } = await supabase
    .from('classes')
    .update({
      grade: classroom.grade,
      teacher_id: teacherId,
      room: classroom.room,
      subject_progress: classroom.subjectProgress
    })
    .eq('id', classDbId);
  if (error) throw error;
}

// ----------------------------------------------------
// Attendance Queries
// ----------------------------------------------------
export async function dbGetAttendance(): Promise<AttendanceRecord[]> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('attendance')
    .select('student_id, attendance_date, status');
  if (error) throw error;
  
  return (data || []).map((db: any) => {
    let statusMapped: 'P' | 'A' | 'L' | 'S' = 'P';
    if (db.status === 'present') statusMapped = 'P';
    else if (db.status === 'absent') statusMapped = 'A';
    else if (db.status === 'late') statusMapped = 'L';
    else if (db.status === 'sick') statusMapped = 'S';
    return {
      studentId: `S-${db.student_id}`,
      date: db.attendance_date,
      status: statusMapped
    };
  });
}

export async function dbSaveAttendance(records: AttendanceRecord[]): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');
  
  const dbRecords = records.map(r => {
    let statusDb = 'present';
    if (r.status === 'P') statusDb = 'present';
    else if (r.status === 'A') statusDb = 'absent';
    else if (r.status === 'L') statusDb = 'late';
    else if (r.status === 'S') statusDb = 'sick';
    return {
      student_id: Number(r.studentId.replace('S-', '')),
      attendance_date: r.date,
      status: statusDb
    };
  });

  const { error } = await supabase
    .from('attendance')
    .upsert(dbRecords, { onConflict: 'student_id,attendance_date' });
  if (error) throw error;
}

// ----------------------------------------------------
// Events Queries
// ----------------------------------------------------
export async function dbGetEvents(): Promise<any[]> {
  return [];
}

export async function dbAddEvent(event: any): Promise<void> {
}

export async function dbDeleteEvent(id: string): Promise<void> {
}

// ----------------------------------------------------
// Payments/Finance Queries
// ----------------------------------------------------
export async function dbGetTransactions(): Promise<any[]> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('payments')
    .select(`
      id,
      amount,
      type,
      category,
      status,
      payment_date,
      student_id,
      students (
        full_name
      )
    `)
    .order('payment_date', { ascending: false });
  if (error) throw error;

  return (data || []).map((db: any) => ({
    id: `TX-${db.id}`,
    type: db.type || 'Income',
    category: db.category || 'Tuition Fees',
    studentName: db.students?.full_name || '-',
    amount: Number(db.amount),
    date: db.payment_date,
    status: db.status || 'Paid'
  }));
}

export async function dbAddTransaction(tx: any): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');
  
  let studentDbId: number | null = null;
  if (tx.studentName && tx.studentName !== '-') {
    const { data: studentData } = await supabase
      .from('students')
      .select('id')
      .eq('full_name', tx.studentName)
      .maybeSingle();
    if (studentData) studentDbId = Number(studentData.id);
  }

  const { error } = await supabase
    .from('payments')
    .insert([{
      student_id: studentDbId,
      amount: tx.amount,
      type: tx.type,
      category: tx.category,
      status: tx.status,
      payment_date: tx.date || new Date().toISOString().split('T')[0]
    }]);
  if (error) throw error;
}

// ----------------------------------------------------
// Notices Queries
// ----------------------------------------------------
export async function dbGetNotices(): Promise<any[]> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('notices')
    .select('*')
    .order('pinned', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map((db: any) => ({
    id: String(db.id),
    title: db.title,
    category: db.category || 'Academic',
    date: new Date(db.created_at).toLocaleDateString("en-US", { month: 'short', day: '2-digit', year: 'numeric' }),
    content: db.content,
    author: db.author || 'Admin Office',
    pinned: db.pinned || false
  }));
}

export async function dbAddNotice(notice: any): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');
  const { error } = await supabase
    .from('notices')
    .insert([{
      title: notice.title,
      content: notice.content,
      category: notice.category,
      author: notice.author,
      pinned: notice.pinned
    }]);
  if (error) throw error;
}

export async function dbDeleteNotice(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');
  const { error } = await supabase
    .from('notices')
    .delete()
    .eq('id', Number(id));
  if (error) throw error;
}
