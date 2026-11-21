---
name: habit-catcher-game
description: Use when implementing or changing the Phaser Habit Catcher game.
---

# Habit Catcher

- Lazy-load Phaser, fetch while idle, reserve space, and wait for click-to-start. Pause offscreen and when the tab is hidden; destroy the game on unmount.
- Use states: idle, moving, catch, studying, distracted and wake up. Good habits are round bubbles; distractions are spiky starbursts, distinguished by shape and color.
- Good props: coding practice, Stack Overflow, Google Docs, data structures and algorithms. Distractions include phones. Distracted freeze lasts four to five seconds and drains progress; toast says to tap Malay to get back online.
- Progress blends coral (low), yellow (middle), mint (high). This is the only allowed gradient: the red-to-green game progress bar.
- Include start/pause overlays, keyboard, drag and tap input. Use prop pooling, a texture atlas, fixed logical size with fit scaling.
- Keep load/pause/destroy lifecycle explicit. Use supplied sprites only; placeholders until Malay provides them.
- Phase 3 brief is missing; TODO: confirm unprovided details with Malay.
