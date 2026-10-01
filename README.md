# creative-kit

My building blocks for creative websites: motion, effects, themes, grids and an inspiration library, with a showcase site that runs everything live.

```sh
pnpm install
pnpm dev          # the showcase site
pnpm kit list     # every block and theme
```

## Start a new site

```sh
pnpm kit new ../my-site --theme iva --blocks melt-text,spiral-gallery --install
cd ../my-site && pnpm dev
```

## Add blocks to an existing site

```sh
pnpm kit add work-index dither-reveal --to ../my-site --install
pnpm kit theme ledger --to ../my-site
```

Blocks are copied in as source (into `src/components/kit/`), so each site can change them freely.

## What's inside

| Folder | What |
|---|---|
| `registry/blocks/` | Blocks: component, live demo, `meta.json` |
| `registry/lib/` | GSAP + Lenis setup, theme token reader, base CSS |
| `themes/` | Themes as JSON (colours, fonts, type scale, easing, radius) |
| `content/inspo/` | Inspiration pins + screenshots |
| `templates/starter/` | New-site template |
| `apps/site/` | The showcase website |
