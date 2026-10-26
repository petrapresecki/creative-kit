#!/usr/bin/env node
// creative-kit command line: new, add, theme, list. No dependencies beyond Node.
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { execSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { themeCss, googleFontsUrl } from '../themes/theme.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const BLOCKS = path.join(ROOT, 'registry/blocks')
const LIB = path.join(ROOT, 'registry/lib')
const THEMES = path.join(ROOT, 'themes')
const STARTER = path.join(ROOT, 'templates/starter')
const SKILLS = path.join(ROOT, 'skills')
const STUDIES = path.join(ROOT, 'studies')
const CONTENT = path.join(ROOT, 'content')

const c = { dim: s => `\x1b[2m${s}\x1b[0m`, bold: s => `\x1b[1m${s}\x1b[0m`, green: s => `\x1b[32m${s}\x1b[0m`, red: s => `\x1b[31m${s}\x1b[0m` }
const fail = msg => {
  console.error(c.red('✕ ') + msg)
  process.exit(1)
}

// ---------- args ----------
const [command, ...rest] = process.argv.slice(2)
const flags = {}
const positional = []
for (let i = 0; i < rest.length; i++) {
  const a = rest[i]
  if (a.startsWith('--')) {
    const key = a.slice(2)
    const next = rest[i + 1]
    if (next && !next.startsWith('--')) {
      flags[key] = next
      i++
    } else flags[key] = true
  } else positional.push(a)
}

// ---------- registry ----------
const readJson = p => JSON.parse(fs.readFileSync(p, 'utf8'))
const allBlocks = () =>
  fs
    .readdirSync(BLOCKS)
    .filter(d => fs.existsSync(path.join(BLOCKS, d, 'meta.json')))
    .map(slug => ({ slug, ...readJson(path.join(BLOCKS, slug, 'meta.json')) }))
const allThemes = () =>
  fs
    .readdirSync(THEMES)
    .filter(f => f.endsWith('.json'))
    .map(f => readJson(path.join(THEMES, f)))

function getBlock(slug) {
  const file = path.join(BLOCKS, slug, 'meta.json')
  if (!fs.existsSync(file)) fail(`No block called "${slug}". Run ${c.bold('pnpm kit list')} to see them.`)
  return { slug, ...readJson(file) }
}

/** The block plus every block it depends on, dependencies first. */
function withDependencies(slugs) {
  const order = []
  const visit = slug => {
    if (order.some(b => b.slug === slug)) return
    const block = getBlock(slug)
    block.registryDependencies.forEach(visit)
    order.push(block)
  }
  slugs.forEach(visit)
  return order
}

// ---------- project helpers ----------
function projectDir() {
  const to = flags.to
  if (!to || to === true) fail('Say which project with --to <folder>, e.g. --to ../my-site')
  const dir = path.resolve(process.cwd(), to)
  if (!fs.existsSync(path.join(dir, 'package.json'))) fail(`${dir} has no package.json. Is it a project folder?`)
  return dir
}

const componentsDir = () => (typeof flags.dir === 'string' ? flags.dir : 'src/components/kit')
/** Import prefix for a folder under src/, using the project's @/ alias. */
const aliasFor = rel => '@/' + rel.replace(/^src\//, '')

/** Point kit imports at where the files land in the project. */
function rewrite(source) {
  return source
    .replaceAll("'@kit/lib/", `'@/lib/kit/`)
    .replaceAll("'@kit/blocks/", `'${aliasFor(componentsDir())}/`)
}

function write(file, contents, { force = Boolean(flags.force) } = {}) {
  if (fs.existsSync(file) && !force) {
    const same = Buffer.compare(fs.readFileSync(file), Buffer.from(contents)) === 0
    if (same) return false
    console.log(c.dim(`  skip  ${path.relative(process.cwd(), file)} (exists — use --force to overwrite)`))
    return false
  }
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, contents)
  console.log(`  ${c.green('write')} ${path.relative(process.cwd(), file)}`)
  return true
}

function copyLib(dir, names) {
  for (const name of new Set(names)) {
    const src = path.join(LIB, `${name}.ts`)
    if (!fs.existsSync(src)) fail(`Missing kit helper registry/lib/${name}.ts`)
    write(path.join(dir, 'src/lib/kit', `${name}.ts`), fs.readFileSync(src, 'utf8'))
  }
  write(path.join(dir, 'src/styles/kit.css'), fs.readFileSync(path.join(LIB, 'kit.css'), 'utf8'), { force: false })
}

function missingDeps(dir, deps) {
  const pkg = readJson(path.join(dir, 'package.json'))
  const have = { ...pkg.dependencies, ...pkg.devDependencies }
  return [...new Set(deps)].filter(d => !have[d])
}

// ---------- commands ----------
function list() {
  const blocks = allBlocks()
  const byCat = Object.groupBy ? Object.groupBy(blocks, b => b.category) : blocks.reduce((m, b) => ((m[b.category] ??= []).push(b), m), {})
  console.log(c.bold(`\n${blocks.length} blocks`))
  for (const [cat, items] of Object.entries(byCat)) {
    console.log(`\n${c.bold(cat)}`)
    for (const b of items) console.log(`  ${b.slug.padEnd(20)} ${c.dim(b.description)}`)
  }
  console.log(c.bold(`\nThemes`))
  for (const t of allThemes()) console.log(`  ${t.id.padEnd(20)} ${c.dim(t.description)}`)
  console.log()
}

function add(slugs = positional) {
  if (!slugs.length) fail('Name at least one block, e.g. pnpm kit add melt-text --to ../my-site')
  const dir = projectDir()
  const blocks = withDependencies(slugs)
  console.log(c.bold(`\nAdding ${blocks.map(b => b.slug).join(', ')}`))
  for (const b of blocks) {
    for (const file of b.files) {
      const src = path.join(BLOCKS, b.slug, file)
      const dest = path.join(dir, componentsDir(), b.slug, file)
      const text = /\.(tsx?|css)$/.test(file) ? rewrite(fs.readFileSync(src, 'utf8')) : fs.readFileSync(src)
      write(dest, text)
    }
  }
  copyLib(dir, blocks.flatMap(b => b.lib))

  const deps = missingDeps(dir, blocks.flatMap(b => b.dependencies))
  const devDeps = missingDeps(dir, blocks.flatMap(b => b.devDependencies ?? []))
  const commands = [deps.length && `pnpm add ${deps.join(' ')}`, devDeps.length && `pnpm add -D ${devDeps.join(' ')}`].filter(Boolean)
  if (commands.length) {
    if (flags.install) {
      for (const cmd of commands) {
        console.log(c.bold('\n' + cmd))
        execSync(cmd, { cwd: dir, stdio: 'inherit' })
      }
    } else console.log(`\nThese blocks need: ${c.bold(commands.join(' && '))}  ${c.dim('(or rerun with --install)')}`)
  }
  console.log(c.green('\n✓ Done.') + c.dim(` Import from '${aliasFor(componentsDir())}/<block>/<File>'\n`))
}

function theme(id = positional[0]) {
  if (!id) fail('Name a theme, e.g. pnpm kit theme graphite --to ../my-site')
  const file = path.join(THEMES, `${id}.json`)
  if (!fs.existsSync(file)) fail(`No theme called "${id}". Available: ${allThemes().map(t => t.id).join(', ')}`)
  const t = readJson(file)
  const dir = projectDir()
  write(path.join(dir, 'src/styles/theme.css'), themeCss(t), { force: true })

  // Font link between the kit markers in index.html
  const html = path.join(dir, 'index.html')
  const url = googleFontsUrl(t)
  if (fs.existsSync(html)) {
    const tag = url ? `<link rel="stylesheet" href="${url}" />` : ''
    let src = fs.readFileSync(html, 'utf8')
    const block = `<!-- kit:fonts -->\n    ${tag}\n    <!-- /kit:fonts -->`
    src = /<!-- kit:fonts -->[\s\S]*?<!-- \/kit:fonts -->/.test(src)
      ? src.replace(/<!-- kit:fonts -->[\s\S]*?<!-- \/kit:fonts -->/, block)
      : src.replace('</head>', `    ${block}\n  </head>`)
    fs.writeFileSync(html, src)
    console.log(`  ${c.green('write')} ${path.relative(process.cwd(), html)} ${c.dim('(fonts)')}`)
  }
  console.log(c.green(`\n✓ Theme "${t.name}" applied.\n`))
}

function create() {
  const target = positional[0]
  if (!target) fail('Name the new folder, e.g. pnpm kit new ../my-site --theme graphite')
  const dir = path.resolve(process.cwd(), target)
  if (fs.existsSync(dir) && fs.readdirSync(dir).length) fail(`${dir} already exists and isn't empty.`)
  const name = path.basename(dir)

  console.log(c.bold(`\nCreating ${name}`))
  fs.cpSync(STARTER, dir, { recursive: true, filter: src => !src.includes('node_modules') })
  const pkgFile = path.join(dir, 'package.json')
  fs.writeFileSync(pkgFile, fs.readFileSync(pkgFile, 'utf8').replace('"name": "starter"', `"name": "${name}"`))
  for (const f of ['index.html', 'CLAUDE.md', 'README.md', 'src/App.tsx']) {
    const p = path.join(dir, f)
    if (fs.existsSync(p)) fs.writeFileSync(p, fs.readFileSync(p, 'utf8').replaceAll('{{name}}', name))
  }
  // npm strips .gitignore from published templates, so the starter keeps it as gitignore
  if (fs.existsSync(path.join(dir, 'gitignore'))) fs.renameSync(path.join(dir, 'gitignore'), path.join(dir, '.gitignore'))

  flags.to = dir
  copyLib(dir, ['gsap', 'lenis'])
  theme(typeof flags.theme === 'string' ? flags.theme : 'graphite')
  if (typeof flags.blocks === 'string') add(flags.blocks.split(',').map(s => s.trim()).filter(Boolean))

  if (flags.install) execSync('pnpm install', { cwd: dir, stdio: 'inherit' })
  console.log(`Next:\n  cd ${path.relative(process.cwd(), dir) || '.'}\n  ${flags.install ? '' : 'pnpm install && '}pnpm dev\n`)
}

/** Link the kit's shareable Claude Code skills into ~/.claude/skills, so every repo can use them. */
function skills() {
  const target = path.join(os.homedir(), '.claude/skills')
  fs.mkdirSync(target, { recursive: true })
  console.log(c.bold(`\nLinking skills into ${target}`))
  for (const name of fs.readdirSync(SKILLS).filter(d => fs.existsSync(path.join(SKILLS, d, 'SKILL.md')))) {
    const src = path.join(SKILLS, name)
    const dest = path.join(target, name)
    const current = fs.lstatSync(dest, { throwIfNoEntry: false })
    if (current?.isSymbolicLink() && fs.realpathSync(dest) === src) {
      console.log(c.dim(`  ok    ${name} (already linked)`))
      continue
    }
    if (current && !flags.force) {
      console.log(c.dim(`  skip  ${name} (${dest} exists — use --force to replace it)`))
      continue
    }
    if (current) fs.rmSync(dest, { recursive: true, force: true })
    fs.symlinkSync(src, dest, 'dir')
    console.log(`  ${c.green('link')}  ${name}`)
  }
  console.log(c.green('\n✓ Done.') + c.dim(' They stay in sync with this repo. Restart Claude Code sessions to pick up new skills.\n'))
}

/** A new study: one self-contained HTML file (GSAP, or p5.js with --p5) and its meta.json. */
function study(slug = positional[0]) {
  if (!slug || !/^[a-z0-9-]+$/.test(slug)) fail('Name the study in kebab-case, e.g. pnpm kit study dot-type --p5')
  // Named after a principle (hierarchy, or hierarchy-type…): its practice becomes the brief
  const principle = readJson(path.join(CONTENT, 'field-guide.json')).principles.find(p => slug === p.id || slug.startsWith(p.id + '-'))
  // A second study of the same principle gets a number: hierarchy-2, hierarchy-3…
  if (principle && slug === principle.id) for (let n = 2; fs.existsSync(path.join(STUDIES, slug)); n++) slug = `${principle.id}-${n}`
  const dir = path.join(STUDIES, slug)
  if (fs.existsSync(dir)) fail(`studies/${slug} already exists.`)
  const tool = flags.p5 ? 'p5' : 'gsap'
  const t = readJson(path.join(THEMES, `${typeof flags.theme === 'string' ? flags.theme : 'graphite'}.json`))
  const title = principle ? `${principle.name} study` : slug.replace(/-/g, ' ').replace(/^./, ch => ch.toUpperCase())
  const meta = {
    title,
    prompt: principle?.practice ?? 'What this study practises, in one or two sentences.',
    tool,
    principles: principle ? [principle.id] : [],
    pins: principle ? principle.pins.map(p => p.id).slice(0, 2) : [],
    learned: '',
    added: Date.now(),
  }
  const vars = Object.entries(t.colors).map(([k, v]) => `--${k}: ${v};`).join(' ')
  const fonts = googleFontsUrl(t)
  const head = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    ${fonts ? `<link rel="stylesheet" href="${fonts}" />
    ` : ''}<style>
      :root { ${vars} --sans: "${t.fonts.sans.family}", ${t.fonts.sans.fallback}; }
      * { box-sizing: border-box; margin: 0; }
      html, body { height: 100%; background: var(--paper); color: var(--ink); font-family: var(--sans); }
    </style>`
  const body =
    tool === 'p5'
      ? `${head}
    <script src="https://cdn.jsdelivr.net/npm/p5@2/lib/p5.min.js"></script>
  </head>
  <body>
    <script>
      // ${meta.prompt}
      const css = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim()

      function setup() {
        createCanvas(windowWidth, windowHeight)
        noStroke()
      }

      function draw() {
        background(css('--paper'))
        fill(css('--ink'))
        circle(mouseX || width / 2, mouseY || height / 2, 80)
      }

      function windowResized() {
        resizeCanvas(windowWidth, windowHeight)
      }
    </script>
  </body>
</html>
`
      : `${head}
    <script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
  </head>
  <body>
    <main style="display: grid; place-items: center; height: 100%">
      <h1 class="title" style="font-size: clamp(48px, 10vw, 160px); letter-spacing: -0.04em">${title}</h1>
    </main>
    <script>
      // ${meta.prompt}
      const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
      if (!reduce) gsap.from('.title', { yPercent: 100, opacity: 0, duration: 1.2, ease: 'expo.out' })
    </script>
  </body>
</html>
`
  write(path.join(dir, 'index.html'), body)
  write(path.join(dir, 'meta.json'), JSON.stringify(meta, null, 2) + '\n')
  console.log(c.green('\n✓ Done.') + c.dim(` Open studies/${slug}/index.html in a browser, or /studies/${slug} on the kit site (restart pnpm dev for a new folder).\n`))
}

/** PROCESS.md and FIELD-GUIDE.md from content/process.json and content/field-guide.json, for reading on GitHub. */
function docs() {
  const proc = readJson(path.join(CONTENT, 'process.json'))
  const guide = readJson(path.join(CONTENT, 'field-guide.json'))
  const pinTitle = id => {
    const f = path.join(CONTENT, 'inspo', `${id}.json`)
    return fs.existsSync(f) ? readJson(f).title : id
  }
  const name = id => guide.principles.find(p => p.id === id)?.name ?? id
  const code = s => '`' + s + '`'
  const tool = t => {
    const note = t.note ? ` (${t.note})` : ''
    if (t.kind === 'skill') return `the ${code(t.label)} skill${note}`
    if (t.kind === 'cmd') return code(t.label) + note
    if (t.kind === 'page') return `the ${t.label} page on the kit site (${code(t.value)})`
    return t.label + note
  }
  const generated = file => `<!-- Generated by ${code('pnpm kit docs')} from content/${file}. Edit the JSON, not this file. -->`

  const p = [generated('process.json'), '', '# Process', '', proc.intro, '']
  proc.steps.forEach((s, i) => p.push(`${i + 1}. [${s.title}](#${s.id}) · ${s.phase}`))
  proc.steps.forEach((s, i) => {
    p.push('', `<a id="${s.id}"></a>`, `## ${i + 1}. ${s.title}`, '', `**${s.question}**`, '', s.why, '', '**Do**', '', ...s.do.map(d => `- ${d}`), '')
    p.push('**Use**', '', ...s.tools.map(t => `- ${tool(t)}`), '', `**You end up with:** ${s.output}`, '', '**Done when**', '', ...s.done.map(d => `- ${d}`))
    if (s.checklist) p.push('', '**Checklist**', '', ...s.checklist.map(d => `- [ ] ${d}`))
    p.push('', `Principles: ${s.principles.map(id => `[${name(id)}](FIELD-GUIDE.md#${id})`).join(', ')}`)
  })
  write(path.join(ROOT, 'PROCESS.md'), p.join('\n') + '\n', { force: true })

  const g = [generated('field-guide.json'), '', '# Field guide', '', guide.intro, '']
  for (const grp of guide.groups) {
    g.push(`## ${grp.name}`, '')
    for (const pr of guide.principles.filter(x => x.group === grp.id)) {
      g.push(`<a id="${pr.id}"></a>`, `### ${pr.name}`, '', `**${pr.short}**`, '', pr.explain, '', `**How to check:** ${pr.check}`, '', '**Usual mistakes**', '', ...pr.mistakes.map(m => `- ${m}`), '')
      g.push(`**Practise:** ${pr.practice} (${code(`pnpm kit study ${pr.id}`)})`, '', '**In my pins**', '', ...pr.pins.map(x => `- ${code(x.id)} ${pinTitle(x.id)}: ${x.look}`), '')
    }
  }
  write(path.join(ROOT, 'FIELD-GUIDE.md'), g.join('\n'), { force: true })
}

const commands = { list, add: () => add(), theme: () => theme(), new: create, skills, study: () => study(), docs }
if (!commands[command]) {
  console.log(`
${c.bold('creative-kit')}

  pnpm kit list                                  Every block and theme
  pnpm kit new <folder> [--theme graphite] [--blocks a,b] [--install]
  pnpm kit add <block...> --to <project> [--install] [--force] [--dir src/components/kit]
  pnpm kit theme <theme> --to <project>
  pnpm kit skills [--force]                      Link the kit's skills into ~/.claude/skills
  pnpm kit study <slug> [--p5] [--theme graphite] A new study in studies/ (name it after a principle to get its brief)
  pnpm kit docs                                  Rewrite PROCESS.md and FIELD-GUIDE.md from content/
`)
  process.exit(command ? 1 : 0)
}
commands[command]()
