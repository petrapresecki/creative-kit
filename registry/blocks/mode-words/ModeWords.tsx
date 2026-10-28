import { createContext, useContext, useEffect, useId, useMemo, useState, type ReactNode } from 'react'

interface ModeState {
  mode: string | null
  locked: string | null
  enter: (mode: string) => void
  leave: () => void
  toggle: (mode: string) => void
}

const ModeContext = createContext<ModeState>({ mode: null, locked: null, enter: () => {}, leave: () => {}, toggle: () => {} })

/** The active mode (hovered or locked), or null. */
export const useMode = () => useContext(ModeContext).mode

export interface ModeWordsProps {
  children: ReactNode
  /** Mode to start locked in */
  defaultMode?: string | null
  onChange?: (mode: string | null) => void
  className?: string
}

/**
 * Liya Kedar's statement switches: words inside the wrapper restyle everything in it.
 * The wrapper is `group/modes` with `data-mode`, so children restyle with classes like
 * `group-data-[mode=color]/modes:bg-mist`, or swap content with <ModeSwap>.
 * Mouse: hover previews, click locks. Touch: tap locks, tap anywhere else clears.
 */
export function ModeWords({ children, defaultMode = null, onChange, className = '' }: ModeWordsProps) {
  const [hover, setHover] = useState<string | null>(null)
  const [locked, setLocked] = useState<string | null>(defaultMode)
  const mode = locked ?? hover

  useEffect(() => onChange?.(mode), [mode, onChange])

  useEffect(() => {
    if (!locked) return
    const down = (e: PointerEvent) => {
      if (!(e.target as Element).closest?.('[data-mode-word]')) setLocked(null)
    }
    const key = (e: KeyboardEvent) => e.key === 'Escape' && setLocked(null)
    document.addEventListener('pointerdown', down)
    document.addEventListener('keydown', key)
    return () => {
      document.removeEventListener('pointerdown', down)
      document.removeEventListener('keydown', key)
    }
  }, [locked])

  const value = useMemo<ModeState>(
    () => ({
      mode,
      locked,
      enter: m => setHover(m),
      leave: () => setHover(null),
      toggle: m => setLocked(l => (l === m ? null : m)),
    }),
    [mode, locked],
  )

  return (
    <ModeContext.Provider value={value}>
      <div data-mode={mode ?? undefined} className={`group/modes ${className}`}>
        {children}
      </div>
    </ModeContext.Provider>
  )
}

/** An underlined word that switches the wrapper into `mode`. */
export function ModeWord({ mode, children, className = '' }: { mode: string; children: ReactNode; className?: string }) {
  const { locked, enter, leave, toggle } = useContext(ModeContext)
  return (
    <button
      type="button"
      data-mode-word
      aria-pressed={locked === mode}
      onPointerEnter={e => e.pointerType === 'mouse' && enter(mode)}
      onPointerLeave={e => e.pointerType === 'mouse' && leave()}
      onFocus={() => enter(mode)}
      onBlur={leave}
      onClick={() => toggle(mode)}
      className={`inline cursor-pointer underline decoration-[.05em] underline-offset-[.12em] [text-transform:inherit] group-data-[mode]/modes:decoration-[.04em] ${className}`}
    >
      {children}
    </button>
  )
}

/**
 * Shows `base`, or the node for the active mode when there is one. Every layer stays
 * mounted (images keep loading) and the switch is instant, like the original.
 * `base` sets the size; the alternatives cover it.
 */
export function ModeSwap({ base, modes, className = '' }: { base: ReactNode; modes: Record<string, ReactNode>; className?: string }) {
  const mode = useMode()
  const current = mode && mode in modes ? mode : null
  return (
    <div className={`relative ${className}`}>
      <div aria-hidden={current !== null} className={`h-full ${current ? 'invisible' : ''}`}>
        {base}
      </div>
      {Object.entries(modes).map(([m, node]) => (
        <div key={m} aria-hidden={current !== m} className={`absolute inset-0 ${current === m ? '' : 'invisible'}`}>
          {node}
        </div>
      ))}
    </div>
  )
}

export interface LineArtProps {
  src: string
  alt?: string
  /** 0–1: higher keeps finer lines (and more grain) */
  detail?: number
  className?: string
}

/**
 * A photo traced as ink lines on paper with an SVG filter: greyscale, blur,
 * a Laplacian edge kernel, then a threshold into an ink-coloured alpha mask.
 * A quick stand-in for hand-drawn outline versions of each image.
 */
export function LineArt({ src, alt = '', detail = 0.5, className = '' }: LineArtProps) {
  const id = `kit-line-${useId().replace(/[^a-zA-Z0-9-]/g, '')}`
  const blur = (1.6 - detail * 1.2).toFixed(2)
  const gain = (10 + detail * 26).toFixed(1)
  return (
    <div className={`h-full w-full bg-paper ${className}`}>
      <svg aria-hidden width="0" height="0" className="absolute">
        <filter id={id} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values="0.3 0.59 0.11 0 0  0.3 0.59 0.11 0 0  0.3 0.59 0.11 0 0  0 0 0 1 0" />
          <feGaussianBlur stdDeviation={blur} />
          <feConvolveMatrix order="3" kernelMatrix="-1 -1 -1 -1 8 -1 -1 -1 -1" preserveAlpha="true" />
          <feColorMatrix type="matrix" values={`0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  ${gain} 0 0 0 -0.6`} result="lines" />
          <feFlood style={{ floodColor: 'var(--color-ink)' }} />
          <feComposite in2="lines" operator="in" />
        </filter>
      </svg>
      <img src={src} alt={alt} loading="lazy" style={{ filter: `url(#${id})` }} className="h-full w-full object-cover" />
    </div>
  )
}
