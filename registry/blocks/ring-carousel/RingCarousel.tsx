/* eslint-disable react-hooks/immutability -- three.js materials and meshes, and the shared control ref, are mutated every frame by design */
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { gsap, prefersReducedMotion, SplitText } from '@kit/lib/gsap'
import { readToken, toRgb } from '@kit/lib/tokens'

export interface RingItem {
  id: string
  /** Image URL; any aspect ratio */
  src: string
  /** Shown in the caption pill while this item is at the front */
  title: string
  /** Optional second pill, e.g. the year or category */
  meta?: string
  /** Where the caption's action pill links to */
  href?: string
}

const UP = new THREE.Vector3(0, 1, 0)
const ORIGIN = new THREE.Vector3()
const IDENTITY = new THREE.Quaternion()

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  varying float vZ;
  void main() {
    vUv = uv;
    vec4 world = modelMatrix * vec4(position, 1.0);
    vZ = world.z;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`

const fragmentShader = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uFade;
  uniform float uFog;
  uniform float uRadius;
  uniform vec3 uBg;
  varying vec2 vUv;
  varying float vZ;

  void main() {
    // Cards on the far side face away: flip them so their images still read the right way round
    vec2 uv = gl_FrontFacing ? vUv : vec2(1.0 - vUv.x, vUv.y);
    vec3 color = texture2D(uMap, uv).rgb;
    // The far side of the ring washes out into the background
    float fog = clamp(-vZ / uRadius, 0.0, 1.0);
    color = mix(color, uBg, fog * uFog);
    gl_FragColor = vec4(color, uFade);
    #include <colorspace_fragment>
  }
`

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))
const damp = THREE.MathUtils.damp
const smooth = THREE.MathUtils.smoothstep
const mod = (v: number, n: number) => ((v % n) + n) % n
/** Signed distance from 0 on a loop of n, in −n/2…n/2 */
const wrap = (v: number, n: number) => mod(v + n / 2, n) - n / 2

/** Shared between the DOM (wheel, drag, keys) and the scene */
interface Control {
  /** Item index the ring is heading for (unbounded, so it can keep turning one way) */
  target: number
  /** Where the ring is now, eased towards target */
  turn: number
  dragging: boolean
  moved: number
  lastX: number
  /** Screen pixels per item, so a drag follows the finger */
  slotPx: number
}

interface Intro {
  /** Cards fade in one over another in the middle, 0…count */
  flip: number
  /** The stack opens into the ring, 0…1 */
  open: number
  /** The front card grows into the hero, 0…1 */
  focus: number
}

interface RingProps {
  items: RingItem[]
  control: React.RefObject<Control>
  intro: React.RefObject<Intro>
  /** Starts the intro on the first frame drawn */
  onFirstFrame: () => void
  onActive: (index: number) => void
  onOpen: (index: number) => void
  background: string
  heroSize: number
  tilt: number
  fog: number
}

function Ring({ items, control, intro, onFirstFrame, onActive, onOpen, background, heroSize, tilt, fog }: RingProps) {
  const COUNT = items.length
  const textures = useLoader(
    THREE.TextureLoader,
    items.map(item => item.src),
  )
  const { viewport, size, gl } = useThree()
  const meshes = useRef<THREE.Mesh[]>([])
  const state = useRef({ started: false, active: -1, tiltX: 0, tiltZ: 0 })
  const reduced = useMemo(() => prefersReducedMotion(), [])
  const geometry = useMemo(() => new THREE.PlaneGeometry(1, 1), [])

  const shared = useMemo(() => ({ uBg: { value: new THREE.Color() }, uFog: { value: fog }, uRadius: { value: 1 } }), [fog])
  useEffect(() => {
    const [r, g, b] = toRgb(background)
    shared.uBg.value.setRGB(r, g, b, THREE.SRGBColorSpace)
  }, [background, shared])

  const materials = useMemo(
    () =>
      textures.map(map => {
        map.colorSpace = THREE.SRGBColorSpace
        map.anisotropy = 4
        return new THREE.ShaderMaterial({
          vertexShader,
          fragmentShader,
          side: THREE.DoubleSide,
          transparent: true,
          uniforms: { uMap: { value: map }, uFade: { value: 0 }, ...shared },
        })
      }),
    [textures, shared],
  )
  const aspects = useMemo(() => textures.map(t => (t.image ? t.image.width / t.image.height : 0.75)), [textures])

  // Sizes in world units, from the container: a ring about 60% of the width, a hero about half the height
  const radius = Math.min(viewport.width * 0.31, viewport.height * 0.62)
  const cardH = radius * 0.23
  const heroH = viewport.height * heroSize
  const heroW = viewport.width * 0.8

  const _pos = useMemo(() => new THREE.Vector3(), [])
  const _ring = useMemo(() => new THREE.Vector3(), [])
  const _quat = useMemo(() => new THREE.Quaternion(), [])
  const _face = useMemo(() => new THREE.Quaternion(), [])
  const _tilt = useMemo(() => new THREE.Quaternion(), [])
  const _euler = useMemo(() => new THREE.Euler(), [])

  useFrame((three, delta) => {
    const dt = Math.min(delta, 1 / 30)
    const c = control.current
    const ip = intro.current
    const s = state.current
    if (!s.started) {
      s.started = true
      onFirstFrame()
    }
    shared.uRadius.value = radius
    c.slotPx = ((radius * Math.PI * 2) / COUNT) * (size.height / viewport.height) * 0.75

    // Follow the finger closely while dragging, glide between items otherwise
    c.turn = damp(c.turn, c.target, c.dragging ? 14 : reduced ? 24 : 4.2, dt)
    const active = mod(Math.round(c.turn), COUNT)
    if (active !== s.active) {
      s.active = active
      onActive(active)
    }

    // The pointer tips the ring, so you look over or under it; the hero stays put
    const amount = reduced ? 0 : tilt
    s.tiltX = damp(s.tiltX, 0.04 - three.pointer.y * 0.16 * amount, 3, dt)
    s.tiltZ = damp(s.tiltZ, three.pointer.x * 0.05 * amount, 3, dt)
    _tilt.setFromEuler(_euler.set(s.tiltX, 0, s.tiltZ))

    // Opening: the ring grows out of the centre while turning the last bit of a half turn
    const open = ip.open
    const turnOut = smooth(open, 0, 0.35)
    const spin = (1 - open) * Math.PI * 0.8

    meshes.current.forEach((mesh, k) => {
      const mat = materials[k]
      const aspect = aspects[k]
      const off = wrap(k - c.turn, COUNT)
      const theta = (off * Math.PI * 2) / COUNT + spin

      // On the ring: facing outward, so the cards at the sides turn edge-on
      _ring.set(Math.sin(theta), 0, Math.cos(theta)).multiplyScalar(radius * open).applyQuaternion(_tilt)
      _face.setFromAxisAngle(UP, theta).premultiply(_tilt)
      // In the stack: facing the camera, a hair apart so later cards sit on top
      _pos.set(0, 0, k * 0.004).lerp(_ring, turnOut)
      _quat.copy(IDENTITY).slerp(_face, turnOut)
      const stackH = Math.min(heroH * 0.72, heroW / aspect)
      let h = THREE.MathUtils.lerp(stackH, cardH, turnOut)

      // The card at the front comes out to the middle and grows into the hero
      const focus = (1 - smooth(Math.abs(off), 0.06, 0.5)) * ip.focus
      _pos.lerp(ORIGIN, focus)
      _quat.slerp(IDENTITY, focus)
      h = THREE.MathUtils.lerp(h, Math.min(heroH, heroW / aspect), focus)

      mesh.position.copy(_pos)
      mesh.quaternion.copy(_quat)
      mesh.scale.set(h * aspect, h, 1)
      const fade = clamp(ip.flip - k, 0, 1)
      mat.uniforms.uFade.value = fade
      // Hidden cards would still write depth and punch holes in the stack
      mesh.visible = fade > 0.001
    })
  })

  const pick = (k: number) => {
    const c = control.current
    if (c.moved > 6 || intro.current.focus < 1) return
    const off = Math.round(wrap(k - c.target, COUNT))
    if (off === 0) onOpen(mod(k, COUNT))
    else c.target = Math.round(c.target) + off
  }

  return (
    <group>
      {items.map((item, k) => (
        <mesh
          key={item.id}
          ref={el => {
            if (el) meshes.current[k] = el
          }}
          geometry={geometry}
          material={materials[k]}
          onPointerOver={e => {
            e.stopPropagation()
            gl.domElement.style.cursor = 'pointer'
          }}
          onPointerOut={() => (gl.domElement.style.cursor = '')}
          onClick={e => {
            e.stopPropagation()
            pick(k)
          }}
        />
      ))}
    </group>
  )
}

export interface RingCarouselProps {
  items: RingItem[]
  /** Called when the front item (the hero) or its action pill is clicked; without it the pill follows `href` */
  onOpen?: (item: RingItem) => void
  /** Label of the caption's action pill; shown when the item has an href or onOpen is set */
  action?: string
  /** One line that writes itself in before the images arrive; leave empty to skip that part */
  introText?: string
  /** Play the opening: the line, a flick through every image, then the stack opening into the ring */
  intro?: boolean
  /** Hero height as a fraction of the container height */
  heroSize?: number
  /** How much the pointer tips the ring, 0 to keep it level */
  tilt?: number
  /** How far the back of the ring washes into the background, 0–1 */
  fog?: number
  /** Seconds between automatic steps; 0 to only move on scroll, drag or keys */
  autoplay?: number
  /** Item the ring starts on */
  start?: number
  /** Step on mouse wheel / trackpad scroll (stops the page from scrolling while over the carousel) */
  wheel?: boolean
  hint?: string | null
  className?: string
  /** Canvas colour; defaults to the theme's --color-paper */
  background?: string
}

export default function RingCarousel({
  items,
  onOpen,
  action = 'View case',
  introText = '',
  intro: playIntro = true,
  heroSize = 0.47,
  tilt = 1,
  fog = 0.55,
  autoplay = 0,
  start = 0,
  wheel = true,
  hint = 'Scroll, drag or ← →',
  className = '',
  background,
}: RingCarouselProps) {
  const root = useRef<HTMLDivElement>(null)
  const line = useRef<HTMLSpanElement>(null)
  const caption = useRef<HTMLDivElement>(null)
  const [bg, setBg] = useState(background ?? '#ffffff')
  const [visible, setVisible] = useState(true)
  const [active, setActive] = useState(start)
  const [ready, setReady] = useState(false)
  const reduced = useMemo(() => prefersReducedMotion(), [])
  const control = useRef<Control>({ target: start, turn: start, dragging: false, moved: 0, lastX: 0, slotPx: 120 })
  const intro = useRef<Intro>({ flip: 0, open: 0, focus: 0 })
  const tl = useRef<gsap.core.Timeline | null>(null)
  const mounted = useRef(0)
  const COUNT = items.length
  const animate = playIntro && !reduced

  useEffect(() => {
    setBg(background ?? readToken('--color-paper', '#ffffff', root.current!))
  }, [background])

  // Only render while on screen
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting))
    observer.observe(root.current!)
    return () => observer.disconnect()
  }, [])

  // The line writes itself in while the images load
  useEffect(() => {
    mounted.current = performance.now()
    const el = line.current
    if (!animate || !el || !introText) return
    const split = SplitText.create(el, { type: 'chars' })
    const t = gsap.fromTo(split.chars, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power1.out', stagger: 0.012 })
    return () => {
      t.kill()
      split.revert()
    }
  }, [animate, introText])

  useEffect(() => () => void tl.current?.kill(), [])

  // Once the scene draws: hold the line a moment, then flick through every image and open the ring
  const onFirstFrame = () => {
    const ip = intro.current
    tl.current?.kill()
    if (!animate) {
      Object.assign(ip, { flip: COUNT, open: 1, focus: 1 })
      setReady(true)
      return
    }
    const hold = introText ? Math.max(0, 1.6 - (performance.now() - mounted.current) / 1000) : 0
    Object.assign(ip, { flip: 0, open: 0, focus: 0 })
    tl.current = gsap
      .timeline({ delay: hold, onComplete: () => setReady(true) })
      .to(line.current, { opacity: 0, duration: introText ? 0.4 : 0, ease: 'power1.in' })
      .to(ip, { flip: COUNT, duration: COUNT * 0.13, ease: 'none' })
      .to(ip, { open: 1, duration: 1.7, ease: 'expo.inOut' }, '+=0.15')
      .to(ip, { focus: 1, duration: 1.1, ease: 'power3.inOut' }, '-=0.5')
  }

  const step = (dir: number) => {
    const c = control.current
    if (intro.current.focus < 1) return
    c.target = Math.round(c.target) + dir
  }

  // Wheel and trackpad: one item per gesture, with a short cooldown so a flick doesn't skip far
  useEffect(() => {
    const el = root.current!
    if (!wheel) return
    let acc = 0
    let last = 0
    let stepped = 0
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const now = performance.now()
      if (now - last > 220) acc = 0
      last = now
      acc += Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
      if (Math.abs(acc) > 30 && now - stepped > 650) {
        step(Math.sign(acc))
        stepped = now
        acc = 0
      }
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [wheel])

  // Drag sideways to turn the ring, then settle on the nearest item
  useEffect(() => {
    const el = root.current!
    const c = control.current
    const down = (e: PointerEvent) => {
      if (intro.current.focus < 1) return
      c.dragging = true
      c.moved = 0
      c.lastX = e.clientX
    }
    const move = (e: PointerEvent) => {
      if (!c.dragging) return
      const dx = e.clientX - c.lastX
      c.lastX = e.clientX
      c.moved += Math.abs(dx)
      c.target -= dx / c.slotPx
    }
    const up = () => {
      if (!c.dragging) return
      c.dragging = false
      c.target = Math.round(c.target)
    }
    el.addEventListener('pointerdown', down)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    return () => {
      el.removeEventListener('pointerdown', down)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
  }, [])

  useEffect(() => {
    if (!autoplay || !ready) return
    const id = setInterval(() => !control.current.dragging && step(1), autoplay * 1000)
    return () => clearInterval(id)
  }, [autoplay, ready])

  // The caption rises in for each new front item
  useEffect(() => {
    if (!ready || reduced || !caption.current) return
    gsap.fromTo(caption.current, { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.6, ease: 'expo.out' })
  }, [active, ready, reduced])

  const open = (index: number) => {
    const item = items[index]
    if (onOpen) onOpen(item)
    else if (item.href) window.location.assign(item.href)
  }

  const [r, g, b] = toRgb(bg)
  const onLight = 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.5
  const current = items[mod(active, COUNT)]
  const pill = 'px-[3px] py-[4px] text-[11px] leading-none font-medium tracking-[0.012em] whitespace-nowrap'

  return (
    <div
      ref={root}
      data-lenis-prevent={wheel ? '' : undefined}
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label={`${current?.title ?? ''}, ${mod(active, COUNT) + 1} of ${COUNT}`}
      onKeyDown={e => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') step(1)
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') step(-1)
        else if (e.key === 'Enter') open(mod(active, COUNT))
        else return
        e.preventDefault()
      }}
      className={`relative overflow-hidden outline-none select-none ${className}`}
      style={{ background: bg, touchAction: 'pan-y' }}
    >
      <Canvas flat frameloop={visible ? 'always' : 'never'} dpr={[1, 1.75]} camera={{ fov: 26, position: [0, 0, 16] }}>
        <color attach="background" args={[bg]} />
        <Suspense fallback={null}>
          <Ring
            key={items.map(i => i.id).join()}
            items={items}
            control={control}
            intro={intro}
            onFirstFrame={onFirstFrame}
            onActive={setActive}
            onOpen={open}
            background={bg}
            heroSize={heroSize}
            tilt={tilt}
            fog={fog}
          />
        </Suspense>
      </Canvas>

      {introText && (
        <p
          aria-hidden
          className={`pointer-events-none absolute inset-0 grid place-items-center px-6 text-center text-[11px] leading-[1.4] font-medium ${onLight ? 'text-ink' : 'text-paper'} ${animate ? '' : 'hidden'}`}
        >
          <span ref={line}>{introText}</span>
        </p>
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-5 z-10 flex justify-center overflow-hidden px-4">
        <div ref={caption} aria-live="polite" className={`flex gap-[3px] ${ready && current ? 'pointer-events-auto' : 'invisible'}`}>
          <span className={`${pill} ${onLight ? 'bg-ink text-paper' : 'bg-paper text-ink'}`}>{current?.title}</span>
          {current?.meta && <span className={`${pill} bg-mist text-ink`}>{current.meta}</span>}
          {current && (current.href || onOpen) && (
            <a
              href={current.href ?? '#'}
              onClick={e => {
                if (!onOpen) return
                e.preventDefault()
                onOpen(current)
              }}
              className={`${pill} bg-mist text-ink transition-colors duration-200 hover:bg-ink hover:text-paper`}
            >
              {action}
            </a>
          )}
        </div>
      </div>

      {hint && ready && <p className={`caption pointer-events-none absolute top-4 right-4 z-10 ${onLight ? 'text-ink/50' : 'text-paper/60'}`}>{hint}</p>}
    </div>
  )
}
