#!/usr/bin/env node
// Research a site for the inspo library: frames while it loads, while you scroll slowly,
// while the pointer hovers big type and links, after a fast flick and after a click,
// plus fonts, colours, libraries, canvases and running animations as JSON.
//
// Usage (from the repo root, so `playwright` resolves from node_modules):
//   node .claude/skills/add-to-kit/scripts/capture.mjs <url> <name> [--out <dir>] [--steps 16] [--click <css selector>] [--no-hover]
// Frames land in <out>/<name>-*.jpg (1440×900) and <out>/<name>.json.
import fs from 'node:fs'
import path from 'node:path'
import { chromium } from 'playwright'

const args = process.argv.slice(2)
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`)
  if (i < 0) return fallback
  const next = args[i + 1]
  return next && !next.startsWith('--') ? next : true
}
const [url, name] = args.filter((a, i) => !a.startsWith('--') && !args[i - 1]?.startsWith('--'))
if (!url || !name) {
  console.error('Usage: capture.mjs <url> <name> [--out dir] [--steps 16] [--click selector] [--no-hover]')
  process.exit(1)
}
const OUT = path.resolve(flag('out', 'capture'))
const STEPS = Number(flag('steps', 16))
const CLICK = flag('click', null)
fs.mkdirSync(OUT, { recursive: true })

const sleep = ms => new Promise(r => setTimeout(r, ms))
// Software GL so WebGL sites render headless
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
const resources = new Set()
page.on('request', r => ['script', 'font', 'stylesheet'].includes(r.resourceType()) && resources.add(`${r.resourceType()} ${r.url()}`))
const frames = []
const shot = async label => {
  const file = path.join(OUT, `${name}-${label}.jpg`)
  await page.screenshot({ path: file, type: 'jpeg', quality: 72 })
  frames.push(path.relative(process.cwd(), file))
}

await page.goto(url, { waitUntil: 'load', timeout: 60000 })
// Intro animations: a frame every 700ms
for (let i = 0; i < 6; i++) {
  await sleep(700)
  await shot(`load${i}`)
}

const info = await page.evaluate(() => {
  const fonts = new Map()
  const colors = new Map()
  for (const el of document.querySelectorAll('body *')) {
    const s = getComputedStyle(el)
    const hasText = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())
    if (hasText) {
      const key = `${s.fontFamily} | ${Math.round(parseFloat(s.fontSize))}px ${s.fontWeight} ${s.textTransform !== 'none' ? s.textTransform : ''} ls ${s.letterSpacing}`
      fonts.set(key, (fonts.get(key) ?? 0) + 1)
    }
    for (const c of [s.color, s.backgroundColor, s.borderTopColor]) if (c && c !== 'rgba(0, 0, 0, 0)') colors.set(c, (colors.get(c) ?? 0) + 1)
  }
  const blends = [...document.querySelectorAll('body *')].map(el => getComputedStyle(el).mixBlendMode).filter(m => m !== 'normal')
  return {
    title: document.title,
    scrollHeight: document.documentElement.scrollHeight,
    fonts: [...fonts].sort((a, b) => b[1] - a[1]).slice(0, 30),
    colors: [...colors].sort((a, b) => b[1] - a[1]).slice(0, 20),
    globals: Object.keys(window).filter(k => /gsap|lenis|three|barba|swup|locomotive|webflow|splitting|splittype|scrolltrigger|__next|__nuxt|shopify|framer|pixi|ogl|svelte/i.test(k)),
    canvases: [...document.querySelectorAll('canvas')].map(c => ({ w: c.width, h: c.height, rect: c.getBoundingClientRect().toJSON(), cls: String(c.className) })).filter(c => c.rect.width > 40),
    animations: document.getAnimations().slice(0, 30).map(a => ({ name: a.animationName ?? a.transitionProperty ?? a.constructor.name, duration: a.effect?.getTiming?.().duration, target: String(a.effect?.target?.className ?? '').slice(0, 60) })),
    blendModes: [...new Set(blends)],
    text: document.body.innerText.slice(0, 2000),
    links: [...new Set([...document.querySelectorAll('a')].map(a => a.href))].slice(0, 40),
  }
})

// Slow scroll: 300px wheel steps, a frame every other step
await page.mouse.move(720, 450)
for (let i = 1; i <= STEPS; i++) {
  await page.mouse.wheel(0, 300)
  await sleep(550)
  if (i % 2 === 0) await shot(`s${String(i).padStart(2, '0')}`)
}

// Back to the top, then hover the biggest text and the first links
await page.mouse.wheel(0, -100000)
await sleep(1500)
if (flag('no-hover', false) !== true) {
  const targets = await page.evaluate(() => {
    const visible = el => {
      const r = el.getBoundingClientRect()
      return r.width > 20 && r.height > 10 && r.top >= 0 && r.bottom <= innerHeight
    }
    const big = [...document.querySelectorAll('h1,h2,h3,a,button,[role=button]')]
      .filter(visible)
      .map(el => ({ el, size: parseFloat(getComputedStyle(el).fontSize) }))
      .sort((a, b) => b.size - a.size)
      .slice(0, 4)
    return big.map(({ el }) => {
      const r = el.getBoundingClientRect()
      return { x: r.left + r.width / 2, y: r.top + r.height / 2, label: (el.textContent || el.tagName).trim().slice(0, 30) }
    })
  })
  for (const [i, t] of targets.entries()) {
    await page.mouse.move(t.x - 80, t.y, { steps: 4 })
    await page.mouse.move(t.x, t.y, { steps: 8 })
    await sleep(900)
    await shot(`hover${i}`)
  }
  // Pointer sweep across the screen for trails, magnets, reactive 3D
  for (let i = 0; i <= 24; i++) {
    await page.mouse.move(150 + i * 48, 450 + Math.sin(i / 3) * 220)
    await sleep(30)
  }
  await shot('sweep')
}

// Fast flick: catches velocity skew, stretch and blur
await page.mouse.wheel(0, 1400)
await sleep(120)
await shot('fast')
await sleep(1500)
await shot('settled')

if (CLICK) {
  await page.mouse.wheel(0, -100000)
  await sleep(1200)
  await page.click(String(CLICK)).catch(e => console.error('click failed:', e.message))
  for (let i = 0; i < 6; i++) {
    await sleep(250)
    await shot(`click${i}`)
  }
  info.afterClickUrl = page.url()
}

info.resources = [...resources]
info.frames = frames
fs.writeFileSync(path.join(OUT, `${name}.json`), JSON.stringify(info, null, 2))
console.log(JSON.stringify({ ...info, text: info.text.slice(0, 600), resources: info.resources.filter(r => !r.startsWith('script')).concat(info.resources.filter(r => r.startsWith('script')).slice(0, 12)) }, null, 1))
await browser.close()
