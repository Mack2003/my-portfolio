export default function Hero() {
  return (
    <>
    <section className="relative w-full bg-surface-container-lowest overflow-hidden pt-12 pb-24 md:py-28 px-gutter-mobile lg:px-gutter">
      {"\n"}
      {/* Playful Neo-Brutalist Confetti & Blobs (Flat Solid Colors) */}
      {"\n"}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        {"\n"}
        {/* Shape 1: Asterisk Sticker Top Right */}
        {"\n"}
        <div className="absolute top-12 right-8 md:right-24 rotate-12 transition-transform hover:rotate-45">
          {"\n"}
          <svg className="w-16 h-16 text-secondary" fill="currentColor" viewBox="0 0 100 100">
            {"\n"}
            <path d="M42,10 L58,10 L58,38 L84,23 L92,37 L66,52 L92,67 L84,81 L58,66 L58,94 L42,94 L42,66 L16,81 L8,67 L34,52 L8,37 L16,23 L42,38 Z"></path>
            {"\n"}
          </svg>
          {"\n"}
        </div>
        {"\n"}
        {/* Shape 2: Solid Mint Circle Cutout */}
        {"\n"}
        <div className="absolute top-1/3 left-6 md:left-16 w-8 h-8 rounded-full bg-tertiary-fixed-dim border-2 border-surface-container-lowest shadow-[3px_3px_0px_#242940]"></div>
        {"\n"}
        {/* Shape 3: Geometric Diamond */}
        {"\n"}
        <div className="absolute bottom-28 right-16 w-12 h-12 bg-primary-container border-2 border-surface-container-lowest rotate-45 shadow-[4px_4px_0px_#242940] hidden sm:block"></div>
        {"\n"}
        {/* Shape 4: Playful Squiggle */}
        {"\n"}
        <svg className="absolute bottom-16 left-12 w-28 h-10 text-secondary hidden md:block" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="6" viewBox="0 0 120 40">
          {"\n"}
          <path d="M5 20 Q 20 5, 35 20 T 65 20 T 95 20 T 115 20"></path>
          {"\n"}
        </svg>
        {"\n"}
      </div>
      {"\n"}
      <div className="max-w-[1280px] mx-auto flex flex-col items-center text-center relative z-10">
        {"\n"}
        {/* Quick Status Badge */}
        {"\n"}
        <div className="inline-flex items-center gap-space-xs px-space-md py- space-xs bg-surface-container-high border-2 border-tertiary rounded-full shadow-[3px_3px_0px_#080d22] -rotate-1 mb-8 hover:rotate-0 transition-transform">
          {"\n"}
          <span className="w-2.5 h-2.5 rounded-full bg-tertiary animate-ping"></span>
          {"\n"}
          <span className="font-label-code-sm text-label-code-sm text-tertiary uppercase tracking-wider">
            {"Available for high-impact creative engineering roles"}
          </span>
          {"\n"}
        </div>
        {"\n"}
        {/* Giant Playful Headline */}
        {"\n"}
        <h1 className="font-display text-[clamp(2.75rem,8vw,7.5rem)] font-extrabold tracking-tight text-on-surface leading-[1.05] max-w-5xl">
          {"\n        Hey, I'm "}
          <span className="relative inline-block text-primary">
            {"Malay!\n          "}
            {/* Hand-drawn style highlighter underline SVG */}
            {"\n"}
            <svg className="absolute -bottom-2 md:-bottom-4 left-0 w-full h-4 md:h-6 text-secondary-fixed-dim" fill="none" preserveAspectRatio="none" viewBox="0 0 240 24">
              {"\n"}
              <path d="M4 18 C 50 8, 150 22, 236 12 C 180 20, 80 23, 10 20" fill="currentColor" stroke="currentColor" strokeLinecap="round" strokeWidth="6"></path>
              {"\n"}
            </svg>
            {"\n"}
          </span>
          {" 👋\n      "}
        </h1>
        {"\n"}
        {/* Subtitle with Swash Overlines */}
        {"\n"}
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-3xl mt-8 leading-relaxed">
          {"\n        Creative Software Engineer building "}
          <span className="bg-surface-container-high px-2 py-0.5 rounded text-primary font-bold">
            {"playful web apps"}
          </span>
          {", Next.js interactive experiences, "}
          <span className="bg-surface-container-high px-2 py-0.5 rounded text-secondary font-bold">
            {"3D worlds"}
          </span>
          {" "}
          {"&"}
          {" robust cloud architectures.\n      "}
        </p>
        {"\n"}
        {/* Scroll prompt CTA */}
        {"\n"}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-space-md">
          {"\n"}
          <a className="inline-flex items-center gap-space-sm font-label-code-lg text-label-code-lg bg-tertiary text-on-tertiary font-bold px-space-xl py-space-md rounded-xl border-2 border-surface-container-lowest shadow-[4px_4px_0px_#242940] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#242940] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all" href="#desk-stage">
            {"\n"}
            <span>
              {"Scroll to explore the desk"}
            </span>
            {"\n"}
            <span className="text-lg">
              {"✦"}
            </span>
            {"\n"}
          </a>
          {"\n"}
          <a className="inline-flex items-center gap-space-xs font-label-code-lg text-label-code-lg bg-surface-container text-on-surface font-semibold px-space-lg py-space-md rounded-xl border-2 border-outline-variant shadow-[4px_4px_0px_#080d22] hover:bg-surface-container-high transition-all" href="#projects">
            {"\n"}
            <span>
              {"Inspect Projects"}
            </span>
            {"\n"}
            <span className="material-symbols-outlined text-[18px]">
              {"terminal"}
            </span>
            {"\n"}
          </a>
          {"\n"}
        </div>
        {"\n"}
      </div>
      {"\n"}
    </section>
    </>
  );
}
