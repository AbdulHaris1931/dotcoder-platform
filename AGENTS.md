# Workspace Engineering Constitution (AGENTS.md)

## 1. Core Execution Philosophy
- **Be Deliberate:** Never guess library APIs, database columns, or external endpoints. Inspect generated files and verify assumptions against actual build outputs.
- **Strict Type Safety:** TypeScript `strict: true` is mandatory. Zero `any` types unless explicitly justified in a comment.
- **Zero-Crash Graceful Degradation:** If Supabase environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) or external compiler API keys are missing, the application MUST seamlessly run in an interactive **Local Demo Mode** using pre-seeded in-memory state (`localStorage` + React state) so live demos never crash.

## 2. Architecture & Stack Boundaries
- **Framework:** Next.js 14+ (App Router), React 18+, TypeScript, Tailwind CSS, Shadcn UI, Lucide Icons.
- **Database & Auth:** Supabase (`@supabase/ssr` + PostgreSQL RLS).
- **Code Execution Engine (`/api/execute` & Client WASM):**
  - **Python:** Execute client-side via Pyodide WebAssembly (`pyodide` CDN worker) for zero-latency, $0-cost execution, with server fallback.
  - **Compiled Languages (C, C++, Java):** Route through `/api/execute` using a clean provider adapter supporting `JUDGE0_API_URL` / `ONLINECOMPILER_API_KEY` (via `https://api.onlinecompiler.io/api/v2/piston/execute` or self-hosted Judge0). When no API key is configured in `.env.local`, use a deterministic sandbox evaluator that validates syntax and runs sample assertions so UI flows remain 100% testable.

## 3. Mandatory Verification & Debugging Ladder
- **Build Gate:** After completing every milestone, execute `npm run build` in the terminal. Fix every TypeScript, ESLint, or Next.js build error before proceeding.
- **Browser QA Gate:** Use the Antigravity Browser Agent to visually inspect layouts, click interactive controls, and verify zero console errors.
- **Debugging Ladder (Max 3 Attempts):** If a build or runtime error persists after 3 attempts, stop, isolate the minimal reproduction, document the exact error logs and hypotheses, and ask the user before making destructive changes.