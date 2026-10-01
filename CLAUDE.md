# creative-kit

Petra's library of building blocks for creative / style websites: motion and effect components, themes (design tokens), grids, a starter template, and an inspiration library. The showcase website in `apps/site` renders all of it.

## Commands
- `pnpm dev` — showcase site (Vite, root `apps/site`). Restart it after adding a new block folder; new folders outside the site root are not picked up live
- `pnpm build` — type-check + build the site to `dist/`
- `pnpm lint`
- `pnpm kit list | new | add | theme` — see `scripts/kit.mjs`

## Layout
- `registry/blocks/<slug>/` — one folder per block: component file(s), `demo.tsx` (site only, never copied), `meta.json`
- `registry/lib/` — shared helpers copied into projects as `src/lib/kit/*` (`gsap.ts`, `lenis.ts`, `tokens.ts`, `use-text-scramble.ts`, `kit.css`). `demo.ts` is site-only
- `themes/<id>.json` + `themes/theme.mjs` (shared by CLI and site: `themeVars`, `themeCss`, `googleFontsUrl`). Themes are named after a material or substance they look like (Graphite, Cinnabar, Neon, Marzipan, Vinyl, Quartz), never after the source site or a person; add new ids to `order` in `apps/site/src/data/themes.ts`
- `content/inspo/<id>.json` + `content/inspo/images/` — one pin per file; `content/projects.json` lists projects (`library` = general)
- `templates/starter/` — what `kit new` copies (it has its own CLAUDE.md)
- `apps/site/` — the showcase; `@kit` → registry, `@site` → apps/site/src, `@content`, `@themes`

## Block rules
- Imports inside blocks use `@kit/lib/<name>` and `@kit/blocks/<slug>/<File>`; the CLI rewrites them to `@/lib/kit/...` and `@/components/kit/...`
- Style only with theme tokens: `bg-paper text-ink bg-accent bg-mist text-muted`, `text-display|headline|title|lead|body`, `font-display font-mono`, `rounded-kit`, `ease-out-expo ease-in-out-quart`, `.caption`. WebGL blocks read colours with `readToken('--color-ink', fallback, el)`
- No project data inside blocks: take items/props; demos get sample content from `@site/data/demo`
- `meta.json`: title, description, category (Text, Media, Effects, 3D, Interaction, Motion, Navigation, Layout, Sections), files, lib, dependencies, devDependencies, registryDependencies, inspiredBy (pin ids), usedIn (project ids), webgl, theme (theme id the demo opens in, when the block needs that theme's fonts)
- Demos that scroll use their own scroll container (`data-lenis-prevent` + `scroller` prop). Blocks that take `scroller` wait for `useScroller(scroller)` from `@kit/lib/gsap` before creating ScrollTriggers (a parent's ref isn't attached yet when useGSAP first runs)
- Always import gsap from `@kit/lib/gsap`

## Inspo pins
`{ id, title, note, url?, kind: site|shot|idea|decision|question, section, verdict: love|maybe|nope, project, siteType?: Creative|Product / service|Portfolio|Webshop, image?: "images/<file>.jpg", added: epoch ms }`.
Researching a site: interact with it (scroll slowly, hover, click), capture mid-animation frames at 1440×900, save JPGs ≤1600px wide into `content/inspo/images/`, write pins, and link any block built from it via the block's `inspiredBy`.

## Git
GitHub Flow, conventional commits (`feat:`, `fix:`, `content:` for inspo, `style:`). Private repo: github.com/petrapresecki/creative-kit
