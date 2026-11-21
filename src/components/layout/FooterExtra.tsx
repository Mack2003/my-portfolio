export default function FooterExtra() {
  return (
    <>
    <footer className="w-full bg-surface-container-lowest border-t-2 border-surface-variant py-space-xl">
      <div className="max-w-[1280px] mx-auto px-gutter-mobile lg:px-gutter flex flex-col md:flex-row items-center justify-between gap-space-md">
        <div className="flex items-center gap-space-sm">
          <span className="w-3 h-3 bg-primary rounded-full"></span>
          <span className="font-label-code-sm text-label-code-sm text-on-surface-variant uppercase tracking-wider">
            {"Malay Ray © 2025 // Neo-Brutalist Playground"}
          </span>
        </div>
        <div className="flex items-center gap-space-md font-label-code-sm text-label-code-sm text-on-surface-variant">
          <a className="hover:text-primary transition-colors" data-path="overview" href="#">
            {"README.md"}
          </a>
          <span className="text-outline-variant">
            {"/"}
          </span>
          <a className="hover:text-tertiary transition-colors" data-path="project-explorer" href="#">
            {"Source Code"}
          </a>
          <span className="text-outline-variant">
            {"/"}
          </span>
          <a className="hover:text-secondary transition-colors" data-path="violin-corner" href="#">
            {"Violin Improvisations"}
          </a>
        </div>
      </div>
    </footer>
    </>
  );
}
