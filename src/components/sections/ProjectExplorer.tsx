export default function ProjectExplorer() {
  return (
    <>
    <section className="w-full bg-surface-container-low py-space-xl px-gutter-mobile lg:px-gutter" id="projects">
      {"\n"}
      <div className="max-w-[1280px] mx-auto flex flex-col gap-space-lg">
        {"\n"}
        {/* MalayOS Window Frame */}
        {"\n"}
        <div className="w-full bg-surface-container rounded-2xl border-2 border-surface-variant shadow-[8px_8px_0px_#080d22] overflow-hidden">
          {"\n"}
          {/* OS Title Bar */}
          {"\n"}
          <div className="bg-surface-container-high px-space-md py-3 flex items-center justify-between border-b-2 border-surface-variant">
            {"\n"}
            <div className="flex items-center gap-2">
              {"\n"}
              {/* Window Control Dots (coral, sunny, mint) */}
              {"\n"}
              <span className="w-3.5 h-3.5 rounded-full bg-error border border-surface-container-lowest"></span>
              {"\n"}
              <span className="w-3.5 h-3.5 rounded-full bg-secondary border border-surface-container-lowest"></span>
              {"\n"}
              <span className="w-3.5 h-3.5 rounded-full bg-tertiary border border-surface-container-lowest"></span>
              {"\n"}
            </div>
            {"\n"}
            {/* Terminal Path */}
            {"\n"}
            <div className="flex items-center gap-2 font-label-code-sm text-label-code-sm text-on-surface">
              {"\n"}
              <span className="material-symbols-outlined text-base text-primary">
                {"folder_open"}
              </span>
              {"\n"}
              <span>
                {"MalayOS ~/Projects/Featured"}
              </span>
              {"\n"}
            </div>
            {"\n"}
            <div className="hidden sm:flex items-center gap-2 font-label-code-sm text-label-code-sm text-on-surface-variant">
              {"\n"}
              <span>
                {"4 items"}
              </span>
              {"\n"}
            </div>
            {"\n"}
          </div>
          {"\n"}
          {/* OS Content Area */}
          {"\n"}
          <div className="p-space-lg grid grid-cols-1 md:grid-cols-2 gap-space-lg">
            {"\n"}
            {/* Project 1: CloudSync S3 Vault */}
            {"\n"}
            <div className="bg-surface-container-lowest p-space-lg rounded-xl border-2 border-surface-variant shadow-[4px_4px_0px_#080d22] hover:border-primary transition-all flex flex-col justify-between group">
              {"\n"}
              <div>
                {"\n"}
                <div className="flex items-start justify-between gap-space-sm mb-space-sm">
                  {"\n"}
                  <div className="flex items-center gap-space-sm">
                    {"\n"}
                    <span className="p-2 rounded-lg bg-surface-container text-primary">
                      {"\n"}
                      <span className="material-symbols-outlined text-2xl">
                        {"cloud_sync"}
                      </span>
                      {"\n"}
                    </span>
                    {"\n"}
                    <div>
                      {"\n"}
                      <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface group-hover:text-primary transition-colors">
                        {"CloudSync S3 Vault"}
                      </h3>
                      {"\n"}
                      <span className="font-label-code-sm text-label-code-sm text-primary">
                        {"AWS Architecture "}
                        {"&"}
                        {" Storage"}
                      </span>
                      {"\n"}
                    </div>
                    {"\n"}
                  </div>
                  {"\n"}
                  <span className="px-2 py-0.5 rounded text-[11px] font-label-code-sm bg-surface-container-high border border-outline text-on-surface-variant">
                    {"Production"}
                  </span>
                  {"\n"}
                </div>
                {"\n"}
                <p className="font-body-md text-body-md text-on-surface-variant mt-space-sm">
                  {"\n                Enterprise asset manager featuring multi-region AWS S3 replication, presigned upload URLs, and zero-cold-start AWS Lambda edge workers for automated asset normalization.\n              "}
                </p>
                {"\n"}
                {/* Tech Chips */}
                {"\n"}
                <div className="flex flex-wrap gap-2 mt-space-md">
                  {"\n"}
                  <span className="font-label-code-sm text-label-code-sm px-space-sm py-0.5 rounded bg-surface-container text-on-surface border border-outline-variant">
                    {"AWS S3"}
                  </span>
                  {"\n"}
                  <span className="font-label-code-sm text-label-code-sm px-space-sm py-0.5 rounded bg-surface-container text-on-surface border border-outline-variant">
                    {"AWS Lambda"}
                  </span>
                  {"\n"}
                  <span className="font-label-code-sm text-label-code-sm px-space-sm py-0.5 rounded bg-surface-container text-on-surface border border-outline-variant">
                    {"Next.js"}
                  </span>
                  {"\n"}
                  <span className="font-label-code-sm text-label-code-sm px-space-sm py-0.5 rounded bg-surface-container text-on-surface border border-outline-variant">
                    {"TypeScript"}
                  </span>
                  {"\n"}
                </div>
                {"\n"}
              </div>
              {"\n"}
              <div className="flex items-center gap-space-md mt-space-lg pt-space-md border-t border-surface-variant">
                {"\n"}
                <a className="inline-flex items-center gap-1 font-label-code-sm text-label-code-sm text-primary hover:text-primary-fixed-dim transition-colors" href="#">
                  {"\n"}
                  <span>
                    {"View Architecture"}
                  </span>
                  {"\n"}
                  <span className="material-symbols-outlined text-sm">
                    {"arrow_forward"}
                  </span>
                  {"\n"}
                </a>
                {"\n"}
                <a className="inline-flex items-center gap-1 font-label-code-sm text-label-code-sm text-on-surface-variant hover:text-on-surface transition-colors" href="#">
                  {"\n"}
                  <span>
                    {"GitHub"}
                  </span>
                  {"\n"}
                  <span className="material-symbols-outlined text-sm">
                    {"open_in_new"}
                  </span>
                  {"\n"}
                </a>
                {"\n"}
              </div>
              {"\n"}
            </div>
            {"\n"}
            {/* Project 2: AcousticTuner 3D */}
            {"\n"}
            <div className="bg-surface-container-lowest p-space-lg rounded-xl border-2 border-surface-variant shadow-[4px_4px_0px_#080d22] hover:border-tertiary transition-all flex flex-col justify-between group">
              {"\n"}
              <div>
                {"\n"}
                <div className="flex items-start justify-between gap-space-sm mb-space-sm">
                  {"\n"}
                  <div className="flex items-center gap-space-sm">
                    {"\n"}
                    <span className="p-2 rounded-lg bg-surface-container text-tertiary">
                      {"\n"}
                      <span className="material-symbols-outlined text-2xl">
                        {"graphic_eq"}
                      </span>
                      {"\n"}
                    </span>
                    {"\n"}
                    <div>
                      {"\n"}
                      <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface group-hover:text-tertiary transition-colors">
                        {"AcousticTuner 3D"}
                      </h3>
                      {"\n"}
                      <span className="font-label-code-sm text-label-code-sm text-tertiary">
                        {"Web Audio "}
                        {"&"}
                        {" Three.js"}
                      </span>
                      {"\n"}
                    </div>
                    {"\n"}
                  </div>
                  {"\n"}
                  <span className="px-2 py-0.5 rounded text-[11px] font-label-code-sm bg-surface-container-high border border-outline text-on-surface-variant">
                    {"Live App"}
                  </span>
                  {"\n"}
                </div>
                {"\n"}
                <p className="font-body-md text-body-md text-on-surface-variant mt-space-sm">
                  {"\n                Real-time pitch detector and 3D violin fingerboard intonation visualizer. Utilizes FFT frequency parsing via Web Audio API and custom Three.js harmonic resonance feedback.\n              "}
                </p>
                {"\n"}
                {/* Tech Chips */}
                {"\n"}
                <div className="flex flex-wrap gap-2 mt-space-md">
                  {"\n"}
                  <span className="font-label-code-sm text-label-code-sm px-space-sm py-0.5 rounded bg-surface-container text-on-surface border border-outline-variant">
                    {"Web Audio API"}
                  </span>
                  {"\n"}
                  <span className="font-label-code-sm text-label-code-sm px-space-sm py-0.5 rounded bg-surface-container text-on-surface border border-outline-variant">
                    {"Three.js"}
                  </span>
                  {"\n"}
                  <span className="font-label-code-sm text-label-code-sm px-space-sm py-0.5 rounded bg-surface-container text-on-surface border border-outline-variant">
                    {"FFT DSP"}
                  </span>
                  {"\n"}
                  <span className="font-label-code-sm text-label-code-sm px-space-sm py-0.5 rounded bg-surface-container text-on-surface border border-outline-variant">
                    {"Canvas 2D"}
                  </span>
                  {"\n"}
                </div>
                {"\n"}
              </div>
              {"\n"}
              <div className="flex items-center gap-space-md mt-space-lg pt-space-md border-t border-surface-variant">
                {"\n"}
                <a className="inline-flex items-center gap-1 font-label-code-sm text-label-code-sm text-tertiary hover:text-tertiary-fixed-dim transition-colors" href="#">
                  {"\n"}
                  <span>
                    {"Launch Tuner"}
                  </span>
                  {"\n"}
                  <span className="material-symbols-outlined text-sm">
                    {"play_arrow"}
                  </span>
                  {"\n"}
                </a>
                {"\n"}
                <a className="inline-flex items-center gap-1 font-label-code-sm text-label-code-sm text-on-surface-variant hover:text-on-surface transition-colors" href="#">
                  {"\n"}
                  <span>
                    {"GitHub"}
                  </span>
                  {"\n"}
                  <span className="material-symbols-outlined text-sm">
                    {"open_in_new"}
                  </span>
                  {"\n"}
                </a>
                {"\n"}
              </div>
              {"\n"}
            </div>
            {"\n"}
            {/* Project 3: HabitPulse Native */}
            {"\n"}
            <div className="bg-surface-container-lowest p-space-lg rounded-xl border-2 border-surface-variant shadow-[4px_4px_0px_#080d22] hover:border-secondary transition-all flex flex-col justify-between group">
              {"\n"}
              <div>
                {"\n"}
                <div className="flex items-start justify-between gap-space-sm mb-space-sm">
                  {"\n"}
                  <div className="flex items-center gap-space-sm">
                    {"\n"}
                    <span className="p-2 rounded-lg bg-surface-container text-secondary">
                      {"\n"}
                      <span className="material-symbols-outlined text-2xl">
                        {"smartphone"}
                      </span>
                      {"\n"}
                    </span>
                    {"\n"}
                    <div>
                      {"\n"}
                      <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface group-hover:text-secondary transition-colors">
                        {"HabitPulse Native"}
                      </h3>
                      {"\n"}
                      <span className="font-label-code-sm text-label-code-sm text-secondary">
                        {"Mobile "}
                        {"&"}
                        {" Local First"}
                      </span>
                      {"\n"}
                    </div>
                    {"\n"}
                  </div>
                  {"\n"}
                  <span className="px-2 py-0.5 rounded text-[11px] font-label-code-sm bg-surface-container-high border border-outline text-on-surface-variant">
                    {"iOS / Android"}
                  </span>
                  {"\n"}
                </div>
                {"\n"}
                <p className="font-body-md text-body-md text-on-surface-variant mt-space-sm">
                  {"\n                Cross-platform micro-habits tracker featuring SQLite local-first sync, haptic vibration curves, and offline-first streak reconciliation algorithms.\n              "}
                </p>
                {"\n"}
                {/* Tech Chips */}
                {"\n"}
                <div className="flex flex-wrap gap-2 mt-space-md">
                  {"\n"}
                  <span className="font-label-code-sm text-label-code-sm px-space-sm py-0.5 rounded bg-surface-container text-on-surface border border-outline-variant">
                    {"React Native"}
                  </span>
                  {"\n"}
                  <span className="font-label-code-sm text-label-code-sm px-space-sm py-0.5 rounded bg-surface-container text-on-surface border border-outline-variant">
                    {"Expo SDK"}
                  </span>
                  {"\n"}
                  <span className="font-label-code-sm text-label-code-sm px-space-sm py-0.5 rounded bg-surface-container text-on-surface border border-outline-variant">
                    {"SQLite"}
                  </span>
                  {"\n"}
                  <span className="font-label-code-sm text-label-code-sm px-space-sm py-0.5 rounded bg-surface-container text-on-surface border border-outline-variant">
                    {"TypeScript"}
                  </span>
                  {"\n"}
                </div>
                {"\n"}
              </div>
              {"\n"}
              <div className="flex items-center gap-space-md mt-space-lg pt-space-md border-t border-surface-variant">
                {"\n"}
                <a className="inline-flex items-center gap-1 font-label-code-sm text-label-code-sm text-secondary hover:text-secondary-fixed transition-colors" href="#">
                  {"\n"}
                  <span>
                    {"View App Store"}
                  </span>
                  {"\n"}
                  <span className="material-symbols-outlined text-sm">
                    {"arrow_forward"}
                  </span>
                  {"\n"}
                </a>
                {"\n"}
                <a className="inline-flex items-center gap-1 font-label-code-sm text-label-code-sm text-on-surface-variant hover:text-on-surface transition-colors" href="#">
                  {"\n"}
                  <span>
                    {"GitHub"}
                  </span>
                  {"\n"}
                  <span className="material-symbols-outlined text-sm">
                    {"open_in_new"}
                  </span>
                  {"\n"}
                </a>
                {"\n"}
              </div>
              {"\n"}
            </div>
            {"\n"}
            {/* Project 4: Phaser Quest Arcade */}
            {"\n"}
            <div className="bg-surface-container-lowest p-space-lg rounded-xl border-2 border-surface-variant shadow-[4px_4px_0px_#080d22] hover:border-primary-fixed-dim transition-all flex flex-col justify-between group">
              {"\n"}
              <div>
                {"\n"}
                <div className="flex items-start justify-between gap-space-sm mb-space-sm">
                  {"\n"}
                  <div className="flex items-center gap-space-sm">
                    {"\n"}
                    <span className="p-2 rounded-lg bg-surface-container text-primary-fixed-dim">
                      {"\n"}
                      <span className="material-symbols-outlined text-2xl">
                        {"sports_esports"}
                      </span>
                      {"\n"}
                    </span>
                    {"\n"}
                    <div>
                      {"\n"}
                      <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface group-hover:text-primary-fixed-dim transition-colors">
                        {"Phaser Quest Arcade"}
                      </h3>
                      {"\n"}
                      <span className="font-label-code-sm text-label-code-sm text-primary-fixed-dim">
                        {"Game Engine "}
                        {"&"}
                        {" WebGL"}
                      </span>
                      {"\n"}
                    </div>
                    {"\n"}
                  </div>
                  {"\n"}
                  <span className="px-2 py-0.5 rounded text-[11px] font-label-code-sm bg-surface-container-high border border-outline text-on-surface-variant">
                    {"Retro 16-Bit"}
                  </span>
                  {"\n"}
                </div>
                {"\n"}
                <p className="font-body-md text-body-md text-on-surface-variant mt-space-sm">
                  {"\n                16-bit browser roguelike runner built with Phaser 3, WebGL particle shaders, dynamic tilemaps, and an interactive 8-bit chiptune sound generator.\n              "}
                </p>
                {"\n"}
                {/* Tech Chips */}
                {"\n"}
                <div className="flex flex-wrap gap-2 mt-space-md">
                  {"\n"}
                  <span className="font-label-code-sm text-label-code-sm px-space-sm py-0.5 rounded bg-surface-container text-on-surface border border-outline-variant">
                    {"Phaser 3"}
                  </span>
                  {"\n"}
                  <span className="font-label-code-sm text-label-code-sm px-space-sm py-0.5 rounded bg-surface-container text-on-surface border border-outline-variant">
                    {"WebGL"}
                  </span>
                  {"\n"}
                  <span className="font-label-code-sm text-label-code-sm px-space-sm py-0.5 rounded bg-surface-container text-on-surface border border-outline-variant">
                    {"Arcade Physics"}
                  </span>
                  {"\n"}
                  <span className="font-label-code-sm text-label-code-sm px-space-sm py-0.5 rounded bg-surface-container text-on-surface border border-outline-variant">
                    {"Web Audio"}
                  </span>
                  {"\n"}
                </div>
                {"\n"}
              </div>
              {"\n"}
              <div className="flex items-center gap-space-md mt-space-lg pt-space-md border-t border-surface-variant">
                {"\n"}
                <a className="inline-flex items-center gap-1 font-label-code-sm text-label-code-sm text-primary-fixed-dim hover:text-primary-fixed transition-colors" href="#">
                  {"\n"}
                  <span>
                    {"Play Game"}
                  </span>
                  {"\n"}
                  <span className="material-symbols-outlined text-sm">
                    {"sports_esports"}
                  </span>
                  {"\n"}
                </a>
                {"\n"}
                <a className="inline-flex items-center gap-1 font-label-code-sm text-label-code-sm text-on-surface-variant hover:text-on-surface transition-colors" href="#">
                  {"\n"}
                  <span>
                    {"GitHub"}
                  </span>
                  {"\n"}
                  <span className="material-symbols-outlined text-sm">
                    {"open_in_new"}
                  </span>
                  {"\n"}
                </a>
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
