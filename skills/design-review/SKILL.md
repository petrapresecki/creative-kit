---
name: design-review
description: Review a website's design the way a senior designer would, for Petra's creative-kit process (steps 9 and 10). Screenshots every page at phone, tablet and desktop width, runs automatic checks (type scale, colours, contrast, spacing, overflow, tap targets, images, focus, reduced motion, weight), judges it against the site's concept and the kit's field guide, and writes a short, prioritised review that explains why each fix matters. Launch mode adds titles, share previews, icons and the 404 page. Use when Petra asks for a review, critique, feedback, "what's wrong with this", "is it ready", or a pre-launch check of a site, in any repo.
---

# Design review

Petra is learning to design by building. A review is where she learns the most: it finds what she has stopped seeing and says **why** it matters, in the field guide's words. Be the honest, specific designer looking over her shoulder, not a linter. Few notes, ranked, each with a concrete fix.

## The rules

- **Judge against the site's own concept first.** `concept/CONCEPT.md` holds the idea and its principles. A choice that breaks a general rule but serves the concept on purpose is fine: say so. If the concept itself seems to be the problem, say that separately, once.
- **Rank ruthlessly.** At most 5 "fix first" notes. Big things (hierarchy, the idea not showing, a broken phone layout, unreadable text) come before small ones (a 2px misalignment). Leave out what doesn't matter yet.
- **Every note is concrete.** Where (page, width, screenshot), what's wrong in plain words, which principle (field guide name), why it matters to a visitor, and the change with real values: sizes from the theme's scale, spacing from the scale, colours from the theme's roles, and the file or component when you can find it.
- **Say what works.** 2–4 specific things to keep, so she learns what good looks like in her own work. No generic praise.
- **Fixes take things away more often than they add.** Don't suggest new effects as fixes unless something is really missing (restraint is a principle).
- **The copy test.** For every kit piece the concept's kit map lists, compare the result with its source pin image. If it would pass for the source site, that's a note.
- **Plain words, no jargon without a gloss.** "Proximity (things that belong together sit closer)".

## 1. Get ready

1. **Find the kit:** `node ~/.claude/skills/site-concept/scripts/digest.mjs --out <scratchpad>/kit-digest.md` (first line: the kit folder, `<kit>` below). Read `<kit>/content/field-guide.json`: every principle has a "check" you'll use, and its pins are examples you can point Petra to.
2. **Read the site's intent:** `concept/CONCEPT.md`, `concept/LAYOUT.md`, `concept/CONTENT.md`, `concept/theme.json` when they exist, and the newest review in `concept/reviews/` (what was flagged last time, and whether it's fixed).
3. **Get a URL.** Use what Petra gives you. Otherwise start the site's dev server in the background (`pnpm dev`, read the port from its output). For **launch mode**, review the production build (`pnpm build && pnpm preview`) or the deployed URL, because dev servers are slower and heavier.
4. **Pick the pages:** the home page and one of each page type (a project, about, contact…), from the sitemap in `CONTENT.md` or the site's router. Ask only if it's unclear.

## 2. Capture and measure

```bash
node ~/.claude/skills/design-review/scripts/review.mjs <url> --pages /,/about,/work/<one-project> --out concept/reviews/<YYYY-MM-DD> [--launch]
```

For every page at 390, 834 and 1440px it saves the first screen, the full page, a blurred greyscale "squint" shot (phone and desktop), a keyboard-focus shot and a reduced-motion shot, and measures type sizes, families and weights, text and background colours, every text/background pair's contrast, spacing values, horizontal overflow, small tap targets, image alt text and file sizes, headings, unnamed links, errors, failed requests, page weight, LCP and layout shift. `--launch` adds titles, descriptions, share preview tags (and whether the og:image loads), icons, canonical, links to localhost, the 404 page, robots.txt and sitemap.xml.

Read `report.md` first, then **look at every screenshot** (Read the JPGs). The numbers point to problems; the screenshots show whether they matter.

Motion doesn't show in still shots. When the concept has a signature moment or scroll motion, write a small Playwright script in the scratchpad (import from `<kit>/node_modules/playwright/index.mjs`) that scrolls, hovers or clicks it and grabs a frame every 100–200ms, and look at those too. Check the touch version at 390px as well.

## 3. Judge

Go through these in order and take notes with screenshot paths:

1. **The idea.** Can you tell the concept's idea from the first screen? Is the signature moment there, and does it work? Does each section follow from the idea?
2. **Hierarchy** (squint shots): on every page, is it obvious what's first, second and third? Does anything fight for first place?
3. **Scale, type and colour:** the report's type sizes against the theme's scale (stray sizes are a note); biggest-to-smallest ratio; families and weights (more than the concept names?); colours against the theme roles (off-palette colours); every contrast failure.
4. **Space, grid and rhythm:** spacing values against a scale (many one-off values usually mean nothing is grouped on purpose); edges lining up; repeated items following one pattern.
5. **Phone and tablet:** overflow, cramped or broken layouts, tap targets, hover-only interactions without a touch version, type that's too big or too small.
6. **Motion:** does each animation have a job? Is anything slow to let people read? Does reduced motion still work and still make sense?
7. **Wayfinding:** can you tell where you are and get back? Do overlays close with Escape, do project pages have their own URL?
8. **Craft:** images (blurry, oversized files, missing alt), headings, focus, errors, weight.
9. **The copy test** for each kit piece in the kit map.

Each principle in `field-guide.json` has a `check`: use it, and name the principle in your note.

## 4. Write the review

Write `concept/reviews/<YYYY-MM-DD>/REVIEW.md` (next to `report.md` and `shots/`):

```markdown
# Review · <site> · <date>

<One or two sentences: the overall state, honestly.>

## What's working
- <specific thing> (<principle>): <why it works>. `shots/home-1440-top.jpg`

## Fix first
### 1. <short title>
**Where:** <page, width> · `shots/…jpg`
**What:** <what's wrong, plainly>
**Why it matters:** <principle>: <effect on a visitor>
**Change:** <concrete change with values, and file/component if known>

## Then
- <smaller notes, one line each>

## Checks
| Check | Result |
|---|---|
| Contrast | … |
| Phone layout / overflow | … |
| Tap targets | … |
| Reduced motion | … |
| Keyboard focus | … |
| Images | … |
| Errors | … |
| Weight · LCP · CLS | … |

## Since last review
<what got fixed, what's still open; omit on the first review>

## One thing to learn
<one principle from this review: two or three sentences, a pin from the field guide that shows it done well, and a study to practise it: `cd <kit> && pnpm kit study <principle-id>`>
```

In **launch mode**, add a `## Launch checklist` with the checklist from `<kit>/content/process.json` (step `launch`), each item ticked, failed or "check by hand" (a real phone, font licences, forms, analytics, domain), with what you found.

## 5. Talk it through

In chat: the one-sentence verdict, the "fix first" titles, and the path to `REVIEW.md`. Then ask with AskUserQuestion (`multiSelect: true`) which fixes to make now, the fix-first items as options.

When she picks fixes, make them in the site's code, then re-run `review.mjs` on the affected pages into the same folder with a `-after` suffix (`--out concept/reviews/<date>-after`) and compare the before and after shots. Tell her what changed and what the numbers say now.

Offer, without doing it unasked: lessons from this review as `idea` pins in the kit (project = this site's id in `<kit>/content/projects.json`, verdict `love`, following the pin rules in `<kit>/CLAUDE.md`), and, when the site is about to launch, a launch-mode review.
