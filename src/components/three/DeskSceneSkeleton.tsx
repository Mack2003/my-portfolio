"use client";

import React, { useEffect, useState } from "react";

interface DeskSceneSkeletonProps {
  loading: boolean;
  onRetry?: () => void;
  className?: string;
}

const STAGES = [
  { label: "Preparing your workspace…", sub: "Detecting viewport & device profile" },
  { label: "Initializing 3D environment…", sub: "Configuring WebGL canvas & camera" },
  { label: "Setting up studio lighting…", sub: "Compiling shaders & shadow maps" },
  { label: "Loading interactive models…", sub: "Caching GLTF assets & materials" },
  { label: "Entering MalayOS 3D Simulator…", sub: "Finalizing scene choreography" },
];

export function DeskSceneSkeleton({
  loading,
  onRetry,
  className = "",
}: DeskSceneSkeletonProps) {
  const [stageIndex, setStageIndex] = useState(0);
  const [timedOut, setTimedOut] = useState(false);
  const [prevLoading, setPrevLoading] = useState(loading);

  if (loading !== prevLoading) {
    setPrevLoading(loading);
    if (loading) {
      setStageIndex(0);
      setTimedOut(false);
    }
  }

  useEffect(() => {
    if (!loading) return;

    // Progress through genuine initialization stages
    const intervals = [
      setTimeout(() => setStageIndex(1), 350),
      setTimeout(() => setStageIndex(2), 850),
      setTimeout(() => setStageIndex(3), 1500),
      setTimeout(() => setStageIndex(4), 2200),
    ];

    // Fallback safety timeout if user has very slow network/WebGL stalls
    const timeout = setTimeout(() => {
      setTimedOut(true);
    }, 20000);

    return () => {
      intervals.forEach(clearTimeout);
      clearTimeout(timeout);
    };
  }, [loading]);

  const currentStage = STAGES[Math.min(stageIndex, STAGES.length - 1)];

  return (
    <div
      aria-hidden={!loading}
      className={`absolute inset-0 z-30 flex flex-col items-center justify-center overflow-hidden bg-[#070b1a] transition-all duration-700 ease-out ${
        loading ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      } ${className}`}
    >
      {/* Perspective Studio Grid & Ambient Radial Glow */}
      <div className="absolute inset-0 pointer-events-none select-none opacity-40">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,#1c264d_0%,transparent_70%)]" />
        <svg className="w-full h-full opacity-25" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="desk-studio-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#2de0a5" strokeWidth="0.5" strokeOpacity="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#desk-studio-grid)" />
        </svg>
      </div>

      {/* Stylized Silhouette Representation of the 3D Room & Desk */}
      <div className="relative w-full max-w-2xl px-6 aspect-[16/10] sm:aspect-[16/9] flex items-center justify-center pointer-events-none select-none">
        {/* Left: Bookshelf Silhouette */}
        <div className="absolute left-8 sm:left-14 bottom-16 sm:bottom-20 w-16 sm:w-24 h-44 sm:h-56 rounded-xl border border-outline-variant/40 bg-surface-container/60 shadow-[4px_4px_0_#080d22] flex flex-col justify-between p-2">
          <div className="w-full h-2 rounded bg-tertiary/20 animate-pulse" />
          <div className="w-3/4 h-2 rounded bg-primary/20 animate-pulse" />
          <div className="w-full h-2 rounded bg-secondary/20 animate-pulse" />
          <div className="w-4/5 h-2 rounded bg-tertiary-fixed-dim/20 animate-pulse" />
        </div>

        {/* Center: Main Work Desk Platform Silhouette */}
        <div className="relative w-72 sm:w-96 flex flex-col items-center">
          {/* Laptop Silhouette on Desk */}
          <div className="relative flex flex-col items-center mb-1">
            {/* Laptop Screen */}
            <div className="relative w-28 sm:w-36 h-18 sm:h-22 rounded-t-lg border-2 border-primary/50 bg-surface-container-high/80 shadow-[0_0_15px_rgba(91,140,255,0.25)] flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/15 to-transparent animate-[shimmer_2s_infinite]" />
              <div className="flex flex-col gap-1 w-3/4">
                <div className="w-full h-1 rounded bg-primary/40" />
                <div className="w-2/3 h-1 rounded bg-tertiary/40" />
                <div className="w-4/5 h-1 rounded bg-secondary/40" />
              </div>
            </div>
            {/* Laptop Base */}
            <div className="w-32 sm:w-42 h-2.5 rounded-b-md bg-surface-container-highest border border-primary/40 shadow-[0_2px_4px_#080d22]" />
          </div>

          {/* Desk Surface Platform */}
          <div className="relative w-full h-6 sm:h-7 rounded-xl bg-surface-container border-2 border-surface-variant shadow-[6px_6px_0_#080d22] flex items-center justify-between px-4 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-tertiary/10 to-transparent animate-[shimmer_2.5s_infinite]" />
            <div className="w-8 h-1.5 rounded bg-tertiary/40" />
            <div className="w-12 h-1.5 rounded bg-primary/40" />
            <div className="w-8 h-1.5 rounded bg-secondary/40" />
          </div>

          {/* Desk Legs */}
          <div className="w-5/6 flex justify-between px-2 pt-0.5">
            <div className="w-2 h-20 sm:h-24 bg-surface-variant/80 rounded-b" />
            <div className="w-2 h-20 sm:h-24 bg-surface-variant/80 rounded-b" />
          </div>
        </div>

        {/* Right: Office Chair Silhouette */}
        <div className="absolute right-10 sm:right-16 bottom-10 sm:bottom-14 flex flex-col items-center opacity-70">
          <div className="w-12 sm:w-16 h-16 sm:h-20 rounded-t-2xl border border-outline-variant/40 bg-surface-container/70" />
          <div className="w-14 sm:w-18 h-3 rounded bg-surface-container-high border border-outline-variant/30" />
          <div className="w-1.5 h-8 bg-surface-variant" />
          <div className="w-12 h-1.5 rounded bg-surface-variant" />
        </div>
      </div>

      {/* Cinematic Loading HUD & Staged Status Indicator */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 mt-4">
        <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-surface-container-high/90 border border-tertiary/40 shadow-[3px_3px_0_#080d22] backdrop-blur-md">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-tertiary" />
          </span>
          <span className="font-label-code-sm text-xs uppercase tracking-wider text-tertiary font-bold">
            {currentStage.label}
          </span>
        </div>

        <p className="font-label-code-sm text-xs text-on-surface-variant mt-2 tracking-wide font-medium">
          {currentStage.sub}
        </p>

        {/* Fallback Retry Option if WebGL takes too long */}
        {timedOut && onRetry && (
          <div className="mt-4 flex flex-col items-center gap-2">
            <p className="text-xs text-error font-semibold">
              Loading took longer than expected.
            </p>
            <button
              type="button"
              onClick={onRetry}
              className="px-3 py-1.5 text-xs font-bold rounded-lg border-2 border-primary bg-primary text-on-primary shadow-[2px_2px_0_#080d22] hover:translate-x-0.5 hover:translate-y-0.5 transition-transform"
            >
              Retry Loading 3D Scene
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default DeskSceneSkeleton;
