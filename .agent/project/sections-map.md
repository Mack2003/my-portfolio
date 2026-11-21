# Sections Map

Reference v1 is copied into its components. The desk, game and sound areas are static visual previews, not full implementations. The reference's main wrapper has `w-full bg-surface min-h-[calc(100vh-80px)] pt-16` and its inner div has `flex flex-col w-full text-on-surface`; this differs from the original scaffold brief and follows the supplied HTML.

## Outside main

### Header
- File: `src/components/layout/Header.tsx`; id: none; purpose: site header; status: copied verbatim.
- Interactions/data: mobile menu behavior is ported to `LegacyInteractions`; CV button is static. Skills: `reference-copy`, `section-rework`. Performance: server-rendered.
- Edit here: header/navigation/CV markup. Changes affect page shell and mobile navigation.

### SoundToggle
- File: `src/components/layout/SoundToggle.tsx`; id: none; purpose: sound control; status: copied verbatim.
- Interactions/data: visual-only toggle; no audio behavior. Skills: `violin-audio`, `motion-animation`. Performance: no audio loaded.
- Edit here: toggle UI. Changes affect future global audio behavior.

### FooterExtra
- File: `src/components/layout/FooterExtra.tsx`; id: none; purpose: second footer after main; status: copied verbatim.
- Interactions/data: static links. Skills: `section-rework`, `responsive-check`. Performance: static.
- Edit here: second-footer markup. Changes affect the intentional duplicate-footer DOM order.

## Inside main, in DOM order

### Main wrapper
- File: `src/app/page.tsx`; id: none; purpose: preserve source classes, landmarks and order; status: copied/composed.
- Interactions/data: composes the section components in reference order. Skills: `reference-copy`, `responsive-check`.
- Performance: desk/game remain static preview markup; future heavy features still need lazy boundaries. Edit here: wrapper/classes/order. Changes affect every section's layout.

### Hero
- File: `src/components/sections/Hero.tsx`; id: none; purpose: introduction; status: copied verbatim.
- Interactions/data: unverified role/skill copy; hero badge class quirk noted in `reference/NOTES.md`. Skills: `section-rework`, `motion-animation`, `responsive-check`. Performance: initial viewport.
- Edit here: hero copy/layout. Changes affect the first impression and visible viewport.

### DividerHeroAbout
- File: `src/components/dividers/DividerHeroAbout.tsx`; id: none; purpose: wavy divider; status: copied verbatim.
- Interactions/data: SVG path copied. Skills: `shapes-clip-path`, `responsive-check`. Performance: inline SVG.
- Edit here: divider SVG. Changes affect the Hero/About transition.

### About
- File: `src/components/sections/About.tsx`; id: `about`; purpose: About; status: copied verbatim.
- Interactions/data: includes remote portrait and unverified biography/claim copy. Skills: `section-rework`, `shapes-clip-path`, `responsive-check`. Performance: original remote image URL retained.
- Edit here: About content/image/layout. Changes affect personal-content accuracy and responsive blob framing.

### DividerAboutDesk
- File: `src/components/dividers/DividerAboutDesk.tsx`; id: none; purpose: wavy divider; status: copied verbatim.
- Interactions/data: SVG path copied. Skills: `shapes-clip-path`, `responsive-check`. Performance: inline SVG.
- Edit here: divider SVG. Changes affect the About/desk transition.

### DeskStage
- File: `src/components/sections/DeskStage.tsx`; id: `desk-stage`; purpose: visual desk-stage preview; status: copied verbatim.
- Interactions/data: camera buttons switch style; desk is CSS markup, not Three.js. Skills: `desk-scene-3d`, `motion-animation`, `responsive-check`, `performance-audit`. Performance: no 3D bundle.
- Edit here: preview/scene boundary. Changes affect future camera, project, violin and CV interactions.

### Skills
- File: `src/components/sections/Skills.tsx`; id: `skills`; purpose: skill stickers; status: copied verbatim.
- Interactions/data: clicking sticker updates inspector banner; claims are unverified. Skills: `section-rework`, `responsive-check`. Performance: static markup plus small shared handler.
- Edit here: sticker copy/layout. Changes affect skill claims and inspector behavior.

### ProjectExplorer
- File: `src/components/sections/ProjectExplorer.tsx`; id: `projects`; purpose: project card showcase; status: copied verbatim.
- Interactions/data: four static project cards with unverified descriptions/links. Skills: `section-rework`, `motion-animation`, `responsive-check`. Performance: static.
- Edit here: project content/cards. Changes affect project claims and links.

### ViolinCorner
- File: `src/components/sections/ViolinCorner.tsx`; id: `violin`; purpose: violin/audio preview; status: copied verbatim.
- Interactions/data: static tracks and learning cards, no playback; musician/streak/repertoire claims are unverified. Skills: `violin-audio`, `motion-animation`, `responsive-check`. Performance: no audio fetched.
- Edit here: violin UI/copy. Changes affect audio controls and content truth.

### HabitCatcher
- File: `src/components/sections/HabitCatcher.tsx`; id: `game`; purpose: mini-game preview; status: copied verbatim.
- Interactions/data: static game art/CTA, not a playable Phaser game. Skills: `habit-catcher-game`, `motion-animation`, `responsive-check`, `performance-audit`. Performance: Phaser not loaded.
- Edit here: preview/game boundary. Changes affect future game controls, assets and lifecycle.

### CvBanner
- File: `src/components/sections/CvBanner.tsx`; id: none; purpose: CV/contact banner; status: copied verbatim.
- Interactions/data: email copy button behavior is ported; CV button has no supplied file/behavior. Skills: `section-rework`, `responsive-check`. Performance: static.
- Edit here: banner, contact and download target. Changes affect CV access and verified contact details.

### DividerPreFooter
- File: `src/components/dividers/DividerPreFooter.tsx`; id: none; purpose: wavy divider; status: copied verbatim.
- Interactions/data: SVG path copied. Skills: `shapes-clip-path`, `responsive-check`. Performance: inline SVG.
- Edit here: divider SVG. Changes affect CV/footer transition.

### Footer
- File: `src/components/layout/Footer.tsx`; id: none; purpose: first footer inside main; status: copied verbatim.
- Interactions/data: social links/copy unverified. Skills: `section-rework`, `responsive-check`. Performance: static.
- Edit here: footer markup. Changes affect the first footer; do not merge with FooterExtra.

### LegacyInteractions
- File: `src/components/LegacyInteractions.tsx`; id: none; purpose: port both reference scripts; status: behavior ported.
- Interactions/data: mobile menu, sticker inspector, clipboard toast and camera button styles. Skills: `reference-copy`, `motion-animation`. Performance: one small effect cleans listeners/timers on unmount.
- Edit here: copied script behavior only. Changes affect selectors and reference interactions.

## Reserved implementations

- `src/components/three/` and `src/components/game/`: empty directories. Implement scene/game only when Malay starts those reworks; use the corresponding skills and keep heavy dependencies out of the initial bundle.
