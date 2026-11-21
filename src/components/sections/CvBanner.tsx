export default function CvBanner() {
  return (
    <>
    <section className="w-full bg-surface-container-low py-space-xl px-gutter-mobile lg:px-gutter">
      {"\n"}
      <div className="max-w-[1280px] mx-auto">
        {"\n"}
        {/* Zig-zag / Neo-Brutalist Starburst Action Banner Card */}
        {"\n"}
        <div className="relative bg-surface-container p-8 md:p-14 rounded-3xl border-4 border-secondary-container shadow-[8px_8px_0px_#080d22] overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-space-xl">
          {"\n"}
          {/* Decorative Starburst Icon in corner */}
          {"\n"}
          <div className="absolute -top-10 -right-10 pointer-events-none opacity-20">
            {"\n"}
            <svg className="w-48 h-48 text-secondary" fill="currentColor" viewBox="0 0 100 100">
              {"\n"}
              <polygon points="50,0 63,35 100,35 70,57 82,91 50,70 18,91 30,57 0,35 37,35"></polygon>
              {"\n"}
            </svg>
            {"\n"}
          </div>
          {"\n"}
          <div className="relative z-10 max-w-2xl text-center lg:text-left">
            {"\n"}
            <div className="inline-block bg-secondary text-on-secondary-container font-label-code-sm text-label-code-sm font-bold px-space-md py-space-xs rounded-lg border-2 border-surface-container-lowest shadow-[3px_3px_0px_#080d22] -rotate-2 mb-4">
              {"\n            Let's Collaborate ✦\n          "}
            </div>
            {"\n"}
            <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface leading-tight">
              {"\n            Ready to build something remarkable together?\n          "}
            </h2>
            {"\n"}
            <p className="font-body-lg text-body-lg text-on-surface-variant mt-3">
              {"\n            Open to senior engineering roles, creative web applications, and cutting-edge 3D interactive projects.\n          "}
            </p>
            {"\n"}
          </div>
          {"\n"}
          {/* Action Buttons */}
          {"\n"}
          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-space-md shrink-0 w-full sm:w-auto">
            {"\n"}
            {/* Download Full CV */}
            {"\n"}
            <button className="w-full sm:w-auto inline-flex items-center justify-center gap-space-sm font-label-code-lg text-label-code-lg bg-primary text-on-primary font-bold px-space-xl py-space-md rounded-xl border-2 border-surface-container-lowest shadow-[4px_4px_0px_#080d22] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#080d22] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all uppercase tracking-wider" type="button">
              {"\n"}
              <span className="material-symbols-outlined text-xl">
                {"download"}
              </span>
              {"\n"}
              <span>
                {"Download Full CV (PDF)"}
              </span>
              {"\n"}
            </button>
            {"\n"}
            {/* Copy Email Button */}
            {"\n"}
            <button className="w-full sm:w-auto inline-flex items-center justify-center gap-space-sm font-label-code-lg text-label-code-lg bg-surface-container-highest text-on-surface font-semibold px-space-lg py-space-md rounded-xl border-2 border-outline-variant shadow-[4px_4px_0px_#080d22] hover:bg-surface-bright transition-all" id="copy-email-btn" type="button">
              {"\n"}
              <span className="material-symbols-outlined text-xl">
                {"content_copy"}
              </span>
              {"\n"}
              <span id="copy-email-text">
                {"malay@ray.dev"}
              </span>
              {"\n"}
            </button>
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
