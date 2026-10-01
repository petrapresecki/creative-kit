import CopyButton from './CopyButton'

/** A one-line terminal command with a copy button. */
export default function Command({ children }: { children: string }) {
  return (
    <div className="flex min-w-0 max-w-full items-center justify-between gap-3 rounded-kit bg-ink py-2 pr-2 pl-4 text-paper">
      <code className="min-w-0 overflow-x-auto font-mono text-[13px] whitespace-nowrap">
        <span className="text-accent select-none">$ </span>
        {children}
      </code>
      <CopyButton text={children} className="shrink-0 border-paper/30 text-paper hover:text-ink" />
    </div>
  )
}
