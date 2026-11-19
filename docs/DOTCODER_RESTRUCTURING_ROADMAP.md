# DotCoder — Phased Restructuring & Transformation Roadmap (Phase 0)

> **Document Type:** Master Implementation & Restructuring Roadmap  
> **Platform Name:** DotCoder Enterprise SaaS  
> **Target Execution Strategy:** Incremental, Controlled Batches with Mandatory Build Gates  
> **Date:** November 2026  

---

## 1. Roadmap Architecture & Execution Principles

To guarantee zero downtime, 100% backward compatibility, and adherence to the Engineering Constitution (`AGENTS.md`):

1. **Zero-Destructive Operations:** Never delete or overwrite the existing database, migrations, environment files, authentication records, or user data.
2. **Preserve Working Functionality:** Every existing working feature (Monaco IDE, AppShell, Curriculum Explorer, TPO drawer, dynamic pagination) must remain functional at every step.
3. **Mandatory Build Gates:** After every phase, execute `npm run build` in the terminal to verify 0 TypeScript, ESLint, or Next.js compilation errors.
4. **Browser QA Gate:** Inspect layout, ergonomics, and console errors using browser automation before marking any phase complete.
5. **Transparency in Scoring:** No fabricated metrics, no simulated pass checks masquerading as real compiler output.

---

## 2. Phase-by-Phase Implementation Plan

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        PHASE 0: AUDIT & ARCHITECTURE (COMPLETE)                        │
│   • DOTCODER_CURRENT_STATE_AUDIT.md     • DOTCODER_TARGET_ARCHITECTURE.md              │
│   • DOTCODER_FEATURE_GAP_ANALYSIS.md    • DOTCODER_RESTRUCTURING_ROADMAP.md            │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                     PHASE 1: FOUNDATION RESTRUCTURING & RBAC                          │
│   • Multi-Tenant Schema (organizations, departments, batches)                          │
│   • 6-Role System (student, teacher, admin, tpo, super_admin, recruiter)              │
│   • Server-Side Next.js Route Guard Middleware                                         │
│   • Dynamic AppShell Role Navigation                                                   │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                  PHASE 2: STUDENT LEARNING & CURRICULUM PERSISTENCE                    │
│   • Migrate CurriculumStore from localStorage to Supabase relational tables           │
│   • 10-Lesson Progressive Problem Bank coverage (5 stages per topic)                   │
│   • Topic Concept Walkthroughs with Big-O Cheat Sheets                                 │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                     PHASE 3: DOTLAB PRODUCTION EXECUTION ENGINE                        │
│   • Server-side hidden testcases (TC 3-6 never sent to client)                         │
│   • Strict separation of RUN (sample cases) vs SUBMIT (database submission)            │
│   • WebWorker Pyodide sandbox with execution timeout watchdog                          │
│   • Isolated compiler adapter with explicit simulation watermark in dev mode          │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                   PHASE 4: DOTCODER SKILL INTELLIGENCE ENGINE                          │
│   • 6-Dimensional Index: Accuracy, PSI, DSA Mastery, Efficiency, Consistency, PLR      │
│   • Versioned calculation algorithms with explainable score breakdown                  │
│   • Adaptive weakness detection & targeted lesson recommendations                      │
│   • Live radar charts bound to true student submission history                         │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                      PHASE 5: TEACHER / MENTOR PORTAL (/teacher)                       │
│   • Cohort monitoring grid (BCA, B.Sc CS, B.Sc IT, MCA)                                │
│   • Targeted problem bundle assignment with due dates & auto-grading                   │
│   • Student submission inspector & direct mentoring feedback cards                     │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                   PHASE 6: ASSESSMENT & PROCTORED EXAMINATION ENGINE                   │
│   • Server-side answer evaluation & score calculation                                  │
│   • Immutable historical assessment attempt snapshotting                               │
│   • Non-punitive transparent integrity violation logging                               │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                   PHASE 7: CAMPUS PLACEMENT & RECRUITER PORTAL                         │
│   • Dedicated Recruiter Portal (/recruiter/*) with company registration                │
│   • Consenting candidate talent search with multi-dimensional skill filters            │
│   • Recruiter technical challenges & hiring stage pipeline                             │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                  PHASE 8: CREDENTIAL VERIFICATION & ATS PORTFOLIO                      │
│   • Public cryptographic credential verification endpoint (/verify/[credentialId])     │
│   • One-click ATS PDF resume export with dynamic QR code                               │
│   • Institutional accreditation & NAAC Criterion 5.2.1 export                          │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                     PHASE 9: PRODUCTION HARDENING & E2E TESTING                        │
│   • Security penetration audit (tenant leakage, role escalation, testcase exposure)    │
│   • End-to-end automated testing across all 4 core personas                            │
│   • Production build optimization & final release tagging                              │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Phase Deliverables & Acceptance Checklist

### Phase 0: Audit & Architecture (COMPLETE)
* [x] Deep code inspection across all directories (`src/app`, `src/components`, `src/lib`, `supabase`).
* [x] Author `docs/DOTCODER_CURRENT_STATE_AUDIT.md`.
* [x] Author `docs/DOTCODER_TARGET_ARCHITECTURE.md`.
* [x] Author `docs/DOTCODER_FEATURE_GAP_ANALYSIS.md`.
* [x] Author `docs/DOTCODER_RESTRUCTURING_ROADMAP.md`.

### Phase 1: Foundation Restructuring & Multi-Tenant RBAC (Ready to Begin)
* [ ] Create incremental Supabase migration adding `organizations`, `departments`, `batches`, and updating `profiles.role` check constraint to support all 6 roles (`student`, `teacher`, `admin`, `tpo`, `super_admin`, `recruiter`).
* [ ] Create server-side Next.js route guard middleware (`src/middleware.ts`) enforcing authenticated role boundaries.
* [ ] Update `AppShell` navigation to render role-specific navigation menus dynamically based on current user role.
* [ ] Seed verified test accounts for Teacher (`teacher@avc.edu.in`) and Recruiter (`recruiter@zoho.com`) alongside existing accounts.
* [ ] Execute `npm run build` and Browser QA gate.

### Phase 2: Student Learning & Relational Curriculum
* [ ] Connect frontend `CurriculumStore` to Supabase `curriculum_lessons`, `curriculum_modules`, `curriculum_topics`, and `curriculum_problems`.
* [ ] Maintain `localStorage` strictly as an offline demo fallback when Supabase connection is unconfigured.
* [ ] Expand topic concept notes with Big-O complexity tables and structured walkthroughs.
* [ ] Execute `npm run build` and Browser QA gate.

### Phase 3: DotLab Production Execution Engine
* [ ] Refactor `/api/execute` to evaluate hidden test cases (TC 3-6) strictly server-side, never transmitting hidden expected outputs to the browser.
* [ ] Strictly decouple `RUN` (evaluates visible sample cases 1-2 for instant feedback) from `SUBMIT` (evaluates complete test suite, records persistent submission).
* [ ] Implement WebWorker Pyodide execution with a 5.0-second execution watchdog timer to prevent browser freezing on infinite loops.
* [ ] Add explicit visual indicator (`SIMULATED_DEMO`) when running without external compiler API keys, preventing simulated runs from generating verified credentials.
* [ ] Execute `npm run build` and Browser QA gate.

### Phase 4: DotCoder Skill Intelligence Engine
* [ ] Implement `SkillIntelligenceService` calculating all 6 dimensions (Coding Accuracy, Problem-Solving Index, DSA Topic Mastery, Algorithmic Efficiency, Consistency, Placement Readiness).
* [ ] Create `student_skill_profiles` and `skill_history_snapshots` database tables with explainable score breakdowns.
* [ ] Connect the `<StudentDrawer />` radar chart to true live topic-level mastery vectors.
* [ ] Implement rule-based adaptive learning recommendations (detect recurring topic failures -> recommend specific practice).
* [ ] Execute `npm run build` and Browser QA gate.

### Phase 5: Teacher / Mentor Portal (`/teacher`)
* [ ] Create `/teacher/dashboard` with departmental cohort health, struggling student alerts, and mastery distributions.
* [ ] Create `/teacher/assignments` allowing teachers to bundle problems, set deadlines, and track submission progress.
* [ ] Create `/teacher/students` with code inspection and direct feedback messaging.
* [ ] Execute `npm run build` and Browser QA gate.

### Phase 6: Assessment & Examination Engine
* [ ] Refactor assessment submission to validate and grade answers server-side, eliminating client-side score spoofing.
* [ ] Create immutable assessment attempt snapshots (`assessment_attempts`) for accreditation compliance.
* [ ] Connect proctoring integrity event telemetry (tab-switches, blur events) to database violation logs.
* [ ] Execute `npm run build` and Browser QA gate.

### Phase 7: Campus Placement & Recruiter Portal (`/recruiter`)
* [ ] Create `/recruiter/dashboard` and `/recruiter/company` profile management.
* [ ] Create `/recruiter/candidates` allowing recruiters to search consenting students by verified skill criteria (PLR, DSA mastery, language proficiency).
* [ ] Implement candidate privacy toggle ("Allow verified recruiters to discover my skill profile").
* [ ] Execute `npm run build` and Browser QA gate.

### Phase 8: Verified Credentials & Reporting
* [ ] Implement public cryptographic credential verification page (`/verify/[credentialId]`).
* [ ] Update ATS resume to link QR code directly to `/verify/[credentialId]`.
* [ ] Create institutional NAAC Criterion 5.2.1 export generator in `/tpo/reports`.
* [ ] Execute `npm run build` and Browser QA gate.

### Phase 9: Production Hardening & E2E Verification
* [ ] Run comprehensive automated security verification (cross-tenant queries, role escalation, hidden testcase sniffing).
* [ ] Run full browser QA across all 4 portals (Student, Teacher, TPO/Admin, Recruiter).
* [ ] Run production build gate (`npm run build`).
* [ ] Git commit and sync to `origin/main`.
