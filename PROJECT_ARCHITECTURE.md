# Project Architecture & Workflow Overview

This document provides a technical deep dive into the **MarketReady** platform—a career tracking and skill verification system designed to bridge the gap between student learning and market demands.

---

## 1. Executive Summary
**MarketReady** is an advanced career-readiness platform that empowers students to navigate personalized career paths (Career Tracks). It integrates real-time market insights with dynamic curricula, allowing students to submit verifiable proof of work which is then reviewed by mentors to ensure 100% proficiency in industry-relevant skills.

---

## 2. The Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Next.js 15 (App Router), React 19, Lucide React (Icons) |
| **Styling** | Tailwind CSS (Utility-first styling, Glassmorphism elements) |
| **Database/Backend** | Supabase (PostgreSQL, Auth, Row Level Security) |
| **Language** | TypeScript (Strict type safety across the stack) |

### Why Server Actions?
MarketReady utilizes **Next.js Server Actions** (`lib/actions/`) instead of traditional API routes for several reasons:
- **Direct Database Access**: Actions run on the server, allowing direct use of the Supabase server client without exposing service roles or complex fetching logic to the client.
- **Type Safety**: Seamlessly share types between the frontend and backend logic.
- **Reduced Boilerplate**: Eliminates the need for manual `fetch` calls and separate route handlers.
- **Built-in Cache Invalidation**: Uses `revalidatePath` to instantly update the UI after a mutation, ensuring students and mentors see real-time progress.

---

## 3. Core User Roles & Workflows

### Admin (CDC Coordinator)
The Admin is responsible for the platform's "source of truth"—the tracks and the skills.
- **Career Track Management**: Admins create and update `target_roles` (e.g., "Fullstack Developer"), assigning them a `market_demand_score` based on industry data.
- **Curriculum Building**: Within a track, Admins build the roadmap by creating `roadmap_items`. Each item consists of a task instruction, a resource link, and a linked `market_skill`.
- **Market Broadcasts**: Admins can broadcast market updates to all students, which can dynamically influence roadmap tasks.

### Student
The Student journey is focused on achievement and progress tracking.
- **Path Selection**: Students choose a `target_role` to generate their personalized roadmap.
- **Skill Acquisition**: Students follow the roadmap milestones, accessing resources provided by the CDC.
- **Proof of Work**: For each task, students submit a `proof_link` (e.g., a GitHub Repo or Portfolio URL). This is saved in the `student_progress` table with a `pending` status.
- **Ready Score**: Students track their "Market Readiness" via a progress bar that reflects their verified skills against the track's requirements.

### Mentor
Mentors act as the quality gatekeepers of the platform.
- **Verification Queue**: Mentors access a real-time queue of `pending` submissions from the `student_progress` table.
- **Feedback Loop**: Mentors review the proof and can either **Approve** (marking the task `verified`) or **Reject** with specific `mentor_feedback`.
- **Skill Granting**: Once a task is approved, a database trigger or server action automatically updates the student's proficiency in the linked `market_skill` to 100%.

---

## 4. Database Schema Overview

| Table | Purpose | Key Relations |
| :--- | :--- | :--- |
| `users` / `profiles` | Stores user identity, roles (admin, student, mentor), and full names. | Linked to `auth.users` (Supabase Auth). |
| `target_roles` | Definitions of career paths and their required skills (JSON). | Parent to `roadmap_items`. |
| `market_skills` | Master list of skills (e.g., React, SQL). Includes "hot" status. | Linked to `roadmap_items` and `student_skills`. |
| `roadmap_items` | The individual milestones within a specific career track. | FK to `target_roles` and `market_skills`. |
| `student_progress`| Tracks the status of a student's attempt at a roadmap item. | FK to `users`, `roadmap_items`. |
| `student_skills` | The "source of truth" for a student's proficiency levels. | FK to `users`, `market_skills`. |

---

## 5. Data Flow & State Management

MarketReady follows a **Unidirectional Data Flow** with server-side validation.

1.  **Trigger**: A student fills out a "Submit Proof" form in a Client Component.
2.  **Action**: The `submitRoadmapProof` Server Action is called with the `roadmap_item_id` and `proof_url`.
3.  **Persistence**: The action interacts with **Supabase**, performing an `upsert` on the `student_progress` table to set the status to `pending`.
4.  **Revalidation**: Upon success, the server calls `revalidatePath("/student/roadmap")`.
5.  **UI Update**: Next.js automatically purges the data cache for that route. On the client side, `router.refresh()` ensures the UI updates to show the "Pending Verification" state without a full page reload.

---

> [!NOTE]
> All database interactions are protected by **Supabase Row Level Security (RLS)**, ensuring students can only view/edit their own progress, while mentors can only access pending submissions in their assigned scope.
