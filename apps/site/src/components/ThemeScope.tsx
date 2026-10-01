import type { CSSProperties, ReactNode } from 'react'
import { varsFor, type Theme } from '@site/data/themes'
import { useThemeFonts } from '@site/lib/useThemeFonts'

/** Renders children with a theme's tokens, so every block inside restyles. */
export default function ThemeScope({ theme, className = '', children }: { theme?: Theme; className?: string; children: ReactNode }) {
  useThemeFonts(theme)
  return (
    <div style={theme ? (varsFor(theme) as CSSProperties) : undefined} className={`bg-paper font-sans text-ink ${className}`}>
      {children}
    </div>
  )
}
