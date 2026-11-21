export default function DeskStage() {
  return (
    <>
    <section className="w-full bg-surface-container-lowest py-space-xl px-gutter-mobile lg:px-gutter" id="desk-stage">
      {"\n"}
      <div className="max-w-[1280px] mx-auto flex flex-col gap-space-lg">
        {"\n"}
        {/* Stage Section Header */}
        {"\n"}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
          {"\n"}
          <div>
            {"\n"}
            <div className="flex items-center gap-2">
              {"\n"}
              <span className="w-3 h-3 bg-tertiary rounded-full"></span>
              {"\n"}
              <span className="font-label-code-sm text-label-code-sm text-tertiary uppercase tracking-widest">
                {"3D Interactive Stage Anchor"}
              </span>
              {"\n"}
            </div>
            {"\n"}
            <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface mt-1">
              {"Malay's Work Desk Simulator"}
            </h2>
            {"\n"}
          </div>
          {"\n"}
          <div className="bg-surface-container-high px-space-md py-space-xs rounded-lg border-2 border-surface-variant">
            {"\n"}
            <span className="font-label-code-sm text-label-code-sm text-on-surface-variant">
              {"Three.js "}
              {"&"}
              {" R3F Scene Engine // Ready"}
            </span>
            {"\n"}
          </div>
          {"\n"}
        </div>
        {"\n"}
        {/* Main Stage Frame with Visual Landmarks */}
        {"\n"}
        <div className="relative w-full rounded-2xl bg-surface-container-low border-2 border-surface-variant shadow-[6px_6px_0px_#080d22] overflow-hidden p-6 md:p-10 min-h-[460px] flex flex-col justify-between">
          {"\n"}
          {/* Interactive Camera Controls Bar */}
          {"\n"}
          <div className="relative z-20 flex flex-wrap items-center gap-space-sm bg-surface-container-lowest/90 backdrop-blur-md p-space-xs rounded-xl border border-surface-variant self-start">
            {"\n"}
            <button className="desk-cam-btn px-space-sm py-space-xs rounded-lg bg-primary-container text-on-primary-container font-label-code-sm text-label-code-sm font-bold border-2 border-surface-container-lowest shadow-[2px_2px_0px_#080d22] hover:bg-primary transition-all" type="button">
              {"\n            Focus Laptop 💻\n          "}
            </button>
            {"\n"}
            <button className="desk-cam-btn px-space-sm py-space-xs rounded-lg bg-surface-container text-on-surface font-label-code-sm text-label-code-sm border border-outline-variant shadow-[2px_2px_0px_#080d22] hover:bg-surface-container-high transition-all" type="button">
              {"\n            Examine Violin 🎻\n          "}
            </button>
            {"\n"}
            <button className="desk-cam-btn px-space-sm py-space-xs rounded-lg bg-surface-container text-on-surface font-label-code-sm text-label-code-sm border border-outline-variant shadow-[2px_2px_0px_#080d22] hover:bg-surface-container-high transition-all" type="button">
              {"\n            Read CV 📄\n          "}
            </button>
            {"\n"}
            <button className="desk-cam-btn px-space-sm py-space-xs rounded-lg bg-surface-container text-tertiary font-label-code-sm text-label-code-sm border border-tertiary/40 shadow-[2px_2px_0px_#080d22] hover:bg-surface-container-high transition-all" type="button">
              {"\n            Reset Overview ↺\n          "}
            </button>
            {"\n"}
          </div>
          {"\n"}
          {/* Isometric Visual Desk Arrangement */}
          {"\n"}
          <div className="relative w-full my-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {"\n"}
            {/* Left: CV Paper Landmark */}
            {"\n"}
            <div className="md:col-span-3 flex flex-col items-center md:items-start">
              {"\n"}
              <div className="relative p-5 bg-surface-container-highest rounded-xl border-2 border-on-surface-variant/40 shadow-[4px_4px_0px_#080d22] -rotate-3 hover:rotate-0 transition-transform group cursor-pointer w-full max-w-[220px]">
                {"\n"}
                <div className="absolute -top-3 -right-3 bg-secondary text-on-secondary-container px-2 py-0.5 rounded text-[11px] font-label-code-sm font-bold border border-surface-container-lowest shadow-[2px_2px_0px_#080d22]">
                  {"\n                Take a copy ✦\n              "}
                </div>
                {"\n"}
                <div className="flex items-center gap-2 mb-3">
                  {"\n"}
                  <span className="material-symbols-outlined text-primary text-xl">
                    {"description"}
                  </span>
                  {"\n"}
                  <span className="font-label-code-sm text-label-code-sm text-on-surface font-bold">
                    {"Malay_Ray_CV.pdf"}
                  </span>
                  {"\n"}
                </div>
                {"\n"}
                <div className="space-y-1.5 opacity-60">
                  {"\n"}
                  <div className="h-2 bg-on-surface-variant rounded w-full"></div>
                  {"\n"}
                  <div className="h-2 bg-on-surface-variant rounded w-4/5"></div>
                  {"\n"}
                  <div className="h-2 bg-on-surface-variant rounded w-3/4"></div>
                  {"\n"}
                </div>
                {"\n"}
                <div className="mt-4 pt-3 border-t border-surface-variant flex items-center justify-between text-[11px] text-tertiary font-label-code-sm">
                  {"\n"}
                  <span>
                    {"Updated 2025"}
                  </span>
                  {"\n"}
                  <span className="material-symbols-outlined text-sm">
                    {"search"}
                  </span>
                  {"\n"}
                </div>
                {"\n"}
              </div>
              {"\n"}
            </div>
            {"\n"}
            {/* Center: Open MacBook Stage with Lid Stickers */}
            {"\n"}
            <div className="md:col-span-6 flex flex-col items-center">
              {"\n"}
              <div className="relative w-full max-w-[420px] aspect-[16/10] bg-surface-container-lowest rounded-t-2xl border-4 border-surface-bright shadow-[8px_8px_0px_#080d22] flex flex-col p-3 overflow-hidden">
                {"\n"}
                {/* Screen Top Bar */}
                {"\n"}
                <div className="flex items-center justify-between pb-2 border-b border-surface-variant mb-2">
                  {"\n"}
                  <div className="flex items-center gap-1.5">
                    {"\n"}
                    <span className="w-2.5 h-2.5 rounded-full bg-error"></span>
                    {"\n"}
                    <span className="w-2.5 h-2.5 rounded-full bg-tertiary-fixed"></span>
                    {"\n"}
                    <span className="w-2.5 h-2.5 rounded-full bg-tertiary"></span>
                    {"\n"}
                  </div>
                  {"\n"}
                  <span className="font-label-code-sm text-[11px] text-on-surface-variant">
                    {"three-renderer.tsx"}
                  </span>
                  {"\n"}
                  <span className="w-3"></span>
                  {"\n"}
                </div>
                {"\n"}
                {/* Screen Inside Matrix & Stickers on Glass */}
                {"\n"}
                <div className="relative flex-1 bg-surface-container rounded-lg p-3 flex flex-col justify-center items-center text-center overflow-hidden border border-outline-variant/30">
                  {"\n"}
                  <div className="font-label-code-sm text-xs text-tertiary mb-1">
                    {"FPS: 60.0 // R3F Canvas Pinned"}
                  </div>
                  {"\n"}
                  <div className="font-headline-sm text-headline-sm font-bold text-on-surface">
                    {"Interactive 3D Workspace"}
                  </div>
                  {"\n"}
                  <div className="mt-3 flex flex-wrap justify-center gap-1.5 max-w-xs">
                    {"\n"}
                    <span className="px-2 py-0.5 rounded text-[10px] font-label-code-sm bg-surface-container-highest border border-primary text-primary">
                      {"AWS S3"}
                    </span>
                    {"\n"}
                    <span className="px-2 py-0.5 rounded text-[10px] font-label-code-sm bg-surface-container-highest border border-secondary text-secondary">
                      {"Three.js"}
                    </span>
                    {"\n"}
                    <span className="px-2 py-0.5 rounded text-[10px] font-label-code-sm bg-surface-container-highest border border-tertiary text-tertiary">
                      {"Next.js 15"}
                    </span>
                    {"\n"}
                    <span className="px-2 py-0.5 rounded text-[10px] font-label-code-sm bg-surface-container-highest border border-primary-fixed text-primary-fixed">
                      {"Docker"}
                    </span>
                    {"\n"}
                  </div>
                  {"\n"}
                </div>
                {"\n"}
              </div>
              {"\n"}
              {/* Laptop Base/Keyboard */}
              {"\n"}
              <div className="w-full max-w-[480px] h-4 bg-surface-bright rounded-b-xl border-t-2 border-surface-variant shadow-[4px_4px_0px_#080d22]"></div>
              {"\n"}
            </div>
            {"\n"}
            {/* Right: Handcrafted Violin & Acoustic Waves Landmark */}
            {"\n"}
            <div className="md:col-span-3 flex flex-col items-center md:items-end">
              {"\n"}
              <div className="relative p-5 bg-surface-container-high rounded-xl border-2 border-secondary-container shadow-[4px_4px_0px_#080d22] rotate-2 hover:rotate-0 transition-transform group cursor-pointer w-full max-w-[220px]">
                {"\n"}
                <div className="flex items-center justify-between mb-2">
                  {"\n"}
                  <span className="font-label-code-sm text-label-code-sm font-bold text-secondary">
                    {"Acoustic Stand"}
                  </span>
                  {"\n"}
                  <span className="material-symbols-outlined text-secondary animate-pulse">
                    {"graphic_eq"}
                  </span>
                  {"\n"}
                </div>
                {"\n"}
                <div className="h-24 bg-surface-container rounded flex items-center justify-center border border-outline-variant/40 relative overflow-hidden">
                  {"\n"}
                  <span className="text-4xl">
                    {"🎻"}
                  </span>
                  {"\n"}
                  {/* Soundwave Rings */}
                  {"\n"}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    {"\n"}
                    <div className="w-16 h-16 rounded-full border border-secondary/30 animate-ping"></div>
                    {"\n"}
                  </div>
                  {"\n"}
                </div>
                {"\n"}
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-2 text-center">
                  {"Handcrafted 4/4 Violin "}
                  {"&"}
                  {" Carbon Bow"}
                </p>
                {"\n"}
              </div>
              {"\n"}
            </div>
            {"\n"}
          </div>
          {"\n"}
          {/* Explanatory Callout Footer */}
          {"\n"}
          <div className="relative z-20 flex flex-col sm:flex-row items-center justify-between gap-space-sm pt-4 border-t border-surface-variant">
            {"\n"}
            <div className="flex items-center gap-space-sm">
              {"\n"}
              <span className="material-symbols-outlined text-primary text-xl">
                {"view_in_ar"}
              </span>
              {"\n"}
              <span className="font-label-code-sm text-label-code-sm text-on-surface-variant">
                {"Phase 2 Preview: Scroll-driven 3D camera transitions powered by Three.js "}
                {"&"}
                {" R3F"}
              </span>
              {"\n"}
            </div>
            {"\n"}
            <span className="font-label-code-sm text-label-code-sm text-tertiary">
              {"WebGL 2.0 Canvas Enabled"}
            </span>
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
