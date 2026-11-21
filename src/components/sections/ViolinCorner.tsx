export default function ViolinCorner() {
  return (
    <>
    <section className="w-full bg-surface-container-low py-space-xl px-gutter-mobile lg:px-gutter relative overflow-hidden" id="violin">
      {"\n"}
      {/* Acoustic Staff Lines SVG overlay in background */}
      {"\n"}
      <div className="absolute inset-0 pointer-events-none opacity-10 flex flex-col justify-around py-10">
        {"\n"}
        <div className="w-full h-0.5 bg-secondary"></div>
        {"\n"}
        <div className="w-full h-0.5 bg-secondary"></div>
        {"\n"}
        <div className="w-full h-0.5 bg-secondary"></div>
        {"\n"}
        <div className="w-full h-0.5 bg-secondary"></div>
        {"\n"}
        <div className="w-full h-0.5 bg-secondary"></div>
        {"\n"}
      </div>
      {"\n"}
      <div className="max-w-[1280px] mx-auto flex flex-col gap-space-lg relative z-10">
        {"\n"}
        {/* Section Title & Streak Badge */}
        {"\n"}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
          {"\n"}
          <div>
            {"\n"}
            <div className="flex items-center gap-2">
              {"\n"}
              <span className="text-secondary text-xl">
                {"🎻"}
              </span>
              {"\n"}
              <span className="font-label-code-sm text-label-code-sm text-secondary uppercase tracking-widest">
                {"Classical Musician Corner"}
              </span>
              {"\n"}
            </div>
            {"\n"}
            <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface mt-1">
              {"Violin Improvisations "}
              {"&"}
              {" Audio Lab"}
            </h2>
            {"\n"}
          </div>
          {"\n"}
          {/* Practice Streak Badge */}
          {"\n"}
          <div className="inline-flex items-center gap-space-sm bg-secondary-container text-on-secondary-container px-space-md py-space-xs rounded-xl border-2 border-surface-container-lowest shadow-[4px_4px_0px_#080d22] -rotate-1">
            {"\n"}
            <span className="material-symbols-outlined text-xl">
              {"local_fire_department"}
            </span>
            {"\n"}
            <span className="font-label-code-lg text-label-code-lg font-bold">
              {"Practice Streak: 420 Days 🎻"}
            </span>
            {"\n"}
          </div>
          {"\n"}
        </div>
        {"\n"}
        {/* Main Soundboard & Journey Grid */}
        {"\n"}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
          {"\n"}
          {/* Left: Interactive Soundboard Player Card */}
          {"\n"}
          <div className="lg:col-span-7 bg-surface-container p-space-lg rounded-2xl border-2 border-surface-variant shadow-[6px_6px_0px_#080d22] flex flex-col justify-between">
            {"\n"}
            <div>
              {"\n"}
              <div className="flex items-center justify-between pb-space-sm border-b border-surface-variant mb-space-md">
                {"\n"}
                <span className="font-headline-sm text-headline-sm font-bold text-on-surface">
                  {"Audio Soundboard"}
                </span>
                {"\n"}
                <span className="font-label-code-sm text-label-code-sm text-tertiary">
                  {"44.1 kHz WAV DSP"}
                </span>
                {"\n"}
              </div>
              {"\n"}
              {/* Waveform Visualizer Display */}
              {"\n"}
              <div className="bg-surface-container-lowest p-space-md rounded-xl border border-surface-variant mb-space-md flex flex-col gap-2">
                {"\n"}
                <div className="flex items-center justify-between font-label-code-sm text-label-code-sm text-on-surface-variant">
                  {"\n"}
                  <span id="current-track-name">
                    {"Bach - Violin Partita No. 2 (Chaconne Theme)"}
                  </span>
                  {"\n"}
                  <span className="text-tertiary">
                    {"01:42 / 03:20"}
                  </span>
                  {"\n"}
                </div>
                {"\n"}
                {/* Mock Waveform Bars */}
                {"\n"}
                <div className="h-16 flex items-end gap-1 overflow-hidden py-1">
                  {"\n"}
                  <span className="w-1.5 h-6 bg-tertiary rounded-t"></span>
                  {"\n"}
                  <span className="w-1.5 h-10 bg-tertiary-fixed rounded-t"></span>
                  {"\n"}
                  <span className="w-1.5 h-14 bg-secondary rounded-t"></span>
                  {"\n"}
                  <span className="w-1.5 h-8 bg-tertiary rounded-t"></span>
                  {"\n"}
                  <span className="w-1.5 h-4 bg-tertiary rounded-t"></span>
                  {"\n"}
                  <span className="w-1.5 h-12 bg-primary rounded-t"></span>
                  {"\n"}
                  <span className="w-1.5 h-16 bg-tertiary-fixed rounded-t"></span>
                  {"\n"}
                  <span className="w-1.5 h-9 bg-secondary rounded-t"></span>
                  {"\n"}
                  <span className="w-1.5 h-14 bg-tertiary rounded-t"></span>
                  {"\n"}
                  <span className="w-1.5 h-6 bg-tertiary rounded-t"></span>
                  {"\n"}
                  <span className="w-1.5 h-11 bg-primary rounded-t"></span>
                  {"\n"}
                  <span className="w-1.5 h-15 bg-tertiary-fixed rounded-t"></span>
                  {"\n"}
                  <span className="w-1.5 h-13 bg-secondary rounded-t"></span>
                  {"\n"}
                  <span className="w-1.5 h-8 bg-tertiary rounded-t"></span>
                  {"\n"}
                  <span className="w-1.5 h-5 bg-tertiary rounded-t"></span>
                  {"\n"}
                  <span className="w-1.5 h-12 bg-primary rounded-t"></span>
                  {"\n"}
                  <span className="w-1.5 h-16 bg-tertiary-fixed rounded-t"></span>
                  {"\n"}
                  <span className="w-1.5 h-7 bg-secondary rounded-t"></span>
                  {"\n"}
                  <span className="w-1.5 h-14 bg-tertiary rounded-t"></span>
                  {"\n"}
                  <span className="w-1.5 h-10 bg-primary rounded-t"></span>
                  {"\n"}
                  <span className="w-1.5 h-4 bg-tertiary rounded-t"></span>
                  {"\n"}
                  <span className="w-1.5 h-13 bg-tertiary-fixed rounded-t"></span>
                  {"\n"}
                  <span className="w-1.5 h-15 bg-secondary rounded-t"></span>
                  {"\n"}
                  <span className="w-1.5 h-8 bg-tertiary rounded-t"></span>
                  {"\n"}
                  <span className="w-1.5 h-6 bg-tertiary rounded-t"></span>
                  {"\n"}
                  <span className="w-1.5 h-11 bg-primary rounded-t"></span>
                  {"\n"}
                  <span className="w-1.5 h-14 bg-tertiary-fixed rounded-t"></span>
                  {"\n"}
                </div>
                {"\n"}
              </div>
              {"\n"}
              {/* Track Selector List */}
              {"\n"}
              <div className="space-y-space-xs">
                {"\n"}
                {/* Track 1 */}
                {"\n"}
                <button className="w-full text-left p-space-sm rounded-lg bg-surface-container-high border-2 border-primary flex items-center justify-between hover:bg-surface-bright transition-all shadow-[2px_2px_0px_#080d22]" type="button">
                  {"\n"}
                  <div className="flex items-center gap-space-sm">
                    {"\n"}
                    <span className="material-symbols-outlined text-primary">
                      {"play_circle"}
                    </span>
                    {"\n"}
                    <div className="min-w-0">
                      {"\n"}
                      <p className="font-body-md text-body-md font-bold text-on-surface truncate">
                        {"Bach - Violin Partita No. 2 (Chaconne Theme)"}
                      </p>
                      {"\n"}
                      <span className="font-label-code-sm text-xs text-on-surface-variant">
                        {"Solo Violin // Baroque Intonation"}
                      </span>
                      {"\n"}
                    </div>
                    {"\n"}
                  </div>
                  {"\n"}
                  <span className="font-label-code-sm text-label-code-sm text-primary">
                    {"Active"}
                  </span>
                  {"\n"}
                </button>
                {"\n"}
                {/* Track 2 */}
                {"\n"}
                <button className="w-full text-left p-space-sm rounded-lg bg-surface-container-lowest border border-surface-variant flex items-center justify-between hover:bg-surface-container-high transition-all" type="button">
                  {"\n"}
                  <div className="flex items-center gap-space-sm">
                    {"\n"}
                    <span className="material-symbols-outlined text-on-surface-variant">
                      {"play_arrow"}
                    </span>
                    {"\n"}
                    <div className="min-w-0">
                      {"\n"}
                      <p className="font-body-md text-body-md font-bold text-on-surface truncate">
                        {"Vivaldi - Summer (Presto Storm snippet)"}
                      </p>
                      {"\n"}
                      <span className="font-label-code-sm text-xs text-on-surface-variant">
                        {"Rapid Tremolo "}
                        {"&"}
                        {" Spiccato study"}
                      </span>
                      {"\n"}
                    </div>
                    {"\n"}
                  </div>
                  {"\n"}
                  <span className="font-label-code-sm text-label-code-sm text-on-surface-variant">
                    {"01:14"}
                  </span>
                  {"\n"}
                </button>
                {"\n"}
                {/* Track 3 */}
                {"\n"}
                <button className="w-full text-left p-space-sm rounded-lg bg-surface-container-lowest border border-surface-variant flex items-center justify-between hover:bg-surface-container-high transition-all" type="button">
                  {"\n"}
                  <div className="flex items-center gap-space-sm">
                    {"\n"}
                    <span className="material-symbols-outlined text-on-surface-variant">
                      {"play_arrow"}
                    </span>
                    {"\n"}
                    <div className="min-w-0">
                      {"\n"}
                      <p className="font-body-md text-body-md font-bold text-on-surface truncate">
                        {"Folk Fiddle Improv over Synth Wave"}
                      </p>
                      {"\n"}
                      <span className="font-label-code-sm text-xs text-on-surface-variant">
                        {"Analog Synth + Acoustic Violin Fusion"}
                      </span>
                      {"\n"}
                    </div>
                    {"\n"}
                  </div>
                  {"\n"}
                  <span className="font-label-code-sm text-label-code-sm text-on-surface-variant">
                    {"02:45"}
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
          {/* Right: Learning Journey & Repertoire Accordion */}
          {"\n"}
          <div className="lg:col-span-5 bg-surface-container p-space-lg rounded-2xl border-2 border-surface-variant shadow-[6px_6px_0px_#080d22] flex flex-col justify-between">
            {"\n"}
            <div>
              {"\n"}
              <div className="flex items-center justify-between pb-space-sm border-b border-surface-variant mb-space-md">
                {"\n"}
                <span className="font-headline-sm text-headline-sm font-bold text-on-surface">
                  {"The Learning Path"}
                </span>
                {"\n"}
                <span className="material-symbols-outlined text-secondary">
                  {"trending_up"}
                </span>
                {"\n"}
              </div>
              {"\n"}
              <p className="font-body-md text-body-md text-on-surface-variant mb-space-md">
                {"\n              From holding a bow in Suzuki Book 1 to mastering shifting in high positions and double stops in Bach partitas.\n            "}
              </p>
              {"\n"}
              <div className="space-y-space-sm">
                {"\n"}
                <div className="p-space-sm rounded-xl bg-surface-container-lowest border border-surface-variant">
                  {"\n"}
                  <div className="flex items-center justify-between font-label-code-sm text-label-code-sm">
                    {"\n"}
                    <span className="text-tertiary">
                      {"Phase 1: Suzuki Book 1-4"}
                    </span>
                    {"\n"}
                    <span className="text-on-surface-variant">
                      {"Completed"}
                    </span>
                    {"\n"}
                  </div>
                  {"\n"}
                  <div className="w-full bg-surface-container h-2 rounded-full mt-2 overflow-hidden">
                    {"\n"}
                    <div className="bg-tertiary h-full w-full"></div>
                    {"\n"}
                  </div>
                  {"\n"}
                </div>
                {"\n"}
                <div className="p-space-sm rounded-xl bg-surface-container-lowest border border-surface-variant">
                  {"\n"}
                  <div className="flex items-center justify-between font-label-code-sm text-label-code-sm">
                    {"\n"}
                    <span className="text-primary">
                      {"Phase 2: Kreutzer 42 Studies"}
                    </span>
                    {"\n"}
                    <span className="text-on-surface-variant">
                      {"Study #28 / Active"}
                    </span>
                    {"\n"}
                  </div>
                  {"\n"}
                  <div className="w-full bg-surface-container h-2 rounded-full mt-2 overflow-hidden">
                    {"\n"}
                    <div className="bg-primary h-full w-3/4"></div>
                    {"\n"}
                  </div>
                  {"\n"}
                </div>
                {"\n"}
                <div className="p-space-sm rounded-xl bg-surface-container-lowest border border-surface-variant">
                  {"\n"}
                  <div className="flex items-center justify-between font-label-code-sm text-label-code-sm">
                    {"\n"}
                    <span className="text-secondary">
                      {"Phase 3: Bach Solo Sonatas "}
                      {"&"}
                      {" Partitas"}
                    </span>
                    {"\n"}
                    <span className="text-on-surface-variant">
                      {"In Progress"}
                    </span>
                    {"\n"}
                  </div>
                  {"\n"}
                  <div className="w-full bg-surface-container h-2 rounded-full mt-2 overflow-hidden">
                    {"\n"}
                    <div className="bg-secondary h-full w-1/2"></div>
                    {"\n"}
                  </div>
                  {"\n"}
                </div>
                {"\n"}
              </div>
              {"\n"}
            </div>
            {"\n"}
            <div className="pt-space-md mt-space-md border-t border-surface-variant flex items-center justify-between text-xs font-label-code-sm text-on-surface-variant">
              {"\n"}
              <span>
                {"Rigorous ear training directly informs my DSP visualizers."}
              </span>
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
