# Malay Ray Portfolio — Agent Guide

## Project summary
Malay's personal portfolio is a Next.js App Router application written in TypeScript.
It presents skills and projects through an interactive, playful experience.
The design direction is dark navy with blue and playful accents in a neo-brutalist sticker style.
The supplied Stitch HTML is copied section by section before sections are reworked.
The planned experience includes a 3D desk, a mini-game, violin audio, and a downloadable CV.

## Reading order
Read this README, then all four files in `rules/`. Use the routing table to choose the task row, then read only the files named there. Never open `reference/*.html` in full; open only the marked block being compared. Never run repo-wide searches or read other sections' files before checking `project/sections-map.md`. If the map does not answer a question, search once and narrowly, then add the answer to the map in the same change.

## Verification preference
Whenever a task changes UI, run the app and open the changed page in a browser. Check the implemented behavior and appearance at 390px, 820px and 1440px, make and recheck any needed fixes, and run build, lint and TypeScript validation (`npx tsc --noEmit`). Clearly report any browser check that could not be completed.

## Task routing
| Task | Read | Edit |
|---|---|---|
| Change copy in a section | `project/sections-map.md`, `rules/03-content-truth.md`, `skills/section-rework/SKILL.md` | The named `src/components/sections/*.tsx` file |
| Restyle a section | `project/design-system.md`, `project/sections-map.md`, `skills/section-rework/SKILL.md`, `skills/shapes-clip-path/SKILL.md` | The named section component; shared shape file in `src/styles/` only if needed |
| Add or change an animation | `skills/motion-animation/SKILL.md`, `project/sections-map.md` | The named component and its existing helper in `src/hooks/` or `src/lib/` |
| Change colors or type | `project/design-system.md`, `skills/section-rework/SKILL.md` | `tailwind.config.ts`, `src/app/globals.css`, affected component |
| Change header or navigation | `project/sections-map.md`, `skills/section-rework/SKILL.md` | `src/components/layout/Header.tsx` |
| Add a project or skill | `project/sections-map.md`, `rules/03-content-truth.md` | `src/data/` and `src/components/sections/ProjectExplorer.tsx` or `src/components/sections/Skills.tsx` |
| Work on the desk scene | `skills/desk-scene-3d/SKILL.md`, `skills/performance-audit/SKILL.md`, `project/sections-map.md` | `src/components/sections/DeskStage.tsx`, `src/components/three/`, `public/models/`, `public/textures/` |
| Work on the game | `skills/habit-catcher-game/SKILL.md`, `skills/performance-audit/SKILL.md`, `project/sections-map.md` | `src/components/sections/HabitCatcher.tsx`, `src/components/game/`, `public/game/` |
| Work on sound | `skills/violin-audio/SKILL.md`, `project/sections-map.md` | `src/components/layout/SoundToggle.tsx`, `src/components/sections/ViolinCorner.tsx`, `src/lib/`, `public/audio/` |
| Swap images | `skills/responsive-check/SKILL.md`, `rules/03-content-truth.md` | `public/images/` and the component that references the image |
| Change the CV | `project/sections-map.md`, `rules/03-content-truth.md` | `public/cv/`, `src/components/sections/CvBanner.tsx`, and `src/components/layout/Header.tsx` if its link changes |
| Fix one screen size | `skills/responsive-check/SKILL.md`, `project/design-phases/README.md`, `project/sections-map.md` | The affected component and, only if required, `src/styles/` |
| Add a section | `project/architecture.md`, `project/sections-map.md`, `skills/section-rework/SKILL.md` | New `src/components/sections/*.tsx`, `src/app/page.tsx`, `project/sections-map.md`, `project/status.md` |
| Run a performance pass | `rules/04-performance.md`, `skills/performance-audit/SKILL.md`, `project/architecture.md` | Only files implicated by measured findings; update `project/status.md` |

Never edit `reference/` or `.agent/project/design-phases/` source materials.
