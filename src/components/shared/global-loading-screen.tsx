"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";

interface LoadingContextType {
  isPageLoading: boolean;
  setIsPageLoading: (loading: boolean) => void;
  triggerLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType>({
  isPageLoading: false,
  setIsPageLoading: () => {},
  triggerLoading: () => {},
});

export const usePageLoading = () => useContext(LoadingContext);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isPageLoading, setIsPageLoading] = useState<boolean>(false);
  const pathname = usePathname();

  const triggerLoading = useCallback(() => {
    setIsPageLoading(true);
  }, []);

  // When pathname changes (route transition completed), smoothly dismiss the loading screen
  useEffect(() => {
    if (isPageLoading) {
      const timer = setTimeout(() => {
        setIsPageLoading(false);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [pathname, isPageLoading]);

  // Safety fallback: auto-dismiss after 4 seconds to prevent getting stuck
  useEffect(() => {
    if (!isPageLoading) return;
    const safetyTimer = setTimeout(() => {
      setIsPageLoading(false);
    }, 4000);
    return () => clearTimeout(safetyTimer);
  }, [isPageLoading]);

  // Global link click interceptor: triggers loading screen on internal route switches
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href) return;

      // Only trigger for internal route changes (not external, hash anchors, or current path)
      if (
        href.startsWith("/") &&
        !href.startsWith("#") &&
        !href.startsWith("//") &&
        href !== pathname &&
        !target.target
      ) {
        setIsPageLoading(true);
      }
    };

    document.addEventListener("click", handleAnchorClick, true);
    return () => document.removeEventListener("click", handleAnchorClick, true);
  }, [pathname]);

  return (
    <LoadingContext.Provider value={{ isPageLoading, setIsPageLoading, triggerLoading }}>
      {children}
      {isPageLoading && <GlobalLoadingOverlay />}
    </LoadingContext.Provider>
  );
}

export function GlobalLoadingOverlay() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading page"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/65 backdrop-blur-md select-none transition-all duration-300 animate-in fade-in"
    >
      <div className="relative flex flex-col items-center justify-center">
        {/* Soft radial lime aura behind logo */}
        <div className="absolute w-32 h-32 rounded-full bg-[#9DFF00]/15 blur-2xl animate-pulse pointer-events-none" />

        {/* EQLV CODE Logo Emblem */}
        <div className="relative flex items-center justify-center">
          <img
            src="/logo.png"
            alt="EQLV CODE"
            className="w-20 h-20 sm:w-24 sm:h-24 object-contain rounded-2xl drop-shadow-[0_0_35px_rgba(157,255,0,0.35)] animate-pulse"
          />
        </div>
      </div>
    </div>
  );
}
