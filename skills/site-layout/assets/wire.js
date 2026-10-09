// Wireframe tools for site-layout: wire / styled mode, a grid overlay, A/B/C options per section,
// and a phone + desktop view side by side. Choices are kept in localStorage per file.
// Keys: G grid, M mode, C compare, Escape closes compare.
;(() => {
  const root = document.documentElement
  const KEY = 'wf:' + location.pathname
  const embed = location.hash === '#embed'
  if (embed) root.classList.add('wf-embed')

  const load = () => {
    try {
      return JSON.parse(localStorage.getItem(KEY) || '{}')
    } catch {
      return {}
    }
  }
  const save = () => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
    } catch {
      /* file:// or private mode without storage: choices last until reload */
    }
    frames().forEach(f => f.contentWindow?.postMessage({ wf: state }, '*'))
  }
  let state = { mode: 'wire', grid: false, choices: {}, ...load() }

  // ---------- options: <div class="wf-options" data-name="Hero"> with [data-option] children ----------
  const groups = [...document.querySelectorAll('.wf-options')].map((el, i) => {
    const name = el.dataset.name || `Options ${i + 1}`
    const options = [...el.children].filter(c => c.hasAttribute('data-option'))
    const tabs = document.createElement('div')
    tabs.className = 'wf-tabs'
    const label = document.createElement('b')
    label.textContent = name
    tabs.append(label)
    for (const o of options) {
      const b = document.createElement('button')
      b.type = 'button'
      b.dataset.option = o.dataset.option
      b.textContent = o.dataset.option + (o.dataset.label ? ` · ${o.dataset.label}` : '')
      b.addEventListener('click', () => {
        state.choices[name] = o.dataset.option
        save()
        apply()
      })
      tabs.append(b)
    }
    el.before(tabs)
    return { name, options, tabs }
  })
  const picked = g => state.choices[g.name] ?? g.options[0]?.dataset.option

  // ---------- grid overlay ----------
  const overlay = document.createElement('div')
  overlay.className = 'wf-overlay'
  overlay.setAttribute('aria-hidden', 'true')
  const fillOverlay = () => {
    const cols = parseInt(getComputedStyle(root).getPropertyValue('--cols')) || 12
    if (overlay.childElementCount !== cols) overlay.replaceChildren(...Array.from({ length: cols }, () => document.createElement('span')))
  }
  document.body.append(overlay)
  addEventListener('resize', fillOverlay)

  // ---------- toolbar ----------
  const bar = document.createElement('div')
  bar.className = 'wf-bar'
  const button = (text, onClick) => {
    const b = document.createElement('button')
    b.type = 'button'
    b.textContent = text
    b.addEventListener('click', onClick)
    bar.append(b)
    return b
  }
  const wireBtn = button('Wire', () => setMode('wire'))
  const styledBtn = button('Styled', () => setMode('styled'))
  const gridBtn = button('Grid (G)', () => toggleGrid())
  const compareBtn = button('Phone + desktop (C)', () => toggleCompare())
  button('Copy choices', copyChoices)
  if (!embed) document.body.append(bar)

  function setMode(mode) {
    state.mode = mode
    save()
    apply()
  }
  function toggleGrid() {
    state.grid = !state.grid
    save()
    apply()
  }

  // ---------- phone + desktop ----------
  let compare = null
  const frames = () => (compare ? [...compare.querySelectorAll('iframe')] : [])
  function layoutCompare() {
    if (!compare) return
    const [phone, desktop] = frames()
    const h = innerHeight - 110
    phone.style.width = '390px'
    phone.style.height = `${h}px`
    const box = desktop.parentElement
    const scale = Math.min(1, box.clientWidth / 1440)
    desktop.style.width = '1440px'
    desktop.style.height = `${h / scale}px`
    desktop.style.transform = `scale(${scale})`
    box.style.height = `${h}px`
    box.previousElementSibling.textContent = `Desktop · 1440px at ${Math.round(scale * 100)}%`
  }
  function toggleCompare(force) {
    const open = force ?? !compare
    if (!open && compare) {
      compare.remove()
      compare = null
    } else if (open && !compare) {
      const src = location.href.split('#')[0] + '#embed'
      compare = document.createElement('div')
      compare.className = 'wf-compare'
      compare.innerHTML = `<figure><figcaption>Phone · 390px</figcaption><div class="wf-frame"><iframe title="Phone"></iframe></div></figure>
        <figure><figcaption></figcaption><div class="wf-frame"><iframe title="Desktop"></iframe></div></figure>`
      compare.querySelectorAll('iframe').forEach(f => {
        f.src = src
        f.addEventListener('load', () => f.contentWindow?.postMessage({ wf: state }, '*'))
      })
      document.body.append(compare)
      layoutCompare()
    }
    apply()
  }
  addEventListener('resize', layoutCompare)

  async function copyChoices() {
    const out = {
      page: document.title,
      choices: Object.fromEntries(
        groups.map(g => {
          const o = g.options.find(x => x.dataset.option === picked(g))
          return [g.name, o ? `${o.dataset.option}${o.dataset.label ? ` · ${o.dataset.label}` : ''}` : null]
        }),
      ),
    }
    const text = JSON.stringify(out, null, 2)
    try {
      await navigator.clipboard.writeText(text)
      flash('Copied. Paste it into the chat.')
    } catch {
      prompt('Copy this and paste it into the chat:', text)
    }
  }
  function flash(text) {
    const t = document.createElement('div')
    t.textContent = text
    t.style.cssText = 'position:fixed;z-index:1001;left:50%;bottom:60px;transform:translateX(-50%);background:#fff3a8;color:#3b3200;padding:6px 10px;font:12px system-ui;border-radius:6px'
    document.body.append(t)
    setTimeout(() => t.remove(), 1800)
  }

  function apply() {
    root.classList.toggle('styled', state.mode === 'styled')
    for (const g of groups) {
      const p = picked(g)
      g.options.forEach(o => o.classList.toggle('wf-on', o.dataset.option === p))
      g.tabs.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.option === p)))
    }
    fillOverlay()
    overlay.hidden = !state.grid
    wireBtn.setAttribute('aria-pressed', String(state.mode !== 'styled'))
    styledBtn.setAttribute('aria-pressed', String(state.mode === 'styled'))
    gridBtn.setAttribute('aria-pressed', String(state.grid))
    compareBtn.setAttribute('aria-pressed', String(Boolean(compare)))
  }

  // Keep the compare frames (and other tabs) in step
  addEventListener('message', e => {
    if (e.data?.wf) {
      state = { ...state, ...e.data.wf }
      apply()
    }
  })
  addEventListener('storage', e => {
    if (e.key === KEY) {
      state = { ...state, ...load() }
      apply()
    }
  })
  addEventListener('keydown', e => {
    if (embed || e.metaKey || e.ctrlKey || e.target.closest('input, textarea, [contenteditable]')) return
    const k = e.key.toLowerCase()
    if (k === 'g') toggleGrid()
    if (k === 'm') setMode(state.mode === 'styled' ? 'wire' : 'styled')
    if (k === 'c') toggleCompare()
    if (k === 'escape') toggleCompare(false)
  })

  apply()
})()
