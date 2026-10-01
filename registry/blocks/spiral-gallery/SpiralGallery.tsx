/* eslint-disable react-hooks/immutability -- three.js materials, uniforms and meshes are mutated every frame by design */
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { gsap, prefersReducedMotion } from '@kit/lib/gsap'
import { getLenis } from '@kit/lib/lenis'
import { readToken } from '@kit/lib/tokens'

export interface SpiralItem {
  id: string
  /** Image URL (portrait 3:4 works best) */
  src: string
  /** Shown in the pill while hovering */
  label?: string
  /** Items sharing a group light up together when `highlight` names it */
  group?: string
}

// A spiral staircase of cards: upright, facing outward on a vertical helix.
// The helix is periodic, so cards can flow up it forever and wrap back to the bottom.
const PER_TURN = 9
const STEP = (Math.PI * 2) / PER_TURN
const RISE = 0.42
const RADIUS = 3.4
const CARD = 1.55
const LEAN = -0.16
const BASE_TILT_X = 0.12

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uBend;
  uniform float uPhase;
  uniform float uHover;
  varying vec2 vUv;
  varying float vDepth;

  void main() {
    vUv = uv;
    vec3 p = position;
    float xn = uv.x * 2.0 - 1.0;
    // Cards curl with spin velocity, and ripple gently at rest
    p.z -= (1.0 - xn * xn) * uBend;
    p.z += sin(uTime * 1.4 + uPhase + p.x * 3.0) * sin(uTime * 1.1 + uPhase + p.y * 3.0) * 0.04 * (1.0 - uHover);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`

const fragmentShader = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uFade;
  uniform float uDim;
  uniform float uEdge;
  varying vec2 vUv;
  varying float vDepth;

  void main() {
    // Rounded corners
    vec2 p = (vUv - 0.5) * vec2(1.0, 1.3333);
    vec2 b = vec2(0.5, 0.6667) - 0.035;
    if (length(max(abs(p) - b, 0.0)) > 0.035) discard;

    vec3 color = texture2D(uMap, vUv).rgb;
    // Backs of the far cards would show the image mirrored, so render them as dark, muted shadows
    if (!gl_FrontFacing) color = mix(vec3(dot(color, vec3(0.299, 0.587, 0.114))), color, 0.3) * 0.28;
    // Cards on the far side of the spiral sink into the dark
    float fog = smoothstep(9.5, 15.5, vDepth);
    color = mix(color, vec3(0.004), fog * 0.78);
    color = mix(vec3(0.004), color, uFade * uDim * uEdge);
    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`

// Deterministic randomness so the layout is the same on every visit
function seeded(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))
const damp = THREE.MathUtils.damp

interface SwirlProps {
  cards: SpiralItem[]
  offsetX: number
  speed: number
  highlight: React.RefObject<string | null>
  onHover: (item: SpiralItem | null) => void
  onOpen?: (item: SpiralItem) => void
}

function Swirl({ cards, offsetX, speed, highlight, onHover, onOpen }: SwirlProps) {
  const COUNT = cards.length
  const textures = useLoader(
    THREE.TextureLoader,
    cards.map(card => card.src),
  )
  const { viewport, gl } = useThree()
  const group = useRef<THREE.Group>(null!)
  const meshes = useRef<THREE.Mesh[]>([])
  const motion = useRef({ flow: 0, vel: 0, timeScale: 1, hovered: -1, flying: -1, dragging: false, lastX: 0, moved: 0 })
  const reduced = useMemo(() => prefersReducedMotion(), [])

  const shared = useMemo(() => ({ uTime: { value: 0 }, uBend: { value: 0 } }), [])
  const geometry = useMemo(() => new THREE.PlaneGeometry(1, 4 / 3, 12, 8), [])

  const items = useMemo(() => {
    const rand = seeded(7)
    return Array.from({ length: COUNT }, (_, i) => ({
      card: cards[i],
      seq: i,
      push: 0,
      phase: rand() * Math.PI * 2,
    }))
  }, [COUNT, cards])

  const materials = useMemo(
    () =>
      items.map((item, i) => {
        const map = textures[i]
        map.colorSpace = THREE.SRGBColorSpace
        map.anisotropy = 4
        return new THREE.ShaderMaterial({
          vertexShader,
          fragmentShader,
          // Cards on the far side face away, but should still show (dimmed) through the gaps
          side: THREE.DoubleSide,
          uniforms: {
            uMap: { value: map },
            uFade: { value: 1 },
            uDim: { value: 1 },
            uEdge: { value: 1 },
            uHover: { value: 0 },
            uPhase: { value: item.phase },
            uTime: shared.uTime,
            uBend: shared.uBend,
          },
        })
      }),
    [items, textures, shared],
  )

  // Drag to spin (horizontal), leaving vertical touch scrolling to the page
  useEffect(() => {
    const el = gl.domElement
    const m = motion.current
    const down = (e: PointerEvent) => {
      m.dragging = true
      m.lastX = e.clientX
      m.moved = 0
    }
    const move = (e: PointerEvent) => {
      if (!m.dragging) return
      const dx = e.clientX - m.lastX
      m.lastX = e.clientX
      m.moved += Math.abs(dx)
      m.vel = clamp(m.vel + dx * 0.012, -6, 6)
    }
    const up = () => (m.dragging = false)
    el.addEventListener('pointerdown', down)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    return () => {
      el.removeEventListener('pointerdown', down)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
  }, [gl])

  const setHovered = (k: number) => {
    const m = motion.current
    if (m.flying >= 0) return
    m.hovered = k
    onHover(k >= 0 ? items[k].card : null)
    // The custom cursor switches to its hover hand over role="button"
    if (k >= 0) gl.domElement.setAttribute('role', 'button')
    else gl.domElement.removeAttribute('role')
  }

  const open = (k: number) => {
    const m = motion.current
    if (m.moved > 6 || m.flying >= 0) return
    const mesh = meshes.current[k]
    const card = items[k].card
    m.flying = k
    onHover(null)
    // Fly the card to the camera while the rest fade out, then hand over to onOpen
    const tl = gsap.timeline({
      onComplete: () => {
        onOpen?.(card)
        gsap.delayedCall(0.9, () => {
          m.flying = -1
          m.hovered = -1
          mesh.rotation.set(0, 0, 0)
          materials.forEach(mat => (mat.uniforms.uFade.value = 1))
        })
      },
    })
    // Target a point straight in front of the camera, expressed in the tilted group's space,
    // and a rotation that cancels the group's tilt so the card faces the viewer
    const g = group.current
    const target = g.worldToLocal(new THREE.Vector3(0, 0, 7))
    const fromQ = mesh.quaternion.clone()
    const toQ = g.quaternion.clone().invert()
    // Card fills ~70% of the view height at 5 units from the camera (fov 40)
    const scale = (0.7 * 2 * 5 * Math.tan(THREE.MathUtils.degToRad(20))) / ((4 / 3) * g.scale.x)
    const progress = { t: 0 }
    tl.to(mesh.position, { x: target.x, y: target.y, z: target.z, duration: 0.7, ease: 'power3.inOut' }, 0)
      .to(progress, {
        t: 1,
        duration: 0.7,
        ease: 'power3.inOut',
        onUpdate: () => mesh.quaternion.slerpQuaternions(fromQ, toQ, progress.t),
      }, 0)
      .to(mesh.scale, { x: scale, y: scale, duration: 0.7, ease: 'power3.inOut' }, 0)
    materials.forEach((mat, i) => {
      if (i !== k) tl.to(mat.uniforms.uFade, { value: 0, duration: 0.5, ease: 'power2.out' }, 0)
    })
  }

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 30)
    const m = motion.current

    if (!reduced) {
      // Page scroll and dragging push the cards along the spiral (in cards per second)
      m.vel = clamp(m.vel + (getLenis()?.velocity ?? 0) * 0.0012, -6, 6)
      m.vel *= Math.pow(0.93, dt * 60)
      m.timeScale = damp(m.timeScale, m.hovered >= 0 || highlight.current ? 0.2 : 1, 4, dt)
      m.flow += (0.32 * speed + m.vel) * dt * m.timeScale
      shared.uTime.value += dt * m.timeScale
    }
    // Cards hug the cylinder at rest and bend further with speed
    shared.uBend.value = damp(shared.uBend.value, clamp(-0.1 - m.vel * 0.05, -0.35, 0.2), 6, dt)

    // Lean the spiral a little and let the pointer tilt it, so you can look around
    group.current.rotation.x = damp(group.current.rotation.x, BASE_TILT_X - state.pointer.y * 0.12, 3, dt)
    group.current.rotation.y = damp(group.current.rotation.y, state.pointer.x * 0.25, 3, dt)
    group.current.rotation.z = LEAN

    meshes.current.forEach((mesh, k) => {
      const mat = materials[k]
      const item = items[k]
      const isHovered = k === m.hovered
      // Highlighting a group dims every other card
      const lit = !highlight.current || item.card.group === highlight.current
      mat.uniforms.uHover.value = damp(mat.uniforms.uHover.value, isHovered ? 1 : 0, 8, dt)
      mat.uniforms.uDim.value = damp(mat.uniforms.uDim.value, lit ? 1 : 0.18, 6, dt)
      if (k === m.flying) return

      // Position along the (periodic) helix, flowing upward over time
      const t = (((item.seq + m.flow) % COUNT) + COUNT) % COUNT
      const a = t * STEP
      item.push = damp(item.push, isHovered ? 0.7 : 0, 8, dt)
      const r = RADIUS + item.push
      mesh.position.set(Math.sin(a) * r, (t - COUNT / 2) * RISE, Math.cos(a) * r)
      mesh.rotation.set(0, a, 0)
      // Fade out at both ends so the wrap from top to bottom is invisible
      mat.uniforms.uEdge.value = THREE.MathUtils.smoothstep(COUNT / 2 - Math.abs(t - COUNT / 2), 0, 3)
      const boost = isHovered ? 1.12 : highlight.current && lit ? 1.05 : 1
      const s = damp(mesh.scale.x, CARD * boost, 8, dt)
      mesh.scale.set(s, s, 1)
    })
  })

  // Fit the spiral's width (2 × radius + a card) into the container
  const fit = Math.min(viewport.width / 9.2, 1.05)
  const offset = viewport.width * offsetX

  return (
    <group ref={group} scale={fit} position={[offset, 0, 0]}>
      {items.map((_, k) => (
        <mesh
          key={k}
          ref={el => {
            if (el) meshes.current[k] = el
          }}
          geometry={geometry}
          material={materials[k]}
          onPointerOver={e => {
            e.stopPropagation()
            setHovered(k)
          }}
          onPointerOut={() => {
            if (motion.current.hovered === k) setHovered(-1)
          }}
          onClick={e => {
            e.stopPropagation()
            open(k)
          }}
        />
      ))}
    </group>
  )
}

export interface SpiralGalleryProps {
  items: SpiralItem[]
  /** Called after a clicked card has flown to the camera */
  onOpen?: (item: SpiralItem) => void
  /** Group whose cards stay lit while the rest dim */
  highlight?: string | null
  /** Shift the spiral sideways, as a fraction of the container width (e.g. 0.14 to make room for text) */
  offsetX?: number
  /** Flow speed multiplier */
  speed?: number
  paused?: boolean
  hint?: string | null
  className?: string
  /** Canvas colour; defaults to the theme's --color-ink */
  background?: string
}

export default function SpiralGallery({
  items,
  onOpen,
  highlight = null,
  offsetX = 0,
  speed = 1,
  paused = false,
  hint = 'Drag to spin · Click a card',
  className = '',
  background,
}: SpiralGalleryProps) {
  const wrap = useRef<HTMLDivElement>(null)
  const label = useRef<HTMLDivElement>(null)
  const pill = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = useState<SpiralItem | null>(null)
  const [lastHovered, setLastHovered] = useState<SpiralItem | null>(null)
  const [visible, setVisible] = useState(true)
  const [bg, setBg] = useState(background ?? '#0c0c0c')
  const highlightRef = useRef<string | null>(highlight)

  useEffect(() => {
    highlightRef.current = highlight
  }, [highlight])

  useEffect(() => {
    setBg(background ?? readToken('--color-ink', '#0c0c0c', wrap.current!))
  }, [background])

  // Only render while on screen
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting))
    observer.observe(wrap.current!)
    return () => observer.disconnect()
  }, [])

  // Label trails the pointer
  useEffect(() => {
    const el = wrap.current!
    const xTo = gsap.quickTo(label.current, 'x', { duration: 0.4, ease: 'power3' })
    const yTo = gsap.quickTo(label.current, 'y', { duration: 0.4, ease: 'power3' })
    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      const x = e.clientX - rect.left
      xTo(x)
      yTo(e.clientY - rect.top)
      // Flip the label to the left of the cursor near the right edge
      if (pill.current) pill.current.style.translate = x > rect.width - 380 ? 'calc(-100% - 12px) 36px' : '48px 36px'
    }
    el.addEventListener('pointermove', onMove)
    return () => el.removeEventListener('pointermove', onMove)
  }, [])

  const onHover = (item: SpiralItem | null) => {
    setHovered(item)
    if (item) setLastHovered(item)
  }

  return (
    <div ref={wrap} className={`relative overflow-hidden ${className}`} style={{ background: bg }}>
      <Canvas
        flat
        frameloop={visible && !paused ? 'always' : 'never'}
        dpr={[1, 1.75]}
        camera={{ fov: 40, position: [0, 0, 12] }}
        style={{ touchAction: 'pan-y' }}
      >
        <color attach="background" args={[bg]} />
        <Suspense fallback={null}>
          <Swirl
            key={items.map(i => i.id).join()}
            cards={items}
            offsetX={offsetX}
            speed={speed}
            highlight={highlightRef}
            onHover={onHover}
            onOpen={onOpen}
          />
        </Suspense>
      </Canvas>

      <div ref={label} className="pointer-events-none absolute top-0 left-0 z-10">
        <div
          ref={pill}
          style={{ translate: '48px 36px' }}
          className={`caption rounded-full bg-accent px-3 py-1.5 whitespace-nowrap text-ink transition-[opacity,scale] duration-300 ease-out-expo ${
            hovered && lastHovered?.label ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
          }`}
        >
          {lastHovered?.label}
        </div>
      </div>

      {hint && <p className="caption pointer-events-none absolute right-4 bottom-4 z-10 text-paper/60">{hint}</p>}
    </div>
  )
}
