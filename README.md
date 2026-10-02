# creative-kit

My building blocks for creative websites: motion, effects, themes, grids and an inspiration library, with a showcase site that runs everything live.

## Manifesto

Most of what's in here started on someone else's website. The exception is everything from Iva's portfolio, which I built myself.

None of it is here to be copied as it is. These are things I like, kept as inspiration. When one of them goes into a new site, the job is to improve it and reshape it to fit that site's vibe, vision and context.

The hope is that one day every animation, block and theme in here gets replaced by our own version of it, made while building new sites.

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

## Add blocks to an existing site

```sh
pnpm kit add work-index dither-reveal --to ../my-site --install
pnpm kit theme cinnabar --to ../my-site
```

Blocks are copied in as source (into `src/components/kit/`), so each site can change them freely.

## Where to look

Galleries with good website inspo (especially **[minimal.gallery](https://minimal.gallery/websites/)**):
[minimal.gallery](https://minimal.gallery/websites/) · [Godly](https://godly.website/) · [Httpster](https://httpster.net) · [Mindsparkle Mag](https://mindsparklemag.com/websites) · [Woo-hu](https://woo-hu.com/)

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
| `apps/site/` | The showcase website |
