# What makes creative sites look made, not generated

A case study from October 2026, for the kit's output, which still reads AI-made. It looks at about 30 live sites: the Readymag Websites of the Year winners from 2023 to 2025, the current [Readymag Examples](https://readymag.com/examples) grid, Readymag's own showcase posts, and a handful of studio and type foundry sites for comparison. Each site was loaded at 1440×900, scrolled, hovered and captured. The best 22 are pinned as `lib-rm-*` (project `library`). Read it together with [portfolios.md](portfolios.md), which covers personal portfolios.

The second half is a manifesto: dos and don'ts, and a test to run before anything is shown to Petra.

## Why Readymag sites look different

Readymag is not a page builder. It's a canvas: you place every element by hand on a page, like in InDesign, and the whole page scales with the window instead of reflowing through breakpoints. Motion is a few simple triggers, with no timeline. It started as a tool for web magazines.

That explains most of what you see in the Examples grid. The pages are **composed**: things sit where a designer put them, at sizes that only make sense for that content. Generated code does the opposite. It **assembles** a stack of full-width sections (hero, grid, list, footer) from components, each centred in a container, each with its own entrance animation. Even with good fonts and colours, the stack gives it away.

So the first lesson is not a style. It's a way of working: design a screen as one composition, then make it responsive. Don't build it as a pile of sections that happen to be on the same page.

## What the good ones do

### 1. The idea is the subject, taken literally
- **Heliotropy** is named after plants turning to the sun, so a soft yellow sun glow drifts across the whole page. It's a gradient, and it's fine, because it *is* the name (`lib-rm-heliotropy`).
- **People Look at Art** (Anton Repponen) mirrors every line of its title in pale grey, so the type looks back at you, which is the title's point (`lib-rm-repponen`).
- **Anochesone** sells clothes, so the home page is a paper-doll game where you drag clothes onto a model (`lib-rm-anochesone`).
- **Intertapes** archives found cassettes, so every tape is a turning 3D scan in a plain grid (`lib-rm-intertapes`).

None of these ideas would work for another client. That's the test.

### 2. One loud thing, and everything else is quiet
- **Jo Iijima**: a hand-made multicoloured wordmark, then tiny grey mono text and the work (`lib-rm-joiijima`).
- **Vascun**: one metal business card turning in space, then a table of projects (`lib-rm-vascun`).
- **Masha Chern**: one photo and four nav words across its middle (`lib-rm-mashachern`).
- **Studio Dumbar**: black page, five small words, the work at full size (`lib-rm-dumbar`).

The quiet parts are really quiet: 9 to 13px text, no boxes, no icons, no hover effects. The loud part gets the whole budget.

### 3. Real material, one treatment
The pictures are of real things: the actual farm (Wakuli), scans of real tapes (Intertapes), the illustrator's own drawings (Jun Ioneda, Wrillustrations), the actual printed posters (Jo Iijima, Baran Ceylan). Nothing is a mock-up on a gradient, an abstract 3D blob or a stock photo.

When the images vary, one process makes them belong together. **Doe Records** prints every photo as red-orange duotone on cream, like a risograph, and the whole site turns into one object (`lib-rm-doerecords`). **DIA** shows hundreds of thumbnails, all in greyscale (`lib-rm-dia`).

### 4. Type that clashes on purpose, or one face pushed hard
- **Ryan Garret Conner**: a pixel blackletter, a grotesk and a pixel serif in one block, on IBM blue (`lib-rm-ryanconner`).
- **Doe Records**: a condensed serif that switches to italic halfway through a word (ART*ISTS*), drop caps, justified columns.
- **Wakuli**: condensed caps next to a light italic year.
- **blahblahblah.design**: one word set by fifty designers in a strict black-and-white grid (`lib-rm-blahblah`).
- **Wrillustrations**: every word, the nav included, is her handwriting (`lib-rm-wrillustrations`).

Huge display type is rarer than you'd think. Most of these sites have small type and big pictures. When type is big, it's because the type is the content (a type foundry, a title that does something).

They name their fonts. Heliotropy's colophon lists P22 Mackinac Pro and MARTIN, "a non-violent typeface", and says why. Repponen credits Receipt by CakeType.

### 5. Composition, not sections
- **Öppen** hangs images of different heights from one top line, so the bottom edge is ragged. Text sits in four tiny columns along the top and bottom edges (`lib-rm-oppen`).
- **Baran Ceylan** gives each project a ruled header row (name, one sentence, two disciplines) and a sideways strip of its images at mixed sizes, bleeding off both edges (`lib-rm-baranceylan`).
- **PDF Magazine** uses flat bars of yellow, blue and red as rules and section labels (`lib-rm-pdfmag`).
- **Intertapes** and **blahblah** keep a dead-strict grid because what's inside the cells is wild.

Alignment is to one edge, not centred. Empty space is a lot of space, in one place, not 96px of padding above every section.

### 6. Colour: one flat colour used whole, or none
Wakuli is flat #ffff00. Ryan Conner is #0000ff. Junioneda is primary blue, orange and grass green, all straight from her illustrations. DIA is greyscale, Dumbar is black. You don't see a neutral page with an accent colour on the buttons, or brand colours as soft gradients.

### 7. Little motion, and what moves is the subject
Tapes turn. A business card turns. The sun drifts. A carousel of work moves. Most pages simply scroll. There are no fade-ups on every section, no staggered words, no smooth-scroll inertia on a page that has nothing to say.

### 8. A voice
- "Only legends scroll down." (Wakuli)
- "studio address: based on Earth" (Öppen)
- "Not all my work was commissioned. I also create a lot of stuff just for fun." (Jun Ioneda)
- A cookie banner that is a hand holding a fortune cookie, "5 online" in the header, "it's free! <333" (ABC Dinamo, `lib-rm-dinamo`)
- The time in New York and London, ticking, and a feed of dated news (Porto Rocha, `lib-rm-portorocha`)

Specific, a bit odd and clearly somebody's own words. Interface labels are plain words (Index, About, Contact, Filter), not instructions.

### 9. Labelled like an archive
Name, one sentence, discipline, year, in columns (Baran Ceylan, Vascun). The city where a tape was found (Intertapes). Pages read like a catalogue, not like a product page.

The rules on these two sites are there because the content is a table: the columns hold real data that has to line up. They're one element on the page, not a style laid over everything. See "Rules and clocks" below.

### For comparison: the template look
**Pangram Pangram** (`lib-rm-pangram`, verdict `nope`) is a good foundry whose home page still looks generated: rounded hero cards with a big photo, a centred title, a three-word tagline ("Calm. Efficient. Swiss."), two pill buttons ("Explore font", "Try for free"), then a grid of rounded cards with NEW badges. It's the shape everything falls into when no one decides otherwise.

## What other anti-AI design skills add

Other people have written skills and guides for this problem. Read for this file: [Taste Skill](https://github.com/Leonxlnx/taste-skill) (built from a study of 247 gallery sites, with blind-judged tests), [Impeccable](https://github.com/pbakaus/impeccable), Anthropic's [frontend-design](https://claude.com/blog/improving-frontend-design-through-skills), [web-design-skill](https://github.com/ConardLi/web-design-skill) and [Superdesign's guide](https://www.superdesign.dev/blog/how-to-make-ai-ui-look-less-generic). Four things from them are worth taking. They're used here as reading, not installed.

### Inventory the subject before anything else
List 8 to 12 things that belong to this client and to no competitor: its name and what the name means, its street and what that place looks like (tiles, signs, shop-front lettering, light), the numbers in the brief, the constraint it lives with (one batch a month, closed in winter, by appointment), its materials and colours, its rituals and hours, the printed things of its world (a ticket, a label, a timetable). In Taste Skill's blind tests, the page that won each brief was built from an item on such a list. The pages that lost had a good composition and an idea that fit the whole category. The list is also where to look for pictures.

### Write the argument before choosing sections
Write the page as claims, one line per section, each with its proof. The claims decide which sections exist and in what order. A section without a claim goes. This is what stops the stock order (hero, logos, three features, testimonial, pricing, CTA), and on a portfolio the stock order is hero, about, selected work, services, contact.

### Removal isn't enough
A page with every tell taken out and nothing put back is "an empty page with good manners" (Taste Skill). Blind judges preferred a richer page *with* tells over an empty one without them. The tells were filling a gap where an idea should have been. So the order of work is: idea from the inventory, then composition, then real pictures or committed type, and only then the don'ts. Never start by subtracting.

### The tells come in waves, and the fixes become the next wave
- **2023–24:** purple and indigo gradients, gradient headline text, glass panels, soft shadows under every card, three icon cards, emoji as icons.
- **2025:** a small tracked label above every heading, a pill badge above the hero headline, one word of the headline in italic serif or colour, bento grids, near-black with one neon accent and a glow, floating blurred pill nav, a pulsing "available for work" dot, fade-and-rise on every section.
- **2025–26, the fix that became the look:** the remedy for the first two waves was "make it warm and editorial", and models took it wholesale. A cream background with a terracotta, rust or clay accent, a soft or high-contrast serif as the shortcut to premium, an oversized italic serif headline, hairline rules everywhere with zero radius and dense columns (broadsheet cosplay), and performative section names ("Field notes", "On our desks", "Quietly trusted by").
- **Gallery fashion:** mono micro-labels, index numbers, thin rules, design-tool chrome (crop marks, crosshairs, guides), local time, coordinates, weather and version stamps. Taste Skill bans these even though its data shows them *more* often on top sites than weak ones (mono labels 44% against 24%, index numbers 38% against 21%), because they're the first things a generator copies from a gallery. The one exception in the data is tiny tracked capitals: 16% of top sites against 57% of weak ones.

The lesson for this file too: every "use this instead" list turns into the next wave. Anthropic's own frontend-design skill recommends grain, noise overlays, gradient meshes and staggered page-load reveals, and those are now tells. So the dos below are ways of working, not looks to reach for. Even the sites in this file are evidence, not a style.

### Rules and clocks
This file and [portfolios.md](portfolios.md) praised hairline-ruled lists (JARCOS, Baran Ceylan, Vascun) and live clocks (JARCOS, Porto Rocha), which Taste Skill bans. Both views are right. On those sites they're information. In generated sites they're decoration. The rule for the kit:

- **Rules** are allowed where the content is truly a table: several columns of real data that must line up (name, discipline, year; a price list; a timetable). One ruled element per page at most. Never as the page's texture (rules under every heading, ruled boxes around tiles, a ruled grid behind the layout). Elsewhere, structure comes from space, tone steps and filled shapes.
- **Clocks and other live meta** (local time, weather, coordinates, "v. 3.2", "updated 10-09-26") are allowed only when the visitor can act on them: a studio with offices in two cities showing whether you'll reach someone now, a shop's opening hours, a changelog date on a site that really changes. Never as an agency-style ornament in a corner, and not on a personal portfolio just to look alive.
- **The same goes for italic-switch headings** (Doe Records, Wakuli): fine when it's the site's whole typographic system, applied every time. A tell when it's one decorative word in one headline.

## Why the kit's output still reads AI-made

The kit doesn't make purple-gradient landing pages. It makes the next layer of default, the **"creative-AI" look**: what a model reaches for when asked to be creative. Counted in `registry/blocks`:

| Habit | How often | What it reads as |
|---|---|---|
| `.caption`: 12px mono, uppercase, tracked 0.06em | 58 uses | The single biggest tell. Mono caps micro-labels in every corner is now the generated "designer" look |
| Custom cursors | 32 mentions | A toy on every site |
| Grain and noise overlays | 33 mentions | Texture added to hide that nothing else is there |
| `rounded-full` pills | 17 | Every label and button the same pill |
| `expo.out` / `ease-out-expo` everywhere | 22 | Everything glides the same way |

And in concepts and prototypes (the Iva v3 keyring is a good example of a strong idea wrapped in these):
- An outlined giant word behind the content (PROJECTS) as decoration
- Instruction labels written by the interface ("GRAB A CHARM · PULL IT OFF THE RING")
- Index meta like `NN / 04 · category · year`
- Every concept has a "signature interaction", so every site becomes a toy
- Several effects from several source sites on one page
- `clamp(64px, 13vw, 220px)` display type with tight negative tracking as the default hero
- Decisions made before the real content exists, so the system is designed for placeholders

None of these is wrong once. The problem is that they turn up every time, because they're the kit's defaults rather than choices for that site.

## Manifesto

### Do
1. **Inventory the subject.** Before any design, list 8 to 12 things only this client has (name and its meaning, place, numbers, constraint, materials, rituals, printed things). The idea comes from this list.
2. **Write the argument.** One claim per section, each with its proof. No claim, no section.
3. **Start from the material.** Get the real photos, drawings, objects, words and numbers before designing. Choose the design that makes *this* material look best. If there isn't any material yet, the first job is to get some, not to design around grey boxes.
4. **Take the subject literally.** Find the one idea that only works for this site (a sun that drifts, clothes you drag, a title that looks back) and let it decide the rest.
5. **Fill the gap, don't just empty it.** When a tell comes out, something real goes in: larger type, a whole field of colour, a real picture of the subject's world, the section's full content. Restraint with nothing in it reads as thin.
6. **Make one thing loud.** One element per screen gets the colour, the size, the motion or the hand-made mark. Everything else is small, plain and still.
7. **Compose screens like a page.** Design the desktop frame as one composition: decide where every element sits and how big it is, align to one edge, leave one big empty area. Then work out mobile as its own composition.
8. **Use one treatment for images.** Duotone, greyscale, one crop ratio, one frame, one background. Pick it from the subject.
9. **Use colour whole.** A full flat colour as the page, colour as structure (bars, blocks, chapters), or no colour at all. Take it from the material.
10. **Pick type with a reason, and name it.** One face pushed hard, or a pairing that clashes on purpose. Small text is fine. Big type only when the type is the point. Write a colophon.
11. **Let the subject move.** Motion belongs to the thing the site is about (it turns, swings, drifts, loads). The interface doesn't animate.
12. **Write like a person.** Real sentences, real numbers, real places and dates, one odd detail. Plain words for labels: Index, Work, About, Contact.
13. **Label like an archive.** Name, one sentence, discipline, year, in columns. Rules only when it really is a table (see "Rules and clocks").
14. **Make something by hand.** A drawn wordmark, a scan, a photo you took, a sticker you cut, a handwritten note. One kind of mark, used consistently.
15. **Take one thing per source and change it.** The rule from the kit's manifesto: borrow the technique, not the look.

### Don't
1. **Don't stack sections.** No hero → features → grid → CTA → footer, each centred in a container.
2. **Don't default to mono uppercase micro-labels.** If the site needs small labels, choose their face, case and size for this site. Sentence case in the body face is usually better.
3. **Don't make the interface explain itself.** No "SCROLL TO EXPLORE", "DRAG ME", "PULL IT OFF THE RING". If it needs a hint, the idea isn't working yet, or a plain word will do.
4. **Don't add texture to fill emptiness.** No grain, noise, scanlines, film dust or glow unless they come from the subject.
5. **Don't put a custom cursor on everything.** Only when the cursor is part of the idea (a dumpling on a dumpling bar).
6. **Don't animate every section in.** No fade-up, word-stagger or blur-in on scroll by default. No smooth scroll by default.
7. **Don't use one ease for everything.** If something moves, its timing comes from what it is (a heavy card, a light sticker, a falling tape).
8. **Don't decorate with the giant word.** No outlined or huge repeated text behind the content unless the word is the idea.
9. **Don't make everything a pill or a rounded card.** Pick one shape for the site. Square, no frame, or a frame from the subject.
10. **Don't use index numbers as decoration.** No `01 / 04`, `(01)` or `N° 03` unless the content really is numbered.
11. **Don't put several signature effects on one page.** One per site. A quiet site may have none.
12. **Don't use mock-ups or stand-in imagery as the design.** Device frames, 3D blobs, stock and generated images all read as filler.
13. **Don't write generic copy.** No "crafting digital experiences", "where X meets Y", "let's create something together", three-word taglines with full stops.
14. **Don't take a gallery site's look whole.** That includes the look of the sites in this file.
15. **Don't put a label above a heading.** No eyebrow or kicker, no pill badge above the hero headline. The heading carries itself.
16. **Don't reach for warm editorial as the fix.** Cream with terracotta, a soft serif as "premium", an oversized italic headline, rules everywhere: that's the newest generated look.
17. **Don't add meta as ornament.** No local time, weather, coordinates, version stamps or middle-dot strings unless the visitor can act on them.
18. **Don't rule everything.** One ruled table where the data needs it; no hairlines as texture, no ruled boxes around tiles.
19. **Don't use one decorative italic or coloured word in a headline.** A type switch is a system or it's nothing.
20. **Don't invent proof.** No made-up stats, logo walls, quotes or "10,000+ clients".

### The test before showing anything

Run it on every concept, prototype and page, with a screenshot at 1440×900 and at 390 wide.

1. **The swap test.** Replace the name and the pictures with another client's. If it still works, it isn't a concept yet.
2. **The defaults audit.** For each of these, write why it was chosen *for this site*: typeface, label style, colour, shape and radius, image treatment, easing, cursor, texture, scroll behaviour. "It's the kit's default" or "it looks designed" is not a reason. Remove what has no reason.
3. **The loud-thing count.** Point to the one loud thing on the screen. If you can point to three, two must go.
4. **The tell list.** None of the don'ts above, unless the reason is written down.
5. **The gallery test.** Put the screenshot next to the Readymag Examples grid and next to `lib-rm-pangram`. Which one does it look like?
6. **The words test.** Read the copy out loud. Could a person have written it, about this client only?
7. **The inventory test.** Point to the item on the subject inventory that the idea comes from. If you can't, go back to the list.
8. **The empty-page test.** After the tells are out, is the page rich (big type, whole colour, real pictures, full content) or just polite? If it's polite, fill it.
9. **The wave test.** Check the screen against all four waves of tells, the warm-editorial one especially.

## What this means for the kit

- `site-concept` reads this file and [portfolios.md](portfolios.md) before proposing concepts, and runs the test above on the board and the prototype.
- New themes should choose their own label style. `.caption` (mono caps) shouldn't be what every theme falls back on.
- Blocks are techniques, not finished looks. Grain, cursor, scramble and marquee blocks should be off or plain by default, so using them is a decision.

## Sites

Readymag Websites of the Year and showcase posts: [2025 winners](https://blog.readymag.com/websites-of-the-year-2025/), [2024 winners](https://blog.readymag.com/websites-of-the-year-2024/), [2023 winners](https://blog.readymag.com/websites-of-the-year-2023-winners/), [12 exceptional Readymag sites](https://blog.readymag.com/12-exceptional-websites-built-with-readymag/), [how Examples are selected](https://blog.readymag.com/readymag-examples-selection-and-criteria/), [a decade of Readymag](https://blog.readymag.com/beyond-a-tool-a-decade-of-design-in-readymag/), [Readymag Examples](https://readymag.com/examples).

Captured: [People Look at Art](https://space.repponen.com/peoplelookatart/), [Jo Iijima](https://joiijima.com/), [Wakuli impact](https://wakuli-impact.com/), [Intertapes](https://intertapes.net/), [Baran Ceylan](https://www.baranceylan.co/), [Heliotropy](https://heliotropy.com/), [Doe Records](https://doerecords.org/), [Jun Ioneda](https://junioneda.com/), [Wrillustrations](https://wrillustrations.com/), [Ryan Garret Conner](https://ryangarretconner.com/), [PDF Magazine](https://pdf-mag.com/), [Öppen](https://oppenstudios.com/), [Anochesone](https://anochesone.com/), [blahblahblah.design](https://blahblahblah.design/), [Vascun](https://www.vascun.com/), [Masha Chern](https://mashachern.com/), [Roman Sazonov](https://10byrs.com/), [Studio Dumbar](https://studiodumbar.com/), [ABC Dinamo](https://abcdinamo.com/), [DIA](https://dia.tv/), [Porto Rocha](https://portorocha.com/), [Grilli Type](https://www.grillitype.com/), [Order](https://www.order.design/), [Pangram Pangram](https://pangrampangram.com/). Offline or unreachable in October 2026: ecbscanned.com, janiceferyn.com, a-3-i.com, now-here-buro.com.

Anti-AI design skills and guides: [Taste Skill](https://github.com/Leonxlnx/taste-skill) (`references/tells.md` is the dated tells registry), [Impeccable](https://github.com/pbakaus/impeccable) (`reference/craft-floor.md`), [Anthropic's frontend-design](https://claude.com/blog/improving-frontend-design-through-skills), [web-design-skill](https://github.com/ConardLi/web-design-skill), [Superdesign](https://www.superdesign.dev/blog/how-to-make-ai-ui-look-less-generic).

On why generated sites converge: [925 Studios on AI design tells](https://www.925studios.co/blog/ai-slop-design-tells), [The Cursor on the wild web](https://thecursormag.substack.com/p/back-to-the-wild-web).
