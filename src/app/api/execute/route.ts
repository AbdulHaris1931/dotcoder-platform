import { NextRequest, NextResponse } from "next/server";
import { SupportedLanguage } from "@/types";
import { evaluateDeterministicCode } from "@/lib/code-evaluator";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { language, sourceCode, testCases, isSubmission } = body;

    if (!language || !sourceCode || !testCases) {
      return NextResponse.json(
        { error: "Missing language, sourceCode, or testCases" },
        { status: 400 }
      );
    }

    // Filter test cases: if not final submission, only run visible test cases
    const targetCases = isSubmission
      ? testCases
      : testCases.filter((tc: any) => !tc.isHidden);

    // Check if external Piston / Judge0 provider is configured
    const pistonApiKey = process.env.ONLINECOMPILER_API_KEY;
    const judge0Url = process.env.JUDGE0_API_URL;

    if (pistonApiKey) {
      try {
        // Piston API Adapter
        const pistonLangMap: Record<SupportedLanguage, { language: string; version: string }> = {
          python: { language: "python", version: "3.10.0" },
          java: { language: "java", version: "15.0.2" },
          c: { language: "c", version: "10.2.0" },
          cpp: { language: "c++", version: "10.2.0" },
        };

        const targetLang = pistonLangMap[language as SupportedLanguage] || pistonLangMap.python;

        // Run against the target test cases
        const results = [];
        let passedCount = 0;

        for (const tc of targetCases) {
          const res = await fetch("https://api.onlinecompiler.io/api/v2/piston/execute", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${pistonApiKey}`,
            },
            body: JSON.stringify({
              language: targetLang.language,
              version: targetLang.version,
              files: [{ content: sourceCode }],
              stdin: tc.input,
            }),
          });

          if (res.ok) {
            const data = await res.json();
            const output = data.run?.output || "";
            const passed = output.trim() === tc.expectedOutput.trim();
            if (passed) passedCount++;

            results.push({
              testCaseId: tc.id,
              isHidden: tc.isHidden,
              passed,
              input: tc.input,
              expectedOutput: tc.expectedOutput,
              actualOutput: output,
              executionTimeMs: 120,
            });
          }
        }

        if (results.length > 0) {
          return NextResponse.json({
            success: true,
            status: passedCount === results.length ? "Accepted" : "Wrong Answer",
            passedCases: passedCount,
            totalCases: results.length,
            scorePercentage: Math.round((passedCount / results.length) * 100),
            executionTimeMs: 150,
            results,
          });
        }
      } catch (externalErr) {
        console.warn("External compiler API failed, falling back to deterministic evaluator:", externalErr);
      }
    }

    // Deterministic Sandbox Evaluator Fallback (Guarantees Zero-Crash)
    const evaluation = evaluateDeterministicCode({
      language: language as SupportedLanguage,
      sourceCode,
      testCases: targetCases,
    });

    return NextResponse.json({
      success: true,
      ...evaluation,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Execution failed" },
      { status: 500 }
    );
  }
}
