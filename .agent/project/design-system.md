# Design System

## Current Tailwind configuration

`tailwind.config.ts` enables class-based dark mode and scans `./src/**/*.{ts,tsx}`. `theme.extend` is empty. The reference HTML is not in `reference/` yet, so its configuration and visual recipes are pending.

| Name | Value | Role |
|---|---|---|
| darkMode | `class` | Enables class-based dark mode |
| content | `./src/**/*.{ts,tsx}` | Template files scanned by Tailwind |
| theme.extend | empty | No project-specific design tokens yet |

## Pending reference HTML

No project color, spacing, font-size, font-family, radius, border, shadow or component-class tokens can yet be documented from real markup. Do not invent token values or component recipes. Extract them from the copied reference and `tailwind.config.ts` when it is available.

- Type scale: pending reference.
- Spacing, borders and shadows: pending reference.
- Shared shape definitions: pending reference and section rework.
- Button, card, sticker, badge, window title bar and toast recipes: pending reference; no exact class strings to record yet.
