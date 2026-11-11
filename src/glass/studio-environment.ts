import { Color, DataTexture, DataUtils, EquirectangularReflectionMapping, HalfFloatType, LinearFilter, RGBAFormat } from 'three'

/**
 * A procedural HDR "photo studio" as an equirectangular texture.
 *
 * Glass is mostly what it reflects and refracts, so the user's light has to live
 * *in the environment* (a bright coloured soft box), not only as a scene light.
 * An equirect DataTexture (rather than RoomEnvironment's PMREM target) is used
 * because the path tracer can importance-sample it directly, so the live view and
 * the "Render" view see exactly the same studio.
 */

export type Backdrop = 'midnight' | 'studio' | 'daylight' | 'sunset' | 'aurora' | 'neon' | 'photo'

/** Backdrops a share link can carry (a photo stays on the visitor's device). */
export const shareableBackdrops: Backdrop[] = ['midnight', 'studio', 'daylight', 'sunset', 'aurora', 'neon']

export interface StudioLight {
  color: string
  /** 0 – 10, roughly "stops" of brightness for the coloured soft box. */
  intensity: number
  /** Degrees around the vertical axis; 0 = behind the camera, lighting the front. */
  azimuth: number
  /** Degrees above the horizon. */
  elevation: number
}

interface BackdropPalette {
  top: [number, number, number]
  horizon: [number, number, number]
  floor: [number, number, number]
  /** Neutral key/rim soft boxes, as a fraction of their full brightness. */
  softboxes: number
  /** Wide glow on the backdrop behind the text: what the glass refracts. */
  backGlow: [number, number, number]
  /** Scene-specific shapes painted into the sky (sun, aurora curtains, neon tubes). */
  extras?: () => SoftBox[]
  /** How strongly the user's light tints the backdrop glow (default 1). */
  gel?: number
  /** Extra radiance painted per sky direction (aurora). */
  paint?: (d: [number, number, number]) => [number, number, number] | null
  /** Skip the thin white backlight strips (they would fight the scene's own shapes). */
  noStrips?: boolean
}

export const backdropPalettes: Record<Backdrop, BackdropPalette> = {
  midnight: { top: [0.012, 0.016, 0.04], horizon: [0.03, 0.04, 0.08], floor: [0.006, 0.007, 0.012], softboxes: 0.8, backGlow: [0.05, 0.09, 0.24] },
  studio: { top: [0.06, 0.06, 0.065], horizon: [0.14, 0.14, 0.15], floor: [0.03, 0.03, 0.032], softboxes: 1, backGlow: [0.22, 0.22, 0.24] },
  daylight: { top: [0.55, 0.62, 0.75], horizon: [0.9, 0.9, 0.92], floor: [0.35, 0.34, 0.33], softboxes: 1.2, backGlow: [0.5, 0.5, 0.52] },
  sunset: {
    top: [0.012, 0.014, 0.06],
    horizon: [0.32, 0.085, 0.035],
    floor: [0.03, 0.014, 0.012],
    softboxes: 0.55,
    backGlow: [0.22, 0.06, 0.03],
    noStrips: true,
    extras: () => [
      { dir: behind(-11, 2.5), radius: 0.022, rgb: [9, 4, 1.4] }, // low sun, refracted through the letters
      { dir: behind(-11, 2.5), radius: 0.08, rgb: [0.45, 0.14, 0.04] }, // its halo
      { dir: behind(8, 12), radius: 0.7, rgb: [0.12, 0.025, 0.09], tall: 0.18 }, // pink band above the horizon
    ],
  },
  aurora: {
    top: [0.004, 0.008, 0.025],
    horizon: [0.015, 0.035, 0.05],
    floor: [0.003, 0.005, 0.008],
    softboxes: 0.45,
    backGlow: [0.01, 0.07, 0.06],
    noStrips: true,
    gel: 0.25,
    paint: auroraSky,
    extras: () => [
      ...stars(140, 7),
    ],
  },
  neon: {
    top: [0.008, 0.004, 0.018],
    horizon: [0.05, 0.02, 0.07],
    floor: [0.008, 0.004, 0.012],
    softboxes: 0.4,
    backGlow: [0.12, 0.025, 0.16],
    noStrips: true,
    extras: () => [
      { dir: behind(-20, 6), radius: 0.008, rgb: [6, 0.4, 4.5], tall: 18 }, // magenta tube
      { dir: behind(-7, 6), radius: 0.006, rgb: [0.3, 3.5, 6], tall: 22 }, // cyan tube
      { dir: behind(12, 6), radius: 0.008, rgb: [6, 1.2, 0.3], tall: 16 }, // amber tube
      { dir: behind(26, 6), radius: 0.006, rgb: [0.5, 1.5, 6], tall: 20 }, // blue tube
      ...bokeh(46, 11),
    ],
  },
  photo: { top: [0.02, 0.02, 0.025], horizon: [0.06, 0.06, 0.065], floor: [0.015, 0.015, 0.017], softboxes: 1, backGlow: [0.1, 0.1, 0.11] },
}

/** Small deterministic random generator, so every visitor sees the same sky. */
function seeded(seed: number) {
  let t = seed
  return () => {
    t = (t * 1664525 + 1013904223) % 4294967296
    return t / 4294967296
  }
}

function stars(count: number, seed: number): SoftBox[] {
  const rand = seeded(seed)
  return Array.from({ length: count }, () => {
    const k = 0.6 + rand() * 1.8
    return { dir: behind(rand() * 200 - 100, 8 + rand() * 70), radius: 0.003 + rand() * 0.003, rgb: [k, k, k * 1.1] as [number, number, number] }
  })
}

/**
 * Aurora curtains: a wavy band with a bright lower edge fading upward, rippled into
 * folds, green at the base and violet higher up. Evaluated per sky direction.
 */
function auroraSky(d: [number, number, number]): [number, number, number] | null {
  if (d[2] > 0.2) return null // only the half of the sky behind the text
  const az = Math.atan2(d[0], -d[2]) // 0 = straight behind the text
  const el = Math.asin(Math.max(-1, Math.min(1, d[1])))
  const base = (2.5 + 3 * Math.sin(az * 2.3 + 0.6) + 1.5 * Math.sin(az * 6.1)) * DEG
  const above = el - base
  if (above < -0.06 || above > 0.9) return null
  const rise = above < 0 ? Math.exp(above / 0.012) : Math.exp(-above / 0.14)
  const folds = 0.35 + 0.65 * Math.pow(Math.sin(az * 34 + Math.sin(az * 71) * 1.2) * 0.5 + 0.5, 2)
  const fade = Math.max(0, 1 - Math.abs(az) / 1.5) // dies out toward the sides
  const k = rise * folds * fade * 0.9
  if (k < 1e-4) return null
  const v = Math.min(1, Math.max(0, above / 0.35))
  return [k * (0.06 + 0.4 * v), k * (0.85 - 0.6 * v), k * (0.4 + 0.25 * v)]
}

/** Out-of-focus city lights behind the text. */
function bokeh(count: number, seed: number): SoftBox[] {
  const rand = seeded(seed)
  const colours: [number, number, number][] = [[1, 0.2, 0.7], [0.2, 0.8, 1], [1, 0.6, 0.15], [0.5, 0.3, 1]]
  return Array.from({ length: count }, () => {
    const c = colours[Math.floor(rand() * colours.length)]
    const k = 0.5 + rand() * 1.3
    return { dir: behind(rand() * 120 - 60, -4 + rand() * 22), radius: 0.015 + rand() * 0.03, rgb: [c[0] * k, c[1] * k, c[2] * k] as [number, number, number] }
  })
}

const WIDTH = 1024
const HEIGHT = 512
const DEG = Math.PI / 180

/** Unit direction for an azimuth/elevation pair, in three.js world space (+z toward the default camera). */
export function lightDirection(azimuthDeg: number, elevationDeg: number): [number, number, number] {
  const az = azimuthDeg * DEG
  const el = elevationDeg * DEG
  return [Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el)]
}

interface SoftBox {
  dir: [number, number, number]
  /** Angular radius in radians. */
  radius: number
  rgb: [number, number, number]
  /** Stretch along the vertical axis (>1 gives a tall strip light). */
  tall?: number
}

/** Smooth-edged disc (true angular distance) or vertical strip, evaluated for direction `d`. */
function softBoxWeight(d: [number, number, number], box: SoftBox) {
  const [bx, by, bz] = box.dir
  let dist: number
  if (!box.tall || box.tall === 1) {
    dist = Math.acos(Math.max(-1, Math.min(1, d[0] * bx + d[1] * by + d[2] * bz)))
  } else {
    // Strips: horizontal angle (scaled by cos(elevation)) and vertical angle measured separately.
    const dh = Math.atan2(d[0] * bz - d[2] * bx, d[0] * bx + d[2] * bz) * Math.hypot(d[0], d[2])
    const dv = (Math.asin(Math.max(-1, Math.min(1, d[1]))) - Math.asin(Math.max(-1, Math.min(1, by)))) / box.tall
    dist = Math.hypot(dh, dv)
  }
  const edge = box.radius * 0.35
  if (dist > box.radius + edge) return 0
  const t = Math.min(1, Math.max(0, (box.radius + edge - dist) / (2 * edge)))
  return t * t * (3 - 2 * t)
}

/** Direction behind the text (the camera looks toward -z) offset by `deg` to the right. */
function behind(deg: number, elevation: number): [number, number, number] {
  const a = (deg * Math.PI) / 180
  const e = (elevation * Math.PI) / 180
  return [Math.sin(a) * Math.cos(e), Math.sin(e), -Math.cos(a) * Math.cos(e)]
}

function lerp3(a: [number, number, number], b: [number, number, number], t: number): [number, number, number] {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
}

function staticBoxes(backdrop: Backdrop): SoftBox[] {
  const palette = backdropPalettes[backdrop]
  const s = palette.softboxes
  const white = (k: number): [number, number, number] => [k * s, k * s, k * s * 1.03]
  return [
    // large overhead key, slightly front-left
    { dir: normalize([-0.45, 0.85, 0.35]), radius: 0.35, rgb: white(3) },
    // tall rim strip behind-right: draws the bright edge line down glass letters
    { dir: normalize([0.85, 0.15, -0.5]), radius: 0.1, rgb: white(2.4), tall: 4 },
    // faint fill strip front-left at eye level
    { dir: normalize([-0.9, 0.05, 0.4]), radius: 0.08, rgb: white(0.9), tall: 3.5 },
    // thin vertical strips right behind the text: refracted into bright lines through the letters
    { dir: behind(-9, 4), radius: 0.0045, rgb: white(1.6), tall: 34 },
    { dir: behind(-2, 4), radius: 0.0022, rgb: white(1.1), tall: 50 },
    { dir: behind(10, 4), radius: 0.006, rgb: white(1.9), tall: 28 },
  ].filter((box) => !palette.noStrips || !box.tall || box.tall < 20).concat(palette.extras?.() ?? [])
}

function addBoxes(data: Float32Array, width: number, height: number, boxes: SoftBox[]) {
  // Vertical extent of each box, so rows it cannot touch are skipped.
  const extents = boxes.map((box) => {
    const el = Math.asin(Math.max(-1, Math.min(1, box.dir[1])))
    const reach = box.radius * 1.35 * Math.max(1, box.tall ?? 1) + 0.01
    return [el - reach, el + reach] as const
  })
  for (let y = 0; y < height; y++) {
    const theta = ((y + 0.5) / height - 0.5) * Math.PI
    const rowBoxes = boxes.filter((_, k) => theta >= extents[k][0] && theta <= extents[k][1])
    if (rowBoxes.length === 0) continue
    const sinT = Math.sin(theta)
    const cosT = Math.cos(theta)
    for (let x = 0; x < width; x++) {
      const phi = ((x + 0.5) / width - 0.5) * 2 * Math.PI
      const d: [number, number, number] = [cosT * Math.cos(phi), sinT, cosT * Math.sin(phi)]
      const i = (y * width + x) * 4
      for (const box of rowBoxes) {
        const w = softBoxWeight(d, box)
        if (w > 0) {
          data[i] += box.rgb[0] * w
          data[i + 1] += box.rgb[1] * w
          data[i + 2] += box.rgb[2] * w
        }
      }
    }
  }
}

/** Everything except the user's light depends only on the backdrop, so it is built once and reused. */
const staticCache = new Map<string, Float32Array>()
function staticRadiance(backdrop: Backdrop, width: number, height: number) {
  const key = `${backdrop}:${width}x${height}`
  const cached = staticCache.get(key)
  if (cached) return cached
  const palette = backdropPalettes[backdrop]
  const data = new Float32Array(width * height * 4)
  for (let y = 0; y < height; y++) {
    // three's equirect convention: v = asin(dir.y) / PI + 0.5, row 0 = straight down
    const sinT = Math.sin(((y + 0.5) / height - 0.5) * Math.PI)
    const base =
      sinT >= 0 ? lerp3(palette.horizon, palette.top, Math.pow(sinT, 0.6)) : lerp3(palette.horizon, palette.floor, Math.pow(-sinT, 0.35))
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4
      data[i] = base[0]
      data[i + 1] = base[1]
      data[i + 2] = base[2]
      data[i + 3] = 1
    }
  }
  const paint = palette.paint
  if (paint) {
    for (let y = 0; y < height; y++) {
      const theta = ((y + 0.5) / height - 0.5) * Math.PI
      for (let x = 0; x < width; x++) {
        const phi = ((x + 0.5) / width - 0.5) * 2 * Math.PI
        const add = paint([Math.cos(theta) * Math.cos(phi), Math.sin(theta), Math.cos(theta) * Math.sin(phi)])
        if (!add) continue
        const i = (y * width + x) * 4
        data[i] += add[0]
        data[i + 1] += add[1]
        data[i + 2] += add[2]
      }
    }
  }
  addBoxes(data, width, height, staticBoxes(backdrop))
  staticCache.set(key, data)
  return data
}

/** Builds the studio's linear HDR radiance as RGBA floats (exported for tests). */
export function buildStudioRadiance(light: StudioLight, backdrop: Backdrop, width = WIDTH, height = HEIGHT) {
  const userColor = new Color(light.color) // sRGB hex → linear working space
  const userPower = Math.max(0, light.intensity) * 0.7
  const data = staticRadiance(backdrop, width, height).slice()
  const glow = backdropPalettes[backdrop].backGlow
  // The user's light also washes the backdrop behind the text, like a coloured gel on a
  // studio cyclorama, so its colour is refracted through every letter.
  const gel = 0.028 * userPower * (backdropPalettes[backdrop].gel ?? 1)
  addBoxes(data, width, height, [
    { dir: behind(0, 1), radius: 0.9, rgb: [glow[0] * 0.8 + userColor.r * gel, glow[1] * 0.8 + userColor.g * gel, glow[2] * 0.8 + userColor.b * gel], tall: 0.09 },
    { dir: lightDirection(light.azimuth, light.elevation), radius: 0.15, rgb: [userColor.r * userPower, userColor.g * userPower, userColor.b * userPower] },
  ])
  return data
}

function normalize(v: [number, number, number]): [number, number, number] {
  const len = Math.hypot(v[0], v[1], v[2]) || 1
  return [v[0] / len, v[1] / len, v[2] / len]
}

/** HalfFloat equirect texture usable both as `scene.environment` and by the path tracer. */
export function createStudioEnvironment(light: StudioLight, backdrop: Backdrop): DataTexture {
  const radiance = buildStudioRadiance(light, backdrop)
  const half = new Uint16Array(radiance.length)
  for (let i = 0; i < radiance.length; i++) half[i] = DataUtils.toHalfFloat(Math.min(radiance[i], 65000))
  const texture = new DataTexture(half, WIDTH, HEIGHT, RGBAFormat, HalfFloatType)
  texture.mapping = EquirectangularReflectionMapping
  texture.minFilter = LinearFilter
  texture.magFilter = LinearFilter
  texture.generateMipmaps = false
  texture.needsUpdate = true
  return texture
}
