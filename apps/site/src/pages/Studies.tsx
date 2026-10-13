import MeltText from '@kit/blocks/melt-text/MeltText'
import RollText from '@kit/blocks/roll-text/RollText'
import { studies, TOOLS } from '@site/data/studies'
import { guide, getPrinciple } from '@site/data/guide'
import { linkProps } from '@site/lib/router'
import Command from '@site/components/Command'
import StudyFrame from '@site/components/StudyFrame'

export default function Studies() {
  return (
    <div className="pt-12">
      <div className="grid gap-8 px-4 pb-12 md:grid-cols-12 md:px-5">
        <div className="md:col-span-7">
          <p className="caption text-muted">{studies.length} studies</p>
          <MeltText as="h1" immediate className="mt-3 text-display">
            Studies
          </MeltText>
          <p className="mt-6 max-w-[56ch] text-lead text-ink/80">
            Small pieces to practise one thing at a time: an hour or two, one HTML file, GSAP or p5.js. The good ones become blocks later.
          </p>
        </div>
        <div className="grid content-end gap-3 md:col-span-5">
          <p className="caption text-muted">Start one</p>
          <Command>pnpm kit study dot-type --p5</Command>
          <Command>pnpm kit study hierarchy</Command>
          <p className="text-[13px] text-muted">Name it after a principle and the brief is filled in from the field guide. Leave out --p5 for a GSAP study.</p>
        </div>
      </div>

      <div className="grid border-t border-l border-ink sm:grid-cols-2 lg:grid-cols-3">
        {studies.map(s => (
          <a key={s.slug} {...linkProps(`/studies/${s.slug}`)} className="group grid content-start border-r border-b border-ink">
            <StudyFrame study={s} interactive={false} className="aspect-[4/3] border-b border-ink" />
            <div className="grid gap-2 p-4">
              <p className="caption flex gap-2 text-muted">
                <span className="rounded border border-current px-1.5">{TOOLS[s.tool]}</span>
                {s.principles?.map(id => getPrinciple(id)?.name ?? id).join(' · ')}
              </p>
              <h2 className="text-[19px] leading-[1.15] font-medium tracking-[-0.03em]">
                <RollText text={s.title} />
              </h2>
              <p className="text-[14px] leading-snug text-ink/75">{s.prompt}</p>
            </div>
          </a>
        ))}
      </div>

      <section className="px-4 py-16 md:px-5">
        <h2 className="text-headline">Ideas to practise</h2>
        <p className="mt-4 max-w-[56ch] text-[15px] text-ink/75">One study per principle in the field guide.</p>
        <ul className="mt-8 border-t border-ink">
          {guide.principles.map(p => (
            <li key={p.id} className="grid gap-3 border-b border-ink/15 py-4 md:grid-cols-12 md:gap-6">
              <a {...linkProps(`/guide#${p.id}`)} className="py-1 text-[15px] font-medium hover:underline md:col-span-3">
                {p.name}
              </a>
              <p className="text-[15px] text-ink/80 md:col-span-6">{p.practice}</p>
              <div className="min-w-0 md:col-span-3">
                <Command>{`pnpm kit study ${p.id}`}</Command>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
