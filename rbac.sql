-- =========================
-- ROLES
-- =========================
CREATE TABLE IF NOT EXISTS roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

INSERT INTO roles (name)
VALUES
('admin'),
('teacher')
ON CONFLICT (name) DO NOTHING;

-- =========================
-- PERMISSIONS
-- =========================
CREATE TABLE IF NOT EXISTS permissions (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

INSERT INTO permissions (name)
VALUES
('view_dashboard'),
('manage_teachers'),
('manage_students'),
('manage_classes'),
('manage_attendance'),
('manage_finance'),
('manage_noticeboard'),
('view_students'),
('view_classes'),
('view_attendance'),
('view_noticeboard')
ON CONFLICT (name) DO NOTHING;

-- =========================
-- ROLE PERMISSIONS
-- =========================
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id BIGINT REFERENCES roles(id) ON DELETE CASCADE,
    permission_id BIGINT REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- ADMIN PERMISSIONS
INSERT INTO role_permissions (role_id, permission_id)
SELECT
    (SELECT id FROM roles WHERE name = 'admin'),
    id
FROM permissions
ON CONFLICT DO NOTHING;

-- TEACHER PERMISSIONS
INSERT INTO role_permissions (role_id, permission_id)
SELECT
    (SELECT id FROM roles WHERE name = 'teacher'),
    id
FROM permissions
WHERE name IN (
    'view_dashboard',
    'view_students',
    'view_classes',
    'view_attendance',
    'view_noticeboard'
)
ON CONFLICT DO NOTHING;

-- =========================
-- USERS / PROFILES
-- =========================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT,
    role_id BIGINT REFERENCES roles(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- =========================
-- TEACHERS
-- =========================
CREATE TABLE IF NOT EXISTS teachers (
    id BIGSERIAL PRIMARY KEY,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    department TEXT,
    specialization TEXT,
    phone TEXT,
    status TEXT CHECK (status IN ('Full-time', 'Part-time')) DEFAULT 'Full-time',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =========================
-- CLASSES
-- =========================
CREATE TABLE IF NOT EXISTS classes (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    grade TEXT DEFAULT 'Grade 8',
    teacher_id BIGINT REFERENCES teachers(id) ON DELETE SET NULL,
    room TEXT,
    subject_progress JSONB DEFAULT '[]'::jsonb
);

-- =========================
-- STUDENTS
-- =========================
CREATE TABLE IF NOT EXISTS students (
    id BIGSERIAL PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT,
    class_id BIGINT REFERENCES classes(id) ON DELETE SET NULL,
    gpa NUMERIC(3, 2) DEFAULT 0.0,
    performance TEXT CHECK (performance IN ('Good', 'Needs Support', 'At Risk')) DEFAULT 'Good',
    attendance_rate NUMERIC(5, 2) DEFAULT 100.00,
    status TEXT CHECK (status IN ('Active', 'On Leave', 'Suspended')) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT NOW()
);

-- =========================
-- ATTENDANCE
-- =========================
CREATE TABLE IF NOT EXISTS attendance (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT REFERENCES students(id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL,
    status VARCHAR(20) CHECK (
        status IN ('present', 'absent', 'late', 'sick')
    ),
    UNIQUE (student_id, attendance_date)
);

-- =========================
-- FINANCE / PAYMENTS
-- =========================
CREATE TABLE IF NOT EXISTS payments (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT REFERENCES students(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    type TEXT CHECK (type IN ('Income', 'Expense')) DEFAULT 'Income',
    category TEXT DEFAULT 'Tuition Fees',
    status TEXT DEFAULT 'Paid',
    payment_date DATE DEFAULT CURRENT_DATE
);

-- =========================
-- NOTICE BOARD
-- =========================
CREATE TABLE IF NOT EXISTS notices (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT DEFAULT 'Academic',
    author TEXT DEFAULT 'Admin Office',
    pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS and setup policies
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- SECURE ROLE-BASED RLS POLICIES (NO USING(true))
-- ==========================================

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.roles r ON p.role_id = r.id
    WHERE p.id = user_id AND r.name = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Helper function to check if user has a role
CREATE OR REPLACE FUNCTION public.has_role(user_id UUID, role_names TEXT[])
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.roles r ON p.role_id = r.id
    WHERE p.id = user_id AND r.name = ANY(role_names)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Profiles: Users read own or admins read all. Owner update.
CREATE POLICY "Allow users to read profiles" ON profiles
  FOR SELECT USING (auth.uid() = id OR is_admin(auth.uid()));
CREATE POLICY "Allow profiles update" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Roles, Permissions, Role_permissions: Accessible to authenticated users
CREATE POLICY "Allow roles read" ON roles FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow permissions read" ON permissions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow role_permissions read" ON role_permissions FOR SELECT USING (auth.uid() IS NOT NULL);

-- Teachers: Admins do everything, Teachers can read
CREATE POLICY "Allow admins all on teachers" ON teachers FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Allow teachers read teachers" ON teachers FOR SELECT USING (has_role(auth.uid(), ARRAY['admin', 'teacher']));

-- Classes: Admins do everything, Teachers can read
CREATE POLICY "Allow admins all on classes" ON classes FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Allow teachers read classes" ON classes FOR SELECT USING (has_role(auth.uid(), ARRAY['admin', 'teacher']));

-- Students: Admins do everything, Teachers can read
CREATE POLICY "Allow admins all on students" ON students FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Allow teachers read students" ON students FOR SELECT USING (has_role(auth.uid(), ARRAY['admin', 'teacher']));

-- Attendance: Admins & Teachers manage attendance
CREATE POLICY "Allow admins all on attendance" ON attendance FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Allow teachers manage attendance" ON attendance FOR ALL USING (has_role(auth.uid(), ARRAY['admin', 'teacher']));

-- Finance/Payments: Only Admins can access payments
CREATE POLICY "Allow admins all on payments" ON payments FOR ALL USING (is_admin(auth.uid()));

-- Notices: Admins manage notices, Teachers & Admins can read
CREATE POLICY "Allow admins all on notices" ON notices FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Allow teachers and admins read notices" ON notices FOR SELECT USING (has_role(auth.uid(), ARRAY['admin', 'teacher']));

-- ==========================================
-- AUTO PROFILE CREATION TRIGGER ON SIGNUP
-- ==========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_role_id BIGINT;
  user_full_name TEXT;
  user_role_name TEXT;
BEGIN
  -- Determine role name from user metadata
  user_role_name := COALESCE(new.raw_user_meta_data->>'role', 'teacher');
  
  -- Fetch role ID
  SELECT id INTO default_role_id FROM public.roles WHERE name = user_role_name;
  
  -- Fallback if role doesn't exist
  IF default_role_id IS NULL THEN
    SELECT id INTO default_role_id FROM public.roles WHERE name = 'teacher';
  END IF;

  -- Determine full name
  user_full_name := COALESCE(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    'New User'
  );

  INSERT INTO public.profiles (id, full_name, email, role_id)
  VALUES (
    new.id,
    user_full_name,
    new.email,
    default_role_id
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop trigger if exists, then create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
