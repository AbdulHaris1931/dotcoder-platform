import { UserProfile } from "@/types";
import { DemoStore } from "@/lib/demo-store";
import { UserProvisioningService } from "./user-provisioning";
import { generateSecureTempPassword, hashDemoCredential } from "@/lib/auth/password-utils";

export { generateSecureTempPassword, hashDemoCredential };

export interface StoredCredential {
  userId: string;
  email: string;
  rollNo?: string;
  /** Salted digest stored in Local Demo Mode - never raw plaintext */
  passwordDigest: string;
  salt: string;
  isTemp?: boolean;
  updatedAt: string;
}

const CREDENTIALS_KEY = "eqlv_user_credentials_v2";
const LEGACY_CREDENTIALS_KEY = "eqlv_user_credentials_v1";
const isClient = typeof window !== "undefined";

export class UserCredentialsService {
  /**
   * Retrieve all stored Local Demo Mode credentials (auto-purging legacy plaintext storage)
   */
  private static getAll(): Record<string, StoredCredential> {
    if (!isClient) return {};
    try {
      // Remove legacy plaintext credentials store if present on shared lab machines
      if (localStorage.getItem(LEGACY_CREDENTIALS_KEY)) {
        localStorage.removeItem(LEGACY_CREDENTIALS_KEY);
      }
      const raw = localStorage.getItem(CREDENTIALS_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (err) {
      console.warn("[UserCredentialsService] Failed to read credentials:", err);
    }
    return {};
  }

  /**
   * Persist a salted hash of a user's credential in Local Demo Mode
   */
  static saveCredential(params: {
    userId: string;
    email: string;
    password: string;
    rollNo?: string;
    isTemp?: boolean;
  }): void {
    if (!isClient) return;
    try {
      const all = this.getAll();
      const salt = generateSecureTempPassword(8);
      const record: StoredCredential = {
        userId: params.userId,
        email: params.email.toLowerCase().trim(),
        rollNo: params.rollNo ? params.rollNo.toUpperCase().trim() : undefined,
        passwordDigest: hashDemoCredential(params.password, salt),
        salt,
        isTemp: params.isTemp,
        updatedAt: new Date().toISOString(),
      };

      all[params.userId] = record;
      all[params.email.toLowerCase().trim()] = record;
      if (params.rollNo) {
        all[params.rollNo.toUpperCase().trim()] = record;
      }

      localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(all));
    } catch (err) {
      console.warn("[UserCredentialsService] Failed to save credential:", err);
    }
  }

  /**
   * Clear all stored local demo credentials
   */
  static clearAllCredentials(): void {
    if (!isClient) return;
    localStorage.removeItem(CREDENTIALS_KEY);
    localStorage.removeItem(LEGACY_CREDENTIALS_KEY);
  }

  /**
   * Get credential record by identifier (userId, email, or rollNo)
   */
  static getCredential(identifier: string): StoredCredential | null {
    if (!identifier || !isClient) return null;
    const all = this.getAll();
    const clean = identifier.trim();
    return all[clean] || all[clean.toLowerCase()] || all[clean.toUpperCase()] || null;
  }

  /**
   * Verify credentials strictly in Local Demo Mode (when Supabase is not configured).
   * Zero hardcoded master passwords or leaked owner secrets exist in client bundles.
   */
  static verifyCredentials(
    identifier: string,
    passwordAttempt: string
  ): {
    valid: boolean;
    user?: UserProfile;
    error?: string;
  } {
    if (!identifier || !passwordAttempt) {
      return { valid: false, error: "Please enter your username/email and password." };
    }

    const cleanId = identifier.trim();
    const cleanPass = passwordAttempt.trim();

    // 1. Find user in unified demo store
    const user = DemoStore.findUser(cleanId);
    if (!user) {
      return {
        valid: false,
        error: `No registered account found matching "${cleanId}". Please check your email or roll number.`,
      };
    }

    // 2. Check account suspension status if provisioned
    const allProvisioned = UserProvisioningService.getAllUsers();
    const matchedProvisioned = allProvisioned.find((u) => u.id === user.id) as
      | (UserProfile & { account_status?: string })
      | undefined;
    if (matchedProvisioned && matchedProvisioned.account_status) {
      if (matchedProvisioned.account_status === "suspended") {
        return {
          valid: false,
          error: "Your account has been suspended by the platform administrator. Access denied.",
        };
      }
      if (matchedProvisioned.account_status === "archived") {
        return {
          valid: false,
          error: "This account has been archived. Please contact your college placement office.",
        };
      }
    }

    // 3. Verify against salted digest stored for this specific user
    const stored =
      this.getCredential(user.id) ||
      this.getCredential(user.email || "") ||
      (user.roll_no ? this.getCredential(user.roll_no) : null);

    if (stored) {
      const attemptDigest = hashDemoCredential(cleanPass, stored.salt);
      if (attemptDigest === stored.passwordDigest) {
        return { valid: true, user };
      }
      return {
        valid: false,
        error: `Incorrect password for ${user.full_name}. Please verify your credentials or contact your administrator.`,
      };
    }

    // 4. Local Demo Mode per-roll initial credential (only when no custom password is saved)
    if (user.roll_no) {
      const expectedRollPass = `Pass@${user.roll_no}`;
      if (cleanPass === expectedRollPass) {
        return { valid: true, user };
      }
    }

    return {
      valid: false,
      error: `Incorrect password for ${user.full_name}. Please verify your credentials or contact your administrator.`,
    };
  }
}
