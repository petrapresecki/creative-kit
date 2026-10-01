import { useLayoutEffect, useRef } from 'react'
import { ScrollTrigger } from '@kit/lib/gsap'

export interface FitTextProps {
  text: string
  className?: string
}

/** One line of text sized to exactly fill its container's width (wordmarks, footers). */
export default function FitText({ text, className = '' }: FitTextProps) {
  const box = useRef<HTMLDivElement>(null)
  const inner = useRef<HTMLSpanElement>(null)

  useLayoutEffect(() => {
    const fit = () => {
      if (!box.current || !inner.current) return
      const style = getComputedStyle(box.current)
      const available = box.current.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight)
      inner.current.style.fontSize = '100px'
      inner.current.style.fontSize = `${(100 * available) / inner.current.offsetWidth}px`
    }
    fit()
    document.fonts.ready.then(() => {
      fit()
      ScrollTrigger.refresh()
    })
    const observer = new ResizeObserver(fit)
    observer.observe(box.current!)
    return () => observer.disconnect()
  }, [text])

  return (
    <div ref={box} className={className}>
      <span ref={inner} className="inline-block leading-[0.8] whitespace-nowrap">
        {text}
      </span>
    </div>
  )
}
