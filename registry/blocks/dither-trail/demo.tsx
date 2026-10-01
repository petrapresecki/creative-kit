import DitherTrail from './DitherTrail'

export default function Demo() {
  return (
    <div className="relative h-[520px]">
      <DitherTrail className="absolute inset-0 h-full w-full" />
      <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-2">
        <div className="flex items-end border-r border-b border-ink bg-paper p-4">
          <p className="text-title">Solid cells cover the noise</p>
        </div>
        <div className="border-r border-b border-ink" />
        <div className="border-b border-ink bg-accent" />
        <div className="border-r border-ink" />
        <div className="flex items-end border-r border-ink bg-paper p-4">
          <p className="caption">Empty cells are windows — move the mouse through them</p>
        </div>
        <div />
      </div>
    </div>
  )
}
