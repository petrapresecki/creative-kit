/**
 * Read a theme token (a CSS custom property) at runtime, e.g. for WebGL blocks
 * that need the theme's colours as numbers. Tailwind v4 exposes every @theme
 * value as a variable such as --color-ink.
 */
export function readToken(name: string, fallback: string, el: Element = document.documentElement) {
  const value = getComputedStyle(el).getPropertyValue(name).trim()
  return value || fallback
}

/** '#05ff43' or 'rgb(5 255 67)' → [r, g, b] in 0–1. */
export function toRgb(color: string): [number, number, number] {
  const hex = color.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)
  if (hex) {
    const h = hex[1].length === 3 ? [...hex[1]].map(c => c + c).join('') : hex[1]
    return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255) as [number, number, number]
  }
  // Let the browser normalise anything else (oklch, named colours…)
  const probe = document.createElement('canvas').getContext('2d')!
  probe.fillStyle = color
  return toRgb(probe.fillStyle.startsWith('#') ? probe.fillStyle : '#000000')
}
