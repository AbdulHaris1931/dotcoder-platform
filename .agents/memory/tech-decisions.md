# Architecture Decision Records (ADRs)

## ADR-001: Zero-Cloud-Waste Client Pyodide Execution
- **Context:** Executing student Python code in the cloud generates recurring server bills and high latency.
- **Decision:** Execute client-side via Pyodide WebAssembly with a 5.0s execution watchdog to prevent infinite loops, with server-side fallback.
- **Status:** Accepted & Implemented in `src/lib/pyodide-runner.ts`.

## ADR-002: Dual Persistence & Zero-Crash Graceful Degradation
- **Context:** Live demonstrations and continuous testing must never crash if Supabase credentials or network connections are absent.
- **Decision:** All database and auth interactions in `DataService` try Supabase first; on any connection error, they fall back automatically to `DemoStore` (seeded `localStorage`).
- **Status:** Accepted & Implemented in `src/lib/supabase/db.ts` and `src/lib/demo-store.ts`.

## ADR-003: Elimination of Explicit `any` Types
- **Context:** `AGENTS.md` mandates zero `any` types. Initial audit revealed 59 instances across database mappings, API routes, and client hooks.
- **Decision:** Strongly type all database rows (`DbProblemRecord`, `DbAssessmentRecord`, `DbSubmissionRecord`, etc.), cast parameters strictly, and use `unknown` in catch blocks.
- **Status:** Accepted & Completed (0 explicit `any` in codebase).

## ADR-004: Production HTTP Security Headers
- **Context:** Security scan flagged missing HTTP security headers.
- **Decision:** Enforce HSTS, X-Frame-Options (`SAMEORIGIN`), X-Content-Type-Options (`nosniff`), Referrer-Policy, and Permissions-Policy in `next.config.mjs`.
- **Status:** Accepted & Implemented.

## ADR-005: WCAG AA Accessibility Standards
- **Context:** Audit flagged missing skip-link, unlabeled form inputs, and non-interactive `onClick` handlers.
- **Decision:** Implemented accessible `<a href="#main-content">`, added explicit `aria-label` and `name` attributes to all native `<input>` elements, and converted clickable divs to `<button type="button">`.
- **Status:** Accepted & Verified (0 accessibility issues found).

## ADR-006: Next.js Image Optimization & Performance Hardening
- **Context:** Raw `<img>` tags triggered build-time warnings, unoptimized image weight, and risked Cumulative Layout Shift (CLS).
- **Decision:** Whitelist remote hosts (`images.unsplash.com`) in `next.config.mjs`, standardize on `next/image` `<Image />` with explicit dimensions, and flag critical above-the-fold brand assets with `priority={true}`.
- **Status:** Accepted & Implemented (0 warnings across all routes).
