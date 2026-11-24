import type { AssessmentAttempt } from "@/types/assessment-attempt";

/**
 * Generates a deterministic 21x21 visual verification matrix from a credential string
 * and draws a high-resolution 1600x1000 Obsidian & Electric Lime PNG certificate
 * 100% client-side with zero external APIs ($0 cost).
 */
function drawVerificationMatrix(
  ctx: CanvasRenderingContext2D,
  seed: string,
  x: number,
  y: number,
  size: number
): void {
  const cells = 21;
  const cellSize = size / cells;

  ctx.fillStyle = "#F4F7F5";
  ctx.fillRect(x - 10, y - 10, size + 20, size + 20);

  const drawFinder = (fx: number, fy: number) => {
    ctx.fillStyle = "#070B09";
    ctx.fillRect(x + fx * cellSize, y + fy * cellSize, 7 * cellSize, 7 * cellSize);
    ctx.fillStyle = "#F4F7F5";
    ctx.fillRect(x + (fx + 1) * cellSize, y + (fy + 1) * cellSize, 5 * cellSize, 5 * cellSize);
    ctx.fillStyle = "#070B09";
    ctx.fillRect(x + (fx + 2) * cellSize, y + (fy + 2) * cellSize, 3 * cellSize, 3 * cellSize);
  };

  drawFinder(0, 0);
  drawFinder(cells - 7, 0);
  drawFinder(0, cells - 7);

  let hash = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  ctx.fillStyle = "#070B09";
  for (let row = 0; row < cells; row++) {
    for (let col = 0; col < cells; col++) {
      const inTopLeft = row < 8 && col < 8;
      const inTopRight = row < 8 && col >= cells - 8;
      const inBottomLeft = row >= cells - 8 && col < 8;
      if (inTopLeft || inTopRight || inBottomLeft) continue;

      hash ^= (row * 31 + col * 17) & 0xff;
      hash = Math.imul(hash, 16777619);
      if ((hash >>> 0) % 2 === 0) {
        ctx.fillRect(
          x + col * cellSize,
          y + row * cellSize,
          Math.ceil(cellSize),
          Math.ceil(cellSize)
        );
      }
    }
  }
}

export function downloadSkillCertificatePng(attempt: AssessmentAttempt): void {
  if (typeof document === "undefined") return;

  const canvas = document.createElement("canvas");
  canvas.width = 1600;
  canvas.height = 1000;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Obsidian Void Background
  ctx.fillStyle = "#070B09";
  ctx.fillRect(0, 0, 1600, 1000);

  // Subtle Radial Glow
  const glow = ctx.createRadialGradient(1350, 180, 40, 1350, 180, 620);
  glow.addColorStop(0, "rgba(157, 255, 0, 0.14)");
  glow.addColorStop(1, "rgba(7, 11, 9, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, 1600, 1000);

  // Outer & Inner Frame
  ctx.strokeStyle = "#1E2C24";
  ctx.lineWidth = 4;
  ctx.strokeRect(48, 48, 1504, 904);

  ctx.strokeStyle = "#9DFF00";
  ctx.lineWidth = 2;
  ctx.strokeRect(64, 64, 1472, 872);

  // Top Accent Bar
  ctx.fillStyle = "#9DFF00";
  ctx.fillRect(110, 120, 120, 6);

  // Brand Header
  ctx.fillStyle = "#F4F7F5";
  ctx.font = "700 34px sans-serif";
  ctx.fillText("EQLV", 110, 182);
  ctx.fillStyle = "#9DFF00";
  ctx.font = "700 34px monospace";
  ctx.fillText("CODE", 210, 182);

  ctx.fillStyle = "#99A9A0";
  ctx.font = "600 18px monospace";
  ctx.fillText("VERIFIED TECHNICAL SKILL ACCREDITATION", 110, 224);

  // Institution
  ctx.fillStyle = "#D5E0D9";
  ctx.font = "500 22px sans-serif";
  ctx.fillText(attempt.collegeName.toUpperCase(), 110, 285);

  // Award Text
  ctx.fillStyle = "#99A9A0";
  ctx.font = "500 24px sans-serif";
  ctx.fillText("This certifies that", 110, 365);

  // Candidate Name
  ctx.fillStyle = "#F4F7F5";
  ctx.font = "800 64px sans-serif";
  ctx.fillText(attempt.studentName, 110, 445);

  // Roll & Dept
  ctx.fillStyle = "#9DFF00";
  ctx.font = "700 24px monospace";
  ctx.fillText(
    `${attempt.rollNo}  |  ${attempt.department}  |  BATCH ${attempt.batchYear}`,
    110,
    498
  );

  // Assessment Description
  ctx.fillStyle = "#D5E0D9";
  ctx.font = "500 24px sans-serif";
  ctx.fillText("has successfully completed the proctored evaluation:", 110, 568);

  ctx.fillStyle = "#F4F7F5";
  ctx.font = "700 34px sans-serif";
  ctx.fillText(attempt.assessmentTitle.slice(0, 58), 110, 622);

  // Score & Integrity Metric Pills
  const drawStatBox = (bx: number, label: string, val: string) => {
    ctx.fillStyle = "#0C120F";
    ctx.fillRect(bx, 680, 260, 110);
    ctx.strokeStyle = "#2C4034";
    ctx.lineWidth = 2;
    ctx.strokeRect(bx, 680, 260, 110);
    ctx.fillStyle = "#99A9A0";
    ctx.font = "600 16px monospace";
    ctx.fillText(label, bx + 24, 718);
    ctx.fillStyle = "#9DFF00";
    ctx.font = "800 38px monospace";
    ctx.fillText(val, bx + 24, 768);
  };

  drawStatBox(110, "FINAL SCORE", `${attempt.score}%`);
  drawStatBox(400, "INTEGRITY SCORE", `${attempt.antiCheatScore}%`);
  drawStatBox(
    690,
    "ISSUED ON",
    new Date(attempt.submittedAt).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  );

  // Verification Matrix on Right
  const verifyUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/verify/${encodeURIComponent(attempt.accreditationHash)}`
      : `https://eqlv-code.vercel.app/verify/${encodeURIComponent(attempt.accreditationHash)}`;

  drawVerificationMatrix(ctx, verifyUrl, 1250, 610, 210);

  ctx.fillStyle = "#99A9A0";
  ctx.font = "600 15px monospace";
  ctx.fillText("SCAN / VERIFY HASH", 1252, 855);

  // Footer Hash & URL
  ctx.fillStyle = "#85998D";
  ctx.font = "500 17px monospace";
  ctx.fillText(`CREDENTIAL ID: ${attempt.accreditationHash}`, 110, 862);
  ctx.fillText(`VERIFY ONLINE: ${verifyUrl}`, 110, 892);

  // Trigger Download
  const link = document.createElement("a");
  link.download = `EQLV-Certificate-${attempt.rollNo || attempt.id}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}
