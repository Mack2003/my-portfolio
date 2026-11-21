# Design Quality

- Use only project tokens from `tailwind.config.ts`; no default Tailwind palette colors or arbitrary hex values.
- Flat solid colors only. No gradients except the game's progress bar; no glass, backdrop blur on content, glow shadows, gradient text or purple-to-blue hero washes.
- Use one depth system: 2px/4px borders, solid offset shadows and token radii. Hover lifts, press pushes into shadow, and clickables show keyboard focus.
- Use the display font for bold fluid headings, mono for labels, and short first-person playful copy. No corporate filler or lorem ipsum.
- Define shapes once in the shared shapes location; never rebuild one inline.
- Avoid uniform rounded-card grids, emoji icons, centered-everything layouts, stock stat rows and generic calls to action. Vary scale, rhythm and shape.
- Maintain body contrast of at least 4.5:1, visible focus, alt text, one h1 per page, proper landmarks and reduced-motion support.

## UI checklist

- Tokens only; no gradients or blur.
- Hover, press and focus states are present.
- Works at 360px without sideways scrolling; touch targets are at least 44px.
- Motion follows `skills/motion-animation/SKILL.md`; no invented facts.
