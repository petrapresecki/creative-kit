import { useEffect, useSyncExternalStore } from 'react'
import { getLenis } from '@kit/lib/lenis'

const listeners = new Set<() => void>()

function subscribe(callback: () => void) {
  listeners.add(callback)
  window.addEventListener('popstate', callback)
  return () => {
    listeners.delete(callback)
    window.removeEventListener('popstate', callback)
  }
}

export function navigate(path: string) {
  if (path === window.location.pathname + window.location.search + window.location.hash) return
  window.history.pushState(null, '', path)
  listeners.forEach(l => l())
}

export const usePath = () => useSyncExternalStore(subscribe, () => window.location.pathname)
export const useSearch = () => useSyncExternalStore(subscribe, () => window.location.search)

export type Route =
  | { page: 'home' }
  | { page: 'blocks'; slug?: string }
  | { page: 'themes'; id?: string }
  | { page: 'grids' }
  | { page: 'inspo' }
  | { page: 'start' }
  | { page: 'process' }
  | { page: 'guide' }
  | { page: 'studies'; slug?: string }

export function parseRoute(path: string): Route {
  const [, a, b] = path.split('/')
  if (a === 'blocks') return { page: 'blocks', slug: b }
  if (a === 'themes') return { page: 'themes', id: b }
  if (a === 'grids') return { page: 'grids' }
  if (a === 'inspo') return { page: 'inspo' }
  if (a === 'start') return { page: 'start' }
  if (a === 'process') return { page: 'process' }
  if (a === 'guide') return { page: 'guide' }
  if (a === 'studies') return { page: 'studies', slug: b }
  return { page: 'home' }
}

/** Plain link that navigates without a page reload. */
export function linkProps(href: string) {
  return {
    href,
    onClick: (e: React.MouseEvent) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
      e.preventDefault()
      navigate(href)
    },
  }
}

/** Smooth-scroll to an element on this page, below the sticky nav. */
export function scrollToId(id: string, immediate = false) {
  const el = document.getElementById(id)
  if (!el) return
  const lenis = getLenis()
  if (lenis) lenis.scrollTo(el, { offset: -72, immediate })
  else el.scrollIntoView({ behavior: immediate ? 'auto' : 'smooth' })
}

/** Link to a section on the current page: keeps the hash in the URL without a new history entry. */
export function hashLinkProps(id: string) {
  return {
    href: `#${id}`,
    onClick: (e: React.MouseEvent) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
      e.preventDefault()
      window.history.replaceState(null, '', `#${id}`)
      scrollToId(id)
    },
  }
}

/** On arrival with a #hash, scroll to it once the page (and the App's scroll-to-top) has settled. */
export function useHashOnArrive() {
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1))
    if (!id) return
    const t = window.setTimeout(() => scrollToId(id, true), 120)
    return () => clearTimeout(t)
  }, [])
}
