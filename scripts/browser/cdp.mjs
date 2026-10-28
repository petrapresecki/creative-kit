// Headless Chrome over its DevTools port, for checking sites in real time. Plain Node 22, no packages.
// The app's built-in browser pane slows animations down while it's hidden; this doesn't.
//
//   import { launch } from './cdp.mjs'
//   const page = await launch({ width: 1440, height: 900 })
//   await page.go('https://example.com', 6000)
//   await page.shot('home.jpg')
//   await page.close()
import { spawn } from 'node:child_process'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

// Real GPU by default (WebGL at full speed); GL=swiftshader when there is none (WebGL works, at a few frames a second)
const glFlags = () =>
  process.env.GL === 'swiftshader'
    ? ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']
    : ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist']

export const sleep = ms => new Promise(r => setTimeout(r, ms))

export async function launch({ width = 1440, height = 900, scale = 1 } = {}) {
  const port = 9300 + Math.floor(Math.random() * 600)
  const profile = mkdtempSync(path.join(tmpdir(), 'kit-chrome-'))
  const chrome = spawn(CHROME, ['--headless=new', ...glFlags(), '--hide-scrollbars', '--mute-audio', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, `--window-size=${width},${height}`, 'about:blank'], { stdio: 'ignore' })

  let target
  for (let i = 0; i < 60 && !target; i++) {
    await sleep(200)
    try {
      target = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find(t => t.type === 'page')
    } catch {
      // not listening yet
    }
  }
  if (!target) {
    chrome.kill()
    throw new Error(`Chrome didn't start (looked for it at ${CHROME}; set CHROME to its path)`)
  }

  const ws = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise(r => ws.addEventListener('open', r))
  let id = 0
  const pending = new Map()
  const errors = []
  ws.addEventListener('message', e => {
    const m = JSON.parse(e.data)
    if (pending.has(m.id)) {
      pending.get(m.id)(m.result ?? m.error)
      pending.delete(m.id)
    }
    if (m.method === 'Runtime.exceptionThrown') errors.push('exception: ' + (m.params.exceptionDetails.exception?.description ?? m.params.exceptionDetails.text).slice(0, 300))
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push('console.error: ' + m.params.args.map(a => a.value ?? a.description).join(' ').slice(0, 300))
  })
  const send = (method, params = {}) =>
    new Promise(r => {
      pending.set(++id, r)
      ws.send(JSON.stringify({ id, method, params }))
    })

  await send('Runtime.enable')
  await send('Page.enable')
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: scale, mobile: width < 760 })

  const page = {
    send,
    sleep,
    /** console errors and uncaught exceptions seen so far */
    errors,
    /** open a URL and wait real time for it to settle */
    async go(url, waitMs = 5000) {
      await Promise.race([send('Page.navigate', { url }), sleep(15000)])
      await sleep(waitMs)
    },
    /** evaluate an expression in the page (top-level await works) and return its value */
    async js(expression) {
      return (await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }))?.result?.value
    },
    /** screenshot the viewport; .png or .jpg from the file name */
    async shot(file, quality = 80) {
      const format = file.endsWith('.png') ? 'png' : 'jpeg'
      const { data } = await send('Page.captureScreenshot', format === 'png' ? { format } : { format, quality })
      writeFileSync(file, Buffer.from(data, 'base64'))
      return file
    },
    /** press a key; Enter carries "\r" so it activates buttons */
    async key(key, code = key, keyCode = { Tab: 9, Enter: 13, Escape: 27 }[key] ?? 0) {
      const text = key === 'Enter' ? { text: '\r' } : {}
      await send('Input.dispatchKeyEvent', { type: 'keyDown', key, code, windowsVirtualKeyCode: keyCode, ...text })
      await send('Input.dispatchKeyEvent', { type: 'keyUp', key, code, windowsVirtualKeyCode: keyCode })
    },
    /** move the pointer there in a few steps, so hover handlers (three.js raycasters included) see real movement */
    async move(x, y, steps = 4) {
      for (let i = steps; i >= 0; i--) await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: x - i * 6, y })
    },
    async click(x, y) {
      await page.move(x, y)
      for (const type of ['mousePressed', 'mouseReleased']) await send('Input.dispatchMouseEvent', { type, x, y, button: 'left', clickCount: 1 })
    },
    async close() {
      ws.close()
      chrome.kill()
    },
  }
  return page
}

/** Read an option like `--crop 1200x630` from argv */
export function flag(name) {
  const i = process.argv.indexOf(`--${name}`)
  return i > -1 ? process.argv[i + 1] : undefined
}
