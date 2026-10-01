#!/usr/bin/env node
// Screenshot every block's live demo into apps/site/src/assets/previews/<slug>.jpg.
// Needs the site running: `pnpm dev` (defaults to http://localhost:5173, or pass --url).
// Usage: pnpm previews [slug...] [--url http://localhost:5300]
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT = path.join(ROOT, 'apps/site/src/assets/previews')
const args = process.argv.slice(2)
const urlIndex = args.indexOf('--url')
const base = urlIndex >= 0 ? args[urlIndex + 1] : 'http://localhost:5173'
const only = args.filter((a, i) => !a.startsWith('--') && i !== urlIndex + 1)
const slugs = only.length ? only : fs.readdirSync(path.join(ROOT, 'registry/blocks')).filter(s => fs.existsSync(path.join(ROOT, 'registry/blocks', s, 'meta.json')))
const sleep = ms => new Promise(r => setTimeout(r, ms))

fs.mkdirSync(OUT, { recursive: true })
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] })
try {
  for (const slug of slugs) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
    await page.goto(`${base}/blocks/${slug}`, { waitUntil: 'load', timeout: 60000 })
    const frame = page.locator('[data-demo]').locator('..')
    await frame.waitFor({ timeout: 20000 })
    await frame.scrollIntoViewIfNeeded()
    await sleep(3500)
    // Demos with their own scroll container: scroll partway in so the effect is mid-motion
    const scrolled = await frame.evaluate(el => {
      const box = el.querySelector('[data-lenis-prevent]')
      if (!box || box.scrollHeight <= box.clientHeight) return false
      box.scrollTo({ top: (box.scrollHeight - box.clientHeight) * 0.45 })
      return true
    })
    if (scrolled) await sleep(2200)
    // Sweep the pointer across the demo so hover and trail effects show
    const box = await frame.boundingBox()
    if (box) {
      for (let i = 0; i <= 30; i++) {
        const t = i / 30
        await page.mouse.move(box.x + box.width * (0.15 + t * 0.6), box.y + box.height * (0.35 + Math.sin(t * 5) * 0.2))
        await sleep(16)
      }
    }
    await sleep(400)
    await frame.screenshot({ path: path.join(OUT, `${slug}.jpg`), type: 'jpeg', quality: 78 })
    console.log('✓', slug)
    await page.close()
  }
} finally {
  await browser.close()
}
