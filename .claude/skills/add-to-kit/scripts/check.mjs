#!/usr/bin/env node
// Look at new work on the running showcase site: each block demo at rest, scrolled
// (when it has its own scroll container) and hovered, and each theme page.
// Prints console and page errors so broken demos show up.
//
// Usage (from the repo root, with `pnpm dev` running):
//   node .claude/skills/add-to-kit/scripts/check.mjs [--url http://localhost:5173] [--out dir] [block:<slug>...] [theme:<id>...]
import fs from 'node:fs'
import path from 'node:path'
import { chromium } from 'playwright'

const args = process.argv.slice(2)
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 ? args[i + 1] : fallback
}
const base = flag('url', 'http://localhost:5173')
const OUT = path.resolve(flag('out', 'check'))
const targets = args.filter((a, i) => /^(block|theme):/.test(a) && !args[i - 1]?.startsWith('--'))
if (!targets.length) {
  console.error('Name something to check, e.g. block:cut-type theme:kokopako')
  process.exit(1)
}
fs.mkdirSync(OUT, { recursive: true })

const sleep = ms => new Promise(r => setTimeout(r, ms))
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
let current = ''
page.on('console', m => m.type() === 'error' && console.log(`  ✕ [${current}] console: ${m.text()}`))
page.on('pageerror', e => console.log(`  ✕ [${current}] page error: ${e.message}`))

for (const target of targets) {
  const [kind, id] = target.split(':')
  current = target
  if (kind === 'theme') {
    await page.goto(`${base}/themes/${id}`)
    await sleep(2500)
    await page.screenshot({ path: path.join(OUT, `theme-${id}.jpg`), type: 'jpeg', quality: 72 })
    await page.mouse.wheel(0, 1600)
    await sleep(900)
    await page.screenshot({ path: path.join(OUT, `theme-${id}-2.jpg`), type: 'jpeg', quality: 72 })
    console.log(`✓ ${target}`)
    continue
  }

  await page.goto(`${base}/blocks/${id}`)
  const frame = page.locator('[data-demo]').locator('..')
  await frame.waitFor({ timeout: 20000 })
  await frame.scrollIntoViewIfNeeded()
  await sleep(2500)
  const shot = label => frame.screenshot({ path: path.join(OUT, `${id}-${label}.jpg`), type: 'jpeg', quality: 72 })
  await shot('rest')

  // Demos that scroll have their own container: step through it
  const scrollable = await frame.evaluate(el => {
    const box = el.querySelector('[data-lenis-prevent]')
    return box ? box.scrollHeight - box.clientHeight : 0
  })
  for (const [i, f] of (scrollable > 0 ? [0.25, 0.5, 0.8] : []).entries()) {
    await frame.evaluate((el, top) => el.querySelector('[data-lenis-prevent]').scrollTo({ top }), scrollable * f)
    await sleep(900)
    await shot(`scroll${i}`)
  }

  // Hover the first few interactive things inside the demo
  const hits = frame.locator('button, a, [aria-label]')
  const count = Math.min(await hits.count(), 3)
  for (let i = 0; i < count; i++) {
    await hits.nth(i).hover({ timeout: 3000 }).catch(() => {})
    await sleep(1100)
    await shot(`hover${i}`)
  }
  console.log(`✓ ${target}`)
}

console.log(`Frames in ${path.relative(process.cwd(), OUT) || '.'}`)
await browser.close()
