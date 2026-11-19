# DotCoder — Comprehensive Current State Audit Report (Phase 0)

> **Document Type:** System-Wide Current State & Architecture Audit  
> **Platform Name:** DotCoder Enterprise SaaS  
> **Evaluation Date:** November 2026  
> **Lead Architecture Team:** Principal Software Architect, Senior Full-Stack Engineer, Product Designer, Database Architect, DevSecOps Engineer, QA Automation Engineer  
> **Status:** Baseline Completed — Zero-Destructive Assessment  

---

## 1. Executive System Overview

DotCoder is currently deployed as a Next.js 14 App Router application with Tailwind CSS, Lucide icons, Monaco Editor (`@monaco-editor/react`), and Supabase integration (`@supabase/ssr` and `@supabase/supabase-js`). The platform provides a sleek Obsidian & Electric Lime (`#9DFF00`) aesthetic with modules for student coding practice, assessments, curriculum hierarchy, placement drives, ATS resumes, and administrative management.

This audit evaluates the codebase across all architectural layers — data persistence, business logic, authorization, code execution, state management, and UI integrity — establishing a definitive inventory of what works, what is simulated, what is incomplete, and what must be restructured.

---

## 2. Architecture & File Inventory

### 2.1 Repository Structure & Package Dependencies
- **Next.js:** `14.2.24` (App Router, Node.js runtime)
- **React:** `18.3.1` / `react-dom: 18.3.1`
- **TypeScript:** `5.7.3` (`strict: true`)
- **Styling:** Tailwind CSS `3.4.17`, Framer Motion `14.14.0`, Lucide React `0.475.0`
- **Charts:** Recharts `2.15.1`
- **Editor:** `@monaco-editor/react: 4.6.0`
- **Database / Auth:** `@supabase/ssr: 0.5.2`, `@supabase/supabase-js: 2.48.1`
- **Quality Gates:** ESLint `8.57.1`, Next.js static build (18 static routes, 4 dynamic API/SSR routes)

### 2.2 Route & Domain Map

| Route | Role Access | Purpose | Implementation Status |
|---|---|---|---|
| `/` | Public | Public landing page, product vision, enterprise pilot anchor | **WORKING** |
| `/login` | Public | Institutional SSO / email login with verified seed pills | **WORKING** |
| `/signup` | Public | Candidate self-registration with college selection | **WORKING** |
| `/student/dashboard` | Student | Command center: readiness score, streak, activity heatmap, problem list | **WORKING** (Blended Supabase + DemoStore) |
| `/curriculum` | Student | 10-Lesson progressive curriculum explorer, 3D featured module card | **WORKING** (In-memory + localStorage) |
| `/practice/[problemId]` | Student | DotLab 3-pane IDE with Monaco editor, testcase console, expandable details | **WORKING** (Client WASM / Fallback) |
| `/student/lab/[slug]` | Student | Route redirect alias to `/practice/[problemId]` | **WORKING** |
| `/student/exam/[id]` | Student | 20Q proctored module exam with countdown timer and question palette | **WORKING** (Client-side proctoring state) |
| `/student/simulator` | Student | Corporate recruitment test simulator (Zoho, TCS, Cognizant, Infosys) | **WORKING** (Local assessment runner) |
| `/student/drives` | Student | Campus recruitment drive listings, eligibility check, 1-click apply | **WORKING** (Persistent via DemoStore / Supabase) |
| `/student/resume` | Student | ATS-friendly verified resume, QR credential, PDF export trigger | **WORKING** (SVG QR + Print CSS) |
| `/tpo/dashboard` | TPO / Admin | Placement cell executive KPI dashboard, department readiness stats | **WORKING** (Dynamic discovery) |
| `/tpo/students` | TPO / Admin | Student registry table with pagination, search, `<StudentDrawer />` telemetry | **WORKING** (Supabase + Drawer) |
| `/admin/dashboard` | Admin / TPO | Institutional analytics, department drill-downs, drive tracker | **WORKING** |
| `/admin/problems` | Admin | Coding challenge creation modal, testcase configuration, list filters | **WORKING** (Supabase + Local fallback) |
| `/admin/assessments` | Admin | Assessment builder modal, target college selector, duration settings | **WORKING** (Supabase + Local fallback) |
| `/admin/drives` | Admin / TPO | Pipeline stage management for campus recruitment drives | **WORKING** |
| `/api/execute` | Internal API | Code execution endpoint supporting Piston API with sandbox fallback | **WORKING** (Fallback is simulated) |

---

## 3. Detailed Architectural Inspection

### 3.1 Authentication & Multi-Tenancy Layer
* **Current State:**
  - `src/lib/supabase/client.ts` uses `@supabase/ssr` browser client.
  - `src/lib/supabase/server.ts` uses `@supabase/ssr` server client with cookie store.
  - Multi-tenancy is currently modeled using `college_name: text` on `profiles`, `problems`, and `assessments` rather than a strict `organization_id` foreign key.
  - `profiles.role` check constraint in `supabase/schema.sql` is `'student', 'admin', 'super_admin'`. In `src/types/index.ts`, `UserRole` includes `"tpo"`.
  - Roles for **Teacher / Mentor** and **Recruiter / Company Representative** are currently unrepresented in database schemas, RLS policies, and navigation guards.
* **Security & Privacy Risks:**
  - Route authorization is primarily handled via client-side redirect checks in `AppShell` and page components rather than server-side edge middleware.
  - No database tenant boundary (`organization_id`) exists to isolate college records at the row level; queries rely on `eq("college_name", ...)` filters.

### 3.2 Database Schema & Migration Layer
* **`supabase/schema.sql` (Base Schema):**
  - Tables: `profiles`, `problems`, `test_cases`, `assessments`, `submissions`.
  - Trigger: `handle_new_user()` populates `profiles` on `auth.users` creation.
  - RLS: Basic policies on profiles and submissions.
* **`supabase/migrations/20261119000000_curriculum_assessment_schema.sql` (Curriculum Schema):**
  - Tables: `curriculum_lessons`, `curriculum_modules`, `curriculum_topics`, `curriculum_problems`, `curriculum_test_cases`, `curriculum_module_assessments`, `curriculum_assessment_mcqs`.
  - Foreign key cascades and unique constraints are sound (`unique_lesson_module`, `unique_module_topic`, `unique_problem_case`).
* **Current Gap:**
  - The frontend (`CurriculumStore` in `src/lib/curriculum-store.ts`) reads from static in-memory data structures (`src/lib/curriculum-data.ts`) and caches submissions in `localStorage` (`dotcoder_curriculum_submissions`) rather than executing queries against the Supabase `curriculum_*` tables.

### 3.3 Code Execution Engine (`/api/execute` & DotLab)
* **Current Execution Pipeline:**
  1. **Python Client WASM:** Executes in-browser via Pyodide when available.
  2. **External Piston / Judge0:** If `ONLINECOMPILER_API_KEY` is set in `.env.local`, routes requests to `https://api.onlinecompiler.io/api/v2/piston/execute`.
  3. **Deterministic Sandbox Evaluator:** In `src/lib/code-evaluator.ts`, when API keys are absent, code is checked for minimal syntax and returns simulated passing results (`actualOutput = tc.expectedOutput`).
  4. **Curriculum Store Evaluator:** `CurriculumStore.evaluateSubmission()` also uses a simulated pass check (`passed = true; actualOutput = tc.expected_output`) for code containing basic logic.
* **Critical Finding:**
  - While this guarantees zero crashes during offline demos, **simulated execution must never be represented as real compiler execution in production**, nor should simulated passes update official verified skill records.

### 3.4 Skill Intelligence & Readiness Scoring
* **Current State:**
  - Readiness score is stored as a single scalar `readiness_score: number` (0 to 100) on student profiles.
  - In `DataService.recordSubmission()`, the score is incremented by a flat `+2` or `+5` points per accepted problem, capped at 100.
* **Critical Finding:**
  - There is no multidimensional evaluation engine. Dimensions specified in the product vision (Coding Accuracy, Problem-Solving Index, DSA Mastery, Algorithmic Efficiency, Consistency, Adaptive Weakness Detection) are not yet calculated or snapshotted.

### 3.5 Teacher / Mentor Capabilities
* **Current State:**
  - Dedicated `/teacher` route group does **not exist**.
  - Faculty mentors currently share the `/tpo` or `/admin` interfaces with department filters.
  - No database tables exist for Teacher Assignments, Batch Mentorship, Targeted Practice Assignments, or Teacher Feedback.

### 3.6 Recruiter & Placement Pipeline
* **Current State:**
  - `/student/drives` and `/admin/drives` support drive listings, CTC details, minimum readiness thresholds, and multi-stage status tracking (`Applied`, `Shortlisted`, `Technical Interview`, `HR Interview`, `Offer Extended`, `Rejected`).
  - Recruiter portal (`/recruiter`), company self-registration, verified talent search, candidate consent management, and recruiter technical challenges are **not yet implemented**.

---

## 4. Feature Classification Register

Every feature currently present in the codebase is classified below:

| Feature / Subsystem | Current Implementation | Classification | Target Architecture Direction |
|---|---|---|---|
| **App Shell & Obsidian Layout** | `src/components/shared/app-shell.tsx` (collapsible sidebar, responsive, Electric Lime `#9DFF00`) | **KEEP & IMPROVE** | Retain layout; extend with role-based navigation for Teacher and Recruiter domains. |
| **Monaco Editor Integration** | `src/components/ide/split-pane-ide.tsx` (syntax highlighting, shortcuts, reset modal) | **KEEP & IMPROVE** | Retain editor; add execution timeout display, memory telemetry, and real sandbox engine. |
| **Authentication Flow** | Supabase Auth + `DemoStore` zero-crash fallback (`/login`, `/signup`) | **KEEP & IMPROVE** | Enforce server-side session validation; add organization domain validation and teacher/recruiter roles. |
| **Curriculum Data Schema** | Migration `20261119000000_curriculum_assessment_schema.sql` (10 lessons, 20 modules, 100 topics) | **KEEP & RESTRUCTURE** | Keep database schema; migrate frontend `CurriculumStore` from `localStorage` to Supabase queries. |
| **Code Execution Engine** | `/api/execute` with Piston adapter + deterministic simulation fallback | **RESTRUCTURE & REPLACE** | Replace simulated evaluator with an explicit Sandboxed Engine Adapter; clearly label development simulations. |
| **Student Readiness Score** | Single scalar `readiness_score: number` incremented by flat points | **REPLACE** | Replace with DotCoder Skill Intelligence Engine (6-dimensional versioned scoring service). |
| **Student Management Drawer** | `src/components/tpo/student-drawer.tsx` (telemetry, radar chart, recent submissions) | **KEEP & IMPROVE** | Retain UI; connect radar chart axes to real Skill Intelligence snapshots. |
| **Corporate Recruitment Simulator** | `src/app/student/simulator/page.tsx` (Zoho, TCS, Cognizant, Infosys test tracks) | **KEEP & IMPROVE** | Retain test tracks; persist simulator results to student skill history. |
| **Proctoring Telemetry** | Fullscreen exit, tab-switch, blur event logging in exam mode | **KEEP & IMPROVE** | Retain event capture; persist violation timestamps to database with transparent non-punitive audit logs. |
| **Campus Drives & Applications** | `src/app/student/drives` & `src/app/admin/drives` | **KEEP & IMPROVE** | Retain workflow; add recruiter company self-service portal and candidate consent filters. |
| **ATS Resume & QR Credential** | `src/app/student/resume/page.tsx` (verified badge, ATS layout, PDF download) | **KEEP & IMPROVE** | Retain layout; implement public cryptographic credential verification endpoint (`/verify/[id]`). |
| **In-Memory Seed Stores** | `src/lib/curriculum-data.ts`, `src/lib/demo-store.ts` (`localStorage`) | **RESTRUCTURE** | Retain strictly as an offline development demo fallback; route all primary operations through Supabase. |
| **Teacher / Mentor Domain** | Unimplemented (faculty use TPO/Admin view) | **CREATE (NEW)** | Build dedicated `/teacher` portal with batch monitoring, targeted task assignment, and feedback. |
| **Recruiter Domain** | Unimplemented | **CREATE (NEW)** | Build dedicated `/recruiter` portal with company profiles, consenting candidate search, and challenges. |

---

## 5. Identified Technical Debt & Risks

1. **Dual Storage Divergence:** Problems, submissions, and assessments exist in two parallel states: Supabase SQL tables vs `localStorage` (`DemoStore` / `CurriculumStore`). When a user solves a problem in `/practice/[problemId]`, progress is stored in `localStorage`, but does not automatically reflect in the Supabase `submissions` table if running offline.
2. **Simulated Compiler Execution:** While helpful for prototype demonstrations without external compiler API keys, simulated pass checks cannot power an authoritative skill certification SaaS.
3. **Missing Role Authorization Middleware:** Next.js middleware currently handles session refresh but lacks declarative role-based route protection (e.g. preventing students from loading `/admin/*` or `/tpo/*`).
4. **Tenant Isolation:** Absence of a foreign key `organization_id` on core tables prevents strict Row-Level Security isolation across multi-college institutional pilots.

---

## 6. Audit Conclusion

The foundational building blocks of DotCoder are exceptionally well-crafted: the obsidian design system, Monaco Editor integration, curriculum data modeling, proctoring telemetry, and TPO management interfaces are visually and structurally mature.

The primary engineering objective of the restructuring process is to **graduate the platform from a client-heavy prototype into a true enterprise multi-tenant SaaS**: replacing local storage stubs with Supabase relational persistence, establishing real sandboxed code evaluation, activating the multidimensional Skill Intelligence Engine, and introducing the Teacher and Recruiter product domains.
