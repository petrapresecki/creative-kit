# Polishing a site to award level

The playbook from polishing Iva Presečki's portfolio (ivapresecki.com, the v3 keyring, repo `iva-v2`) on 28 October 2026, with bykreso.com and Petra's own portfolio done in parallel. It's the practical half of [motion-and-3d.md](motion-and-3d.md): that file says what the award sites do, and this one says how to get a site there and how to check it. Read [start-here.md](start-here.md) first for Petra's own references.

Three parts: the checklist (what to fix and how), the traps (what broke on the way), and what Petra's feedback taught about design direction. The checking tools are in `scripts/browser/` (see the end).

## 1. The polish checklist

Go through it in order on every site. Each item names the fix that worked.

### The first second
- **No blank page, ever.** Measure when the first real frame lands, on a cold load. On v3 the deployed build loaded three lazy chunks one after another (app, then the 3D scene, then three.js), and only then the images.
- **Load side by side, not in a chain.** Put the page that *is* the site into the main bundle. Start the heavy dynamic import and the key images (`new Image().src = …`) at module top level, not in an effect. Add the font stylesheet as soon as the module runs.
- **A loader made of the subject.** On v3 the keyring's chain lowers from the top edge and sways (a repeating SVG background with a `clip-path` reveal). Then it fades as the 3D chain drops in over it, so the first frame already shows the object. A spinner or nothing reads as broken.

### 3D
- **Keep printed work's colours true:** `THREE.NeutralToneMapping`. The default ACES shifts pinks and oranges and flattens highlights. In React Three Fiber it has to be passed in the `gl` props (`gl={{ toneMapping: THREE.NeutralToneMapping }}`), because R3F only leaves tone mapping alone when it's set there; `onCreated` gets overwritten.
- **Stop drawing what nobody can see.** When a full-screen page covers the canvas, set `frameloop="never"`. Derive the paused state (`covered && pageOpen`), don't store and reset it (see the freeze in the traps).
- **Report the first frame** (an `onReady` from the first `useFrame`), so the loader knows when to leave.
- **Soft shadows on a backdrop** (`VSMShadowMap` with `shadow-radius`, a `shadowMaterial` plane behind the object) make an object read like a product shot. Petra later preferred the site without them, so treat this as an option to show her, not a default.

### Type and motion details
- **Titles rise out of their line:** clip the line just under the baseline and leave it open above and to the sides (`clip-path: inset(-1em -1em 0 -1em)`), then animate the letters from `translate: 0 110%`. Without the mask, overshooting letters cut through whatever sits under the title. Characters that hang below the baseline (a `)` in "Hi! :)") need a negative bottom inset.
- **One motion language.** An overshoot ease for things that settle, one expo ease for floods and reveals. Not one ease for everything, and not a different one per element.

### Access
- **Every canvas interaction has a plain twin.** On v3 the four charms exist as real buttons, shown only while keyboard focus is inside them, and focusing one does what hovering its charm does.
- **Keyboard "clicks" have no position** (`e.detail === 0`), so anything that animates out from the click point needs a fallback (the centre of the screen).
- **Visible focus** (`:focus-visible` outlines in `currentColor`), **reduced motion** (static rope, no loops, no rises), and `(hover: none)` rules so hover effects don't stick on phones.

### Sharing and SEO
- **Each page sets its own `document.title`** ("Rool — Iva Presečki").
- **Open Graph tags and a 1200×630 share image rendered from the real site** (`scripts/browser/shot.mjs` on the live or dev site, cropped to the middle band). For a recruiter, the link preview is the first impression.

### Media
- **Check the heaviest files.** v3's Booklet hero was 18.8 MB and autoplayed as the page opened. macOS's `avconvert` only copies H.264 streams through; re-encoding needs ffmpeg (`brew install ffmpeg`).
- **Version media URLs when you replace them** (`?v=2026-10-28`), so browsers fetch the new clips without anyone clearing a cache.

### Before shipping
Type-check, lint and run the production build exactly as the deploy runs it. Then run a scripted visit at 1440×900 and 390 wide (load, hover, open a page, scroll, close, the About page), check the console, and look at every screenshot. After deploying, fetch the live HTML or bundle and confirm it's the new build.

## 2. Traps we hit

- **The app's browser pane slows everything down while it's hidden** (timers, `requestAnimationFrame`, CSS animations). A 3-second blank page and a stuck flood both turned out to be the pane, not the site. Check whether it's displayed before trusting any timing, or use headless Chrome.
- **Headless Chrome on software rendering (SwiftShader) runs WebGL at about 2 frames a second.** Fine for screenshots after a long wait, useless for judging motion or freezes. Use the real GPU (`--use-angle=metal`), but even then headless frames come slowly, because there's no display to sync to. Judge smoothness in a real, visible browser.
- **`--virtual-time-budget` doesn't run animation frames properly.** Wait real time over the DevTools port instead.
- **A full-screen mesh catches the pointer.** The shadow backdrop plane swallowed every hover and pull until it got `raycast={() => null}`. Any decorative mesh that covers the screen needs it.
- **The keyring froze after clicking from project to project.** Covered state was reset during render on the way home, and a flood finishing at the same time set it straight back. The fix that holds: `paused = covered && overlay !== null`, and each flood resets `covered` when it starts. Prove a fix like this by reading the library's own state (R3F's `frameloop`) and counting WebGL draw calls, not by eyeballing screenshots.
- **A `clip-path` moves with its element.** To mask text that animates, clip the parent and move the child.
- **`clip-path` on an inline element is unreliable;** make it `inline-block`.
- **Scripted key presses:** a DevTools `Enter` needs `text: "\r"` to activate a button. Headless tabs don't fire focus events for `element.focus()` called from script; press Tab instead.
- **Vite hot reload during a scripted run** mixes old and new code ("page is not defined"). Rerun after the edit settles.
- **Gallery sites built on Wix** (Site of Sites) render their links in the browser, so `curl` can't find a site's real URL. Read it in a browser tab.
- **Don't drive the browser pane while Petra is using it.** Open a background tab (`tabs_create`) for research.

## 3. What Petra's feedback taught about direction

- **Bold, but one system.** A v3 pass that stacked a pegboard, colour floods, chrome Y2K pills, a script face, a packaging box with sparkles and a sticky side column got "way too much and incohesive". What she approved: paper, the keyring, chrome label tags, one typeface (Martian Mono, narrow for labels and reading, widest and heaviest for titles), and each project's own charm shape framing its hero film.
- **Timid fails too.** A first pass on her portfolio's animations "did basically nothing". She wants visible, serious changes.
- **Her references should show.** When Petra picks the references, the result has to clearly look like them. She has said a session may draw its own type and copy layouts and ideas outright. "Take the technique, not the look" applies only to references the agent picks itself.
- **Don't copy one site whole.** A chrome background with a script name behind the object was "too close" to kris10cabrera.com.
- **Ask with real choices.** When unsure what to keep, a multi-select of concrete pieces ("which of these stay?") got a clear answer in one go. Show her screenshots, side by side with the references, and a short sample of the direction before building everything.
- **Name the principle** behind each decision in a sentence (Hierarchy, Restraint, Grid…), as the kit's CLAUDE.md asks.

## The checking tools

`scripts/browser/` drives headless Chrome over its DevTools port. Plain Node 22, no packages. Run them from any repo:

| Script | What it does |
|---|---|
| `shot.mjs <url> <out.png> [w] [h] [waitMs]` | One screenshot after a real wait. Add `--crop WxH` for a share image from the middle band |
| `look.mjs <url> <outDir>` | Studies a site: two shots over time, four while scrolling, and the fonts, canvases, gradients and opening text it uses |
| `sheet.mjs <sites.txt> <outDir>` | Contact sheet: screenshots a list of sites at 1440×900 and writes an `index.html` grid to pick from (publish it as an artifact to share) |
| `cdp.mjs` | The shared helper: `launch()` returns `send`, `js`, `shot`, `key`, `move`, `click`, `sleep`, `close` and a list of console errors, for writing a scripted visit of a particular site |

Set `GL=swiftshader` when the real GPU isn't available. Each run uses its own Chrome profile in the system temp folder.
