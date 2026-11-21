/* eslint-disable @next/next/no-img-element */

export default function About() {
  return (
    <>
    <section className="w-full bg-surface-container-low py-space-xl px-gutter-mobile lg:px-gutter relative" id="about">
      {"\n"}
      <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {"\n"}
        {/* Left Column: Organic blob frame portrait with sticker callouts */}
        {"\n"}
        <div className="lg:col-span-5 flex justify-center relative">
          {"\n"}
          {/* Sticker 1: Creative Coder */}
          {"\n"}
          <div className="absolute -top-4 -left-2 z-20 bg-secondary text-on-secondary-container font-label-code-sm text-label-code-sm px-space-md py-space-xs rounded-lg border-2 border-surface-container-lowest shadow-[3px_3px_0px_#080d22] -rotate-6 hover:rotate-0 transition-transform">
            {"\n          Creative Coder 🚀\n        "}
          </div>
          {"\n"}
          {/* Sticker 2: Problem Solver */}
          {"\n"}
          <div className="absolute bottom-6 -left-6 z-20 bg-primary-container text-on-primary-fixed font-label-code-sm text-label-code-sm px-space-md py-space-xs rounded-lg border-2 border-surface-container-lowest shadow-[3px_3px_0px_#080d22] rotate-3 hover:rotate-0 transition-transform">
            {"\n          Problem Solver ⚡\n        "}
          </div>
          {"\n"}
          {/* Sticker 3: Violinist */}
          {"\n"}
          <div className="absolute top-1/2 -right-6 z-20 bg-tertiary-fixed text-on-tertiary-fixed font-label-code-sm text-label-code-sm px-space-md py-space-xs rounded-lg border-2 border-surface-container-lowest shadow-[3px_3px_0px_#080d22] rotate-6 hover:rotate-0 transition-transform">
            {"\n          Violinist 🎻\n        "}
          </div>
          {"\n"}
          {/* Blob Portrait Canvas Holder */}
          {"\n"}
          <div className="relative w-72 h-72 sm:w-88 sm:h-88 p-2 rounded-[2.5rem] bg-surface-container-high border-4 border-tertiary shadow-[8px_8px_0px_#080d22] hover:-rotate-1 transition-transform group">
            {"\n"}
            <div className="w-full h-full rounded-[2rem] overflow-hidden bg-surface-container-lowest border-2 border-primary-container">
              {"\n"}
              <img alt="Malay Ray Portrait" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA2E5T3k5Dncm6XS2V0UqdIv-jKC-RqsDpLokl-HZ9EO1rg_KCWbP8C7wlGysUZZmzDLiCk6OMkvW4m-Jt-1nKUHsGTcaFuxcuhV3MwArxWJ-GGITEpiVUHoUCsVY9mr1vTJrJArmEwen2sxovDpuuvWvthGYbyfhQK1sLWPRQ0f0ys-8LneFrnhiADuUL27Zoa5bwqCqQC-pQ7PReTR-fk9bB2IXFBIPKlIQZqYR4z" />
              {"\n"}
            </div>
            {"\n"}
          </div>
          {"\n"}
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
                {"About Me"}
              </h2>
              {"\n"}
              <div className="h-2 w-full bg-secondary-container rounded-full mt-1"></div>
              {"\n"}
            </div>
            {"\n"}
            <p className="font-body-lg text-body-lg text-on-surface mt-4 leading-relaxed">
              {"\n            I engineer interfaces where "}
              <strong className="text-tertiary">
                {"precision engineering"}
              </strong>
              {" meets boundless curiosity. When I'm not orchestrating cloud pipelines or building React Native apps, you'll find me practicing violin concertos or crafting physics-driven browser games.\n          "}
            </p>
            {"\n"}
          </div>
          {"\n"}
          {/* Quick Facts Tickets in solid night-700 / surface-container */}
          {"\n"}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md pt-2">
            {"\n"}
            {/* Fact 1 */}
            {"\n"}
            <div className="bg-surface-container p-space-md rounded-xl border-2 border-surface-variant shadow-[4px_4px_0px_#080d22] flex items-start gap-space-sm hover:border-primary transition-colors">
              {"\n"}
              <span className="material-symbols-outlined text-primary text-2xl mt-0.5">
                {"location_on"}
              </span>
              {"\n"}
              <div className="min-w-0">
                {"\n"}
                <span className="font-label-code-sm text-label-code-sm text-on-surface-variant uppercase tracking-wider block">
                  {"Base / Relocation"}
                </span>
                {"\n"}
                <p className="font-headline-sm text-headline-sm text-on-surface">
                  {"San Francisco / Remote"}
                </p>
                {"\n"}
              </div>
              {"\n"}
            </div>
            {"\n"}
            {/* Fact 2 */}
            {"\n"}
            <div className="bg-surface-container p-space-md rounded-xl border-2 border-surface-variant shadow-[4px_4px_0px_#080d22] flex items-start gap-space-sm hover:border-tertiary transition-colors">
              {"\n"}
              <span className="material-symbols-outlined text-tertiary text-2xl mt-0.5">
                {"military_tech"}
              </span>
              {"\n"}
              <div className="min-w-0">
                {"\n"}
                <span className="font-label-code-sm text-label-code-sm text-on-surface-variant uppercase tracking-wider block">
                  {"Experience"}
                </span>
                {"\n"}
                <p className="font-headline-sm text-headline-sm text-on-surface">
                  {"5+ Years Full-Stack"}
                </p>
                {"\n"}
              </div>
              {"\n"}
            </div>
            {"\n"}
            {/* Fact 3 */}
            {"\n"}
            <div className="bg-surface-container p-space-md rounded-xl border-2 border-surface-variant shadow-[4px_4px_0px_#080d22] flex items-start gap-space-sm hover:border-secondary transition-colors">
              {"\n"}
              <span className="material-symbols-outlined text-secondary text-2xl mt-0.5">
                {"deployed_code"}
              </span>
              {"\n"}
              <div className="min-w-0">
                {"\n"}
                <span className="font-label-code-sm text-label-code-sm text-on-surface-variant uppercase tracking-wider block">
                  {"Core Architecture"}
                </span>
                {"\n"}
                <p className="font-body-md text-body-md text-on-surface font-bold">
                  {"Next.js, AWS S3/Edge, WebGL"}
                </p>
                {"\n"}
              </div>
              {"\n"}
            </div>
            {"\n"}
            {/* Fact 4 */}
            {"\n"}
            <div className="bg-surface-container p-space-md rounded-xl border-2 border-surface-variant shadow-[4px_4px_0px_#080d22] flex items-start gap-space-sm hover:border-primary-fixed-dim transition-colors">
              {"\n"}
              <span className="material-symbols-outlined text-primary-fixed-dim text-2xl mt-0.5">
                {"sports_esports"}
              </span>
              {"\n"}
              <div className="min-w-0">
                {"\n"}
                <span className="font-label-code-sm text-label-code-sm text-on-surface-variant uppercase tracking-wider block">
                  {"Current Obsession"}
                </span>
                {"\n"}
                <p className="font-body-md text-body-md text-on-surface font-bold">
                  {"Phaser 3 "}
                  {"&"}
                  {" Web Audio DSP"}
                </p>
                {"\n"}
              </div>
              {"\n"}
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
