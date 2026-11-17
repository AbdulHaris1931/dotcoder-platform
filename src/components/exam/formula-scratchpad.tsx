"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, BookOpen, X, Trash2, Hash } from "lucide-react";

export function FormulaScratchpad() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"formulas" | "scratchpad">("formulas");
  const [scratchText, setScratchText] = useState("");

  const FORMULA_SECTIONS = [
    {
      title: "Speed, Time & Distance",
      items: [
        "Speed = Distance / Time",
        "Convert km/hr to m/s: Multiply by 5/18",
        "Convert m/s to km/hr: Multiply by 18/5",
        "Average Speed = (2 * S1 * S2) / (S1 + S2)",
        "Train crossing stationary object: Time = Length of Train / Speed",
      ],
    },
    {
      title: "Profit, Loss & Percentage",
      items: [
        "Profit % = (Profit / CP) * 100",
        "Loss % = (Loss / CP) * 100",
        "Selling Price = CP * (1 + Profit% / 100)",
        "Discount % = (Discount / Marked Price) * 100",
      ],
    },
    {
      title: "Work & Time",
      items: [
        "If A completes work in n days, 1-day work = 1/n",
        "Combined 1-day work of A & B = (1/A) + (1/B)",
        "Total days together = (A * B) / (A + B)",
      ],
    },
    {
      title: "Permutations & Combinations",
      items: [
        "nPr = n! / (n - r)!",
        "nCr = n! / [r! * (n - r)!]",
        "Permutation with identical elements = n! / (p! * q!)",
      ],
    },
  ];

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#18181C] hover:bg-[#202026] border border-white/[0.12] text-white text-xs font-mono font-medium shadow-2xl transition-all group"
      >
        <Calculator className="w-4 h-4 text-indigo-400 group-hover:rotate-12 transition-transform" />
        <span>Formula & Scratchpad</span>
      </button>

      {/* Slide-Over Drawer */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full max-w-md h-full bg-[#111114] border-l border-white/[0.1] shadow-2xl flex flex-col justify-between"
            >
              {/* Header */}
              <div className="p-4 border-b border-white/[0.08] flex items-center justify-between">
                <div className="flex items-center gap-2 font-mono text-xs">
                  <Calculator className="w-4 h-4 text-indigo-400" />
                  <span className="font-bold text-white uppercase tracking-wider">Exam Reference Pad</span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/[0.06] text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Tabs */}
              <div className="grid grid-cols-2 p-2 gap-1 bg-[#0C0C0E] border-b border-white/[0.06] text-xs font-mono">
                <button
                  onClick={() => setActiveTab("formulas")}
                  className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                    activeTab === "formulas"
                      ? "bg-indigo-600 text-white font-semibold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Formula Sheet</span>
                </button>
                <button
                  onClick={() => setActiveTab("scratchpad")}
                  className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                    activeTab === "scratchpad"
                      ? "bg-indigo-600 text-white font-semibold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Hash className="w-3.5 h-3.5" />
                  <span>Rough Work Area</span>
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {activeTab === "formulas" ? (
                  <div className="space-y-4">
                    {FORMULA_SECTIONS.map((sec) => (
                      <div
                        key={sec.title}
                        className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2"
                      >
                        <h4 className="text-xs font-mono font-bold text-indigo-300">
                          {sec.title}
                        </h4>
                        <ul className="space-y-1">
                          {sec.items.map((item, i) => (
                            <li
                              key={i}
                              className="text-[11px] font-mono text-slate-300 flex items-start gap-1.5"
                            >
                              <span className="text-indigo-500 font-bold">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex flex-col space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>Live Scratch Area (Not Submitted)</span>
                      <button
                        onClick={() => setScratchText("")}
                        className="flex items-center gap-1 text-rose-400 hover:text-rose-300"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Clear</span>
                      </button>
                    </div>
                    <textarea
                      value={scratchText}
                      onChange={(e) => setScratchText(e.target.value)}
                      placeholder="Use this space for quick mental arithmetic, formulas, and rough calculations..."
                      className="w-full flex-1 bg-[#09090B] border border-white/[0.08] rounded-xl p-3 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
                    />
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-white/[0.06] bg-[#0A0A0C] text-[10px] font-mono text-slate-500 text-center">
                Anti-cheating active • Internal exam scratchpad
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
