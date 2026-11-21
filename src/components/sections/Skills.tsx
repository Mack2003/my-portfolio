export default function Skills() {
  return (
    <>
    <section className="w-full bg-surface py-space-xl px-gutter-mobile lg:px-gutter" id="skills">
      {"\n"}
      <div className="max-w-[1280px] mx-auto flex flex-col gap-space-lg">
        {"\n"}
        {/* Section Title with playful sticker tags */}
        {"\n"}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-space-sm">
          {"\n"}
          <div>
            {"\n"}
            <span className="font-label-code-sm text-label-code-sm text-secondary uppercase tracking-widest block">
              {"Die-cut Vinyl Collection"}
            </span>
            {"\n"}
            <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface">
              {"Interactive Skills "}
              {"&"}
              {" Stickers"}
            </h2>
            {"\n"}
          </div>
          {"\n"}
          <div className="text-on-surface-variant font-label-code-sm text-label-code-sm">
            {"\n          Click any sticker to inspect production usage\n        "}
          </div>
          {"\n"}
        </div>
        {"\n"}
        {/* Sticker Categories Container */}
        {"\n"}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
          {"\n"}
          {/* Category 1: Cloud & Architecture */}
          {"\n"}
          <div className="bg-surface-container p-space-lg rounded-2xl border-2 border-surface-variant shadow-[5px_5px_0px_#080d22] flex flex-col justify-between">
            {"\n"}
            <div>
              {"\n"}
              <div className="flex items-center justify-between pb-space-sm border-b border-surface-variant mb-space-md">
                {"\n"}
                <span className="font-headline-sm text-headline-sm text-primary font-bold">
                  {"Cloud "}
                  {"&"}
                  {" DevOps"}
                </span>
                {"\n"}
                <span className="material-symbols-outlined text-primary">
                  {"cloud_queue"}
                </span>
                {"\n"}
              </div>
              {"\n"}
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
                {"Resilient distributed storage, serverless edge microservices, and containerization."}
              </p>
              {"\n"}
              {/* Stickers Stack */}
              {"\n"}
              <div className="flex flex-wrap gap-3">
                {"\n"}
                {/* Sticker: AWS S3 */}
                {"\n"}
                <div className="sticker-chip cursor-pointer bg-surface-container-high px-space-md py-space-xs rounded-lg border-2 border-primary text-on-surface font-label-code-sm text-label-code-sm font-bold shadow-[3px_3px_0px_#080d22] -rotate-3 hover:rotate-0 hover:scale-105 transition-all" data-proj="Used in CloudSync S3 Vault for automated multi-bucket replication.">
                  {"\n                AWS S3 🪣\n              "}
                </div>
                {"\n"}
                {/* Sticker: AWS Lambda */}
                {"\n"}
                <div className="sticker-chip cursor-pointer bg-surface-container-high px-space-md py-space-xs rounded-lg border-2 border-secondary text-on-surface font-label-code-sm text-label-code-sm font-bold shadow-[3px_3px_0px_#080d22] rotate-2 hover:rotate-0 hover:scale-105 transition-all" data-proj="Used for high-concurrency image re-encoding edge workers.">
                  {"\n                AWS Lambda ⚡\n              "}
                </div>
                {"\n"}
                {/* Sticker: Docker */}
                {"\n"}
                <div className="sticker-chip cursor-pointer bg-surface-container-high px-space-md py-space-xs rounded-lg border-2 border-tertiary text-on-surface font-label-code-sm text-label-code-sm font-bold shadow-[3px_3px_0px_#080d22] -rotate-2 hover:rotate-0 hover:scale-105 transition-all" data-proj="Used to package local development environments & microservice runtimes.">
                  {"\n                Docker 🐳\n              "}
                </div>
                {"\n"}
                {/* Sticker: API Gateway */}
                {"\n"}
                <div className="sticker-chip cursor-pointer bg-surface-container-high px-space-md py-space-xs rounded-lg border-2 border-outline text-on-surface font-label-code-sm text-label-code-sm font-bold shadow-[3px_3px_0px_#080d22] rotate-3 hover:rotate-0 hover:scale-105 transition-all" data-proj="Configured for REST & WebSocket real-time subscription routing.">
                  {"\n                API Gateway ⛩️\n              "}
                </div>
                {"\n"}
                {/* Sticker: Serverless */}
                {"\n"}
                <div className="sticker-chip cursor-pointer bg-surface-container-high px-space-md py-space-xs rounded-lg border-2 border-primary-fixed-dim text-on-surface font-label-code-sm text-label-code-sm font-bold shadow-[3px_3px_0px_#080d22] -rotate-1 hover:rotate-0 hover:scale-105 transition-all" data-proj="Zero-server maintenance architecture for edge-computed workloads.">
                  {"\n                Serverless ⚙️\n              "}
                </div>
                {"\n"}
              </div>
              {"\n"}
            </div>
            {"\n"}
          </div>
          {"\n"}
          {/* Category 2: Frontend & Interactive */}
          {"\n"}
          <div className="bg-surface-container p-space-lg rounded-2xl border-2 border-surface-variant shadow-[5px_5px_0px_#080d22] flex flex-col justify-between">
            {"\n"}
            <div>
              {"\n"}
              <div className="flex items-center justify-between pb-space-sm border-b border-surface-variant mb-space-md">
                {"\n"}
                <span className="font-headline-sm text-headline-sm text-tertiary font-bold">
                  {"Frontend "}
                  {"&"}
                  {" 3D"}
                </span>
                {"\n"}
                <span className="material-symbols-outlined text-tertiary">
                  {"devices"}
                </span>
                {"\n"}
              </div>
              {"\n"}
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
                {"High-speed React architectures, mobile apps, and interactive canvas graphics."}
              </p>
              {"\n"}
              {/* Stickers Stack */}
              {"\n"}
              <div className="flex flex-wrap gap-3">
                {"\n"}
                {/* Sticker: Next.js */}
                {"\n"}
                <div className="sticker-chip cursor-pointer bg-surface-container-high px-space-md py-space-xs rounded-lg border-2 border-tertiary text-on-surface font-label-code-sm text-label-code-sm font-bold shadow-[3px_3px_0px_#080d22] rotate-3 hover:rotate-0 hover:scale-105 transition-all" data-proj="Core framework for this portfolio and production client web platforms.">
                  {"\n                Next.js 15 ▲\n              "}
                </div>
                {"\n"}
                {/* Sticker: Three.js */}
                {"\n"}
                <div className="sticker-chip cursor-pointer bg-surface-container-high px-space-md py-space-xs rounded-lg border-2 border-primary text-on-surface font-label-code-sm text-label-code-sm font-bold shadow-[3px_3px_0px_#080d22] -rotate-3 hover:rotate-0 hover:scale-105 transition-all" data-proj="Renders 3D intonation models in AcousticTuner & Desk Stage.">
                  {"\n                Three.js 🧊\n              "}
                </div>
                {"\n"}
                {/* Sticker: React Native */}
                {"\n"}
                <div className="sticker-chip cursor-pointer bg-surface-container-high px-space-md py-space-xs rounded-lg border-2 border-secondary text-on-surface font-label-code-sm text-label-code-sm font-bold shadow-[3px_3px_0px_#080d22] rotate-1 hover:rotate-0 hover:scale-105 transition-all" data-proj="Engineered cross-platform mobile apps for iOS & Android.">
                  {"\n                React Native 📱\n              "}
                </div>
                {"\n"}
                {/* Sticker: Tailwind CSS */}
                {"\n"}
                <div className="sticker-chip cursor-pointer bg-surface-container-high px-space-md py-space-xs rounded-lg border-2 border-primary-container text-on-surface font-label-code-sm text-label-code-sm font-bold shadow-[3px_3px_0px_#080d22] -rotate-2 hover:rotate-0 hover:scale-105 transition-all" data-proj="Crafted custom neo-brutalist theme tokens & responsive layouts.">
                  {"\n                Tailwind CSS 🎨\n              "}
                </div>
                {"\n"}
                {/* Sticker: Phaser */}
                {"\n"}
                <div className="sticker-chip cursor-pointer bg-surface-container-high px-space-md py-space-xs rounded-lg border-2 border-secondary-fixed-dim text-on-surface font-label-code-sm text-label-code-sm font-bold shadow-[3px_3px_0px_#080d22] rotate-4 hover:rotate-0 hover:scale-105 transition-all" data-proj="Powers arcade physics in Habit Catcher and game prototypes.">
                  {"\n                Phaser 3 🕹️\n              "}
                </div>
                {"\n"}
              </div>
              {"\n"}
            </div>
            {"\n"}
          </div>
          {"\n"}
          {/* Category 3: Languages & Runtimes */}
          {"\n"}
          <div className="bg-surface-container p-space-lg rounded-2xl border-2 border-surface-variant shadow-[5px_5px_0px_#080d22] flex flex-col justify-between">
            {"\n"}
            <div>
              {"\n"}
              <div className="flex items-center justify-between pb-space-sm border-b border-surface-variant mb-space-md">
                {"\n"}
                <span className="font-headline-sm text-headline-sm text-secondary font-bold">
                  {"Languages"}
                </span>
                {"\n"}
                <span className="material-symbols-outlined text-secondary">
                  {"code"}
                </span>
                {"\n"}
              </div>
              {"\n"}
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
                {"Strongly typed codebases, hardware shaders, and high-performance script runtimes."}
              </p>
              {"\n"}
              {/* Stickers Stack */}
              {"\n"}
              <div className="flex flex-wrap gap-3">
                {"\n"}
                {/* Sticker: TypeScript */}
                {"\n"}
                <div className="sticker-chip cursor-pointer bg-surface-container-high px-space-md py-space-xs rounded-lg border-2 border-primary text-on-surface font-label-code-sm text-label-code-sm font-bold shadow-[3px_3px_0px_#080d22] -rotate-2 hover:rotate-0 hover:scale-105 transition-all" data-proj="Primary language across entire stack with strict type-safety.">
                  {"\n                TypeScript 🔷\n              "}
                </div>
                {"\n"}
                {/* Sticker: Python */}
                {"\n"}
                <div className="sticker-chip cursor-pointer bg-surface-container-high px-space-md py-space-xs rounded-lg border-2 border-secondary text-on-surface font-label-code-sm text-label-code-sm font-bold shadow-[3px_3px_0px_#080d22] rotate-3 hover:rotate-0 hover:scale-105 transition-all" data-proj="Used for DSP frequency analysis scripts & Lambda automation.">
                  {"\n                Python 🐍\n              "}
                </div>
                {"\n"}
                {/* Sticker: GLSL */}
                {"\n"}
                <div className="sticker-chip cursor-pointer bg-surface-container-high px-space-md py-space-xs rounded-lg border-2 border-tertiary text-on-surface font-label-code-sm text-label-code-sm font-bold shadow-[3px_3px_0px_#080d22] -rotate-3 hover:rotate-0 hover:scale-105 transition-all" data-proj="Written custom vertex and fragment shaders for wave visuals.">
                  {"\n                GLSL Shaders 🌌\n              "}
                </div>
                {"\n"}
                {/* Sticker: Node.js */}
                {"\n"}
                <div className="sticker-chip cursor-pointer bg-surface-container-high px-space-md py-space-xs rounded-lg border-2 border-tertiary-fixed-dim text-on-surface font-label-code-sm text-label-code-sm font-bold shadow-[3px_3px_0px_#080d22] rotate-2 hover:rotate-0 hover:scale-105 transition-all" data-proj="Event-driven async API microservices and build scripting.">
                  {"\n                Node.js 🟢\n              "}
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
        {/* Live Sticker Highlight Banner (Interactive Popup) */}
        {"\n"}
        <div className="bg-surface-container-high border-2 border-primary p-space-md rounded-xl flex items-center gap-space-md shadow-[4px_4px_0px_#080d22] transition-all" id="sticker-banner">
          {"\n"}
          <span className="material-symbols-outlined text-primary text-2xl">
            {"info"}
          </span>
          {"\n"}
          <div className="min-w-0">
            {"\n"}
            <span className="font-label-code-sm text-label-code-sm text-primary uppercase block">
              {"Sticker Inspector"}
            </span>
            {"\n"}
            <span className="font-body-md text-body-md text-on-surface" id="sticker-detail-text">
              {"Click any skill sticker above to view real production architecture details."}
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
