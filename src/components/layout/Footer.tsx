import { portfolioData } from "@/data/portfolio";

const currentYear = 2026;

export default function Footer() {

  return (
    <>
    <footer className="w-full bg-surface-container-high py-space-xl px-gutter-mobile lg:px-gutter border-t-2 border-surface-variant">
      <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row items-center justify-between gap-space-lg">
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <div className="flex items-center gap-2">
            <span className="text-tertiary">✦</span>
            <span className="font-headline-sm text-headline-sm font-bold text-on-surface">
              {portfolioData.personal.name}
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Crafted with clean code, modern architecture, and creative curiosity.
          </p>
        </div>

        {/* Real Confirmed Social Links */}
        <div className="flex items-center gap-space-md font-label-code-sm text-label-code-sm text-on-surface-variant">
          <a
            className="hover:text-primary transition-colors flex items-center gap-1"
            href={portfolioData.personal.github}
            rel="noopener noreferrer"
            target="_blank"
          >
            <span>GitHub</span>
            <span className="material-symbols-outlined text-xs">arrow_outward</span>
          </a>
          <span>/</span>
          <a
            className="hover:text-tertiary transition-colors flex items-center gap-1"
            href={portfolioData.personal.linkedin}
            rel="noopener noreferrer"
            target="_blank"
          >
            <span>LinkedIn</span>
            <span className="material-symbols-outlined text-xs">arrow_outward</span>
          </a>
          <span>/</span>
          <a
            className="hover:text-secondary transition-colors flex items-center gap-1"
            href={`mailto:${portfolioData.personal.email}`}
          >
            <span>Email</span>
            <span className="material-symbols-outlined text-xs">mail</span>
          </a>
        </div>

        <div className="font-label-code-sm text-label-code-sm text-outline">
          © {currentYear} {portfolioData.personal.name}. All rights reserved.
        </div>
      </div>
    </footer>
    </>
  );
}
