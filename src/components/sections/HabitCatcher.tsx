export default function HabitCatcher() {
  return (
    <>
    <section className="w-full bg-surface-container-lowest py-space-xl px-gutter-mobile lg:px-gutter" id="game">
      {"\n"}
      <div className="max-w-[1280px] mx-auto flex flex-col gap-space-lg">
        {"\n"}
        {/* Section Header */}
        {"\n"}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-sm">
          {"\n"}
          <div>
            {"\n"}
            <span className="font-label-code-sm text-label-code-sm text-tertiary uppercase tracking-widest block">
              {"Phaser 3 Engine Lab"}
            </span>
            {"\n"}
            <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface">
              {"Habit Catcher Arcade"}
            </h2>
            {"\n"}
          </div>
          {"\n"}
          <div className="text-on-surface-variant font-label-code-sm text-label-code-sm">
            {"\n          Interactive Browser Mini-Game Preview\n        "}
          </div>
          {"\n"}
        </div>
        {"\n"}
        {/* Arcade Cabinet Simulation Window */}
        {"\n"}
        <div className="w-full bg-surface-container rounded-2xl border-4 border-surface-variant shadow-[8px_8px_0px_#080d22] overflow-hidden flex flex-col">
          {"\n"}
          {/* Arcade Header Strip */}
          {"\n"}
          <div className="bg-surface-container-highest px-space-md py-space-xs flex items-center justify-between border-b-2 border-surface-variant">
            {"\n"}
            <div className="flex items-center gap-space-sm">
              {"\n"}
              <span className="w-3 h-3 rounded-full bg-error animate-ping"></span>
              {"\n"}
              <span className="font-label-code-sm text-label-code-sm font-bold text-on-surface">
                {"CREDIT: 01 // INSERT COIN"}
              </span>
              {"\n"}
            </div>
            {"\n"}
            {/* Game HUD Multiplier */}
            {"\n"}
            <div className="flex items-center gap-space-md font-label-code-sm text-label-code-sm">
              {"\n"}
              <span className="text-secondary font-bold">
                {"SCORE: 2,450"}
              </span>
              {"\n"}
              <span className="text-tertiary font-bold">
                {"STREAK: 4X 🔥"}
              </span>
              {"\n"}
            </div>
            {"\n"}
          </div>
          {"\n"}
          {/* Phaser Canvas Stage Simulation */}
          {"\n"}
          <div className="relative w-full aspect-[21/9] min-h-[320px] bg-surface-container-lowest flex items-center justify-center overflow-hidden p-6">
            {"\n"}
            {/* Falling Habit Items (Physics Representation) */}
            {"\n"}
            <div className="absolute top-8 left-1/4 -rotate-6 px-3 py-1 bg-surface-container rounded-lg border border-tertiary text-tertiary font-label-code-sm text-xs shadow-[2px_2px_0px_#080d22] animate-bounce">
              {"\n            Drink Water 💧 +50\n          "}
            </div>
            {"\n"}
            <div className="absolute top-16 right-1/3 rotate-4 px-3 py-1 bg-surface-container rounded-lg border border-primary text-primary font-label-code-sm text-xs shadow-[2px_2px_0px_#080d22]">
              {"\n            Write Clean Tests 🧪 +100\n          "}
            </div>
            {"\n"}
            <div className="absolute bottom-20 left-1/3 -rotate-3 px-3 py-1 bg-surface-container rounded-lg border border-secondary text-secondary font-label-code-sm text-xs shadow-[2px_2px_0px_#080d22]">
              {"\n            Stretch "}
              {"&"}
              {" Posture 🧘 +75\n          "}
            </div>
            {"\n"}
            <div className="absolute top-24 right-16 rotate-12 px-3 py-1 bg-surface-container-highest rounded-lg border border-error text-error font-label-code-sm text-xs shadow-[2px_2px_0px_#080d22]">
              {"\n            Avoid Doomscrolling 🚫 PENALTY\n          "}
            </div>
            {"\n"}
            {/* Player Catcher Basket at Bottom */}
            {"\n"}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-32 h-8 bg-tertiary rounded-lg border-2 border-surface-container-lowest shadow-[0_4px_0_#080d22] flex items-center justify-center">
              {"\n"}
              <span className="font-label-code-sm text-xs text-on-tertiary font-bold">
                {"[ MALAY CATCHER ]"}
              </span>
              {"\n"}
            </div>
            {"\n"}
            {/* Retro Overlay CTA */}
            {"\n"}
            <div className="relative z-20 flex flex-col items-center text-center p-space-md bg-surface/90 backdrop-blur-md rounded-2xl border-2 border-tertiary shadow-[6px_6px_0px_#080d22]">
              {"\n"}
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-2">
                {"Ready to Catch Habits?"}
              </h3>
              {"\n"}
              <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm mb-4">
                {"Control with arrow keys or touch swipes to catch productive habits while dodging distractions."}
              </p>
              {"\n"}
              <button className="inline-flex items-center gap-space-xs font-label-code-lg text-label-code-lg bg-tertiary text-on-tertiary font-bold px-space-lg py-space-sm rounded-xl border-2 border-surface-container-lowest shadow-[4px_4px_0px_#080d22] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#080d22] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all uppercase tracking-wider" type="button">
                {"\n"}
                <span>
                  {"Start Game [Enter]"}
                </span>
                {"\n"}
                <span className="material-symbols-outlined text-lg">
                  {"videogame_asset"}
                </span>
                {"\n"}
              </button>
              {"\n"}
            </div>
            {"\n"}
          </div>
          {"\n"}
          {/* Streak Progress Bar HUD (coral-500 -> sunny-400 -> mint-400) */}
          {"\n"}
          <div className="p-space-md bg-surface-container-high border-t-2 border-surface-variant flex flex-col sm:flex-row items-center justify-between gap-space-md">
            {"\n"}
            <div className="w-full sm:w-2/3">
              {"\n"}
              <div className="flex items-center justify-between font-label-code-sm text-label-code-sm text-on-surface mb-1">
                {"\n"}
                <span>
                  {"Daily Focus Energy"}
                </span>
                {"\n"}
                <span className="text-tertiary font-bold">
                  {"85% // Hyperdrive Active"}
                </span>
                {"\n"}
              </div>
              {"\n"}
              <div className="w-full h-3 bg-surface-container-lowest rounded-full overflow-hidden border border-outline-variant flex">
                {"\n"}
                <div className="h-full bg-error w-1/4"></div>
                {"\n"}
                <div className="h-full bg-secondary w-1/4"></div>
                {"\n"}
                <div className="h-full bg-tertiary w-1/3"></div>
                {"\n"}
              </div>
              {"\n"}
            </div>
            {"\n"}
            <div className="flex items-center gap-space-sm font-label-code-sm text-xs text-on-surface-variant">
              {"\n"}
              <span>
                {"Freeze Penalty Multiplier: x1.0"}
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
