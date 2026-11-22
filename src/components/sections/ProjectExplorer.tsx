import { portfolioData } from "@/data/portfolio";

export default function ProjectExplorer() {
  return (
    <>
    <section className="w-full bg-surface-container-low py-space-xl px-gutter-mobile lg:px-gutter" id="projects">
      <div className="max-w-[1280px] mx-auto flex flex-col gap-space-lg">
        {/* MalayOS Window Frame */}
        <div className="w-full bg-surface-container rounded-2xl border-2 border-surface-variant shadow-[8px_8px_0px_#080d22] overflow-hidden">
          {/* OS Title Bar */}
          <div className="bg-surface-container-high px-space-md py-3 flex items-center justify-between border-b-2 border-surface-variant">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-error border border-surface-container-lowest" />
              <span className="w-3.5 h-3.5 rounded-full bg-secondary border border-surface-container-lowest" />
              <span className="w-3.5 h-3.5 rounded-full bg-tertiary border border-surface-container-lowest" />
            </div>

            {/* Terminal Path */}
            <div className="flex items-center gap-2 font-label-code-sm text-label-code-sm text-on-surface">
              <span className="material-symbols-outlined text-base text-primary">folder_open</span>
              <span>MalayOS ~/Projects/Confirmed</span>
            </div>

            <div className="hidden sm:flex items-center gap-2 font-label-code-sm text-label-code-sm text-on-surface-variant">
              <span>{portfolioData.projects.length} items</span>
            </div>
          </div>

          {/* OS Content Area: Confirmed Genuine Projects */}
          <div className="p-space-lg grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-lg">
            {portfolioData.projects.map((project, idx) => {
              const borderAccent =
                idx === 0
                  ? "hover:border-primary group-hover:text-primary"
                  : idx === 1
                  ? "hover:border-tertiary group-hover:text-tertiary"
                  : "hover:border-secondary group-hover:text-secondary";

              const badgeColor =
                project.status === "In Development"
                  ? "bg-tertiary/15 text-tertiary border-tertiary/40"
                  : "bg-secondary/15 text-secondary border-secondary/40";

              return (
                <div
                  key={project.id}
                  className={`bg-surface-container-lowest p-space-lg rounded-xl border-2 border-surface-variant shadow-[4px_4px_0px_#080d22] transition-all flex flex-col justify-between group ${borderAccent}`}
                >
                  <div>
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-space-sm mb-space-sm">
                      <div className="flex items-center gap-space-sm">
                        <span className="p-2 rounded-lg bg-surface-container text-primary">
                          <span className="material-symbols-outlined text-2xl">{project.icon}</span>
                        </span>
                        <div>
                          <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface group-hover:text-primary transition-colors">
                            {project.title}
                          </h3>
                          <span className="font-label-code-sm text-xs text-on-surface-variant block">
                            {project.category}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`font-label-code-sm text-[11px] font-bold px-2 py-0.5 rounded-md border ${badgeColor} uppercase tracking-wider shrink-0`}
                      >
                        {project.status}
                      </span>
                    </div>

                    <p className="font-body-md text-sm text-secondary font-semibold mt-1 mb-3">
                      {project.tagline}
                    </p>

                    <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed mb-4">
                      {project.description}
                    </p>

                    <div className="mb-4 bg-surface-container-high/60 p-2.5 rounded-lg border border-outline-variant/30">
                      <span className="font-label-code-sm text-[11px] uppercase tracking-wider text-primary font-bold block mb-1">
                        My Contribution
                      </span>
                      <p className="font-body-sm text-xs text-on-surface leading-normal">
                        {project.contribution}
                      </p>
                    </div>
                  </div>

                  {/* Tech Stack Chips */}
                  <div>
                    <div className="pt-3 border-t border-surface-variant flex flex-wrap gap-1.5">
                      {project.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="font-label-code-sm text-[11px] bg-surface-container px-2 py-0.5 rounded text-on-surface font-semibold border border-outline-variant/40"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
    </>
  );
}
