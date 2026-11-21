# Performance Rules

- Keep three.js, React Three Fiber, drei, Phaser and GSAP plugins out of the initial bundle. Dynamically load desk/game features with SSR disabled; begin fetching while idle and reserve their space. The game waits for an explicit start click.
- Render heavy experiences only while visible. Pause the game offscreen or while the tab is hidden. Clean up Phaser, Three.js resources, GSAP timelines and ScrollTriggers on unmount.
- Use compressed glTF, WebP/KTX2, one sticker sheet and baked shadows. Aim for under about 5 MB of scene assets; avoid real-time shadows and post-processing. Cap pixel ratio at 2 desktop / 1.5 phone.
- Animate transform and opacity only; pause offscreen ambient loops and respect reduced motion.
- Prefer server components; keep interaction client components small. Fetch audio only after enabling sound and create audio context after a user click.
- Starting targets: LCP <2.5s, CLS <0.1, INP <200ms, about 200KB gzipped initial JavaScript, and smooth mid-range-phone desk scrolling. Measure; if a target is missed, lower quality before removing features.
- See `skills/performance-audit/SKILL.md` for measurement and reporting.
