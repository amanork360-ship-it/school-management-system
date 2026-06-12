-- Create schema for Schola School Management Dashboard

-- 1. Teachers Table
CREATE TABLE IF NOT EXISTS public.teachers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    avatar TEXT,
    specialization TEXT,
    classes TEXT[],
    email TEXT,
    phone TEXT,
    status TEXT CHECK (status IN ('Full-time', 'Part-time')),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Students Table
CREATE TABLE IF NOT EXISTS public.students (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    avatar TEXT,
    class_id TEXT,
    grade TEXT,
    gpa NUMERIC(3, 2),
    performance TEXT CHECK (performance IN ('Good', 'Needs Support', 'At Risk')),
    attendance_rate NUMERIC(5, 2),
    status TEXT CHECK (status IN ('Active', 'On Leave', 'Suspended')),
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Classes Table
CREATE TABLE IF NOT EXISTS public.classes (
    id TEXT PRIMARY KEY,
    grade TEXT,
    teacher_id TEXT, -- Store teacher name/id
    room TEXT,
    student_count INTEGER DEFAULT 0,
    subject_progress JSONB, -- Array of {subject: string, progress: number}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Attendance Table
CREATE TABLE IF NOT EXISTS public.attendance (
    id BIGSERIAL PRIMARY KEY,
    student_id TEXT NOT NULL,
    date TEXT NOT NULL, -- Format YYYY-MM-DD
    status TEXT CHECK (status IN ('P', 'A', 'L', 'S')), -- Present, Absent, Late, Sick
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (student_id, date)
);

-- 5. Events Table
CREATE TABLE IF NOT EXISTS public.events (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    time TEXT,
    date TEXT,
    details TEXT,
    type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Finance Transactions Table
CREATE TABLE IF NOT EXISTS public.finance_transactions (
    id TEXT PRIMARY KEY,
    type TEXT CHECK (type IN ('Income', 'Expense')),
    category TEXT,
    student_name TEXT,
    amount NUMERIC(10, 2),
    date TEXT, -- Format YYYY-MM-DD
    status TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Notices Table
CREATE TABLE IF NOT EXISTS public.notices (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT,
    date TEXT, -- E.g. 'June 04, 2026'
    content TEXT,
    author TEXT,
    pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS and setup policies (optional, but configured to allow read/write for demo purposes)
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON public.teachers FOR SELECT USING (true);
CREATE POLICY "Allow public write access" ON public.teachers FOR ALL USING (true);

CREATE POLICY "Allow public read access" ON public.students FOR SELECT USING (true);
CREATE POLICY "Allow public write access" ON public.students FOR ALL USING (true);

CREATE POLICY "Allow public read access" ON public.classes FOR SELECT USING (true);
CREATE POLICY "Allow public write access" ON public.classes FOR ALL USING (true);

CREATE POLICY "Allow public read access" ON public.attendance FOR SELECT USING (true);
CREATE POLICY "Allow public write access" ON public.attendance FOR ALL USING (true);

CREATE POLICY "Allow public read access" ON public.events FOR SELECT USING (true);
CREATE POLICY "Allow public write access" ON public.events FOR ALL USING (true);

CREATE POLICY "Allow public read access" ON public.finance_transactions FOR SELECT USING (true);
CREATE POLICY "Allow public write access" ON public.finance_transactions FOR ALL USING (true);

CREATE POLICY "Allow public read access" ON public.notices FOR SELECT USING (true);
CREATE POLICY "Allow public write access" ON public.notices FOR ALL USING (true);

-- Insert Seed Data (Matches data.ts exactly)

-- Teachers Seed
INSERT INTO public.teachers (id, name, avatar, specialization, classes, email, phone, status, active) VALUES
('T-8492', 'Dr. Sarah Miller', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 'Mathematics & Physics', ARRAY['Class 10A', 'Class 12B'], 's.miller@schola.edu', '+1 (555) 012-3456', 'Full-time', true),
('T-8501', 'Marcus Chen', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'Modern History', ARRAY['Class 11C', 'Class 9A'], 'm.chen@schola.edu', '+1 (555) 012-7890', 'Part-time', true),
('T-8422', 'Elena Rossi', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', 'Biology & Chemistry', ARRAY['Class 12A'], 'e.rossi@schola.edu', '+1 (555) 012-1122', 'Full-time', true),
('T-8399', 'Dr. Alan Turing', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', 'Computer Science', ARRAY['Class 11A', 'Class 12C'], 'a.turing@schola.edu', '+1 (555) 012-9988', 'Full-time', true),
('T-8204', 'Eleanor Vance', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', 'English Literature', ARRAY['Class 7A'], 'e.vance@schola.edu', '+1 (555) 012-2233', 'Full-time', true),
('T-8115', 'Julian Ross', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 'World Languages', ARRAY['Class 7B'], 'j.ross@schola.edu', '+1 (555) 012-4455', 'Full-time', true)
ON CONFLICT (id) DO NOTHING;

-- Students Seed
INSERT INTO public.students (id, name, avatar, class_id, grade, gpa, performance, attendance_rate, status, email) VALUES
('S-2121', 'Michael Chen', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150', '8C', 'Grade 8', 3.8, 'Good', 95, 'Active', 'michael.c@schola.edu'),
('S-2122', 'Emma Williams', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', '8C', 'Grade 8', 2.9, 'Needs Support', 87, 'Active', 'emma.w@schola.edu'),
('S-2123', 'Rajesh Kumar', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', '8C', 'Grade 8', 2.4, 'At Risk', 72, 'On Leave', 'rajesh.k@schola.edu'),
('S-2124', 'Hannah Lee', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', '8C', 'Grade 8', 3.6, 'Good', 93, 'Active', 'hannah.l@schola.edu'),
('S-2125', 'Isabella Rossi', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150', '8C', 'Grade 8', 3.9, 'Good', 97, 'Active', 'isabella.r@schola.edu'),
('S-2101', 'Fatima Noor', 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=150', '7A', 'Grade 7', 3.7, 'Good', 98, 'Active', 'fatima.n@schola.edu'),
('S-2102', 'Alicia Gomez', 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150', '7A', 'Grade 7', 3.2, 'Good', 94, 'Active', 'alicia.g@schola.edu'),
('S-2103', 'Daniel Park', 'https://images.unsplash.com/photo-1500048993953-d23a436266cf?w=150', '7B', 'Grade 7', 3.5, 'Good', 96, 'Active', 'daniel.p@schola.edu')
ON CONFLICT (id) DO NOTHING;

-- Classes Seed
INSERT INTO public.classes (id, grade, teacher_id, room, student_count, subject_progress) VALUES
('7A', 'Grade 7', 'Eleanor Vance', 'Room 204', 28, '[{"subject": "Mathematics", "progress": 85}, {"subject": "Language Arts", "progress": 92}, {"subject": "World Sciences", "progress": 78}]'::jsonb),
('7B', 'Grade 7', 'Julian Ross', 'Room 205', 30, '[{"subject": "Mathematics", "progress": 75}, {"subject": "Language Arts", "progress": 88}, {"subject": "World Sciences", "progress": 82}]'::jsonb),
('8C', 'Grade 8', 'Dr. Sarah Miller', 'Room 301', 24, '[{"subject": "Mathematics", "progress": 82}, {"subject": "World Sciences", "progress": 64}, {"subject": "Language Arts", "progress": 95}]'::jsonb),
('9A', 'Grade 9', 'Marcus Chen', 'Room 402', 32, '[{"subject": "Mathematics", "progress": 90}, {"subject": "World Sciences", "progress": 86}, {"subject": "Language Arts", "progress": 89}]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Attendance Seed
INSERT INTO public.attendance (student_id, date, status) VALUES
('S-2121', '2025-03-24', 'P'),
('S-2122', '2025-03-24', 'L'),
('S-2123', '2025-03-24', 'A'),
('S-2124', '2025-03-24', 'P'),
('S-2125', '2025-03-24', 'P')
ON CONFLICT (student_id, date) DO NOTHING;

-- Events Seed
INSERT INTO public.events (id, title, time, date, details, type) VALUES
('1', 'Faculty Meeting', '2:00 PM', 'Today', 'Conference Hall • Starting in 15 mins', 'meeting'),
('2', 'New Teacher Onboarded', '08:30 AM', 'Today', 'Dr. Alan Turing joined Mathematics', 'onboard'),
('3', 'Leave Request: Mr. Smith', '3 days', 'Pending Approval', 'Personal reasons', 'leave')
ON CONFLICT (id) DO NOTHING;

-- Finance Transactions Seed
INSERT INTO public.finance_transactions (id, type, category, student_name, amount, date, status) VALUES
('TX-1001', 'Income', 'Tuition Fees', 'Michael Chen', 1500, '2025-03-20', 'Paid'),
('TX-1002', 'Expense', 'Lab Equipment', '-', 450, '2025-03-19', 'Cleared'),
('TX-1003', 'Income', 'Admission Fee', 'Daniel Park', 300, '2025-03-18', 'Paid'),
('TX-1004', 'Income', 'Tuition Fees', 'Emma Williams', 1500, '2025-03-17', 'Pending'),
('TX-1005', 'Expense', 'Library Books', '-', 120, '2025-03-15', 'Cleared')
ON CONFLICT (id) DO NOTHING;

-- Notices Seed
INSERT INTO public.notices (id, title, category, date, content, author, pinned) VALUES
('n1', 'Annual Science Fair 2025 Guidelines', 'Academic', 'June 04, 2026', 'The annual science fair will take place next month. Registration details, template guidelines, and rubrics have been updated in the portal. All Grade 7-9 science students are encouraged to enroll.', 'Dr. Sarah Miller', true),
('n2', 'School Closure Notification - Summer Break', 'Holiday', 'June 01, 2026', 'Please note that the school will remain closed for summer break starting from June 15th to July 31st. Regular classes will resume on August 1st. Have a restful holiday!', 'Office Administration', true),
('n3', 'Sports Day Tryouts Scheduled', 'Sports', 'May 28, 2026', 'Athletics track and field tryouts are scheduled for Wednesday after school. Please contact Mr. Julian Ross for signing up and gear guidelines.', 'Julian Ross', false),
('n4', 'Quarterly Parent-Teacher Conference', 'Academic', 'May 25, 2026', 'The Parent-Teacher conferences are scheduled for the coming Friday. Individual appointment slots are now open on the school scheduling app.', 'Admin Office', false)
ON CONFLICT (id) DO NOTHING;
