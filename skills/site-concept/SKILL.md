---
name: site-concept
description: Come up with a concept for a new website, drawing on Petra's creative-kit (blocks, themes, grids, inspo pins), fresh sites from her favourite galleries and fonts from ABC Dinamo. Researches all of it, proposes 2–3 distinct concepts on a visual board, then deepens the one she picks into a concrete site plan. Use when Petra starts a new website or asks for a concept, direction, moodboard or "what should this site be" for a project, in any repo.
---

# Site concept

Petra is starting a website. You research her kit and the wider web, propose **2–3 concepts** she can pick from, then turn the picked one into a **concrete site**: idea, visual system, pages, motion, and what gets built.

The kit is a library of inspiration. It is not a parts bin. Read the rules below before you look at any of it.

## The rules (from the kit's manifesto)

Most of the kit started on other people's websites. Petra doesn't want their work copied. She wants new sites that take what was good about it and make it their own.

- **Start from the site, not the kit.** Each concept grows from the new site's own world: its subject, its content, its people, how it will be used. Go to the kit afterwards, looking for what serves that idea. If a concept would work just as well for any other client, it's not a concept yet.
- **Borrow the technique, not the look.** (Petra's own lesson, pin `lib-idea-mix`: the Aspen dither trail only worked once it printed Iva's own projects.) Take the principle under an effect, such as "one horizontal line organises the whole page", and give it new content, form and meaning.
- **Every kit piece gets a "from → to".** For each block, theme or pin a concept uses, say what it was, what it becomes here and why it fits this site. The copy test: put the result next to the source site. If people would think it's the same thing, rework it more.
- **One thing per source, at most.** Never take a source site's layout, type, palette and signature motion together. Mixing ideas from different sources, and adding something new, is what makes the result yours.
- **Less is fine.** A concept may use no blocks at all and take only the restraint of a few minimal pins, or one theme's colour logic. Use a lot from the kit only when it suits what the site is.
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

**The kit.** Read the whole digest. Then:
- Look at the images (Read the JPGs at the paths in the digest): every `site` pin, the `shot` pins Petra loved, and the previews of blocks that might relate. What's on screen matters more than the notes.
- `nope` pins are things she rejected. `decision`, `idea` and `question` pins are her lessons and open questions. Respect them.
- For any block a concept might use, read its code in `<kit>/registry/blocks/<slug>/`. The code shows what it really does and which parts are worth keeping. To see blocks moving, run `cd <kit> && pnpm dev` and open `/blocks/<slug>`.
- Themes are whole systems (colour roles, type scale, radius, easing). A concept can borrow how a theme thinks, for example "one accent, used only for state", without using its colours.

**The web.** Run these in parallel with background subagents so the screenshots don't fill your context. Give each one the brief and the rules above:
- *Galleries:* browse the galleries in the digest, minimal.gallery first, for 6–10 live sites that relate to this brief, by subject or by mood. Capture each one with `node <kit>/.claude/skills/add-to-kit/scripts/capture.mjs <url> <name> --out <scratchpad>/web`. Report the URL, the one idea worth learning from it (a principle, not a feature list) and the best 1–2 frame paths.
- *Fonts:* go through the ABC Dinamo catalogue (from abcdinamo.com) and pick 3–5 faces that fit the tone, each with its character in a line, the closest Google Fonts stand-in, and a check that the Google CSS URL returns 200. Capture a specimen page for the best ones.

Write `<scratchpad>/research.md`: the 8–15 threads that seem most alive for this site, each with its source (pin id, block slug, URL) and an image path.

## 3. Two or three concepts

Each concept rests on **one organising idea** that comes from the site's world: a metaphor, a structure or a behaviour. Everything else (type, colour, grid, motion, which kit pieces) follows from it.

- Make them differ in the idea itself, not in three palettes on one layout. One good spread: one quiet and type-led, one built around a signature interaction, one that goes somewhere the kit hasn't been yet. Use it only when it fits.
- For each concept, cover: name, the idea in one sentence, why it fits the brief, mood, colours in the five kit roles (paper, ink, accent, mist, muted), type (Dinamo face plus stand-in, with a sample line from the site's real content), motion (what moves and what stays still), the signature moment people will remember, pages and sections, the kit pieces as "from → to", what's new for this site, risks, and 3–6 reference images with captions.
- Use the site's real words in samples and section names. Lorem ipsum hides whether an idea works.

Write `concept/concepts.json` (shape below), render the board and open it:

```bash
node ~/.claude/skills/site-concept/scripts/board.mjs concept/concepts.json --out concept/board --open
```

In chat, give each concept in 2–3 lines, then use AskUserQuestion to pick one. Mixing is allowed through "Other", for example "A's idea with B's type". Ask what she'd keep or drop.

## 4. Make it concrete

Go deeper on the picked concept only. Re-research where it needs it: read the code of each kit piece it reworks, and look again at the source pins and gallery sites behind its references. Then write **`concept/CONCEPT.md`**:

1. **Idea:** the organising idea, and 3–5 principles that follow from it. Use these to settle every later design question.
2. **Visual system:** colour roles with hex values (`paper`/`ink` at least 4.5:1; `accent` and `mist` must carry `ink` text), extra palette colours, fonts (Dinamo face, stand-in, roles, weights), a type scale in the kit's steps (`display`, `headline`, `title`, `lead`, `body`) with sizes, leading and tracking, the grid (columns, gutter, margin, how it breaks on mobile), radius and easing. Also write these as `concept/theme.json` in the kit's theme format (see any `<kit>/themes/*.json`).
3. **Pages:** for each page, its sections in order. For each section: content, layout on the grid, what moves and when, and how it works on touch and on mobile.
4. **Motion language:** easings, durations, what scroll does, what hover does, the page transition, and the reduced-motion version.
5. **Signature moment:** described step by step, so it could be built from the description alone.
6. **Kit map:** a table of every kit piece used, with source, what changes and how much (light retouch, rebuilt, principle only), plus the pieces you deliberately left out and why.
7. **New pieces:** what gets built from scratch.
8. **Content checklist:** what Petra or the client needs to supply, and what's missing today.
9. **Build plan:** the setup commands, the order of work (signature moment first, so it's proven early) and open questions.

Re-render the board with only the chosen concept and its fuller references (`concept/concept.json` → `concept/board`).

## 5. Hand-off

Summarise the concept in a few lines and point to `concept/CONCEPT.md` and the board. Then offer the next steps. Don't do them without asking:

- **Theme into the kit:** add `theme.json` to `<kit>/themes/` under a material name (the naming rules are in `<kit>/CLAUDE.md`), then apply it with `pnpm kit theme <id> --to <site>`. That's how the kit's themes get replaced by Petra's own over time.
- **Scaffold:** `cd <kit> && pnpm kit new <site> --theme <id> --blocks <slugs> --install` for an empty folder, or `pnpm kit add <slugs> --to <site>` for an existing one. Copied blocks belong to the site from then on: rework them as the kit map says.
- **Record it in the kit:** add the project to `<kit>/content/projects.json`, write a `decision` pin for the chosen concept and `idea` pins for the rejected ones (verdict `maybe`), and pin new gallery finds as library pins with the add-to-kit skill. Commit in the kit only when Petra says so (`content:` prefix, on `dev`).

## The board

`board.mjs` takes this JSON. Every field except `name` is optional. Image paths are absolute or relative to the JSON file. They are copied into `<out>/images/`.

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
      "kit": [{ "from": "work-rows", "to": "What it becomes here, and why" }],
      "new": ["What gets built from scratch"],
      "risks": ["What could go wrong"],
      "images": [{ "src": "/abs/path/to/frame.jpg", "caption": "lib-obys: one line organising the page (principle only)" }]
    }
  ]
}
```
