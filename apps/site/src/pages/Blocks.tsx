import MeltText from '@kit/blocks/melt-text/MeltText'
import { blocks, CATEGORY_ORDER } from '@site/data/registry'
import BlockCard from '@site/components/BlockCard'

export default function Blocks() {
  const categories = CATEGORY_ORDER.filter(c => blocks.some(b => b.category === c))
  let i = 0
  return (
    <div className="pt-12">
      <div className="px-4 md:px-5">
        <p className="caption text-muted">{blocks.length} blocks</p>
        <MeltText as="h1" immediate className="mt-3 text-display">
          Blocks
        </MeltText>
        <p className="mt-6 max-w-[52ch] text-lead text-ink/80">
          Motion, effects and sections I’ve built and liked. Each one runs live on its page, with settings to play with and the code to copy into a new site.
        </p>
      </div>
      {categories.map(c => (
        <section key={c} className="pt-16">
          <h2 className="caption flex items-center gap-2 px-4 pb-4 md:px-5">
            <span className="size-2 bg-accent" />
            {c}
          </h2>
          <div className="grid border-t border-l border-ink sm:grid-cols-2 lg:grid-cols-4">
            {blocks
              .filter(b => b.category === c)
              .map(b => (
                <BlockCard key={b.slug} block={b} index={i++} />
              ))}
          </div>
        </section>
      ))}
    </div>
  )
}
