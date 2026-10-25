# How good portfolios are built

Notes from looking at about 90 personal portfolios in October 2026, for Petra's new portfolio (pins under the `petra` project). Sources: [Site of Sites](https://www.siteofsites.co/?p=1) pages 1–5, the [minimal.gallery portfolio tag](https://minimal.gallery/tag/portfolio/), and a list of developer and creative-engineer sites. Each site was loaded at 1440×900, scrolled, hovered and captured; the best 14 also got full-page shots and their about/work pages.

This is about the general approach, not only the sites that got pinned.

## What the readable ones have in common

1. **One plain sentence says who, what and where.** Karin Kiho, Joshua Baker, Lynn Fisher and Cyd Stumpel all open with a sentence you could read aloud: role, years, what kind of work. Personality comes from how it's set (hand-drawn circles, a serif italic, a drop cap), not from vague words.
2. **Everything is labelled before it's shown.** Liya Kedar puts name, discipline and a one-liner under every image. JARCOS puts name on the left and discipline on the right of every tile. Karin adds year and #tags. You never wonder what you're looking at.
3. **Experience is a list, not cards.** The best experience sections are typeset lists:
   - label/value ledger with hairline rules (JARCOS: Capabilities, Selected Clients, Collaborations)
   - role / linked company / dates right-aligned, with a ⊕ to expand (Karin Kiho)
   - meta as small pills above a big title (Cyd Stumpel's talks)
   - a few dated sentences (Tania Rascia's "brief timeline")
   - employers as a big serif roll call (Graham McDonnell)
   - section counts and quantities on the right (Anthony Hobday)

   The company names are links out, which is how Polygon Labs and Endava could appear.
4. **Motion lives in one place.** Cyd's site moves only in the hero (sideways name, rotating role line), then it's still cards and lists. Ryan Mulligan keeps his playful CSS toys in one strip at the top and the rest is plain text. JARCOS has one image locked inside the wordmark. Sites that animate every section (Corentin Bernadou's cube plus scrolling list) are the ones where you don't know where to look.
5. **Stills, not reels.** Almost none of the readable sites autoplay video in the grid. Work is shown as still, equally sized, captioned frames (Lynn's greyscale archive, Karin's grid, JARCOS's 2-up). Video plays inside a project page or on hover.
6. **Serious first, then play, with a visible switch.** Karin Kiho: "Commercial and professional work" on white, then the background turns warm grey for "Other Projects" (hackathon, personal, experimental), grouped by type. Lynn Fisher keeps the CV on About and the weird side projects on Work. Ryan Mulligan's toys are fenced off in their own strip.
7. **The navigation is part of the design.** Lynn's homepage is a book's table of contents with roman numerals. Rauno's homepage is a sideways row of poster cards, one per section. Robin Rendle's is a Finder window. When the index looks good, the homepage doesn't need a reel.

## What makes them feel authored (not AI-made)

- **A metaphor from the person's own world, taken all the way.** Lynn: a book (contents page, version numbers v.I–v.XIX, an archive of every redesign). Robin Rendle: a Finder window. Spencer Chang: a lived-in room with a "NOW" sticky note and a visitor count. For an engineer this could come from her own tools (a repo, a changelog, a component library, a merge request list), but it has to be followed through, not just used as a decoration.
- **Odd, specific type.** Lynn pairs Sydonia Atramentiqua (an antique serif) with Hubano Rough. Cyd pairs Bueno (condensed caps) with Instrument Serif. Karin uses Google Sans Flex at weight 200–300, unusually light. None of them use Inter/Geist at 14px grey.
- **Real numbers and real details** (but see "Rules and clocks" in [creative-sites.md](creative-sites.md): a local time or a version stamp only counts when the visitor can act on it, and ruled lists only when the content is a real table). "68 clients", "970 words" (Anthony Hobday), "177 posts, 20,000+ stars" (Tania), "v. XIX", "Updated 10-09-26", the local time in the header (JARCOS "Guarulhos 18:27"), "Available November 2026" (Cyd). Specific facts read as human.
- **Hand-made marks.** Karin's hand-drawn circles and wavy underlines, Cyd's stickers and badges, Rauno's handwritten "Field Notes", Lynn's drop cap. One kind of mark, used consistently.
- **A constraint.** Lynn's work is all greyscale. Anthony's site is one monospace column with no images. JARCOS is black, white and 12px apart from the work. Restricting something makes the rest look chosen.
- **A clear tone of voice.** "Where I come from?", "Some personal joy", "Thanks for staying to the end", "fellow passenger through space and time". Short, a bit odd, clearly someone's own words.

## What reads as AI-made or templated (avoid)

- Centred hero: "Hi, I'm X 👋" + "I build fast, accessible experiences" + two buttons ("View my work", "Contact me")
- Gradient blob or glow behind the hero, purple-to-blue gradients, glassmorphism cards
- Bento grid of rounded-2xl cards with soft shadows, each with an icon and a two-line description
- Tech stack as a wall of logo badges
- Experience as a vertical line with dots on the left and a card per job with three bullet points
- Fade-up-on-scroll on every section, the same 0.6s ease on everything
- Inter or Geist at 14px in grey on white, everything centred in a 640px column, with no other idea. The "design engineer minimal" look (Paco Coursey, Emil Kowalski, Jakub Krehel, shud.in, Minwook Shin) was great when it was new, but it is now the default look of generated sites. Good for spacing and restraint, not to copy as is.
- Generic headings: "About Me", "My Projects", "Skills", "Let's work together"
- Autoplaying videos in every card, all the same size and all showing the same kind of thing (the feedback on the current portfolio)

## How they're built (stack notes)

| Site | Built with | Notes |
|---|---|---|
| Lynn Fisher | Static HTML/CSS, self-hosted fonts, no framework | Redesigned every year; the archive keeps every version |
| Cyd Stumpel | WordPress theme + GSAP + Lenis + swup (view transitions) | CSS scroll-driven animation on the title, variable-font size animation |
| JARCOS | Framer (+ Lenis) | Inter Display only; difference blend on the cursor |
| Karin Kiho | Next.js | No animation library; personality comes from SVG hand-drawn marks |
| Anthony Hobday | Plain HTML | One monospace column, `[Show N more]` toggles |
| Ryan Mulligan | Hand-built, CSS-heavy demos | Live CSS toys in the hero strip, theme switcher |
| Robin Rendle | Custom build | Whole UI imitates macOS Finder |
| Corentin Bernadou | WebGL (3D cube) | Example of motion that gets in the way of reading |

Takeaway: the ones that feel most crafted are not the ones with the most libraries. GSAP and Lenis show up, but used in one spot. Several of the best are plain static HTML with a strong idea.

## Pins

All pins for this research are in `content/inspo/petra-*.json` (project `petra`, verdict `maybe` until Petra picks). The ones most relevant to "experience first, then look what I made":

- `petra-karin-experience`, `petra-karin-other-projects`, `petra-karin-statement`: the closest match in structure
- `petra-jarcos-rows`: experience as a ledger with linked company names
- `petra-cyd-hero`, `petra-cyd-talks`: a creative developer's site with one playful spot, the rest calm
- `petra-lynn-index`, `petra-lynn-about`, `petra-lynn-archive`: navigation as the design; CV as typeset lists; still, labelled frames of past work
- `petra-tania-timeline`, `petra-greymac-clients`, `petra-anthonyhobday-ledger`: three other ways to set experience
