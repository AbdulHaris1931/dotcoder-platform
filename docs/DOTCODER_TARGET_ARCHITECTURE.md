# DotCoder — Target Product & System Architecture (Phase 0)

> **Document Type:** Production-Ready Target SaaS Architecture Specification  
> **Platform Name:** DotCoder Enterprise SaaS  
> **Aesthetic Philosophy:** Obsidian Charcoal, Deep Forest Green & Electric Lime (`#9DFF00`)  
> **Date:** November 2026  

---

## 1. High-Level Modular Monolith Architecture

DotCoder is engineered as a high-performance **modular monolith** on Next.js 14 App Router, PostgreSQL (Supabase), and browser-native WebAssembly. It balances horizontal scalability with operational simplicity, avoiding premature microservice overhead while enforcing strict domain separation through distinct service layers.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               NEXT.JS APP ROUTER FRONTEND                              │
│  ┌─────────────────┬──────────────────┬─────────────────┬───────────────────────────┐  │
│  │ Student Portal  │  Teacher Portal  │  Admin / TPO    │  Recruiter Portal         │  │
│  │ (/student/*)    │  (/teacher/*)    │  (/tpo/*)       │  (/recruiter/*)           │  │
│  └────────┬────────┴────────┬─────────┴────────┬────────┴─────────────┬─────────────┘  │
│           │                 │                  │                      │                │
│           ▼                 ▼                  ▼                      ▼                │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │                         SHARED ENTERPRISE DESIGN SYSTEM                          │  │
│  │       Obsidian (#111111) │ Deep Forest (#17251B) │ Electric Lime (#9DFF00)       │  │
│  │       AppShell Layout    │ Monaco DotLab IDE     │ Recharts Telemetry Visualizers│  │
│  └──────────────────────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                  SERVER & DOMAIN SERVICES                              │
│  ┌──────────────────────┬──────────────────────┬────────────────────────────────────┐  │
│  │ Identity & RBAC      │ Curriculum Service   │ DotCoder Skill Intelligence Engine │  │
│  │ • Multi-Tenant Auth  │ • Lessons 1-10       │ • Accuracy & Problem Solving Index │  │
│  │ • Server Route Guard │ • 20 Modules / 100 T │ • DSA Mastery & Efficiency Vector  │  │
│  ├──────────────────────┼──────────────────────┼────────────────────────────────────┤  │
│  │ Execution Service    │ Assessment Engine    │ Placement & Recruitment Service    │  │
│  │ • Pyodide WebWorker  │ • Proctored Runtime  │ • Drive Workflow Engine            │  │
│  │ • Judge0/Piston API  │ • Server-Side Score  │ • Consenting Talent Search         │  │
│  │ • Sandboxed Fallback │ • Anti-Tamper Logs   │ • Cryptographic QR Credential      │  │
│  └──────────────────────┴──────────────────────┴────────────────────────────────────┘  │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              POSTGRESQL & SUPABASE CLOUD                               │
│  ┌──────────────────────┬──────────────────────┬────────────────────────────────────┐  │
│  │ Multi-Tenant Schema  │ Submissions & Exec   │ Skill Snapshots & History          │  │
│  │ organizations        │ submissions          │ student_skill_profiles             │  │
│  │ departments, batches │ execution_logs       │ skill_history_snapshots            │  │
│  │ profiles (6 roles)   │ assessment_attempts  │ adaptive_recommendations           │  │
│  ├──────────────────────┼──────────────────────┼────────────────────────────────────┤  │
│  │ Curriculum Hierarchy │ Assessment Bank      │ Recruitment & Credentials          │  │
│  │ curriculum_lessons   │ curriculum_module_   │ campus_drives, drive_applications  │  │
│  │ curriculum_modules   │   assessments        │ recruiter_companies, challenges    │  │
│  │ curriculum_topics    │ curriculum_assess_   │ verified_credentials, audit_logs   │  │
│  │ curriculum_problems  │   ment_mcqs          │                                    │  │
│  └──────────────────────┴──────────────────────┴────────────────────────────────────┘  │
│  PostgreSQL Row-Level Security (RLS) Policy Isolation by organization_id & role        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Multi-Tenant Identity & Role-Based Access Control (RBAC)

### 2.1 User Roles & Scope Boundaries

| Role | Scope | Permitted Capabilities | Prohibited Capabilities |
|---|---|---|---|
| **Student** | Own Profile & Cohort | Practice problems, study curriculum, take assigned assessments, build ATS resume, apply for eligible drives. | Viewing other students' submissions, modifying problems, viewing hidden test cases. |
| **Teacher / Mentor** | Assigned Departments & Batches | Monitor student progress, review failed submissions, assign practice tasks, schedule cohort tests, provide mentoring feedback. | Accessing other institutions, modifying global platform settings, accessing recruiter contracts. |
| **Institution Admin** | Enrolled Institution | Manage departments, batches, student/teacher rosters, configure curriculum, manage problems, review NAAC Criterion 5.2.1 audit logs. | Accessing data from other college tenants. |
| **Training & Placement Officer (TPO)** | Enrolled Institution | Manage campus recruitment drives, review student readiness indices, shortlist applicants, export placement CSVs. | Modifying global code evaluation infrastructure. |
| **Recruiter / Company Rep** | Partner Company | Create company profile, post hiring challenges, filter consenting candidates by verified skills/DSA mastery, manage applicant pipeline. | Viewing non-consenting students, accessing raw institutional academic records without permission. |
| **Super Admin** | Platform-Wide | System health, global problem bank management, subscription tiers, platform audit logs. | Unrestricted bypass of multi-tenant cryptographic verification. |

### 2.2 Server-Side Route Guard Architecture
All protected routes route through Next.js middleware and server-side layout guards:
- `/student/*` -> verified session, `role === 'student'`
- `/teacher/*` -> verified session, `role === 'teacher' || role === 'admin'`
- `/tpo/*` -> verified session, `role === 'tpo' || role === 'admin'`
- `/admin/*` -> verified session, `role === 'admin' || role === 'super_admin'`
- `/recruiter/*` -> verified session, `role === 'recruiter'`

---

## 3. The DotCoder Skill Intelligence Engine

The Skill Intelligence Engine is the central brain of the platform. It replaces arbitrary scalar readiness scores with a **6-dimensional versioned mathematical evaluation model**:

```
                       ┌──────────────────────────────┐
                       │  DOTCODER SKILL INTELLIGENCE │
                       │         ENGINE (v2.0)        │
                       └──────────────┬───────────────┘
                                      │
         ┌──────────────┬─────────────┼─────────────┬──────────────┬─────────────┐
         ▼              ▼             ▼             ▼              ▼             ▼
  ┌─────────────┐┌─────────────┐┌───────────┐┌─────────────┐┌────────────┐┌──────────────┐
  │   Coding    ││  Problem-   ││    DSA    ││ Algorithmic ││  Learning  ││  Placement   │
  │  Accuracy   ││Solving Index││  Mastery  ││ Efficiency  ││Consistency ││  Readiness   │
  │   (ACC)     ││    (PSI)    ││   (DSA)   ││    (EFF)    ││   (CON)    ││    (PLR)     │
  └─────────────┘└─────────────┘└───────────┘└─────────────┘└────────────┘└──────────────┘
```

### 3.1 Dimensions & Formulations

1. **Coding Accuracy (ACC) [0 - 100]:**
   $$\text{ACC} = \left( \frac{\text{Passed Testcases}}{\text{Total Testcases Evaluated}} \times 0.6 \right) + \left( \frac{\text{Accepted Submissions}}{\text{Total Submissions}} \times 0.4 \right)$$
   Tracks genuine syntactic and algorithmic precision, penalizing brute-force trial-and-error submissions.

2. **Problem-Solving Index (PSI) [0 - 100]:**
   Evaluates performance on unfamiliar problems, edge-case handling, and progression from Easy through Hard problems without requesting progressive hints.
   $$\text{PSI} = \frac{\sum (w_{\text{diff}} \times \text{Solved}_{\text{diff}} \times (1 - 0.15 \times \text{HintsUsed}))}{\text{Target Standard}}$$

3. **DSA Topic Mastery Vector (DSA) [0 - 100 per topic]:**
   Tracks granular proficiency across 12 core algorithmic categories:
   - Arrays, Strings, Searching, Sorting, Two Pointers, Stacks, Queues, Linked Lists, Trees & BST, Hashing, Recursion & Backtracking, Dynamic Programming.

4. **Algorithmic Efficiency (EFF) [0 - 100]:**
   Compares candidate runtime ($O(n)$ vs $O(n^2)$) and space usage against target complexity benchmarks for that problem.

5. **Learning Consistency (CON) [0 - 100]:**
   Decay-weighted practice frequency over 30-day and 90-day moving windows, discouraging last-minute cramming.

6. **Placement Readiness Index (PLR) [0 - 100%]:**
   Composite weighted index:
   $$\text{PLR} = 0.25(\text{ACC}) + 0.25(\text{PSI}) + 0.25(\text{DSA}) + 0.15(\text{EFF}) + 0.10(\text{CON})$$

---

## 4. Code Execution Infrastructure (DotLab)

DotLab operates on an isolated dual-engine execution model:

1. **Client-Side Python WebWorker (Pyodide WASM):**
   - Zero server cost, zero latency.
   - Executes Python 3.11 in an isolated WebWorker with a 5.0-second execution watchdog timer.
   - Intercepts `stdin` / `stdout` for testcase verification without sending sensitive code to third-party endpoints.

2. **Server-Side Compiled Sandbox Adapter (Judge0 / Piston):**
   - For C, C++, Java, and SQL.
   - Invokes sandboxed micro-container execution with strict memory caps (256MB) and execution limits (2000ms).
   - If external compiler API keys are unconfigured, routes through an explicit **Sandbox Simulator with Visual Warning Banner** (`SIMULATED_DEVELOPMENT_MODE = true`), explicitly preventing simulated results from updating verified production skill credentials.

---

## 5. Teacher / Mentor Portal Architecture

The Teacher experience is architected around actionable cohort intervention:

1. **Cohort Monitoring Grid:**
   - Real-time departmental telemetry (BCA, B.Sc CS, B.Sc IT, MCA).
   - Identifies struggling students (e.g. *"14 students failed Recursion Boundary Cases"*).
2. **Assignment & Targeted Task Engine:**
   - Teachers create customized problem bundles (3 warmups + 1 edge-case challenge) with due dates.
   - Auto-tracks assignment completion rates and auto-grades test cases.
3. **Student Drill-Down & Submission Inspection:**
   - Teachers view candidate code side-by-side with execution logs, failed test cases, and proctoring logs.

---

## 6. Recruiter & Campus Placement Architecture

1. **Recruiter Self-Service:**
   - Verified corporate profiles (Zoho, TCS, Cognizant, Infosys, etc.).
   - Role creation with explicit minimum skill thresholds (e.g. `PLR >= 80%`, `DSA (Dynamic Programming) >= 75%`).
2. **Consenting Candidate Search:**
   - Search index limited strictly to students who opted into recruiter discovery.
   - Anonymized skill profiles viewable prior to interview shortlisting.
3. **Application Stage Machine:**
   `Applied` -> `Shortlisted for Test` -> `Technical Challenge` -> `Technical Interview` -> `HR Interview` -> `Offer Extended` / `Rejected`.

---

## 7. Cryptographic Credential & Verification Service

- Every student achieving Placement Ready status ($\ge 75\%$) receives a verifiable digital credential.
- Unique hash: `SHA-256(student_id + college_id + readiness_score + timestamp + secret_salt)`.
- Public endpoint `/verify/[credentialId]` displays cryptographically verified achievements without leaking private personal identity.
