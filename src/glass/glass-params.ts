import type { GlassFont, MaterialKind } from './glass-scene'
import { glassFonts, materialKinds } from './glass-scene'
import { shareableBackdrops, type Backdrop } from './studio-environment'

export interface GlassSettings {
  text: string
  font: GlassFont
  kind: MaterialKind
  tint: string
  tintStrength: number
  frost: number
  thickness: number
  dispersion: number
  lightColor: string
  lightIntensity: number
  lightAzimuth: number
  lightElevation: number
  backdrop: Backdrop
  autoRotate: boolean
}

export const MAX_TEXT_LENGTH = 24

export const defaultGlassSettings: GlassSettings = {
  text: 'Harish',
  font: 'helvetiker',
  kind: 'glass',
  tint: '#7fd6ff',
  tintStrength: 0.35,
  frost: 0,
  thickness: 1.2,
  dispersion: 0.35,
  lightColor: '#ffb347',
  lightIntensity: 5,
  lightAzimuth: 30,
  lightElevation: 35,
  backdrop: 'midnight',
  autoRotate: false,
}

const HEX = /^[0-9a-f]{6}$/i

function num(value: string | null, min: number, max: number, fallback: number) {
  if (value === null || value.trim() === '') return fallback
  const n = Number(value)
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback
}

function hex(value: string | null, fallback: string) {
  const v = value?.replace(/^#/, '') ?? ''
  return HEX.test(v) ? `#${v.toLowerCase()}` : fallback
}

/** Reads settings from a query string, ignoring anything malformed. */
export function parseGlassSettings(search: string): GlassSettings {
  const q = new URLSearchParams(search)
  const d = defaultGlassSettings
  const font = q.get('font')
  const kind = q.get('kind')
  const backdrop = q.get('bg') as Backdrop | null
  const text = q.get('text')
  return {
    text: text !== null ? text.slice(0, MAX_TEXT_LENGTH) : d.text,
    font: font && font in glassFonts ? (font as GlassFont) : d.font,
    kind: kind && kind in materialKinds ? (kind as MaterialKind) : d.kind,
    tint: hex(q.get('tint'), d.tint),
    tintStrength: num(q.get('tintStrength'), 0, 1, d.tintStrength),
    frost: num(q.get('frost'), 0, 1, d.frost),
    thickness: num(q.get('thickness'), 0.2, 3, d.thickness),
    dispersion: num(q.get('dispersion'), 0, 1, d.dispersion),
    lightColor: hex(q.get('light'), d.lightColor),
    lightIntensity: num(q.get('intensity'), 0, 10, d.lightIntensity),
    lightAzimuth: num(q.get('az'), -180, 180, d.lightAzimuth),
    lightElevation: num(q.get('el'), 0, 85, d.lightElevation),
    backdrop: backdrop && shareableBackdrops.includes(backdrop) ? backdrop : d.backdrop,
    autoRotate: q.get('spin') === '1',
  }
}

/** Serialises only the settings that differ from the defaults, keeping share links short. */
export function serializeGlassSettings(s: GlassSettings): string {
  const d = defaultGlassSettings
  const q = new URLSearchParams()
  const put = (key: string, value: string | number | boolean, def: string | number | boolean) => {
    if (value !== def) q.set(key, typeof value === 'boolean' ? (value ? '1' : '0') : String(value))
  }
  put('text', s.text, d.text)
  put('font', s.font, d.font)
  put('kind', s.kind, d.kind)
  put('tint', s.tint.replace('#', ''), d.tint.replace('#', ''))
  put('tintStrength', s.tintStrength, d.tintStrength)
  put('frost', s.frost, d.frost)
  put('thickness', s.thickness, d.thickness)
  put('dispersion', s.dispersion, d.dispersion)
  put('light', s.lightColor.replace('#', ''), d.lightColor.replace('#', ''))
  put('intensity', s.lightIntensity, d.lightIntensity)
  put('az', s.lightAzimuth, d.lightAzimuth)
  put('el', s.lightElevation, d.lightElevation)
  put('bg', s.backdrop === 'photo' ? d.backdrop : s.backdrop, d.backdrop)
  put('spin', s.autoRotate, d.autoRotate)
  const str = q.toString()
  return str ? `?${str}` : ''
}

export const lightPresets: { label: string; color: string }[] = [
  { label: 'Candle', color: '#ffb347' },
  { label: 'Daylight', color: '#fff4e0' },
  { label: 'Cyan', color: '#4fe3ff' },
  { label: 'Magenta', color: '#ff4fd8' },
  { label: 'Lime', color: '#9dff4f' },
]

export const tintPresets: { label: string; color: string }[] = [
  { label: 'Ice', color: '#7fd6ff' },
  { label: 'Clear', color: '#ffffff' },
  { label: 'Emerald', color: '#3ddc84' },
  { label: 'Amber', color: '#ffa53d' },
  { label: 'Ruby', color: '#ff3d6a' },
  { label: 'Violet', color: '#9b6bff' },
]
