"use client";

import { useState, useRef } from "react";
import { portfolioData } from "@/data/portfolio";

export default function ProjectExplorer() {
  const [activeProjectIdx, setActiveProjectIdx] = useState(0);
  const [activeSubTab, setActiveSubTab] = useState<"overview" | "contribution" | "tech">("overview");
  const touchStartX = useRef<number | null>(null);

  const projects = portfolioData.projects;
  const currentProject = projects[activeProjectIdx] ?? projects[0];

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    // Minimum swipe threshold of 45px
    if (diff > 45) {
      // Swiped left -> next project
      setActiveProjectIdx((prev) => (prev < projects.length - 1 ? prev + 1 : 0));
    } else if (diff < -45) {
      // Swiped right -> previous project
      setActiveProjectIdx((prev) => (prev > 0 ? prev - 1 : projects.length - 1));
    }
    touchStartX.current = null;
  };

  return (
    <>
      <section className="w-full bg-surface-container-low py-space-xl px-gutter-mobile lg:px-gutter" id="projects">
        <div className="max-w-[1280px] mx-auto flex flex-col gap-space-lg">
          {/* MalayOS Window Frame */}
          <div className="w-full bg-surface-container rounded-2xl border-2 border-surface-variant shadow-[8px_8px_0px_#080d22] overflow-hidden">
            {/* OS Title Bar */}
            <div className="bg-surface-container-high px-space-md py-3 flex items-center justify-between border-b-2 border-surface-variant">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-error border border-surface-container-lowest" />
                <span className="w-3.5 h-3.5 rounded-full bg-secondary border border-surface-container-lowest" />
                <span className="w-3.5 h-3.5 rounded-full bg-tertiary border border-surface-container-lowest" />
              </div>

              {/* Terminal Path */}
              <div className="flex items-center gap-2 font-label-code-sm text-label-code-sm text-on-surface">
                <span className="material-symbols-outlined text-base text-primary">folder_open</span>
                <span className="truncate max-w-[200px] sm:max-w-none">MalayOS ~/Projects/Confirmed</span>
              </div>

              <div className="flex items-center gap-2 font-label-code-sm text-label-code-sm text-on-surface-variant">
                <span>{projects.length} items</span>
              </div>
            </div>

            {/* MOBILE VIEW: Interactive Terminal Deck & Project Navigator (Eliminates Grocery Bill) */}
            <div className="p-3 sm:p-5 md:hidden flex flex-col gap-3">
              {/* Terminal Directory Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
                {projects.map((proj, idx) => {
                  const isSelected = idx === activeProjectIdx;
                  return (
                    <button
                      key={proj.id}
                      onClick={() => {
                        setActiveProjectIdx(idx);
                        setActiveSubTab("overview");
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-label-code-sm text-xs whitespace-nowrap transition-all cursor-pointer ${
                        isSelected
                          ? "bg-primary text-on-primary border-surface-container-lowest shadow-[2px_2px_0px_#080d22] font-bold"
                          : "bg-surface-container-lowest text-on-surface-variant border-surface-variant hover:text-on-surface"
                      }`}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-sm">{proj.icon}</span>
                      <span>{proj.title}</span>
                      <span className="text-[10px] opacity-75 font-mono">[{idx + 1}/{projects.length}]</span>
                    </button>
                  );
                })}
              </div>

              {/* Active Mobile Project Card */}
              <div
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                className="bg-surface-container-lowest p-4 rounded-xl border-2 border-surface-variant shadow-[4px_4px_0px_#080d22] flex flex-col justify-between transition-all"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="p-2 rounded-lg bg-surface-container text-primary shrink-0">
                        <span className="material-symbols-outlined text-xl">{currentProject.icon}</span>
                      </span>
                      <div className="min-w-0">
                        <h3 className="font-headline-sm text-lg font-bold text-on-surface truncate">
                          {currentProject.title}
                        </h3>
                        <span className="font-label-code-sm text-xs text-on-surface-variant block truncate">
                          {currentProject.category}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`font-label-code-sm text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider shrink-0 ${
                        currentProject.status === "In Development"
                          ? "bg-tertiary/15 text-tertiary border-tertiary/40"
                          : "bg-secondary/15 text-secondary border-secondary/40"
                      }`}
                    >
                      {currentProject.status}
                    </span>
                  </div>

                  {/* Tagline */}
                  <p className="font-body-md text-xs sm:text-sm text-secondary font-semibold mb-3">
                    {currentProject.tagline}
                  </p>

                  {/* Micro-Tabs: Segmented Content Switcher */}
                  <div className="grid grid-cols-3 gap-1 p-1 bg-surface-container rounded-lg border border-surface-variant mb-3">
                    <button
                      type="button"
                      onClick={() => setActiveSubTab("overview")}
                      className={`py-1 text-center font-label-code-sm text-[11px] rounded transition-all cursor-pointer ${
                        activeSubTab === "overview"
                          ? "bg-surface-container-high text-primary font-bold shadow-sm"
                          : "text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      Overview
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSubTab("contribution")}
                      className={`py-1 text-center font-label-code-sm text-[11px] rounded transition-all cursor-pointer ${
                        activeSubTab === "contribution"
                          ? "bg-surface-container-high text-primary font-bold shadow-sm"
                          : "text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      Contribution
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSubTab("tech")}
                      className={`py-1 text-center font-label-code-sm text-[11px] rounded transition-all cursor-pointer ${
                        activeSubTab === "tech"
                          ? "bg-surface-container-high text-primary font-bold shadow-sm"
                          : "text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      Tech Stack
                    </button>
                  </div>

                  {/* Micro-Tab Content Area */}
                  <div className="min-h-[140px] flex flex-col justify-center">
                    {activeSubTab === "overview" && (
                      <p className="font-body-sm text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                        {currentProject.description}
                      </p>
                    )}

                    {activeSubTab === "contribution" && (
                      <div className="bg-surface-container-high/70 p-3 rounded-lg border border-outline-variant/30">
                        <span className="font-label-code-sm text-[10px] uppercase tracking-wider text-primary font-bold block mb-1">
                          &gt; Malay&apos;s Engineering Contribution:
                        </span>
                        <p className="font-body-sm text-xs text-on-surface leading-normal">
                          {currentProject.contribution}
                        </p>
                      </div>
                    )}

                    {activeSubTab === "tech" && (
                      <div className="flex flex-wrap gap-1.5 py-1">
                        {currentProject.technologies.map((tech) => (
                          <span
                            key={tech}
                            className="font-label-code-sm text-[11px] bg-surface-container px-2 py-0.5 rounded text-on-surface font-semibold border border-outline-variant/40"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Mobile Terminal Footer Navigation */}
                <div className="pt-3 mt-3 border-t border-surface-variant flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() =>
                      setActiveProjectIdx((prev) => (prev > 0 ? prev - 1 : projects.length - 1))
                    }
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface-container text-on-surface font-label-code-sm text-xs font-semibold border border-surface-variant hover:bg-surface-container-high active:scale-95 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                    <span>Prev</span>
                  </button>

                  <span className="font-label-code-sm text-[11px] text-on-surface-variant font-mono">
                    Swipe or tap · [{activeProjectIdx + 1}/{projects.length}]
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setActiveProjectIdx((prev) => (prev < projects.length - 1 ? prev + 1 : 0))
                    }
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface-container text-on-surface font-label-code-sm text-xs font-semibold border border-surface-variant hover:bg-surface-container-high active:scale-95 cursor-pointer"
                  >
                    <span>Next</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>

            {/* DESKTOP VIEW: Grid Area (Preserved Exactly) */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-space-lg p-space-lg">
              {projects.map((project, idx) => {
                const borderAccent =
                  idx === 0
                    ? "hover:border-primary group-hover:text-primary"
                    : idx === 1
                    ? "hover:border-tertiary group-hover:text-tertiary"
                    : "hover:border-secondary group-hover:text-secondary";

                const badgeColor =
                  project.status === "In Development"
                    ? "bg-tertiary/15 text-tertiary border-tertiary/40"
                    : "bg-secondary/15 text-secondary border-secondary/40";

                return (
                  <div
                    key={project.id}
                    className={`bg-surface-container-lowest p-space-lg rounded-xl border-2 border-surface-variant shadow-[4px_4px_0px_#080d22] transition-all flex flex-col justify-between group ${borderAccent}`}
                  >
                    <div>
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-space-sm mb-space-sm">
                        <div className="flex items-center gap-space-sm">
                          <span className="p-2 rounded-lg bg-surface-container text-primary">
                            <span className="material-symbols-outlined text-2xl">{project.icon}</span>
                          </span>
                          <div>
                            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface group-hover:text-primary transition-colors">
                              {project.title}
                            </h3>
                            <span className="font-label-code-sm text-xs text-on-surface-variant block">
                              {project.category}
                            </span>
                          </div>
                        </div>

                        <span
                          className={`font-label-code-sm text-[11px] font-bold px-2 py-0.5 rounded-md border ${badgeColor} uppercase tracking-wider shrink-0`}
                        >
                          {project.status}
                        </span>
                      </div>

                      <p className="font-body-md text-sm text-secondary font-semibold mt-1 mb-3">
                        {project.tagline}
                      </p>

                      <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed mb-4">
                        {project.description}
                      </p>

                      <div className="mb-4 bg-surface-container-high/60 p-2.5 rounded-lg border border-outline-variant/30">
                        <span className="font-label-code-sm text-[11px] uppercase tracking-wider text-primary font-bold block mb-1">
                          My Contribution
                        </span>
                        <p className="font-body-sm text-xs text-on-surface leading-normal">
                          {project.contribution}
                        </p>
                      </div>
                    </div>

                    {/* Tech Stack Chips */}
                    <div>
                      <div className="pt-3 border-t border-surface-variant flex flex-wrap gap-1.5">
                        {project.technologies.map((tech) => (
                          <span
                            key={tech}
                            className="font-label-code-sm text-[11px] bg-surface-container px-2 py-0.5 rounded text-on-surface font-semibold border border-outline-variant/40"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
