/* eslint-disable @next/next/no-img-element */
import { portfolioData } from "@/data/portfolio";

export default function About() {
  return (
    <>
    <section className="w-full bg-surface-container-low py-space-xl px-gutter-mobile lg:px-gutter relative" id="about">
      <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Organic blob frame portrait with sticker callouts */}
        <div
          aria-label="Malay's portrait with an interactive UFO spotlight"
          className="about-ufo-scene lg:col-span-5 flex justify-center relative"
          role="group"
          tabIndex={0}
        >
          {/* Sticker 1: Creative Coder */}
          <div className="absolute -top-4 -left-2 z-20 bg-secondary text-on-secondary-container font-label-code-sm text-label-code-sm px-space-md py-space-xs rounded-lg border-2 border-surface-container-lowest shadow-[3px_3px_0px_#080d22] -rotate-6 hover:rotate-0 transition-transform">
            Creative Coder 🚀
          </div>
          {/* Sticker 2: Problem Solver */}
          <div className="absolute bottom-6 -left-2 sm:-left-6 z-20 bg-primary-container text-on-primary-fixed font-label-code-sm text-label-code-sm px-space-md py-space-xs rounded-lg border-2 border-surface-container-lowest shadow-[3px_3px_0px_#080d22] rotate-3 hover:rotate-0 transition-transform">
            Problem Solver ⚡
          </div>
          {/* Sticker 3: React Native */}
          <div className="absolute top-1/2 -right-2 sm:-right-6 z-20 bg-tertiary-fixed text-on-tertiary-fixed font-label-code-sm text-label-code-sm px-space-md py-space-xs rounded-lg border-2 border-surface-container-lowest shadow-[3px_3px_0px_#080d22] rotate-6 hover:rotate-0 transition-transform">
            React Native 📱
          </div>
          {"\n"}
          <div className="portrait-frame relative w-72 h-72 sm:w-80 sm:h-80">
            <div aria-hidden="true" className="about-ufo">
              <svg fill="none" viewBox="0 0 96 56">
                <ellipse cx="48" cy="39" fill="#080d22" opacity=".45" rx="39" ry="9" />
                <path d="M34 30c0-12 6-21 14-21s14 9 14 21" fill="#2de0a5" stroke="#080d22" strokeWidth="3" />
                <path d="M9 34c4-8 19-13 39-13s35 5 39 13c-5 8-20 12-39 12S14 42 9 34Z" fill="#b2c5ff" stroke="#080d22" strokeWidth="4" />
                <path d="M18 35c8-4 18-6 30-6s22 2 30 6" stroke="#fff" strokeLinecap="round" strokeWidth="3" />
                <circle cx="31" cy="38" r="2" fill="#ffafd0" />
                <circle cx="48" cy="40" r="2" fill="#2de0a5" />
                <circle cx="65" cy="38" r="2" fill="#ffafd0" />
                <path d="m75 11 2.2 4.8L82 18l-4.8 2.2L75 25l-2.2-4.8L68 18l4.8-2.2L75 11Z" fill="#ffafd0" />
              </svg>
            </div>
            <div className="portrait-cutout portrait-frame-shell h-full w-full p-[3px] bg-tertiary shadow-[8px_8px_0px_#080d22]">
              <div className="portrait-cutout relative h-full w-full overflow-hidden bg-surface-container-lowest">
                <svg aria-hidden="true" className="portrait-spotlight absolute w-full" preserveAspectRatio="none" viewBox="0 0 320 320">
                  <defs>
                    <linearGradient id="portrait-beam" x1="160" x2="160" y1="36" y2="278" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#fff" stopOpacity=".76" />
                      <stop offset=".42" stopColor="#fff" stopOpacity=".45" />
                      <stop offset=".82" stopColor="#fff" stopOpacity=".16" />
                      <stop offset="1" stopColor="#fff" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="portrait-beam-fade" x1="0" x2="0" y1="0" y2="1">
                      <stop stopColor="#fff" />
                      <stop offset=".5" stopColor="#fff" />
                      <stop offset=".78" stopColor="#fff" stopOpacity=".55" />
                      <stop offset="1" stopColor="#000" />
                    </linearGradient>
                    <mask id="portrait-beam-mask" maskContentUnits="objectBoundingBox">
                      <path
                        d="M.5 0L.1 .87C.3 1 .7 1 .9 .87L.5 0Z"
                        fill="url(#portrait-beam-fade)"
                      />
                    </mask>
                    <filter id="portrait-beam-soften" x="-30%" y="-20%" width="160%" height="150%">
                      <feGaussianBlur stdDeviation="3" />
                    </filter>
                    <filter id="portrait-beam-glow-soften" x="-30%" y="-20%" width="160%" height="150%">
                      <feGaussianBlur stdDeviation="12" />
                    </filter>
                  </defs>
                  <path
                    className="portrait-beam-glow"
                    d="M158 36L16 278L304 278L162 36Z"
                    fill="url(#portrait-beam)"
                    filter="url(#portrait-beam-glow-soften)"
                    mask="url(#portrait-beam-mask)"
                  />
                  <path
                    className="portrait-beam-core"
                    d="M158 36L32 278L288 278L162 36Z"
                    fill="url(#portrait-beam)"
                    filter="url(#portrait-beam-soften)"
                    mask="url(#portrait-beam-mask)"
                  />
                </svg>
                <img
                  alt="Malay Ray"
                  className="portrait-image absolute inset-0 h-full w-full object-contain"
                  height="1020"
                  src="/images/malay-portrait.webp"
                  width="1095"
                />
              </div>
            </div>
          </div>
        </div>
        {"\n"}
        {/* Right Column: First-Person Narrative & Ticket Cards */}
        {"\n"}
        <div className="lg:col-span-7 flex flex-col gap-space-lg">
          {"\n"}
          <div>
            {"\n"}
            <div className="inline-block relative mb-2">
              {"\n"}
              <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface">
                About Me
              </h2>
              <div className="h-2 w-full bg-secondary-container rounded-full mt-1"></div>
            </div>
            <p className="font-body-lg text-body-lg text-on-surface mt-4 leading-relaxed">
              {portfolioData.personal.bioIntro}
            </p>
          </div>

          {/* Quick Facts Tickets in solid night-700 / surface-container */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md pt-2">
            {/* Fact 1: Confirmed Location */}
            <div className="bg-surface-container p-space-md rounded-xl border-2 border-surface-variant shadow-[4px_4px_0px_#080d22] flex items-start gap-space-sm hover:border-primary transition-colors">
              <span className="material-symbols-outlined text-primary text-2xl mt-0.5">
                location_on
              </span>
              <div className="min-w-0">
                <span className="font-label-code-sm text-label-code-sm text-on-surface-variant uppercase tracking-wider block">
                  Location
                </span>
                <p className="font-headline-sm text-headline-sm text-on-surface">
                  {portfolioData.personal.location}
                </p>
              </div>
            </div>

            {/* Fact 2: Confirmed Professional Experience */}
            <div className="bg-surface-container p-space-md rounded-xl border-2 border-surface-variant shadow-[4px_4px_0px_#080d22] flex items-start gap-space-sm hover:border-tertiary transition-colors">
              <span className="material-symbols-outlined text-tertiary text-2xl mt-0.5">
                work
              </span>
              <div className="min-w-0">
                <span className="font-label-code-sm text-label-code-sm text-on-surface-variant uppercase tracking-wider block">
                  Experience
                </span>
                <p className="font-headline-sm text-headline-sm text-on-surface">
                  {portfolioData.experience.yearsBadge}
                </p>
                <p className="font-label-code-sm text-xs text-on-surface-variant mt-0.5">
                  Websadroit &amp; Birdvision AB
                </p>
              </div>
            </div>

            {/* Fact 3: Core Stack */}
            <div className="bg-surface-container p-space-md rounded-xl border-2 border-surface-variant shadow-[4px_4px_0px_#080d22] flex items-start gap-space-sm hover:border-secondary transition-colors">
              <span className="material-symbols-outlined text-secondary text-2xl mt-0.5">
                layers
              </span>
              <div className="min-w-0">
                <span className="font-label-code-sm text-label-code-sm text-on-surface-variant uppercase tracking-wider block">
                  Core Technologies
                </span>
                <p className="font-body-md text-body-md text-on-surface font-bold">
                  React Native, Next.js, Node.js
                </p>
                <p className="font-label-code-sm text-xs text-on-surface-variant mt-0.5">
                  PostgreSQL, Redis, TypeScript
                </p>
              </div>
            </div>

            {/* Fact 4: Primary Focus */}
            <div className="bg-surface-container p-space-md rounded-xl border-2 border-surface-variant shadow-[4px_4px_0px_#080d22] flex items-start gap-space-sm hover:border-primary-fixed-dim transition-colors">
              <span className="material-symbols-outlined text-primary-fixed-dim text-2xl mt-0.5">
                rocket_launch
              </span>
              <div className="min-w-0">
                <span className="font-label-code-sm text-label-code-sm text-on-surface-variant uppercase tracking-wider block">
                  Primary Focus
                </span>
                <p className="font-body-md text-body-md text-on-surface font-bold">
                  Native Mobile &amp; Scalable Web
                </p>
                <p className="font-label-code-sm text-xs text-on-surface-variant mt-0.5">
                  Full-Stack Architecture &amp; 3D Graphics
                </p>
              </div>
            </div>
            {"\n"}
          </div>
          {"\n"}
        </div>
        {"\n"}
      </div>
      {"\n"}
    </section>
    </>
  );
}
