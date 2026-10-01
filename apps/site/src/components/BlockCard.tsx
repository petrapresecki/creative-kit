import RollText from '@kit/blocks/roll-text/RollText'
import { linkProps } from '@site/lib/router'
import { blockImage, type Block } from '@site/data/registry'

export default function BlockCard({ block, index = 0 }: { block: Block; index?: number }) {
  return (
    <a {...linkProps(`/blocks/${block.slug}`)} className="group flex flex-col overflow-hidden border-r border-b border-ink bg-paper">
      <div className="aspect-[16/10] overflow-hidden border-b border-ink bg-mist">
        <img src={blockImage(block, index)} alt="" loading="lazy" className="h-full w-full object-cover transition-[scale] duration-700 ease-out-expo group-hover:scale-[1.04]" />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4 transition-colors duration-300 group-hover:bg-accent">
        <p className="caption flex justify-between text-muted group-hover:text-ink">
          <span>{block.category}</span>
          {block.webgl && <span>WebGL</span>}
        </p>
        <h3 className="text-[26px] leading-none font-medium tracking-[-0.04em]">
          <RollText text={block.title} />
        </h3>
        <p className="text-[14px] leading-snug text-ink/75">{block.description}</p>
      </div>
    </a>
  )
}
