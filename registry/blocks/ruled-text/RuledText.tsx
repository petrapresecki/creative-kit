import type { CSSProperties, ReactNode } from 'react'
import PixelType from '@kit/blocks/pixel-type/PixelType'

export type RuledFace = 'script' | 'blur' | 'tall' | 'cut' | 'pixel'

export interface RuledTextProps {
  /** The sentence, as plain text */
  text: string
  /** Phrases in `text` to set apart in the display face, matched exactly and in order of appearance */
  apart?: string[]
  /** How the set-apart words are set (they need their fonts loaded: see the faces below) */
  face?: RuledFace
  as?: 'p' | 'h1' | 'h2' | 'h3' | 'div'
  className?: string
  /** Line height of the sentence; the rules follow it */
  leading?: number
  /** Draw the ruled lines (off leaves only the mixed faces) */
  ruled?: boolean
}

/**
 * The set-apart faces. Each one has `line-height: 0` (or a negative margin) so a word taller than
 * the line hangs over its neighbours instead of making its own line taller, which would push every
 * rule after it off the text.
 */
const FACES: Record<Exclude<RuledFace, 'pixel'>, CSSProperties> = {
  // Pinyon Script, as coslovs.com sets "Art director" inside a thin sans sentence
  script: { fontFamily: "'Pinyon Script', 'Snell Roundhand', cursive", fontSize: '1.2em', lineHeight: 0, letterSpacing: 0 },
  // a heavy grotesk in lower case, well out of focus until you point at it
  blur: {
    fontFamily: "'Archivo', 'Arial Black', sans-serif",
    fontSize: '1.03em',
    fontStretch: '104%',
    fontWeight: 900,
    lineHeight: 0,
    textTransform: 'lowercase',
    letterSpacing: '-0.035em',
    filter: 'blur(0.055em)',
    transition: 'filter 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
  },
  // a compressed italic, drawn up taller and slanted further than the font goes on its own
  tall: {
    display: 'inline-block',
    fontFamily: "'Archivo', 'Arial Narrow', sans-serif",
    fontSize: '1.35em',
    fontStretch: '62%',
    fontStyle: 'italic',
    fontWeight: 470,
    lineHeight: 0,
    textTransform: 'lowercase',
    letterSpacing: '-0.01em',
    wordSpacing: '0.12em',
    transform: 'scaleY(1.3) skewX(-5deg)',
    transformOrigin: '50% 82%',
  },
  // blackletter cut letters
  cut: { fontFamily: "'Pirata One', serif", fontSize: '1.05em', lineHeight: 0, letterSpacing: 0 },
}

function Apart({ text, face }: { text: string; face: RuledFace }) {
  if (face === 'pixel') return <PixelType text={text} />
  return (
    <span
      style={FACES[face]}
      onPointerEnter={face === 'blur' ? e => (e.currentTarget.style.filter = 'blur(0)') : undefined}
      onPointerLeave={face === 'blur' ? e => (e.currentTarget.style.filter = FACES.blur.filter as string) : undefined}
    >
      {text}
    </span>
  )
}

/**
 * After coslovs.com: a sentence in a thin sans on ruled lines, with a few words set apart in a display
 * face (script, a heavy blur, a tall italic, cut letters or pixel capitals). Each rule sits just under
 * the baseline of its line, so the words rest on it like ruled paper. Rules use the text colour at low
 * strength, so they work on any theme.
 */
export default function RuledText({
  text,
  apart = [],
  face = 'script',
  as: Tag = 'p',
  className = '',
  leading,
  ruled = true,
}: RuledTextProps) {
  const lh = leading ?? (face === 'tall' ? 1.5 : 1.08)
  const parts: ReactNode[] = []
  let rest = text
  for (;;) {
    const hits = apart.map(p => [rest.indexOf(p), p] as const).filter(([i]) => i >= 0)
    if (!hits.length) break
    const [i, p] = hits.reduce((a, b) => (b[0] < a[0] ? b : a))
    if (i > 0) parts.push(rest.slice(0, i))
    parts.push(<Apart key={parts.length} text={p} face={face} />)
    rest = rest.slice(i + p.length)
  }
  parts.push(rest)

  const style: CSSProperties = {
    lineHeight: lh,
    ...(ruled && {
      backgroundImage: 'linear-gradient(to bottom, transparent calc(100% - 1px), color-mix(in srgb, currentColor 14%, transparent) calc(100% - 1px))',
      backgroundSize: '100% 1lh',
      // the gap between baseline and the bottom of the line grows with the leading, so the lift does too
      backgroundPosition: `0 ${-(0.11 + (lh - 1.08) * 0.45).toFixed(3)}em`,
    }),
  }
  return (
    <Tag className={className} style={style}>
      {parts}
    </Tag>
  )
}
