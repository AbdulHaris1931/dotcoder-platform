import { UserProfile, UserRole } from "@/types";
import { UserProvisioningService } from "./user-provisioning";
import { UserCredentialsService } from "./user-credentials";
import { DemoStore } from "@/lib/demo-store";

export type AccountStatus = "active" | "inactive" | "suspended" | "archived";

export interface ManagedUser extends UserProfile {
  account_status?: AccountStatus;
  suspended_at?: string;
  suspension_reason?: string;
  archived_at?: string;
  last_sign_in_at?: string;
}

export interface AdminAuditLog {
  id: string;
  actor_id: string;
  actor_email: string;
  actor_type: string;
  action: string;
  target_user_id?: string;
  target_user_email?: string;
  target_user_role?: string;
  operation_result: "success" | "failed" | "blocked";
  reason?: string;
  metadata?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface DashboardMetrics {
  totalUsers: number;
  totalMentors: number;
  totalStudents: number;
  totalTpos: number;
  activeUsers: number;
  inactiveUsers: number;
  recentlyCreated: number;
  suspendedUsers: number;
  roleDistribution: {
    students: number;
    mentors: number;
    tpos: number;
  };
}

const AUDIT_LOGS_STORAGE_KEY = "eqlv_admin_audit_logs_v1";
const isClient = typeof window !== "undefined";
const OWNER_EMAIL = "mmam92005@gmail.com";
const OWNER_ID = "c8d50800-aae2-42b6-84a7-f10241621c5a";

export function isOwnerRecord(user: { email?: string; id?: string } | null | undefined): boolean {
  if (!user) return false;
  return (
    user.email?.toLowerCase() === OWNER_EMAIL ||
    user.email?.toLowerCase() === "owner@eqlv.code" ||
    user.id === OWNER_ID ||
    user.id === "usr-super-admin-owner"
  );
}

export class SuperAdminService {
  /**
   * Log an administrative activity (append-only)
   */
  static logActivity(
    entry: Omit<AdminAuditLog, "id" | "created_at" | "actor_id" | "actor_email" | "actor_type"> & {
      actor_id?: string;
      actor_email?: string;
      actor_type?: string;
    }
  ): AdminAuditLog {
    const fullLog: AdminAuditLog = {
      ...entry,
      actor_id: entry.actor_id || OWNER_ID,
      actor_email: entry.actor_email || OWNER_EMAIL,
      actor_type: entry.actor_type || "super_admin",
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      created_at: new Date().toISOString(),
    };

    if (isClient) {
      try {
        const raw = localStorage.getItem(AUDIT_LOGS_STORAGE_KEY);
        const existing: AdminAuditLog[] = raw ? JSON.parse(raw) : [];
        existing.unshift(fullLog);
        // Keep last 500 audit logs
        localStorage.setItem(AUDIT_LOGS_STORAGE_KEY, JSON.stringify(existing.slice(0, 500)));
      } catch (err) {
        console.warn("[SuperAdminService] Failed to persist audit log:", err);
      }
    }

    return fullLog;
  }

  /**
   * Retrieve administrative activity logs
   */
  static getAuditLogs(options?: {
    action?: string;
    search?: string;
    limit?: number;
  }): AdminAuditLog[] {
    let logs: AdminAuditLog[] = [];

    if (isClient) {
      try {
        const raw = localStorage.getItem(AUDIT_LOGS_STORAGE_KEY);
        if (raw) {
          logs = JSON.parse(raw);
        }
      } catch {
        logs = [];
      }
    }

    // Seed default baseline logs if empty
    if (logs.length === 0) {
      logs = [
        {
          id: "log-seed-1",
          actor_id: OWNER_ID,
          actor_email: OWNER_EMAIL,
          actor_type: "super_admin",
          action: "SYSTEM_INITIALIZED",
          operation_result: "success",
          reason: "Super Admin private enclave verified for Abdul Haris M with zero code-leak guardrails.",
          created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
        },
        {
          id: "log-seed-2",
          actor_id: OWNER_ID,
          actor_email: OWNER_EMAIL,
          actor_type: "super_admin",
          action: "AUDIT_LOGS_ENABLED",
          operation_result: "success",
          reason: "Append-only security audit log stream active.",
          created_at: new Date(Date.now() - 3600000).toISOString(),
        },
      ];
      if (isClient) {
        localStorage.setItem(AUDIT_LOGS_STORAGE_KEY, JSON.stringify(logs));
      }
    }

    if (options?.action && options.action !== "ALL") {
      logs = logs.filter((l) => l.action === options.action);
    }

    if (options?.search) {
      const q = options.search.toLowerCase();
      logs = logs.filter(
        (l) =>
          l.action.toLowerCase().includes(q) ||
          (l.target_user_email && l.target_user_email.toLowerCase().includes(q)) ||
          (l.reason && l.reason.toLowerCase().includes(q))
      );
    }

    if (options?.limit) {
      logs = logs.slice(0, options.limit);
    }

    return logs;
  }

  /**
   * Get all managed users with status normalization
   */
  static getAllUsers(): ManagedUser[] {
    const rawList = UserProvisioningService.getAllUsers();
    return rawList.map((user) => ({
      ...user,
      account_status: (user as ManagedUser).account_status || "active",
      last_sign_in_at: (user as ManagedUser).last_sign_in_at || user.created_at,
    }));
  }

  /**
   * Calculate live global database statistics
   */
  static getDashboardMetrics(): DashboardMetrics {
    const users = this.getAllUsers();
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    let mentors = 0;
    let students = 0;
    let tpos = 0;
    let active = 0;
    let inactive = 0;
    let suspended = 0;
    let recent = 0;

    for (const u of users) {
      const role = u.role;
      if (role === "teacher") mentors++;
      else if (role === "student") students++;
      else if (role === "tpo" || role === "admin") tpos++;

      const status = u.account_status || "active";
      if (status === "active") active++;
      else if (status === "suspended") suspended++;
      else inactive++;

      if (u.created_at && new Date(u.created_at).getTime() > oneWeekAgo) {
        recent++;
      }
    }

    return {
      totalUsers: users.length,
      totalMentors: mentors,
      totalStudents: students,
      totalTpos: tpos,
      activeUsers: active,
      inactiveUsers: inactive,
      recentlyCreated: recent,
      suspendedUsers: suspended,
      roleDistribution: {
        students,
        mentors,
        tpos,
      },
    };
  }

  /**
   * Find user by ID
   */
  static getUserById(id: string): ManagedUser | null {
    const users = this.getAllUsers();
    return users.find((u) => u.id === id) || null;
  }

  /**
   * Add a new managed user (Mentor, Student, or TPO)
   */
  static createUser(params: {
    fullName: string;
    email: string;
    role: "student" | "teacher" | "tpo";
    department: string;
    rollNo: string;
    batchYear: number;
    collegeName: string;
    accountStatus?: AccountStatus;
    passwordOption: "temp_password" | "invite_link";
    tempPassword?: string;
  }): { success: boolean; user?: ManagedUser; error?: string } {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(params.email)) {
      return { success: false, error: "Please enter a valid email address." };
    }

    const all = this.getAllUsers();
    const duplicateEmail = all.find((u) => u.email?.toLowerCase() === params.email.toLowerCase());
    if (duplicateEmail) {
      return { success: false, error: `An account with email ${params.email} already exists.` };
    }

    if (params.role === "student" && params.rollNo) {
      const duplicateRoll = all.find(
        (u) => u.roll_no && u.roll_no.toLowerCase() === params.rollNo.toLowerCase()
      );
      if (duplicateRoll) {
        return { success: false, error: `Roll number ${params.rollNo} is already registered.` };
      }
    }

    const created = UserProvisioningService.addSingleUser({
      fullName: params.fullName,
      email: params.email,
      role: params.role as UserRole,
      department: params.department,
      rollNo: params.rollNo,
      batchYear: params.batchYear,
      collegeName: params.collegeName,
      tempPassword: params.tempPassword,
    });

    const managedUser: ManagedUser = {
      ...created,
      account_status: params.accountStatus || "active",
      last_sign_in_at: undefined,
    };

    // Update in stored list
    this.saveUserRecord(managedUser);

    this.logActivity({
      actor_id: "usr-super-admin-owner",
      actor_email: "owner@eqlv.code",
      actor_type: "super_admin",
      action: "USER_CREATED",
      target_user_id: managedUser.id,
      target_user_email: managedUser.email,
      target_user_role: managedUser.role,
      operation_result: "success",
      reason: `Provisioned new ${params.role.toUpperCase()} account via Super Admin console. Onboarding: ${params.passwordOption}.`,
      metadata: {
        department: params.department,
        college: params.collegeName,
        passwordOption: params.passwordOption,
      },
    });

    return { success: true, user: managedUser };
  }

  /**
   * Bulk import students with automatic duplicate skipping and audit logging
   */
  static bulkImportStudents(
    students: Array<{
      full_name: string;
      roll_no: string;
      email: string;
      department: string;
      batch_year: number;
      college_name: string;
    }>
  ): {
    imported: number;
    skipped: number;
    total: number;
    details: Array<{ roll_no: string; full_name: string; status: "added" | "skipped_duplicate" }>;
  } {
    const all = this.getAllUsers();
    const existingEmails = new Set(all.map((u) => u.email?.toLowerCase().trim()).filter(Boolean));
    const existingRolls = new Set(all.map((u) => u.roll_no?.toUpperCase().trim()).filter(Boolean));

    let importedCount = 0;
    let skippedCount = 0;
    const details: Array<{ roll_no: string; full_name: string; status: "added" | "skipped_duplicate" }> = [];
    const newManagedUsers: ManagedUser[] = [];

    for (const stud of students) {
      const cleanEmail = stud.email.toLowerCase().trim();
      const cleanRoll = stud.roll_no.toUpperCase().trim();

      if (existingEmails.has(cleanEmail) || existingRolls.has(cleanRoll)) {
        skippedCount++;
        details.push({
          roll_no: cleanRoll,
          full_name: stud.full_name,
          status: "skipped_duplicate",
        });
        continue;
      }

      existingEmails.add(cleanEmail);
      existingRolls.add(cleanRoll);

      const created = UserProvisioningService.addSingleUser({
        fullName: stud.full_name,
        email: cleanEmail,
        role: "student",
        department: stud.department,
        rollNo: cleanRoll,
        batchYear: stud.batch_year,
        collegeName: stud.college_name,
      });

      const managedUser: ManagedUser = {
        ...created,
        account_status: "active",
        last_sign_in_at: undefined,
      };

      newManagedUsers.push(managedUser);
      importedCount++;
      details.push({
        roll_no: cleanRoll,
        full_name: stud.full_name,
        status: "added",
      });
    }

    // Persist all new records
    newManagedUsers.forEach((u) => this.saveUserRecord(u));

    // Log administrative activity
    if (importedCount > 0) {
      this.logActivity({
        actor_id: "usr-super-admin-owner",
        actor_email: "owner@eqlv.code",
        actor_type: "super_admin",
        action: "USER_CREATED",
        operation_result: "success",
        reason: `Bulk provisioned ${importedCount} student accounts via AI CSV Parser (${skippedCount} duplicates skipped). Initial credentials: Pass@<RollNo>.`,
        metadata: {
          importedCount,
          skippedCount,
          totalProcessed: students.length,
        },
      });
    }

    return {
      imported: importedCount,
      skipped: skippedCount,
      total: students.length,
      details,
    };
  }

  /**
   * Update an existing user's details
   */
  static updateUser(
    id: string,
    updates: Partial<ManagedUser>,
    reason: string = "Administrative update"
  ): { success: boolean; user?: ManagedUser; error?: string } {
    const existing = this.getUserById(id);
    if (!existing) {
      return { success: false, error: "User not found." };
    }

    // Protect owner identity
    if (isOwnerRecord(existing)) {
      return { success: false, error: "The Sovereign Owner account cannot be modified via ordinary user management." };
    }

    const roleChanged = updates.role && updates.role !== existing.role;
    const updatedUser: ManagedUser = {
      ...existing,
      ...updates,
      id: existing.id, // Preserve immutable ID
    };

    this.saveUserRecord(updatedUser);

    this.logActivity({
      action: roleChanged ? "USER_ROLE_CHANGED" : "USER_UPDATED",
      target_user_id: updatedUser.id,
      target_user_email: updatedUser.email,
      target_user_role: updatedUser.role,
      operation_result: "success",
      reason: roleChanged
        ? `Role transitioned from ${existing.role.toUpperCase()} to ${updatedUser.role.toUpperCase()}. Reason: ${reason}`
        : reason,
      metadata: { previousRole: existing.role, newRole: updatedUser.role },
    });

    return { success: true, user: updatedUser };
  }

  /**
   * Set user account status (active, inactive, suspended, archived)
   */
  static setUserStatus(
    id: string,
    newStatus: AccountStatus,
    reason: string
  ): { success: boolean; user?: ManagedUser; error?: string } {
    const user = this.getUserById(id);
    if (!user) {
      return { success: false, error: "User not found." };
    }

    // Owner protection
    if (isOwnerRecord(user)) {
      return { success: false, error: "The Owner account cannot be suspended or deactivated." };
    }

    const updates: Partial<ManagedUser> = {
      account_status: newStatus,
    };

    if (newStatus === "suspended") {
      updates.suspended_at = new Date().toISOString();
      updates.suspension_reason = reason;
    } else if (newStatus === "archived") {
      updates.archived_at = new Date().toISOString();
    } else if (newStatus === "active") {
      updates.suspended_at = undefined;
      updates.suspension_reason = undefined;
    }

    return this.updateUser(id, updates, `Status changed to ${newStatus.toUpperCase()}: ${reason}`);
  }

  /**
   * Safe Archive Account (Level 1 Deletion - 100% Data Preserved)
   */
  static archiveUser(id: string, reason: string): { success: boolean; error?: string } {
    const res = this.setUserStatus(id, "archived", reason);
    if (res.success) {
      this.logActivity({
        action: "ACCOUNT_ARCHIVED",
        target_user_id: id,
        target_user_email: res.user?.email,
        target_user_role: res.user?.role,
        operation_result: "success",
        reason: `Account archived safely. All submissions, scores, and records preserved. Reason: ${reason}`,
      });
      return { success: true };
    }
    return { success: false, error: res.error };
  }

  /**
   * Permanent Delete User (Level 2 Purge)
   */
  static permanentlyDeleteUser(
    id: string,
    confirmationWord: string
  ): { success: boolean; error?: string } {
    if (confirmationWord !== "DELETE") {
      return { success: false, error: "Confirmation keyword must exactly match 'DELETE'." };
    }

    const user = this.getUserById(id);
    if (!user) {
      return { success: false, error: "User not found." };
    }

    // Owner protection
    if (isOwnerRecord(user)) {
      return { success: false, error: "The Owner account cannot be deleted." };
    }

    const all = this.getAllUsers();
    const remaining = all.filter((u) => u.id !== id);

    if (isClient) {
      localStorage.setItem("eqlv_provisioned_users_v1", JSON.stringify(remaining));
      const studentsOnly = remaining.filter((u) => u.role === "student");
      DemoStore.saveStudents(studentsOnly);
    }

    this.logActivity({
      actor_id: "usr-super-admin-owner",
      actor_email: "owner@eqlv.code",
      actor_type: "super_admin",
      action: "ACCOUNT_PERMANENTLY_DELETED",
      target_user_id: id,
      target_user_email: user.email,
      target_user_role: user.role,
      operation_result: "success",
      reason: "Owner explicitly authorized permanent purge of account.",
      metadata: { previousUser: { email: user.email, name: user.full_name, role: user.role } },
    });

    return { success: true };
  }

  /**
   * Initiate password reset
   */
  static initiatePasswordReset(
    id: string,
    mode: "email_link" | "temp_password",
    tempPassword?: string
  ): { success: boolean; message: string; tempPassword?: string } {
    const user = this.getUserById(id);
    if (!user) {
      return { success: false, message: "Target user not found." };
    }

    this.logActivity({
      actor_id: "usr-super-admin-owner",
      actor_email: "owner@eqlv.code",
      actor_type: "super_admin",
      action: "PASSWORD_RESET_INITIATED",
      target_user_id: user.id,
      target_user_email: user.email,
      target_user_role: user.role,
      operation_result: "success",
      reason: `Password reset dispatched via ${mode === "email_link" ? "secure email magic link" : "temporary administrative password"}.`,
      metadata: { resetMode: mode },
    });

    if (mode === "email_link") {
      return {
        success: true,
        message: `Secure password reset invitation dispatched to ${user.email}.`,
      };
    } else {
      const generated = tempPassword || `Temp@${Math.floor(100000 + Math.random() * 900000)}`;
      UserCredentialsService.saveCredential({
        userId: user.id,
        email: user.email || "",
        password: generated,
        rollNo: user.roll_no,
        isTemp: true,
      });
      return {
        success: true,
        message: `Temporary password generated for ${user.full_name}.`,
        tempPassword: generated,
      };
    }
  }

  /**
   * Record sign-in timestamp for user audit
   */
  static recordUserSignIn(userId: string): void {
    if (!isClient || !userId) return;
    try {
      const all = this.getAllUsers();
      const idx = all.findIndex((u) => u.id === userId);
      if (idx >= 0) {
        all[idx].last_sign_in_at = new Date().toISOString();
        localStorage.setItem("eqlv_provisioned_users_v1", JSON.stringify(all));
      }
    } catch {}
  }

  /**
   * Helper to write back to persistence
   */
  private static saveUserRecord(updated: ManagedUser): void {
    if (!isClient) return;
    const all = this.getAllUsers();
    const idx = all.findIndex((u) => u.id === updated.id);
    if (idx >= 0) {
      all[idx] = updated;
    } else {
      all.push(updated);
    }
    localStorage.setItem("eqlv_provisioned_users_v1", JSON.stringify(all));

    const studentsOnly = all.filter((u) => u.role === "student");
    DemoStore.saveStudents(studentsOnly);
  }
}
