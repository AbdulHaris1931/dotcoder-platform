# DotCoder 2.0 — Comprehensive UX Audit Report

> **Platform:** DotCoder 2.0 Enterprise SaaS  
> **Evaluation Framework:** Nielsen Norman Group 10 Usability Heuristics, WCAG 2.2 AA Accessibility, Cognitive Load Theory  
> **Target Institution:** Annai Vailankanni Arts and Science College, Thanjavur (`AVASC-TNJ`)  
> **Evaluation Status:** 100% of Primary & Administrative Routes Audited  
> **Date:** November 2026

---

## 1. Executive Summary & Defect Severity Matrix

The DotCoder platform was subjected to a rigorous usability, interaction, visual, and architectural audit. While the underlying functional architecture (Pyodide WASM execution, proctoring telemetry, and database models) is exceptionally strong, several user experience friction points, visual inconsistencies, and interaction gaps were uncovered.

### Defect Distribution by Severity

| Severity Level | Count | Definition | Primary Impact Areas |
|---|---|---|---|
| **CRITICAL** | 1 | Blocks essential user workflow or breaks expected system integrity. | Missing student drawer mount in `/tpo/students` (Eye click fails to open drawer). |
| **HIGH** | 4 | Significantly impairs usability, creates visual mismatch, or causes cognitive friction. | Landing page color palette inconsistency (Indigo `#4F46E5` vs Electric Lime `#9DFF00`), Department hardcoding in `/tpo/dashboard`, Anchor jump scrolling instead of views, Dead `#pricing` link on landing page. |
| **MEDIUM** | 4 | Reduces task completion efficiency, feedback clarity, or mobile ergonomics. | Alert dialog on Forgot Password, Reset Code confirm() browser modal in DotLab, Static pagination slicing in student table, Inconsistent table empty state illustrations. |
| **LOW** | 2 | Minor visual polish and typographic refinements. | Command palette category headers, Monospaced timer tabular-nums alignment. |
| **TOTAL** | **11** | All issues classified with exact code references and concrete remediation plans. |

---

## 2. Heuristic-by-Heuristic System Evaluation

### Heuristic 1: Visibility of System Status
* **Finding:** DotLab IDE execution feedback is instantaneous with Pyodide WASM. When running code, users see immediate loading indicators (`Running WASM...` or `Compiling...`).
* **Issue (Medium):** In `/login`, when an error occurs, the red alert banner appears smoothly, but in `/student/exam/[id]`, if a connection jitter occurs during WebRTC mobile sync, the status badge remains in amber `Pair Mobile Camera` without detailing whether signaling timed out.
* **Remediation:** Provide explicit toast diagnostics for background network events and display live battery/audio level telemetry on the exam proctoring header.

### Heuristic 2: Match Between System and the Real World
* **Finding:** Terminology matches campus placement norms (*TPO*, *Placement Cell*, *NQT*, *Quant*, *Logic*, *Readiness Score*, *NAAC Criterion 5.2.1*).
* **Issue (High):** In `src/app/tpo/dashboard/page.tsx:74`, department statistics are hardcoded to `["CSE", "IT", "ECE", "EEE", "Mech"]` instead of reflecting the active institution's actual departments (`BCA`, `B.Sc CS`, `B.Sc IT`, `MCA` for Annai Vailankanni Arts and Science College, Thanjavur).
* **Remediation:** Dynamically discover active college departments from student records as done in `src/app/admin/dashboard/page.tsx`.

### Heuristic 3: User Control and Freedom
* **Finding:** Students can navigate between questions freely using the Question Palette, flag questions for review, and reset editor code to default boilerplate.
* **Issue (Medium):** In `src/components/ide/split-pane-ide.tsx:135`, the `Reset Code` button invokes native browser `confirm()`, which halts JavaScript execution and looks non-native.
* **Remediation:** Replace native `confirm()` with a styled inline popover or modal dialog with "Cancel" and "Confirm Reset" buttons.

### Heuristic 4: Consistency and Standards
* **Finding:** The application shell establishes an Obsidian Dark sidebar (`#0F1412`) with Mint Canvas background (`#F4F7F4`) and white elevated cards (`#FFFFFF`).
* **Issue (High):** The public landing page (`src/app/page.tsx`) relies on legacy Indigo-600 (`#4F46E5`) for primary buttons and borders, directly conflicting with the DotCoder 2.0 Electric Lime (`#9DFF00`) and Deep Forest brand identity.
* **Remediation:** Migrate all landing page buttons, eyebrows, and code editor highlights to the DotCoder 2.0 design token palette (`#9DFF00`, `#17251B`, `#242424`, `#111111`).

### Heuristic 5: Error Prevention
* **Finding:** Critical exam submissions require explicit confirmation, and proctoring logs tab switches with real-time warning modals before disqualifying students.
* **Issue (Low):** In the problem search input (`src/app/student/dashboard/page.tsx`), typing queries with leading/trailing whitespace could yield empty results.
* **Remediation:** Trim queries and provide a 1-click "Clear filters" pill when 0 results match.

### Heuristic 6: Recognition Rather Than Recall
* **Finding:** The 6-pill testcase diagnostic visualizer in DotLab IDE clearly distinguishes Public Sample Cases (TC 1–2) from Hidden Diagnostic Stress Cases (TC 3–6) without leaking hidden inputs.
* **Issue (Medium):** In `/tpo/students`, clicking the Eye icon (`TPO-STUD-002`) updates internal component state `selectedStudent`, but no drawer or modal is mounted, leaving the user with zero visual feedback.
* **Remediation:** Mount `StudentDrawer` in `/tpo/students` so placement officers can view complete candidate analytics from both the dashboard and the student management table.

### Heuristic 7: Flexibility and Efficiency of Use
* **Finding:** Command Palette (`⌘K`) provides instant search across all navigation routes, coding problems, and candidate profiles. DotLab IDE supports standard code editor shortcuts (`⌘+Enter` to Run, `⌘+Shift+Enter` to Submit).
* **Issue (Low):** In `src/components/shared/app-shell.tsx`, the sidebar "Progress" button jumps to an anchor `#progress` on the dashboard rather than transitioning smoothly.
* **Remediation:** Smooth-scroll to the heatmap container or open a dedicated student progress dialog.

### Heuristic 8: Aesthetic and Minimalist Design
* **Finding:** Interfaces avoid clutter, extraneous gradients, or glowing cards. Information is presented in clear visual hierarchies.
* **Issue (Medium):** In `src/app/page.tsx:83`, the top navbar dropdowns have static placeholders ("For Engineering Colleges", "For Tier-1 Tech Recruiters") that lack actionable links.
* **Remediation:** Either provide rich links to specific student/tpo workflows or simplify to direct anchor links.

### Heuristic 9: Help Users Recognize, Diagnose, and Recover from Errors
* **Finding:** When a testcase fails in DotLab IDE, the failure category is highlighted (e.g. `Boundary/Edge Case`, `Max Constraint TLE`).
* **Issue (Medium):** On `/login`, clicking "Forgot Password?" triggers `alert("For test accounts, password is Password@123")`. Native alerts break immersion.
* **Remediation:** Render a subtle dismissible hint card below the password input explaining institutional credential recovery.

### Heuristic 10: Help and Documentation
* **Finding:** DotLab IDE features 3 progressive hint tiers (Intuition, Data Structure, Edge Case Trap) and 3-minute concept guides.
* **Remediation:** Ensure "Help & Support" in the sidebar opens the Command Palette pre-filtered to documentation and contact guides.

---

## 3. Prioritized Defect Register

### Critical Defects (P0)

#### DEFECT-CRIT-001: Missing StudentDrawer Mount in `/tpo/students`
* **Source:** `src/app/tpo/students/page.tsx:267`
* **Trigger:** Placement Officer clicks the Eye icon in the student table row.
* **Observed Behavior:** `setSelectedStudent(student)` is called, but no drawer component is rendered in the JSX. The click produces no visible response.
* **Remedy:** Import `StudentDrawer` from `@/components/tpo/student-drawer` and render:
  ```tsx
  <StudentDrawer
    student={selectedStudent ? { ...selectedStudent, id: selectedStudent.rollNo } as any : null}
    submissions={[]}
    onClose={() => setSelectedStudent(null)}
  />
  ```

---

### High Defects (P1)

#### DEFECT-HIGH-001: Landing Page Color Palette Inconsistency
* **Source:** `src/app/page.tsx`
* **Trigger:** Loading the public landing page (`/`).
* **Observed Behavior:** Primary CTAs use Indigo-600 (`#4F46E5`), and the editor showcase uses blue/indigo gradients, diverging from the DotCoder 2.0 Electric Lime (`#9DFF00`) and Obsidian aesthetic.
* **Remedy:** Refactor all primary CTAs, eyebrow badges, and editor highlights to use `#9DFF00` Electric Lime with deep obsidian `#111111` / `#0F1412` surfaces.

#### DEFECT-HIGH-002: Hardcoded Departments in TPO Dashboard
* **Source:** `src/app/tpo/dashboard/page.tsx:74`
* **Trigger:** Viewing department analytics on `/tpo/dashboard`.
* **Observed Behavior:** Hardcodes `["CSE", "IT", "ECE", "EEE", "Mech"]`. For Annai Vailankanni Arts and Science College (`BCA`, `B.Sc CS`, `B.Sc IT`, `MCA`), all metrics show 0.
* **Remedy:** Dynamically derive active departments from student records:
  ```ts
  const discoveredDepts = Array.from(new Set(studs.map((s) => s.department).filter(Boolean)));
  const depts = discoveredDepts.length > 0 ? discoveredDepts : ["BCA", "B.Sc CS", "B.Sc IT", "MCA"];
  ```

#### DEFECT-HIGH-003: Non-Functional `#pricing` Anchor on Landing Page
* **Source:** `src/app/page.tsx:113`
* **Trigger:** Clicking "Pricing" in the landing page header.
* **Observed Behavior:** Browser URL updates to `/#pricing`, but no section exists on the page.
* **Remedy:** Either add an Institutional Enterprise Tier card or replace the link with an "Institutional Pilot" modal trigger.

#### DEFECT-HIGH-004: Tutor Role Architectural Verification
* **Source:** System-wide evaluation
* **Trigger:** Inspecting database schema, migrations, and types.
* **Observed Behavior:** `UserRole` enum is strictly `"student" | "admin" | "super_admin" | "tpo"`. There is no backend Tutor role.
* **Resolution:** Document that Tutor role is unsupported in the current database schema and do not fabricate mock backend routes.

---

### Medium Defects (P2)

#### DEFECT-MED-001: Native Browser `alert()` on Forgot Password
* **Source:** `src/app/login/page.tsx:175`
* **Remedy:** Replace `alert()` with an inline helper tooltip.

#### DEFECT-MED-002: Native Browser `confirm()` on DotLab Reset Code
* **Source:** `src/components/ide/split-pane-ide.tsx:135`
* **Remedy:** Replace native `confirm()` with a styled confirmation popover.

#### DEFECT-MED-003: Static Pagination in `/tpo/students`
* **Source:** `src/app/tpo/students/page.tsx:303`
* **Remedy:** Connect active page state to slice the displayed student array.

#### DEFECT-MED-004: Anchor Jump Scrolling in Sidebar
* **Source:** `src/components/shared/app-shell.tsx:199`
* **Remedy:** Smooth-scroll to target section with visual focus ring.

---

## 4. Accessibility (WCAG 2.2 AA) Findings

1. **Color Contrast:**
   * Text rendered in `#C4F82A` on `#FFFFFF` has poor contrast. In DotCoder 2.0, Electric Lime (`#9DFF00`) must ONLY be used with black text (`#111111`) or against dark obsidian backgrounds (`#0F1412`).
   * Secondary text (`#68716A`) on soft background (`#F5F6F3`) meets the 4.5:1 ratio for regular text.
2. **Keyboard Navigation:**
   * All interactive elements in Monaco Editor, Question Palette, and Modal Dialogs must feature visible focus rings (`focus-visible:ring-2 focus-visible:ring-[#9DFF00]`).
3. **Screen Reader Labels:**
   * Password reveal buttons and icon-only table actions must include `aria-label` attributes.

---

## 5. Summary & Action Plan

All 11 findings have concrete, non-destructive solutions that preserve existing backend business logic while elevating the product to a cohesive, commercial-grade institutional SaaS.
