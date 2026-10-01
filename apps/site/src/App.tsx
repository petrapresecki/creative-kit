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
    return () => cancelAnimationFrame(id)
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
      </main>
    </>
  )
}
