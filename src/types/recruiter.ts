export type PlacementStage = "Screening" | "Coding Round" | "Technical Interview" | "Offered";

export interface RecruiterCompany {
  id: string;
  name: string;
  slug: string;
  tier: "Tier 1 Product" | "Tier 1 IT Services" | "Fast-Growing Startup";
  logoUrl?: string;
  website: string;
  headquarters: string;
  hiringRoles: string[];
  compensationRange: string;
  isPartnerInstitution: boolean;
}

export interface CampusDrive {
  id: string;
  companyId: string;
  companyName: string;
  title: string;
  role: string;
  compensation: string; // e.g. "6.5 - 8.4 LPA"
  targetDepartments: string[]; // ["BCA", "B.Sc CS", "MCA"]
  targetBatchYear: number; // 2026
  minReadinessScore: number; // 80
  status: "Active" | "Upcoming" | "Completed";
  driveDate: string;
  registeredCount: number;
  shortlistedCount: number;
  description: string;
}

export interface CandidateShortlistEntry {
  id: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  department: string;
  readinessScore: number;
  dsaMastery: string;
  primaryLanguage: string;
  driveId: string;
  driveTitle: string;
  stage: PlacementStage;
  recruiterNotes?: string;
  shortlistedAt: string;
  accreditationHash?: string;
}
