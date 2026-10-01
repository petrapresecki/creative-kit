import { useEffect, useState } from 'react'
import { ScrollTrigger } from '@kit/lib/gsap'
import { getLenis } from '@kit/lib/lenis'

export interface FisheyeSection {
  /** id of the section element on the page */
  id: string
  label: string
}

export interface FisheyeIndexProps {
  sections: FisheyeSection[]
  /** Font sizes for the current item, its neighbours and the rest */
  sizes?: [string, string, string]
  scroller?: React.RefObject<HTMLElement | null>
  className?: string
}

/**
 * Mount Sapo's section index: the section you're in is set large, its
 * neighbours medium, the rest small, so the nav doubles as a progress bar.
 */
export default function FisheyeIndex({ sections, sizes = ['44px', '20px', '13px'], scroller, className = '' }: FisheyeIndexProps) {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const triggers = sections.map((s, i) =>
      ScrollTrigger.create({
        trigger: `#${s.id}`,
        scroller: scroller?.current ?? undefined,
        start: 'top 55%',
        end: 'bottom 55%',
        onToggle: self => self.isActive && setActive(i),
      }),
    )
    return () => triggers.forEach(t => t.kill())
  }, [sections, scroller])

  const go = (id: string) => {
    const target = document.getElementById(id)
    if (!target) return
    const lenis = getLenis()
    if (scroller?.current) scroller.current.scrollTo({ top: target.offsetTop, behavior: 'smooth' })
    else if (lenis) lenis.scrollTo(target)
    else target.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav className={className} aria-label="Sections">
      <ul className="flex flex-col items-start">
        {sections.map((s, i) => {
          const d = Math.abs(i - active)
          return (
            <li key={s.id}>
              <button
                onClick={() => go(s.id)}
                aria-current={i === active ? 'true' : undefined}
                className="font-medium leading-[1.05] tracking-[-0.03em] transition-[font-size,opacity] duration-500 ease-out-expo"
                style={{ fontSize: sizes[Math.min(d, 2)], opacity: d > 2 ? 0.55 : 1 }}
              >
                {s.label}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
