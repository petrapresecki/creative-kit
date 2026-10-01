// Shared by the CLI (Node) and the showcase site (browser). Plain ESM, no dependencies.

/** @typedef {{ family: string, fallback: string, google?: string }} Font */
/** @typedef {{ name: string, size: string, leading: string, tracking: string, weight: number, font?: 'sans' | 'display' | 'mono' }} TypeStep */
/** @typedef {{ id: string, name: string, description: string, inspiredBy?: string[],
 *   colors: { paper: string, ink: string, accent: string, mist: string, muted: string },
 *   palette?: { name: string, value: string }[],
 *   fonts: { sans: Font, display?: Font, mono?: Font },
 *   type: TypeStep[], radius: string, ease: Record<string, string> }} Theme */

const stack = f => `"${f.family}", ${f.fallback}`

/** Google Fonts stylesheet URL for every face the theme uses, or null. */
export function googleFontsUrl(theme) {
  const families = [...new Set(Object.values(theme.fonts).map(f => f?.google).filter(Boolean))]
  return families.length ? `https://fonts.googleapis.com/css2?${families.map(f => `family=${f}`).join('&')}&display=swap` : null
}

/** Every token as a CSS custom property, matching Tailwind v4's @theme names. */
export function themeVars(theme) {
  const { sans, display = sans, mono = sans } = theme.fonts
  const vars = {
    ...Object.fromEntries(Object.entries(theme.colors).map(([k, v]) => [`--color-${k}`, v])),
    '--font-sans': stack(sans),
    '--font-display': stack(display),
    '--font-mono': stack(mono),
    '--radius-kit': theme.radius,
    ...Object.fromEntries(Object.entries(theme.ease).map(([k, v]) => [`--ease-${k}`, v])),
  }
  for (const t of theme.type) {
    vars[`--text-${t.name}`] = t.size
    vars[`--text-${t.name}--line-height`] = t.leading
    vars[`--text-${t.name}--letter-spacing`] = t.tracking
    vars[`--text-${t.name}--font-weight`] = String(t.weight)
  }
  return vars
}

/** A Tailwind v4 theme file for a new project. */
export function themeCss(theme) {
  const lines = Object.entries(themeVars(theme)).map(([k, v]) => `  ${k}: ${v};`)
  const fonts = googleFontsUrl(theme)
  return [
    `/* creative-kit theme: ${theme.name}. ${theme.description} */`,
    fonts ? `/* Fonts: add to index.html <head>\n   <link rel="stylesheet" href="${fonts}" /> */` : '',
    '@theme {',
    ...lines,
    '}',
    '',
  ].filter(Boolean).join('\n')
}
