// @ts-expect-error -- plain ESM shared with the CLI
import { googleFontsUrl, themeVars, themeCss } from '@themes/theme.mjs'

export interface Font {
  family: string
  fallback: string
  google?: string
}
export interface TypeStep {
  name: string
  size: string
  leading: string
  tracking: string
  weight: number
  font?: 'sans' | 'display' | 'mono'
}
export interface Theme {
  id: string
  name: string
  description: string
  inspiredBy?: string[]
  colors: { paper: string; ink: string; accent: string; mist: string; muted: string }
  palette?: { name: string; value: string }[]
  fonts: { sans: Font; display?: Font; mono?: Font }
  type: TypeStep[]
  radius: string
  ease: Record<string, string>
}

const files = import.meta.glob<Theme>('../../../../themes/*.json', { eager: true, import: 'default' })
const order = ['graphite', 'cinnabar', 'neon', 'marzipan', 'vinyl', 'quartz', 'porcelain']

export const themes: Theme[] = Object.values(files).sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id))
export const getTheme = (id?: string) => themes.find(t => t.id === id)

export const varsFor = (theme: Theme): Record<string, string> => themeVars(theme)
export const fontsUrlFor = (theme: Theme): string | null => googleFontsUrl(theme)
export const cssFor = (theme: Theme): string => themeCss(theme)
