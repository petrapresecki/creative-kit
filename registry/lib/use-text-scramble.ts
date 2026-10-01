import { useCallback, useRef, useState } from 'react'

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*'

interface Options {
  text: string
  /** ms between each character locking in */
  charDelay?: number
  /** ms between random character swaps */
  cycleSpeed?: number
}

/** Decode `text` through random characters, left to right. Call `trigger()` to play. */
export function useTextScramble({ text, charDelay = 50, cycleSpeed = 40 }: Options) {
  const [display, setDisplay] = useState(text)
  const running = useRef(false)

  const trigger = useCallback(() => {
    if (running.current) return
    running.current = true
    const chars = [...text]
    let locked = 0
    let lastCycle = 0
    let lastLock = 0

    const frame = (t: number) => {
      if (!lastCycle) lastCycle = lastLock = t
      if (t - lastLock >= charDelay && locked < chars.length) {
        locked++
        lastLock = t
      }
      if (t - lastCycle >= cycleSpeed) {
        lastCycle = t
        setDisplay(chars.map((c, i) => (c === ' ' || i < locked ? c : CHARS[(Math.random() * CHARS.length) | 0])).join(''))
      }
      if (locked < chars.length) requestAnimationFrame(frame)
      else {
        setDisplay(text)
        running.current = false
      }
    }
    requestAnimationFrame(frame)
  }, [text, charDelay, cycleSpeed])

  return { display, trigger }
}
