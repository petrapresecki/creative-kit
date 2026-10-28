#!/usr/bin/env node
// One screenshot after a real wait.
//   node scripts/browser/shot.mjs <url> <out.png> [width] [height] [waitMs] [--crop WxH]
// --crop keeps the middle band, e.g. render at 1200x900 and --crop 1200x630 for a share image with the
// subject centred and the corner labels cut away.
import { execFileSync } from 'node:child_process'
import { launch, flag } from './cdp.mjs'

const [url, out, w = '1440', h = '900', wait = '8000'] = process.argv.slice(2).filter(a => !a.startsWith('--') && a !== flag('crop'))
if (!url || !out) {
  console.error('usage: shot.mjs <url> <out.png> [width] [height] [waitMs] [--crop WxH]')
  process.exit(1)
}

const page = await launch({ width: +w, height: +h })
await page.go(url, +wait)
await page.shot(out)
await page.close()

const crop = flag('crop')
if (crop) {
  const [cw, ch] = crop.split('x')
  execFileSync('sips', ['--cropToHeightWidth', ch, cw, out], { stdio: 'ignore' }) // macOS; crops around the centre
}
if (page.errors.length) console.log(page.errors.join('\n'))
console.log(out)
