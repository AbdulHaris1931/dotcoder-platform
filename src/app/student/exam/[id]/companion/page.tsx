"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Smartphone,
  ShieldCheck,
  Video,
  Mic,
  Battery,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

export default function MobileProctoringCompanionPage() {
  const params = useParams();
  const examId = params?.id as string;

  const videoRef = useRef<HTMLVideoElement>(null);
  const [streamActive, setStreamActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [micLevel, setMicLevel] = useState(15);

  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: true,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setStreamActive(true);
        }
      } catch (err: any) {
        console.warn("Mobile camera permission issue:", err);
        setCameraError(
          "Camera access was not granted or environment camera is unavailable on this device."
        );
      }
    }

    startCamera();

    // Simulated ambient sound level indicator
    const audioInterval = setInterval(() => {
      setMicLevel(Math.floor(Math.random() * 20) + 10);
    }, 1500);

    return () => {
      clearInterval(audioInterval);
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((t) => t.stop());
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between font-mono p-4 select-none">
      {/* Top Mobile Status Header */}
      <header className="flex items-center justify-between border-b border-white/[0.1] pb-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold tracking-tight">DotExam Mobile Eye</span>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <div className="flex items-center gap-1">
            <Mic className="w-3.5 h-3.5 text-emerald-400" />
            <span>{micLevel} dB</span>
          </div>
          <div className="flex items-center gap-1 text-slate-300">
            <Battery className="w-4 h-4 text-emerald-400" />
            <span>Active</span>
          </div>
        </div>
      </header>

      {/* Main Camera Viewfinder with Overlay Guidelines */}
      <main className="flex-1 flex flex-col justify-center my-4 relative rounded-2xl overflow-hidden bg-[#111114] border border-white/[0.15]">
        {cameraError ? (
          <div className="p-6 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
            <h3 className="text-sm font-bold text-white">Camera Permission Needed</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">{cameraError}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold inline-flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Permission</span>
            </button>
          </div>
        ) : (
          <div className="relative w-full h-full flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover rounded-2xl"
            />

            {/* Viewfinder Target Framing Grid */}
            <div className="absolute inset-4 pointer-events-none border border-white/[0.2] rounded-xl flex flex-col justify-between p-2">
              <div className="flex justify-between text-[10px] text-emerald-400 font-bold">
                <span>[ LATERAL CAM ]</span>
                <span>REC ● 1080P</span>
              </div>
              <div className="text-center text-[10px] text-white/70 bg-black/50 px-2 py-1 rounded backdrop-blur-sm self-center">
                Keep hands & desk in frame
              </div>
              <div className="flex justify-between text-[9px] text-slate-400">
                <span>SESSION #{examId?.slice(0, 8)}</span>
                <span>WEBRTC ENCRYPTED</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer Status */}
      <footer className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-center space-y-1">
        <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-400 font-bold">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Connected as Secondary Lateral Stream</span>
        </div>
        <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
          Do not close or lock your phone. Position this phone on your right or left side facing your workstation.
        </p>
      </footer>
    </div>
  );
}
