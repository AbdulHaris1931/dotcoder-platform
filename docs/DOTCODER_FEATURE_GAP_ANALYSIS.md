# DotCoder — Comprehensive Feature Gap Analysis (Phase 0)

> **Document Type:** Systematic Feature Gap Analysis & Technical Comparison  
> **Platform Name:** DotCoder Enterprise SaaS  
> **Date:** November 2026  

---

## 1. Domain-by-Domain Gap Analysis

This analysis evaluates the delta between the **current implementation** (cataloged in `DOTCODER_CURRENT_STATE_AUDIT.md`) and the **target SaaS specification** (defined in `DOTCODER_TARGET_ARCHITECTURE.md`).

---

### Domain 1: Identity, Organization & Multi-Tenancy

| Capability | Current State | Target SaaS Requirement | Gap Description & Severity |
|---|---|---|---|
| **Role Hierarchy** | 4 roles (`student`, `admin`, `super_admin`, `tpo`). Database check constraint has only 3 roles. | 6 roles: `student`, `teacher`, `admin`, `tpo`, `super_admin`, `recruiter`. | **HIGH:** Teacher and Recruiter roles are missing from database schema, TypeScript types, and route guards. |
| **Multi-Tenancy Isolation** | Relies on string matching `college_name: text` on profiles. | Foreign key `organization_id UUID REFERENCES organizations(id)` on all tenant entities. | **CRITICAL:** High risk of cross-tenant data leakage if institution names have typographical variations. |
| **Department & Batch Hierarchy** | Free-text strings (`department: text`, `batch_year: int`). | Relational entities: `departments` and `batches` with assigned faculty mentors. | **MEDIUM:** Cannot assign a teacher to a specific batch or track cohort-level analytics cleanly. |
| **Server-Side Route Protection** | Client-side redirects in `AppShell` and page components. | Next.js server-side middleware and layout route guards verifying signed JWT session and role. | **HIGH:** Client-side guards alone can be bypassed via direct API calls or script injection. |

---

### Domain 2: Student Learning & Curriculum System

| Capability | Current State | Target SaaS Requirement | Gap Description & Severity |
|---|---|---|---|
| **Curriculum Persistence** | Relational schema exists in `supabase/migrations/20261119000000_curriculum_assessment_schema.sql`, but runtime loads from in-memory `SEED_LESSONS` and `localStorage`. | All lessons, modules, topics, and problems query Supabase `curriculum_*` tables with client cache. | **HIGH:** Curriculum modifications made by administrators in the UI do not persist across user devices or sessions. |
| **5-Stage Problem Progression** | 5 problem types modeled (`Guided Warmup`, `Pattern Application`, `Edge-Case Trap`, `Combined Concept`, `Company Challenge`). | Full problem bank mapped across all 100 topics with structured walkthroughs. | **MEDIUM:** High quality seed content exists for Lesson 1-3; Lessons 4-10 need complete progressive problem coverage. |
| **Concept Study Notes** | Markdown quick guides embedded in seed data. | Concept walkthroughs with Big-O cheat sheets, common pitfall callouts, and code examples. | **LOW:** Core UI is implemented; content needs expansion across advanced DSA topics. |

---

### Domain 3: DotLab Coding Workspace & Execution

| Capability | Current State | Target SaaS Requirement | Gap Description & Severity |
|---|---|---|---|
| **Python Execution** | Client-side execution via Pyodide. | Production WebWorker Pyodide sandbox with execution timeout watchdog and memory monitoring. | **MEDIUM:** Main thread Pyodide execution can freeze browser UI on infinite loops (`while True`). |
| **Compiled Language Execution** | Piston adapter in `/api/execute` with fallback to `evaluateDeterministicCode()` simulation. | Isolated execution provider (Piston / Judge0) with explicit visual simulation indicators when keys are absent. | **CRITICAL:** Simulated pass checks must be explicitly marked as `SIMULATED_DEMO` and quarantined from verified credentials. |
| **Run vs Submit Separation** | In DotLab, both Run and Submit trigger client evaluation stubs with random execution delays. | **Run:** tests public cases (TC 1-2). **Submit:** server-side evaluation against all 6 cases, persisting submission to database. | **HIGH:** Submissions currently persist only to `localStorage` unless running with active Supabase connection. |
| **Hidden Testcase Security** | Testcases are filtered client-side (`!tc.is_hidden`). | Hidden testcases (TC 3-6) must **never be transmitted to the browser client**; evaluated strictly server-side. | **CRITICAL:** Inspecting browser network payload reveals hidden expected outputs. |

---

### Domain 4: DotCoder Skill Intelligence Engine

| Capability | Current State | Target SaaS Requirement | Gap Description & Severity |
|---|---|---|---|
| **Readiness Scoring** | Single scalar `readiness_score: number` incremented by flat points (`+2` or `+5`). | 6-Dimensional Skill Intelligence Index: Accuracy, Problem-Solving Index, DSA Mastery, Efficiency, Consistency, Placement Readiness. | **CRITICAL:** Current score does not reflect genuine algorithmic depth, time complexity, or problem difficulty. |
| **Topic Mastery Radar** | Radar chart in `<StudentDrawer />` displays heuristic sample data. | Live radar chart driven by real topic-level submissions and pass rates across 12 DSA categories. | **HIGH:** Radar chart looks visually impressive but does not reflect true student performance metrics. |
| **Adaptive Learning Recommendations** | Static problem recommendations based on un-attempted problem list. | Rule-based weakness detection (e.g. *"Candidate failed 3 recursion boundary cases -> Recommend Lesson 2 Module 2"*). | **HIGH:** System does not dynamically adapt to candidate learning stumbling blocks. |

---

### Domain 5: Teacher / Mentor Portal

| Capability | Current State | Target SaaS Requirement | Gap Description & Severity |
|---|---|---|---|
| **Dedicated Portal Route** | `/teacher` routes do **not exist**. Mentors use `/tpo` or `/admin` with department filters. | Dedicated `/teacher/*` portal: Dashboard, Batches, Student Insights, Assignments, Feedback. | **CRITICAL:** Missing primary product priority domain explicitly required by platform specification. |
| **Targeted Task Assignment** | No assignment feature exists. | Teachers can bundle 3-5 problems, set submission deadlines, and monitor student completion. | **HIGH:** Teachers cannot prescribe homework, lab tasks, or remedial practice to cohorts. |
| **Mentoring Feedback** | No feedback channel exists. | Teachers can annotate student code submissions and send direct guidance cards to student dashboard. | **MEDIUM:** Missing interaction loop between faculty and learners. |

---

### Domain 6: Assessment & Examination Engine

| Capability | Current State | Target SaaS Requirement | Gap Description & Severity |
|---|---|---|---|
| **Server-Side Scoring** | Examination score is calculated in browser state and sent to database. | Answers evaluated server-side; client submits raw answer indices/code; server calculates authoritative score. | **HIGH:** Vulnerable to client-side score spoofing via DevTools. |
| **Attempt Immutability** | Submissions record latest attempt; modifying an assessment alters historical attempts. | Historical snapshotting: `assessment_attempts` records an immutable copy of questions at time of examination. | **MEDIUM:** Critical for institutional NAAC accreditation and university audit logs. |
| **Proctoring Integrity Audit** | Tab-switch and blur events logged in component state; generates warning modals. | Violation timestamps persisted to database with transparent integrity log; zero punitive automatic disqualification. | **LOW:** Core client-side detection is implemented; needs database persistence. |

---

### Domain 7: Campus Placement & Recruiter Portal

| Capability | Current State | Target SaaS Requirement | Gap Description & Severity |
|---|---|---|---|
| **Recruiter Self-Service Portal** | `/recruiter` routes do **not exist**. | Dedicated `/recruiter/*` portal: Company Profile, Consenting Talent Discovery, Technical Challenges, Applicant Stages. | **CRITICAL:** Missing third core stakeholder domain. |
| **Candidate Consent Controls** | Students are automatically visible in college lists. | Explicit privacy toggle: "Allow verified recruiters to discover my skill profile". | **HIGH:** Mandatory for student privacy compliance and institutional data governance. |
| **Drive Application Pipeline** | Basic status dropdown (`Applied` -> `Shortlisted` -> `Interview` -> `Offer`). | Controlled stage workflow with automated email/dashboard notifications and interview scheduling notes. | **MEDIUM:** Status management is basic; needs rich timeline view. |

---

### Domain 8: Student Resume & Credential Verification

| Capability | Current State | Target SaaS Requirement | Gap Description & Severity |
|---|---|---|---|
| **Cryptographic Credential Verification** | Resume renders a visual SVG QR code with generic text validation. | Unique cryptographic credential hash verified at public endpoint `/verify/[credentialId]`. | **HIGH:** Scanning QR code currently does not resolve to an authoritative verification landing page. |
| **Credential Revocation & Privacy** | Static render. | Revocation checks and public vs private profile visibility toggles. | **MEDIUM:** Required for production credential integrity. |

---

## 2. Prioritized Action Matrix

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   PRIORITY MATRIX                                      │
├───────────────────┬────────────────────────────────────────────────────────────────────┤
│ P0 (CRITICAL)     │ 1. Separate RUN vs SUBMIT with server-side hidden testcases        │
│                   │ 2. Remove simulated execution from verified scoring paths          │
│                   │ 3. Build multi-dimensional DotCoder Skill Intelligence Engine      │
│                   │ 4. Build dedicated Teacher Portal (/teacher)                       │
│                   │ 5. Enforce multi-tenant organization_id relational boundaries      │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ P1 (HIGH)         │ 1. Migrate CurriculumStore from localStorage to Supabase           │
│                   │ 2. Implement server-side route guards in Next.js middleware        │
│                   │ 3. Build Recruiter Portal (/recruiter) with candidate consent      │
│                   │ 4. Implement server-side assessment score evaluation               │
│                   │ 5. Implement public /verify/[credentialId] cryptographic lookup    │
├───────────────────┼────────────────────────────────────────────────────────────────────┤
│ P2 (MEDIUM)       │ 1. Batch and Assignment management for teachers                    │
│                   │ 2. WebWorker Pyodide execution with timeout watchdog               │
│                   │ 3. Immutable assessment attempt snapshotting                       │
│                   │ 4. Department and Batch relational management UI                   │
└───────────────────┴────────────────────────────────────────────────────────────────────┘
```
