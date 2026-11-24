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
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#0C120F] hover:bg-[#121B16] border border-[#2C4034] hover:border-[#9DFF00]/45 text-[#F4F7F5] text-xs font-mono font-bold shadow-2xl transition-all group active:scale-95 cursor-pointer"
      >
        <Calculator className="w-4 h-4 text-[#9DFF00] group-hover:rotate-12 transition-transform" />
        <span>Formula &amp; Scratchpad</span>
      </button>

      {/* Slide-Over Drawer */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-xs">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full max-w-md h-full bg-[#0C120F] border-l border-[#1E2C24] shadow-2xl flex flex-col justify-between font-sans text-[#F4F7F5]"
            >
              {/* Header */}
              <div className="p-4 border-b border-[#1E2C24] flex items-center justify-between bg-[#070B09]">
                <div className="flex items-center gap-2 font-mono text-xs">
                  <Calculator className="w-4 h-4 text-[#9DFF00]" />
                  <span className="font-bold text-[#F4F7F5] uppercase tracking-wider">Exam Reference Pad</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-[#18241D] text-[#99A9A0] hover:text-[#F4F7F5] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Tabs */}
              <div className="grid grid-cols-2 p-2 gap-1 bg-[#070B09] border-b border-[#1E2C24] text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setActiveTab("formulas")}
                  className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === "formulas"
                      ? "bg-[#9DFF00] text-[#070B09] font-bold"
                      : "text-[#99A9A0] hover:text-[#F4F7F5]"
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Formula Sheet</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("scratchpad")}
                  className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === "scratchpad"
                      ? "bg-[#9DFF00] text-[#070B09] font-bold"
                      : "text-[#99A9A0] hover:text-[#F4F7F5]"
                  }`}
                >
                  <Hash className="w-3.5 h-3.5" />
                  <span>Rough Work Area</span>
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {activeTab === "formulas" ? (
                  <div className="space-y-4">
                    {FORMULA_SECTIONS.map((sec) => (
                      <div
                        key={sec.title}
                        className="p-4 rounded-2xl bg-[#121B16] border border-[#1E2C24] space-y-2.5"
                      >
                        <h4 className="text-xs font-mono font-bold text-[#9DFF00]">
                          {sec.title}
                        </h4>
                        <ul className="space-y-1.5">
                          {sec.items.map((item, i) => (
                            <li
                              key={i}
                              className="text-[11px] font-mono text-[#D5E0D9] flex items-start gap-1.5"
                            >
                              <span className="text-[#9DFF00] font-bold">&bull;</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex flex-col space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono text-[#99A9A0]">
                      <span>Live Scratch Area (Not Submitted)</span>
                      <button
                        type="button"
                        onClick={() => setScratchText("")}
                        className="flex items-center gap-1 text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Clear</span>
                      </button>
                    </div>
                    <textarea
                      value={scratchText}
                      onChange={(e) => setScratchText(e.target.value)}
                      placeholder="Use this space for quick mental arithmetic, formulas, and rough calculations..."
                      className="w-full flex-1 bg-[#070B09] border border-[#1E2C24] rounded-2xl p-4 text-xs font-mono text-[#F4F7F5] placeholder:text-[#85998D] focus:outline-none focus:border-[#9DFF00] resize-none leading-relaxed transition-colors"
                    />
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-[#1E2C24] bg-[#070B09] text-[10px] font-mono text-[#85998D] text-center font-medium">
                Anti-cheating active &bull; Internal exam scratchpad
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
