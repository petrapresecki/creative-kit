export interface TickerStripProps {
  text: string
  /** Repeated between runs of the text */
  separator?: string
  /** Seconds per loop */
  duration?: number
  /** Strip colour; any CSS colour. Text is white */
  color?: string
  /** Pin to the bottom of the viewport */
  fixed?: boolean
  className?: string
}

/**
 * The strip along the bottom of dress up timothée: one line of small type running
 * across a coloured band, saying what is happening. It repeats what the page already
 * says, so it is hidden from screen readers; it pauses under the pointer and stands
 * still with reduced motion. Uses kit.css's `kit-marquee` (two copies, slide by half).
 */
export default function TickerStrip({
  text,
  separator = ' ♡ ',
  duration = 48,
  color = 'var(--color-ink)',
  fixed = false,
  className = '',
}: TickerStripProps) {
  const run = `${text}${separator}`.repeat(4)
  return (
    <div
      aria-hidden
      className={`group h-[26px] overflow-hidden whitespace-nowrap text-[13px] leading-[26px] text-white ${fixed ? 'fixed inset-x-0 bottom-0 z-40' : 'relative'} ${className}`}
      style={{ background: color }}
    >
      <div
        className="flex w-max group-hover:[animation-play-state:paused] motion-reduce:animate-none motion-reduce:pl-4"
        style={{ animation: `kit-marquee ${duration}s linear infinite` }}
      >
        <span className="shrink-0 whitespace-pre">{run}</span>
        <span className="shrink-0 whitespace-pre">{run}</span>
      </div>
    </div>
  )
}
