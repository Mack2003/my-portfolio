# Project Status

Last updated: 2026-11-22 for the modular scene configuration and developer editor.

## 3D scene configuration and editor

- In `npm run dev`, open the desk scene and choose **Edit scene**. The editor manages all registered model instances and six supported light kinds; object/light hierarchy, transform gizmos, environment, camera, configuration import/export and presets are in `src/components/three/DeskSceneEditor.tsx`.
- Model discovery: `npm run 3d:scan`, with registry consistency checked by `npm run 3d:scan:check`; metadata overrides are in `src/components/three/registry/assetMetadata.json`.
- The versioned serializable configuration, original scene defaults, validation, and migration/default behavior are in `src/components/three/config/`. React Three Fiber model/light/environment rendering is in `src/components/three/runtime/`.
- The editor is development-only. Disabling the edited configuration restores the original default scene while preserving the edited configuration in state.
- The displayed rotation values are degrees. Model fitted widths are authored in `src/components/three/registry/assetMetadata.json`.
- Copy or download the full JSON and replace `defaultSceneConfiguration` in `src/components/three/config/defaultScene.ts` to keep final transforms and other scene settings.
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
| Skills | `src/components/sections/Skills.tsx` | copied verbatim | Reference v1 | Claims unverified; inspector interaction ported |
| Project explorer | `src/components/sections/ProjectExplorer.tsx` | copied verbatim | Reference v1 | Static cards; project claims unverified |
| Violin corner | `src/components/sections/ViolinCorner.tsx` | copied verbatim | Reference v1 | Claims conflict with learning intent |
| Habit Catcher | `src/components/sections/HabitCatcher.tsx` | copied verbatim | Reference v1 | Static preview; not a playable game |
| CV banner | `src/components/sections/CvBanner.tsx` | copied verbatim | Reference v1 | CV asset not supplied; email copy ported |
| Pre-footer divider | `src/components/dividers/DividerPreFooter.tsx` | copied verbatim | Reference v1 | — |
| Footer | `src/components/layout/Footer.tsx` | copied verbatim | Reference v1 | Keep distinct from FooterExtra |
| Legacy interactions | `src/components/LegacyInteractions.tsx` | behavior ported | Reference v1 | Event listeners/timers cleaned on unmount |
| Sound toggle | `src/components/layout/SoundToggle.tsx` | copied verbatim | Reference v1 | Visual only; no audio behavior |
| Second footer | `src/components/layout/FooterExtra.tsx` | copied verbatim | Reference v1 | Preserve DOM order |

## Open TODOs

- Reference v1 is saved unchanged as `reference/stitch-page-v1.html`; source quirks and unverified claims are in `reference/NOTES.md`.
- The About portrait uses the supplied transparent PNG converted to lossless WebP at `public/images/malay-portrait.webp`; visible pixels are unchanged. The SVG beam starts at the UFO underside, uses neutral-white light behind the sharp cutout, and fades its lower edge to transparency. Frame, UFO, and spotlight motion respect reduced-motion settings.
- The desk scene uses the recursive model registry and retains viewport-triggered loading, the existing scroll camera, and violin bow animation. The existing 9px narrow-screen overflow comes from the unchanged reference layout.
- The GLBs already include a root rotation converting their source axes; do not apply another X-axis rotation when fitting them. The room opening faces the camera, which now looks down onto the desktop rather than up at the model undersides.
- Desk story uses a sticky scene during scroll: room overview → violin beside the desk → laptop close-up → laptop-screen close-up. Scroll rather than wheel zoom controls this camera path; drag remains available to orbit.
- Browser comparison of copied DOM and section geometry matched the source at 390px, 820px and 1440px. Both source and app have 9px horizontal overflow at 390px and 820px; preserved in this verbatim pass.
- A scoped Material Symbols font-size cascade adjustment in `globals.css` is needed because Next.js loads the Google Fonts stylesheets after the imported global stylesheet.
- TODO: Malay's Phase 1–4 briefs are not present; add them verbatim when supplied.
- TODO: Malay to supply the CV PDF, game sprites, audio, 3D model, and project screenshots.
- TODO: confirm any biographical, skill, location, contact, experience or project facts directly with Malay.
- Tailwind tokens, body classes, title, Google Fonts and base CSS are copied from reference v1.
- TODO: implement and measure the required lazy-loading boundaries and performance targets.
