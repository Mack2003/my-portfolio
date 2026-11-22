import SnakeRibbonClientWrapper from "@/components/SnakeRibbonClientWrapper";
import HeroCtaButtons from "./HeroCtaButtons";
import { portfolioData } from "@/data/portfolio";

export default function Hero() {
  return (
    <section id="hero" className="relative w-full bg-surface-container-lowest overflow-hidden min-h-[calc(100vh-4rem)] flex flex-col justify-center py-12 md:py-20 px-gutter-mobile lg:px-gutter">
      {/* Playful Neo-Brutalist Confetti & Blobs (Flat Solid Colors) */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        {/* Shape 1: Asterisk Sticker Top Right */}
        <div className="hero-asterisk absolute top-12 right-8 md:right-24">
          <svg className="w-16 h-16 text-secondary" fill="currentColor" viewBox="0 0 100 100">
            <path d="M42,10 L58,10 L58,38 L84,23 L92,37 L66,52 L92,67 L84,81 L58,66 L58,94 L42,94 L42,66 L16,81 L8,67 L34,52 L8,37 L16,23 L42,38 Z" />
          </svg>
        </div>

        {/* Shape 2: Solid Mint Circle Cutout */}
        <div className="hero-confetti-dot absolute top-1/3 left-6 md:left-16 w-8 h-8 rounded-full bg-tertiary-fixed-dim border-2 border-surface-container-lowest shadow-[3px_3px_0px_#242940]" />

        {/* Shape 3: Geometric Diamond */}
        <div className="hero-confetti-diamond absolute bottom-28 right-16 w-12 h-12 bg-primary-container border-2 border-surface-container-lowest hidden sm:block" />

        {/* Shape 4: Playful Squiggle */}
        <svg className="hero-squiggle absolute bottom-16 left-12 w-28 h-10 text-secondary hidden md:block" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="6" viewBox="0 0 120 40">
          <path className="hero-squiggle-path" d="M5 20 Q 20 5, 35 20 T 65 20 T 95 20 T 115 20" />
        </svg>
      </div>

      <div className="max-w-[1280px] mx-auto flex flex-col items-center text-center relative z-10 w-full">
        {/* Quick Status Badge */}
        <div className="inline-flex items-center gap-space-xs px-space-md py-space-xs bg-surface-container-high border-2 border-tertiary rounded-full shadow-[3px_3px_0px_#080d22] -rotate-1 mb-8 hover:rotate-0 transition-transform">
          <span className="w-2.5 h-2.5 rounded-full bg-tertiary animate-ping" aria-hidden="true" />
          <span className="font-label-code-sm text-label-code-sm text-tertiary uppercase tracking-wider font-semibold">
            {portfolioData.personal.availability}
          </span>
        </div>

        {/* Giant Playful Headline */}
        <h1 className="font-display text-[clamp(2.25rem,7.5vw,7.5rem)] font-extrabold tracking-tight text-on-surface leading-[1.08] max-w-5xl">
          Hey, I&apos;m{" "}
          <span className="hero-name relative inline-block text-primary">
            {portfolioData.personal.name.split(" ")[0]}!
            {/* Hand-drawn style highlighter underline SVG */}
            <svg className="absolute -bottom-2 md:-bottom-4 left-0 w-full h-4 md:h-6 text-secondary-fixed-dim" fill="none" preserveAspectRatio="none" viewBox="0 0 240 24">
              <path d="M4 18 C 50 8, 150 22, 236 12 C 180 20, 80 23, 10 20" fill="currentColor" stroke="currentColor" strokeLinecap="round" strokeWidth="6" />
            </svg>
          </span>{" "}
          <span aria-hidden="true" className="hero-wave-hand">👋</span>
        </h1>

        {/* Subtitle */}
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-3xl mt-8 leading-relaxed">
          Full-Stack Developer specializing in{" "}
          <span className="bg-surface-container-high px-2 py-0.5 rounded text-primary font-bold">
            React Native mobile apps
          </span>
          , Next.js web architectures,{" "}
          <span className="bg-surface-container-high px-2 py-0.5 rounded text-secondary font-bold">
            interactive 3D experiences
          </span>{" "}
          &amp; robust cloud backends.
        </p>

        {/* Scroll prompt CTA with expected semantic button elements */}
        <HeroCtaButtons />
      </div>

      {/* Confined completely inside Hero section */}
      <SnakeRibbonClientWrapper targetButtonId="inspect-project-btn" autoStart={true} />
    </section>
  );
}
