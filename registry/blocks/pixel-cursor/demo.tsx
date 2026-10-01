import { useState } from 'react'
import RollText from '@kit/blocks/roll-text/RollText'
import PixelCursor from './PixelCursor'

export default function Demo() {
  const [on, setOn] = useState(false)
  return (
    <div className="flex min-h-[340px] flex-col items-center justify-center gap-6 p-10">
      {on && <PixelCursor />}
      <button onClick={() => setOn(v => !v)} className="group rounded-full bg-accent px-6 py-3 text-[15px] font-medium">
        <RollText text={on ? 'Turn the cursor off' : 'Try the pixel cursor'} />
      </button>
      <p className="caption max-w-[40ch] text-center text-muted">
        It replaces the system cursor everywhere on the page and switches to the hand over anything clickable.
      </p>
    </div>
  )
}
