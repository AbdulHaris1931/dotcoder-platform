import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { UserProfile, Submission } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Normalizes program output by trimming trailing whitespace and unifying line endings.
 */
export function normalizeOutput(str: string): string {
  if (!str) return "";
  return str
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .trim();
}

/**
 * Compares actual output against expected output with normalization.
 */
export function compareOutputs(actual: string, expected: string): boolean {
  return normalizeOutput(actual) === normalizeOutput(expected);
}

/**
 * Generates NAAC / NBA Placement CSV report for TPO export.
 */
export function generatePlacementCsv(
  students: UserProfile[],
  submissions: Submission[]
): string {
  const headers = [
    "Institution Code",
    "NAAC Metric",
    "Roll No",
    "Full Name",
    "Department",
    "Batch Year",
    "Assessments Completed",
    "Average Score",
    "Readiness Score (%)",
    "Placement Status",
    "Integrity Violations",
    "Accreditation Hash",
    "Verification URL",
  ];

  const rows = students.map((student) => {
    const studentSubs = submissions.filter((s) => s.user_id === student.id);
    const avgScore =
      studentSubs.length > 0
        ? Math.round(
            studentSubs.reduce((acc, sub) => acc + sub.score, 0) / studentSubs.length
          )
        : student.readiness_score;

    const violations = studentSubs.reduce(
      (acc, sub) => acc + (sub.tab_switches || 0),
      0
    );

    const readinessTier =
      student.readiness_score >= 75
        ? "Placement Ready"
        : student.readiness_score >= 60
        ? "Needs Practice"
        : "At-Risk";

    const hash = `AVASC-2026-${(student.department || "BCA").replace(/[^A-Z]/g, "")}-${student.roll_no || "23BCA01"}-${Math.round(student.readiness_score)}-A1K7`;
    const verifyUrl = `http://localhost:3000/verify/${hash}`;

    return [
      `"AVASC-TNJ"`,
      `"Criterion 5.2.1"`,
      `"${student.roll_no || ""}"`,
      `"${student.full_name}"`,
      `"${student.department}"`,
      student.batch_year || 2026,
      studentSubs.length,
      `${avgScore}%`,
      `${student.readiness_score}%`,
      `"${readinessTier}"`,
      violations,
      `"${hash}"`,
      `"${verifyUrl}"`,
    ].join(",");
  });

  return [headers.join(","), ...rows].join("\n");
}

/**
 * Triggers browser download of a generated text/csv file.
 */
export function downloadFile(filename: string, content: string, mimeType = "text/csv") {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
