# Project Conventions & Engineering Standards

## 1. Next.js App Router Architecture
- **Server vs. Client Components:** Default to Server Components for data fetching and layout structure. Mark client interactivity with `'use client'` at the top of the file only when state, effects, or browser APIs are required.
- **Route Structure:** Group routes logically by role:
  - `/student/*`: Student IDE, assessments, exam companion, proctored simulator, assignments.
  - `/teacher/*`: Faculty portal, student tracking, assignments, classroom analytics.
  - `/recruiter/*`: Corporate hiring dashboard, campus drive manager, candidate evaluation.
  - `/admin/*`: Institutional admin, system settings, curriculum manager.
  - `/api/*`: Edge & Node.js API handlers (code execution, assessment submission, auth).
- **Error Handling:** Protect routes with proper boundary wrappers and fallback states. Catch errors as `unknown` and log safely without leaking raw stack traces.

## 2. Design System & Styling Conventions
- **Base Theme:** Dark mode first (`bg-slate-950` / `bg-zinc-950`, `text-slate-100`).
- **Color Palette:**
  - Primary Brand: Violet / Indigo (`violet-500`, `violet-600`, `indigo-500`).
  - Success / Pass: Emerald / Green (`emerald-500`, `emerald-400`).
  - Warning / Pending: Amber / Yellow (`amber-500`, `yellow-400`).
  - Danger / Error / Violation: Rose / Red (`rose-500`, `red-500`).
  - Borders & Cards: Subtle translucent borders (`border-white/10`, `border-slate-800`).
- **Typography & Icons:** Inter / Geist font stack; icons strictly from `lucide-react`.

## 3. Strict Type Safety Standards
- **Zero `any` Policy:** Explicit `any` is strictly prohibited. Use typed interfaces, generics, or `unknown` with type narrowing.
- **Database Entity Typing:** All Supabase tables have corresponding interface definitions prefixed with `Db` (e.g., `DbProblemRecord`, `DbAssessmentRecord`, `DbSubmissionRecord`, `DbCampusDriveRecord`).
- **Compiler Result Typing:** Execution results must adhere to `ExecutionResult` or `ServerCaseResultItem`.

## 4. Accessibility & Semantic HTML (WCAG AA)
- **Skip Links:** Root layout and primary AppShell contain `#main-content` target and a visible-on-focus skip link.
- **Interactive Controls:** Never place `onClick` on non-interactive `<div>` or `<span>` elements without converting them to `<button type="button">` or providing appropriate role, tabIndex, and keydown handlers.
- **Form Controls:** Every `<input>`, `<select>`, and `<textarea>` must include an `aria-label`, associated `<label>`, or `name` attribute.
