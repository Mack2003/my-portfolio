---
name: performance-audit
description: Use when finishing a heavy feature or running a performance pass.
---

# Performance Audit

## Starting budgets

- LCP <2.5s on a mid-range phone; CLS <0.1; INP <200ms.
- About 200KB gzipped JavaScript before lazy chunks; smooth desk-scene scrolling on a mid-range phone.
- Scene assets under about 5MB.

## Measure and improve

- Review `npm run build` output and inspect initial/lazy bundle boundaries.
- Use Lighthouse and the browser performance panel on representative phone hardware/throttling.
- Ask Malay before adding a bundle analyzer or any dependency/tool.
- Confirm desk/game lazy loading, reserved layout space, visibility pause, hidden-tab pause, cleanup, reduced motion and audio-on-demand.
- Check compressed assets, pixel-ratio caps, no realtime shadows/post-processing, and transform/opacity-only animation.
- If targets miss, lower quality (pixel ratio, prop count) before cutting features.

## Report

List environment and tools, measured metrics/budgets, pass/fail, findings, changes and unverified items. Do not claim a target without a measurement.
