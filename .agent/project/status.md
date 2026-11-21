# Project Status

Last updated: 2026-11-21 for copying reference version 1 into the page.

## Verification preference

For every future UI change, run the app and inspect the changed page in a browser, check behavior and appearance at 390px, 820px and 1440px, fix and recheck any issues, and run build, lint and `npx tsc --noEmit`. Report any check that could not be performed.

| Part | File | Status | Last change | Open notes |
|---|---|---|---|---|
| Header | `src/components/layout/Header.tsx` | copied verbatim | Reference v1 | Mobile-menu behavior ported |
| Main wrapper | `src/app/page.tsx` | composed from reference | Reference v1 | Includes source main/wrapper classes |
| Hero | `src/components/sections/Hero.tsx` | copied verbatim | Reference v1 | `py- space-xs` quirk noted |
| Hero/About divider | `src/components/dividers/DividerHeroAbout.tsx` | copied verbatim | Reference v1 | — |
| About | `src/components/sections/About.tsx` | copied verbatim | Reference v1 | Personal claims unverified |
| About/desk divider | `src/components/dividers/DividerAboutDesk.tsx` | copied verbatim | Reference v1 | — |
| Desk stage | `src/components/sections/DeskStage.tsx` | copied verbatim | Reference v1 | Static preview; no 3D model |
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
- Browser comparison of copied DOM and section geometry matched the source at 390px, 820px and 1440px. Both source and app have 9px horizontal overflow at 390px and 820px; preserved in this verbatim pass.
- A scoped Material Symbols font-size cascade adjustment in `globals.css` is needed because Next.js loads the Google Fonts stylesheets after the imported global stylesheet.
- TODO: Malay's Phase 1–4 briefs are not present; add them verbatim when supplied.
- TODO: Malay to supply the CV PDF, game sprites, audio, 3D model, and project screenshots.
- TODO: confirm any biographical, skill, location, contact, experience or project facts directly with Malay.
- Tailwind tokens, body classes, title, Google Fonts and base CSS are copied from reference v1.
- TODO: implement and measure the required lazy-loading boundaries and performance targets.
