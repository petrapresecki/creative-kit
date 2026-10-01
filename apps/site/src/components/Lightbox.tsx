import { useEffect } from 'react'

export default function Lightbox({ src, caption, onClose }: { src: string; caption?: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <div role="dialog" aria-modal onClick={onClose} className="fixed inset-0 z-[90] grid cursor-zoom-out place-items-center bg-ink/80 p-6">
      <img src={src} alt={caption ?? ''} className="max-h-full max-w-full rounded-kit shadow-2xl" />
      {caption && <p className="caption fixed bottom-4 left-5 text-paper">{caption}</p>}
    </div>
  )
}
