import { portfolioData } from "@/data/portfolio";

export default function CvBanner() {
  return (
    <>
    <section className="w-full bg-surface-container-low py-space-xl px-gutter-mobile lg:px-gutter" id="contact">
      <div className="max-w-[1280px] mx-auto">
        {/* Zig-zag / Neo-Brutalist Starburst Action Banner Card */}
        <div className="relative bg-surface-container p-8 md:p-14 rounded-3xl border-4 border-secondary-container shadow-[8px_8px_0px_#080d22] overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-space-xl">
          {/* Decorative Starburst Icon in corner */}
          <div className="absolute -top-10 -right-10 pointer-events-none opacity-20">
            <svg className="w-48 h-48 text-secondary" fill="currentColor" viewBox="0 0 100 100">
              <polygon points="50,0 63,35 100,35 70,57 82,91 50,70 18,91 30,57 0,35 37,35"></polygon>
            </svg>
          </div>

          <div className="relative z-10 max-w-2xl text-center lg:text-left">
            <div className="inline-block bg-secondary text-on-secondary-container font-label-code-sm text-label-code-sm font-bold px-space-md py-space-xs rounded-lg border-2 border-surface-container-lowest shadow-[3px_3px_0px_#080d22] -rotate-2 mb-4">
              Let&apos;s Collaborate ✦
            </div>
            <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface leading-tight">
              Ready to build something reliable and creative together?
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant mt-3">
              Open to Full-Stack Developer roles, React Native mobile applications, and high-performance interactive digital experiences.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-space-md shrink-0 w-full sm:w-auto">
            {/* Download Full CV / Request Resume */}
            <a
              href={`mailto:${portfolioData.personal.email}?subject=Resume%20Request%20-%20Malay%20Ray`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-space-sm font-label-code-lg text-label-code-lg bg-primary text-on-primary font-bold px-space-lg sm:px-space-xl py-space-md rounded-xl border-2 border-surface-container-lowest shadow-[4px_4px_0px_#080d22] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#080d22] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all uppercase tracking-wider touch-manipulation min-h-[48px]"
            >
              <span className="material-symbols-outlined text-xl">download</span>
              <span>Request CV / Resume</span>
            </a>

            {/* Copy Email Button */}
            <button
              className="w-full sm:w-auto inline-flex items-center justify-center gap-space-sm font-label-code-lg text-label-code-lg bg-surface-container-highest text-on-surface font-semibold px-space-lg py-space-md rounded-xl border-2 border-outline-variant shadow-[4px_4px_0px_#080d22] hover:bg-surface-bright transition-all touch-manipulation min-h-[48px] cursor-pointer"
              id="copy-email-btn"
              type="button"
            >
              <span className="material-symbols-outlined text-xl">content_copy</span>
              <span id="copy-email-text">{portfolioData.personal.email}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
    </>
  );
}
