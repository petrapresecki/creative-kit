# Typography from the portfolio looks

The type tried on Petra's portfolio (petra-presecki-portfolio) in October 2026, while trying on "looks" after
Coslovs, Petr Menhart, Sonya Akulshina, Die Leere zwischen den Zeilen, Kati Hermann, Barbiana Liu and A Noche Sone.
The portfolio stayed on its original type (Host Grotesk + Reddit Mono), so this is where the rest lives.

Every face is on Google Fonts unless it says it was built. The reading faces, the portfolio's own included, are under Text faces. Where the source site uses a paid or custom font, the
note says what it really is and why the free face was picked. Three treatments were built in code and are now blocks:
`pixel-type`, `cut-letters` and `ruled-text`.

## What the sites really use

Read off their CSS and font files, so the substitutes below are informed guesses, not vibes.

| Site | Their type | Closest free |
|---|---|---|
| coslovs.com | **Pinyon Script** for the script words (Google, exact), a thin condensed grotesk via Typekit (`nddy`, 300, 50px, −0.5px) for everything else, League Gothic and Meow Script on the works page | Pinyon Script + Roboto Condensed 200 |
| petrmenhart.xyz | Hand-made red lettering (an image), and **Manrope** for the services line and the small paragraph (the file is Manrope ExtraLight, variable) | Manrope (exact) + Pirata One for the lettering |
| akulshinasonya.com | A custom condensed grotesk in capitals (Readymag `custom_159780`, 23px, 400) on white slips | Pathway Extreme at 75% width |
| dieleerezwischendenzeilen.xyz | A custom broken pixel display face, Inter for small text | Built: `pixel-type` |
| anochesone.com | `asloch`, a thin swashy gothic, for all the navigation; Roboto Mono and Helvetica for UI | Grenze Gotisch 200–300 |
| Kati Hermann (Readymag) | A chunky heavy wordmark, Courier New for the ticker and nav | Climate Crisis, Courier Prime |
| barbianaliu.com | A condensed grotesk name, black label tags, $-sign ASCII drawings | Archivo at 62% width |

## The faces

### Pinyon Script, for words set apart in a sentence (Coslovs)
- `font-family: 'Pinyon Script'; font-size: 1.2em; line-height: 0` inside a thin sans sentence.
- `line-height: 0` matters: it lets the swashes hang over the lines above and below without making their own line taller,
  so ruled lines under the text stay even. Used by `ruled-text`.
- Also big: section heads (`Experience:`) at 60px, and a full-width name in the accent colour.

### Roboto Condensed 200, the thin condensed body (Coslovs)
- Big text `clamp(30px, 3.5vw, 50px)`, weight 200, `line-height: 1.08`, `letter-spacing: -0.01em`. Small text 14px, 400.
- Closest free match to Coslovs' Typekit face. Archivo at 62%/200 is narrower but too dark; Pathway Extreme 75%/250 too wide.

### Manrope, Menhart's own sans
- Services line: 800, `clamp(20px, 1.9vw, 30px)`, `letter-spacing: -0.06em`, `line-height: 1.35`, red four-point stars between items.
- Small centred paragraph: 500, 14px, `line-height: 1.75`, about 62rem wide. Statements: 700, `letter-spacing: -0.045em`.
- The Linocut theme uses Archivo for this role; Manrope is the one Menhart actually uses.

### Pirata One, cut red letters (Menhart's lettering, as a font)
- Mixed case by hand (`pEtRa pResEčKi`, `eXpeRiEncE`; avoid capital O and I, they read as 0 and 1),
  each letter rotated a few degrees (−5…5) and nudged on the baseline, then roughened with an SVG filter:
  `feTurbulence type=fractalNoise baseFrequency=0.035 numOctaves=3` → `feDisplacementMap scale=5`.
- Red `#ee2b2f` on warm grey `#e2dfda`. Built as `cut-letters`.

### Pathway Extreme at 75% width, Sonya's capitals
- `font-stretch: 75%; font-weight: 350; text-transform: uppercase; letter-spacing: -0.005em; line-height: 1.06`.
- Set black on white slips per line: wrap the text in one inline span and give it `background: #fff; padding-inline: 0.18em;
  box-decoration-break: clone` (the `-webkit-` version too). Menu links 17px, labels 14px.
- For her blurred pink name over film, use the `fuzz-type` block.

### Archivo 900, heavy blurred lower case ("blah", Lavrinenko)
- `font-weight: 900; font-stretch: 104%; text-transform: lowercase; letter-spacing: -0.035em; filter: blur(0.055em)`,
  a touch bigger than the line (1.03em). Comes into focus on hover (`filter: blur(0)`, 0.6s ease-out-expo).
- Give the blur in `em` on the element that has the big font size, or in px; an em inherited from a small parent blurs nothing.
- The text around it should step down a size, or the page shouts.

### Archivo Italic at 62% width, drawn taller ("blah", Kirilenko)
- `font-stretch: 62%; font-style: italic; font-weight: 470; text-transform: lowercase; letter-spacing: -0.01em; word-spacing: 0.12em`,
  then `display: inline-block; transform: scaleY(1.3) skewX(-5deg); transform-origin: 50% 82%; line-height: 0`.
- No free font is that tall and that slanted, so the stretch and the extra slant are done in CSS. `line-height: 0` keeps the
  stretched words from pushing their line taller; give the surrounding text `line-height: 1.5` so they don't reach into the line above.

### The custom pixel face (Die Leere)
- Free pixel fonts are either 5px tall (Tiny5, Micro 5, Silkscreen; unreadable big) or not crisp (Jersey, Pixelify, Jacquard).
- So it was drawn: capitals on a 5 × 9 grid, every pixel a bar 1.5 tall with a 0.28 gap under it, so stems break into dashes.
  Croatian letters included (Č Ć Š Ž Đ). Built as `pixel-type`.

### Grenze Gotisch, the thin gothic (A Noche Sone)
- 200–300 for a name and a long intro on a blue pool. Readable as running text only at 26px and up.

### From the first round
- **Jersey 10** (pixel display) with **Pixelify Sans** labels and **Reddit Mono** body: the Silicon theme covers this ground now.
- **Climate Crisis** with its `YEAR` axis animated 1979 → 2048 (`font-variation-settings`), a name that melts and recovers on a loop. Kati Hermann's chunky wordmark.
- **Archivo 62%** statements with **Courier Prime** for a typewriter ticker, black `[TAGS]` for labels: Kati and Barbiana.
- **Antonio** condensed capitals: replaced by Pathway Extreme, which is closer to Sonya.

## Text faces

The faces for reading, under all of the above.

### Host Grotesk + Reddit Mono, the portfolio's own (what it shipped with)
- Paper `#f2f0ea`, ink `#151514`, one grey `#77746d`, hairlines `rgb(21 21 20 / 0.16)`; no accent colour.
- Body: Host Grotesk 400, 14px, `line-height: 1.45`. Labels: 12px in the grey.
- Statements: 300, `clamp(24px, 2.6vw, 40px)`, `line-height: 1.12`, `letter-spacing: -0.02em`, `text-wrap: pretty`.
  The hello at the top reads as a sentence, not a headline: `clamp(20px, 1.8vw, 28px)`, `line-height: 1.25`, `letter-spacing: -0.01em`.
- Reddit Mono only for code: 12px, `line-height: 1.5`, on the mist grey.
- One grotesk at two weights carries the whole page; links underline only on hover.

### Instrument Serif + Inter + JetBrains Mono (the portfolio's serif version)
- A big Instrument Serif name, `clamp(64px, 11vw, 168px)`, `line-height: 0.88`, `letter-spacing: -0.025em`; headings in it at 400,
  `line-height: 1.05`, `letter-spacing: -0.01em` (24–52px).
- Inter for reading: 15px, `line-height: 1.5`; the intro at 19–22px, `line-height: 1.5`, about 46ch wide.
- JetBrains Mono capitals for labels, nav and meta: 11px, `letter-spacing: 0.08em`, uppercase, with always-on underlines on links.
- Paper `#f1eee6`, ink `#141413`, and one blue `#2b3bea` for section numbers.

### Body text in the other looks
- **Pathway Extreme at full width** (Haze): the same family as the condensed capitals, so labels and reading text match while only the width changes.
- **Reddit Mono as body** (the pixel look): 13px, so the pixel display type sits on something that still reads as a screen.
- **Archivo at 85% width** (the Kati and Barbiana look): 15px for reading, with statements at 62% width, 400, `letter-spacing: -0.035em`.
- **Host Grotesk kept as body** under the blue-pool (Grenze Gotisch) and the first Haze looks: when the display face is loud, the reading face can stay the one you already have.

## Ruled lines under text (Coslovs)
- `background-image: linear-gradient(to bottom, transparent calc(100% - 1px), var(--rule) calc(100% - 1px)); background-size: 100% 1lh;`
- Lift the rule from the bottom of the line box to just under the baseline: `background-position: 0 -0.11em` at `line-height: 1.08`
  (about `-0.3em` at `line-height: 1.5`).
- Anything inline that is taller than the line (script, stretched or pixel words) needs `line-height: 0` or a negative top margin,
  or that line grows and every rule after it drifts. Check by dividing the block height by its line height: it must be a whole number.
- Built as `ruled-text`.
