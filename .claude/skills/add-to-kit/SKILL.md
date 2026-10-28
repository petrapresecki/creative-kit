---
name: add-to-kit
description: Add a website or idea to creative-kit. Research it in a real browser, recommend what is worth taking, ask Petra, then write inspo pins, a theme and/or blocks that follow the kit's rules and check them on the showcase site. Use when Petra shares a site URL as inspiration, or asks for a theme or block from a site or from existing pins.
---

# Add to the kit

Petra shares a site (or several) and says what she likes about it. You turn it into kit material: **pins** (always), and when it earns it a **theme** and **blocks**. The repo rules in `CLAUDE.md` still apply. This skill adds the workflow, and the lessons that aren't obvious from the code.

Looking for sites yourself (Petra asks for inspo without a URL)? Start with the galleries in `content/sources.json`, minimal.gallery first. For fonts, ABC Dinamo is her pick; its faces are paid, so a theme still uses the closest Google font and puts the Dinamo face first in `fallback` when it's the one she'd license.

Shortcuts: "make a theme from <pins/site>" or "build a block from <pin>" skips the research when the pins already exist. Read those pins and their images, then go to step 3.

## 1. Research the site

Interact with it the way a visitor would. One screenshot of the top is not research.

```bash
node .claude/skills/add-to-kit/scripts/capture.mjs <url> <site> --out <scratchpad>/capture [--click "<css selector>"]
```

From the repo root (so `playwright` resolves), this saves 1440×900 frames: the intro animation (`load0-5`), a slow scroll (`s02…`), hovers over the biggest type and links (`hover0-3`), a pointer sweep, a fast flick (`fast`, `settled`) and an optional click (`click0-5`). It also writes `<site>.json` with fonts (family, size, weight, case, tracking), colours by frequency, libraries, canvases, CSS animations and blend modes.

Then:
- **Look at every frame** (Read the JPGs). Most of the notes come from what you see, not from the JSON.
- Dig into anything that moves. Write a small Playwright script in the scratchpad for the specific interaction: hover one title, click a card and grab frames every 250ms, check `document.getAnimations()`, read `outerHTML` of the element. A fullscreen `<canvas>` means WebGL. Say so, and work out what it draws.
- Check the other pages the nav links to (home, about, a project page). Transitions between them are often the best part.
- Check what the kit already has so you don't duplicate it: `ls registry/blocks themes content/inspo`, and read the closest block when an effect looks familiar.

## 2. Recommend, then ask

Before building anything, tell Petra what you found and what you'd take. Use AskUserQuestion with `multiSelect: true`, recommended options first and marked "(Recommended)". Typical questions:

- **Pins:** always write them. Ask only when there are more than ~5 candidates, to pick which.
- **Theme:** offer one when the site's palette or type has its own character. Mention which paid fonts you'd swap for free ones.
- **Blocks:** one option per reusable effect, each with one line on what it does, whether it's WebGL or DOM/SVG, and which existing block it's close to. Recommend the 2–4 that are most distinctive and reusable. Skip effects that only work with that site's content.

Recommend from what Petra said she likes (typography, colour, animation…). If she didn't say, ask that first.

## 3. Build

### Pins (`content/inspo/<id>.json`)
- Format is in `CLAUDE.md`. Library ids are `lib-<site>-<thing>`; project ids are `<project>-<thing>`.
- One pin per idea (type, colour, a motion, an interaction, the overall concept), each with its own image. Copy the best frames to `content/inspo/images/<site>-<thing>.jpg`, JPEG, at most 1600px wide.
- In `note`, write what happens, then how it's built, with real values: font names and sizes, hex codes, durations, the technique (SVG filter, clip-path, WebGL). End with what is worth reusing. Write it plainly.
- `added` is `Date.now()`, plus 60000 per pin so they sort in order. `verdict` is what Petra said, `love` by default for sites she shared.

### Themes (`themes/<id>.json`)
- **Naming:** name each theme after a material or substance it looks like: one short English word, id = lowercase name. Never use the source site's name or a person's name. Current themes are **Graphite, Cinnabar, Neon, Marzipan, Vinyl, Quartz, Porcelain, Gouache, Linocut, Silicon, Cyanotype, Rhinestone**. Pick a new name that sits well with these and is clearly different from them.
- Add the id to `order` in `apps/site/src/data/themes.ts`, or it sorts first.
- **Colour roles:** `paper` and `ink` must read as body text (aim for 4.5:1). `accent` and `mist` are used as cell backgrounds with `ink` text on top, so they must carry ink. `muted` is secondary text on `paper`. Extra brand colours go in `palette`.
- **Fonts:** Google Fonts only. Pick the closest free face and put the original first in `fallback` (e.g. `"'Neue Haas Grotesk Display', 'Helvetica Neue', Arial, sans-serif"`). Check the CSS URL returns 200. `display` is what `font-display` headlines use; `mono` is what `.caption` uses. Leave `mono` out to make captions use the sans.
- `inspiredBy` lists the pin ids.

### Blocks (`registry/blocks/<slug>/`)
Follow the block rules in `CLAUDE.md`. On top of that:
- When the demo only makes sense in one theme (it needs that theme's two faces, its palette…), set `"theme": "<id>"` in `meta.json` so the demo opens in it.
- Prefer DOM, CSS and SVG filters over WebGL when they get the look: they're lighter, accessible and keep real fonts. Use WebGL (`"webgl": true`) when the effect needs it.
- **Scroll containers:** a demo's scroller ref is not attached yet when the block's useGSAP first runs, so `scroller?.current` is null there and ScrollTrigger silently watches the page instead (this broke `pull-apart-heading` and `parallax-window`). For ScrollTriggers: `const scrollerEl = useScroller(scroller)` from `@kit/lib/gsap`, return early while it's `undefined`, pass `scroller: scrollerEl ?? undefined`, and add it to the dependencies. For hand-rolled scroll handlers: read `scroller?.current` lazily and listen with `window.addEventListener('scroll', fn, { capture: true, passive: true })`.
- **Check the effect really moves:** scroll the demo and compare the animated styles at a few positions (`check.mjs` frames, or log `style.width`/`transform`). A tween can run without visibly changing anything, e.g. tweening from `scrollWidth` of a full-width row.
- Reuse existing blocks through `registryDependencies` (e.g. `cut-type` titles inside `reach-index`).
- Respect `prefersReducedMotion()`. Give hover effects a touch fallback, e.g. show the media inline under `md`.
- Restart `pnpm dev` after adding a block folder.
- Write a `demo.tsx` with `controls` for the props worth playing with, sample content from `@site/data/demo`, and its own scroll container (`data-lenis-prevent` plus the `scroller` prop) when it scrolls.

## 4. Check it

```bash
./node_modules/.bin/tsc -b && ./node_modules/.bin/eslint .
./node_modules/.bin/vite --config apps/site/vite.config.ts --port 5317 --strictPort   # run in the background
node .claude/skills/add-to-kit/scripts/check.mjs --url http://localhost:5317 --out <scratchpad>/check block:<slug> theme:<id>
node scripts/previews.mjs <slug...> --url http://localhost:5317
```

- Use `pnpm` or `./node_modules/.bin/…`, **not `npx`**: once it added a yarn `packageManager` field to `package.json`. If `git diff package.json` shows changes you didn't make, revert them.
- `check.mjs` saves the demo at rest, scrolled and hovered, plus theme pages, and prints console errors. **Read the frames** and fix what looks wrong: clipped bubbles, an effect that never triggers, unreadable colours.
- If a preview caught a dull moment (an effect at rest), replace `apps/site/src/assets/previews/<slug>.jpg` with a better frame resized to 980px wide.

## 5. Wrap up

Summarise what you added: pins (by idea), the theme (name and why), blocks (what each does). Mention any free font substitutions, and anything you left out and why. Offer to commit on `dev` (the default branch): `content:` for pins, `feat:` for blocks and themes. Don't push unless Petra asks.
