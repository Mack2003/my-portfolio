/* eslint-disable @next/next/no-html-link-for-pages */
import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import SoundToggle from "@/components/layout/SoundToggle";
import NotFoundTerminal from "@/components/not-found/NotFoundTerminal";

export const metadata: Metadata = {
  title: "404 - Coordinate Not Found | Malay Ray",
  description: "Whoops! This coordinate doesn’t exist in the scene. Calibrate back to base.",
};

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="w-full bg-surface min-h-[calc(100vh-80px)] pt-16">
        <div className="flex flex-col w-full relative overflow-hidden py-space-xl">
          {/* Flat Geometric Sticker Debris & Sparkles (Zero Gradients, Solid Hard Shadows) */}
          <div className="absolute top-12 left-10 hidden lg:block select-none pointer-events-none -rotate-6 z-0">
            <div className="bg-secondary-fixed text-on-secondary-fixed font-label-code-sm text-label-code-sm px-3 py-1 rounded shadow-[4px_4px_0px_#080d22] uppercase tracking-wider font-bold">
              {"ERR // 0x404_NULL_POINTER"}
            </div>
          </div>
          <div className="absolute top-24 right-16 hidden lg:block select-none pointer-events-none rotate-3 z-0">
            <div className="bg-tertiary-fixed text-on-tertiary-fixed font-label-code-sm text-label-code-sm px-3 py-1 rounded shadow-[4px_4px_0px_#080d22] uppercase tracking-wider font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">wifi_off</span> LOST_IN_ORBIT
            </div>
          </div>

          <div className="max-w-[1280px] mx-auto px-gutter-mobile lg:px-gutter w-full relative z-10">
            {/* Top Chamfered Status Banner */}
            <div className="w-full flex items-center justify-between bg-surface-container-high px-space-md py-space-sm rounded-lg shadow-[4px_4px_0px_#080d22] mb-space-xl">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 bg-error rounded-full animate-ping"></span>
                <span className="font-label-code-sm text-label-code-sm text-on-surface uppercase tracking-wider font-bold">
                  {"SYSTEM ALERT // UNINDEXED_CHUNKS"}
                </span>
              </div>
              <div className="font-label-code-sm text-label-code-sm text-tertiary uppercase tracking-wider hidden sm:block">
                GL_SCENE_DEPTH: OVERFLOW (-999.00)
              </div>
            </div>

            {/* Hero 404 Centerpiece Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-center mb-space-xl">
              {/* Left Column: Giant Physical "404" & Playful Die-Cut Badge Collages */}
              <div className="lg:col-span-7 flex flex-col items-start relative">
                {/* Giant Chunky Die-Cut Badge Container */}
                <div className="relative w-full mb-6">
                  <div className="flex items-baseline gap-2 select-none">
                    {/* 4 */}
                    <div className="relative group">
                      <span className="font-display text-[96px] sm:text-[140px] leading-none font-black text-primary-fixed drop-shadow-[8px_8px_0px_#080d22] tracking-tighter">
                        4
                      </span>
                      {/* Tilted Sticker: Bug */}
                      <span className="absolute -top-3 -left-4 bg-error text-on-error font-label-code-sm text-label-code-sm px-2 py-0.5 rounded shadow-[3px_3px_0px_#080d22] -rotate-12 font-bold uppercase flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">bug_report</span> 1 BUG
                      </span>
                    </div>

                    {/* 0 (Styled as Interactive Camera Viewport) */}
                    <div className="relative group mx-2">
                      <span className="font-display text-[96px] sm:text-[140px] leading-none font-black text-secondary drop-shadow-[8px_8px_0px_#080d22] tracking-tighter">
                        0
                      </span>
                      {/* Sticker: Route Lost Badge (Replaced Violin Lost) */}
                      <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-surface-container-highest text-tertiary-fixed font-label-code-sm text-label-code-sm px-2 py-1 rounded shadow-[3px_3px_0px_#080d22] rotate-6 font-bold flex items-center gap-1 whitespace-nowrap">
                        <span className="material-symbols-outlined text-xs">explore_off</span> ROUTE_LOST
                      </span>
                    </div>

                    {/* 4 */}
                    <div className="relative group">
                      <span className="font-display text-[96px] sm:text-[140px] leading-none font-black text-tertiary drop-shadow-[8px_8px_0px_#080d22] tracking-tighter">
                        4
                      </span>
                      {/* Sticker: Wireframe Cube Badge */}
                      <span className="absolute -top-4 -right-6 bg-primary-container text-on-primary-container font-label-code-sm text-label-code-sm px-2.5 py-1 rounded shadow-[3px_3px_0px_#080d22] rotate-12 font-bold flex items-center gap-1 uppercase">
                        <span className="material-symbols-outlined text-xs">view_in_ar</span> MESH 404
                      </span>
                    </div>
                  </div>
                </div>

                {/* Punchy Headlines */}
                <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface mb-3 tracking-tight">
                  Whoops! This coordinate doesn’t exist in the scene.
                </h1>
                <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl mb-6">
                  Looks like the camera drifted into unrendered void space, or this route was never added to the config file. Let’s calibrate your viewport back to base.
                </p>

                {/* CTA Button Group with tactile mechanical offsets */}
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <a
                    className="inline-flex items-center gap-2 font-label-code-lg text-label-code-lg bg-primary-container text-on-primary-container px-space-lg py-space-sm rounded-lg shadow-[6px_6px_0px_#080d22] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_#080d22] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none transition-all uppercase tracking-wider font-bold"
                    href="/#desk-stage"
                  >
                    <span className="material-symbols-outlined text-lg">rocket_launch</span>
                    Return to Desk Scene
                  </a>
                  <a
                    className="inline-flex items-center gap-2 font-label-code-lg text-label-code-lg bg-surface-container-high text-on-surface px-space-lg py-space-sm rounded-lg shadow-[6px_6px_0px_#080d22] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_#080d22] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none transition-all uppercase tracking-wider font-bold"
                    href="/#game"
                  >
                    <span className="material-symbols-outlined text-lg">videogame_asset</span>
                    Habit Catcher Game
                  </a>
                </div>

                {/* Quick Teleport Chips Bar */}
                <div className="w-full pt-4">
                  <span className="font-label-code-sm text-label-code-sm text-outline uppercase tracking-wider block mb-2 font-semibold">
                    {"// TELEPORT TO KNOWN ROUTE NODES:"}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <a
                      className="font-label-code-sm text-label-code-sm bg-surface-container text-primary px-3 py-1.5 rounded shadow-[2px_2px_0px_#080d22] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all font-bold"
                      href="/#about"
                    >
                      #about-me
                    </a>
                    <a
                      className="font-label-code-sm text-label-code-sm bg-surface-container text-secondary px-3 py-1.5 rounded shadow-[2px_2px_0px_#080d22] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all font-bold"
                      href="/#desk-stage"
                    >
                      #desk-stage
                    </a>
                    <a
                      className="font-label-code-sm text-label-code-sm bg-surface-container text-tertiary px-3 py-1.5 rounded shadow-[2px_2px_0px_#080d22] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all font-bold"
                      href="/#skills"
                    >
                      #skills
                    </a>
                    <a
                      className="font-label-code-sm text-label-code-sm bg-surface-container text-primary-fixed px-3 py-1.5 rounded shadow-[2px_2px_0px_#080d22] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all font-bold"
                      href="/#projects"
                    >
                      #projects
                    </a>
                    <a
                      className="font-label-code-sm text-label-code-sm bg-surface-container text-tertiary-fixed px-3 py-1.5 rounded shadow-[2px_2px_0px_#080d22] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all font-bold"
                      href="/#game"
                    >
                      #mini-game
                    </a>
                  </div>
                </div>
              </div>

              {/* Right Column: Interactive Terminal Window + Physical Sticky Note Overlay */}
              <div className="lg:col-span-5 relative mt-6 lg:mt-0">
                {/* Pinned Physical Sticky Note Sticker (Overlapping with negative offset) */}
                <div className="absolute -top-6 -right-3 sm:-right-6 z-20 bg-secondary-fixed text-on-secondary-fixed px-4 py-3 rounded-lg shadow-[6px_6px_0px_#080d22] rotate-3 max-w-[220px]">
                  <div className="flex items-center justify-between mb-1 pb-1">
                    <span className="font-label-code-sm text-label-code-sm uppercase tracking-wider font-bold">
                      STICKY NOTE
                    </span>
                    <span className="material-symbols-outlined text-sm">push_pin</span>
                  </div>
                  <p className="font-body-sm text-body-sm leading-tight font-bold">
                    “Tip: Did you try reloading the scene config or checking your three.js camera rig?”
                  </p>
                  <span className="block mt-2 font-label-code-sm text-label-code-sm text-right font-black">
                    — Malay
                  </span>
                </div>

                {/* Interactive Client Terminal Island */}
                <NotFoundTerminal />
              </div>
            </div>

            {/* Retro Playful Diagnostic & Feature Discovery Cards */}
            <div className="w-full mb-space-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">explore</span>
                  Did you mean to explore one of these zones?
                </h2>
                <span className="font-label-code-sm text-label-code-sm text-outline uppercase tracking-wider hidden sm:inline-block">
                  3 CHUNKS AVAILABLE
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
                {/* Card 1: Interactive 3D Desk */}
                <a
                  className="group bg-surface-container-low rounded-xl p-space-md shadow-[6px_6px_0px_#080d22] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0px_#080d22] transition-all flex flex-col justify-between"
                  href="/#desk-stage"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center font-bold shadow-[2px_2px_0px_#080d22]">
                        <span className="material-symbols-outlined">desktop_windows</span>
                      </div>
                      <span className="font-label-code-sm text-label-code-sm bg-surface-container px-2 py-0.5 rounded text-primary font-bold">
                        ROOM_01
                      </span>
                    </div>
                    <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface group-hover:text-primary transition-colors mb-1">
                      3D Interactive Desk
                    </h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">
                      Explore my physical-digital workspace modeled in Blender &amp; Three.js. Click monitors, notebooks, and synthesizer racks.
                    </p>
                  </div>
                  <div className="font-label-code-sm text-label-code-sm text-primary uppercase font-bold flex items-center gap-1">
                    Jump to Station{" "}
                    <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
                      arrow_forward
                    </span>
                  </div>
                </a>

                {/* Card 2: Habit Catcher Game (Replaced Violin Lab) */}
                <a
                  className="group bg-surface-container-low rounded-xl p-space-md shadow-[6px_6px_0px_#080d22] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0px_#080d22] transition-all flex flex-col justify-between"
                  href="/#game"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-lg bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold shadow-[2px_2px_0px_#080d22]">
                        <span className="material-symbols-outlined">sports_esports</span>
                      </div>
                      <span className="font-label-code-sm text-label-code-sm bg-surface-container px-2 py-0.5 rounded text-secondary font-bold">
                        GAME_02
                      </span>
                    </div>
                    <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface group-hover:text-secondary transition-colors mb-1">
                      Habit Catcher Arcade
                    </h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">
                      An interactive canvas mini-game built with Phaser. Catch productivity habits, dodge distractions, and rack up combo points.
                    </p>
                  </div>
                  <div className="font-label-code-sm text-label-code-sm text-secondary uppercase font-bold flex items-center gap-1">
                    Launch Mini-Game{" "}
                    <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
                      arrow_forward
                    </span>
                  </div>
                </a>

                {/* Card 3: Code & Engineering Repos */}
                <a
                  className="group bg-surface-container-low rounded-xl p-space-md shadow-[6px_6px_0px_#080d22] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0px_#080d22] transition-all flex flex-col justify-between"
                  href="/#projects"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-lg bg-tertiary-container text-on-tertiary-container flex items-center justify-center font-bold shadow-[2px_2px_0px_#080d22]">
                        <span className="material-symbols-outlined">data_object</span>
                      </div>
                      <span className="font-label-code-sm text-label-code-sm bg-surface-container px-2 py-0.5 rounded text-tertiary font-bold">
                        DEV_03
                      </span>
                    </div>
                    <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface group-hover:text-tertiary transition-colors mb-1">
                      Projects &amp; Experiments
                    </h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">
                      Full-stack applications, WebGL shaders, micro-tools, and open-source packages authored by Malay.
                    </p>
                  </div>
                  <div className="font-label-code-sm text-label-code-sm text-tertiary uppercase font-bold flex items-center gap-1">
                    Browse Explorer{" "}
                    <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
                      arrow_forward
                    </span>
                  </div>
                </a>
              </div>
            </div>

            {/* Solid Neo-Brutalist Chamfered Divider */}
            <div className="w-full flex items-center gap-4 my-space-lg select-none">
              <div className="h-1 flex-1 bg-surface-container-high rounded"></div>
              <div className="flex items-center gap-2 bg-surface-container-low px-4 py-1.5 rounded-lg shadow-[3px_3px_0px_#080d22]">
                <span className="material-symbols-outlined text-primary text-sm">terminal</span>
                <span className="font-label-code-sm text-label-code-sm text-on-surface-variant font-bold uppercase tracking-widest">
                  COORDINATE RECOVERY PROTOCOL ACTIVE
                </span>
              </div>
              <div className="h-1 flex-1 bg-surface-container-high rounded"></div>
            </div>
          </div>
        </div>
      </main>

      <SoundToggle />

      {/* Neo-Brutalist 404 Footer */}
      <footer className="w-full bg-surface-container-lowest border-t-2 border-surface-variant py-space-xl">
        <div className="max-w-[1280px] mx-auto px-gutter-mobile lg:px-gutter flex flex-col md:flex-row items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-sm">
            <span className="w-3 h-3 bg-primary rounded-full"></span>
            <span className="font-label-code-sm text-label-code-sm text-on-surface-variant uppercase tracking-wider">
              {"Malay Ray © 2026 // Neo-Brutalist Playground"}
            </span>
          </div>
          <div className="flex items-center gap-space-md font-label-code-sm text-label-code-sm text-on-surface-variant">
            <a className="hover:text-primary transition-colors" href="/#about">
              README.md
            </a>
            <span className="text-outline-variant">/</span>
            <a className="hover:text-tertiary transition-colors" href="/#projects">
              Source Code
            </a>
            <span className="text-outline-variant">/</span>
            <a className="hover:text-secondary transition-colors" href="/#game">
              Habit Catcher Game
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
