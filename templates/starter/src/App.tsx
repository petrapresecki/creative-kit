import { useEffect } from 'react'
import { initLenis, destroyLenis } from '@/lib/kit/lenis'

export default function App() {
  useEffect(() => {
    initLenis()
    return () => destroyLenis()
  }, [])

  return (
    <main className="min-h-svh px-4 py-6 md:px-5">
      <p className="caption flex items-center gap-2">
        <span className="size-2 bg-accent" /> {{name}}
      </p>
      <h1 className="mt-[30vh] max-w-[14ch] text-headline">A new site, started from creative-kit.</h1>
      <p className="mt-6 max-w-[48ch] text-lead text-muted">
        Add blocks with <code className="font-mono">pnpm kit add &lt;block&gt; --to .</code> from the kit folder, then import them from
        <code className="font-mono"> @/components/kit</code>.
      </p>
    </main>
  )
}
