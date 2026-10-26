/**
 * After dieleerezwischendenzeilen.xyz: a hand-drawn pixel face of tall, narrow capitals on a
 * 5 × 9 grid. Every pixel is printed as a bar taller than it is wide, with a hairline gap under
 * it, so the stems break into dashes the way that site's letters do. Free pixel fonts are either
 * five pixels tall or not crisp, which is why this one is drawn. It's an SVG of rects, so it takes
 * the text colour and scales to any size: inline at the size of the text around it, or `fill`
 * to span its box. Lower case is set in capitals.
 */

export interface PixelTypeProps {
  text: string
  className?: string
  /** Stretch the whole line to its container's width */
  fill?: boolean
  /** How tall each pixel is drawn, for a width of one (1 = square pixels) */
  tall?: number
  /** The gap under each pixel, as a share of one pixel's width (0 = solid strokes) */
  gap?: number
}

type Glyph = { rows: string[]; above?: string[] }

const g = (s: string, above?: string): Glyph => ({ rows: s.trim().split(/\s+/), above: above?.trim().split(/\s+/) })

const CARON = '.#.#. ..#..'
const ACUTE = '...#. ..#..'

/** '#' is ink, '.' is paper; `above` is drawn over the cap height, for accents */
const GLYPHS: Record<string, Glyph> = {
  A: g('.###. #...# #...# #...# ##### #...# #...# #...# #...#'),
  B: g('####. #...# #...# ####. #...# #...# #...# #...# ####.'),
  C: g('.#### #.... #.... #.... #.... #.... #.... #.... .####'),
  D: g('###.. #..#. #...# #...# #...# #...# #...# #..#. ###..'),
  E: g('##### #.... #.... ####. #.... #.... #.... #.... #####'),
  F: g('##### #.... #.... ####. #.... #.... #.... #.... #....'),
  G: g('.#### #.... #.... #.... #..## #...# #...# #...# .###.'),
  H: g('#...# #...# #...# #...# ##### #...# #...# #...# #...#'),
  I: g('### .#. .#. .#. .#. .#. .#. .#. ###'),
  J: g('..### ...#. ...#. ...#. ...#. ...#. #..#. #..#. .##..'),
  K: g('#...# #..#. #.#.. ##... #.#.. #..#. #..#. #...# #...#'),
  L: g('#.... #.... #.... #.... #.... #.... #.... #.... #####'),
  M: g('#...# ##.## #.#.# #.#.# #...# #...# #...# #...# #...#'),
  N: g('#...# ##..# ##..# #.#.# #.#.# #..## #..## #...# #...#'),
  O: g('.###. #...# #...# #...# #...# #...# #...# #...# .###.'),
  P: g('####. #...# #...# #...# ####. #.... #.... #.... #....'),
  Q: g('.###. #...# #...# #...# #...# #...# #.#.# #..#. .##.#'),
  R: g('####. #...# #...# #...# ####. #.#.. #..#. #...# #...#'),
  S: g('.#### #.... #.... .#... ..##. ....# ....# ....# ####.'),
  T: g('##### ..#.. ..#.. ..#.. ..#.. ..#.. ..#.. ..#.. ..#..'),
  U: g('#...# #...# #...# #...# #...# #...# #...# #...# .###.'),
  V: g('#...# #...# #...# #...# .#.#. .#.#. .#.#. ..#.. ..#..'),
  W: g('#...# #...# #...# #...# #.#.# #.#.# #.#.# ##.## #...#'),
  X: g('#...# #...# .#.#. .#.#. ..#.. .#.#. .#.#. #...# #...#'),
  Y: g('#...# #...# .#.#. .#.#. ..#.. ..#.. ..#.. ..#.. ..#..'),
  Z: g('##### ....# ...#. ...#. ..#.. .#... .#... #.... #####'),
  Č: g('.#### #.... #.... #.... #.... #.... #.... #.... .####', CARON),
  Ć: g('.#### #.... #.... #.... #.... #.... #.... #.... .####', ACUTE),
  Š: g('.#### #.... #.... .#... ..##. ....# ....# ....# ####.', CARON),
  Ž: g('##### ....# ...#. ...#. ..#.. .#... .#... #.... #####', CARON),
  Đ: g('###.. #..#. #...# #...# ###.# #...# #...# #..#. ###..'),
  0: g('.###. #...# #..## #.#.# #.#.# ##..# #...# #...# .###.'),
  1: g('.#. ##. .#. .#. .#. .#. .#. .#. ###'),
  2: g('.###. #...# ....# ...#. ..#.. .#... #.... #.... #####'),
  3: g('####. ....# ....# .###. ....# ....# ....# ....# ####.'),
  4: g('#...# #...# #...# #...# ##### ....# ....# ....# ....#'),
  5: g('##### #.... #.... ####. ....# ....# ....# ....# ####.'),
  6: g('.###. #.... #.... ####. #...# #...# #...# #...# .###.'),
  7: g('##### ....# ...#. ...#. ..#.. ..#.. .#... .#... .#...'),
  8: g('.###. #...# #...# .###. #...# #...# #...# #...# .###.'),
  9: g('.###. #...# #...# #...# .#### ....# ....# ....# .###.'),
  '.': g('. . . . . . . . #'),
  ',': g('.. .. .. .. .. .. .. .# #.'),
  ':': g('. . . # . . . # .'),
  '!': g('# # # # # # . . #'),
  '?': g('.###. #...# ....# ...#. ..#.. ..#.. ..#.. ..... ..#..'),
  '-': g('... ... ... ... ### ... ... ... ...'),
  '+': g('..... ..... ..#.. ..#.. ##### ..#.. ..#.. ..... .....'),
  '&': g('.##.. #..#. #..#. .##.. .#... #.#.# #..#. #..#. .##.#'),
  '’': g('# # . . . . . . .'),
  "'": g('# # . . . . . . .'),
  '/': g('....# ....# ...#. ...#. ..#.. .#... .#... #.... #....'),
  ' ': g('... ... ... ... ... ... ... ... ...'),
}

const ROWS = 9
const ABOVE = 2

const cache = new Map<string, { w: number; cells: [number, number][] }>()

function layout(text: string) {
  const hit = cache.get(text)
  if (hit) return hit
  const cells: [number, number][] = []
  let x = 0
  for (const ch of text.toUpperCase()) {
    const glyph = GLYPHS[ch] ?? GLYPHS[' ']
    glyph.rows.forEach((row, y) => [...row].forEach((c, i) => c === '#' && cells.push([x + i, ABOVE + y])))
    const above = (glyph.above ?? []).slice(-ABOVE)
    above.forEach((row, y) => [...row].forEach((c, i) => c === '#' && cells.push([x + i, ABOVE - above.length + y])))
    x += glyph.rows[0].length + 1
  }
  const art = { w: Math.max(1, x - 1), cells }
  cache.set(text, art)
  return art
}

export default function PixelType({ text, className = '', fill = false, tall = 1.5, gap = 0.28 }: PixelTypeProps) {
  const { w, cells } = layout(text)
  const h = (ROWS + ABOVE) * tall
  // inline, the svg is 11 rows tall and the capitals take the bottom 9, so 0.9em puts their tops at the cap height;
  // the negative top margin keeps it from making its line taller than the others
  const style = fill ? { display: 'block' } : { display: 'inline-block', height: '0.9em', margin: '-0.3em 0.04em 0', verticalAlign: 'baseline' }
  return (
    <span className={className} style={style} role="img" aria-label={text}>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        style={fill ? { display: 'block', width: '100%', height: 'auto' } : { display: 'block', height: '100%', width: 'auto' }}
        fill="currentColor"
        aria-hidden
      >
        {cells.map(([x, y]) => (
          <rect key={`${x}.${y}`} x={x} y={y * tall} width={1.03} height={Math.max(0.1, tall - gap)} />
        ))}
      </svg>
    </span>
  )
}
