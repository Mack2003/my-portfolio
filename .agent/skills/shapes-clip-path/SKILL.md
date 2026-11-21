---
name: shapes-clip-path
description: Use when building reusable blobs, dividers, stickers, speech bubbles or starbursts.
---

# Shapes and Clip Paths

- Define each reusable shape once under `src/styles/`; consume it from components instead of rebuilding inline.
- Use percentage or `objectBoundingBox` coordinates so SVG/clip paths scale.
- Include a border-radius fallback for unsupported or clipped layouts.
- Clip paths cut off box shadows: wrap the clipped shape in a wrapper using `filter: drop-shadow(...)` when the design requires a shadow.
- Follow `project/design-system.md` for color, border and shadow tokens. Do not invent values while reference tokens are pending.
- Check narrow screens, focus and hit areas; decorative shape layers must not block interaction.

No source reference shape definitions are present yet.
