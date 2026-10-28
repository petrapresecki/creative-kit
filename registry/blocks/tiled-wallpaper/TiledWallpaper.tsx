import type { ReactNode } from 'react'

export interface TiledWallpaperProps {
  /** The image to repeat, usually the page's own subject */
  image: string
  /** Width of one tile in px */
  tile?: number
  /** How much of the wash covers the tiles, 0–1 */
  wash?: number
  /** Cover the viewport behind the page instead of filling the parent */
  fixed?: boolean
  children?: ReactNode
  className?: string
}

/**
 * The wallpaper from badbunnyfan.site: the subject itself, tiled small behind
 * everything, washed with a gradient from mist to paper so type on top stays legible.
 * Two layers under the children: the repeated image, then the wash.
 */
export default function TiledWallpaper({ image, tile = 220, wash = 0.66, fixed = false, children, className = '' }: TiledWallpaperProps) {
  const pos = fixed ? 'fixed inset-0' : 'absolute inset-0'
  const mix = (token: string) => `color-mix(in srgb, var(${token}) ${Math.round(wash * 100)}%, transparent)`
  return (
    <div className={`${fixed ? '' : 'relative isolate overflow-hidden'} ${className}`}>
      <div
        aria-hidden
        className={`${pos} -z-20`}
        style={{ background: `url(${image}) 0 0 / ${tile}px auto repeat`, filter: 'saturate(1.25)' }}
      />
      <div aria-hidden className={`${pos} -z-10`} style={{ background: `linear-gradient(180deg, ${mix('--color-mist')}, ${mix('--color-paper')})` }} />
      {children}
    </div>
  )
}
