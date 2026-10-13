---
name: site-concept
description: Come up with a concept for a new website, built first on the inspo library in Petra's creative-kit, then on its blocks, themes and grids where they fit, plus fresh sites from her favourite galleries and fonts from ABC Dinamo. Researches all of it, proposes 2–3 distinct concepts on a visual board, prototypes the signature moment of the one she picks, then deepens it into a concrete site plan. Use when Petra starts a new website or asks for a concept, direction, moodboard or "what should this site be" for a project, in any repo.
---

# Site concept

Petra is starting a website. You research her kit and the wider web, propose **2–3 concepts** she can pick from, build a **working prototype** of the picked concept's signature moment, then turn it into a **concrete site**: idea, visual system, pages, motion, and what gets built.

The kit is the main source, in this order:
1. **The inspo pins** (`content/inspo/`): the sites, details, ideas and decisions Petra collected. This is where each concept starts.
2. **Blocks, themes and grids,** when the concept needs them: they're tested, working versions of things in those pins.
3. **Galleries and fonts,** to fill the gaps the kit doesn't cover.

Each concept should be clearly made from her pins, grown into the new site. Read the rules below before you look at any of it.

## The rules (from the kit's manifesto)

Most of the kit started on other people's websites. Petra wants it used, motion and all: new sites that bring in what was good and let it grow into something of their own along the way.

- **The idea comes from the site; the pins are where you look first.** Each concept's organising idea grows from the new site's own world: its subject, content, people and use. If it would work just as well for any other client, it's not a concept yet. To shape it, go to Petra's pins before anything else: her loved sites, the details she pinned, her ideas and decisions. Each concept should grow from a handful of pins, and you should be able to say which ones.
- **Then blocks, themes and grids, if the concept needs them.** Once you know which pins a concept grows from, check whether the kit already has a working version: a block built from those pins, a theme, a grid system. Reshaping one beats starting from zero. They're optional, though. Use them where they serve the concept and leave them out where they don't. A quiet site may need no blocks at all.
- **Three depths.** `base`: start from the piece's working code, animations included, and shape it to the site (its content, form and timing). `reworked`: take its technique to make a different piece. `principle`: only the idea under it. Pins are usually `principle` or `reworked`; blocks, themes and grids are usually `base` or `reworked`.
- **Every kit piece gets a "from → to".** Say what it was, what it becomes here and why it fits this site. A block's motion comes along by default; tune it to the site rather than dropping it. The copy test: put the result next to the source site. If people would think it's the same thing, give it more of the new site's own content and feel. Petra's own lesson (pin `lib-idea-mix`): borrow the technique, not the look. The Aspen dither trail only worked once it printed Iva's own projects.
- **One thing per source site, at most.** Never take a source site's layout, type, palette and signature motion together. A kit theme or block counts as its source site's one thing. Mixing pieces from different sources, and adding something new, is what makes the result yours.
- **Iva's portfolio is Petra's own work** (project `iva`), so there's nothing to copy there. It still gets reworked to fit the new site.
- **Fonts are made to be licensed and used.** ABC Dinamo faces are paid. Name the Dinamo face you'd license, and give the closest Google font as a stand-in for building and mockups. Dinamo's trial fonts are for mockups only.

## 0. Find the kit

```bash
node ~/.claude/skills/site-concept/scripts/digest.mjs --out <scratchpad>/kit-digest.md
```

The script finds the kit from its own location. `CREATIVE_KIT=/path` points it at another checkout. The first line it prints is the kit folder; call it `<kit>` below. If the kit is missing, ask before cloning: `gh repo clone petrapresecki/creative-kit ~/projects/creative-kit && cd ~/projects/creative-kit && pnpm install`.

Concept files go in `concept/` in the repo you're working in. If that repo is creative-kit itself, ask where the new site lives.

## 1. The brief

Read what the current repo already says: README, CLAUDE.md, copy, content, brand files, an old site, whatever is there. Then ask only for what's missing. Use one AskUserQuestion round where the options are clear, and plain questions otherwise:

- What is the site, who is it for, and what should a visitor do or feel?
- What content really exists: number of projects or products, photos, video, how much copy?
- The tone in a few words, plus any sites, brands or things outside the web it should feel like.
- Must-haves and no-gos, including what Petra already knows she doesn't want.
- Site type (Creative, Product / service, Portfolio, Webshop) and limits: paid fonts OK, WebGL OK, who edits it later.

If Petra gave a rich brief, don't make her repeat it. Write the brief back in 4–6 lines and get a yes before the deep dive.

## 2. The deep dive

This step is research, not choosing. Collect threads worth pulling and keep a record of where each came from.

Read the whole digest, then go through the kit in Petra's order.

**1. The inspo pins, all of them.** This is the heart of the research.
- Read every pin and look at every pin image (Read the JPGs at the paths in the digest). What's on screen matters more than the notes.
- **Walk the pins against the brief.** In `research.md`, go site by site and note which pins could feed this site and what they'd become. A minimal site that only shows restraint counts too. Most will not fit, which is fine. The point is that nothing gets skipped because the web research was fresher.
- `nope` pins are things she rejected. `decision`, `idea` and `question` pins are her lessons and open questions. Respect them.
- Group what fits into threads: principles you could build on, each backed by its pins.

**2. Blocks, themes and grids, for those threads.** For each thread, check whether the kit already has a working version. Each block's `inspiredBy` and each theme's "from pins" in the digest link them back to their pins.
- Look at the preview of each block that might help, then read its code in `<kit>/registry/blocks/<slug>/`. The code shows what it really does and which parts are worth keeping. To see blocks moving, run `cd <kit> && pnpm dev` and open `/blocks/<slug>`.
- Themes are whole systems (colour roles, a type pairing, a type scale, radius, easing). A concept can start from a theme and shift it (new colours, same pairing and scale), or take one part of it.
- Grid systems are in the digest. Use one when the concept's layout matches how it thinks.

**3. The web fills the gaps.** Run these in parallel with background subagents while you go through the kit, so the screenshots don't fill your context. Give each one the brief and the rules above. Look for what the kit doesn't cover for this brief, not for replacements of what it does:
- *Galleries:* browse the galleries in the digest, minimal.gallery first, for 6–10 live sites that relate to this brief, by subject or by mood. Capture each one with `node <kit>/.claude/skills/add-to-kit/scripts/capture.mjs <url> <name> --out <scratchpad>/web`. Report the URL, the one idea worth learning from it (a principle, not a feature list) and the best 1–2 frame paths.
- *Fonts:* go through the ABC Dinamo catalogue (from abcdinamo.com) and pick 3–5 faces that fit the tone, each with its character in a line, the closest Google Fonts stand-in, and a check that the Google CSS URL returns 200. Capture a specimen page for the best ones.

Write `<scratchpad>/research.md`: the pin walk, then the 8–15 threads that seem most alive for this site, each backed by its pins, any block, theme or grid that already builds it, any gallery URL, and an image path.

## 3. Two or three concepts

Each concept rests on **one organising idea** that comes from the site's world: a metaphor, a structure or a behaviour. Everything else (type, colour, grid, motion, which kit pieces) follows from it.

- Make them differ in the idea itself, not in three palettes on one layout. One good spread: one quiet and type-led, one built around a signature interaction, one that goes somewhere the kit hasn't been yet. Use it only when it fits.
- For each concept, cover: name, the idea in one sentence, why it fits the brief, mood, colours in the five kit roles (paper, ink, accent, mist, muted), type (Dinamo face plus stand-in, with a sample line from the site's real content), motion (what moves and what stays still), the signature moment people will remember, pages and sections, the kit pieces, what's new for this site, risks, and 3–6 reference images with captions.
- **Kit pieces:** first the pins the concept grows from (usually 3–6), then any blocks, themes or grids it builds on. Each has a depth and a "to". The board shows them as cards (pin shots first, then block previews, theme swatches and grid columns), so Petra sees at a glance what each concept is made from. When a block is left out on purpose, an entry with `id: null` and the reason helps. Signature moments that rework a kit block are often strong, because the hard part already works.
- Use the site's real words in samples and section names. Lorem ipsum hides whether an idea works.

Write `concept/concepts.json` (shape below), render the board and open it:

```bash
node ~/.claude/skills/site-concept/scripts/board.mjs concept/concepts.json --out concept/board --open
```

In chat, give each concept in 2–3 lines with the pins it grows from and any blocks, themes or grids it uses, then use AskUserQuestion to pick one. Mixing is allowed through "Other", for example "A's idea with B's type". Ask what she'd keep or drop.

## 4. Prototype the signature moment

Before writing the full plan, prove the riskiest part works: build the picked concept's signature moment as a small working page. If it doesn't land, it's cheap to change course now.

- **One self-contained file:** `concept/prototype/index.html`, opened straight from disk with no build. The concept's colours as CSS variables, its stand-in fonts from Google Fonts, and GSAP (plugins included) from `https://cdn.jsdelivr.net/npm/gsap@3/dist/`. Add Lenis, three.js or p5.js (`https://cdn.jsdelivr.net/npm/p5@2/lib/p5.min.js`) the same way only when the moment needs them. Petra likes p5.js for generative or drawn moments, so consider it when a concept is about patterns, particles or mark-making.
- **Only the moment,** plus enough page around it to judge it: the hero or the one section, with the real nav and type around it. Not the whole site.
- **Real content:** the site's actual words, and its images or video by relative path from the repo when they exist (`../../public/…`). Otherwise use plain blocks sized like the real media.
- **Built on the kit when the concept says so:** when the moment reworks a kit block, port the parts of its code you need (plain JS instead of React is fine) and make the changes the kit map describes. Don't rebuild from memory.
- **Make it feel right:** easing and timing from the concept, a touch version (tap instead of hover) and `prefers-reduced-motion`.
- **Check it yourself first:** `node <kit>/.claude/skills/add-to-kit/scripts/capture.mjs "file://$PWD/concept/prototype/index.html" proto --out <scratchpad>/proto [--click "<selector>"]`. Read the frames (load, scroll, hover, click) and fix whatever doesn't match the description. For anything specific, write a small Playwright script that drives the interaction and grabs frames every 100–250ms. Iterate until the frames show the moment.

Then add `"prototype": "prototype/index.html"` to the picked concept, re-render the board (it shows the prototype in a frame), open the prototype for Petra and ask how it feels: keep, tweak (what exactly), or it doesn't work (back to the concepts). Make tweaks in the prototype until she's happy. What you learn goes into the plan.

## 5. Make it concrete

Go deeper on the picked concept only. Re-research where it needs it: read the code of each kit piece it reworks, and look again at the source pins and gallery sites behind its references. Then write **`concept/CONCEPT.md`**:

1. **Idea:** the organising idea, and 3–5 principles that follow from it. Use these to settle every later design question.
2. **Visual system:** colour roles with hex values (`paper`/`ink` at least 4.5:1; `accent` and `mist` must carry `ink` text), extra palette colours, fonts (Dinamo face, stand-in, roles, weights), a type scale in the kit's steps (`display`, `headline`, `title`, `lead`, `body`) with sizes, leading and tracking, the grid (columns, gutter, margin, how it breaks on mobile), radius and easing. Also write these as `concept/theme.json` in the kit's theme format (see any `<kit>/themes/*.json`).
3. **Pages:** for each page, its sections in order. For each section: content, layout on the grid, what moves and when, and how it works on touch and on mobile.
4. **Motion language:** easings, durations, what scroll does, what hover does, the page transition, and the reduced-motion version.
5. **Signature moment:** described step by step, with the values the prototype settled (durations, easing, distances), what Petra changed, and a link to `prototype/index.html`.
6. **Kit map:** a table of every kit piece used (pins first, then blocks, themes, grids), with its depth (`base`, `reworked`, `principle`), what changes and why, plus the pieces you considered and left out, and why.
7. **New pieces:** what gets built from scratch.
8. **Content checklist:** what Petra or the client needs to supply, and what's missing today.
9. **Build plan:** the setup commands, the order of work (the signature moment first, ported from the prototype) and open questions.

Re-render the board with only the chosen concept, its prototype and its fuller references (`concept/concept.json` → `concept/board`).

## 6. Hand-off

Summarise the concept in a few lines and point to `concept/CONCEPT.md` and the board. Then offer the next steps. Don't do them without asking:

- **Pages and layout (the usual next step):** the `site-layout` skill turns the concept into content and structure, a visual system tuned on the real copy, and wireframes with options at phone and desktop width (steps 4–6 of the kit's process, `<kit>/PROCESS.md`).
- **Theme into the kit:** add `theme.json` to `<kit>/themes/` under a material name (the naming rules are in `<kit>/CLAUDE.md`), then apply it with `pnpm kit theme <id> --to <site>`. That's how the kit's themes get replaced by Petra's own over time.
- **Scaffold:** `cd <kit> && pnpm kit new <site> --theme <id> --blocks <slugs> --install` for an empty folder, or `pnpm kit add <slugs> --to <site>` for an existing one. Copied blocks belong to the site from then on: rework them as the kit map says.
- **Record it in the kit:** add the project to `<kit>/content/projects.json`, write a `decision` pin for the chosen concept and `idea` pins for the rejected ones (verdict `maybe`), and pin new gallery finds as library pins with the add-to-kit skill. Commit in the kit only when Petra says so (`content:` prefix, on `dev`).

## The board

`board.mjs` takes this JSON. Every field except `name` is optional. Image paths are absolute or relative to the JSON file, and they are copied into `<out>/images/` together with the kit thumbnails. For `kit` entries, `kind` is `pin`, `block`, `theme` or `grid` (the board shows them in that order). `id` is the pin id, the block slug, the theme id or the grid system's name as in the digest, or `null` for "none, because…". `depth` is `base`, `reworked` or `principle`. `prototype` is a path relative to the JSON file.

```json
{
  "site": "Site name",
  "brief": "The brief in two sentences.",
  "date": "2026-10-03",
  "concepts": [
    {
      "label": "A",
      "name": "Cellar ledger",
      "idea": "The organising idea in one sentence.",
      "why": "Why it fits this brief.",
      "mood": "quiet, inky",
      "colors": { "paper": "#f3efe6", "ink": "#2a1f1a", "accent": "#c9a0dc", "mist": "#e6dfd1", "muted": "#7d6f63" },
      "fonts": [
        { "role": "display", "family": "ABC Gravity", "standIn": "Big Shoulders Display", "google": "Big+Shoulders+Display:wght@700",
          "size": "64px", "weight": 700, "tracking": "-0.01em", "leading": 0.9, "case": "uppercase", "sample": "Real words from the site" }
      ],
      "motion": "What moves, what stays still.",
      "signature": "The one moment people remember.",
      "sections": ["Home: …", "About: …"],
      "kit": [
        { "kind": "pin", "id": "lib-obys", "depth": "principle", "to": "One line organises the page: today's date" },
        { "kind": "pin", "id": "lib-gn-type", "depth": "reworked", "to": "A grotesk and a serif at one small size, for wine names and tasting notes" },
        { "kind": "block", "id": "work-rows", "depth": "base", "to": "Rows become wines; the hover image becomes a scan of the label" },
        { "kind": "theme", "id": "porcelain", "depth": "reworked", "to": "Its type pairing and scale; colours swapped for cellar paper and ink" },
        { "kind": "grid", "id": "8-column axis", "depth": "base", "to": "The ledger's columns (vintage, grower, region, price) hang off the axis" },
        { "kind": "block", "id": null, "to": "No WebGL: the bar wants paper, not effects" }
      ],
      "prototype": "prototype/index.html",
      "new": ["What gets built from scratch"],
      "risks": ["What could go wrong"],
      "images": [{ "src": "/abs/path/to/frame.jpg", "caption": "lib-obys: one line organising the page (principle only)" }]
    }
  ]
}
```
