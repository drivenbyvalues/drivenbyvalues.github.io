import { createNoise3D, fbm, ridged } from './noise'
import type { RGB, SurfaceParams } from './surface-params'

export interface SurfaceFields {
  width: number
  height: number
  /** Broad continental relief, 0..1. */
  terrain: Float32Array
  /** Ridged multifractal for mountain chains, 0..1. */
  ridge: Float32Array
  /** High-frequency texture, -1..1. */
  detail: Float32Array
  /** Moisture / biome noise, 0..1. */
  moisture: Float32Array
  /** Cloud density, 0..1, at half resolution. */
  cloud: Float32Array
  cloudWidth: number
  cloudHeight: number
}

function sphericalDir(x: number, y: number, width: number, height: number): [number, number, number] {
  const lon = (x / width) * Math.PI * 2
  const lat = Math.PI / 2 - (y / height) * Math.PI
  const c = Math.cos(lat)
  return [c * Math.cos(lon), Math.sin(lat), c * Math.sin(lon)]
}

const yieldToBrowser = () => new Promise<void>((resolve) => setTimeout(resolve, 0))

/** Precompute every noise field once. Chunked so the UI can show progress. */
export async function createSurfaceFields(
  width: number,
  height: number,
  onProgress?: (fraction: number) => void,
): Promise<SurfaceFields> {
  const n1 = createNoise3D(11)
  const n2 = createNoise3D(29)
  const n3 = createNoise3D(47)
  const n4 = createNoise3D(83)
  const size = width * height
  const terrain = new Float32Array(size)
  const ridge = new Float32Array(size)
  const detail = new Float32Array(size)
  const moisture = new Float32Array(size)
  const rowsPerChunk = 24
  for (let y0 = 0; y0 < height; y0 += rowsPerChunk) {
    const y1 = Math.min(height, y0 + rowsPerChunk)
    for (let y = y0; y < y1; y++) {
      for (let x = 0; x < width; x++) {
        const [dx, dy, dz] = sphericalDir(x, y, width, height)
        const i = y * width + x
        terrain[i] = 0.5 + 0.5 * fbm(n1, dx * 2.4, dy * 2.4, dz * 2.4, 6, 2.05, 0.52)
        ridge[i] = ridged(n2, dx * 3.2 + 7, dy * 3.2, dz * 3.2, 5)
        detail[i] = fbm(n3, dx * 14, dy * 14, dz * 14, 3, 2.2, 0.5)
        moisture[i] = 0.5 + 0.5 * fbm(n4, dx * 1.9 + 3, dy * 1.9, dz * 1.9, 4)
      }
    }
    onProgress?.((y1 / height) * 0.85)
    await yieldToBrowser()
  }

  const cloudWidth = width >> 1
  const cloudHeight = height >> 1
  const cloud = new Float32Array(cloudWidth * cloudHeight)
  const n5 = createNoise3D(131)
  for (let y0 = 0; y0 < cloudHeight; y0 += rowsPerChunk) {
    const y1 = Math.min(cloudHeight, y0 + rowsPerChunk)
    for (let y = y0; y < y1; y++) {
      for (let x = 0; x < cloudWidth; x++) {
        const [dx, dy, dz] = sphericalDir(x, y, cloudWidth, cloudHeight)
        const lat = Math.abs(Math.PI / 2 - (y / cloudHeight) * Math.PI)
        // Cloud bands: ITCZ near equator, storm tracks near 50°, subtropical clearing.
        const band = 0.55 + 0.35 * Math.cos(lat * 5.2) + 0.2 * Math.cos(lat * 2.4)
        const swirl = fbm(n5, dx * 3.4 + dy * 1.5, dy * 2.6, dz * 3.4 - dx * 1.5, 6, 2.3, 0.55)
        const wisps = fbm(n5, dx * 9 + 11, dy * 9, dz * 9, 3, 2.2, 0.5)
        cloud[y * cloudWidth + x] = Math.max(0, Math.min(1, 0.5 + 0.5 * swirl * band + 0.18 * wisps))
      }
    }
    onProgress?.(0.85 + (y1 / cloudHeight) * 0.15)
    await yieldToBrowser()
  }
  return { width, height, terrain, ridge, detail, moisture, cloud, cloudWidth, cloudHeight }
}

export interface SurfaceTargets {
  color: CanvasRenderingContext2D
  bump: CanvasRenderingContext2D
  rough: CanvasRenderingContext2D
  emissive: CanvasRenderingContext2D
}

export function makeContext(width: number, height: number) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  return canvas.getContext('2d', { willReadFrequently: true })!
}

function clamp01(v: number) {
  return v < 0 ? 0 : v > 1 ? 1 : v
}

function mix(a: number, b: number, t: number) {
  return a + (b - a) * t
}

const C = {
  basalt: [64, 62, 60] as RGB,
  redBeds: [152, 92, 62] as RGB,
  barrenTan: [172, 142, 98] as RGB,
  desert: [206, 178, 124] as RGB,
  savanna: [150, 146, 78] as RGB,
  tropical: [38, 88, 34] as RGB,
  temperate: [78, 112, 48] as RGB,
  boreal: [46, 74, 50] as RGB,
  tundra: [128, 122, 104] as RGB,
  rock: [122, 112, 102] as RGB,
  snow: [238, 242, 246] as RGB,
  seaIce: [222, 232, 242] as RGB,
  lavaCrust: [26, 18, 16] as RGB,
  lavaHot: [255, 96, 12] as RGB,
  lavaWhite: [255, 214, 120] as RGB,
}

function mix3(a: RGB, b: RGB, t: number, out: RGB) {
  out[0] = a[0] + (b[0] - a[0]) * t
  out[1] = a[1] + (b[1] - a[1]) * t
  out[2] = a[2] + (b[2] - a[2]) * t
  return out
}

/** Fill the land rings (equirectangular pixel coordinates) into a mask
 * context and produce a soft, downsampled copy that approximates distance to
 * the coast. */
export function paintLandMask(rings: number[][], mask: CanvasRenderingContext2D, soft: CanvasRenderingContext2D, blurScale = 12) {
  const { width, height } = mask.canvas
  mask.fillStyle = '#000'
  mask.fillRect(0, 0, width, height)
  mask.fillStyle = '#fff'
  mask.beginPath()
  for (const ring of rings) {
    mask.moveTo(ring[0], ring[1])
    for (let i = 2; i < ring.length; i += 2) mask.lineTo(ring[i], ring[i + 1])
    mask.closePath()
  }
  mask.fill('nonzero')

  const sw = Math.max(8, Math.round(width / blurScale))
  const sh = Math.max(4, Math.round(height / blurScale))
  const tiny = makeContext(sw, sh)
  tiny.imageSmoothingEnabled = true
  tiny.drawImage(mask.canvas, 0, 0, sw, sh)
  const tiny2 = makeContext(sw, sh)
  tiny2.imageSmoothingEnabled = true
  tiny2.filter = 'blur(1px)'
  tiny2.drawImage(tiny.canvas, 0, 0)
  soft.imageSmoothingEnabled = true
  soft.imageSmoothingQuality = 'high'
  soft.clearRect(0, 0, width, height)
  soft.drawImage(tiny2.canvas, 0, 0, width, height)
}

interface PaintOptions {
  fields: SurfaceFields
  params: SurfaceParams
  mask: CanvasRenderingContext2D
  soft: CanvasRenderingContext2D
  targets: SurfaceTargets
  /** Sample every `stride` pixels from the fields (2 = quarter cost). */
  stride: number
}

/** The main per-pixel painter. Writes colour, bump, roughness and emissive maps. */
export function paintSurface({ fields, params, mask, soft, targets, stride }: PaintOptions) {
  const W = fields.width / stride
  const H = fields.height / stride
  const color = targets.color.createImageData(W, H)
  const bump = targets.bump.createImageData(W, H)
  const rough = targets.rough.createImageData(W, H)
  const emis = targets.emissive.createImageData(W, H)
  const maskData = mask.getImageData(0, 0, mask.canvas.width, mask.canvas.height).data
  const softData = soft.getImageData(0, 0, soft.canvas.width, soft.canvas.height).data
  const maskScale = mask.canvas.width / W
  const softScale = soft.canvas.width / W
  const { terrain, ridge, detail, moisture } = fields
  const p = params
  const tmp: RGB = [0, 0, 0]
  const tmp2: RGB = [0, 0, 0]
  const baseRock = mix3(C.basalt, C.redBeds, p.oxidation, [0, 0, 0])
  const barren = mix3(baseRock, C.barrenTan, p.oxidation * 0.55, [0, 0, 0])
  const lavaActive = p.lava > 0.002
  const iceEdge = p.iceLat

  for (let y = 0; y < H; y++) {
    const lat = 90 - (y / H) * 180
    const absLat = Math.abs(lat)
    const latNorm = absLat / 90
    const subtropics = Math.exp(-(((absLat - 24) / 11) ** 2))
    const my = Math.min(mask.canvas.height - 1, Math.floor(y * maskScale))
    const sy = Math.min(soft.canvas.height - 1, Math.floor(y * softScale))
    for (let x = 0; x < W; x++) {
      const fi = y * stride * fields.width + x * stride
      const mi = (my * mask.canvas.width + Math.floor(x * maskScale)) * 4
      const si = (sy * soft.canvas.width + Math.floor(x * softScale)) * 4
      const land = maskData[mi] / 255
      const coast = softData[si] / 255
      const tr = terrain[fi]
      const rg = ridge[fi]
      const dt = detail[fi]
      const mo = moisture[fi]
      const o = (y * W + x) * 4

      let r: number, g: number, b: number
      let bumpV = 0
      let roughV = 0.9
      let er = 0
      let eg = 0
      let eb = 0

      if (land > 0.35) {
        const inland = Math.pow(clamp01(coast * 1.15), 0.6)
        const elev = inland * (0.18 + 0.42 * tr + 0.5 * rg * rg) + 0.04 * dt
        const temp = 1 - latNorm * 1.15 - elev * 0.5 + p.warmth * 0.35 + 0.05 * dt
        let wet = mo - p.desert * subtropics * 0.7 + (1 - inland) * 0.12
        wet = clamp01(wet + 0.08 * dt)
        const veg = clamp01(p.vegetation * clamp01(wet * 1.4) * clamp01((temp + 0.35) * 2.2))

        // Biome colour under vegetation.
        if (temp > 0.55) mix3(C.savanna, C.tropical, clamp01((wet - 0.35) * 2.2), tmp)
        else if (temp > 0.2) mix3(C.savanna, C.temperate, clamp01((wet - 0.3) * 2.4), tmp)
        else mix3(C.tundra, C.boreal, clamp01((wet - 0.25) * 2 + (temp - 0.05) * 2), tmp)

        // Bare ground: desert where dry, otherwise era-appropriate rock.
        const dryness = clamp01((p.desert * subtropics - wet + 0.5) * 1.3)
        mix3(barren, C.desert, dryness * p.oxidation, tmp2)
        r = mix(tmp2[0], tmp[0], veg)
        g = mix(tmp2[1], tmp[1], veg)
        b = mix(tmp2[2], tmp[2], veg)

        // Mountains: fade to rock then snow.
        const mountain = clamp01((elev - 0.66) * 4)
        r = mix(r, C.rock[0], mountain)
        g = mix(g, C.rock[1], mountain)
        b = mix(b, C.rock[2], mountain)
        const snowLine = 0.92 - latNorm * 0.55 + p.warmth * 0.25 + 0.05 * dt
        const snow = clamp01((elev - snowLine) * 4) * clamp01(rg * 1.6)
        const polar = clamp01((absLat - iceEdge + 5 + dt * 6) / 8)
        const ice = Math.max(snow, polar)
        r = mix(r, C.snow[0], ice)
        g = mix(g, C.snow[1], ice)
        b = mix(b, C.snow[2], ice)

        const shade = 1 + dt * 0.11 + (rg - 0.5) * 0.08
        r *= shade
        g *= shade
        b *= shade
        bumpV = clamp01(elev * 0.7 + rg * rg * inland * 0.5 + dt * 0.08) * 255
        roughV = mix(0.95, 0.55, ice)

        if (p.volcanism > 0.02) {
          const hot = clamp01((rg - (1 - p.volcanism * 0.45)) * 5) * (1 - ice)
          er += C.lavaHot[0] * hot * 0.9
          eg += C.lavaHot[1] * hot * 0.9
          eb += C.lavaHot[2] * hot * 0.9
          r = mix(r, C.lavaHot[0], hot * 0.8)
          g = mix(g, C.lavaHot[1], hot * 0.8)
          b = mix(b, C.lavaHot[2], hot * 0.8)
        }
        // Shoreline blend for antialiasing.
        if (land < 0.75) {
          const t = (0.75 - land) / 0.4
          r = mix(r, p.oceanShallow[0], t)
          g = mix(g, p.oceanShallow[1], t)
          b = mix(b, p.oceanShallow[2], t)
          roughV = mix(roughV, 0.35, t)
          bumpV *= 1 - t
        }
      } else {
        // Continental shelf hugs the coast; abyssal plains and ridges beyond.
        const shelf = Math.pow(clamp01(coast * 1.9), 1.6)
        const basin = 0.8 + 0.2 * tr - 0.12 * clamp01((rg - 0.55) * 3)
        const depth = clamp01(1 - shelf) * basin
        r = mix(p.oceanShallow[0], p.oceanDeep[0], depth)
        g = mix(p.oceanShallow[1], p.oceanDeep[1], depth)
        b = mix(p.oceanShallow[2], p.oceanDeep[2], depth)
        const swirl = 1 + dt * 0.04 + (mo - 0.5) * 0.08
        r *= swirl
        g *= swirl
        b *= swirl
        roughV = 0.3 + 0.08 * (1 - depth)
        bumpV = 6 + dt * 3

        const seaIce = clamp01((absLat - iceEdge + 2 + dt * 8 + (mo - 0.5) * 6) / 6)
        if (seaIce > 0) {
          r = mix(r, C.seaIce[0], seaIce)
          g = mix(g, C.seaIce[1], seaIce)
          b = mix(b, C.seaIce[2], seaIce)
          roughV = mix(roughV, 0.6, seaIce)
          bumpV = mix(bumpV, 40 + dt * 30, seaIce)
        }
      }

      if (lavaActive) {
        // Magma retreats into low basins as the crust solidifies; a dark,
        // cracked crust floats on top with incandescent seams.
        const threshold = 0.12 + 0.62 * p.lava
        const melt = clamp01((threshold - tr) * 6)
        const seams = clamp01((rg - 0.7) * 5) * clamp01(p.lava * 2.5) * (1 - melt)
        const crustShade = 0.85 + dt * 0.3 + (rg - 0.5) * 0.2
        const crustR = mix(C.lavaCrust[0], C.basalt[0], 1 - p.lava) * crustShade
        const crustG = mix(C.lavaCrust[1], C.basalt[1], 1 - p.lava) * crustShade
        const crustB = mix(C.lavaCrust[2], C.basalt[2], 1 - p.lava) * crustShade
        const solid = clamp01(p.lava * 1.6)
        r = mix(r, crustR, solid)
        g = mix(g, crustG, solid)
        b = mix(b, crustB, solid)
        // Hot core of the melt is brighter; edges cool to dull red.
        const heat = clamp01((melt - 0.35) * 1.6) * (0.75 + 0.25 * dt)
        const lr = mix(140, C.lavaHot[0], heat)
        const lg = mix(24, C.lavaHot[1] + 40 * heat * heat, heat)
        const lb = mix(8, C.lavaHot[2], heat)
        const glow = Math.max(melt * (0.55 + 0.45 * heat), seams * 0.9)
        r = mix(r, lr, glow)
        g = mix(g, lg, glow)
        b = mix(b, lb, glow)
        er = Math.max(er, lr * glow * 0.8)
        eg = Math.max(eg, lg * glow * 0.8)
        eb = Math.max(eb, lb * glow * 0.8)
        roughV = mix(roughV, mix(0.75, 0.45, melt), solid)
        bumpV = mix(bumpV, (tr * 0.4 + rg * 0.6) * 140 * (1 - melt), solid)
      }

      color.data[o] = r
      color.data[o + 1] = g
      color.data[o + 2] = b
      color.data[o + 3] = 255
      bump.data[o] = bump.data[o + 1] = bump.data[o + 2] = bumpV
      bump.data[o + 3] = 255
      const rv = roughV * 255
      rough.data[o] = rough.data[o + 1] = rough.data[o + 2] = rv
      rough.data[o + 3] = 255
      emis.data[o] = er
      emis.data[o + 1] = eg
      emis.data[o + 2] = eb
      emis.data[o + 3] = 255
    }
  }
  targets.color.putImageData(color, 0, 0)
  targets.bump.putImageData(bump, 0, 0)
  targets.rough.putImageData(rough, 0, 0)
  targets.emissive.putImageData(emis, 0, 0)
}

export function paintClouds(fields: SurfaceFields, params: SurfaceParams, ctx: CanvasRenderingContext2D) {
  const { cloud, cloudWidth: W, cloudHeight: H } = fields
  const img = ctx.createImageData(W, H)
  const threshold = 0.76 - params.cloudCover * 0.36
  const [tr, tg, tb] = params.cloudTint
  for (let i = 0; i < W * H; i++) {
    const c = cloud[i]
    const a = clamp01((c - threshold) / 0.3)
    const dense = Math.pow(a, 1.6)
    const o = i * 4
    const shade = 0.86 + 0.14 * dense
    img.data[o] = tr * shade
    img.data[o + 1] = tg * shade
    img.data[o + 2] = tb * shade
    img.data[o + 3] = dense * 255
  }
  ctx.putImageData(img, 0, 0)
}

export interface CityLight {
  lon: number
  lat: number
  /** Relative brightness 0..1. */
  weight: number
  /** Angular radius in degrees. */
  radius: number
}

/** Draws soft city glow into an equirectangular canvas. `intensity` scales
 * every light; `sprawl` pulls in additional scattered lights around each city
 * to suggest suburbs and roads. */
export function paintCityLights(
  ctx: CanvasRenderingContext2D,
  cities: CityLight[],
  intensity: number,
  sprawl: number,
  landMask?: HTMLCanvasElement,
) {
  const { width, height } = ctx.canvas
  ctx.globalCompositeOperation = 'source-over'
  ctx.clearRect(0, 0, width, height)
  if (intensity <= 0) return
  ctx.globalCompositeOperation = 'lighter'
  const pxPerDeg = width / 360
  let seed = 7
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0
    return seed / 4294967296
  }
  const dot = (x: number, y: number, r: number, a: number, warm: number) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r)
    g.addColorStop(0, `rgba(255, ${Math.round(228 - 40 * warm)}, ${Math.round(190 - 90 * warm)}, ${a})`)
    g.addColorStop(0.4, `rgba(255, ${Math.round(200 - 30 * warm)}, ${Math.round(130 - 50 * warm)}, ${a * 0.45})`)
    g.addColorStop(1, 'rgba(255, 170, 90, 0)')
    ctx.fillStyle = g
    ctx.fillRect(x - r, y - r, r * 2, r * 2)
  }
  for (const city of cities) {
    const cx = ((city.lon + 180) / 360) * width
    const cy = ((90 - city.lat) / 180) * height
    const radius = city.radius * pxPerDeg * 0.55
    const alpha = clamp01(city.weight * intensity)
    // Dense core.
    dot(cx, cy, radius, alpha, 0.2)
    dot(cx, cy, radius * 0.35, alpha, 0)
    // Sprawl: many small, dim lights thinning with distance—suburbs and roads.
    const count = Math.round(sprawl * (0.4 + city.weight) * 70)
    for (let i = 0; i < count; i++) {
      const ang = rand() * Math.PI * 2
      const dist = Math.pow(rand(), 0.55) * radius * 3.2
      const sx = cx + Math.cos(ang) * dist
      const sy = cy + Math.sin(ang) * dist * 0.7
      const sr = radius * (0.05 + rand() * 0.16)
      const fade = 1 - dist / (radius * 3.4)
      dot(sx, sy, sr, alpha * (0.25 + 0.5 * rand()) * fade, rand())
    }
    // Faint corridors between core and a few satellite towns.
    const spokes = Math.round(sprawl * 3)
    for (let s = 0; s < spokes; s++) {
      const ang = rand() * Math.PI * 2
      const len = radius * (1.5 + rand() * 2.5)
      const steps = 8
      for (let k = 1; k <= steps; k++) {
        const t = k / steps
        dot(cx + Math.cos(ang) * len * t, cy + Math.sin(ang) * len * t * 0.7, radius * 0.08, alpha * 0.35 * (1 - t * 0.6), 0.5)
      }
    }
  }
  if (landMask) {
    // Lights only exist on land.
    ctx.globalCompositeOperation = 'destination-in'
    ctx.drawImage(landMask, 0, 0, width, height)
  }
  ctx.globalCompositeOperation = 'source-over'
}

export function paintMoon(ctx: CanvasRenderingContext2D) {
  const { width, height } = ctx.canvas
  const img = ctx.createImageData(width, height)
  const n = createNoise3D(5)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const [dx, dy, dz] = sphericalDir(x, y, width, height)
      const mare = fbm(n, dx * 2.2, dy * 2.2, dz * 2.2, 4)
      const craters = ridged(n, dx * 9 + 3, dy * 9, dz * 9, 4)
      const fine = fbm(n, dx * 30, dy * 30, dz * 30, 2)
      let v = 150 + mare * 45 - craters * 40 + fine * 12
      v = Math.max(40, Math.min(230, v))
      const o = (y * width + x) * 4
      img.data[o] = v
      img.data[o + 1] = v * 0.98
      img.data[o + 2] = v * 0.94
      img.data[o + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)
}
