import { useEffect, useRef, useState } from 'react'
import type { Study } from '@site/data/studies'

/** A study's self-contained HTML in a sandboxed frame, loaded once it scrolls near the screen. */
export default function StudyFrame({ study, className = '', interactive = true }: { study: Study; className?: string; interactive?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const [html, setHtml] = useState<string | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let live = true
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        io.disconnect()
        study.loadHtml().then(h => live && setHtml(h))
      },
      { rootMargin: '200px' },
    )
    io.observe(el)
    return () => {
      live = false
      io.disconnect()
    }
  }, [study])

  return (
    <div ref={ref} className={`overflow-hidden bg-mist ${className}`}>
      {html !== null && (
        <iframe
          title={study.title}
          srcDoc={html}
          sandbox="allow-scripts"
          allow="accelerometer; gyroscope"
          className={`block h-full w-full border-0 ${interactive ? '' : 'pointer-events-none'}`}
        />
      )}
    </div>
  )
}
