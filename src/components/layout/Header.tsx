export default function Header() {
  return (
    <>
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface h-16 border-b-2 border-surface-container-high">
      <div className="h-16 max-w-[1280px] mx-auto px-gutter-mobile lg:px-gutter flex items-center justify-between">
        <a className="font-display text-xl font-bold tracking-tight text-on-surface hover:text-primary transition-colors" href="#">
          {"Malay Ray"}
        </a>
        <nav className="hidden lg:flex items-center gap-6">
          <a className="font-label-code-sm text-sm uppercase tracking-wider font-semibold text-secondary border-b-2 border-secondary pb-0.5 transition-colors" href="#about">
            {"About"}
          </a>
          <a className="font-label-code-sm text-sm uppercase tracking-wider font-semibold text-on-surface-variant hover:text-on-surface transition-colors" href="#desk-stage">
            {"Desk"}
          </a>
          <a className="font-label-code-sm text-sm uppercase tracking-wider font-semibold text-on-surface-variant hover:text-on-surface transition-colors" href="#skills">
            {"Skills"}
          </a>
          <a className="font-label-code-sm text-sm uppercase tracking-wider font-semibold text-on-surface-variant hover:text-on-surface transition-colors" href="#projects">
            {"Projects"}
          </a>
          <a className="font-label-code-sm text-sm uppercase tracking-wider font-semibold text-on-surface-variant hover:text-on-surface transition-colors" href="#violin">
            {"Violin"}
          </a>
          <a className="font-label-code-sm text-sm uppercase tracking-wider font-semibold text-on-surface-variant hover:text-on-surface transition-colors" href="#game">
            {"Game"}
          </a>
        </nav>
        <div className="hidden lg:flex items-center">
          <button className="inline-flex items-center justify-center font-label-code-lg text-label-code-lg bg-primary-container text-on-primary-container border-2 border-on-surface px-space-md py-space-xs rounded-lg shadow-[4px_4px_0px_#080d22] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#080d22] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all uppercase tracking-wider" type="button">
            {"Download CV"}
          </button>
        </div>
        <button aria-expanded="false" aria-label="Toggle menu" className="lg:hidden flex items-center justify-center p-2 rounded-lg text-on-surface hover:bg-surface-container transition-colors" id="mobile-menu-btn" type="button">
          <span className="material-symbols-outlined text-2xl" id="mobile-menu-icon">
            {"menu"}
          </span>
        </button>
      </div>
      <div className="hidden lg:hidden w-full bg-surface border-b-2 border-surface-container-high px-gutter-mobile py-4 flex flex-col gap-4 shadow-[4px_4px_0px_#080d22]" id="mobile-menu">
        <a className="mobile-nav-link font-label-code-sm text-sm uppercase tracking-wider font-semibold text-secondary border-b-2 border-secondary pb-0.5 self-start" href="#about">
          {"About"}
        </a>
        <a className="mobile-nav-link font-label-code-sm text-sm uppercase tracking-wider font-semibold text-on-surface-variant hover:text-on-surface transition-colors" href="#desk-stage">
          {"Desk"}
        </a>
        <a className="mobile-nav-link font-label-code-sm text-sm uppercase tracking-wider font-semibold text-on-surface-variant hover:text-on-surface transition-colors" href="#skills">
          {"Skills"}
        </a>
        <a className="mobile-nav-link font-label-code-sm text-sm uppercase tracking-wider font-semibold text-on-surface-variant hover:text-on-surface transition-colors" href="#projects">
          {"Projects"}
        </a>
        <a className="mobile-nav-link font-label-code-sm text-sm uppercase tracking-wider font-semibold text-on-surface-variant hover:text-on-surface transition-colors" href="#violin">
          {"Violin"}
        </a>
        <a className="mobile-nav-link font-label-code-sm text-sm uppercase tracking-wider font-semibold text-on-surface-variant hover:text-on-surface transition-colors" href="#game">
          {"Game"}
        </a>
        <div className="pt-2 border-t border-surface-variant">
          <button className="w-full inline-flex items-center justify-center font-label-code-lg text-label-code-lg bg-primary-container text-on-primary-container border-2 border-on-surface px-space-md py-space-xs rounded-lg shadow-[4px_4px_0px_#080d22] uppercase tracking-wider" type="button">
            {"Download CV"}
          </button>
        </div>
      </div>
    </header>
    </>
  );
}
