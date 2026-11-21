---
name: reference-copy
description: Use when copying or comparing sections from the supplied reference HTML.
---

# Reference Copy

- Follow the exact-copy rules in `AGENTS.md`: preserve markup, classes, text, ids, attributes, SVG paths, image URLs and DOM order. Do not improve or refactor.
- Save each original HTML version unchanged under `reference/` with a versioned filename. Never edit source files in `reference/`.
- Never read the whole reference to work on one section. Open only its marked block for comparison.
- Allowed JSX conversions only: `className`, `htmlFor`, React camelCase attributes/SVG names, style strings to objects, self-closing void elements and JSX comments with unchanged text. Port inline script logic to `LegacyInteractions.tsx` with `use client`/`useEffect`, preserving behavior and selectors.
- Use `reference/NOTES.md` for suspicious source quirks: state what it is, where it is and why it looks wrong; do not fix it.
- Move the config object, base CSS, html/body classes, title and Google Fonts links per `AGENTS.md`. Do not load Tailwind CDN or design-tool-only metadata.

## Verify

- Compare at 390px, 820px and 1440px with the original open beside the Next.js page.
- Report visual differences; do not fix them during the verbatim-copy pass.
- Run build and lint. Report any viewport or runtime check not performed.
