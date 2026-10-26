import { useMemo } from 'react'
import RollText from '@kit/blocks/roll-text/RollText'
import { getStudy, TOOLS } from '@site/data/studies'
import { getPrinciple } from '@site/data/guide'
import { getPin } from '@site/data/inspo'
import { linkProps } from '@site/lib/router'
import CodeView from '@site/components/CodeView'
import StudyFrame from '@site/components/StudyFrame'

export default function StudyPage({ slug }: { slug: string }) {
  const study = getStudy(slug)
  const files = useMemo((): Record<string, () => Promise<string>> => (study ? { 'index.html': study.loadHtml } : {}), [study])
  if (!study) {
    return (
      <div className="px-4 pt-12 md:px-5">
        <p className="text-title">No study called “{slug}”.</p>
        <a {...linkProps('/studies')} className="caption mt-4 inline-block border-b border-ink">
          All studies →
        </a>
      </div>
    )
  }
  return (
    <div className="pt-8">
      <div className="grid gap-6 px-4 pb-8 md:grid-cols-12 md:px-5">
        <div className="md:col-span-6">
          <a {...linkProps('/studies')} className="group caption text-muted">
            <RollText text="← Studies" />
          </a>
          <h1 className="mt-4 text-headline">{study.title}</h1>
        </div>
        <div className="grid content-end gap-4 md:col-span-6">
          <p className="caption flex flex-wrap gap-2 text-muted">
            <span className="rounded border border-current px-1.5">{TOOLS[study.tool]}</span>
            <span>studies/{study.slug}/index.html</span>
          </p>
          <p className="text-[15px]">{study.prompt}</p>
          {study.learned && (
            <p className="text-[15px] text-ink/75">
              <span className="caption mr-2 text-muted">Learned</span>
              {study.learned}
            </p>
          )}
          <div className="flex flex-wrap gap-1">
            {study.principles?.map(id => (
              <a key={id} {...linkProps(`/guide#${id}`)} className="rounded-full border border-ink/20 px-2.5 py-0.5 text-[13px] hover:border-ink hover:bg-accent">
                {getPrinciple(id)?.name ?? id}
              </a>
            ))}
            {study.pins?.map(id => (
              <a key={id} {...linkProps('/inspo')} className="rounded-full bg-mist px-2.5 py-0.5 text-[13px] hover:bg-accent">
                Pin: {getPin(id)?.title.split(' — ')[0] ?? id}
              </a>
            ))}
          </div>
        </div>
      </div>
      <StudyFrame study={study} className="h-[80svh] border-y border-ink" />
      <section className="px-4 py-12 md:px-5">
        <CodeView files={files} />
      </section>
    </div>
  )
}
