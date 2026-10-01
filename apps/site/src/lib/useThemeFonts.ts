import { useEffect } from 'react'
import { fontsUrlFor, type Theme } from '@site/data/themes'

const loaded = new Set<string>()

/** Load a theme's Google Fonts once per page. */
export function useThemeFonts(theme?: Theme) {
  useEffect(() => {
    const url = theme && fontsUrlFor(theme)
    if (!url || loaded.has(url)) return
    loaded.add(url)
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = url
    document.head.append(link)
  }, [theme])
}
