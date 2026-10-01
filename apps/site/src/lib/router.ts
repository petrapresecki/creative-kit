import { useSyncExternalStore } from 'react'

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
  if (path === window.location.pathname + window.location.search) return
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

export function parseRoute(path: string): Route {
  const [, a, b] = path.split('/')
  if (a === 'blocks') return { page: 'blocks', slug: b }
  if (a === 'themes') return { page: 'themes', id: b }
  if (a === 'grids') return { page: 'grids' }
  if (a === 'inspo') return { page: 'inspo' }
  if (a === 'start') return { page: 'start' }
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
