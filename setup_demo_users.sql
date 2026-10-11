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

-- 3. Seed Curriculum Roadmap Milestones for Career Tracks
INSERT INTO public.roadmap_items (target_role_id, skill_id, instruction, resource_link)
SELECT 
    tr.id,
    ms.id,
    'Deploy Multi-Tier AWS Architecture with VPC, Subnets, and S3 Evidence Vault',
    'https://docs.aws.amazon.com/vpc/latest/userguide/what-is-amazon-vpc.html'
FROM public.target_roles tr, public.market_skills ms
WHERE tr.name = 'Cloud Solutions Architect' AND ms.name = 'AWS Cloud Architecture'
ON CONFLICT DO NOTHING;

INSERT INTO public.roadmap_items (target_role_id, skill_id, instruction, resource_link)
SELECT 
    tr.id,
    ms.id,
    'Containerize Microservices with Docker and Deploy to AWS ECS/EKS Cluster',
    'https://docs.docker.com/get-started/'
FROM public.target_roles tr, public.market_skills ms
WHERE tr.name = 'Cloud Solutions Architect' AND ms.name = 'Docker & Kubernetes'
ON CONFLICT DO NOTHING;

INSERT INTO public.roadmap_items (target_role_id, skill_id, instruction, resource_link)
SELECT 
    tr.id,
    ms.id,
    'Architect Event-Driven Decoupled Pipelines with AWS Lambda, API Gateway & SNS',
    'https://aws.amazon.com/serverless/'
FROM public.target_roles tr, public.market_skills ms
WHERE tr.name = 'Cloud Solutions Architect' AND ms.name = 'System Design & Microservices'
ON CONFLICT DO NOTHING;

INSERT INTO public.roadmap_items (target_role_id, skill_id, instruction, resource_link)
SELECT 
    tr.id,
    ms.id,
    'Establish Automated CloudWatch Telemetry and SNS Alert Monitoring',
    'https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/WhatIsCloudWatch.html'
FROM public.target_roles tr, public.market_skills ms
WHERE tr.name = 'Cloud Solutions Architect' AND ms.name = 'CI/CD & Infrastructure as Code'
ON CONFLICT DO NOTHING;

INSERT INTO public.roadmap_items (target_role_id, skill_id, instruction, resource_link)
SELECT 
    tr.id,
    ms.id,
    'Build Automated CI/CD GitHub Actions Workflow for AWS Amplify & S3 Deployments',
    'https://docs.github.com/actions'
FROM public.target_roles tr, public.market_skills ms
WHERE tr.name = 'DevOps & Platform Engineer' AND ms.name = 'CI/CD & Infrastructure as Code'
ON CONFLICT DO NOTHING;

INSERT INTO public.roadmap_items (target_role_id, skill_id, instruction, resource_link)
SELECT 
    tr.id,
    ms.id,
    'Build Serverless Next.js 16 SSR Platform with React 19 and Tailwind CSS',
    'https://nextjs.org/docs'
FROM public.target_roles tr, public.market_skills ms
WHERE tr.name = 'Full-Stack Cloud Engineer' AND ms.name = 'TypeScript & Next.js'
ON CONFLICT DO NOTHING;

-- 4. Automatically Assign Student to 'Cloud Solutions Architect' Track
INSERT INTO public.student_target_roles (student_id, role_id)
SELECT 
    p.id,
    tr.id
FROM public.profiles p, public.target_roles tr
WHERE p.email IN ('student@calibrate.edu', 'abhijeet@calibrate.edu')
  AND tr.name = 'Cloud Solutions Architect'
ON CONFLICT DO NOTHING;

-- 5. Permissive policies for market_updates
DROP POLICY IF EXISTS "Public read market_updates" ON public.market_updates;
CREATE POLICY "Public read market_updates" ON public.market_updates FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow write market_updates" ON public.market_updates;
CREATE POLICY "Allow write market_updates" ON public.market_updates FOR ALL USING (true) WITH CHECK (true);

-- 6. Seed Market Updates Across Categories (Frontend, Backend, AI, Cloud, General)
INSERT INTO public.market_updates (title, content, category)
VALUES 
(
    'Next.js 16 & React 19 Server Actions Lead Frontend Demands',
    'Campus recruiters and enterprise tech firms report a 42% increase in hiring evaluations focusing on React 19 Server Components, Streaming SSR, and TypeScript UI architectures.',
    'Frontend'
),
(
    'Microservices & Distributed Systems Mastery in High Demand',
    'Top cloud employers are screening candidates on high-throughput REST/gRPC backend APIs, PostgreSQL indexing optimization, and Dockerized microservice architecture.',
    'Backend'
),
(
    'Generative AI Orchestration & Vector Search Standard in 2026',
    'Engineering teams now expect new college graduates to possess hands-on familiarity with LLM integrations, RAG architectures, and AWS Bedrock / OpenAI API orchestration.',
    'AI'
),
(
    'Enterprise Shift Toward Multi-Tier AWS Architectures & VPCs',
    'AWS Cloud Architect roles require demonstrable proof-of-work in Amazon S3 Evidence Vaults, IAM least-privilege policies, and CloudWatch telemetry pipelines.',
    'Cloud'
),
(
    'CDC Placement Guideline: Proof-of-Work Portfolios Mandatory',
    'Campus recruitment drives now mandate live deployed cloud applications and verified GitHub proof-of-work submissions over static resumes.',
    'General'
)
ON CONFLICT DO NOTHING;


