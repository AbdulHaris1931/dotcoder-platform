import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { registerHooks } from "node:module";

const ROOT = process.cwd();

// Lightweight Node 26 TS + `@/` alias resolver for running real unit tests with zero extra deps
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "next/server") {
      return nextResolve("next/server.js", context);
    }
    if (specifier.startsWith("@/")) {
      const base = path.join(ROOT, "src", specifier.slice(2));
      for (const candidate of [`${base}.ts`, `${base}.tsx`, path.join(base, "index.ts")]) {
        if (fs.existsSync(candidate)) {
          return { url: pathToFileURL(candidate).href, shortCircuit: true };
        }
      }
    }
    if ((specifier.startsWith("./") || specifier.startsWith("../")) && context.parentURL) {
      const parentDir = path.dirname(fileURLToPath(context.parentURL));
      const base = path.resolve(parentDir, specifier);
      if (!fs.existsSync(base)) {
        for (const candidate of [`${base}.ts`, `${base}.tsx`, path.join(base, "index.ts")]) {
          if (fs.existsSync(candidate)) {
            return { url: pathToFileURL(candidate).href, shortCircuit: true };
          }
        }
      }
    }
    return nextResolve(specifier, context);
  },
});

test("Security Regression: zero hardcoded/backdoor passwords anywhere in src/", () => {
  const forbidden = ["8npvfkxhhe", "Password@123", "Welcome@2026"];
  const files = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.(ts|tsx|js|mjs)$/.test(entry.name)) files.push(full);
    }
  };
  walk(path.join(ROOT, "src"));

  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    for (const secret of forbidden) {
      assert.equal(
        content.includes(secret),
        false,
        `Forbidden hardcoded credential "${secret}" found in ${path.relative(ROOT, file)}`
      );
    }
  }
});

test("Security Regression: every /api route enforces server-side requireApiAuth", () => {
  const apiDir = path.join(ROOT, "src", "app", "api");
  const routes = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name === "route.ts") routes.push(full);
    }
  };
  walk(apiDir);

  assert.ok(routes.length >= 6, `Expected at least 6 API routes, found ${routes.length}`);
  for (const routeFile of routes) {
    const content = fs.readFileSync(routeFile, "utf8");
    assert.ok(
      content.includes("requireApiAuth"),
      `API route missing requireApiAuth: ${path.relative(ROOT, routeFile)}`
    );
    assert.equal(
      content.includes("@/lib/supabase/client"),
      false,
      `Server API route must not import browser Supabase client: ${path.relative(ROOT, routeFile)}`
    );
  }
});

test("Security Regression: admin.ts never falls back to NEXT_PUBLIC_SUPABASE_ANON_KEY", () => {
  const adminSrc = fs.readFileSync(path.join(ROOT, "src", "lib", "supabase", "admin.ts"), "utf8");
  assert.equal(
    adminSrc.includes("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    false,
    "admin.ts must never fall back to the public ANON key"
  );
});

test("Security Regression: middleware never trusts eqlv_demo_user when Supabase is enabled", () => {
  const mwSrc = fs.readFileSync(path.join(ROOT, "src", "middleware.ts"), "utf8");
  assert.equal(
    mwSrc.includes("user_metadata?.role"),
    false,
    "middleware must not read client-editable user_metadata.role"
  );
  assert.ok(
    mwSrc.includes("if (isSupabaseEnabled") && mwSrc.includes("} else {"),
    "middleware must isolate demo cookie fallback strictly behind !isSupabaseEnabled"
  );
});

test("Data Integrity: db.ts respects empty Supabase user/record tables instead of leaking seed users", () => {
  const dbSrc = fs.readFileSync(path.join(ROOT, "src", "lib", "supabase", "db.ts"), "utf8");
  const matches = dbSrc.match(/data\.length > 0/g) || [];
  // Only getCurriculumLessons (static learning catalog) may fall back when table is unseeded
  assert.ok(
    matches.length <= 1,
    `Expected at most 1 data.length > 0 fallback (curriculum catalog), found ${matches.length}`
  );
});

test("Type Safety: zero explicit `any` types across src/", () => {
  const files = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.(ts|tsx)$/.test(entry.name)) files.push(full);
    }
  };
  walk(path.join(ROOT, "src"));

  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    assert.equal(
      /:\s*any\b|\bas\s+any\b/.test(content),
      false,
      `Explicit any type found in ${path.relative(ROOT, file)}`
    );
  }
});

test("Production Safeguards: error boundaries, 404, privacy, terms, and RLS hardening migration exist", () => {
  const requiredFiles = [
    "src/app/error.tsx",
    "src/app/global-error.tsx",
    "src/app/not-found.tsx",
    "src/app/privacy/page.tsx",
    "src/app/terms/page.tsx",
    "src/app/forgot-password/page.tsx",
    "src/app/reset-password/page.tsx",
    "src/app/settings/security/page.tsx",
    "src/lib/auth/server-auth.ts",
    "src/app/api/super-admin/users/route.ts",
    "src/app/api/super-admin/users/[id]/route.ts",
    "src/app/api/assessments/route.ts",
    "supabase/migrations/20261123000009_security_rls_hardening.sql",
    "supabase/migrations/20261123000010_purge_seed_test_records.sql",
    "supabase/migrations/20261123000011_published_assessments_sync.sql",
  ];
  for (const rel of requiredFiles) {
    assert.ok(fs.existsSync(path.join(ROOT, rel)), `Missing required production file: ${rel}`);
  }
});

test("Code Evaluator: deterministic Python solution evaluation passes valid code and rejects empty code", async () => {
  const { evaluateDeterministicCode } = await import("../src/lib/code-evaluator.ts");

  const emptyRes = evaluateDeterministicCode({
    language: "python",
    sourceCode: "   ",
    testCases: [{ id: "tc1", input: "1 2", expectedOutput: "3", isHidden: false }],
  });
  assert.equal(emptyRes.passedCases, 0);

  const validRes = evaluateDeterministicCode({
    language: "python",
    sourceCode: "def solve(nums, target):\n    seen = {}\n    for i, x in enumerate(nums):\n        if target - x in seen:\n            return [seen[target - x], i]\n        seen[x] = i\n    return []\nprint('0 1')\n",
    testCases: [{ id: "tc1", input: "2 7 11 15\n9", expectedOutput: "0 1", isHidden: false }],
  });
  assert.equal(validRes.totalCases, 1);
  assert.ok(validRes.passedCases >= 1, "Expected valid Python solution to pass deterministic check");
});

test("Rate Limiter: isolates 300 concurrent students independently and enforces 20/min per student", async () => {
  const { checkRateLimit, RATE_LIMIT_PRESETS, resetRateLimitStore } = await import(
    "../src/lib/rate-limiter.ts"
  );
  resetRateLimitStore();

  // 300 students each run 1 compiler call simultaneously -> all 300 allowed
  for (let i = 1; i <= 300; i++) {
    const res = checkRateLimit({
      key: `compiler:user:student-${i}`,
      config: RATE_LIMIT_PRESETS.COMPILER,
      role: "student",
    });
    assert.equal(res.allowed, true, `Student ${i} should be allowed`);
  }

  // Student 1 hits 20/min ceiling -> 21st request blocked with Retry-After
  for (let j = 2; j <= 20; j++) {
    const res = checkRateLimit({
      key: "compiler:user:student-1",
      config: RATE_LIMIT_PRESETS.COMPILER,
      role: "student",
    });
    assert.equal(res.allowed, true);
  }
  const blocked = checkRateLimit({
    key: "compiler:user:student-1",
    config: RATE_LIMIT_PRESETS.COMPILER,
    role: "student",
  });
  assert.equal(blocked.allowed, false);
  assert.ok(blocked.retryAfterSeconds >= 1);

  // Student 2 is completely unaffected by Student 1 being throttled
  const student2 = checkRateLimit({
    key: "compiler:user:student-2",
    config: RATE_LIMIT_PRESETS.COMPILER,
    role: "student",
  });
  assert.equal(student2.allowed, true);
});

test("Credentials Security: generates strong random passwords and salted digests", async () => {
  const { generateSecureTempPassword, hashDemoCredential } = await import(
    "../src/lib/auth/password-utils.ts"
  );

  const p1 = generateSecureTempPassword(12);
  const p2 = generateSecureTempPassword(12);
  assert.equal(p1.length, 12);
  assert.notEqual(p1, p2, "Generated temp passwords must be unique per user");
  assert.notEqual(p1, "Welcome@2026");

  const d1 = hashDemoCredential(p1, "saltA");
  const d2 = hashDemoCredential(p1, "saltB");
  assert.notEqual(d1, d2, "Different salts must produce different digests");
  assert.equal(d1, hashDemoCredential(p1, "saltA"));
  assert.notEqual(d1, hashDemoCredential("wrong-pass", "saltA"));
});

test("Clean Slate: zero default test users or mock student records on fresh startup", () => {
  const provisioning = fs.readFileSync(
    path.join(ROOT, "src", "lib", "services", "user-provisioning.ts"),
    "utf8"
  );
  const assessmentSvc = fs.readFileSync(
    path.join(ROOT, "src", "lib", "services", "assessment-service.ts"),
    "utf8"
  );
  const assignmentSvc = fs.readFileSync(
    path.join(ROOT, "src", "lib", "services", "assignment-service.ts"),
    "utf8"
  );
  const recruiterSvc = fs.readFileSync(
    path.join(ROOT, "src", "lib", "services", "recruiter-service.ts"),
    "utf8"
  );
  const seedDrives = fs.readFileSync(
    path.join(ROOT, "src", "lib", "seed-drives.ts"),
    "utf8"
  );
  const mig04 = fs.readFileSync(
    path.join(ROOT, "supabase", "migrations", "20261119000004_teacher_portal_schema.sql"),
    "utf8"
  );
  const mig05 = fs.readFileSync(
    path.join(ROOT, "supabase", "migrations", "20261119000005_assessment_engine_schema.sql"),
    "utf8"
  );

  assert.equal(assessmentSvc.includes("att-demo-karthik-001"), false);
  assert.equal(assignmentSvc.includes("Dr. S. Meenakshi"), false);
  assert.equal(recruiterSvc.includes("Karthik S."), false);
  assert.equal(seedDrives.includes("Karthik S."), false);
  assert.equal(mig04.includes("Dr. S. Meenakshi"), false);
  assert.equal(mig05.includes("Karthik S."), false);
  assert.equal(provisioning.includes("return [...SEED_STUDENTS"), false);
  assert.ok(
    fs.existsSync(
      path.join(ROOT, "supabase", "migrations", "20261123000010_purge_seed_test_records.sql")
    )
  );
});

test("RBAC Route Matrix: enforces strict isolation while allowing valid shared routes", async () => {
  const { canRoleAccessPath, normalizeRole, getRoleHomePath } = await import(
    "../src/lib/auth/rbac-routes.ts"
  );

  // Role normalization
  assert.equal(normalizeRole("mentor"), "teacher");
  assert.equal(normalizeRole("admin"), "tpo");
  assert.equal(normalizeRole("super_admin"), "super_admin");
  assert.equal(getRoleHomePath("teacher"), "/teacher/dashboard");
  assert.equal(getRoleHomePath("tpo"), "/tpo/dashboard");

  // Student isolation
  assert.equal(canRoleAccessPath("student", "/student/dashboard"), true);
  assert.equal(canRoleAccessPath("student", "/practice/two-sum"), true);
  assert.equal(canRoleAccessPath("student", "/teacher/dashboard"), false);
  assert.equal(canRoleAccessPath("student", "/tpo/dashboard"), false);
  assert.equal(canRoleAccessPath("student", "/super-admin/dashboard"), false);
  assert.equal(canRoleAccessPath("student", "/admin/problems"), false);

  // Teacher permissions (including Problem Bank & MNC Prep shared routes)
  assert.equal(canRoleAccessPath("teacher", "/teacher/dashboard"), true);
  assert.equal(canRoleAccessPath("teacher", "/admin/problems"), true);
  assert.equal(canRoleAccessPath("teacher", "/student/mnc-prep"), true);
  assert.equal(canRoleAccessPath("teacher", "/tpo/dashboard"), false);
  assert.equal(canRoleAccessPath("teacher", "/super-admin/users"), false);

  // TPO isolation
  assert.equal(canRoleAccessPath("tpo", "/tpo/dashboard"), true);
  assert.equal(canRoleAccessPath("tpo", "/tpo/drives"), true);
  assert.equal(canRoleAccessPath("tpo", "/teacher/dashboard"), false);
  assert.equal(canRoleAccessPath("tpo", "/super-admin/dashboard"), false);

  // Super Admin owner access
  assert.equal(canRoleAccessPath("super_admin", "/super-admin/dashboard"), true);
  assert.equal(canRoleAccessPath("super_admin", "/tpo/dashboard"), true);
  assert.equal(canRoleAccessPath("super_admin", "/teacher/dashboard"), true);
  assert.equal(canRoleAccessPath("student", "/leaderboard"), true);
  assert.equal(canRoleAccessPath("teacher", "/leaderboard"), true);
  assert.equal(canRoleAccessPath("tpo", "/leaderboard"), true);
});

test("Campus Leaderboard: composite XP ranking, department standings, and student Top-25 privacy cap", async () => {
  const { computeCampusLeaderboard, calculateCompositeScore } = await import(
    "@/lib/leaderboard-engine"
  );

  // AAA: Arrange 30 candidates so student privacy cap (Top 25) is exercised
  const candidates = Array.from({ length: 30 }, (_, idx) => ({
    id: `stu-${idx + 1}`,
    fullName: `Candidate ${String(idx + 1).padStart(2, "0")}`,
    rollNo: `23BCA${String(idx + 1).padStart(2, "0")}`,
    department: idx % 2 === 0 ? "BCA" : "MCA",
    batchYear: 2026,
    readinessScore: Math.max(20, 95 - idx * 2),
    problemsSolved: Math.max(1, 35 - idx),
    examAvgScore: Math.max(30, 92 - idx * 2),
    examsPassed: 2,
  }));

  // Act (Student viewer ranked #28)
  const studentView = computeCampusLeaderboard({
    candidates,
    viewerId: "stu-28",
    viewerRole: "student",
  });

  // Assert Student privacy cap + personal standing preserved
  assert.equal(studentView.visibleEntries.length, 25);
  assert.equal(studentView.isPrivacyCapped, true);
  assert.equal(studentView.canViewFullCohort, false);
  assert.equal(studentView.visibleEntries[0].rank, 1);
  assert.equal(
    studentView.visibleEntries[0].compositeScore,
    calculateCompositeScore(candidates[0])
  );
  assert.ok(studentView.myStanding);
  assert.equal(studentView.myStanding.entry.rank, 28);
  assert.ok(studentView.myStanding.pointsToNextRank > 0);
  assert.equal(studentView.departmentStandings.length, 2);

  // Act & Assert (TPO / Faculty sees full 30-student cohort)
  const tpoView = computeCampusLeaderboard({
    candidates,
    viewerId: "tpo-1",
    viewerRole: "tpo",
  });
  assert.equal(tpoView.visibleEntries.length, 30);
  assert.equal(tpoView.isPrivacyCapped, false);
  assert.equal(tpoView.canViewFullCohort, true);
});
