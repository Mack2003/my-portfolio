# Project Status

Last updated: 2026-11-22 for personal information accuracy audit, verified content replacement, unified responsive interaction system, complete removal of unverified violin section, and cinematic 3D desk skeleton loading experience.

## Personal Information Accuracy Audit & Content Replacement

- Centralized Data Store: Created [portfolio.ts](file:///d:/Application_project/My_portfolio-website/src/data/portfolio.ts) holding all confirmed facts, experience, skills, real projects, contact channels, and SEO metadata.
- Identity & Focus: Malay Ray, Full-Stack Developer specializing in React Native mobile applications, Next.js web architectures, and interactive digital experiences. Located in West Bengal, India.
- Confirmed Experience (~1.3 Years): Websadroit (~1 year 3 months, Full-Stack & React Native Developer) and Birdvision AB (~1 month remote contract, Full-Stack Developer).
- Real Projects Only: Featured real projects (`Fixy` - In Development, `Twinkle Star` - In Development, and `Coslix` - Concept). Completely removed unverified placeholder projects (`CloudSync`, `AcousticTuner`, `HabitPulse`, `Phaser Quest Arcade`).
- Contact & Links: Verified email `rmoloy83@gmail.com`, GitHub `https://github.com/Mack2003`, LinkedIn `https://www.linkedin.com/in/malay-ray-78600823b/`. No unverified Twitter/X handles.
- Complete Removal of Violin Section: Removed `ViolinCorner.tsx` and `SoundToggle.tsx` from `page.tsx`. Removed `#violin` links from `Header.tsx` (desktop + mobile nav). Replaced "Violinist 🎻" sticker with "React Native 📱" in `About.tsx`. Replaced violin links in footers with `#projects`. Renamed DeskStage camera stop to "Workspace 🪑".

## Unified Responsive Experience & Viewport Interactions

- SSR-Safe Device Detection: Created [useDeviceDetection.ts](file:///d:/Application_project/My_portfolio-website/src/hooks/useDeviceDetection.ts) powered by `useSyncExternalStore` for SSR safety and zero hydration mismatches.
- Viewport Triggers on Mobile: Integrated `IntersectionObserver` in [LegacyInteractions.tsx](file:///d:/Application_project/My_portfolio-website/src/components/LegacyInteractions.tsx) and [globals.css](file:///d:/Application_project/My_portfolio-website/src/app/globals.css) so Hero waving hand and About UFO spotlight trigger automatically when scrolled into view on mobile/touch screens while retaining hover on desktop.
- Responsive 3D Scene Composition: Added [responsiveSceneConfig.ts](file:///d:/Application_project/My_portfolio-website/src/components/three/config/responsiveSceneConfig.ts) adjusting FOV and camera stops for mobile portrait, tablet, and desktop viewports.

## Cinematic 3D Desk Skeleton Loader

- Implemented [DeskSceneSkeleton.tsx](file:///d:/Application_project/My_portfolio-website/src/components/three/DeskSceneSkeleton.tsx) rendering a dark atmospheric blueprint with perspective grid lines, glowing silhouettes (desk, laptop, bookshelf, chair), animated neon shimmer, genuine staged status updates without fake percentages, and a smooth 700ms crossfade into the interactive Three.js Canvas. Includes a fallback retry trigger for slow connections.

## 3D scene configuration and editor

- Unified Settings Panel for Desk and Cube Views: Eliminated separate ad-hoc settings sections for Cube View. The settings panel provides a prominent scene context banner and navigation button ("Preview Cube View" / "Exit to Desk View") at the top. The existing standard tabs (`Objects`, `Lights`, `Environment`, `Camera`, `Config`) dynamically manage the active scene: when in Cube View, the `Objects` tab manages `cubeStudio.objects` (with identical add/clone/delete/material/animation/gizmo capabilities) and the `Lights` tab manages `cubeStudio.lights` (with identical light kinds/controls).
- Custom 'Enter Cube View' Action: Added `enterCubeView` to `SceneInteractionAction` allowing any object to trigger a smooth transition into an isolated darkroom showcase. When clicked, all desk scene elements smoothly dissolve their opacity to transparent ($t \in [0, 0.35]$) and become invisible, the camera smoothly glides through the dark void ($t \in [0.20, 0.90]$) into a giant dark cube enclosure placed far away at `[0, 80, 0]` ($t \in [0.90, 1.00]$) with zero overlap or wall clipping, and dedicated Cube Studio lights illuminate the centered showcase object.
- Circular Cross Exit Button (`✕`): While inside the Cube View, a fixed circular cross button with neo-brutalist dark glass styling appears in the top-right corner. Clicking it smoothly animates the camera back through the dark background to the desk scroll position and restores standard lighting and desk elements. Clicking the object again smoothly re-enters the Cube View.
- Separated Violin Bow Animation into Modular Preset: Extracted the previously hardcoded `BowPlayingAnimation` from `DeskStage.tsx` into a dedicated custom animation preset at `src/components/three/animations/presets/bowSwing.ts` registered under `id: "bow-swing"` (with alias `"bow-stroke"`). It is now selectable in the settings panel dropdown under the Animation tab for any object.
- Musical Voice Note Phrasing & Extended Stroke Amplitude: Replaced the monotonous single-frequency $\sin(2.8t) \times 0.24$ stroke with a wide $\pm 0.82$ stroke across strings and a 5-phrase musical melody (lyrical sustained down-bow with vibrato shimmer, singing up-bow recovery, crisp accented staccato motif, articulate counter-stroke, and cadential breath). Includes natural string-crossing tilts (rotZ, rotY, rotX), string pressure (bowY), and sympathetic violin body resonance.
- Added Sequential Animation Loop & Reordering: Objects support `continueAllAnimationsInLoop` to cycle through multiple custom presets and extracted GLB animations sequentially in a continuous loop. In `DeskSceneEditor.tsx`, animation cards support Move Up (`arrow_upward`) and Move Down (`arrow_downward`) reordering with step badges (`#1`, `#2`...), individual `Play in sequence` (`enabledInSequence`) checkboxes to keep animations added without playing, and optional `Duration (s)` overrides per animation.
- Direct `AnimationMixer` lifecycle: Replaced `@react-three/drei`'s `useAnimations` with a dedicated `AnimationMixer` instance bound directly to `model` in `ConfiguredSceneObject.tsx`. This avoids Drei's internal `lazyActions` cache which previously retained actions bound to stale unmounted instances. Supports trimmed clip names (e.g. `"normal seeing "`) and updates on every frame.
- Added top-corner toast notification system: When clicking "Copy configuration" (as well as download/import/preset save), a neo-brutalist toast appears in the top-right corner with a checkmark icon and auto-dismisses after 3 seconds.
- Custom animations folder structure: Created a dedicated modular folder at `src/components/three/animations/` housing all preset animations (`pulse.ts`, `bounce.ts`, `rotate.ts`, `violinSway.ts`, `floatingHover.ts`) and central registry/runner (`index.ts`, `types.ts`). Added a smooth floating hover levitation animation (`floating-hover`).
- Fixed object transform responsiveness: changing position and rotation in the settings panel now updates the 3D scene in real-time by keeping `basePosition` and `baseRotation` synchronized with `instance.transform` and preventing non-preset animation frames from overriding transforms.
- Added "Preserve current texture and color of the object" option when adding and configuring material controls. Unchecked removes original textures and model colors; checked retains maps and original mesh colors while allowing material property customization. Also added a button to remove material controls.

- In `npm run dev`, open the desk scene and choose **Edit scene**. The editor manages all registered model instances and six supported light kinds; object/light hierarchy, transform gizmos, environment, camera, configuration import/export and presets are in `src/components/three/DeskSceneEditor.tsx`.
- Model discovery: `npm run 3d:scan`, with registry consistency checked by `npm run 3d:scan:check`; metadata overrides are in `src/components/three/registry/assetMetadata.json`.
- The versioned serializable configuration, original scene defaults, validation, and migration/default behavior are in `src/components/three/config/`. React Three Fiber model/light/environment rendering is in `src/components/three/runtime/`.
- The editor is development-only. Disabling the edited configuration restores the original default scene while preserving the edited configuration in state.
- The displayed rotation values are degrees. Model fitted widths are authored in `src/components/three/registry/assetMetadata.json`.
- Copy or download the full JSON and paste it directly into `src/components/three/config/defaultScene.json`; `defaultScene.ts` imports, validates, and extracts all entities automatically.
- Architecture, editor usage, configuration, and registration are documented in `docs/3d-scene-editor-architecture.md`, `docs/3d-scene-editor-usage.md`, `docs/3d-scene-configuration.md`, and `docs/3d-model-registration.md`.
- Scene imports are validated against the generated registry before replacing the current configuration; object instances resolve their fitted widths through registered asset metadata.
- Three.js was pinned to r182 to eliminate the `THREE.Clock` deprecation warning while remaining compatible with the current R3F/drei stack.
- Models `delux_book_helf.glb`, `office_chair.glb`, and all eight GLBs under `public/models/skills-icons` are registered as editable scene instances.
- The violin/bow GLB hierarchy identifies `Bow` as an independent named node, and `BowPlayingAnimation` moves that node with a rhythmic stroke while respecting reduced motion and offscreen visibility.
- The desk's scroll-driven camera and violin animation remain in `DeskStage.tsx`; environment-map loading is not configured because the project has no environment-map asset.

## Verification preference

For every future UI change, run the app and inspect the changed page in a browser, check behavior and appearance at 390px, 820px and 1440px, fix and recheck any issues, and run build, lint and `npx tsc --noEmit`. Report any check that could not be performed.

| Part | File | Status | Last change | Open notes |
|---|---|---|---|---|
| Header | `src/components/layout/Header.tsx` | copied verbatim | Reference v1 | Mobile-menu behavior ported |
| Main wrapper | `src/app/page.tsx` | composed from reference | Reference v1 | Includes source main/wrapper classes |
| Hero | `src/components/sections/Hero.tsx` | reference with CSS motion | Hero interaction update | Confetti animates independently; hand waves on name/hand hover; reduced-motion support |
| Hero/About divider | `src/components/dividers/DividerHeroAbout.tsx` | copied verbatim | Reference v1 | — |
| About | `src/components/sections/About.tsx` | reference with portrait interaction | About portrait update | Lossless WebP portrait, animated organic frame, hover/focus UFO spotlight |
| About/desk divider | `src/components/dividers/DividerAboutDesk.tsx` | copied verbatim | Reference v1 | — |
| Desk stage | `src/components/sections/DeskStage.tsx` | scroll-driven configurable 3D scene | Scene configuration editor | Scene camera journey, violin animation, model registry and development-only scene editor documented above |
| Skills | `src/components/sections/Skills.tsx` | verified content | Accuracy audit | Dynamic rendering from portfolioData (Mobile, Frontend/3D, Backend/Cloud) |
| Project explorer | `src/components/sections/ProjectExplorer.tsx` | verified content | Accuracy audit | 3 real projects (Fixy, Twinkle Star, Coslix) with genuine statuses & contributions |
| Violin corner | `src/components/sections/ViolinCorner.tsx` | removed from page | Accuracy audit | Completely removed; unverified claims eliminated |
| Habit Catcher | `src/components/sections/HabitCatcher.tsx` | unchanged | Reference v1 | Interactive game preview |
| CV banner | `src/components/sections/CvBanner.tsx` | verified content | Accuracy audit | rmoloy83@gmail.com mailto resume request; id="contact" |
| Pre-footer divider | `src/components/dividers/DividerPreFooter.tsx` | copied verbatim | Reference v1 | — |
| Footer | `src/components/layout/Footer.tsx` | verified content | Accuracy audit | Real GitHub, LinkedIn, email; no unverified claims |
| Legacy interactions | `src/components/LegacyInteractions.tsx` | updated | Mobile responsiveness | IntersectionObserver viewport triggers on mobile/touch |
| Sound toggle | `src/components/layout/SoundToggle.tsx` | removed from page | Accuracy audit | Completely removed |
| Second footer | `src/components/layout/FooterExtra.tsx` | verified content | Accuracy audit | Clean portfolioData references; #projects link |

## Open TODOs

- Reference v1 is saved unchanged as `reference/stitch-page-v1.html`; source quirks and unverified claims are in `reference/NOTES.md`.
- The About portrait uses the supplied transparent PNG converted to lossless WebP at `public/images/malay-portrait.webp`; visible pixels are unchanged. The SVG beam starts at the UFO underside, uses neutral-white light behind the sharp cutout, and fades its lower edge to transparency. Frame, UFO, and spotlight motion respect reduced-motion settings.
- The desk scene uses the recursive model registry and retains viewport-triggered loading, the existing scroll camera, and violin bow animation. The existing 9px narrow-screen overflow comes from the unchanged reference layout.
- The GLBs already include a root rotation converting their source axes; do not apply another X-axis rotation when fitting them. The room opening faces the camera, which now looks down onto the desktop rather than up at the model undersides.
- - Desk story uses a sticky scene during scroll: room overview → violin beside the desk → laptop close-up → laptop-screen close-up. Scroll rather than wheel zoom controls this camera path; editing mode restores orbit/pan/zoom, while presentation mode keeps the camera scroll-controlled.
- The desk editor supports registered GLBs and standard Three.js primitives, per-object materials, emissive colors/intensity, wireframe/opacity controls, and configurable object glow/point lights.
- Object selection is synchronized between scene raycasts and the Objects hierarchy; the room root is excluded as a selectable editor object.
- Objects support serializable preset and embedded-clip animations, default-animation selection, animation speed/loop controls, and scene-click `playAnimation` actions.
- The editor can expand the 3D scene to full-screen and provides a movable settings panel with an explicit exit button and Escape-key exit.
- Browser comparison of copied DOM and section geometry matched the source at 390px, 820px and 1440px. Both source and app have 9px horizontal overflow at 390px and 820px; preserved in this verbatim pass.
- A scoped Material Symbols font-size cascade adjustment in `globals.css` is needed because Next.js loads the Google Fonts stylesheets after the imported global stylesheet.
- TODO: Malay's Phase 1–4 briefs are not present; add them verbatim when supplied.
- TODO: Malay to supply the CV PDF, game sprites, audio, 3D model, and project screenshots.
- TODO: confirm any biographical, skill, location, contact, experience or project facts directly with Malay.
- Tailwind tokens, body classes, title, Google Fonts and base CSS are copied from reference v1.
- TODO: implement and measure the required lazy-loading boundaries and performance targets.
