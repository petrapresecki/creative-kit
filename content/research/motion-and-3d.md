# Motion and 3D: what the award sites actually do

A research round from 28 October 2026, for polishing Iva's keyring (iva-v2 v3) and every portfolio site after it. [creative-sites.md](creative-sites.md) covers the quiet, composed side (Readymag); this file covers the loud side: WebGL studios, Awwwards and Godly favourites, and creative developers' own portfolios. Read the two together: the lessons agree more than you'd expect.

Each site was loaded at 1440×900, left to load, hovered, scrolled and probed for its fonts, colours and libraries.

**Studios and award sites:** [Lusion](https://lusion.co/), [Igloo Inc](https://www.igloo.inc/) (Awwwards Site of the Year 2024), [Unseen Studio](https://unseen.co/), [K95](https://k95.it/en), [and2es](https://www.and2es.com/), [Messenger by Abeto](https://messenger.abeto.co/) (didn't render in the test browser).
**Picked on Recent/Godly this autumn:** [Niccolò Miranda](https://www.niccolomiranda.com/), [Cathy Dolle](https://www.cathydolle.com/), [Gregor Collienne](https://gregorcollienne.com/), [Displace](https://displace.agency/) (a product site, for contrast).
**Creative developers:** [Dennis Snellenberg](https://dennissnellenberg.com/), [Pacôme Pertant](https://pacomepertant.com/), [David Heckhoff](https://david-hckh.com/).
Plus a second look at library pins that move: `lib-k95`, `lib-and2es`, `lib-gn` (Gionata Nese), `lib-obys`, `lib-koko-*`.

## What they have in common

### 1. The first second is designed
Not one of them shows a blank page while it loads. The loader is short and it's the first sentence of the site, not a spinner.

| Site | First second |
|---|---|
| Igloo Inc | The igloo drawn as a white wireframe on grey, then rendered in snow. **The loader is the object.** |
| Lusion | A pixel bar fills, a huge counter rolls 0 → 100 in the corner, a pixel "L" assembles |
| Unseen | One letter cycles while it loads, then a pair of googly eyes that follow the pointer and an Enter button ("enter without audio" under it) |
| Dennis Snellenberg | "Hallo", "Bonjour", "Ciao"… flash in the middle of a dark page, then the page lifts like a curtain |
| Pacôme Pertant | A blue dot and "hey!" |
| and2es | One 11px sentence fades in left to right, holds, then the ring of work appears |

Lesson: the loading moment shows up in the screenshot people remember, and it hides the waterfall of scripts and textures behind it. The best ones are made of the site's own subject (Igloo) or its voice (Dennis, Pacôme). A generic spinner, or nothing, reads as broken.

### 2. One 3D subject, lit like a product shot
- **Lusion**: a pile of glossy cross-shaped parts in three colours only (white, black, ultramarine), soft studio light, ambient occlusion between the parts, depth of field. The pointer pushes the pile around with physics.
- **Igloo**: one igloo, foggy, monochrome. Scrolling moves the camera and the igloo comes apart into its ice blocks.
- **K95**: one chrome rose built of cubes on flat electric blue. Project cards ring around it.
- **Cathy Dolle**: a row of tiny spinning objects in the middle of a white page. That's the whole hero.
- **Unseen**: a rendered room, arches and reflective water, pastel and soft.

The 3D is never "some 3D". It's one object, made from the subject, with a limited palette and lighting that makes it feel photographed: soft shadows, reflections from an environment map, colour that stays true. The best renders use tone mapping that doesn't shift colours, so the subject's own colours survive.

### 3. The object reacts to you before you do anything on purpose
Pointer speed pushes things (Lusion's pile, K95's rings). Hovering slows everything down (K95 drops to about 30% speed; Iva's keyring already does this). The reaction is physical: weight, lag, overshoot, settling. Nothing moves at constant speed.

### 4. Everything around the object is small and still
Lusion's statement is 36px Aeonik. Igloo's text is tiny mono at the edges. Cathy Dolle's is 10px Neue Montreal in the four corners. K95: four small nav words. The interface is quieter than on most normal sites, because the 3D gets the whole budget. This is the "one loud thing" rule from creative-sites.md, and the award sites follow it too.

### 5. Transitions are part of the object's world
Igloo's scroll is a camera path. Obys closes its brackets back into a lens before opening a project. and2es turns the ring to bring the project forward. Niccolò Miranda's whole portfolio is a newspaper you drag, rendered as one sheet of paper that bends. The page change continues the metaphor; it isn't a fade.

### 6. Type: one workhorse grotesk, sometimes one face with character
| Site | Faces |
|---|---|
| Lusion | Aeonik + IBM Plex Mono + its own LusionMono |
| Unseen | Neue Montreal + Saol Display (serif italic in the headline) |
| Cathy Dolle | Neue Montreal only |
| Gregor Collienne | Neue Rational 800, all caps |
| Niccolò Miranda | Domaine Display + Editorial New + a condensed display (newspaper) |
| K95 | one variable face ("adaptive") |
| David Heckhoff | Urbanist + ProFontWindows (a pixel mono for the computer theme) |

Neue Montreal shows up again and again. The sites that feel most authored pick a face for a reason (Miranda's newspaper faces, Heckhoff's pixel font for a computer).

### 7. Colour: almost none, or one flat field
Lusion: white, black, one blue. K95: one electric blue. Igloo: grey. Cathy Dolle: white. Gregor Collienne: warm paper. Unseen: one pastel scene. The work and the object bring the colour.

### 8. Performance is part of the craft
- Tab hidden or object off screen: rendering stops.
- Heavy scenes give a choice before they load (Unseen's "enter without audio").
- Videos stay inside project pages, not on the home page.
- Three.js r158 to r183 everywhere; Lenis on most; GSAP is less common than you'd think (Lusion, Unseen and K95 don't expose it).

### 9. What reads as template even on award sites
- "SCROLL TO EXPLORE" with crosshair marks (Lusion), "Scroll down to discover" (Igloo): instruction labels are everywhere, even on the winners, and they still read as filler.
- Rounded pill nav and "Let's talk" buttons (Lusion, Displace).
- Displace is a good example of a product site that won a gallery spot for its copy and pricing table, not for motion. Different game.

## How Iva's keyring measures up

What's already award-level:
- **The idea is the subject, taken literally.** Her work is full of hanging objects (Rool's keychain, the Booklet's rings), so the portfolio is a keyring. That's the Igloo rule: the subject is the 3D.
- **One loud thing.** The paper home with a black-and-white interface leaves all the colour to the charms.
- **Physical reaction.** Verlet chains, sway with pointer speed, twist on jump rings, hover calms the ring, a snap with elastic shake. Very close to K95 and Lusion.
- **The transition continues the metaphor.** The project floods open in the shape of the charm you pulled off. That's the Obys and and2es level of thinking.

What separated it from the sites above, and what the polish pass addressed:
1. **The first second was blank paper.** Three lazy chunks loaded one after another (app → keyring → three.js), then the charm photos, with nothing on screen in between. No other site in this round does that.
2. **Colour fidelity.** The default ACES tone mapping shifts and flattens the photos printed on the charms, which are Iva's work. Award renders keep product colour true.
3. **The title didn't rise out of its line.** The concept says it should; without a mask, the letters overshot through the ruled line under them.
4. **The scene kept rendering under a full-screen project page**, competing with the videos for the GPU while you scrolled.
5. **Instruction label in the corner** ("GRAB A CHARM · PULL IT OFF THE RING"), the tell creative-sites.md names. The site needs a hint, because pulling isn't obvious, but it can be shorter and step back once you've found the charms.
6. **No way in without a mouse.** Keyboard and screen-reader visitors couldn't open a project.
7. **Shared links had no preview** (no Open Graph image or description), and every page had the same tab title. For a portfolio sent to recruiters, the link preview is the first impression.

## Rules to take into the next sites

1. Design the first second: the loader is the subject or the voice, under a second when possible, never a blank page.
2. One 3D subject made from the client's material. Limit the palette, light it like a product shot, keep its colours true (Neutral or AgX tone mapping, not ACES, when real work is printed on it).
3. Let it react physically (speed, weight, overshoot). Slow everything down on hover.
4. Keep the interface small and still. The object gets the budget.
5. Make the page change part of the object's world.
6. Stop rendering what nobody can see.
7. Keyboard and screen readers get a plain way through: a list of links that does the same thing as the 3D.
8. Every page sets its own title, and the site has a share image.
