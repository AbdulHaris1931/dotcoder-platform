"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  X,
  Send,
  Zap,
  HelpCircle,
  AlertTriangle,
  CheckCircle2,
  Copy,
  ShieldAlert,
  RotateCcw,
} from "lucide-react";
import {
  getDailyAiQuota,
  consumeDailyAiQuota,
  type QuotaStatus,
} from "@/lib/eq-ai-quota";

export interface EqAiDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeCode: string;
  language: string;
  problemTitle?: string;
  problemDescription?: string;
  isExamMode?: boolean;
  studentId?: string;
}

interface Message {
  id: string;
  sender: "user" | "eq";
  text: string;
  timestamp: string;
  actionType?: "explain" | "optimize" | "edge-cases" | "chat";
}

export function EqAiDrawer({
  isOpen,
  onClose,
  activeCode,
  language,
  problemTitle = "Current Challenge",
  problemDescription = "",
  isExamMode = false,
  studentId = "student-demo",
}: EqAiDrawerProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "intro-1",
      sender: "eq",
      text: `Hello! I'm **EQ AI**, your Socratic coding coach. I'm analyzing your **${language.toUpperCase()}** code for **"${problemTitle}"**.\n\nClick an action below or ask me a question - I'll guide your intuition without giving away the full solution!`,
      timestamp: "just now",
    },
  ]);

  const [inputQuery, setInputQuery] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [quota, setQuota] = useState<QuotaStatus>(() => getDailyAiQuota(studentId));
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Synchronize quota state on mount and when drawer opens
  useEffect(() => {
    if (isOpen) {
      setQuota(getDailyAiQuota(studentId));
      setTimeout(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 150);
    }
  }, [isOpen, studentId]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  /**
   * Socratic response generator (Heuristic EQ AI Engine - works 100% offline at $0 cost)
   */
  const generateSocraticResponse = (action: "explain" | "optimize" | "edge-cases" | "chat", query?: string): string => {
    const lines = activeCode.split("\n").filter((l) => l.trim().length > 0);
    const hasNestedLoops = (activeCode.match(/for|while/g) || []).length >= 2;
    const hasMapOrSet = activeCode.includes("dict") || activeCode.includes("set(") || activeCode.includes("HashMap") || activeCode.includes("Map<");

    if (action === "explain") {
      return (
        `### Logic Breakdown (${language.toUpperCase()})\n\n` +
        `Your code has **${lines.length} lines** of implementation.\n\n` +
        `1. **Input & State**: You initialize variables to keep track of the problem invariants.\n` +
        `2. **Traversal Structure**: ${
          hasNestedLoops
            ? "You are using nested iterations, checking pairs or sub-segments across the collection."
            : hasMapOrSet
            ? "You are maintaining an auxiliary hash structure to store visited items for fast $O(1)$ lookups."
            : "You are making a sequential linear pass through the input elements."
        }\n` +
        `3. **Termination**: The logic returns once the target condition is satisfied or default exit is reached.\n\n` +
        `Tip: *Reflection Question*: What happens if the input is already sorted or completely reversed? Would your current traversal still perform the minimum number of steps?`
      );
    }

    if (action === "optimize") {
      return (
        `### Time & Space Optimization Analysis\n\n` +
        `* **Estimated Current Time Complexity**: ${hasNestedLoops ? "$O(N^2)$ (Quadratic)" : "$O(N)$ (Linear)"}\n` +
        `* **Estimated Current Auxiliary Space**: ${hasMapOrSet ? "$O(N)$ (Auxiliary Hash Storage)" : "$O(1)$ (In-place)"}\n\n` +
        `${
          hasNestedLoops
            ? `Warning: **Bottleneck**: The nested iterations will time out (TLE) if $N \\ge 10^5$. Can you trade **$O(N)$ memory** for speed by storing previously seen values in a Hash Map / Set to reduce time to $O(N)$?`
            : `**Great Structure**: Linear or near-linear traversal detected. To further optimize, ensure you are avoiding redundant string concatenations or unnecessary memory allocations inside the core loop.`
        }\n\n` +
        `*Target Industry Benchmark*: Tier-1 MNC interviewers expect $O(N)$ time with $O(N)$ or $O(1)$ space for this pattern.`
      );
    }

    if (action === "edge-cases") {
      return (
        `### Critical Edge-Case Traps to Check\n\n` +
        `Before submitting to the test runner, verify if your code handles these 4 traps:\n\n` +
        `1. **Empty / Null Input**: Does your code crash or throw \`IndexOutOfBounds\` / \`TypeError\` when the input has length $0$ or is empty?\n` +
        `2. **Single Element**: If the array/string contains only $1$ item (e.g. \`[7]\` or \`"a"\`), does your loop terminate correctly?\n` +
        `3. **Duplicates & Collisions**: If all items are identical (e.g. \`[3, 3, 3]\` or \`"aaaa"\`), does your lookup or two-pointer logic step forward without getting stuck in an infinite cycle?\n` +
        `4. **Integer Overflow / Negative Values**: Are target calculations safe when values are negative or exceed standard integer bounds?\n\n` +
        `Tip: *Try running a custom test case with one of these inputs to test your resilience!*`
      );
    }

    // General Socratic Chat
    return (
      `### Tip: EQ AI Socratic Guidance\n\n` +
      `You asked: *"Thinking through: ${query}"*\n\n` +
      `Here is a mental framework to consider:\n` +
      `- Identify what state needs to be preserved between iterations.\n` +
      `- If you find yourself searching backwards repeatedly, ask: *"Can I precompute or memoize this state?"*\n` +
      `- Write out the expected output on paper for an input with 3 items, step-by-step.\n\n` +
      `What step feels most uncertain right now?`
    );
  };

  const handleActionClick = (action: "explain" | "optimize" | "edge-cases") => {
    if (isThinking) return;
    setIsThinking(true);

    const userPrompt =
      action === "explain"
        ? "Explain this code logic"
        : action === "optimize"
        ? "Analyze time & space complexity"
        : "What are the hidden edge cases?";

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: userPrompt,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      actionType: action,
    };

    setMessages((prev) => [...prev, userMsg]);

    setTimeout(() => {
      const responseText = generateSocraticResponse(action);
      const eqMsg: Message = {
        id: `eq-${Date.now()}`,
        sender: "eq",
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        actionType: action,
      };
      setMessages((prev) => [...prev, eqMsg]);
      setIsThinking(false);
    }, 600);
  };

  const handleSendQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim() || isThinking) return;

    // Check student daily quota limit
    if (quota.isExhausted || quota.remaining <= 0) {
      setMessages((prev) => [
        ...prev,
        {
          id: `limit-${Date.now()}`,
          sender: "eq",
          text: `Warning: **Daily Free Quota Limit Reached (20/20 Chats)**\n\nYou've used all 20 AI chats for today. Your quota automatically resets tonight at midnight.\n\nTip: *Note*: The 3 instant actions (**Explain Logic**, **Optimize Big-O**, **Edge Cases**) above are **100% free and unlimited** - you can continue using them right now!`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          actionType: "chat",
        },
      ]);
      return;
    }

    const query = inputQuery.trim();
    setInputQuery("");
    setIsThinking(true);

    // Consume 1 quota credit
    const consumption = consumeDailyAiQuota(studentId);
    setQuota(consumption.status);

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      actionType: "chat",
    };

    setMessages((prev) => [...prev, userMsg]);

    try {
      // Call Google Gemini 3.5 Flash-Lite API via backend route
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: query,
          language,
          activeCode,
          problemTitle,
          problemDescription,
          history: messages.slice(-4).map((m) => ({
            sender: m.sender,
            text: m.text,
          })),
        }),
      });

      if (!res.ok) {
        throw new Error(`API returned HTTP ${res.status}`);
      }

      const data = await res.json();
      const replyText =
        data?.text ||
        generateSocraticResponse("chat", query);

      const eqMsg: Message = {
        id: `eq-${Date.now()}`,
        sender: "eq",
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        actionType: "chat",
      };
      setMessages((prev) => [...prev, eqMsg]);
    } catch (err) {
      console.warn("[EQ AI Client] Live API call failed, falling back to heuristic engine:", err);
      // Graceful fallback to built-in heuristic engine
      const responseText = generateSocraticResponse("chat", query);
      const eqMsg: Message = {
        id: `eq-${Date.now()}`,
        sender: "eq",
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        actionType: "chat",
      };
      setMessages((prev) => [...prev, eqMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `intro-${Date.now()}`,
        sender: "eq",
        text: `Chat cleared. Ready to assist with **"${problemTitle}"** in **${language.toUpperCase()}**!`,
        timestamp: "just now",
      },
    ]);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[440px] shadow-2xl flex flex-col font-sans">
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", stiffness: 350, damping: 32 }}
          className="h-full w-full bg-[#070B09] border-l border-[#1E2C24] flex flex-col text-[#F4F7F5]"
        >
          {/* Header */}
          <div className="p-4 border-b border-[#1E2C24] bg-[#0C120F] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#9DFF00]/10 border border-[#9DFF00]/30 flex items-center justify-center text-[#9DFF00]">
                <Sparkles className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-display font-bold text-sm text-[#F4F7F5]">EQ AI Assistant</h3>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-[#9DFF00] text-[#070B09]">
                    SOCRATIC
                  </span>
                </div>
                <div className="text-[11px] text-[#99A9A0] font-mono">
                  {language.toUpperCase()} &bull; {problemTitle}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Daily Quota Counter Badge */}
              <div
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono tabular-nums font-bold border ${
                  quota.remaining > 5
                    ? "bg-[#9DFF00]/10 text-[#9DFF00] border-[#9DFF00]/30"
                    : quota.remaining > 0
                    ? "bg-amber-500/10 text-amber-300 border-amber-500/25"
                    : "bg-rose-500/10 text-rose-300 border-rose-500/25"
                }`}
                title={`Daily Free Tier: ${quota.remaining} of ${quota.maxLimit} chats left today (resets at 00:00)`}
              >
                <Zap className="w-3 h-3" />
                <span>{quota.remaining}/{quota.maxLimit}</span>
              </div>

              <button
                type="button"
                onClick={handleResetChat}
                className="p-1.5 rounded-lg text-[#99A9A0] hover:text-[#F4F7F5] hover:bg-[#18241D] transition-colors"
                title="Reset conversation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-[#99A9A0] hover:text-[#F4F7F5] hover:bg-[#18241D] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Exam Mode Shield (If in Timed Exam, EQ AI is strictly locked!) */}
          {isExamMode ? (
            <div className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-400">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-xs">
                <h4 className="font-display font-bold text-sm text-[#F4F7F5]">Proctored Exam Lock</h4>
                <p className="text-xs text-[#99A9A0] leading-relaxed">
                  EQ AI Assistant is strictly disabled during accredited campus exams to preserve academic integrity.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase bg-rose-950/60 text-rose-300 border border-rose-500/30">
                Integrity Rule: Zero External AI
              </span>
            </div>
          ) : (
            <>
              {/* Quick Action Chips */}
              <div className="p-3 border-b border-[#1E2C24] bg-[#070B09] space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono uppercase font-bold text-[#99A9A0] tracking-wider">
                  <span>Instant Socratic Actions</span>
                  <span className="text-[#9DFF00] font-normal lowercase">unlimited &bull; free</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleActionClick("explain")}
                    disabled={isThinking}
                    className="p-2 rounded-xl bg-[#0C120F] hover:bg-[#18241D] border border-[#1E2C24] hover:border-[#2C4034] text-left transition-all cursor-pointer flex flex-col gap-1 active:scale-[0.98]"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
                    <span className="text-[11px] font-bold text-[#F4F7F5]">Explain Logic</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleActionClick("optimize")}
                    disabled={isThinking}
                    className="p-2 rounded-xl bg-[#0C120F] hover:bg-[#18241D] border border-[#1E2C24] hover:border-[#2C4034] text-left transition-all cursor-pointer flex flex-col gap-1 active:scale-[0.98]"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-[11px] font-bold text-[#F4F7F5]">Optimize Big-O</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleActionClick("edge-cases")}
                    disabled={isThinking}
                    className="p-2 rounded-xl bg-[#0C120F] hover:bg-[#18241D] border border-[#1E2C24] hover:border-[#2C4034] text-left transition-all cursor-pointer flex flex-col gap-1 active:scale-[0.98]"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    <span className="text-[11px] font-bold text-[#F4F7F5]">Edge Cases</span>
                  </button>
                </div>
              </div>

              {/* Chat Message Stream */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-xs">
                {messages.map((msg) => {
                  const isUser = msg.sender === "user";
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`max-w-[90%] p-3.5 rounded-2xl leading-relaxed whitespace-pre-wrap break-words ${
                          isUser
                            ? "bg-[#1A2E05] border border-[#9DFF00]/35 text-[#F4F7F5] rounded-tr-xs"
                            : "bg-[#0C120F] border border-[#1E2C24] text-[#F4F7F5] rounded-tl-xs shadow-xs"
                        }`}
                      >
                        {msg.text}
                      </div>

                      <div className="flex items-center gap-2 mt-1 px-1 text-[10px] text-[#85998D] font-mono tabular-nums">
                        <span>{msg.timestamp}</span>
                        {!isUser && (
                          <button
                            type="button"
                            onClick={() => handleCopy(msg.text, msg.id)}
                            className="hover:text-[#F4F7F5] transition-colors"
                            title="Copy response"
                          >
                            {copiedId === msg.id ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}

                {isThinking && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 p-3 rounded-2xl bg-[#0C120F] border border-[#1E2C24] text-[#99A9A0] text-xs font-mono max-w-[200px]"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#9DFF00] animate-spin" />
                    <span>Analyzing code...</span>
                  </motion.div>
                )}

                <div ref={chatBottomRef} />
              </div>

              {/* Bottom Input Field */}
              <div className="p-3 border-t border-[#1E2C24] bg-[#0C120F]">
                <form onSubmit={handleSendQuery} className="relative flex items-center">
                  <input
                    id="eq-ai-prompt-input"
                    name="eq-ai-prompt-input"
                    aria-label="Ask EQ AI question"
                    type="text"
                    value={inputQuery}
                    onChange={(e) => setInputQuery(e.target.value)}
                    disabled={quota.isExhausted || isThinking}
                    placeholder={
                      quota.isExhausted
                        ? "Daily limit reached (20/20 chats) • Resets at midnight"
                        : "Ask EQ AI (e.g. 'Why is this O(N²)?')..."
                    }
                    className="w-full pl-3 pr-10 py-2.5 rounded-xl bg-[#070B09] border border-[#1E2C24] text-xs text-[#F4F7F5] placeholder:text-[#85998D] focus:outline-hidden focus:border-[#9DFF00] disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                  <button
                    type="submit"
                    disabled={!inputQuery.trim() || isThinking || quota.isExhausted}
                    className="absolute right-1.5 p-1.5 rounded-lg bg-[#9DFF00] hover:bg-[#8CE600] disabled:bg-[#1E2C24] text-[#070B09] disabled:text-[#85998D] transition-all cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
                <div className="flex items-center justify-between text-[10px] text-[#85998D] font-mono tabular-nums mt-1.5 px-0.5">
                  <span className={quota.isExhausted ? "text-rose-400 font-bold" : "text-[#99A9A0]"}>
                    {quota.isExhausted
                      ? "Daily quota exhausted"
                      : `${quota.remaining} of ${quota.maxLimit} daily chats remaining`}
                  </span>
                  <span className="text-[#85998D]">
                    Resets in ~{quota.resetsInHours}h (00:00)
                  </span>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// Backward compatibility alias
export const DotAiDrawer = EqAiDrawer;
