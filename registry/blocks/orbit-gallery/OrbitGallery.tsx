/* eslint-disable react-hooks/immutability -- three.js materials, uniforms and meshes are mutated every frame by design */
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { gsap, prefersReducedMotion } from '@kit/lib/gsap'
import { getLenis } from '@kit/lib/lenis'
import { readToken, toRgb } from '@kit/lib/tokens'

export interface OrbitItem {
  id: string
  /** Image URL (portrait 3:4 works best) */
  src: string
  /** Shown while hovering; with the bottom caption, "Name — Category" sets the name in the sans and the rest in the display face */
  label?: string
  /** Items sharing a group light up together when `highlight` names it */
  group?: string
}

const CARD = 1.55
const LEAN = -0.16
const GOLDEN = Math.PI * (3 - Math.sqrt(5))

export type OrbitShape = 'spiral' | 'cone' | 'sphere' | 'ellipsoid' | 'torus' | 'globe'

interface Shape {
  /**
   * Where card `t` (0…count, flowing forward over time) sits and the outward direction it faces.
   * May also set `side`, the card's left-to-right direction; left at zero, cards stay upright.
   */
  place: (t: number, count: number, pos: THREE.Vector3, normal: THREE.Vector3, side: THREE.Vector3) => void
  /** Looping shapes are seamless; open ones fade cards out over this many cards at each end */
  fade: number
  /** Size to fit into the view, in world units; height 0 lets it run off the top and bottom */
  width: number
  height: number
  /** Base tilt towards the camera, radians */
  tilt: number
  card: number
  /** Turns by default instead of flowing: cards keep their spot and the whole shape turns about its axis, in radians per card of flow */
  spin?: number
  /** Cards always face the camera instead of facing outward */
  billboard?: boolean
  /** Opens by bursting out of the centre, gathering into one card, then spreading over the shape */
  intro?: boolean
  /** A card in the middle that cycles through every image */
  heart?: boolean
  /** Sideways lean, radians (default LEAN) */
  lean?: number
  /** How far the far side sinks into the background, 0–1 (default 0.78) */
  fog?: number
  /** Ripple and curl of the cards, 0–1 (default 1) */
  wobble?: number
  /** Sits on --color-paper instead of --color-ink */
  light?: boolean
}

// Fibonacci sphere: card t of count sits at an even-area height, turning by the golden angle,
// so cards cover the surface evenly while still flowing along one continuous path
function onSphere(t: number, count: number, out: THREE.Vector3) {
  const y = (2 * t) / count - 1
  const ring = Math.sqrt(Math.max(0, 1 - y * y))
  const a = t * GOLDEN
  return out.set(Math.sin(a) * ring, y, Math.cos(a) * ring)
}

const SHAPES: Record<OrbitShape, Shape> = {
  // A spiral staircase: upright cards facing outward on a vertical helix
  spiral: {
    place: (t, count, pos, normal) => {
      const a = (t * Math.PI * 2) / 9
      normal.set(Math.sin(a), 0, Math.cos(a))
      pos.set(normal.x * 3.4, (t - count / 2) * 0.42, normal.z * 3.4)
    },
    fade: 3,
    width: 9.2,
    height: 0,
    tilt: 0.12,
    card: 1,
  },
  // A vortex: the helix widens as it rises
  cone: {
    place: (t, count, pos, normal) => {
      const a = (t * Math.PI * 2) / 8
      const r = 1.3 + (t / count) * 3.4
      normal.set(Math.sin(a), 0, Math.cos(a))
      pos.set(normal.x * r, (t - count / 2) * 0.36, normal.z * r)
    },
    fade: 3,
    width: 11,
    height: 0,
    tilt: 0.22,
    card: 0.95,
  },
  sphere: {
    place: (t, count, pos, normal) => {
      onSphere(t, count, normal)
      pos.copy(normal).multiplyScalar(3.6)
    },
    fade: 1.5,
    width: 9.8,
    height: 9.8,
    tilt: 0.1,
    card: 0.95,
    spin: 0.55,
  },
  // A wide, flattened sphere; the normal of an ellipsoid is the direction divided by each radius
  ellipsoid: {
    place: (t, count, pos, normal) => {
      onSphere(t, count, pos)
      normal.set(pos.x / 5.2, pos.y / 2.6, pos.z / 3.4).normalize()
      pos.set(pos.x * 5.2, pos.y * 2.6, pos.z * 3.4)
    },
    fade: 1.5,
    width: 12.4,
    height: 7.8,
    tilt: 0.2,
    card: 0.9,
    spin: 0.5,
  },
  // A donut tilted towards you: cards wind round the tube while travelling round the ring, and it loops seamlessly
  torus: {
    place: (t, count, pos, normal, side) => {
      const winds = Math.max(2, Math.round(count / 8))
      const ring = (t / count) * Math.PI * 2
      const tube = ring * winds
      normal.set(Math.cos(tube) * Math.cos(ring), Math.sin(tube), Math.cos(tube) * Math.sin(ring))
      const r = 3.5 + Math.cos(tube) * 1.5
      pos.set(r * Math.cos(ring), Math.sin(tube) * 1.5, r * Math.sin(ring))
      // Along the ring, so cards roll over the top of the tube instead of flipping
      side.set(Math.sin(ring), 0, -Math.cos(ring))
    },
    fade: 0,
    width: 11.4,
    height: 9,
    tilt: 0.95,
    card: 0.72,
  },
  // Gionatan Nese's cloud: small cards hold their spot on a sphere that turns as one, always facing you,
  // with a slideshow card in the middle, on the light paper colour
  globe: {
    place: (t, count, pos, normal) => {
      onSphere(t, count, normal)
      pos.copy(normal).multiplyScalar(3.4)
    },
    fade: 1.5,
    width: 10.5,
    height: 10.5,
    tilt: 0.18,
    card: 0.5,
    spin: 0.6,
    billboard: true,
    intro: true,
    heart: true,
    lean: 0,
    fog: 0.2,
    wobble: 0,
    light: true,
  },
}

// Scratch objects reused every frame
const UP = new THREE.Vector3(0, 1, 0)
const _pos = new THREE.Vector3()
const _normal = new THREE.Vector3()
const _x = new THREE.Vector3()
const _y = new THREE.Vector3()
const _basis = new THREE.Matrix4()
const _quat = new THREE.Quaternion()
const _start = new THREE.Vector3()

// Size of the centre card (and of the stack the intro gathers into), relative to the other cards
const HEART = 1.25
// How long the centre card shows each image, seconds
const HEART_STEP = 0.55

const easeOut = (x: number) => 1 - (1 - x) ** 3
const easeOut4 = (x: number) => 1 - (1 - x) ** 4
const easeInOut = (x: number) => (x < 0.5 ? 4 * x ** 3 : 1 - (-2 * x + 2) ** 3 / 2)

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uBend;
  uniform float uPhase;
  uniform float uHover;
  uniform float uWobble;
  varying vec2 vUv;
  varying float vDepth;

  void main() {
    vUv = uv;
    vec3 p = position;
    float xn = uv.x * 2.0 - 1.0;
    // Cards curl with spin velocity, and ripple gently at rest
    p.z -= (1.0 - xn * xn) * uBend * uWobble;
    p.z += sin(uTime * 1.4 + uPhase + p.x * 3.0) * sin(uTime * 1.1 + uPhase + p.y * 3.0) * 0.04 * (1.0 - uHover) * uWobble;
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
  uniform float uFog;
  uniform vec3 uBg;
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
    // Cards on the far side of the shape sink into the background
    float fog = smoothstep(9.5, 15.5, vDepth);
    color = mix(color, uBg, fog * uFog);
    color = mix(uBg, color, uFade * uDim * uEdge);
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
  cards: OrbitItem[]
  shape: Shape
  /** Radians the shape turns per card of flow; 0 flows the cards along the path instead */
  turn: number
  background: string
  offsetX: number
  speed: number
  highlight: React.RefObject<string | null>
  onHover: (item: OrbitItem | null) => void
  onOpen?: (item: OrbitItem) => void
}

function Swirl({ cards, shape, turn, background, offsetX, speed, highlight, onHover, onOpen }: SwirlProps) {
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

  const shared = useMemo(
    () => ({ uTime: { value: 0 }, uBend: { value: 0 }, uFog: { value: 0.78 }, uWobble: { value: 1 }, uBg: { value: new THREE.Color() } }),
    [],
  )
  const heart = useRef<THREE.Mesh>(null)
  // Intro progress: burst out, gather into one card, spread over the shape (each 0→1)
  const intro = useRef({ active: false, started: false, burst: 0, gather: 0, spread: 0, tl: null as gsap.core.Timeline | null })

  useEffect(() => {
    const [r, g, b] = toRgb(background)
    shared.uBg.value.setRGB(r, g, b, THREE.SRGBColorSpace)
  }, [background, shared])

  // Play the intro whenever the gallery opens on (or switches to) a shape that has one
  useEffect(() => {
    const ip = intro.current
    ip.tl?.kill()
    Object.assign(ip, { active: !!shape.intro && !reduced, started: false, burst: 0, gather: 0, spread: 0, tl: null })
    return () => {
      ip.tl?.kill()
    }
  }, [shape, reduced])
  const geometry = useMemo(() => new THREE.PlaneGeometry(1, 4 / 3, 12, 8), [])

  const items = useMemo(() => {
    const rand = seeded(7)
    return Array.from({ length: COUNT }, (_, i) => ({
      card: cards[i],
      seq: i,
      push: 0,
      lastT: -1,
      phase: rand() * Math.PI * 2,
      // Where the card bursts to in the intro, and how far behind the others it moves
      scatter: new THREE.Vector3((rand() - 0.5) * 5.4, (rand() - 0.5) * 4, (rand() - 0.5) * 1.5),
      lag: rand() * 0.3,
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
            uFog: shared.uFog,
            uWobble: shared.uWobble,
            uBg: shared.uBg,
          },
        })
      }),
    [items, textures, shared],
  )

  // The centre card: its own copy of the material, so its image can change
  const heartMaterial = useMemo(() => {
    const mat = materials[0].clone()
    Object.assign(mat.uniforms, { uTime: shared.uTime, uBend: shared.uBend, uFog: shared.uFog, uWobble: shared.uWobble, uBg: shared.uBg })
    return mat
  }, [materials, shared])

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
    if (m.flying >= 0 || intro.current.active) return
    m.hovered = k
    onHover(k >= 0 ? items[k].card : null)
    // The custom cursor switches to its hover hand over role="button"
    if (k >= 0) gl.domElement.setAttribute('role', 'button')
    else gl.domElement.removeAttribute('role')
  }

  const open = (k: number) => {
    const m = motion.current
    if (m.moved > 6 || m.flying >= 0 || intro.current.active) return
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
    const ip = intro.current
    // Start the intro on the first frame actually drawn, so it isn't spent off screen
    if (ip.active && !ip.started) {
      ip.started = true
      ip.tl = gsap
        .timeline({ onComplete: () => (ip.active = false) })
        .to(ip, { burst: 1, duration: 1, ease: 'none' })
        .to(ip, { gather: 1, duration: 0.7, ease: 'none' }, 0.95)
        .to(ip, { spread: 1, duration: 1.6, ease: 'none' }, 1.9)
    }
    shared.uFog.value = shape.fog ?? 0.78
    shared.uWobble.value = shape.wobble ?? 1

    if (!reduced) {
      // Page scroll and dragging push the cards along the path (in cards per second)
      m.vel = clamp(m.vel + (getLenis()?.velocity ?? 0) * 0.0012, -6, 6)
      m.vel *= Math.pow(0.93, dt * 60)
      m.timeScale = damp(m.timeScale, m.hovered >= 0 || highlight.current ? 0.2 : 1, 4, dt)
      m.flow += (0.32 * speed + m.vel) * dt * m.timeScale
      shared.uTime.value += dt * m.timeScale
    }
    // Cards hug the cylinder at rest and bend further with speed
    shared.uBend.value = damp(shared.uBend.value, clamp(-0.1 - m.vel * 0.05, -0.35, 0.2), 6, dt)

    // Lean the shape a little and let the pointer tilt it, so you can look around
    group.current.rotation.x = damp(group.current.rotation.x, shape.tilt - state.pointer.y * 0.12, 3, dt)
    group.current.rotation.y = damp(group.current.rotation.y, state.pointer.x * 0.25, 3, dt)
    group.current.rotation.z = shape.lean ?? LEAN
    const spin = turn ? m.flow * turn : 0
    const size = CARD * shape.card

    meshes.current.forEach((mesh, k) => {
      const mat = materials[k]
      const item = items[k]
      const isHovered = k === m.hovered
      // Highlighting a group dims every other card
      const lit = !highlight.current || item.card.group === highlight.current
      mat.uniforms.uHover.value = damp(mat.uniforms.uHover.value, isHovered ? 1 : 0, 8, dt)
      mat.uniforms.uDim.value = damp(mat.uniforms.uDim.value, lit ? 1 : 0.18, 6, dt)
      if (k === m.flying) return

      // Position along the shape's (periodic) path, flowing forward over time; turning holds each card
      // half a step in from the ends (so none sits on a pole) and turns the whole shape instead
      const t = turn ? item.seq + 0.5 : (((item.seq + m.flow) % COUNT) + COUNT) % COUNT
      _x.set(0, 0, 0)
      shape.place(t, COUNT, _pos, _normal, _x)
      if (turn) {
        _pos.applyAxisAngle(UP, spin)
        _normal.applyAxisAngle(UP, spin)
        _x.applyAxisAngle(UP, spin)
      }
      item.push = damp(item.push, isHovered ? 0.7 : 0, 8, dt)
      _pos.addScaledVector(_normal, item.push)
      if (shape.billboard) {
        // Cancel the group's rotation so the card faces the camera
        _quat.copy(group.current.quaternion).invert()
      } else {
        // Face outward; unless the shape says otherwise, x runs along the horizon so cards stay upright
        if (_x.lengthSq() === 0) _x.crossVectors(UP, _normal)
        if (_x.lengthSq() < 1e-6) _x.set(1, 0, 0)
        _x.normalize()
        _y.crossVectors(_normal, _x)
        _quat.setFromRotationMatrix(_basis.makeBasis(_x, _y, _normal))
      }

      // Flowing open shapes fade out at both ends so the wrap is invisible; turning never wraps
      mat.uniforms.uEdge.value = shape.fade && !turn ? THREE.MathUtils.smoothstep(COUNT / 2 - Math.abs(t - COUNT / 2), 0, shape.fade) : 1

      if (ip.active) {
        // Out to a scattered spot as a tiny thumbnail, back into one stack in the middle, then out to the shape
        const local = (v: number) => clamp((v - item.lag) / 0.7, 0, 1)
        const gather = easeInOut(ip.gather)
        const spread = easeOut4(local(ip.spread))
        _start.copy(item.scatter).multiplyScalar(easeOut(local(ip.burst)) * (1 - gather))
        // A hair apart in depth, so the stack doesn't flicker
        _start.z += k * 0.002
        mesh.position.lerpVectors(_start, _pos, spread)
        mesh.quaternion.copy(_quat)
        const stacked = THREE.MathUtils.lerp(0.35 * Math.min(1, ip.burst * 5), HEART, gather)
        const s = size * THREE.MathUtils.lerp(stacked, 1, spread)
        mesh.scale.set(s, s, 1)
        item.lastT = t
        return
      }

      // Ease towards the spot, so switching shapes morphs; snap when a card wraps from one end to the other
      const wrapped = item.lastT < 0 || Math.abs(t - item.lastT) > COUNT / 2
      item.lastT = t
      if (wrapped) {
        mesh.position.copy(_pos)
        mesh.quaternion.copy(_quat)
      } else {
        const k = 1 - Math.exp(-10 * dt)
        mesh.position.lerp(_pos, k)
        mesh.quaternion.slerp(_quat, k)
      }
      const boost = isHovered ? 1.12 : highlight.current && lit ? 1.05 : 1
      const s = damp(mesh.scale.x, size * boost, 8, dt)
      mesh.scale.set(s, s, 1)
    })

    // The centre card steps through every image and grows in as the intro gathers
    const h = heart.current
    if (h) {
      h.visible = !!shape.heart
      if (shape.heart) {
        heartMaterial.uniforms.uMap.value = textures[Math.floor(shared.uTime.value / HEART_STEP) % COUNT]
        heartMaterial.uniforms.uFade.value = damp(heartMaterial.uniforms.uFade.value, m.flying >= 0 ? 0 : 1, 8, dt)
        h.quaternion.copy(group.current.quaternion).invert()
        const s = size * HEART * (ip.active ? easeInOut(ip.gather) : 1)
        h.scale.set(s, s, 1)
      }
    }
  })

  // Fit the shape (plus a card's margin) into the container
  const fit = Math.min(viewport.width / shape.width, viewport.height / shape.height, 1.05)
  const offset = viewport.width * offsetX

  return (
    <group ref={group} scale={fit} position={[offset, 0, 0]}>
      <mesh ref={heart} geometry={geometry} material={heartMaterial} raycast={() => null} />
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

export interface OrbitGalleryProps {
  items: OrbitItem[]
  /** What the cards flow over: a spiral staircase, a widening cone, a sphere, a flattened ellipsoid or a torus */
  shape?: OrbitShape
  /** Called after a clicked card has flown to the camera */
  onOpen?: (item: OrbitItem) => void
  /** Group whose cards stay lit while the rest dim */
  highlight?: string | null
  /** Shift the gallery sideways, as a fraction of the container width (e.g. 0.14 to make room for text) */
  offsetX?: number
  /** Flow speed multiplier */
  speed?: number
  /**
   * `flow` moves the cards along the shape's path; `turn` holds them in place and turns the whole shape.
   * Defaults to turn for the sphere, ellipsoid and globe, and flow for the spiral, cone and torus
   */
  motion?: 'flow' | 'turn'
  paused?: boolean
  hint?: string | null
  /** Where the hovered card's label shows: a pill trailing the cursor, or a two-face caption at the bottom (the globe's default) */
  caption?: 'cursor' | 'bottom'
  className?: string
  /** Canvas colour; defaults to the theme's --color-ink, or --color-paper for the globe */
  background?: string
}

export default function OrbitGallery({
  items,
  shape = 'spiral',
  onOpen,
  highlight = null,
  offsetX = 0,
  speed = 1,
  motion,
  paused = false,
  hint = 'Drag to spin · Click a card',
  caption,
  className = '',
  background,
}: OrbitGalleryProps) {
  const light = SHAPES[shape].light
  const turn = (motion ?? (SHAPES[shape].spin ? 'turn' : 'flow')) === 'turn' ? (SHAPES[shape].spin ?? 0.3) : 0
  const where = caption ?? (light ? 'bottom' : 'cursor')
  const wrap = useRef<HTMLDivElement>(null)
  const label = useRef<HTMLDivElement>(null)
  const pill = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = useState<OrbitItem | null>(null)
  const [lastHovered, setLastHovered] = useState<OrbitItem | null>(null)
  const [visible, setVisible] = useState(true)
  const [bg, setBg] = useState(background ?? '#0c0c0c')
  const highlightRef = useRef<string | null>(highlight)

  useEffect(() => {
    highlightRef.current = highlight
  }, [highlight])

  useEffect(() => {
    setBg(background ?? (light ? readToken('--color-paper', '#ffffff', wrap.current!) : readToken('--color-ink', '#0c0c0c', wrap.current!)))
  }, [background, light])
  // Text over the canvas follows how light the background is
  const [r, g, b] = toRgb(bg)
  const onLight = 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.5
  const [name, ...rest] = (lastHovered?.label ?? '').split(' — ')

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

  const onHover = (item: OrbitItem | null) => {
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
            shape={SHAPES[shape]}
            turn={turn}
            background={bg}
            offsetX={offsetX}
            speed={speed}
            highlight={highlightRef}
            onHover={onHover}
            onOpen={onOpen}
          />
        </Suspense>
      </Canvas>

      <div ref={label} className="pointer-events-none absolute top-0 left-0 z-10">
        {where === 'cursor' && (
          <div
            ref={pill}
            style={{ translate: '48px 36px' }}
            className={`caption rounded-full bg-accent px-3 py-1.5 whitespace-nowrap text-ink transition-[opacity,scale] duration-300 ease-out-expo ${
              hovered && lastHovered?.label ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
            }`}
          >
            {lastHovered?.label}
          </div>
        )}
      </div>

      {where === 'bottom' && (
        // Rises out of a mask at the bottom centre: the name in the sans, the rest in the display face
        <div className="pointer-events-none absolute inset-x-0 bottom-5 z-10 flex justify-center overflow-hidden px-4">
          <p
            className={`flex gap-[0.4em] text-[15px] leading-[1.4] whitespace-nowrap transition-[translate,opacity] duration-500 ease-out-expo ${onLight ? 'text-ink' : 'text-paper'} ${
              hovered && lastHovered?.label ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
            }`}
          >
            <span className="font-sans font-medium">{name}</span>
            {rest.length > 0 && <span className="font-display">{rest.join(' — ')}</span>}
          </p>
        </div>
      )}

      {hint && (
        <p className={`caption pointer-events-none absolute right-4 z-10 ${where === 'bottom' ? 'top-4' : 'bottom-4'} ${onLight ? 'text-ink/50' : 'text-paper/60'}`}>
          {hint}
        </p>
      )}
    </div>
  )
}
