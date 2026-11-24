# User Preferences & Execution Principles

## 1. Zero-Crash Guarantee & Local Demo Mode
- The application MUST seamlessly function in an interactive **Local Demo Mode** using pre-seeded in-memory state (`localStorage` + React state) whenever Supabase environment variables or external compiler API keys are absent.
- Never let missing API keys or external services throw unhandled exceptions or crash UI flows during live demos or local evaluation.

## 2. Strict Type Safety Mandate
- TypeScript `strict: true` must always remain enabled.
- Zero explicit `any` types allowed across the entire codebase.
- No `@ts-ignore` or `@ts-expect-error` without explicit justification.

## 3. Visual & Aesthetic Standards
- Elegant, high-density engineering tool aesthetic.
- Dark theme baseline with premium violet/indigo lighting accents.
- Responsive split-pane IDE layouts, crisp terminal outputs, and clear status badges.
- Avoid low-effort generic UI designs or default unstyled components.

## 4. Code Execution Philosophy
- Python code execution should prioritize client-side WebAssembly via Pyodide (`pyodide` CDN worker) for $0-cost, zero-latency feedback with an execution timeout watchdog.
- Compiled languages (C, C++, Java) route through `/api/execute` with deterministic AST validation fallback if no external execution backend is connected.

## 5. Verification & Clean-up Rigor
- Every milestone must pass a full production build (`npm run build`) and lint (`npm run lint`).
- Always clean up temporary files, test scripts, and scratch directories when tasks are completed.
