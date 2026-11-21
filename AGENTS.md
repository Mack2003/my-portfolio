# Malay Ray Portfolio - Reference HTML Rules

Malay will give you the reference page as HTML. Your job is to copy it exactly as it is, section by section. Each section will be reworked later, so nothing may be improved now.

## Copy exactly

- Keep every class name in its original order, and every text string, emoji, id, data attribute, aria attribute, SVG path and image URL.
- Keep the DOM order, including parts that look wrong, such as two footers.
- Keep img, a and button tags as they are. Do not swap in next/image or next/link.
- Keep the Google-hosted image URLs. Do not download or replace images.

## Only these changes are allowed

- class to className, for to htmlFor, and any other attribute React needs in camelCase (tabindex, crossorigin).
- HTML-lowercased SVG attributes to React names, such as viewbox to viewBox, preserveaspectratio to preserveAspectRatio, stroke-width to strokeWidth and stroke-linecap to strokeLinecap.
- Inline style strings to style objects, void tags self-closed, and HTML comments to JSX comments with the same text.
- Moving the page's script logic into LegacyInteractions.tsx with 'use client' and useEffect. Same logic, same ids and classes, no refactor.

## Never

- Fix typos, broken or non-existent classes, accessibility problems, responsive issues or duplicated parts.
- Merge sections, extract repeated markup into components, or move text into data files.
- Add libraries, wrappers, extra classes or comments inside the copied markup.
- Reformat or rename anything.

If something looks wrong, do not fix it. Write it in `reference/NOTES.md`: what it is, where it is, and why it looks wrong. Example: the hero status badge contains the class `py- space-xs`, with a stray space.

## When the reference HTML arrives

1. Save it unchanged as `reference/stitch-page-v1.html`. A later version gets a new file name.
2. Port the page setup verbatim:
   - The object inside the `tailwind-config` script goes into `tailwind.config.ts` with all its keys (colors, borderRadius, spacing, fontFamily, fontSize) and `darkMode` set to class. Do not load the Tailwind CDN.
   - The base CSS from the style block (the `@layer base` rules and the hidden scrollbar rule) goes into `globals.css`, after the Tailwind directives.
   - `class="dark"` and `lang="en"` on html, and the body's class list, go into `layout.tsx`. Keep the page title.
   - Keep the Google Fonts links (preconnects, text fonts and Material Symbols Outlined) in the root layout head exactly as they are. If lint complains about them, disable only that rule for `layout.tsx`.
   - Leave out meta tags used only by the design tool, such as shell-type.
3. Split the body at its section comment markers. Copy each section's markup into its component file under the rules above. The header, dividers, footers and sound toggle each go to their own file.
4. Move the page's script into `LegacyInteractions.tsx`.
5. Check your work: run the dev server, open the reference HTML and the Next.js page side by side at 390px, 820px and 1440px wide, and confirm they look identical. Report any difference instead of fixing it.
6. Commit once per reference version, then wait. Malay will name the next section to rework.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
