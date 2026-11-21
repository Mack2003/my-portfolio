---
name: motion-animation
description: Use when adding or changing motion or animation.
---

# Motion and Animation

- Motion should pop with a small overshoot rather than fade generically: use offset-shadow depth, a single large motion at a time, slight arrival tilt and instant interaction feedback.
- Use 120–180ms for hover/press, 300–400ms for pop-ins, 500–650ms for section reveals with 60–90ms stagger, and 4–8s for ambient loops.
- Animate `transform` and `opacity` only; avoid layout-triggering properties. Pause ambient loops offscreen.
- Respect `prefers-reduced-motion`; offer a simple fade or no-motion alternative.
- Keep GSAP plugins out of the initial bundle. Scope animations to the smallest client component.
- Create GSAP timelines/ScrollTriggers in lifecycle-safe effects; kill them on cleanup. Refresh ScrollTrigger after lazy content changes the scroll layout.
- Avoid competing large motions, perpetual offscreen work and animation that blocks interaction.

No section-specific choreography is known until Malay supplies the design briefs.
