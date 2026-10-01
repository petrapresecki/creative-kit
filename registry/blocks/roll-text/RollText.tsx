export interface RollTextProps {
  text: string
  className?: string
  /** ms between letters */
  stagger?: number
}

/**
 * Letters roll up to a duplicate when the nearest `.group` parent is hovered.
 * Wrap it in an element with `className="group"` (a link, a button).
 */
export default function RollText({ text, className = '', stagger = 12 }: RollTextProps) {
  return (
    // Line height keeps ascenders and descenders inside the clip while letters roll
    <span className={`relative inline-flex overflow-hidden leading-[1.2] ${className}`} aria-label={text}>
      {[...text].map((char, i) => (
        <span
          key={i}
          aria-hidden
          className="relative inline-block whitespace-pre transition-transform duration-500 ease-in-out-quart group-hover:-translate-y-full"
          style={{ transitionDelay: `${i * stagger}ms` }}
        >
          {char}
          <span className="absolute top-full left-0">{char}</span>
        </span>
      ))}
    </span>
  )
}
