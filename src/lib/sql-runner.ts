/**
 * Zero-Cost In-Browser SQLite WebAssembly Engine (sql.js via CDN).
 * Runs 100% client-side in each student's browser with $0 server load.
 */

export interface SqlQueryResult {
  columns: string[];
  rows: Array<Array<string | number | null>>;
  rowCount: number;
  executionMs: number;
  error?: string;
}

export interface SqlChallenge {
  id: string;
  title: string;
  company: string;
  difficulty: "Easy" | "Medium" | "Hard";
  prompt: string;
  hint: string;
  starterSql: string;
  solutionSql: string;
}

interface SqlJsStatement {
  step(): boolean;
  getColumnNames(): string[];
  get(): Array<string | number | null | Uint8Array>;
  free(): void;
}

interface SqlJsDatabase {
  run(sql: string): void;
  prepare(sql: string): SqlJsStatement;
  close(): void;
}

interface SqlJsModule {
  Database: new () => SqlJsDatabase;
}

type InitSqlJsFn = (config: {
  locateFile: (file: string) => string;
}) => Promise<SqlJsModule>;

declare global {
  interface Window {
    initSqlJs?: InitSqlJsFn;
  }
}

const SQLJS_CDN_BASE = "https://cdn.jsdelivr.net/npm/sql.js@1.12.0/dist/";

export const CAMPUS_SEED_SQL = `
CREATE TABLE departments (
  dept_id INTEGER PRIMARY KEY,
  dept_name TEXT NOT NULL,
  hod_name TEXT NOT NULL
);

CREATE TABLE students (
  student_id INTEGER PRIMARY KEY,
  roll_no TEXT NOT NULL,
  full_name TEXT NOT NULL,
  dept_id INTEGER NOT NULL,
  cgpa REAL NOT NULL,
  readiness_score INTEGER NOT NULL,
  FOREIGN KEY (dept_id) REFERENCES departments(dept_id)
);

CREATE TABLE companies (
  company_id INTEGER PRIMARY KEY,
  company_name TEXT NOT NULL,
  tier TEXT NOT NULL,
  min_cgpa REAL NOT NULL
);

CREATE TABLE placements (
  placement_id INTEGER PRIMARY KEY,
  student_id INTEGER NOT NULL,
  company_id INTEGER NOT NULL,
  package_lpa REAL NOT NULL,
  offer_status TEXT NOT NULL,
  FOREIGN KEY (student_id) REFERENCES students(student_id),
  FOREIGN KEY (company_id) REFERENCES companies(company_id)
);

INSERT INTO departments VALUES
  (1, 'BCA', 'Dr. Meenakshi S.'),
  (2, 'B.Sc CS', 'Prof. R. Anandhan'),
  (3, 'MCA', 'Dr. Kavitha R.'),
  (4, 'B.Sc IT', 'Prof. S. Vignesh');

INSERT INTO students VALUES
  (101, '23BCA01', 'Karthik S.', 1, 8.9, 92),
  (102, '23BCA02', 'Divya Bharathi K.', 1, 8.4, 86),
  (103, '23CS012', 'Priya Dharshini M.', 2, 9.2, 95),
  (104, '23CS018', 'Arjun Karthik', 2, 7.6, 74),
  (105, '23MCA04', 'Saravanan V.', 3, 9.1, 91),
  (106, '23MCA09', 'Nithya Lakshmi P.', 3, 8.1, 82),
  (107, '23IT007', 'Deepak Raj M.', 4, 6.8, 63),
  (108, '23BCA15', 'Harini Devi S.', 1, 7.9, 78);

INSERT INTO companies VALUES
  (1, 'Zoho Corporation', 'Product', 7.5),
  (2, 'TCS Digital', 'MNC', 7.0),
  (3, 'Infosys Specialist', 'MNC', 7.5),
  (4, 'Freshworks', 'Product', 8.0);

INSERT INTO placements VALUES
  (1, 103, 1, 10.5, 'Accepted'),
  (2, 101, 4, 12.0, 'Accepted'),
  (3, 105, 1, 9.8, 'Accepted'),
  (4, 102, 2, 7.0, 'Accepted'),
  (5, 106, 3, 8.2, 'Pending'),
  (6, 104, 2, 7.0, 'Accepted');
`;

export const CAMPUS_SCHEMA_DOCS: Array<{
  table: string;
  columns: string[];
}> = [
  { table: "departments", columns: ["dept_id", "dept_name", "hod_name"] },
  {
    table: "students",
    columns: ["student_id", "roll_no", "full_name", "dept_id", "cgpa", "readiness_score"],
  },
  { table: "companies", columns: ["company_id", "company_name", "tier", "min_cgpa"] },
  {
    table: "placements",
    columns: ["placement_id", "student_id", "company_id", "package_lpa", "offer_status"],
  },
];

export const SQL_CHALLENGES: SqlChallenge[] = [
  {
    id: "sql-top-students",
    title: "High-CGPA Placement Candidates",
    company: "TCS Digital",
    difficulty: "Easy",
    prompt:
      "Return roll_no, full_name, and cgpa of all students with cgpa >= 8.5, ordered by cgpa descending.",
    hint: "Use WHERE cgpa >= 8.5 and ORDER BY cgpa DESC.",
    starterSql: "SELECT roll_no, full_name, cgpa\nFROM students\nWHERE cgpa >= 8.5\nORDER BY cgpa DESC;",
    solutionSql:
      "SELECT roll_no, full_name, cgpa FROM students WHERE cgpa >= 8.5 ORDER BY cgpa DESC;",
  },
  {
    id: "sql-dept-averages",
    title: "Department Readiness Leaderboard",
    company: "Infosys Specialist",
    difficulty: "Easy",
    prompt:
      "Join departments and students to return dept_name, student_count, and avg_readiness (rounded to 1 decimal), ordered by avg_readiness descending.",
    hint: "Use JOIN departments ON students.dept_id = departments.dept_id with GROUP BY dept_name and ROUND(AVG(readiness_score), 1).",
    starterSql:
      "SELECT d.dept_name,\n       COUNT(s.student_id) AS student_count,\n       ROUND(AVG(s.readiness_score), 1) AS avg_readiness\nFROM departments d\nJOIN students s ON d.dept_id = s.dept_id\nGROUP BY d.dept_name\nORDER BY avg_readiness DESC;",
    solutionSql:
      "SELECT d.dept_name, COUNT(s.student_id) AS student_count, ROUND(AVG(s.readiness_score), 1) AS avg_readiness FROM departments d JOIN students s ON d.dept_id = s.dept_id GROUP BY d.dept_name ORDER BY avg_readiness DESC;",
  },
  {
    id: "sql-product-offers",
    title: "Product-Tier Accepted Offers",
    company: "Zoho Corporation",
    difficulty: "Medium",
    prompt:
      "List full_name, company_name, and package_lpa for students who have an 'Accepted' offer from a 'Product' tier company, ordered by package_lpa descending.",
    hint: "Join placements, students, and companies, then filter on c.tier = 'Product' AND p.offer_status = 'Accepted'.",
    starterSql:
      "SELECT s.full_name, c.company_name, p.package_lpa\nFROM placements p\nJOIN students s ON p.student_id = s.student_id\nJOIN companies c ON p.company_id = c.company_id\nWHERE c.tier = 'Product' AND p.offer_status = 'Accepted'\nORDER BY p.package_lpa DESC;",
    solutionSql:
      "SELECT s.full_name, c.company_name, p.package_lpa FROM placements p JOIN students s ON p.student_id = s.student_id JOIN companies c ON p.company_id = c.company_id WHERE c.tier = 'Product' AND p.offer_status = 'Accepted' ORDER BY p.package_lpa DESC;",
  },
  {
    id: "sql-unplaced-students",
    title: "Unplaced Students Requiring Mentorship",
    company: "Cognizant GenC",
    difficulty: "Medium",
    prompt:
      "Find roll_no, full_name, and readiness_score of students who do NOT have any row in placements, ordered by readiness_score descending.",
    hint: "Use LEFT JOIN placements ON s.student_id = p.student_id WHERE p.placement_id IS NULL.",
    starterSql:
      "SELECT s.roll_no, s.full_name, s.readiness_score\nFROM students s\nLEFT JOIN placements p ON s.student_id = p.student_id\nWHERE p.placement_id IS NULL\nORDER BY s.readiness_score DESC;",
    solutionSql:
      "SELECT s.roll_no, s.full_name, s.readiness_score FROM students s LEFT JOIN placements p ON s.student_id = p.student_id WHERE p.placement_id IS NULL ORDER BY s.readiness_score DESC;",
  },
  {
    id: "sql-above-avg-package",
    title: "Above-Average Salary Packages",
    company: "Freshworks",
    difficulty: "Hard",
    prompt:
      "Using a subquery, return full_name, company_name, and package_lpa for all placements whose package_lpa is strictly greater than the overall average package_lpa, ordered by package_lpa descending.",
    hint: "Filter with WHERE p.package_lpa > (SELECT AVG(package_lpa) FROM placements).",
    starterSql:
      "SELECT s.full_name, c.company_name, p.package_lpa\nFROM placements p\nJOIN students s ON p.student_id = s.student_id\nJOIN companies c ON p.company_id = c.company_id\nWHERE p.package_lpa > (SELECT AVG(package_lpa) FROM placements)\nORDER BY p.package_lpa DESC;",
    solutionSql:
      "SELECT s.full_name, c.company_name, p.package_lpa FROM placements p JOIN students s ON p.student_id = s.student_id JOIN companies c ON p.company_id = c.company_id WHERE p.package_lpa > (SELECT AVG(package_lpa) FROM placements) ORDER BY p.package_lpa DESC;",
  },
];

let cachedSqlModule: Promise<SqlJsModule> | null = null;

function loadSqlJsScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("SQLite WASM only runs in the browser."));
  }
  if (window.initSqlJs) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-sqljs="true"]'
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("Failed to load sql.js CDN script."))
      );
      return;
    }

    const script = document.createElement("script");
    script.src = `${SQLJS_CDN_BASE}sql-wasm.js`;
    script.async = true;
    script.dataset.sqljs = "true";
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Failed to load sql.js WebAssembly runtime."));
    document.head.appendChild(script);
  });
}

async function getSqlModule(): Promise<SqlJsModule> {
  if (!cachedSqlModule) {
    cachedSqlModule = loadSqlJsScript().then(() => {
      if (!window.initSqlJs) {
        throw new Error("sql.js failed to initialize.");
      }
      return window.initSqlJs({
        locateFile: (file: string) => `${SQLJS_CDN_BASE}${file}`,
      });
    });
  }
  return cachedSqlModule;
}

export async function runSqlQuery(query: string): Promise<SqlQueryResult> {
  const start = performance.now();
  const trimmed = query.trim();
  if (!trimmed) {
    return {
      columns: [],
      rows: [],
      rowCount: 0,
      executionMs: 0,
      error: "Write a SQL query before running.",
    };
  }

  try {
    const SQL = await getSqlModule();
    const db = new SQL.Database();
    try {
      db.run(CAMPUS_SEED_SQL);
      const stmt = db.prepare(trimmed);
      const columns = stmt.getColumnNames();
      const rows: Array<Array<string | number | null>> = [];
      try {
        while (stmt.step()) {
          const rawRow = stmt.get();
          rows.push(
            rawRow.map((cell) =>
              cell instanceof Uint8Array ? `[BLOB ${cell.byteLength}B]` : cell
            )
          );
        }
      } finally {
        stmt.free();
      }
      const executionMs = Math.max(1, Math.round(performance.now() - start));

      return {
        columns,
        rows,
        rowCount: rows.length,
        executionMs,
      };
    } finally {
      db.close();
    }
  } catch (err) {
    return {
      columns: [],
      rows: [],
      rowCount: 0,
      executionMs: Math.max(1, Math.round(performance.now() - start)),
      error: err instanceof Error ? err.message : "SQL execution failed.",
    };
  }
}

export async function verifySqlChallenge(
  userSql: string,
  solutionSql: string
): Promise<{
  passed: boolean;
  userResult: SqlQueryResult;
  expectedResult: SqlQueryResult;
}> {
  const [userResult, expectedResult] = await Promise.all([
    runSqlQuery(userSql),
    runSqlQuery(solutionSql),
  ]);

  if (userResult.error || expectedResult.error) {
    return { passed: false, userResult, expectedResult };
  }

  const normalize = (res: SqlQueryResult) =>
    JSON.stringify(
      res.rows.map((r) => r.map((v) => (v === null ? null : String(v))))
    );

  const passed =
    userResult.columns.length === expectedResult.columns.length &&
    normalize(userResult) === normalize(expectedResult);

  return { passed, userResult, expectedResult };
}
