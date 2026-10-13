#!/usr/bin/env node
// Screenshots and automatic checks for a design review. For every page at phone, tablet and desktop
// width: the first screen, the full page, a blurred "squint" version and a reduced-motion version,
// plus type, colour, spacing, contrast, overflow, tap-target, image, heading, focus and weight checks.
// --launch adds what a live site needs: titles, descriptions, share previews, icons, a 404 page.
//
// Usage (from anywhere; playwright resolves from the kit this script lives in):
//   node ~/.claude/skills/design-review/scripts/review.mjs <url> [--pages /,/about,/work/kiln]
//        [--out concept/reviews/<date>] [--widths 390,834,1440] [--launch]
// Writes <out>/report.md (read this first), <out>/report.json and <out>/shots/*.jpg.
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
const base = args.find((a, i) => !a.startsWith('--') && !args[i - 1]?.startsWith('--'))
if (!base) {
  console.error('Usage: review.mjs <url> [--pages /,/about] [--out dir] [--widths 390,834,1440] [--launch]')
  process.exit(1)
}
const today = new Date().toISOString().slice(0, 10)
const OUT = path.resolve(flag('out', `concept/reviews/${today}`))
const SHOTS = path.join(OUT, 'shots')
fs.mkdirSync(SHOTS, { recursive: true })
const pages = String(flag('pages', '/')).split(',').map(p => p.trim()).filter(Boolean)
const widths = String(flag('widths', '390,834,1440')).split(',').map(Number)
const LAUNCH = Boolean(flag('launch', false))
const heightFor = w => (w < 600 ? 844 : w < 1100 ? 1112 : 900)
const slug = p => (p === '/' ? 'home' : p.replace(/^\/|\/$/g, '').replace(/[^a-z0-9]+/gi, '-'))
const sleep = ms => new Promise(r => setTimeout(r, ms))
const rel = f => (path.relative(process.cwd(), f).startsWith('..') ? f : path.relative(process.cwd(), f))

const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] })

/** Scroll down slowly so lazy images and scroll animations run, then back to the top. */
async function settle(page) {
  await sleep(1200)
  await page.evaluate(async () => {
    const wait = ms => new Promise(r => setTimeout(r, ms))
    const max = () => document.documentElement.scrollHeight - innerHeight
    for (let y = 0; y < max() && y < 30000; y += innerHeight * 0.6) {
      scrollTo(0, y)
      await wait(180)
    }
    scrollTo(0, max())
    await wait(500)
    scrollTo(0, 0)
    await wait(600)
  })
}

// Everything measured inside the page
const audit = () => {
  const px = v => parseFloat(v) || 0
  const parse = c => {
    const m = c.match(/rgba?\(([^)]+)\)/)
    if (!m) return null
    const [r, g, b, a = 1] = m[1].split(/[ ,/]+/).filter(Boolean).map(Number)
    return { r, g, b, a }
  }
  const hex = c => (c ? '#' + [c.r, c.g, c.b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('') : null)
  const lum = c => {
    const f = v => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b)
  }
  const blend = (top, under) => ({ r: top.r * top.a + under.r * (1 - top.a), g: top.g * top.a + under.g * (1 - top.a), b: top.b * top.a + under.b * (1 - top.a), a: 1 })
  const selector = el => {
    const parts = []
    for (let e = el; e && e !== document.body && parts.length < 3; e = e.parentElement) {
      let s = e.tagName.toLowerCase()
      if (e.id) s += '#' + e.id
      else if (typeof e.className === 'string' && e.className.trim()) s += '.' + e.className.trim().split(/\s+/).slice(0, 2).join('.')
      parts.unshift(s)
    }
    return parts.join(' > ')
  }
  /** Text as a screen reader gets it: aria-label wins, aria-hidden parts are skipped. */
  const spoken = node => {
    if (node.nodeType === 3) return node.textContent
    if (node.nodeType !== 1 || node.getAttribute('aria-hidden') === 'true') return ''
    if (node.hasAttribute('aria-label')) return node.getAttribute('aria-label')
    return [...node.childNodes].map(spoken).join('')
  }
  const visible = el => {
    const r = el.getBoundingClientRect()
    const s = getComputedStyle(el)
    return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && Number(s.opacity) > 0.05
  }
  /** Solid background behind an element, or null when an image, video, canvas or gradient is behind it. */
  const background = el => {
    let colour = { r: 0, g: 0, b: 0, a: 0 }
    const layers = []
    for (let e = el; e; e = e.parentElement) {
      const s = getComputedStyle(e)
      if (s.backgroundImage !== 'none' || ['IMG', 'VIDEO', 'CANVAS'].includes(e.tagName)) return null
      const c = parse(s.backgroundColor)
      if (c && c.a > 0) {
        layers.push(c)
        if (c.a >= 1) break
      }
    }
    colour = { r: 255, g: 255, b: 255, a: 1 }
    for (const c of layers.reverse()) colour = blend(c, colour)
    return colour
  }

  const W = innerWidth
  const out = { width: W, overflow: null, type: {}, families: {}, weights: {}, textColours: {}, bgColours: {}, contrast: [], spacing: {}, headings: [], images: [], tapTargets: [], unnamed: [], canvases: 0, videos: 0, textCount: 0 }

  // Horizontal overflow
  if (document.documentElement.scrollWidth > W + 1) {
    const wide = [...document.body.querySelectorAll('*')]
      .filter(e => visible(e) && e.getBoundingClientRect().right > W + 1 && getComputedStyle(e).position !== 'fixed')
      .slice(0, 6)
      .map(e => ({ el: selector(e), right: Math.round(e.getBoundingClientRect().right) }))
    out.overflow = { scrollWidth: document.documentElement.scrollWidth, elements: wide }
  }

  // Text: sizes, families, weights, colours, contrast
  const seen = new Set()
  for (const el of document.body.querySelectorAll('*')) {
    if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'SVG', 'svg'].includes(el.tagName)) continue
    const own = [...el.childNodes].filter(n => n.nodeType === 3 && n.textContent.trim()).map(n => n.textContent.trim()).join(' ')
    if (!own || !visible(el)) continue
    if (el.closest('[aria-hidden="true"], .sr-only')) continue
    const s = getComputedStyle(el)
    const size = Math.round(px(s.fontSize) * 10) / 10
    const family = s.fontFamily.split(',')[0].replace(/["']/g, '').trim()
    const weight = s.fontWeight
    out.textCount++
    out.type[size] = (out.type[size] || 0) + 1
    out.families[family] = (out.families[family] || 0) + 1
    out.weights[weight] = (out.weights[weight] || 0) + 1
    const fg = parse(s.color)
    if (!fg) continue
    out.textColours[hex(fg)] = (out.textColours[hex(fg)] || 0) + 1
    const bg = background(el)
    if (!bg) continue
    const shown = blend({ ...fg, a: fg.a * Number(s.opacity) }, bg)
    const [a, b] = [lum(shown), lum(bg)].sort((x, y) => y - x)
    const ratio = (a + 0.05) / (b + 0.05)
    const large = size >= 24 || (size >= 18.6 && Number(weight) >= 700)
    const need = large ? 3 : 4.5
    const key = `${hex(shown)}|${hex(bg)}|${size}`
    if (ratio < need && !seen.has(key)) {
      seen.add(key)
      out.contrast.push({ text: own.slice(0, 50), el: selector(el), colour: hex(shown), background: hex(bg), size, ratio: Math.round(ratio * 100) / 100, need })
    }
  }

  // Background colours and spacing on layout elements
  for (const el of document.body.querySelectorAll('div, section, header, footer, main, nav, article, aside, ul, ol, li, p, h1, h2, h3, h4, figure, a, button')) {
    if (!visible(el)) continue
    const s = getComputedStyle(el)
    const bg = parse(s.backgroundColor)
    if (bg && bg.a > 0) out.bgColours[hex(bg)] = (out.bgColours[hex(bg)] || 0) + 1
    for (const v of [s.paddingTop, s.paddingBottom, s.paddingLeft, s.marginTop, s.marginBottom, s.rowGap, s.columnGap]) {
      const n = Math.round(px(v))
      if (n > 0) out.spacing[n] = (out.spacing[n] || 0) + 1
    }
  }

  // Headings
  out.headings = [...document.querySelectorAll('h1, h2, h3, h4, h5, h6')].filter(visible).map(h => ({ level: Number(h.tagName[1]), text: spoken(h).trim().replace(/\s+/g, ' ').slice(0, 60) }))

  // Images: alt text and size
  for (const img of document.querySelectorAll('img')) {
    if (!visible(img)) continue
    const r = img.getBoundingClientRect()
    const shown = r.width * devicePixelRatio
    const issue = []
    if (!img.hasAttribute('alt')) issue.push('no alt attribute')
    if (img.naturalWidth && img.naturalWidth > shown * 2.5 && img.naturalWidth > 800) issue.push(`${img.naturalWidth}px wide, shown at ${Math.round(r.width)}px: too big a file`)
    if (img.naturalWidth && img.naturalWidth < shown * 0.85) issue.push(`${img.naturalWidth}px wide, shown at ${Math.round(shown)} device px: blurry`)
    if (issue.length) out.images.push({ src: (img.currentSrc || img.src).split('/').pop().slice(0, 60), issue })
  }

  // Tap targets on small screens, and controls without a name
  for (const el of document.querySelectorAll('a[href], button, [role="button"], input, select, textarea, summary')) {
    if (!visible(el)) continue
    const r = el.getBoundingClientRect()
    const name = (spoken(el) || el.getAttribute('title') || el.getAttribute('alt') || el.querySelector('img[alt]')?.alt || '').trim()
    if (!name && !['INPUT', 'SELECT', 'TEXTAREA'].includes(el.tagName)) out.unnamed.push(selector(el))
    const inText = el.tagName === 'A' && el.parentElement && getComputedStyle(el.parentElement).display === 'block' && el.parentElement.textContent.trim().length > el.textContent.trim().length + 20
    if (W < 600 && !inText && (r.width < 24 || r.height < 24)) out.tapTargets.push({ el: selector(el), text: name.slice(0, 30), size: `${Math.round(r.width)}×${Math.round(r.height)}` })
  }
  out.canvases = [...document.querySelectorAll('canvas')].filter(visible).length
  out.videos = [...document.querySelectorAll('video')].filter(visible).length
  return out
}

const report = { url: base, date: today, pages: {}, site: {} }

for (const p of pages) {
  const url = new URL(p, base).href
  const name = slug(p)
  const entry = (report.pages[p] = { url, widths: {}, errors: [], failed: [] })
  console.log(`\n${url}`)

  for (const w of widths) {
    const ctx = await browser.newContext({ viewport: { width: w, height: heightFor(w) }, deviceScaleFactor: 1, hasTouch: w < 900, isMobile: w < 600 })
    const page = await ctx.newPage()
    page.on('pageerror', e => entry.errors.push(`${w}px: ${e.message}`))
    page.on('console', m => m.type() === 'error' && entry.errors.push(`${w}px console: ${m.text().slice(0, 200)}`))
    page.on('response', r => r.status() >= 400 && entry.failed.push(`${r.status()} ${r.url()}`))
    await page.goto(url, { waitUntil: 'load', timeout: 60000 })
    await settle(page)
    const shot = async (label, opts = {}) => {
      const file = path.join(SHOTS, `${name}-${w}-${label}.jpg`)
      await page.screenshot({ path: file, type: 'jpeg', quality: 70, ...opts })
      return rel(file)
    }
    const shots = { top: await shot('top') }
    const height = await page.evaluate(() => document.documentElement.scrollHeight)
    // Very tall captures fail under software GL: cap them, and step down if it still fails
    for (const cap of [6000, 3500, 0]) {
      if (!cap) break
      try {
        shots.full = await shot('full', height > cap ? { clip: { x: 0, y: 0, width: w, height: cap }, fullPage: true } : { fullPage: true })
        if (height > cap) shots.full += ` (first ${cap}px of ${height})`
        break
      } catch {
        /* try a shorter capture */
      }
    }
    if (w === widths[0] || w === widths.at(-1)) {
      await page.addStyleTag({ content: 'html { filter: blur(7px) grayscale(1) !important; }' })
      shots.squint = await shot('squint')
      await page.evaluate(() => document.querySelectorAll('style').forEach(s => s.textContent.includes('blur(7px)') && s.remove()))
    }
    const data = await page.evaluate(audit)

    // Keyboard focus on the first controls (desktop only)
    if (w === widths.at(-1)) {
      data.focus = []
      for (let i = 0; i < 8; i++) {
        await page.keyboard.press('Tab')
        const f = await page.evaluate(() => {
          const el = document.activeElement
          if (!el || el === document.body) return null
          const spoken = node => {
            if (node.nodeType === 3) return node.textContent
            if (node.nodeType !== 1 || node.getAttribute('aria-hidden') === 'true') return ''
            if (node.hasAttribute('aria-label')) return node.getAttribute('aria-label')
            return [...node.childNodes].map(spoken).join('')
          }
          const s = getComputedStyle(el)
          const ring = (s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0) || s.boxShadow !== 'none'
          return { el: el.tagName.toLowerCase() + (spoken(el).trim() ? ` "${spoken(el).trim().slice(0, 30)}"` : ''), visible: ring }
        })
        if (f) data.focus.push(f)
      }
      shots.focus = await shot('focus')

      // Weight and loading
      data.perf = await page.evaluate(async () => {
        // LCP and layout shifts are only exposed to observers
        const observed = type =>
          new Promise(done => {
            const list = []
            try {
              new PerformanceObserver(l => list.push(...l.getEntries())).observe({ type, buffered: true })
            } catch {
              /* not supported */
            }
            setTimeout(() => done(list), 150)
          })
        const [lcps, shifts] = await Promise.all([observed('largest-contentful-paint'), observed('layout-shift')])
        const res = performance.getEntriesByType('resource')
        const by = {}
        for (const r of res) by[r.initiatorType] = (by[r.initiatorType] || 0) + (r.transferSize || r.encodedBodySize || 0)
        const nav = performance.getEntriesByType('navigation')[0]
        const lcp = lcps.at(-1)
        const cls = shifts.filter(e => !e.hadRecentInput).reduce((s, e) => s + e.value, 0)
        const total = res.reduce((s, r) => s + (r.transferSize || r.encodedBodySize || 0), 0) + (nav?.transferSize || 0)
        return { totalKB: Math.round(total / 1024), byTypeKB: Object.fromEntries(Object.entries(by).map(([k, v]) => [k, Math.round(v / 1024)])), requests: res.length, fonts: res.filter(r => /\.(woff2?|ttf|otf)(\?|$)/.test(r.name)).length, lcpMs: lcp ? Math.round(lcp.startTime) : null, cls: Math.round(cls * 1000) / 1000, loadMs: nav ? Math.round(nav.loadEventEnd) : null }
      })
    }
    entry.widths[w] = { shots, ...data }
    console.log(`  ${w}px  ${data.textCount} text elements, ${Object.keys(data.type).length} sizes, ${data.contrast.length} contrast issues${data.overflow ? ', OVERFLOWS' : ''}`)
    await ctx.close()
  }

  // Reduced motion: does anything still move?
  const w = widths.at(-1)
  const ctx = await browser.newContext({ viewport: { width: w, height: heightFor(w) }, reducedMotion: 'reduce' })
  const page = await ctx.newPage()
  await page.goto(url, { waitUntil: 'load', timeout: 60000 })
  await sleep(2500)
  const a = await page.screenshot({ type: 'png' })
  await sleep(700)
  const b = await page.screenshot({ type: 'png' })
  const file = path.join(SHOTS, `${name}-${w}-reduced.jpg`)
  await page.screenshot({ path: file, type: 'jpeg', quality: 70 })
  entry.reducedMotion = { stillMoving: !a.equals(b), shot: rel(file), runningAnimations: await page.evaluate(() => document.getAnimations().filter(x => x.playState === 'running').length) }
  await ctx.close()

  if (LAUNCH) {
    const ctx2 = await browser.newContext({ viewport: { width: 1440, height: 900 } })
    const page2 = await ctx2.newPage()
    await page2.goto(url, { waitUntil: 'load', timeout: 60000 })
    entry.meta = await page2.evaluate(() => {
      const m = sel => document.querySelector(sel)?.getAttribute('content') ?? null
      const l = sel => document.querySelector(sel)?.getAttribute('href') ?? null
      return {
        title: document.title || null,
        description: m('meta[name="description"]'),
        lang: document.documentElement.lang || null,
        viewport: m('meta[name="viewport"]'),
        canonical: l('link[rel="canonical"]'),
        ogTitle: m('meta[property="og:title"]'),
        ogDescription: m('meta[property="og:description"]'),
        ogImage: m('meta[property="og:image"]'),
        twitterCard: m('meta[name="twitter:card"]'),
        icon: l('link[rel~="icon"]'),
        appleTouchIcon: l('link[rel="apple-touch-icon"]'),
        localhost: [...document.querySelectorAll('[src], [href]')].map(e => e.getAttribute('src') || e.getAttribute('href')).filter(u => /localhost|127\.0\.0\.1/.test(u)).slice(0, 5),
      }
    })
    if (entry.meta.ogImage) {
      try {
        const res = await page2.request.get(new URL(entry.meta.ogImage, url).href)
        entry.meta.ogImageStatus = res.status()
      } catch (e) {
        entry.meta.ogImageStatus = String(e.message).slice(0, 80)
      }
    }
    await ctx2.close()
  }
}

if (LAUNCH) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  const missing = new URL('/this-page-does-not-exist-kit-review', base).href
  const res = await page.goto(missing, { waitUntil: 'load' }).catch(() => null)
  await sleep(1000)
  const file = path.join(SHOTS, '404.jpg')
  await page.screenshot({ path: file, type: 'jpeg', quality: 70 })
  report.site.notFound = { status: res?.status() ?? null, shot: rel(file) }
  for (const f of ['robots.txt', 'sitemap.xml', 'favicon.ico']) {
    const r = await page.request.get(new URL(`/${f}`, base).href).catch(() => null)
    report.site[f] = r?.status() ?? null
  }
  await ctx.close()
}
await browser.close()

// ---------- report.md ----------
const md = [`# Design review: ${base}`, '', `${today} · pages ${pages.join(', ')} · widths ${widths.join(', ')}${LAUNCH ? ' · launch checks' : ''}`, '']
const top = (obj, n = 12) =>
  Object.entries(obj)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([k, v]) => `${k} (${v})`)
    .join(', ')
for (const [p, e] of Object.entries(report.pages)) {
  md.push(`## ${p}`, '')
  for (const [w, d] of Object.entries(e.widths)) {
    const sizes = Object.keys(d.type).map(Number).sort((a, b) => b - a)
    md.push(`### ${w}px`, '')
    md.push(`- Shots: ${Object.entries(d.shots).map(([k, v]) => `${k} \`${v}\``).join(' · ')}`)
    md.push(`- Type: ${sizes.length} sizes (${sizes.join(', ')}px), biggest/smallest ${sizes.length ? (sizes[0] / sizes.at(-1)).toFixed(1) : '-'}× · families ${top(d.families, 5)} · weights ${top(d.weights, 5)}`)
    md.push(`- Colours: text ${top(d.textColours, 8)} · backgrounds ${top(d.bgColours, 8)}`)
    md.push(`- Spacing: ${Object.keys(d.spacing).length} distinct values · most used ${top(d.spacing, 14)}`)
    if (d.overflow) md.push(`- **Horizontal overflow**: page is ${d.overflow.scrollWidth}px wide at ${w}px. Too wide: ${d.overflow.elements.map(x => `\`${x.el}\` (to ${x.right}px)`).join(', ')}`)
    if (d.contrast.length) md.push(`- **Contrast** (${d.contrast.length}): ${d.contrast.slice(0, 8).map(c => `"${c.text}" ${c.colour} on ${c.background} at ${c.size}px = ${c.ratio}:1 (needs ${c.need})`).join('; ')}`)
    if (d.tapTargets.length) md.push(`- **Small tap targets** (${d.tapTargets.length}, under 24px): ${d.tapTargets.slice(0, 8).map(t => `"${t.text}" ${t.size}`).join(', ')}`)
    if (d.images.length) md.push(`- **Images**: ${d.images.slice(0, 8).map(i => `${i.src}: ${i.issue.join(', ')}`).join('; ')}`)
    if (d.unnamed.length) md.push(`- **Links/buttons without a name** (${d.unnamed.length}): ${d.unnamed.slice(0, 5).map(s => `\`${s}\``).join(', ')}`)
    if (d.canvases || d.videos) md.push(`- ${d.canvases} canvas, ${d.videos} video on screen${d.canvases ? ' (text drawn in a canvas is invisible to these checks: look at the shots)' : ''}`)
    if (d.focus) md.push(`- Keyboard focus: ${d.focus.length ? d.focus.map(f => `${f.el} ${f.visible ? '✓' : '✗ no visible focus'}`).join(', ') : 'nothing focusable with Tab'}`)
    if (d.perf) md.push(`- Weight: ${d.perf.totalKB} KB in ${d.perf.requests} requests (${top(d.perf.byTypeKB, 6)} KB), ${d.perf.fonts} font files, LCP ${d.perf.lcpMs ?? '?'}ms, CLS ${d.perf.cls}`)
    md.push('')
  }
  const h = Object.values(e.widths).at(-1)?.headings ?? []
  const h1 = h.filter(x => x.level === 1).length
  const skips = h.filter((x, i) => i > 0 && x.level > h[i - 1].level + 1)
  md.push(`- Headings: ${h.map(x => `h${x.level} "${x.text}"`).join(' · ') || 'none'}${h1 !== 1 ? ` · **${h1} h1**` : ''}${skips.length ? ` · **skips a level** at "${skips[0].text}"` : ''}`)
  md.push(`- Reduced motion: ${e.reducedMotion.stillMoving ? '**something still moves**' : 'nothing moves'} after load (\`${e.reducedMotion.shot}\`), ${e.reducedMotion.runningAnimations} CSS/WAAPI animations running`)
  if (e.errors.length) md.push(`- **Errors** (${e.errors.length}): ${[...new Set(e.errors)].slice(0, 5).join(' | ')}`)
  if (e.failed.length) md.push(`- **Failed requests**: ${[...new Set(e.failed)].slice(0, 5).join(', ')}`)
  if (e.meta) {
    const m = e.meta
    const row = (label, v) => `${v ? '✓' : '✗'} ${label}${v && typeof v === 'string' ? `: ${v.slice(0, 80)}` : ''}`
    md.push(
      `- Launch: ${[row('title', m.title), row('description', m.description), row('lang', m.lang), row('og:title', m.ogTitle), row('og:description', m.ogDescription), row(`og:image${m.ogImageStatus ? ` (${m.ogImageStatus})` : ''}`, m.ogImage), row('twitter:card', m.twitterCard), row('icon', m.icon), row('apple-touch-icon', m.appleTouchIcon), row('canonical', m.canonical)].join(' · ')}${m.localhost.length ? ` · **loads from localhost**: ${m.localhost.join(', ')}` : ''}`,
    )
  }
  md.push('')
}
if (LAUNCH) md.push('## Site', '', `- 404: status ${report.site.notFound.status}${report.site.notFound.status === 200 ? ' (a "soft 404": the server answers 200, usually a single-page app falling back to index.html; check the shot shows a real not-found page)' : ''} (\`${report.site.notFound.shot}\`)`, `- robots.txt ${report.site['robots.txt']} · sitemap.xml ${report.site['sitemap.xml']} · favicon.ico ${report.site['favicon.ico']}`, '')

fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2))
fs.writeFileSync(path.join(OUT, 'report.md'), md.join('\n'))
console.log(`\nWrote ${rel(path.join(OUT, 'report.md'))} and ${Object.keys(report.pages).length * widths.length} sets of shots in ${rel(SHOTS)}`)
