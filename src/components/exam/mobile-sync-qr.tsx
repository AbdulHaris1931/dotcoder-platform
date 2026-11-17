"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Smartphone, QrCode, ShieldCheck, X, CheckCircle2, Video } from "lucide-react";

export function MobileSyncQR({ examId }: { examId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [companionUrl, setCompanionUrl] = useState("");
  const [isSynced, setIsSynced] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCompanionUrl(`${window.location.origin}/student/exam/${examId}/companion`);
    }
  }, [examId]);

  return (
    <>
      {/* Header Pill Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-300 text-xs font-mono font-medium transition-all"
      >
        <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
        <span>{isSynced ? "Dual Cam: Synced" : "Pair Mobile Camera"}</span>
        <span className={`w-1.5 h-1.5 rounded-full ${isSynced ? "bg-emerald-400" : "bg-amber-400"} animate-pulse`} />
      </button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#111114] border border-white/[0.1] rounded-2xl p-6 shadow-2xl space-y-5 text-center"
            >
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-white">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  <span>Secondary Camera Pairing</span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                {/* QR Code Placeholder Graphic */}
                <div className="p-4 rounded-2xl bg-white flex flex-col items-center justify-center mx-auto w-48 h-48 shadow-lg">
                  {/* Generated SVG QR Code Pattern */}
                  <svg
                    className="w-40 h-40"
                    viewBox="0 0 100 100"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect width="100" height="100" fill="white" />
                    <rect x="10" y="10" width="25" height="25" fill="#09090B" />
                    <rect x="15" y="15" width="15" height="15" fill="white" />
                    <rect x="18" y="18" width="9" height="9" fill="#09090B" />

                    <rect x="65" y="10" width="25" height="25" fill="#09090B" />
                    <rect x="70" y="15" width="15" height="15" fill="white" />
                    <rect x="73" y="18" width="9" height="9" fill="#09090B" />

                    <rect x="10" y="65" width="25" height="25" fill="#09090B" />
                    <rect x="15" y="70" width="15" height="15" fill="white" />
                    <rect x="18" y="73" width="9" height="9" fill="#09090B" />

                    {/* QR Matrix Bits */}
                    <rect x="42" y="12" width="6" height="6" fill="#09090B" />
                    <rect x="52" y="12" width="6" height="6" fill="#09090B" />
                    <rect x="42" y="24" width="6" height="6" fill="#09090B" />
                    <rect x="12" y="44" width="6" height="6" fill="#09090B" />
                    <rect x="24" y="44" width="6" height="6" fill="#09090B" />
                    <rect x="36" y="44" width="8" height="8" fill="#09090B" />
                    <rect x="52" y="44" width="6" height="6" fill="#09090B" />
                    <rect x="66" y="44" width="8" height="8" fill="#09090B" />
                    <rect x="80" y="44" width="6" height="6" fill="#09090B" />
                    <rect x="44" y="64" width="6" height="6" fill="#09090B" />
                    <rect x="58" y="64" width="6" height="6" fill="#09090B" />
                    <rect x="44" y="76" width="6" height="6" fill="#09090B" />
                    <rect x="66" y="76" width="8" height="8" fill="#09090B" />
                    <rect x="78" y="76" width="6" height="6" fill="#09090B" />
                  </svg>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300 font-mono">
                  <p className="font-bold text-white">Scan with your smartphone camera</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                    Place your phone 2–3 feet away at a 45° angle pointing at your hands, keyboard, and desk.
                  </p>
                </div>

                {/* Direct Link Copy Button */}
                <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-between text-xs font-mono">
                  <span className="truncate max-w-[240px] text-slate-400">{companionUrl}</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(companionUrl);
                      setIsSynced(true);
                    }}
                    className="px-2 py-1 rounded bg-indigo-600 text-white font-bold text-[10px]"
                  >
                    Copy Link
                  </button>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSynced(true);
                      setIsOpen(false);
                    }}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm Phone Placement Active</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
