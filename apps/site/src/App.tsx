import { useEffect } from 'react'
import { ScrollTrigger } from '@kit/lib/gsap'
import { initLenis, destroyLenis, getLenis } from '@kit/lib/lenis'
import { parseRoute, usePath } from '@site/lib/router'
import Nav from '@site/components/Nav'
import Home from '@site/pages/Home'
import Blocks from '@site/pages/Blocks'
import BlockPage from '@site/pages/BlockPage'
import Themes from '@site/pages/Themes'
import Grids from '@site/pages/Grids'
import Inspo from '@site/pages/Inspo'
import Start from '@site/pages/Start'
import Process from '@site/pages/Process'
import FieldGuide from '@site/pages/FieldGuide'
import Studies from '@site/pages/Studies'
import StudyPage from '@site/pages/StudyPage'

export default function App() {
  const path = usePath()
  const route = parseRoute(path)

  useEffect(() => {
    initLenis()
    return () => destroyLenis()
  }, [])

  // New page: back to the top, then recalculate every scroll trigger
  useEffect(() => {
    getLenis()?.scrollTo(0, { immediate: true })
    window.scrollTo(0, 0)
    const id = requestAnimationFrame(() => ScrollTrigger.refresh())

    // A trackpad flick keeps sending wheel events for a second after the click, which would
    // scroll the new page straight down. Swallow that tail; the first wheel after a pause is a real scroll.
    let last = performance.now()
    const release = () => document.removeEventListener('wheel', swallow, { capture: true })
    const swallow = (e: WheelEvent) => {
      const now = performance.now()
      if (now - last > 150) return release()
      last = now
      e.preventDefault()
      e.stopPropagation()
    }
    document.addEventListener('wheel', swallow, { capture: true, passive: false })
    const cap = window.setTimeout(release, 3000)

    return () => {
      cancelAnimationFrame(id)
      clearTimeout(cap)
      release()
    }
  }, [path])

  return (
    <>
      <Nav page={route.page} />
      <main key={path}>
        {route.page === 'home' && <Home />}
        {route.page === 'blocks' && (route.slug ? <BlockPage slug={route.slug} /> : <Blocks />)}
        {route.page === 'themes' && <Themes id={route.id} />}
        {route.page === 'grids' && <Grids />}
        {route.page === 'inspo' && <Inspo />}
        {route.page === 'start' && <Start />}
        {route.page === 'process' && <Process />}
        {route.page === 'guide' && <FieldGuide />}
        {route.page === 'studies' && (route.slug ? <StudyPage slug={route.slug} /> : <Studies />)}
      </main>
    </>
  )
}
