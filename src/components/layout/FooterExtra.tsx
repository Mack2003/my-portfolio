import { portfolioData } from "@/data/portfolio";

const currentYear = 2026;

export default function FooterExtra() {

  return (
    <>
    <footer className="w-full bg-surface-container-lowest border-t-2 border-surface-variant py-space-xl">
      <div className="max-w-[1280px] mx-auto px-gutter-mobile lg:px-gutter flex flex-col md:flex-row items-center justify-between gap-space-md">
        <div className="flex items-center gap-space-sm">
          <span className="w-3 h-3 bg-primary rounded-full"></span>
          <span className="font-label-code-sm text-label-code-sm text-on-surface-variant uppercase tracking-wider">
            {portfolioData.personal.name} © {currentYear} {"//"} Full-Stack &amp; React Native
          </span>
        </div>
        <div className="flex items-center gap-space-md font-label-code-sm text-label-code-sm text-on-surface-variant">
          <a className="hover:text-primary transition-colors" href="#about">
            About
          </a>
          <span className="text-outline-variant">/</span>
          <a className="hover:text-tertiary transition-colors" href="#desk-stage">
            3D Desk
          </a>
          <span className="text-outline-variant">/</span>
          <a className="hover:text-secondary transition-colors" href="#projects">
            Featured Projects
          </a>
        </div>
      </div>
    </footer>
    </>
  );
}
