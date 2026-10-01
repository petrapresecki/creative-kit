#!/usr/bin/env node
// creative-kit command line: new, add, theme, list. No dependencies beyond Node.
import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { themeCss, googleFontsUrl } from '../themes/theme.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const BLOCKS = path.join(ROOT, 'registry/blocks')
const LIB = path.join(ROOT, 'registry/lib')
const THEMES = path.join(ROOT, 'themes')
const STARTER = path.join(ROOT, 'templates/starter')

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
  if (!id) fail('Name a theme, e.g. pnpm kit theme iva --to ../my-site')
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
  if (!target) fail('Name the new folder, e.g. pnpm kit new ../my-site --theme iva')
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
  theme(typeof flags.theme === 'string' ? flags.theme : 'iva')
  if (typeof flags.blocks === 'string') add(flags.blocks.split(',').map(s => s.trim()).filter(Boolean))

  if (flags.install) execSync('pnpm install', { cwd: dir, stdio: 'inherit' })
  console.log(`Next:\n  cd ${path.relative(process.cwd(), dir) || '.'}\n  ${flags.install ? '' : 'pnpm install && '}pnpm dev\n`)
}

const commands = { list, add: () => add(), theme: () => theme(), new: create }
if (!commands[command]) {
  console.log(`
${c.bold('creative-kit')}

  pnpm kit list                                  Every block and theme
  pnpm kit new <folder> [--theme iva] [--blocks a,b] [--install]
  pnpm kit add <block...> --to <project> [--install] [--force] [--dir src/components/kit]
  pnpm kit theme <theme> --to <project>
`)
  process.exit(command ? 1 : 0)
}
commands[command]()
