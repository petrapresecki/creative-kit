import { demoCards } from '@site/data/demo'
import DragCollage from './DragCollage'

const spots = [
  [4, 8, -8], [18, 52, 6], [6, 60, 4], [78, 6, 9], [70, 56, -5], [84, 40, -10], [30, 4, 3], [56, 64, 7],
]
const pieces = spots.map(([x, y, rotate], i) => ({ id: demoCards[i * 3].id, src: demoCards[i * 3].src, x, y, rotate, width: 13 }))

export default function Demo() {
  return (
    <DragCollage pieces={pieces} className="h-[560px] bg-mist">
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="font-display text-display">Drag me</p>
        <p className="caption mt-4 text-muted">Pick up any card and drop it anywhere</p>
      </div>
    </DragCollage>
  )
}
