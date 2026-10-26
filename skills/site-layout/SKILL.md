---
name: site-layout
description: Turn a site concept into pages that work, in Petra's creative-kit process (steps 4–6). First content and structure (sitemap, sections, real copy, asset list), then the visual system tuned on that copy in a specimen page, then grey-box wireframes with 2–3 options per key section, compared at phone and desktop width and switched to the styled look. Use after site-concept, or when Petra needs to work out pages, content, copy, a sitemap, wireframes, layouts or the type and colour system for a site, in any repo.
---

# Site layout

Petra has a concept (usually `concept/CONCEPT.md` from the `site-concept` skill) and needs it to become pages. You take her through three steps of her process, in order. Content comes before the look, and the look comes before motion:

4. **Content and structure:** which pages, which sections, what each one says. Output: `concept/CONTENT.md`.
5. **Visual system:** type, colour, spacing and grid, tuned on the real copy. Output: `concept/theme.json` and `concept/system/index.html`.
6. **Layout:** each section on the grid, with options compared at phone and desktop width. Output: `concept/wireframes/` and `concept/LAYOUT.md`.

Petra is learning to design as she goes. **Teach while you work, briefly:** when you make or suggest a decision, say in one sentence which principle it comes from, using the field guide's names (Hierarchy, Space, Grid, Rhythm, Content first…) so the words become familiar. Never lecture, never more than a sentence or two at a time.

She can stop after any step, or ask for just one ("make wireframes for the about page"). Check what already exists in `concept/` and pick up from there.

## 0. Find the kit and the concept

```bash
node ~/.claude/skills/site-concept/scripts/digest.mjs --out <scratchpad>/kit-digest.md
```

The first line is the kit folder (`<kit>` below). Read:
- `concept/CONCEPT.md` (idea, principles, visual system, pages, kit map) and `concept/theme.json`, if they exist. The concept's principles settle every question below. If there's no concept, ask whether to run `site-concept` first, or work from a short brief she gives now (then write it at the top of `CONTENT.md`).
- `<kit>/content/field-guide.json`: the principles, each with how to check it. You use them in every step.
- `<kit>/content/process.json`: what steps 4–6 should end with (`done`).
- The repo itself: existing copy, content files, images in `public/`, an old site. Real material beats drafts.

## 4. Content and structure

Designers decide what goes on the page before how it looks. This step stops layouts that don't fit the real copy, and it usually makes the site simpler.

1. **Sitemap.** Every page with its URL, and how people move between them (nav, links, drawers, next/previous). Keep it as small as the content allows; a one-page site is a fine answer.
2. **Sections per page, in order.** For each: its job in one line (what it must say or show), the content, and its **priority** on the page (first, second, third thing to read). The priorities become the hierarchy later.
3. **Real copy.** Write it with Petra: the hero line, intros, project descriptions, the about text, the footer. Use what exists; draft what doesn't, at its real length, marked `[draft]`. Give 2–3 versions of the lines that matter most (hero, intro) and let her choose. Lorem ipsum is never allowed.
4. **Asset list.** Every image, video and file: what exists (with path), what's missing, who supplies it, and the format and size it needs.
5. **Content stress test.** Note the longest and shortest real item for anything repeated (project titles, descriptions, names), and how many there are. Layouts get checked against these later.

Write `concept/CONTENT.md` in that order, then show Petra the sitemap and the sections in chat (short) and ask what to change. Use AskUserQuestion only for real choices (for example which hero line).

## 5. Visual system

A small, shared system is what makes a site feel consistent: a type scale, colour roles, one spacing scale and a grid. Start from `concept/theme.json` (or the kit theme the concept names: copy `<kit>/themes/<id>.json` to `concept/theme.json`).

1. Write `concept/system/copy.json` with real lines from `CONTENT.md` for each type step: `display`, `headline`, `title`, `lead`, `body`, `caption`. Use the longest real heading for `headline`, so the specimen shows the hard case.
2. Build the specimen with the concept's grid numbers:
   ```bash
   node ~/.claude/skills/site-layout/scripts/specimen.mjs concept/theme.json --copy concept/system/copy.json --out concept/system/index.html --site "<Site>" --cols 12 --gutter 24 --margin 20 --cols-m 4 --gutter-m 12 --margin-m 16
   open concept/system/index.html
   ```
   It shows every colour pair's contrast (pass/fail), the fonts, each type step set in the real copy with its phone and desktop size, the steps together, the spacing scale, the grid, radius and easing. Everything is editable in the page.
3. **Check it before Petra looks:** capture it (`node <kit>/.claude/skills/add-to-kit/scripts/capture.mjs "file://$PWD/concept/system/index.html" system --out <scratchpad>/system --no-hover`) and read the frames. Fix any failing contrast pair, more than 5 type sizes, a biggest/body ratio under about 4× (unless the concept is deliberately quiet), and type that breaks badly on the real copy.
4. Petra tunes it in the browser and presses **Copy theme.json**, then pastes it to you (or tells you what to change). Write the result to `concept/theme.json` and update the visual-system part of `CONCEPT.md` if it changed.

Done when: every text colour passes, five type sizes or fewer, all tried on real copy, and the grid is written down with numbers.

## 6. Layout

Wireframes are grey boxes on the grid, with the real copy at its real sizes, so Petra judges the arrangement and not the colours. Then one key switches them to the styled version.

### Set up

```bash
node ~/.claude/skills/site-layout/scripts/wire.mjs concept/wireframes --theme concept/theme.json --site "<Site>" --cols 12 --gutter 24 --margin 20 --cols-m 4 --gutter-m 12 --margin-m 16
```

This writes `wire.css`, `wire.js`, `theme.css` (re-run it whenever the theme or grid changes) and a starting `index.html`. Make one HTML file per page (`index.html`, `about.html`, `project.html`…), each linking the same three files. The vocabulary is in the comment at the top of `index.html`:

- `.wf-grid` with children `style="--span: 6; --start: 2; --span-m: 4"` (desktop and phone columns)
- `.wf-section[data-label]`, `.wf-stack`, `.wf-row`, `.wf-screen` (100svh), `.wf-sticky`, `.wf-rule`
- `.wf-img` / `.wf-video` with `style="--ratio: 4 / 5"` and `data-label` saying what goes there; an `<img>` inside when the image exists (relative path to the repo's real file)
- type and colour classes named like the kit's tokens: `text-display` … `text-body`, `caption`, `bg-ink`, `bg-accent`, `bg-mist`, `text-muted`, so they carry straight into the build
- `.wf-note`: a short note for Petra on why a layout is the way it is (hidden in styled mode)

### Options

For the sections that matter most (usually the hero, the work or product list, the project page and anything carrying the signature moment), make **2–3 options** inside a `.wf-options[data-name="Hero"]` group, each a child with `data-option="A" data-label="Big statement"`. Rules:
- Options differ in **arrangement**: what comes first, what's big, how it sits on the grid, how many columns. Not in colour or decoration.
- Each grows from the concept's idea and principles, and names its source in a `.wf-note` when it borrows from a pin or a kit grid system (the Grids systems in the digest, Aspen cells, Obys centre line…).
- At least one option is the quiet, simple one.
- Simple sections get one layout, no options.

Every section must also work at 390px. Decide the phone layout on purpose (`--span-m`, order, what's hidden), don't let it just stack.

### Check, then show

Before Petra sees anything, check it yourself at both widths and in both modes. Write a small Playwright script in the scratchpad (import `playwright` from `<kit>/node_modules/playwright/index.mjs`) that opens each page at 1440×900 and 390×844, clicks each option tab (`.wf-tabs button`), and saves full-page shots; then press `m` for styled mode and shoot again. Also take a **squint** shot (`html { filter: blur(7px) grayscale(1) }`): the first, second and third thing on each page should still be obvious. Fix overflow, broken phone layouts, options that look the same, and anything where the hierarchy disappears.

Then open the wireframes for Petra and tell her how to use them: tabs above each section switch options, **C** shows phone and desktop side by side, **G** the grid, **M** wire or styled, **Copy choices** copies her picks to paste back. Ask her to go through it and paste the choices with any notes.

### Write it down

Write `concept/LAYOUT.md`: for each page, each section in order with the chosen option, its spans on desktop and phone, what's sticky or full-bleed, and Petra's notes. Delete the options she didn't pick from the HTML (keep them in a `## Rejected` list in `LAYOUT.md`, one line each, with why). Then switch to styled mode and check the whole site once more with her.

Done when every page has a chosen layout at both widths and the squint test passes on every page.

## Figma (optional)

If Petra wants to compose a page by hand, the Figma connector can take the wireframe or the styled page into a Figma file (the `figma:figma-generate-design` skill). Offer it only when she asks or when a page needs free composition (a poster-like hero, a collage). The HTML stays the source of truth.

## Hand-off

Summarise what's decided in a few lines and point to `CONTENT.md`, `theme.json` and `LAYOUT.md`. Then offer the next steps, without doing them unasked:
- **Motion (step 7):** prototype anything risky as a study (`cd <kit> && pnpm kit study <slug> [--p5]`) or extend the concept prototype.
- **Build (step 8):** `cd <kit> && pnpm kit new <site> --theme <id> --blocks <slugs> --install`, after adding `concept/theme.json` to the kit as a theme (material name, rules in `<kit>/CLAUDE.md`). Build in the order structure → system → motion, porting the wireframe's grid spans as they are.
- **Critique (step 9):** the `design-review` skill once pages exist.
