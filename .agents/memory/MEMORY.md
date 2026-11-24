# Project Memory Index (DotCoder / EQLV Code Platform)

## Project Profile
- **Project Name:** DotCoder (EQLV Code Platform)
- **Root Directory:** `/Users/harizforyou/Desktop/PROJECT I`
- **Purpose:** Enterprise Campus Placement, Coding Lab & AI-Proctored Assessment SaaS
- **Target Audience:** Engineering Students, Training & Placement Officers (TPOs), Faculty Mentors, and Corporate Recruiters (Zoho, TCS, Infosys, Cognizant).

## Core Architecture
- **Framework:** Next.js 14+ App Router, React 18, TypeScript (Strict Mode).
- **Styling:** Tailwind CSS, Lucide Icons, Magic UI, Framer Motion.
- **Data & Auth:** Supabase (`@supabase/ssr`) with automatic zero-crash local DemoStore fallback (`localStorage` + React state).
- **Execution Engines:**
  - Python: Client-side Pyodide WebAssembly (WASM) with 5.0s execution watchdog.
  - Multi-language (C, C++, Java): `/api/execute` with Judge0 / Piston adapter and deterministic AST simulation.

## Quality & Compliance Baseline
- **TypeScript:** Strict type safety, 0 explicit `any` types across the codebase.
- **Accessibility:** WCAG AA compliance with skip-to-main-content link, semantic button controls, and accessible form labels.
- **Security:** Strict security headers configured in `next.config.mjs` (HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy).
- **Build Status:** Verified production build (`npm run build`) generates all 24 static and dynamic routes with 0 errors.

## Memory Subsystems
- [Tech Decisions](./tech-decisions.md)
- [Project Conventions](./project-conventions.md)
- [User Preferences](./user-preferences.md)
- [Feedback & Audit History](./feedback-history.md)
