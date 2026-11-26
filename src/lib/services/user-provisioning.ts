import { UserProfile, UserRole } from "@/types";
import { DemoStore } from "@/lib/demo-store";
import { SEED_STUDENTS, SEED_TEACHER, SEED_TPO, SEED_ADMIN } from "@/lib/seed-data";
import { UserCredentialsService, generateSecureTempPassword } from "./user-credentials";

const PROVISIONED_USERS_KEY = "eqlv_provisioned_users_v1";
const TEST_USERS_PURGED_KEY = "eqlv_test_users_purged_v1";
const isClient = typeof window !== "undefined";

const SEED_USER_IDS = new Set([
  ...SEED_STUDENTS.map((u) => u.id),
  SEED_TEACHER.id,
  SEED_TPO.id,
  SEED_ADMIN.id,
]);

const FIRST_NAMES = [
  "Aravind", "Karthik", "Priya", "Sneha", "Vignesh", "Ananya", "Rahul", "Divya", "Suresh", "Meera",
  "Dinesh", "Keerthana", "Manoj", "Pavithra", "Gokul", "Nandhini", "Prashanth", "Deepa", "Santhosh", "Swathi",
  "Harish", "Rithika", "Naveen", "Abinaya", "Siddharth", "Lavanya", "Balaji", "Subramani", "Gayathri", "Mohan",
  "Archana", "Vijay", "Sandhya", "Ashok", "Kavitha", "Surya", "Janani", "Gautham", "Pooja", "Rajesh",
  "Shalini", "Ajith", "Madhumitha", "Saravanan", "Aishwarya", "Praveen", "Monica", "Ganesh", "Keerthi", "Akash"
];

const LAST_NAMES = [
  "S.", "R.", "M.", "K.", "V.", "P.", "N.", "T.", "B.", "A.",
  "Kumar", "Rajan", "Sundaram", "Chandran", "Murugan", "Nathan", "Krishnan", "Sekar", "Babu", "Mani"
];

export class UserProvisioningService {
  /**
   * Get all real provisioned users (100% clean slate by default - zero test users)
   */
  static getAllUsers(): UserProfile[] {
    if (!isClient) {
      return [];
    }

    try {
      const raw = localStorage.getItem(PROVISIONED_USERS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as UserProfile[];
        if (Array.isArray(parsed)) {
          // Automatically filter out any legacy built-in mock seed users
          const clean = parsed.filter((u) => !SEED_USER_IDS.has(u.id));
          if (clean.length !== parsed.length) {
            localStorage.setItem(PROVISIONED_USERS_KEY, JSON.stringify(clean));
          }
          return clean;
        }
      }
    } catch {
      // fallback to clean empty roster
    }

    return [];
  }

  /**
   * Check whether a user record belongs to built-in mock seed data
   */
  static isTestSeedUser(userId: string): boolean {
    return SEED_USER_IDS.has(userId);
  }

  /**
   * Purge all mock seed / test users so the institution starts from a 100% clean slate
   */
  static purgeTestUsers(): { removedCount: number; remainingCount: number } {
    if (!isClient) return { removedCount: 0, remainingCount: 0 };
    const all = this.getAllUsers();
    const realUsers = all.filter((u) => !SEED_USER_IDS.has(u.id));
    const removedCount = all.length - realUsers.length;

    localStorage.setItem(TEST_USERS_PURGED_KEY, "true");
    localStorage.setItem(PROVISIONED_USERS_KEY, JSON.stringify(realUsers));
    DemoStore.saveStudents(realUsers.filter((u) => u.role === "student"));
    return { removedCount, remainingCount: realUsers.length };
  }

  /**
   * Save users list to persistence and sync with DemoStore
   */
  private static saveUsers(users: UserProfile[]): void {
    if (!isClient) return;
    localStorage.setItem(PROVISIONED_USERS_KEY, JSON.stringify(users));

    // Also sync students with DemoStore
    const studentsOnly = users.filter((u) => u.role === "student");
    if (studentsOnly.length > 0) {
      DemoStore.saveStudents(studentsOnly);
    }
  }

  /**
   * Add a single user (Student, Mentor, or TPO)
   */
  static addSingleUser(userData: {
    fullName: string;
    email: string;
    role: UserRole;
    department: string;
    rollNo: string;
    batchYear: number;
    collegeName: string;
    tempPassword?: string;
  }): UserProfile {
    const all = this.getAllUsers();
    const existingIdx = all.findIndex(
      (u) =>
        (u.email && u.email.toLowerCase() === userData.email.toLowerCase()) ||
        (u.roll_no && u.roll_no.toLowerCase() === userData.rollNo.toLowerCase())
    );

    const newUser: UserProfile = {
      id: `usr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      full_name: userData.fullName,
      email: userData.email,
      role: userData.role,
      department: userData.department,
      roll_no: userData.rollNo,
      batch_year: userData.batchYear,
      college_name: userData.collegeName,
      readiness_score: 0,
      problems_solved: 0,
      created_at: new Date().toISOString(),
    };

    if (existingIdx >= 0) {
      // Update existing record
      all[existingIdx] = { ...all[existingIdx], ...newUser, id: all[existingIdx].id };
    } else {
      all.push(newUser);
    }

    this.saveUsers(all);

    // Save initial login credentials for the provisioned user (never hardcoded)
    const initialPass = userData.tempPassword || generateSecureTempPassword(12);
    UserCredentialsService.saveCredential({
      userId: existingIdx >= 0 ? all[existingIdx].id : newUser.id,
      email: userData.email,
      password: initialPass,
      rollNo: userData.rollNo,
      isTemp: true,
    });

    return existingIdx >= 0 ? all[existingIdx] : newUser;
  }

  /**
   * Bulk import users from parsed CSV rows
   */
  static bulkImportUsers(
    rows: Array<{
      name: string;
      email: string;
      rollNo: string;
      department: string;
      batchYear?: number;
      role?: UserRole;
      collegeName?: string;
    }>,
    defaultCollege = "Annai Vailankanni Arts and Science College, Thanjavur"
  ): { imported: number; updated: number; total: number } {
    const all = this.getAllUsers();
    let imported = 0;
    let updated = 0;

    rows.forEach((row, i) => {
      const email = row.email ? row.email.trim().toLowerCase() : `student.${row.rollNo.toLowerCase()}@college.edu`;
      const rollNo = row.rollNo ? row.rollNo.trim().toUpperCase() : `GEN-${i + 1}`;
      const fullName = row.name ? row.name.trim() : `Candidate ${rollNo}`;
      const department = row.department ? row.department.trim() : "BCA";
      const role = row.role || "student";
      const batchYear = row.batchYear || 2026;
      const collegeName = row.collegeName || defaultCollege;

      const existingIdx = all.findIndex(
        (u) =>
          (u.email && u.email.toLowerCase() === email) ||
          (u.roll_no && u.roll_no.toUpperCase() === rollNo)
      );

      const userRecord: UserProfile = {
        id: existingIdx >= 0 ? all[existingIdx].id : `usr-${Date.now()}-${i}`,
        full_name: fullName,
        email,
        roll_no: rollNo,
        department,
        role,
        batch_year: batchYear,
        college_name: collegeName,
        readiness_score: existingIdx >= 0 ? all[existingIdx].readiness_score : 0,
        problems_solved: existingIdx >= 0 ? all[existingIdx].problems_solved : 0,
        created_at: existingIdx >= 0 ? all[existingIdx].created_at : new Date().toISOString(),
      };

      if (existingIdx >= 0) {
        all[existingIdx] = userRecord;
        updated++;
      } else {
        all.push(userRecord);
        imported++;
      }

      // Persist credentials for bulk imported candidate (Pass@<rollNo>)
      UserCredentialsService.saveCredential({
        userId: userRecord.id,
        email: userRecord.email || "",
        password: `Pass@${userRecord.roll_no}`,
        rollNo: userRecord.roll_no,
        isTemp: true,
      });
    });

    this.saveUsers(all);
    return { imported, updated, total: all.length };
  }

  /**
   * 1-Click Generator: 300 Students + 10 Staff across BCA, CS, IT, MCA
   */
  static generate300StudentsAnd10Staff(
    collegeName = "Annai Vailankanni Arts and Science College, Thanjavur",
    cleanZeroBaseline = true
  ): { studentsCount: number; staffCount: number } {
    const departments = [
      { name: "BCA", code: "BCA", count: 75, batchYear: 2026 },
      { name: "B.Sc CS", code: "BCS", count: 75, batchYear: 2026 },
      { name: "B.Sc IT", code: "BIT", count: 75, batchYear: 2026 },
      { name: "MCA", code: "MCA", count: 75, batchYear: 2025 },
    ];

    const generatedStudents: UserProfile[] = [];

    // Generate 300 students (75 per department)
    departments.forEach((dept) => {
      for (let i = 1; i <= dept.count; i++) {
        const fName = FIRST_NAMES[(i * 3 + dept.name.length) % FIRST_NAMES.length];
        const lName = LAST_NAMES[(i * 7) % LAST_NAMES.length];
        const numStr = i.toString().padStart(2, "0");
        const rollNo = `23${dept.code}${numStr}`;
        const email = `${rollNo.toLowerCase()}@annai.edu.in`;

        // Realistic Gaussian-like readiness score around 72%
        const baseScore = 65 + ((i * 13) % 31);

        generatedStudents.push({
          id: `std-${dept.code.toLowerCase()}-${numStr}`,
          full_name: `${fName} ${lName}`,
          email,
          role: "student",
          roll_no: rollNo,
          department: dept.name,
          batch_year: dept.batchYear,
          college_name: collegeName,
          readiness_score: cleanZeroBaseline ? 0 : Math.min(100, Math.max(45, baseScore)),
          problems_solved: cleanZeroBaseline ? 0 : 3 + ((i * 5) % 15),
          created_at: new Date(Date.now() - (300 - i) * 3600000).toISOString(),
        });
      }
    });

    // 10 Faculty Mentors
    const facultyList = [
      { name: "Dr. S. Meenakshi", dept: "BCA", staffId: "STF-BCA-01", email: "meenakshi.s@annai.edu.in" },
      { name: "Prof. K. Ramesh", dept: "BCA", staffId: "STF-BCA-02", email: "ramesh.k@annai.edu.in" },
      { name: "Dr. A. Selvam", dept: "B.Sc CS", staffId: "STF-CS-01", email: "selvam.a@annai.edu.in" },
      { name: "Prof. M. Malathi", dept: "B.Sc CS", staffId: "STF-CS-02", email: "malathi.m@annai.edu.in" },
      { name: "Dr. P. Sundaram", dept: "B.Sc IT", staffId: "STF-IT-01", email: "sundaram.p@annai.edu.in" },
      { name: "Prof. N. Geetha", dept: "B.Sc IT", staffId: "STF-IT-02", email: "geetha.n@annai.edu.in" },
      { name: "Dr. R. Vijayakumar", dept: "MCA", staffId: "STF-MCA-01", email: "vijayakumar.r@annai.edu.in" },
      { name: "Prof. D. Kavitha", dept: "MCA", staffId: "STF-MCA-02", email: "kavitha.d@annai.edu.in" },
      { name: "Prof. T. Gopinath", dept: "Computer Applications", staffId: "STF-GEN-01", email: "gopinath.t@annai.edu.in" },
      { name: "Dr. B. Saravanan", dept: "Data Science & AI", staffId: "STF-AI-01", email: "saravanan.b@annai.edu.in" },
    ];

    const generatedStaff: UserProfile[] = facultyList.map((f, idx) => ({
      id: `tch-${idx + 1}`,
      full_name: f.name,
      email: f.email,
      role: "teacher",
      department: f.dept,
      roll_no: f.staffId,
      batch_year: 2026,
      college_name: collegeName,
      readiness_score: cleanZeroBaseline ? 0 : 95,
      problems_solved: cleanZeroBaseline ? 0 : 50,
      created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
    }));

    // Retain TPO & Super Admin
    const tpoAndAdmin = [SEED_TPO, SEED_ADMIN];

    const combinedRoster = [...generatedStudents, ...generatedStaff, ...tpoAndAdmin];
    this.saveUsers(combinedRoster);

    // Persist default credentials for generated staff
    generatedStaff.forEach((s) => {
      const initialStaffPass = ["Temp", s.roll_no || s.id.slice(-4), "2026"].join("@");
      UserCredentialsService.saveCredential({
        userId: s.id,
        email: s.email || "",
        password: initialStaffPass,
        rollNo: s.roll_no,
        isTemp: true,
      });
    });

    return {
      studentsCount: generatedStudents.length,
      staffCount: generatedStaff.length,
    };
  }

  /**
   * Reset roster to clean empty slate (Super Admin only, zero test users)
   */
  static resetToDefault(): void {
    if (!isClient) return;
    localStorage.setItem(TEST_USERS_PURGED_KEY, "true");
    localStorage.setItem(PROVISIONED_USERS_KEY, JSON.stringify([]));
    DemoStore.saveStudents([]);
  }

  /**
   * Generate downloadable sample CSV for Students
   */
  static getStudentCsvTemplate(): string {
    return [
      "Name,Register_No,Email,Department,Batch_Year",
      "Aravind Kumar S,23BCA01,23bca01@college.edu,BCA,2026",
      "Priya Selvam,23BCS01,23bcs01@college.edu,B.Sc CS,2026",
      "Karthik Raja,23BIT01,23bit01@college.edu,B.Sc IT,2026",
      "Sneha Sundaram,24MCA01,24mca01@college.edu,MCA,2025",
    ].join("\n");
  }

  /**
   * Generate downloadable sample CSV for Staff / Mentors
   */
  static getStaffCsvTemplate(): string {
    return [
      "Name,Staff_ID,Email,Department,Role",
      "Dr. S. Meenakshi,STF-BCA-01,meenakshi@college.edu,BCA,teacher",
      "Prof. K. Ramesh,STF-CS-01,ramesh.k@college.edu,B.Sc CS,teacher",
      "Prof. R. Anandhan,TPO-01,tpo@college.edu,Placement Cell,tpo",
    ].join("\n");
  }

  /**
   * Export all users into CSV string
   */
  static exportUsersCsv(users: UserProfile[]): string {
    const headers = ["ID", "Full_Name", "Email", "Role", "Roll_Or_StaffID", "Department", "Batch_Year", "College_Name", "Readiness_Score"];
    const rows = users.map((u) => [
      `"${u.id}"`,
      `"${u.full_name || ""}"`,
      `"${u.email || ""}"`,
      `"${u.role}"`,
      `"${u.roll_no || ""}"`,
      `"${u.department || ""}"`,
      `"${u.batch_year || ""}"`,
      `"${u.college_name || ""}"`,
      `"${u.readiness_score || 0}"`,
    ]);
    return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  }
}
