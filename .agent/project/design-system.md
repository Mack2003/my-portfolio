# Design System

The tokens below are copied from reference v1 into `tailwind.config.ts`. The reference copy deliberately retains its class typos; see `reference/NOTES.md`.

Material Symbols sizing utilities are preserved with a narrowly scoped CSS specificity adjustment in `src/app/globals.css`, since Next.js loads the Google Fonts stylesheets after the imported global stylesheet.

## Color tokens

| Name | Value | Role |
|---|---|---|
| `surface` | `#0d1228` | Main background |
| `background` | `#0d1228` | Background alias |
| `surface-dim` | `#0d1228` | Dim surface |
| `surface-container-lowest` | `#080d22` | Darkest panel and shadow |
| `surface-container-low` | `#151a31` | Alternate section surface |
| `surface-container` | `#191e35` | Card surface |
| `surface-container-high` | `#242940` | Raised card surface |
| `surface-container-highest` | `#2f334b` | Highest card surface |
| `surface-variant` | `#2f334b` | Variant surface |
| `surface-bright` | `#333850` | Bright surface |
| `surface-tint` | `#b2c5ff` | Surface tint |
| `on-surface` | `#dde1ff` | Primary text |
| `on-surface-variant` | `#c2c6d7` | Secondary text |
| `on-background` | `#dde1ff` | Text on background |
| `primary` | `#b2c5ff` | Primary accent |
| `primary-container` | `#5b8cff` | Primary container |
| `on-primary` | `#002b73` | Text on primary |
| `on-primary-container` | `#002565` | Text on primary container |
| `primary-fixed` | `#dae2ff` | Fixed primary |
| `primary-fixed-dim` | `#b2c5ff` | Dim fixed primary |
| `on-primary-fixed` | `#001848` | Text on fixed primary |
| `on-primary-fixed-variant` | `#0040a1` | Variant text on fixed primary |
| `inverse-primary` | `#0056d2` | Inverse primary |
| `secondary` | `#ffafd0` | Secondary accent |
| `secondary-container` | `#8c0058` | Secondary container |
| `on-secondary` | `#63003d` | Text on secondary |
| `on-secondary-container` | `#ff93c4` | Text on secondary container |
| `secondary-fixed` | `#ffd8e6` | Fixed secondary |
| `secondary-fixed-dim` | `#ffafd0` | Dim fixed secondary |
| `on-secondary-fixed` | `#3d0024` | Text on fixed secondary |
| `on-secondary-fixed-variant` | `#8c0058` | Variant text on fixed secondary |
| `tertiary` | `#2de0a5` | Tertiary accent |
| `tertiary-container` | `#00a576` | Tertiary container |
| `on-tertiary` | `#003826` | Text on tertiary |
| `on-tertiary-container` | `#003120` | Text on tertiary container |
| `tertiary-fixed` | `#58fdc0` | Fixed tertiary |
| `tertiary-fixed-dim` | `#2de0a5` | Dim fixed tertiary |
| `on-tertiary-fixed` | `#002115` | Text on fixed tertiary |
| `on-tertiary-fixed-variant` | `#005139` | Variant text on fixed tertiary |
| `error` | `#ffb4ab` | Error accent |
| `error-container` | `#93000a` | Error container |
| `on-error` | `#690005` | Text on error |
| `on-error-container` | `#ffdad6` | Text on error container |
| `outline` | `#8c90a0` | Outline |
| `outline-variant` | `#424654` | Variant outline |
| `inverse-surface` | `#dde1ff` | Inverse surface |
| `inverse-on-surface` | `#2a2f47` | Text on inverse surface |

## Type, spacing and shape tokens

| Token | Value | Role |
|---|---|---|
| `fontFamily.display`, `headline-*` | Rubik | Display/headings |
| `fontFamily.body-*` | Nunito Sans | Body copy |
| `fontFamily.label-code-*` | JetBrains Mono | Labels/code |
| `fontSize.display` | 56px / 64px, 800 | Display |
| `fontSize.display-mobile` | 36px / 44px, 800 | Mobile display |
| `fontSize.headline-lg` | 40px / 48px, 700 | Large heading |
| `fontSize.headline-lg-mobile` | 28px / 36px, 700 | Mobile large heading |
| `fontSize.headline-md` | 28px / 36px, 700 | Medium heading |
| `fontSize.headline-sm` | 22px / 30px, 700 | Small heading |
| `fontSize.body-lg` | 18px / 28px, 600 | Large body |
| `fontSize.body-md` | 16px / 24px, 500 | Body |
| `fontSize.body-sm` | 14px / 20px, 600 | Small body |
| `fontSize.label-code-lg` | 14px / 20px, 700, 0.02em | Large code label |
| `fontSize.label-code-sm` | 12px / 16px, 600, 0.04em | Small code label |
| `space-xs`, `space-sm`, `space-md`, `space-lg`, `space-xl` | 0.25, 0.5, 1, 1.5, 2.5rem | Spacing scale |
| `gutter-mobile`, `gutter` | 1rem, 1.5rem | Page gutters |
| `margin-mobile`, `margin` | 1.25rem, 3rem | Margins |
| `rounded` / `DEFAULT`, `rounded-lg`, `rounded-xl`, `rounded-full` | 0.25rem, 0.5rem, 0.75rem, 9999px | Radii |

## Copied class recipes

- Button: `inline-flex items-center justify-center font-label-code-lg text-label-code-lg bg-primary-container text-on-primary-container border-2 border-on-surface px-space-md py-space-xs rounded-lg shadow-[4px_4px_0px_#080d22] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#080d22] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all uppercase tracking-wider`
- Card: `bg-surface-container-lowest p-space-lg rounded-xl border-2 border-surface-variant shadow-[4px_4px_0px_#080d22] hover:border-primary transition-all flex flex-col justify-between group`
- Sticker: `sticker-chip cursor-pointer bg-surface-container-high px-space-md py-space-xs rounded-lg border-2 border-primary text-on-surface font-label-code-sm text-label-code-sm font-bold shadow-[3px_3px_0px_#080d22] -rotate-3 hover:rotate-0 hover:scale-105 transition-all`
- Hero status badge: `inline-flex items-center gap-space-xs px-space-md py- space-xs bg-surface-container-high border-2 border-tertiary rounded-full shadow-[3px_3px_0px_#080d22] -rotate-1 mb-8 hover:rotate-0 transition-transform`
- Window title bar: `bg-surface-container-high px-space-md py-3 flex items-center justify-between border-b-2 border-surface-variant`
- Sticker inspector banner: `bg-surface-container-high border-2 border-primary p-space-md rounded-xl flex items-center gap-space-md shadow-[4px_4px_0px_#080d22] transition-all`

The source has no separate toast class recipe. `rounded-2xl`, `rounded-3xl`, and arbitrary solid offset shadows also appear in the markup; use the reference strings rather than inventing replacements.
