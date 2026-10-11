-- =============================================================================
-- CALIBRATE: Setup Demo Roles (Admin, Mentor, Student)
-- Run this query in Supabase SQL Editor after creating the 3 accounts
-- =============================================================================

-- 1. Ensure RLS policies allow login profile reads and updates
DROP POLICY IF EXISTS "Allow insert profile on signup" ON public.profiles;
CREATE POLICY "Allow insert profile on signup" ON public.profiles FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow insert user on signup" ON public.users;
CREATE POLICY "Allow insert user on signup" ON public.users FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public read profiles" ON public.profiles;
CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read users" ON public.users;
CREATE POLICY "Public read users" ON public.users FOR SELECT USING (true);

DROP POLICY IF EXISTS "User write own profile" ON public.profiles;
CREATE POLICY "User write own profile" ON public.profiles FOR ALL USING (true);

DROP POLICY IF EXISTS "User write own user" ON public.users;
CREATE POLICY "User write own user" ON public.users FOR ALL USING (true);

-- Permissive policies for demo student actions & verification
DROP POLICY IF EXISTS "Allow student_target_roles" ON public.student_target_roles;
CREATE POLICY "Allow student_target_roles" ON public.student_target_roles FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow student_progress" ON public.student_progress;
CREATE POLICY "Allow student_progress" ON public.student_progress FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow student_skills" ON public.student_skills;
CREATE POLICY "Allow student_skills" ON public.student_skills FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow evidence_submissions" ON public.evidence_submissions;
CREATE POLICY "Allow evidence_submissions" ON public.evidence_submissions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow roadmap_items" ON public.roadmap_items;
CREATE POLICY "Allow roadmap_items" ON public.roadmap_items FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow target_roles" ON public.target_roles;
CREATE POLICY "Allow target_roles" ON public.target_roles FOR ALL USING (true) WITH CHECK (true);

-- 2. Update roles for your 3 chosen demo accounts
-- (Replace the emails below with whatever emails you prefer to use)

-- Set Mentor Role
UPDATE public.profiles 
SET role = 'mentor', full_name = 'Dr. Sarah Mentor' 
WHERE email = 'mentor@calibrate.edu';

UPDATE public.users 
SET role = 'mentor', full_name = 'Dr. Sarah Mentor' 
WHERE email = 'mentor@calibrate.edu';

-- Set Admin Role
UPDATE public.profiles 
SET role = 'admin', full_name = 'CDC Administrator' 
WHERE email = 'admin@calibrate.edu';

UPDATE public.users 
SET role = 'admin', full_name = 'CDC Administrator' 
WHERE email = 'admin@calibrate.edu';

-- Student Role (Abhijeet Senapati)
UPDATE public.profiles 
SET role = 'student', full_name = 'Abhijeet Senapati' 
WHERE email IN ('student@calibrate.edu', 'abhijeet@calibrate.edu');

UPDATE public.users 
SET role = 'student', full_name = 'Abhijeet Senapati' 
WHERE email IN ('student@calibrate.edu', 'abhijeet@calibrate.edu');
