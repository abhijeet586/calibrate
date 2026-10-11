-- =============================================================================
-- CALIBRATE CLOUD — Complete Consolidated PostgreSQL Database Schema
-- Run this in the Supabase SQL Editor (New Query)
-- =============================================================================

-- 1. PROFILES & USERS
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    role TEXT CHECK (role IN ('student', 'mentor', 'admin', 'cdc_admin')) DEFAULT 'student',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    role TEXT CHECK (role IN ('student', 'mentor', 'admin', 'cdc_admin')) DEFAULT 'student',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. MARKET SKILLS REGISTRY
CREATE TABLE IF NOT EXISTS public.market_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    category TEXT DEFAULT 'Cloud & Infrastructure',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TARGET ROLES (CAREER TRACKS)
CREATE TABLE IF NOT EXISTS public.target_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    required_skills JSONB DEFAULT '{}'::jsonb,
    market_demand_score INTEGER DEFAULT 85,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ROADMAP ITEMS (CURRICULUM MILESTONES)
CREATE TABLE IF NOT EXISTS public.roadmap_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target_role_id UUID REFERENCES public.target_roles(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES public.market_skills(id) ON DELETE SET NULL,
    instruction TEXT NOT NULL,
    resource_link TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. STUDENT TARGET ROLE ASSIGNMENT
CREATE TABLE IF NOT EXISTS public.student_target_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES public.target_roles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, role_id)
);

-- 6. STUDENT PROGRESS & PROOF OF WORK SUBMISSIONS
CREATE TABLE IF NOT EXISTS public.student_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    roadmap_item_id UUID REFERENCES public.roadmap_items(id) ON DELETE CASCADE,
    status TEXT CHECK (status IN ('pending', 'verified', 'rejected')) DEFAULT 'pending',
    proof_link TEXT,
    mentor_feedback TEXT,
    assigned_mentor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. STUDENT VERIFIED SKILLS
CREATE TABLE IF NOT EXISTS public.student_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES public.market_skills(id) ON DELETE CASCADE,
    proficiency INTEGER DEFAULT 100 CHECK (proficiency BETWEEN 0 AND 100),
    verified_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, skill_id)
);

-- 8. MARKET BROADCAST UPDATES (CDC INTELLIGENCE)
CREATE TABLE IF NOT EXISTS public.market_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT DEFAULT 'Hiring Trend',
    posted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. CALIBRATE CLOUD — DIRECT AWS S3 EVIDENCE SUBMISSIONS (PROOF-OF-WORK VAULT)
CREATE TABLE IF NOT EXISTS public.evidence_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    skill_category TEXT DEFAULT 'Cloud Architecture',
    github_url TEXT,
    s3_key TEXT,
    s3_bucket TEXT,
    file_name TEXT,
    file_type TEXT,
    file_size_bytes BIGINT,
    status TEXT CHECK (status IN ('SUBMITTED', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED')) DEFAULT 'SUBMITTED',
    reviewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewer_comment TEXT,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- INDEXES & RPC FUNCTIONS
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_student_progress_mentor 
ON public.student_progress (assigned_mentor_id) 
WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_student_progress_student 
ON public.student_progress (student_id);

CREATE INDEX IF NOT EXISTS idx_evidence_student 
ON public.evidence_submissions (student_id);

-- Track Bottlenecks RPC for Admin Analytics
CREATE OR REPLACE FUNCTION get_track_bottlenecks()
RETURNS TABLE (
    track_id UUID,
    track_name TEXT,
    pending_count BIGINT,
    overloaded BOOLEAN
)
LANGUAGE sql
STABLE
AS $$
    SELECT
        tr.id AS track_id,
        tr.name AS track_name,
        COUNT(sp.id) AS pending_count,
        COUNT(sp.id) > 20 AS overloaded
    FROM public.target_roles tr
    LEFT JOIN public.roadmap_items ri ON ri.target_role_id = tr.id
    LEFT JOIN public.student_progress sp ON sp.roadmap_item_id = ri.id AND sp.status = 'pending'
    GROUP BY tr.id, tr.name
    ORDER BY pending_count DESC;
$$;

-- Auto-sync profile to users table
CREATE OR REPLACE FUNCTION sync_profile_to_users()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name, role)
    VALUES (NEW.id, NEW.email, NEW.full_name, NEW.role)
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_sync_profile_to_users ON public.profiles;
CREATE TRIGGER tr_sync_profile_to_users
AFTER INSERT OR UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION sync_profile_to_users();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.target_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_target_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence_submissions ENABLE ROW LEVEL SECURITY;

-- Permissive demo policies (read all, insert/update authenticated)
CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "User write own profile" ON public.profiles FOR ALL USING (auth.uid() = id);

CREATE POLICY "Public read users" ON public.users FOR SELECT USING (true);
CREATE POLICY "User write own user" ON public.users FOR ALL USING (auth.uid() = id);

CREATE POLICY "Public read skills" ON public.market_skills FOR SELECT USING (true);
CREATE POLICY "Auth write skills" ON public.market_skills FOR ALL TO authenticated USING (true);

CREATE POLICY "Public read target_roles" ON public.target_roles FOR SELECT USING (true);
CREATE POLICY "Auth write target_roles" ON public.target_roles FOR ALL TO authenticated USING (true);

CREATE POLICY "Public read roadmap_items" ON public.roadmap_items FOR SELECT USING (true);
CREATE POLICY "Auth write roadmap_items" ON public.roadmap_items FOR ALL TO authenticated USING (true);

CREATE POLICY "Auth read student_target_roles" ON public.student_target_roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth write student_target_roles" ON public.student_target_roles FOR ALL TO authenticated USING (auth.uid() = student_id);

CREATE POLICY "Auth read student_progress" ON public.student_progress FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth write student_progress" ON public.student_progress FOR ALL TO authenticated USING (true);

CREATE POLICY "Auth read student_skills" ON public.student_skills FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth write student_skills" ON public.student_skills FOR ALL TO authenticated USING (true);

CREATE POLICY "Public read market_updates" ON public.market_updates FOR SELECT USING (true);
CREATE POLICY "Auth write market_updates" ON public.market_updates FOR ALL TO authenticated USING (true);

CREATE POLICY "Auth read evidence_submissions" ON public.evidence_submissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Student insert evidence" ON public.evidence_submissions FOR INSERT TO authenticated WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Auth update evidence" ON public.evidence_submissions FOR UPDATE TO authenticated USING (true);

-- =============================================================================
-- SEED DATA (Ready-to-Demo Career Tracks & Skills)
-- =============================================================================

-- Seed Market Skills
INSERT INTO public.market_skills (name, category) VALUES
('AWS Cloud Architecture', 'Cloud & DevOps'),
('Docker & Kubernetes', 'Cloud & DevOps'),
('TypeScript & Next.js', 'Full Stack'),
('PostgreSQL & RLS', 'Database & Backend'),
('System Design & Microservices', 'Architecture'),
('CI/CD & Infrastructure as Code', 'Cloud & DevOps')
ON CONFLICT (name) DO NOTHING;

-- Seed Target Roles
INSERT INTO public.target_roles (name, required_skills, market_demand_score) VALUES
('Cloud Solutions Architect', '{"AWS Cloud Architecture": 95, "Docker & Kubernetes": 90, "System Design & Microservices": 85, "CI/CD & Infrastructure as Code": 80}'::jsonb, 96),
('DevOps & Platform Engineer', '{"Docker & Kubernetes": 95, "CI/CD & Infrastructure as Code": 90, "AWS Cloud Architecture": 85, "PostgreSQL & RLS": 75}'::jsonb, 92),
('Full-Stack Cloud Engineer', '{"TypeScript & Next.js": 95, "PostgreSQL & RLS": 90, "AWS Cloud Architecture": 80, "System Design & Microservices": 75}'::jsonb, 90)
ON CONFLICT DO NOTHING;

-- Seed Market Intelligence Updates
INSERT INTO public.market_updates (title, content, category) VALUES
('Surge in Cloud Solutions Architecture Hiring', 'Enterprise demand for AWS Certified Solutions Architects has surged 34% in Q1 2026. Microservices decomposition and S3 storage optimization are key evaluation topics.', 'Hiring Trend'),
('Serverless & Event-Driven Patterns Standardized', 'Top tech employers are prioritizing AWS Lambda, API Gateway, and event-driven decoupled systems over monolithic architectures.', 'Tech Shift'),
('CDC Milestone: Proof-of-Work Verification Mandatory', 'Campus recruiters now require verifiable GitHub repos and AWS cloud artifacts for campus interviews rather than paper resumes.', 'Policy')
ON CONFLICT DO NOTHING;
