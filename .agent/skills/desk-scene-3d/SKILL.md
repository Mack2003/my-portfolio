---
name: desk-scene-3d
description: Use when implementing or changing the Three.js desk scene.
---

# Desk Scene

- Keep Three.js, React Three Fiber and drei out of the initial bundle. Lazy-load the scene with `next/dynamic` and SSR disabled, fetch on idle, and reserve final space.
- Provide a static illustrated fallback with clickable hotspots when WebGL is unavailable or the device is weak.
- Intended scene includes laptop, skill stickers, project explorer, violin and CV. Five camera stops follow scroll: wide 0–20%, laptop 20–45%, violin 45–70%, CV 70–90%, pull back 90–100%.
- Use one sticker texture sheet and texture-coordinate click detection. The laptop explorer is HTML with one open window at a time. Violin interaction plays a short phrase; CV hotspot downloads supplied CV.
- Prefer flat/toon materials with outlines, baked shadow blobs and few lights. No realtime shadows or post-processing. Compress glTF with Draco/meshopt, textures with WebP/KTX2; scene assets target under ~5MB. Pixel ratio cap: 2 desktop, 1.5 phone.
- Mirror objects with hidden focusable buttons. Dispose geometries, materials and textures on unmount; render only while visible.
- Phase 2 brief is missing; TODO: confirm details with Malay before adding unspecified scene behavior.
