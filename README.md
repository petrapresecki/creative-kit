# creative-kit

My building blocks for creative websites: motion, effects, themes, grids and an inspiration library, with a showcase site that runs everything live.

## Manifesto

Most of what's in here started on someone else's website. The exception is everything from Iva's portfolio, which I built myself.

None of it is here to be copied as it is. These are things I like, kept as inspiration. When one of them goes into a new site, the job is to improve it and reshape it to fit that site's vibe, vision and context.

The hope is that one day every animation, block and theme in here gets replaced by our own version of it, made while building new sites.

What "made, not generated" means in practice, with dos, don'ts and a test for every page: [content/research/creative-sites.md](content/research/creative-sites.md).

```sh
pnpm install
pnpm dev          # the showcase site
pnpm kit list     # every block and theme
```

## Start a new site

```sh
pnpm kit new ../my-site --theme graphite --blocks melt-text,orbit-gallery --install
cd ../my-site && pnpm dev
```

## Come up with a concept

```sh
pnpm kit skills   # once: links the kit's skills into ~/.claude/skills
```

Then, in any repo, ask Claude Code for a concept for the new site (the `site-concept` skill). It goes through the whole kit, the galleries and ABC Dinamo, proposes 2–3 concepts on a visual board (each showing the inspo pins it grows from, and any blocks, themes or grids it builds on), prototypes the signature moment of the one you pick as a small working page, and then turns it into `concept/CONCEPT.md`: idea, visual system, pages, motion, and what to take from the kit and how to change it.

## Add blocks to an existing site

```sh
pnpm kit add work-index dither-reveal --to ../my-site --install
pnpm kit theme cinnabar --to ../my-site
```

Blocks are copied in as source (into `src/components/kit/`), so each site can change them freely.

## Where to look

Galleries with good website inspo (especially **[minimal.gallery](https://minimal.gallery/websites/)**):
[minimal.gallery](https://minimal.gallery/websites/) · [Site of Sites](https://www.siteofsites.co/?p=1) · [Godly](https://godly.website/) · [Httpster](https://httpster.net) · [Mindsparkle Mag](https://mindsparklemag.com/websites) · [Woo-hu](https://woo-hu.com/)

Fonts: [ABC Dinamo](https://abcdinamo.com/) (paid, with trial fonts for mockups).

The list lives in `content/sources.json` and shows on the site's Inspo page.

## What's inside

| Folder | What |
|---|---|
| `registry/blocks/` | Blocks: component, live demo, `meta.json` |
| `registry/lib/` | GSAP + Lenis setup, theme token reader, base CSS |
| `themes/` | Themes as JSON (colours, fonts, type scale, easing, radius) |
| `content/inspo/` | Inspiration pins + screenshots |
| `templates/starter/` | New-site template |
| `skills/` | Claude Code skills for other repos (`pnpm kit skills` links them) |
| `apps/site/` | The showcase website |
