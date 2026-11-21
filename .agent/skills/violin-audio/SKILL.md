---
name: violin-audio
description: Use when implementing the sound toggle, violin music or audio cues.
---

# Violin Audio

- Sound toggle is a small round bottom-right control, off by default. Malay wants to learn violin; never claim he plays or has a repertoire.
- Create AudioContext only after the first user click. Fetch audio files only after enabling sound. Use short compressed files supplied by Malay.
- Intended sound behavior: violin music tied to scrolling plus note cues. Give every sound cue a visual twin. Stop playback when the tab is hidden.
- If persisting a setting, wrap storage access in `try/catch`; storage can be unavailable.
- Provide visible toggle state, keyboard focus and reduced-motion-safe visual feedback. Keep audio work out of the initial bundle where possible.
- Clean up listeners, nodes and playback on unmount/disable.
- Audio assets and Phase 4 brief are not present; TODO: confirm remaining details with Malay.
