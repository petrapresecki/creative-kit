import { useEffect, useState } from 'react'
import CopyButton from './CopyButton'

/** Tabs of source files, loaded on demand. */
export default function CodeView({ files }: { files: Record<string, () => Promise<string>> }) {
  const names = Object.keys(files)
  const [active, setActive] = useState(names[0])
  const [code, setCode] = useState('')

  useEffect(() => {
    let live = true
    files[active]?.().then(c => live && setCode(c))
    return () => {
      live = false
    }
  }, [active, files])

  return (
    <div className="overflow-hidden rounded-kit border border-ink">
      <div className="flex items-center justify-between gap-3 border-b border-ink bg-mist px-2 py-2">
        <div className="flex gap-1 overflow-x-auto">
          {names.map(n => (
            <button key={n} onClick={() => setActive(n)} className={`rounded-full px-3 py-1 font-mono text-[12px] whitespace-nowrap ${n === active ? 'bg-ink text-paper' : 'hover:bg-paper'}`}>
              {n}
            </button>
          ))}
        </div>
        <CopyButton text={code} className="shrink-0 bg-paper" />
      </div>
      <pre className="max-h-[560px] overflow-auto bg-paper p-4 font-mono text-[12.5px] leading-[1.6]">
        <code>{code}</code>
      </pre>
    </div>
  )
}
