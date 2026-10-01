import { useRef, type ReactNode } from 'react'
import { Draggable, useGSAP } from '@kit/lib/gsap'

export interface CollagePiece {
  id: string
  src: string
  alt?: string
  /** Starting position and width, as % of the board */
  x: number
  y: number
  width: number
  rotate?: number
}

export interface DragCollageProps {
  pieces: CollagePiece[]
  /** Something to drop the pieces onto (a model photo, a poster, a wordmark) */
  children?: ReactNode
  className?: string
}

/**
 * A Noche Sone's "build your outfit": cut-out pieces you can drag anywhere on
 * the board; the piece you grab comes to the front and stays where you drop it.
 */
export default function DragCollage({ pieces, children, className = '' }: DragCollageProps) {
  const board = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      let z = pieces.length + 1
      Draggable.create('[data-piece]', {
        bounds: board.current,
        type: 'x,y',
        onPress() {
          ;(this.target as HTMLElement).style.zIndex = String(++z)
        },
      })
    },
    { scope: board, dependencies: [pieces] },
  )

  return (
    <div ref={board} className={`relative overflow-hidden ${className}`}>
      {children}
      {pieces.map((p, i) => (
        <img
          key={p.id}
          data-piece
          src={p.src}
          alt={p.alt ?? ''}
          draggable={false}
          className="absolute cursor-grab touch-none select-none drop-shadow-[0_12px_24px_rgba(0,0,0,0.25)] active:cursor-grabbing"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: `${p.width}%`, rotate: `${p.rotate ?? 0}deg`, zIndex: i + 1 }}
        />
      ))}
    </div>
  )
}
