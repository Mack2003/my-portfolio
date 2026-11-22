"use client";

import React from "react";

export default function HeroCtaButtons() {
  const scrollTo = (hash: string) => {
    const target = document.querySelector(hash);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="mt-12 flex flex-wrap items-center justify-center gap-space-md">
      <button
        type="button"
        onClick={() => scrollTo("#desk-stage")}
        className="inline-flex items-center justify-center gap-space-sm font-label-code-lg text-label-code-lg bg-tertiary text-on-tertiary font-bold px-space-lg sm:px-space-xl py-space-md rounded-xl border-2 border-surface-container-lowest shadow-[4px_4px_0px_#242940] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#242940] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all cursor-pointer touch-manipulation min-h-[48px]"
        aria-label="Scroll down to explore the 3D interactive desk stage"
      >
        <span>Scroll to explore the desk</span>
        <span className="text-lg" aria-hidden="true">
          ✦
        </span>
      </button>

      <button
        type="button"
        id="inspect-project-btn"
        onClick={() => scrollTo("#projects")}
        className="relative inline-flex items-center justify-center gap-space-xs font-label-code-lg text-label-code-lg bg-surface-container text-on-surface font-semibold px-space-lg py-space-md rounded-xl border-2 border-outline-variant shadow-[4px_4px_0px_#080d22] hover:bg-surface-container-high transition-all cursor-pointer overflow-hidden touch-manipulation min-h-[48px]"
        aria-label="Jump to inspect projects"
      >
        <span className="relative z-10">Inspect Projects</span>
        <span className="material-symbols-outlined text-[18px] relative z-10" aria-hidden="true">
          terminal
        </span>
      </button>
    </div>
  );
}
