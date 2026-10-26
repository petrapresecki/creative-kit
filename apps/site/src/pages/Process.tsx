import { useState } from 'react'
import MeltText from '@kit/blocks/melt-text/MeltText'
import RollText from '@kit/blocks/roll-text/RollText'
import { process, getPrinciple, type Step, type Tool } from '@site/data/guide'
import { hashLinkProps, linkProps, useHashOnArrive } from '@site/lib/router'
import Command from '@site/components/Command'

const phases = [...new Set(process.steps.map(s => s.phase))]
const num = (s: Step) => String(process.steps.indexOf(s) + 1).padStart(2, '0')

function ToolItem({ tool }: { tool: Tool }) {
  if (tool.kind === 'cmd') {
    return (
      <div className="grid gap-1.5">
        <Command>{tool.label}</Command>
        {tool.note && <p className="text-[13px] text-muted">{tool.note}</p>}
      </div>
    )
  }
  if (tool.kind === 'page' && tool.value) {
    return (
      <a {...linkProps(tool.value)} className="group caption w-fit border-b border-ink pb-0.5">
        <RollText text={`${tool.label} →`} />
      </a>
    )
  }
  return (
    <p className="text-[14px] leading-snug">
      <span className="caption mr-2 inline-block rounded-full bg-ink px-2 py-0.5 text-paper">{tool.kind === 'skill' ? `Skill · ${tool.label}` : tool.label}</span>
      {tool.note && <span className="text-ink/75">{tool.note}</span>}
    </p>
  )
}

/** Launch checklist; ticks are remembered in this browser only. */
function Checklist({ id, items }: { id: string; items: string[] }) {
  const key = `kit:checklist:${id}`
  const [done, setDone] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(key) ?? '[]')
    } catch {
      return []
    }
  })
  const toggle = (item: string) => {
    const next = done.includes(item) ? done.filter(d => d !== item) : [...done, item]
    setDone(next)
    try {
      localStorage.setItem(key, JSON.stringify(next))
    } catch {
      /* private mode: ticks just won't persist */
    }
  }
  return (
    <div className="md:col-span-11 md:col-start-2">
      <p className="caption mb-3 text-muted">
        Checklist · {done.length}/{items.length}
      </p>
      <ul className="grid gap-x-6 sm:grid-cols-2">
        {items.map(item => (
          <li key={item} className="border-t border-ink/15">
            <label className="flex cursor-pointer items-start gap-3 py-2.5 text-[15px]">
              <input type="checkbox" checked={done.includes(item)} onChange={() => toggle(item)} className="mt-1 size-4 shrink-0 accent-ink" />
              <span className={done.includes(item) ? 'text-muted line-through' : ''}>{item}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Process() {
  useHashOnArrive()
  return (
    <div className="pt-12">
      <div className="px-4 pb-10 md:px-5">
        <p className="caption text-muted">How I design a site</p>
        <MeltText as="h1" immediate className="mt-3 text-display">
          Process
        </MeltText>
        <p className="mt-6 max-w-[60ch] text-lead text-ink/80">{process.intro}</p>
      </div>

      {/* The whole process at a glance */}
      <nav aria-label="Steps" className="grid border-t border-l border-ink sm:grid-cols-3 lg:grid-cols-6">
        {phases.map(phase => (
          <div key={phase} className="border-r border-b border-ink p-4">
            <p className="caption text-muted">{phase}</p>
            <ol className="mt-2 grid">
              {process.steps
                .filter(s => s.phase === phase)
                .map(s => (
                  <li key={s.id}>
                    <a {...hashLinkProps(s.id)} className="group flex gap-2 py-1 text-[15px] font-medium">
                      <span className="caption pt-[3px] text-muted">{num(s)}</span>
                      <RollText text={s.title} />
                    </a>
                  </li>
                ))}
            </ol>
          </div>
        ))}
      </nav>

      <ol>
        {process.steps.map(s => (
          <li key={s.id} id={s.id} className="grid scroll-mt-20 gap-x-6 gap-y-8 border-b border-ink px-4 py-10 md:grid-cols-12 md:px-5">
            <span className="caption md:col-span-1">({num(s)})</span>

            <div className="md:col-span-4">
              <p className="caption text-muted">{s.phase}</p>
              <h2 className="mt-2 text-title">{s.title}</h2>
              <p className="mt-4 text-[19px] leading-snug font-medium text-balance">{s.question}</p>
              <p className="mt-4 max-w-[48ch] text-[15px] text-ink/75">{s.why}</p>
            </div>

            <div className="grid content-start gap-6 md:col-span-4">
              <div>
                <p className="caption mb-2 text-muted">Do</p>
                <ul className="grid gap-2 text-[15px]">
                  {s.do.map(d => (
                    <li key={d} className="flex gap-2">
                      <span className="mt-[7px] size-1.5 shrink-0 bg-ink" />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="caption mb-2 text-muted">Done when</p>
                <ul className="grid gap-2 text-[15px]">
                  {s.done.map(d => (
                    <li key={d} className="flex gap-2">
                      <span className="text-muted">✓</span>
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="grid min-w-0 content-start gap-6 md:col-span-3">
              <div className="grid gap-3">
                <p className="caption text-muted">Use</p>
                {s.tools.map(t => (
                  <ToolItem key={t.label} tool={t} />
                ))}
              </div>
              <div>
                <p className="caption mb-1 text-muted">You end up with</p>
                <p className="text-[15px]">{s.output}</p>
              </div>
              <div>
                <p className="caption mb-2 text-muted">Principles</p>
                <div className="flex flex-wrap gap-1">
                  {s.principles.map(id => (
                    <a key={id} {...linkProps(`/guide#${id}`)} className="rounded-full border border-ink/20 px-2.5 py-0.5 text-[13px] hover:border-ink hover:bg-accent">
                      {getPrinciple(id)?.name ?? id}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {s.checklist && <Checklist id={s.id} items={s.checklist} />}
          </li>
        ))}
      </ol>

      <section className="grid gap-6 px-4 py-16 md:grid-cols-12 md:px-5">
        <h2 className="text-title md:col-span-5 md:col-start-2">Learning as I go</h2>
        <div className="grid gap-4 md:col-span-5">
          <p className="text-[15px] text-ink/75">
            The field guide explains each principle with pins I already love. Studies are small pieces to practise one thing at a time, in GSAP or p5.js.
          </p>
          <div className="flex flex-wrap gap-4">
            <a {...linkProps('/guide')} className="group caption border-b border-ink pb-0.5">
              <RollText text="Field guide →" />
            </a>
            <a {...linkProps('/studies')} className="group caption border-b border-ink pb-0.5">
              <RollText text="Studies →" />
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
