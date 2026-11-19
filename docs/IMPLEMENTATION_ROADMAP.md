# DotCoder 2.0 — Prioritized Phased Implementation Roadmap

> **Platform:** DotCoder 2.0 Enterprise SaaS  
> **Execution Strategy:** Small, verifiable batches with mandatory build gates and regression checks  
> **Institution:** Annai Vailankanni Arts and Science College, Thanjavur  
> **Date:** November 2026

---

## 1. Roadmap Architecture & Execution Principles

To ensure zero downtime, strict backward compatibility, and adherence to the Project Constitution (AGENTS.md):
1. **Zero-Destructive Operations:** Never alter database schemas, Supabase RLS policies, code execution adapters, or proctoring algorithms without explicit authorization.
2. **Mandatory Build Gates:** After every phase, run `npm run build` to guarantee zero TypeScript or ESLint errors.
3. **Continuous Browser QA:** Validate each modified screen using the Antigravity Browser Agent.
4. **Single Source of Truth:** Every interactive element modified must be checked off in `docs/UI_ELEMENT_INVENTORY.md` and recorded in `docs/UI_REGRESSION_REPORT.md`.

---

## 2. Phase-by-Phase Implementation Plan

### Phase 1: Repository Audit & Architectural Verification (COMPLETE)
* [x] Audit all files in `src/app/`, `src/components/`, `src/lib/`, `src/types/`, and `supabase/`.
* [x] Verify active institutional deployment (`AVASC-TNJ`) and 5 verified seed accounts (`Password@123`).
* [x] Audit backend schema for Tutor role (confirmed unsupported; document constraint).
* [x] Establish baseline build stability (`npm run build` passing with 0 errors).

### Phase 2: Complete UI Element & Interaction Inventory (COMPLETE)
* [x] Catalog all 358 interactive elements across 10 core screens.
* [x] Assign unique tracking IDs (`SHELL-NAV-001`, `DOTLAB-RUN-001`, `TPO-STUD-001`, etc.).
* [x] Classify element conditions (Working Correctly, Inconsistent Design, Functionally Broken).
* [x] Author `docs/UI_ELEMENT_INVENTORY.md`.

### Phase 3: User Research & Journey Mapping (COMPLETE)
* [x] Create detailed behavioral personas for Student (`Karthik S.`) and TPO (`Prof. R. Anandhan`).
* [x] Benchmark against LeetCode, HackerRank, CodeSignal, Coursera, Linear, and Vercel.
* [x] Map end-to-end user journeys for daily practice, proctored exams, recruitment simulation, and TPO oversight.
* [x] Author `docs/UX_RESEARCH_REPORT.md` and `docs/USER_JOURNEY_MAPS.md`.

### Phase 4: DotCoder 2.0 Design System Specification (COMPLETE)
* [x] Define brand tokens: Electric Lime (`#9DFF00`), Black (`#111111`), Graphite (`#242424`), Deep Forest (`#17251B`), Soft Background (`#F5F6F3`), Border (`#E5E7E2`).
* [x] Establish the 70% Neutral / 20% Dark / 10% Lime visual balance.
* [x] Define typography scales (Inter + JetBrains Mono), spacing, elevation, and component rules.
* [x] Author `docs/DOTCODER_DESIGN_SYSTEM.md`.

---

### Phase 5: Student Experience Refinements (Ready for Implementation)
* [ ] **Batch 5.1 — Student Dashboard (`/student/dashboard`):**
  * Refine readiness score card and streak pill with DotCoder 2.0 Electric Lime (`#9DFF00`) accents.
  * Polish problem list search input with a clear (X) button.
  * Ensure smooth scrolling for the `#progress` anchor.
* [ ] **Batch 5.2 — Curriculum Explorer (`/curriculum`):**
  * Standardize 3D isometric module card with `#9DFF00` highlights.
  * Ensure dual buttons ("Continue Learning" and "Take Module Assessment") adhere to primary lime and secondary dark styles.
* [ ] **Batch 5.3 — Corporate Recruitment Simulator (`/student/simulator`):**
  * Verify all 6 corporate track cards (Zoho, TCS, Cognizant, Infosys, Wipro, HCL) maintain crisp white card surfaces with accurate badge colors.
* [ ] **Batch 5.4 — Campus Drives & Resume (`/student/drives` & `/student/resume`):**
  * Enhance interactive application feedback toast and verify dynamic readiness gauge (88%).

### Phase 6: DotLab Developer Workspace Polish (Ready for Implementation)
* [ ] **Batch 6.1 — Header Toolbar & Language Selection:**
  * Add visual indicator for active engine: `Client Pyodide WASM` for Python, `Compiler Adapter` for C/C++/Java.
* [ ] **Batch 6.2 — Monaco Editor Ergonomics:**
  * Support editor font size toggle and fullscreen expansion.
* [ ] **Batch 6.3 — Testcase Console & 6-Pill Diagnostics:**
  * Polish the bottom dock tabs: `Test Cases (3)`, `Sample (2)`, `Hidden (4)` with pass/fail counts.
  * Replace native browser `confirm()` on "Reset Code" with a styled inline popover.

### Phase 7: Admin & Placement Officer (TPO) Experience Refinements (Ready for Implementation)
* [ ] **Batch 7.1 — Student Management Table (`/tpo/students`):**
  * **CRITICAL FIX:** Mount `StudentDrawer` in `/tpo/students` so clicking the Eye icon opens the candidate telemetry drawer (`DEFECT-CRIT-001`).
  * Connect functional page slicing to table pagination.
* [ ] **Batch 7.2 — TPO Executive Dashboard (`/tpo/dashboard`):**
  * **HIGH FIX:** Dynamically derive department stats from student records instead of hardcoding `["CSE", "IT", "ECE", "EEE", "Mech"]` (`DEFECT-HIGH-002`).
* [ ] **Batch 7.3 — Problem & Assessment Management (`/admin/problems` & `/admin/assessments`):**
  * Polish top quick-switch segmented control `[Problems] [Assessments]`.
  * Ensure modals have accessible focus trap and keyboard ESC dismissal.
* [ ] **Batch 7.4 — Campus Drives Pipeline (`/admin/drives`):**
  * Polish candidate stage advancement cards and 1-click HR shortlist CSV export.

### Phase 8: Tutor Role Architectural Resolution (COMPLETE)
* [x] Confirm Tutor role is unsupported in the current database schema.
* [x] Document that department mentors utilize the TPO interface with department filters.

### Phase 9: Public Pages & Shared Components (Ready for Implementation)
* [ ] **Batch 9.1 — Public Landing Page (`/`):**
  * **HIGH FIX:** Refactor buttons, eyebrows, and code window from legacy Indigo (`#4F46E5`) to DotCoder 2.0 Electric Lime (`#9DFF00`) and Deep Forest (`#17251B`) (`DEFECT-HIGH-001`).
  * Resolve dead `#pricing` anchor with Institutional Pilot contact modal (`DEFECT-HIGH-003`).
* [ ] **Batch 9.2 — Authentication Screens (`/login` & `/signup`):**
  * Replace native `alert()` on "Forgot Password?" with inline helper popover (`DEFECT-MED-001`).
  * Verify all 5 verified seed credential autofill pills.
* [ ] **Batch 9.3 — Global Command Palette (`⌘K`):**
  * Add visual category headers and keyboard arrow navigation styling.

### Phase 10: Responsive & Accessibility Validation
* [ ] Test viewports at 1440px, 1280px, 1024px, 768px, 390px, and 360px.
* [ ] Validate color contrast ratios against WCAG 2.2 AA (4.5:1 text, 3:1 graphical objects).
* [ ] Verify visible focus indicators across all interactive controls.

### Phase 11: Full Regression Testing & Final Deliverables
* [ ] Re-test every element in `docs/UI_ELEMENT_INVENTORY.md`.
* [ ] Generate `docs/UI_REGRESSION_REPORT.md`.
* [ ] Generate `docs/CHANGED_FILES_REPORT.md`.
* [ ] Execute final production build gate (`npm run build`).
* [ ] Commit and sync to `origin/main`.

---

## 3. Risk Assessment & Mitigation Protocols

| Risk | Probability | Impact | Mitigation Strategy |
|---|---|---|---|
| Regressing Monaco Editor syntax highlighting | Low | High | Never modify Monaco internal configuration without testing all 5 languages (Python, C, C++, Java, SQL). |
| Breaking Pyodide WASM local execution | Low | Critical | Test Python execution locally in browser before and after every batch. |
| Breaking Supabase Auth or RLS policies | Low | Critical | All auth calls route through existing `createClient()` and `DemoStore` zero-crash fallbacks. No database schema changes. |
| Viewport overflow on mobile devices | Medium | Medium | Test with Antigravity Browser Agent at 390px (iPhone 14) and 768px (iPad). |
