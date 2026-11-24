import { MNC_CURRICULUM_UNITS } from "./mnc-curriculum-data";
import { DemoStore } from "./demo-store";

export interface MncAssessmentRecord {
  unitId: string;
  bestScore: number;
  lastScore: number;
  attemptsCount: number;
  isPassed: boolean; // >= 75
  lastAttemptedAt: string;
  accuracyScore: number;
}

export interface MncMcqPracticeRecord {
  mcqId: string;
  unitId: string;
  selectedLetter: "A" | "B" | "C" | "D";
  selectedOption: string;
  isCorrect: boolean;
  answeredAt: string;
}

export interface MncProgressState {
  unlockedUnitIds: string[];
  assessmentRecords: Record<string, MncAssessmentRecord>;
}

const STORAGE_KEY = "eqlv_mnc_curriculum_progress_v1";
const MCQ_PRACTICE_KEY = "eqlv_mnc_mcq_practice_v1";
const isClient = typeof window !== "undefined";

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((fn) => {
    try {
      fn();
    } catch (e) {
      console.error("[MncStore] listener error:", e);
    }
  });
}

export function subscribeToMncStore(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export class MncStore {
  private static getStorageKey(): string {
    if (!isClient) return STORAGE_KEY;
    try {
      const u = DemoStore.getCurrentUser();
      return u?.id ? `${STORAGE_KEY}_${u.id}` : STORAGE_KEY;
    } catch {
      return STORAGE_KEY;
    }
  }

  private static getMcqStorageKey(): string {
    if (!isClient) return MCQ_PRACTICE_KEY;
    try {
      const u = DemoStore.getCurrentUser();
      return u?.id ? `${MCQ_PRACTICE_KEY}_${u.id}` : MCQ_PRACTICE_KEY;
    } catch {
      return MCQ_PRACTICE_KEY;
    }
  }

  private static getDefaultState(): MncProgressState {
    return {
      unlockedUnitIds: ["unit-1"], // Unit 1 always unlocked by default
      assessmentRecords: {},
    };
  }

  static getProgress(): MncProgressState {
    if (!isClient) return this.getDefaultState();
    try {
      const stored = localStorage.getItem(this.getStorageKey());
      if (stored) {
        const parsed = JSON.parse(stored) as MncProgressState;
        if (parsed && Array.isArray(parsed.unlockedUnitIds)) {
          // Guarantee unit-1 is always in unlocked list
          if (!parsed.unlockedUnitIds.includes("unit-1")) {
            parsed.unlockedUnitIds.unshift("unit-1");
          }
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    const def = this.getDefaultState();
    if (isClient) {
      localStorage.setItem(this.getStorageKey(), JSON.stringify(def));
    }
    return def;
  }

  static isUnitUnlocked(unitId: string): boolean {
    const progress = this.getProgress();
    return progress.unlockedUnitIds.includes(unitId);
  }

  static getRecord(unitId: string): MncAssessmentRecord | null {
    const progress = this.getProgress();
    return progress.assessmentRecords[unitId] || null;
  }

  static recordAttempt(
    unitId: string,
    score: number,
    accuracy: number
  ): { isNewUnlock: boolean; nextUnitId: string | null } {
    if (!isClient) return { isNewUnlock: false, nextUnitId: null };

    const progress = this.getProgress();
    const existing = progress.assessmentRecords[unitId];
    const isPassed = score >= 75;

    const newRecord: MncAssessmentRecord = {
      unitId,
      bestScore: existing ? Math.max(existing.bestScore, score) : score,
      lastScore: score,
      attemptsCount: (existing?.attemptsCount || 0) + 1,
      isPassed: isPassed || (existing?.isPassed ?? false),
      lastAttemptedAt: new Date().toISOString(),
      accuracyScore: Math.round(accuracy),
    };

    progress.assessmentRecords[unitId] = newRecord;

    let isNewUnlock = false;
    let nextUnitId: string | null = null;

    // Sequential progression: if candidate achieves >= 75%, unlock next unit!
    if (isPassed) {
      const unitIndex = MNC_CURRICULUM_UNITS.findIndex((u) => u.id === unitId);
      if (unitIndex >= 0 && unitIndex < MNC_CURRICULUM_UNITS.length - 1) {
        const nextUnit = MNC_CURRICULUM_UNITS[unitIndex + 1];
        nextUnitId = nextUnit.id;
        if (!progress.unlockedUnitIds.includes(nextUnit.id)) {
          progress.unlockedUnitIds.push(nextUnit.id);
          isNewUnlock = true;
        }
      }
    }

    localStorage.setItem(this.getStorageKey(), JSON.stringify(progress));
    notify();

    return { isNewUnlock, nextUnitId };
  }

  static unlockUnit(unitId: string, authorizedByRole?: string): void {
    if (!isClient) return;
    // Strict RBAC: only authentic mentors or super admin can manually override unlocks
    if (authorizedByRole !== "teacher" && authorizedByRole !== "mentor" && authorizedByRole !== "super_admin") {
      console.warn("[RBAC Guard] Direct unlock blocked. Candidates must achieve >= 75% on the assessment.");
      return;
    }
    const progress = this.getProgress();
    if (!progress.unlockedUnitIds.includes(unitId)) {
      progress.unlockedUnitIds.push(unitId);
      localStorage.setItem(this.getStorageKey(), JSON.stringify(progress));
      notify();
    }
  }

  static resetProgress(): void {
    if (!isClient) return;
    localStorage.removeItem(this.getStorageKey());
    notify();
  }

  // --- MCQ Practice Self-Check Storage ---
  static getMcqPracticeAnswers(unitId?: string): Record<string, MncMcqPracticeRecord> {
    if (!isClient) return {};
    try {
      const raw = localStorage.getItem(this.getMcqStorageKey());
      if (!raw) return {};
      const parsed = JSON.parse(raw) as Record<string, MncMcqPracticeRecord>;
      if (!unitId) return parsed;
      const filtered: Record<string, MncMcqPracticeRecord> = {};
      Object.entries(parsed).forEach(([k, v]) => {
        if (v.unitId === unitId) {
          filtered[k] = v;
        }
      });
      return filtered;
    } catch {
      return {};
    }
  }

  static saveMcqAnswer(
    unitId: string,
    mcqId: string,
    selectedLetter: "A" | "B" | "C" | "D",
    selectedOption: string,
    isCorrect: boolean
  ): void {
    if (!isClient) return;
    try {
      const all = this.getMcqPracticeAnswers();
      all[mcqId] = {
        mcqId,
        unitId,
        selectedLetter,
        selectedOption,
        isCorrect,
        answeredAt: new Date().toISOString(),
      };
      localStorage.setItem(this.getMcqStorageKey(), JSON.stringify(all));
      notify();
    } catch (e) {
      console.error("[MncStore] failed to save MCQ answer:", e);
    }
  }

  static resetUnitMcqPractice(unitId: string): void {
    if (!isClient) return;
    try {
      const all = this.getMcqPracticeAnswers();
      const updated: Record<string, MncMcqPracticeRecord> = {};
      Object.entries(all).forEach(([k, v]) => {
        if (v.unitId !== unitId) {
          updated[k] = v;
        }
      });
      localStorage.setItem(this.getMcqStorageKey(), JSON.stringify(updated));
      notify();
    } catch (e) {
      console.error("[MncStore] failed to reset MCQ practice:", e);
    }
  }

  static getMcqPracticeStats(unitId?: string, totalCount?: number): {
    answeredCount: number;
    correctCount: number;
    accuracyPercent: number;
  } {
    const records = Object.values(this.getMcqPracticeAnswers(unitId));
    const answeredCount = records.length;
    const correctCount = records.filter((r) => r.isCorrect).length;
    const accuracyPercent =
      answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;
    return {
      answeredCount,
      correctCount,
      accuracyPercent,
    };
  }
}
