#!/usr/bin/env node
// A visual-system specimen for site-layout: the theme's colour roles with contrast checks, its fonts,
// its type scale set in the site's real copy, the spacing scale, the grid, radius and easing.
// Everything is editable in the page, and "Copy theme.json" hands the result back.
//
// Usage (from anywhere):
//   node ~/.claude/skills/site-layout/scripts/specimen.mjs <theme.json> --copy <copy.json> [--out concept/system/index.html]
//        [--site "Name"] [--cols 12 --gutter 24 --margin 20 --cols-m 4 --gutter-m 12 --margin-m 16]
// copy.json: { "display": "…", "headline": "…", "title": "…", "lead": "…", "body": "…", "caption": "…" }, real lines from the site.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fs.realpathSync(fileURLToPath(import.meta.url)))
const args = process.argv.slice(2)
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : fallback
}
const themeFile = args.find((a, i) => !a.startsWith('--') && !args[i - 1]?.startsWith('--'))
if (!themeFile) {
  console.error('Usage: specimen.mjs <theme.json> --copy <copy.json> [--out concept/system/index.html] [--site "Name"]')
  process.exit(1)
}
const readJson = p => JSON.parse(fs.readFileSync(path.resolve(p), 'utf8'))
const theme = readJson(themeFile)
const copy = flag('copy', null) ? readJson(flag('copy')) : {}
const n = (name, fallback) => parseFloat(flag(name, fallback))
const data = {
  site: flag('site', theme.name),
  theme,
  copy,
  grid: { cols: n('cols', 12), gutter: n('gutter', 24), margin: n('margin', 20), colsM: n('cols-m', 4), gutterM: n('gutter-m', 12), marginM: n('margin-m', 16) },
}
const out = path.resolve(flag('out', 'concept/system/index.html'))
const html = fs.readFileSync(path.join(HERE, '../assets/specimen.html'), 'utf8').replace('/*DATA*/ {}', JSON.stringify(data).replace(/</g, '\\u003c'))
fs.mkdirSync(path.dirname(out), { recursive: true })
fs.writeFileSync(out, html)
console.log(`  write ${path.relative(process.cwd(), out)}\n\nOpen file://${out}`)
