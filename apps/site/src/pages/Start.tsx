import MeltText from '@kit/blocks/melt-text/MeltText'
import RollText from '@kit/blocks/roll-text/RollText'
import { blocks } from '@site/data/registry'
import { themes } from '@site/data/themes'
import { linkProps } from '@site/lib/router'
import Command from '@site/components/Command'

const steps = [
  {
    title: 'Make a new site',
    text: 'Copies the starter (Vite, React, TypeScript, Tailwind, GSAP, Lenis) into a new folder with a theme already applied.',
    cmd: 'pnpm kit new ../my-site --theme graphite',
  },
  {
    title: 'Add blocks',
    text: 'Copies the block’s code into src/components/kit, plus any blocks and helpers it needs. It’s your code from then on: change anything.',
    cmd: 'pnpm kit add orbit-gallery work-index melt-text --to ../my-site',
  },
  {
    title: 'Install what the blocks list',
    text: 'The add command prints the npm packages the blocks use. Add --install to install them for you.',
    cmd: 'pnpm kit add dither-reveal --to ../my-site --install',
  },
  {
    title: 'Swap or tweak the theme',
    text: 'Rewrites src/styles/theme.css. Start from a theme here, then edit the colours and fonts in the new site.',
    cmd: 'pnpm kit theme cinnabar --to ../my-site',
  },
  {
    title: 'See what’s in the kit',
    text: 'Lists every block and theme by category.',
    cmd: 'pnpm kit list',
  },
  {
    title: 'Start a study',
    text: 'A small practice piece in studies/, as one HTML file. Name it after a field guide principle to get its exercise as the brief; add --p5 for a p5.js sketch.',
    cmd: 'pnpm kit study hierarchy',
  },
]

const file = (name: string, text: string) => (
  <li className="grid gap-1 border-t border-ink/15 py-3 sm:grid-cols-[240px_1fr]">
    <code className="font-mono text-[13px]">{name}</code>
    <span className="text-[14px] text-ink/75">{text}</span>
  </li>
)

export default function Start() {
  return (
    <div className="pt-12">
      <div className="px-4 pb-12 md:px-5">
        <p className="caption text-muted">How to use the kit</p>
        <MeltText as="h1" immediate className="mt-3 max-w-[12ch] text-display">
          Start a site
        </MeltText>
        <p className="mt-6 max-w-[56ch] text-lead text-ink/80">
          Run these from the creative-kit folder. Blocks are copied in as source code, so every site can bend them without breaking the others.
        </p>
      </div>

      <ol className="border-t border-ink">
        {steps.map((s, i) => (
          <li key={s.title} className="grid gap-4 border-b border-ink px-4 py-8 md:grid-cols-12 md:px-5">
            <span className="caption md:col-span-1">({String(i + 1).padStart(2, '0')})</span>
            <div className="md:col-span-5">
              <h2 className="text-title">{s.title}</h2>
              <p className="mt-3 max-w-[48ch] text-[15px] text-ink/75">{s.text}</p>
            </div>
            <div className="self-end md:col-span-6">
              <Command>{s.cmd}</Command>
            </div>
          </li>
        ))}
      </ol>

      <section className="grid gap-10 px-4 py-16 md:grid-cols-12 md:px-5">
        <div className="md:col-span-4">
          <h2 className="text-title">What’s in the repo</h2>
          <p className="mt-3 text-[15px] text-ink/75">
            {blocks.length} blocks, {themes.length} themes and the inspo library, all plain files you can edit.
          </p>
        </div>
        <ul className="md:col-span-8">
          {file('registry/blocks/<name>/', 'One folder per block: the component, a demo for this site and meta.json (dependencies, what inspired it).')}
          {file('registry/lib/', 'Shared helpers: GSAP setup, Lenis smooth scroll, theme token reader, scramble hook, base CSS.')}
          {file('themes/<name>.json', 'Colours, fonts, type scale, easing and radius. theme.mjs turns one into Tailwind CSS.')}
          {file('content/inspo/', 'One JSON file per pin, screenshots in images/. Projects are listed in content/projects.json.')}
          {file('content/process.json', 'The design process, step by step. Shown on the Process page; pnpm kit docs writes PROCESS.md from it.')}
          {file('content/field-guide.json', 'Design principles with my pins as examples. Shown on the Field guide page and in FIELD-GUIDE.md.')}
          {file('studies/<name>/', 'Practice pieces: one HTML file (GSAP or p5.js) and a meta.json.')}
          {file('skills/', 'Claude Code skills for any repo: site-concept, site-layout, design-review.')}
          {file('templates/starter/', 'The new-site template the kit copies.')}
          {file('scripts/kit.mjs', 'The kit command: new, add, theme, list, skills, study, docs.')}
          {file('apps/site/', 'This website.')}
        </ul>
      </section>

      <section className="border-t border-ink px-4 py-16 md:px-5">
        <h2 className="text-title">Making a new block</h2>
        <p className="mt-3 max-w-[60ch] text-[15px] text-ink/75">
          Copy a block folder in registry/blocks, rename it, and edit the three files. Style it with theme tokens (bg-paper, text-ink, bg-accent, text-display…) so it follows any theme. It appears on this site automatically.
        </p>
        <a {...linkProps('/blocks/melt-text')} className="group caption mt-6 inline-block border-b border-ink pb-0.5">
          <RollText text="See a simple block →" />
        </a>
      </section>
    </div>
  )
}
