# creative-kit

Petra's library of building blocks for creative / style websites: motion and effect components, themes (design tokens), grids, a starter template, and an inspiration library. It is also her guide to the design process: an 11-step process, a field guide of design principles illustrated with her own pins, and studies to practise. The showcase website in `apps/site` renders all of it.

Petra is learning to design by building sites. When you help with design decisions, name the field guide principle behind them (Hierarchy, Space, Grid, Restraint…) in a sentence, so the vocabulary sticks. Don't lecture.

Most blocks and themes start from other sites (Iva's portfolio is Petra's own work). They are starting points to build with: bring them into new sites with their animations, then shape them to fit that site's content and feel (see the Manifesto in `README.md`).

Petra also wants to use **p5.js** sometimes, for generative and hand-drawn-feeling pieces (patterns, particles, drawing tools, type made of shapes). Suggest it when a piece is about drawing rather than moving DOM elements.

## Commands
- `pnpm dev` — showcase site (Vite, root `apps/site`). Restart it after adding a new block folder; new folders outside the site root are not picked up live
- `pnpm build` — type-check + build the site to `dist/`
- `pnpm lint`
- `pnpm kit list | new | add | theme | skills | study | docs` — see `scripts/kit.mjs`

## Layout
- `registry/blocks/<slug>/` — one folder per block: component file(s), `demo.tsx` (site only, never copied), `meta.json`
- `registry/lib/` — shared helpers copied into projects as `src/lib/kit/*` (`gsap.ts`, `lenis.ts`, `tokens.ts`, `use-text-scramble.ts`, `kit.css`). `demo.ts` is site-only
- `themes/<id>.json` + `themes/theme.mjs` (shared by CLI and site: `themeVars`, `themeCss`, `googleFontsUrl`). Themes are named after a material or substance they look like (Graphite, Cinnabar, Neon, Marzipan, Vinyl, Quartz, Porcelain, Gouache, Linocut, Silicon, Cyanotype), never after the source site or a person; add new ids to `order` in `apps/site/src/data/themes.ts`
- `content/inspo/<id>.json` + `content/inspo/images/` — one pin per file; `content/projects.json` lists projects (`library` = general); `content/sources.json` lists inspo galleries (minimal.gallery is Petra's favourite) and font foundries (ABC Dinamo); `content/research/*.md` are write-ups of research rounds; **`start-here.md` lists the sites Petra picked herself, open those first** (then e.g. `portfolios.md`: how good portfolios are built and what reads as AI-made; `creative-sites.md`: a Readymag-led case study and the manifesto of dos, don'ts and the test every concept and page must pass; `typography.md`: every face tried on Petra's portfolio, what the source sites really use and the free matches; `motion-and-3d.md`: the WebGL and motion award sites)
- `content/process.json` (the 11 steps, from brief to look back) and `content/field-guide.json` (principles, each with a check, mistakes, a practice and pin examples by id). Shown on the site at `/process` and `/guide`; `pnpm kit docs` regenerates `PROCESS.md` and `FIELD-GUIDE.md` from them, so edit the JSON, never the Markdown. When a pin id changes, update the field guide too
- `studies/<slug>/` — practice pieces: one self-contained `index.html` (GSAP or p5.js from a CDN, theme colours as CSS variables) + `meta.json` (title, prompt, tool `p5|gsap|css|three`, principles, pins, learned, added). `pnpm kit study <slug> [--p5]` scaffolds one; a slug named after a principle gets its practice as the brief. Shown at `/studies` in a sandboxed iframe
- `templates/starter/` — what `kit new` copies (it has its own CLAUDE.md)
- `skills/<name>/` — Claude Code skills for any repo, symlinked into `~/.claude/skills` by `pnpm kit skills`: `site-concept` (steps 1–3: brief, research, concept, signature prototype), `site-layout` (steps 4–6: content, visual-system specimen, wireframes), `design-review` (steps 9–10: critique and launch checks). Kit-only skills live in `.claude/skills/` (`add-to-kit`). Skill scripts find the kit from their own real path, so they work from any folder
- `apps/site/` — the showcase; `@kit` → registry, `@site` → apps/site/src, `@content`, `@themes`

## Block rules
- Imports inside blocks use `@kit/lib/<name>` and `@kit/blocks/<slug>/<File>`; the CLI rewrites them to `@/lib/kit/...` and `@/components/kit/...`
- Style only with theme tokens: `bg-paper text-ink bg-accent bg-mist text-muted`, `text-display|headline|title|lead|body`, `font-display font-mono`, `rounded-kit`, `ease-out-expo ease-in-out-quart`, `.caption`. WebGL blocks read colours with `readToken('--color-ink', fallback, el)`
- No project data inside blocks: take items/props; demos get sample content from `@site/data/demo`
- `meta.json`: title, description, category (Text, Media, Effects, 3D, Interaction, Motion, Navigation, Layout, Sections), files, lib, dependencies, devDependencies, registryDependencies, inspiredBy (pin ids), usedIn (project ids), webgl, theme (theme id the demo opens in, when the block needs that theme's fonts)
- Demos that scroll use their own scroll container (`data-lenis-prevent` + `scroller` prop). Blocks that take `scroller` wait for `useScroller(scroller)` from `@kit/lib/gsap` before creating ScrollTriggers (a parent's ref isn't attached yet when useGSAP first runs)
- Always import gsap from `@kit/lib/gsap`
- p5.js blocks use instance mode (`new p5(sketch, el)`), call `.remove()` on unmount, read colours with `readToken`, and list `p5` in `dependencies`

## Inspo pins
`{ id, title, note, url?, kind: site|shot|idea|decision|question, section, verdict: love|maybe|nope, project, siteType?: Creative|Product / service|Portfolio|Webshop, image?: "images/<file>.jpg", added: epoch ms }`.
Researching a site: interact with it (scroll slowly, hover, click), capture mid-animation frames at 1440×900, save JPGs ≤1600px wide into `content/inspo/images/`, write pins, and link any block built from it via the block's `inspiredBy`.

## Git
GitHub Flow, conventional commits (`feat:`, `fix:`, `content:` for inspo, `style:`). Private repo: github.com/petrapresecki/creative-kit
