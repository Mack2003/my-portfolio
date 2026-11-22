import { portfolioData } from "@/data/portfolio";

export default function Skills() {
  return (
    <>
    <section className="w-full bg-surface py-space-xl px-gutter-mobile lg:px-gutter" id="skills">
      <div className="max-w-[1280px] mx-auto flex flex-col gap-space-lg">
        {/* Section Title with playful sticker tags */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-space-sm">
          <div>
            <span className="font-label-code-sm text-label-code-sm text-secondary uppercase tracking-widest block">
              Die-cut Vinyl Collection
            </span>
            <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface">
              Technical Skills &amp; Stickers
            </h2>
          </div>
          <div className="text-on-surface-variant font-label-code-sm text-label-code-sm">
            Click any sticker to inspect technical details
          </div>
        </div>

        {/* Sticker Categories Container from Centralized Data */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
          {portfolioData.skills.categories.map((category, catIdx) => {
            const colorClass =
              catIdx === 0
                ? "text-secondary border-secondary"
                : catIdx === 1
                ? "text-tertiary border-tertiary"
                : "text-primary border-primary";

            return (
              <div
                key={category.title}
                className="bg-surface-container p-space-lg rounded-2xl border-2 border-surface-variant shadow-[5px_5px_0px_#080d22] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-space-sm border-b border-surface-variant mb-space-md">
                    <span className={`font-headline-sm text-headline-sm font-bold ${colorClass.split(" ")[0]}`}>
                      {category.title}
                    </span>
                    <span className={`material-symbols-outlined ${colorClass.split(" ")[0]}`}>
                      {category.icon}
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
                    {category.description}
                  </p>

                  {/* Stickers Stack */}
                  <div className="flex flex-wrap gap-2.5 sm:gap-3">
                    {category.skills.map((skill, sIdx) => {
                      const rotations = ["-rotate-2", "rotate-2", "-rotate-3", "rotate-3", "-rotate-1", "rotate-1"];
                      const rot = rotations[sIdx % rotations.length];
                      const borderCol = skill.highlight
                        ? colorClass.split(" ")[1]
                        : "border-outline-variant";

                      return (
                        <div
                          key={skill.name}
                          className={`sticker-chip cursor-pointer bg-surface-container-high px-space-md py-space-xs rounded-lg border-2 ${borderCol} text-on-surface font-label-code-sm text-label-code-sm font-bold shadow-[3px_3px_0px_#080d22] ${rot} hover:rotate-0 hover:scale-105 transition-all touch-manipulation`}
                          data-proj={skill.detail}
                        >
                          {skill.name} {skill.emoji}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Sticker Highlight Banner (Interactive Popup) */}
        <div
          className="bg-surface-container-high border-2 border-primary p-space-md rounded-xl flex items-center gap-space-md shadow-[4px_4px_0px_#080d22] transition-all"
          id="sticker-banner"
        >
          <span className="material-symbols-outlined text-primary text-2xl" aria-hidden="true">
            info
          </span>
          <div className="min-w-0">
            <span className="font-label-code-sm text-label-code-sm text-primary uppercase block">
              Sticker Inspector
            </span>
            <span className="font-body-md text-body-md text-on-surface" id="sticker-detail-text">
              Click any skill sticker above to view real architecture details &amp; practical experience.
            </span>
          </div>
        </div>
      </div>
    </section>
    </>
  );
}
