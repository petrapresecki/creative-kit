#!/usr/bin/env node
// Study a site: two shots over time (does anything move or load late?), four while scrolling, and what it's
// built from (fonts, canvases, gradients, colours, the opening text).
//   node scripts/browser/look.mjs <url> <outDir> [width] [height]
import { mkdirSync } from 'node:fs'
import { launch } from './cdp.mjs'

const [url, out, w = '1440', h = '900'] = process.argv.slice(2)
if (!url || !out) {
  console.error('usage: look.mjs <url> <outDir> [width] [height]')
  process.exit(1)
}
mkdirSync(out, { recursive: true })

const page = await launch({ width: +w, height: +h })
await page.go(url, 6000)
await page.shot(`${out}/a-0.jpg`)
await page.sleep(1500)
await page.shot(`${out}/a-1.jpg`)

const info = await page.js(`(() => {
  const fonts = [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family.replace(/"/g, '') + ' ' + f.weight)
  const gradients = [...document.querySelectorAll('*')].map(e => getComputedStyle(e).backgroundImage).filter(b => b.includes('gradient'))
  return {
    title: document.title,
    fonts: [...new Set(fonts)].slice(0, 10),
    background: getComputedStyle(document.body).backgroundColor,
    ink: getComputedStyle(document.body).color,
    canvases: document.querySelectorAll('canvas').length,
    three: window.__THREE__ ?? null,
    gsap: !!window.gsap,
    smoothScroll: document.documentElement.className,
    gradients: [...new Set(gradients)].slice(0, 6),
    height: document.documentElement.scrollHeight,
    text: document.body.innerText.slice(0, 600),
  }
})()`)
console.log(JSON.stringify(info, null, 2))

for (let i = 1; i <= 4; i++) {
  await page.js('window.scrollBy(0, innerHeight * 0.9)')
  await page.sleep(1800)
  await page.shot(`${out}/b-${i}.jpg`)
}
if (page.errors.length) console.log(page.errors.join('\n'))
await page.close()
