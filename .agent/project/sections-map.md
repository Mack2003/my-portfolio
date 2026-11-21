# Sections Map

All components below are empty scaffold placeholders unless noted. No reference markup, section scripts, ids beyond scaffold ids, or data files have been added. Skill names are paths under `.agent/skills/`.

## Outside main

### Header
- File: `src/components/layout/Header.tsx`; id: none; purpose: site header; status: placeholder.
- Interactions/data: none yet. Skills: `section-rework`. Performance: keep static unless interaction requires client code.
- Edit here: header copy/navigation/CV link. Changes affect page shell and CV access.

### SoundToggle
- File: `src/components/layout/SoundToggle.tsx`; id: none; purpose: sound control; status: placeholder.
- Interactions/data: none yet. Skills: `violin-audio`, `motion-animation`. Performance: create audio only after user action.
- Edit here: toggle UI/state. Changes affect global audio behavior.

### FooterExtra
- File: `src/components/layout/FooterExtra.tsx`; id: none; purpose: second footer after main; status: placeholder.
- Interactions/data: none yet. Skills: `section-rework`, `responsive-check`. Performance: static by default.
- Edit here: second-footer markup. Changes affect the intentional duplicate-footer DOM order.

## Inside main, in DOM order

### Main wrapper
- File: `src/app/page.tsx`; id: none; purpose: compose the page and preserve DOM order; status: composed placeholders.
- Interactions/data: imports all page components. Skills: `section-rework`, `responsive-check`.
- Performance: owns future lazy-load boundaries. Edit here: composition/order. Changes affect landmarks and section sequencing.

### Hero
- File: `src/components/sections/Hero.tsx`; id: none; purpose: introduction; status: placeholder.
- Interactions/data: none. Skills: `section-rework`, `motion-animation`, `responsive-check`. Performance: initial visible section; keep lightweight.
- Edit here: hero content/layout. Changes affect first impression and the first visible viewport.

### DividerHeroAbout
- File: `src/components/dividers/DividerHeroAbout.tsx`; id: none; purpose: visual divider; status: placeholder.
- Interactions/data: none. Skills: `shapes-clip-path`, `responsive-check`. Performance: CSS/SVG only unless justified.
- Edit here: divider shape. Changes affect the Hero/About transition.

### About
- File: `src/components/sections/About.tsx`; id: `about`; purpose: About; status: placeholder.
- Interactions/data: no verified copy or image. Skills: `section-rework`, `shapes-clip-path`, `responsive-check`. Performance: keep static unless interaction needs otherwise.
- Edit here: About content/image/layout. Changes affect personal-content accuracy and responsive blob framing.

### DividerAboutDesk
- File: `src/components/dividers/DividerAboutDesk.tsx`; id: none; purpose: transition to desk; status: placeholder.
- Interactions/data: none. Skills: `shapes-clip-path`, `responsive-check`. Performance: CSS/SVG only unless justified.
- Edit here: divider shape. Changes affect the About/desk transition.

### DeskStage
- File: `src/components/sections/DeskStage.tsx`; id: `desk-stage`; purpose: interactive desk; status: placeholder.
- Interactions/data: none implemented. Skills: `desk-scene-3d`, `motion-animation`, `responsive-check`, `performance-audit`. Performance: lazy-load scene, reserve space, support static fallback.
- Edit here: scene boundary and fallback. Changes affect camera scroll, sticker/project explorer, violin and CV interactions.

### Skills
- File: `src/components/sections/Skills.tsx`; id: `skills`; purpose: skills presentation; status: placeholder.
- Interactions/data: no data yet. Skills: `section-rework`, `responsive-check`. Performance: keep static/lightweight.
- Edit here: skill markup and future data. Changes affect skill claims and any desk sticker consistency.

### ProjectExplorer
- File: `src/components/sections/ProjectExplorer.tsx`; id: `projects`; purpose: project explorer; status: placeholder.
- Interactions/data: no project data or windows yet. Skills: `section-rework`, `motion-animation`, `responsive-check`. Performance: lazy assets where appropriate.
- Edit here: explorer UI/data. Changes affect project claims and desk laptop behavior.

### ViolinCorner
- File: `src/components/sections/ViolinCorner.tsx`; id: `violin`; purpose: violin feature/corner; status: placeholder.
- Interactions/data: none; no verified playing ability or repertoire. Skills: `violin-audio`, `motion-animation`, `responsive-check`. Performance: fetch no audio before enabling.
- Edit here: violin UI/behavior. Changes affect audio toggle and content-truth requirements.

### HabitCatcher
- File: `src/components/sections/HabitCatcher.tsx`; id: `game`; purpose: Habit Catcher mini-game; status: placeholder.
- Interactions/data: none implemented. Skills: `habit-catcher-game`, `motion-animation`, `responsive-check`, `performance-audit`. Performance: lazy-load, reserve space, start after click.
- Edit here: game mount boundary/fallback. Changes affect game controls, assets and lifecycle.

### CvBanner
- File: `src/components/sections/CvBanner.tsx`; id: none; purpose: CV banner/download; status: placeholder.
- Interactions/data: no CV asset yet. Skills: `section-rework`, `responsive-check`. Performance: static by default.
- Edit here: banner and download target. Changes affect CV access and supplied-file path.

### DividerPreFooter
- File: `src/components/dividers/DividerPreFooter.tsx`; id: none; purpose: divider before footer; status: placeholder.
- Interactions/data: none. Skills: `shapes-clip-path`, `responsive-check`. Performance: CSS/SVG only unless justified.
- Edit here: divider shape. Changes affect CV/footer transition.

### Footer
- File: `src/components/layout/Footer.tsx`; id: none; purpose: footer inside main; status: placeholder.
- Interactions/data: none. Skills: `section-rework`, `responsive-check`. Performance: static by default.
- Edit here: footer markup. Changes affect the first footer; do not merge with FooterExtra.

### LegacyInteractions
- File: `src/components/LegacyInteractions.tsx`; id: none; purpose: future port of reference inline script; status: placeholder, client component renders null.
- Interactions/data: no script or ids yet. Skills: `reference-copy`, `motion-animation`. Performance: keep client logic small and clean up effects.
- Edit here: script port only. Changes affect copied reference interactions and DOM selectors.

## Additions outside current composition

### Three.js and game implementation
- Files: `src/components/three/`, `src/components/game/`; ids: none; purpose: reserved implementations; status: empty.
- Skills: `desk-scene-3d`, `habit-catcher-game`, `performance-audit`. Load only through the corresponding lazy section boundary.
- Edit here: future scene/game modules. Changes affect DeskStage/HabitCatcher integration and asset lifecycle.
