export default function Footer() {
  return (
    <>
    <footer className="w-full bg-surface-container-high py-space-xl px-gutter-mobile lg:px-gutter border-t-2 border-surface-variant">
      {"\n"}
      <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row items-center justify-between gap-space-lg">
        {"\n"}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          {"\n"}
          <div className="flex items-center gap-2">
            {"\n"}
            <span className="text-tertiary">
              {"✦"}
            </span>
            {"\n"}
            <span className="font-headline-sm text-headline-sm font-bold text-on-surface">
              {"Malay Ray"}
            </span>
            {"\n"}
          </div>
          {"\n"}
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            {"\n          Crafted with code, boundless curiosity, and a violin bow.\n        "}
          </p>
          {"\n"}
        </div>
        {"\n"}
        {/* Quick Social / Code Links */}
        {"\n"}
        <div className="flex items-center gap-space-md font-label-code-sm text-label-code-sm text-on-surface-variant">
          {"\n"}
          <a className="hover:text-primary transition-colors flex items-center gap-1" href="https://github.com" rel="noopener noreferrer" target="_blank">
            {"\n"}
            <span>
              {"GitHub"}
            </span>
            {"\n"}
            <span className="material-symbols-outlined text-xs">
              {"arrow_outward"}
            </span>
            {"\n"}
          </a>
          {"\n"}
          <span>
            {"/"}
          </span>
          {"\n"}
          <a className="hover:text-tertiary transition-colors flex items-center gap-1" href="https://linkedin.com" rel="noopener noreferrer" target="_blank">
            {"\n"}
            <span>
              {"LinkedIn"}
            </span>
            {"\n"}
            <span className="material-symbols-outlined text-xs">
              {"arrow_outward"}
            </span>
            {"\n"}
          </a>
          {"\n"}
          <span>
            {"/"}
          </span>
          {"\n"}
          <a className="hover:text-secondary transition-colors flex items-center gap-1" href="https://x.com" rel="noopener noreferrer" target="_blank">
            {"\n"}
            <span>
              {"Twitter / X"}
            </span>
            {"\n"}
            <span className="material-symbols-outlined text-xs">
              {"arrow_outward"}
            </span>
            {"\n"}
          </a>
          {"\n"}
        </div>
        {"\n"}
        <div className="font-label-code-sm text-label-code-sm text-outline">
          {"\n        © 2025 Malay Ray. All rights reserved.\n      "}
        </div>
        {"\n"}
      </div>
      {"\n"}
    </footer>
    </>
  );
}
