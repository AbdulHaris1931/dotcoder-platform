import { NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/auth/server-auth";
import {
  checkRateLimitDistributed,
  RATE_LIMIT_PRESETS,
  rateLimitExceededResponse,
} from "@/lib/rate-limiter";
import { getFallbackGovernance } from "@/lib/governance-store";

export const runtime = "nodejs";

// 5-minute Socratic hint cache so repeated student questions on Free Tier cost 0 extra Gemini quota
const aiResponseCache = new Map<string, { text: string; expiresAt: number }>();

interface ChatMessagePayload {
  role: "user" | "model";
  parts: Array<{ text: string }>;
}

interface RequestBody {
  message: string;
  language?: string;
  activeCode?: string;
  problemTitle?: string;
  problemDescription?: string;
  history?: Array<{ sender: "user" | "eq"; text: string }>;
}

// Strict Socratic System Prompt for EQ AI
const EQ_AI_SYSTEM_INSTRUCTION = `
You are "EQ AI", an elite, patient Socratic coding tutor and algorithmic mentor on the EQLV Code Platform for engineering students and campus placement candidates.

YOUR CORE MISSION:
Help students build genuine computational intuition, master algorithmic problem-solving, and pass technical interviews (Zoho, TCS, Infosys, Cognizant, AWS) by guiding them step-by-step.

STRICT ANTI-CHEATING & PEDAGOGICAL RULES (NEVER VIOLATE THESE):
1. ZERO FULL-CODE LEAKS: Under NO circumstances should you provide the complete solution, write the full function, or produce copy-paste ready code that solves the entire problem for the student.
2. If the student asks: "Write the code for me", "Give me the solution", "Solve Two Sum in Python", or similar requests, POLITE BUT FIRM REFUSAL:
   - Example: "I'm your EQ AI coach! I can't write the full solution for you because mastering this logic yourself is what gets you through MNC technical rounds. Let's break down the next logical step together: What data structure could help you look up elements in O(1) time?"
3. SOCRATIC COACHING METHOD:
   - Ask guiding reflection questions (e.g. "What is your loop invariant?", "What happens when the array contains duplicate elements?").
   - When explaining bugs, point to the specific line or conceptual misunderstanding (e.g., "Check line 4: you are indexing past the array boundary when i reaches len(nums)-1").
   - You may show short 1-to-3 line conceptual pseudo-code or generic syntax examples, but NEVER the exact solution to their current challenge.
4. TONE & STYLE:
   - Warm, encouraging, concise, and developer-friendly.
   - Use clean Markdown with bolding, bullet points, and LaTeX notation for complexity (e.g., $O(N)$ time, $O(1)$ space).
   - Keep replies under 150-200 words so the student spends more time coding and less time reading walls of text.
`.trim();

export async function POST(req: Request) {
  try {
    const auth = await requireApiAuth(req);
    if (auth.errorResponse) return auth.errorResponse;
    const authUser = auth.user;

    const rateResult = await checkRateLimitDistributed({
      key: `ai_chat:user:${authUser.id}`,
      config: RATE_LIMIT_PRESETS.AI_CHAT,
      role: authUser.role,
      email: authUser.email,
      isOwner: authUser.isOwner,
    });
    if (!rateResult.allowed) {
      return rateLimitExceededResponse(
        rateResult,
        `EQ AI chat limit reached. Please retry in ${rateResult.retryAfterSeconds} seconds.`
      );
    }

    const body: RequestBody = await req.json();
    const {
      message,
      language = "python",
      activeCode = "",
      problemTitle = "Coding Problem",
      problemDescription = "",
      history = [],
    } = body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { error: "Message content is required" },
        { status: 400 }
      );
    }

    // Enforce Super Admin Global AI Mentor Freeze during campus exams (exempt staff/owner)
    const gov = getFallbackGovernance();
    if (gov.ai_mentor_frozen && authUser.role === "student") {
      return NextResponse.json({
        text: "### Exam Lockdown Active\n\n**EQ AI Mentor** is temporarily paused by Campus Governance while live assessments are in progress. Focus on your core loop invariants and test cases - you've got this!",
        isFallback: true,
        source: "exam-lockdown",
      });
    }

    const cacheKey = `${problemTitle.toLowerCase().trim()}::${language.toLowerCase()}::${message
      .toLowerCase()
      .trim()
      .slice(0, 140)}`;
    if (!activeCode.trim()) {
      const hit = aiResponseCache.get(cacheKey);
      if (hit && hit.expiresAt > Date.now()) {
        return NextResponse.json({
          text: hit.text,
          isFallback: false,
          source: "cached-socratic",
        });
      }
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // Zero-Crash Graceful Fallback if API key is not configured
    if (!apiKey) {
      return NextResponse.json({
        text: `### Tip: EQ AI Socratic Guidance (Local Mode)\n\nI noticed you asked: *"${message}"*.\n\nTo help guide your implementation in **${language.toUpperCase()}** for **"${problemTitle}"**:\n- Consider what information you need to retain across each iteration.\n- If your current traversal is $O(N^2)$, think about trading a small amount of memory ($O(N)$ auxiliary hash map) for speed.\n\n*What specific test case or line is behaving unexpectedly right now?*`,
        isFallback: true,
        source: "local-heuristic",
      });
    }

    // Build context-aware prompt
    const contents: ChatMessagePayload[] = [];

    // System instruction passed as first user/model pair or system instruction
    const systemContext = `
[SYSTEM INSTRUCTION & CONTEXT]
${EQ_AI_SYSTEM_INSTRUCTION}

CURRENT CONTEXT:
- Problem: "${problemTitle}"
- Problem Description Summary: ${problemDescription ? problemDescription.slice(0, 300) : "Standard algorithmic challenge"}
- Active Programming Language: ${language}
- Student's Current Editor Code:
\`\`\`${language}
${activeCode.slice(0, 2000)}
\`\`\`
`.trim();

    contents.push({
      role: "user",
      parts: [{ text: `${systemContext}\n\nPlease acknowledge your role as EQ AI Socratic coach and confirm you will adhere to zero-code-leak rules.` }],
    });

    contents.push({
      role: "model",
      parts: [{ text: "Understood! I am EQ AI, your Socratic coding tutor. I will guide the student's problem solving, explain concepts and Big-O trade-offs, and identify bugs without providing the complete solution." }],
    });

    // Append last 4 history turns for conversational continuity
    const recentHistory = history.slice(-4);
    for (const item of recentHistory) {
      contents.push({
        role: item.sender === "user" ? "user" : "model",
        parts: [{ text: item.text }],
      });
    }

    // Append current user message
    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    // Call Google Gemini 3.5 Flash-Lite (Free Tier model)
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // 12-second watchdog

    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 600,
          topP: 0.95,
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      console.warn("[EQ AI API Error] Gemini API returned status:", response.status, errText);

      // Graceful fallback response on rate limit or API issue
      return NextResponse.json({
        text: `### Tip: EQ AI Socratic Guidance\n\nI'm reviewing your **${language.toUpperCase()}** code for **"${problemTitle}"** regarding: *"${message}"*.\n\nHere is a key question to consider:\n- Look at how your indices advance in the core loop. Are you checking every element, or can you rule out invalid candidates earlier?\n- Try printing the values of your variables right before the return statement.\n\n*Would you like to analyze time complexity or test with specific edge cases using the action buttons above?*`,
        isFallback: true,
        source: "rate-limit-fallback",
      });
    }

    const data = await response.json();
    const candidateText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I was unable to formulate a response. Try rephrasing your question or click one of the instant action chips above!";

    if (!activeCode.trim() && data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      if (aiResponseCache.size > 300) aiResponseCache.clear();
      aiResponseCache.set(cacheKey, {
        text: candidateText,
        expiresAt: Date.now() + 5 * 60 * 1000,
      });
    }

    return NextResponse.json({
      text: candidateText,
      isFallback: false,
      source: "gemini-3.5-flash-lite",
    });
  } catch (error: unknown) {
    console.error("[EQ AI Route Handler Exception]", error);
    return NextResponse.json({
      text: `### Tip: EQ AI Socratic Guidance (Offline Safeguard)\n\nYour question has been noted. While evaluating your current implementation:\n- Confirm that your base case or boundary condition is checked at the very beginning.\n- Verify if your loop terminates correctly when given empty or single-item collections.\n\n*Feel free to use the instant actions above to inspect Big-O and edge cases!*`,
      isFallback: true,
      source: "exception-fallback",
    });
  }
}
