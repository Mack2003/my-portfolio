# Reference Notes

The HTML in `stitch-page-v1.html` is preserved unchanged. The following items are copied verbatim and have not been independently confirmed by Malay:

- Hero/About copy describes role availability, engineering experience and creative/cloud skills; source sections 1 and 3.
- About facts include an AWS certification, a current obsession, and other personal/professional claims; source section 3.
- Skills stickers and project cards describe specific production work, apps, architectures and technologies; source sections 6 and 7.
- Violin copy calls Malay a classical musician and claims a 420-day practice streak, completed studies, current study progress and named repertoire; source section 8. This conflicts with the confirmed fact that Malay wants to learn violin and has not said that he plays.
- The source displays `malay@ray.dev`, social profile links and a 2025 copyright/update date; source sections 8, 10 and 11. Confirm these before treating them as current facts.
- The hero status badge has `py- space-xs` with a stray space, so Tailwind cannot interpret it as the intended padding utility.
- The violin waveform includes `h-15` and `h-13`, which are not defined by the supplied Tailwind spacing scale.
- The source `<main>` has `w-full bg-surface min-h-[calc(100vh-80px)] pt-16`, and its inner wrapper has `flex flex-col w-full text-on-surface`. These classes were not listed in the earlier scaffold composition brief; the copied page follows the HTML.
- At viewport widths of 390px and 820px, the source page's body is 9px wider than the viewport. The copy retains this source behavior rather than changing the design during the reference-copy pass.
- In Next.js, the imported global stylesheet loads before the Google Fonts stylesheets, unlike the reference's generated Tailwind stylesheet. A narrowly scoped specificity rule in `globals.css` preserves the reference's Tailwind text sizing on Material Symbols without changing the copied markup.

These are reference observations only. Do not silently change copied markup; ask Malay before reworking placeholder content.
