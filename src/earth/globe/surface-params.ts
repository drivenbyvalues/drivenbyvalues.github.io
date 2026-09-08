export type RGB = [number, number, number]

/** Everything the painter needs to know about the planet at one instant. */
export interface SurfaceParams {
  /** Magma-ocean coverage, 0..1. */
  lava: number
  /** Hotspot glow on solid crust, 0..1. */
  volcanism: number
  /** Continental crust extent multiplier (also driven by plate poses). */
  vegetation: number
  /** 0 = dark reduced basalt, 1 = red oxidised regolith / red beds. */
  oxidation: number
  /** Aridity of the subtropical belts, 0..1. */
  desert: number
  /** Global warmth offset: positive melts snowlines, negative grows them. */
  warmth: number
  /** Latitude (deg) at which permanent ice begins. 90 = ice-free, ~5 = snowball. */
  iceLat: number
  oceanDeep: RGB
  oceanShallow: RGB
  cloudCover: number
  cloudTint: RGB
  atmosphere: RGB
  atmosphereStrength: number
  /** City-light intensity, 0..1 (only meaningful in the human eras). */
  nightLights: number
}

interface Keyframe extends SurfaceParams {
  ma: number
}

const K = (ma: number, p: Partial<SurfaceParams>, base: SurfaceParams): Keyframe => ({ ...base, ...p, ma })

const modern: SurfaceParams = {
  lava: 0,
  volcanism: 0,
  vegetation: 1,
  oxidation: 1,
  desert: 0.45,
  warmth: 0,
  iceLat: 66,
  oceanDeep: [8, 32, 78],
  oceanShallow: [28, 96, 150],
  cloudCover: 0.55,
  cloudTint: [255, 255, 255],
  atmosphere: [90, 150, 255],
  atmosphereStrength: 1,
  nightLights: 0,
}

const archean: SurfaceParams = {
  ...modern,
  vegetation: 0,
  oxidation: 0.05,
  desert: 0.2,
  warmth: 0.25,
  iceLat: 90,
  oceanDeep: [10, 48, 52],
  oceanShallow: [40, 110, 96],
  cloudCover: 0.6,
  cloudTint: [255, 228, 200],
  atmosphere: [255, 150, 70],
  atmosphereStrength: 1.2,
}

const hadean: SurfaceParams = {
  ...archean,
  lava: 1,
  volcanism: 1,
  oceanDeep: [20, 20, 22],
  oceanShallow: [30, 30, 32],
  cloudCover: 0.85,
  cloudTint: [120, 90, 80],
  atmosphere: [255, 96, 40],
  atmosphereStrength: 1.4,
}

const proterozoic: SurfaceParams = {
  ...modern,
  vegetation: 0,
  oxidation: 0.85,
  desert: 0.5,
  warmth: 0.05,
  iceLat: 84,
  oceanDeep: [10, 40, 86],
  oceanShallow: [34, 104, 150],
  cloudCover: 0.5,
  atmosphere: [130, 165, 240],
  atmosphereStrength: 0.9,
}

const snowball: Partial<SurfaceParams> = {
  iceLat: 6,
  warmth: -0.8,
  cloudCover: 0.25,
  atmosphere: [170, 200, 255],
}

/* Time in Ma, oldest first. Interpolated per-field with smoothstep. */
const keyframes: Keyframe[] = [
  K(4540, {}, hadean),
  K(4450, { lava: 0.75 }, hadean),
  K(4300, { lava: 0.28, volcanism: 0.9, oceanDeep: [16, 30, 34], oceanShallow: [34, 60, 62], cloudCover: 0.8, cloudTint: [200, 170, 150] }, hadean),
  K(4100, { lava: 0.04, volcanism: 0.7, cloudCover: 0.7, cloudTint: [235, 210, 190] }, archean),
  K(3900, { lava: 0, volcanism: 0.5 }, archean),
  K(3200, { volcanism: 0.3, oxidation: 0.1 }, archean),
  K(2500, { volcanism: 0.15, oxidation: 0.2, oceanDeep: [10, 50, 64], oceanShallow: [40, 118, 118], atmosphere: [255, 175, 110], cloudTint: [255, 240, 225] }, archean),
  K(2360, { oxidation: 0.4, oceanDeep: [10, 46, 76], atmosphere: [220, 180, 160], atmosphereStrength: 1 }, proterozoic),
  K(2300, { ...snowball, oxidation: 0.45 }, proterozoic),
  K(2230, { oxidation: 0.5, iceLat: 80 }, proterozoic),
  K(1800, { oxidation: 0.75 }, proterozoic),
  K(1000, { oxidation: 0.9 }, proterozoic),
  K(735, {}, proterozoic),
  K(715, snowball, proterozoic),
  K(665, snowball, proterozoic),
  K(652, { iceLat: 70, warmth: -0.2 }, proterozoic),
  K(642, snowball, proterozoic),
  K(633, snowball, proterozoic),
  K(615, { iceLat: 82 }, proterozoic),
  K(541, { vegetation: 0, oxidation: 0.9, desert: 0.6, iceLat: 86, atmosphere: [110, 158, 250], atmosphereStrength: 1 }, modern),
  K(470, { vegetation: 0.08, desert: 0.6, iceLat: 84 }, modern),
  K(445, { vegetation: 0.15, desert: 0.55, iceLat: 62, warmth: -0.3 }, modern),
  K(420, { vegetation: 0.35, desert: 0.55, iceLat: 86, warmth: 0.1 }, modern),
  K(360, { vegetation: 0.85, desert: 0.4, iceLat: 82, warmth: 0.1 }, modern),
  K(300, { vegetation: 0.9, desert: 0.45, iceLat: 58, warmth: -0.35 }, modern),
  // Permian Pangaea: ice retreats, a huge arid interior, monsoon-fed coasts,
  // and warm shallow seas over the continental shelves.
  K(280, { vegetation: 0.8, desert: 0.7, iceLat: 72, warmth: -0.05, oceanShallow: [46, 132, 158] }, modern),
  K(262, { vegetation: 0.75, desert: 0.8, iceLat: 86, warmth: 0.2, oceanShallow: [50, 138, 160] }, modern),
  K(253, { vegetation: 0.7, desert: 0.8, iceLat: 90, warmth: 0.3 }, modern),
  // The Great Dying: Siberian Traps volcanism, acid rain, anoxic purple-green
  // seas, a ~10 °C hothouse and near-total loss of forests.
  K(252, { vegetation: 0.12, desert: 0.95, iceLat: 90, warmth: 0.75, volcanism: 0.35, oceanDeep: [30, 44, 60], oceanShallow: [70, 110, 108], atmosphere: [200, 140, 100], atmosphereStrength: 1.25, cloudCover: 0.75, cloudTint: [225, 200, 180] }, modern),
  K(251, { vegetation: 0.1, desert: 0.95, iceLat: 90, warmth: 0.8, volcanism: 0.25, oceanDeep: [26, 42, 62], oceanShallow: [66, 110, 112], atmosphere: [205, 150, 110], atmosphereStrength: 1.2, cloudCover: 0.7, cloudTint: [230, 210, 195] }, modern),
  K(247, { vegetation: 0.35, desert: 0.9, iceLat: 90, warmth: 0.55, volcanism: 0.05, atmosphere: [150, 160, 220] }, modern),
  K(240, { vegetation: 0.6, desert: 0.85, iceLat: 90, warmth: 0.4 }, modern),
  K(200, { vegetation: 0.9, desert: 0.6, iceLat: 90, warmth: 0.3 }, modern),
  K(150, { vegetation: 1, desert: 0.4, iceLat: 90, warmth: 0.3 }, modern),
  K(95, { vegetation: 1, desert: 0.3, iceLat: 90, warmth: 0.45, oceanDeep: [10, 40, 90] }, modern),
  K(66.2, { vegetation: 1, desert: 0.35, iceLat: 90, warmth: 0.3 }, modern),
  K(65.8, { vegetation: 0.4, desert: 0.5, iceLat: 90, warmth: 0.1, atmosphere: [160, 140, 130], cloudCover: 0.85, cloudTint: [190, 180, 175] }, modern),
  K(63, { vegetation: 0.9, desert: 0.4, iceLat: 90, warmth: 0.25 }, modern),
  K(50, { vegetation: 1, desert: 0.35, iceLat: 90, warmth: 0.4 }, modern),
  K(34, { vegetation: 1, desert: 0.4, iceLat: 80, warmth: 0.1 }, modern),
  K(15, { vegetation: 1, desert: 0.45, iceLat: 74, warmth: 0.05 }, modern),
  K(2.6, { vegetation: 1, desert: 0.45, iceLat: 70, warmth: 0 }, modern),
  K(0.03, { vegetation: 0.85, desert: 0.55, iceLat: 50, warmth: -0.45, cloudCover: 0.5 }, modern),
  K(0.012, { vegetation: 0.9, desert: 0.5, iceLat: 60, warmth: -0.15 }, modern),
  K(0, modern, modern),
]

function smooth(t: number) {
  return t * t * (3 - 2 * t)
}

function mixRGB(a: RGB, b: RGB, t: number): RGB {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
}

const numericKeys = [
  'lava',
  'volcanism',
  'vegetation',
  'oxidation',
  'desert',
  'warmth',
  'iceLat',
  'cloudCover',
  'atmosphereStrength',
  'nightLights',
] as const
const rgbKeys = ['oceanDeep', 'oceanShallow', 'cloudTint', 'atmosphere'] as const

export function surfaceParamsAt(ma: number): SurfaceParams {
  if (ma >= keyframes[0].ma) return keyframes[0]
  if (ma <= 0) return keyframes[keyframes.length - 1]
  for (let i = 0; i < keyframes.length - 1; i++) {
    const a = keyframes[i]
    const b = keyframes[i + 1]
    if (ma <= a.ma && ma >= b.ma) {
      const t = smooth((a.ma - ma) / (a.ma - b.ma))
      const out = { ...a } as SurfaceParams
      for (const key of numericKeys) out[key] = a[key] + (b[key] - a[key]) * t
      for (const key of rgbKeys) out[key] = mixRGB(a[key], b[key], t)
      return out
    }
  }
  return keyframes[keyframes.length - 1]
}
