import { useState } from 'react'

export default function CopyButton({ text, label = 'Copy', className = '' }: { text: string; label?: string; className?: string }) {
  const [done, setDone] = useState(false)
  return (
    <button
      onClick={() => {
        navigator.clipboard
          .writeText(text)
          .then(() => {
            setDone(true)
            setTimeout(() => setDone(false), 1400)
          })
          .catch(() => {})
      }}
      className={`caption rounded-full border border-ink px-3 py-1 transition-colors hover:bg-accent ${className}`}
    >
      {done ? 'Copied' : label}
    </button>
  )
}
