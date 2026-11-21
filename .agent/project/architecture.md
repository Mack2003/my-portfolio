# Architecture

## Annotated project files

```text
AGENTS.md — reference-copy rules and project-agent pointer
.agent/README.md — task routing
.agent/rules/01-working-method.md — per-task process
.agent/rules/02-design-quality.md — design rules and checklist
.agent/rules/03-content-truth.md — fact-sourcing constraints
.agent/rules/04-performance.md — always-on performance rules
.agent/project/overview.md — goals, features and stack
.agent/project/design-system.md — current tokens and pending reference recipes
.agent/project/architecture.md — this annotated file map
.agent/project/sections-map.md — section ownership and status
.agent/project/status.md — progress and open TODOs
.agent/project/design-phases/README.md — phase-brief inventory and TODO
.agent/skills/reference-copy/SKILL.md — exact-copy workflow
.agent/skills/section-rework/SKILL.md — single-section redesign workflow
.agent/skills/motion-animation/SKILL.md — animation rules
.agent/skills/shapes-clip-path/SKILL.md — shared shape rules
.agent/skills/desk-scene-3d/SKILL.md — desk scene requirements
.agent/skills/habit-catcher-game/SKILL.md — game requirements
.agent/skills/violin-audio/SKILL.md — audio requirements
.agent/skills/responsive-check/SKILL.md — viewport rules and checks
.agent/skills/performance-audit/SKILL.md — performance budgets and verification
README.md — install/run instructions
package.json — scripts and allowed dependencies
package-lock.json — locked npm dependency graph
tsconfig.json — TypeScript settings and @/* alias
eslint.config.mjs — ESLint configuration
next.config.ts — Next.js configuration
postcss.config.mjs — Tailwind/PostCSS plugins
tailwind.config.ts — Tailwind v3 configuration
.gitignore — generated/dependency exclusions
public/audio/.gitkeep — future audio assets
public/cv/.gitkeep — future CV
public/game/.gitkeep — future game assets
public/images/.gitkeep — future images
public/models/.gitkeep — future 3D models
public/textures/.gitkeep — future texture sheets
reference/NOTES.md — source quirks and unverified claims
reference/stitch-page-v1.html — unchanged source HTML, do not edit
src/app/favicon.ico — app favicon
src/app/globals.css — Tailwind directives; later reference base CSS
src/app/layout.tsx — root html/body classes, title and Google Fonts links
src/app/page.tsx — page composition and DOM order
src/components/LegacyInteractions.tsx — client port of reference interaction scripts
src/components/dividers/DividerAboutDesk.tsx — divider placeholder
src/components/dividers/DividerHeroAbout.tsx — divider placeholder
src/components/dividers/DividerPreFooter.tsx — divider placeholder
src/components/game/.gitkeep — reserved Phaser implementation
src/components/layout/Footer.tsx — footer placeholder
src/components/layout/FooterExtra.tsx — second footer placeholder
src/components/layout/Header.tsx — header placeholder
src/components/layout/SoundToggle.tsx — sound toggle placeholder
src/components/sections/About.tsx — About placeholder
src/components/sections/CvBanner.tsx — CV banner placeholder
src/components/sections/DeskStage.tsx — desk scene placeholder
src/components/sections/HabitCatcher.tsx — game placeholder
src/components/sections/Hero.tsx — hero placeholder
src/components/sections/ProjectExplorer.tsx — project explorer placeholder
src/components/sections/Skills.tsx — skills placeholder
src/components/sections/ViolinCorner.tsx — violin placeholder
src/components/three/.gitkeep — reserved Three.js implementation
src/data/.gitkeep — reserved content data
src/hooks/.gitkeep — reserved hooks
src/lib/.gitkeep — reserved helpers
src/styles/.gitkeep — reserved shared shape/style definitions
src/types/.gitkeep — reserved shared types
tailwind.config.ts — Tailwind v3 configuration
postcss.config.mjs — Tailwind/PostCSS plugins
```

## Composition and boundaries

`src/app/page.tsx` renders Header, then `<main className="w-full bg-surface min-h-[calc(100vh-80px)] pt-16">` with an inner `<div className="flex flex-col w-full text-on-surface">` containing Hero, DividerHeroAbout, About, DividerAboutDesk, DeskStage, Skills, ProjectExplorer, ViolinCorner, HabitCatcher, CvBanner, DividerPreFooter, Footer and LegacyInteractions; SoundToggle and FooterExtra follow main. The reference wrapper classes differ from the original scaffold brief; the supplied HTML takes precedence. The order includes two footers intentionally.

Current named components are server components except `LegacyInteractions.tsx`, which is a client component returning null. No dynamic-import boundaries exist yet. Keep the future 3D scene and game behind `next/dynamic` with SSR disabled; use small client components only for interactions.

## Conventions and adding a section

Use PascalCase component filenames, `src/components/sections/` for sections, `layout/` for shared shell parts, and `dividers/` for dividers. Add a component, import and place it in `src/app/page.tsx` in the required DOM order, then update `sections-map.md`, `status.md`, and this tree. Add shared shapes only in `src/styles/`.
