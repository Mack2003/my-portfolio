# Project Overview

## Goal

Malay's personal portfolio is a Next.js App Router / TypeScript site intended to show skills in an interactive, playful way rather than as a plain résumé. The design direction is dark navy with blue and playful accents, neo-brutalist sticker styling, solid colors, bold rounded display type, thick outlines and offset shadows. The supplied Stitch HTML is the visual source copied section by section before individual reworks.

## Planned experience

- Hero and About section, including a face image in a blob-shaped frame.
- Interactive 3D desk: skill stickers reveal project cards; a laptop opens a desktop-like explorer; violin interaction plays a short phrase; CV paper downloads a CV; scrolling moves among desk objects.
- Habit Catcher Phaser game with catching/studying and distracted states, a progress bar, pause/start interactions and Malay-supplied art.
- Violin corner and an off-by-default sound control, plus a downloadable CV in the header and banner.

These are project requirements, not claims that features or supplied assets are implemented. The desk and game are required to lazy-load; the site must work on phones and respect reduced motion.

## Stack

Next.js, React, TypeScript, Tailwind CSS v3, vanilla CSS as needed, three.js via React Three Fiber/drei, Phaser and GSAP.

## Guardrails

Only Malay can verify personal or project facts. Reference copy is placeholder. Malay wants to learn violin; do not claim he already plays. See `../rules/03-content-truth.md`.
