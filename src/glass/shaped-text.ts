import { ShapePath, type Shape } from 'three'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js'

/**
 * Complex-script text (Kannada, Hindi, Tamil…) for the glass studio.
 *
 * three's TextGeometry places one glyph per character, which breaks Indic scripts:
 * conjuncts (ಕ್ಷ, क्ष), reordered vowel signs (कि) and stacked forms need real
 * OpenType shaping. HarfBuzz (WebAssembly) shapes each script run with a Noto font,
 * and the shaped glyph outlines become three.js Shapes ready to extrude.
 */

export const shapedScripts = {
  latin: { label: 'Latin / Greek / Cyrillic', font: 'NotoSans' },
  devanagari: { label: 'Devanagari (Hindi, Marathi, Sanskrit, Nepali)', font: 'NotoSansDevanagari' },
  bengali: { label: 'Bengali / Assamese', font: 'NotoSansBengali' },
  gurmukhi: { label: 'Gurmukhi (Punjabi)', font: 'NotoSansGurmukhi' },
  gujarati: { label: 'Gujarati', font: 'NotoSansGujarati' },
  oriya: { label: 'Odia', font: 'NotoSansOriya' },
  tamil: { label: 'Tamil', font: 'NotoSansTamil' },
  telugu: { label: 'Telugu', font: 'NotoSansTelugu' },
  kannada: { label: 'Kannada', font: 'NotoSansKannada' },
  malayalam: { label: 'Malayalam', font: 'NotoSansMalayalam' },
} as const
export type ShapedScript = keyof typeof shapedScripts

const indicBlocks: [number, number, ShapedScript][] = [
  [0x0900, 0x097f, 'devanagari'],
  [0xa8e0, 0xa8ff, 'devanagari'],
  [0x0980, 0x09ff, 'bengali'],
  [0x0a00, 0x0a7f, 'gurmukhi'],
  [0x0a80, 0x0aff, 'gujarati'],
  [0x0b00, 0x0b7f, 'oriya'],
  [0x0b80, 0x0bff, 'tamil'],
  [0x0c00, 0x0c7f, 'telugu'],
  [0x0c80, 0x0cff, 'kannada'],
  [0x0d00, 0x0d7f, 'malayalam'],
]

/** Characters that belong to whatever run they follow: joiners and combining marks. */
function isAttaching(cp: number) {
  return (
    (cp >= 0x200b && cp <= 0x200d) || // ZWSP, ZWNJ, ZWJ: control conjunct formation
    (cp >= 0x0300 && cp <= 0x036f) || // combining diacritics
    (cp >= 0xfe00 && cp <= 0xfe0f) // variation selectors
  )
}

export function scriptOf(cp: number): ShapedScript {
  for (const [lo, hi, script] of indicBlocks) if (cp >= lo && cp <= hi) return script
  return 'latin'
}

/** The bundled typeface fonts only cover Basic Latin + Latin-1; anything else needs shaping. */
export function needsShaping(text: string) {
  for (const ch of text) if ((ch.codePointAt(0) ?? 0) > 0xff) return true
  return false
}

export interface ScriptRun {
  script: ShapedScript
  text: string
}

/** Splits text into same-script runs so each can be shaped with the right font. */
export function segmentRuns(text: string): ScriptRun[] {
  const runs: ScriptRun[] = []
  for (const ch of text) {
    const cp = ch.codePointAt(0) ?? 0
    const last = runs[runs.length - 1]
    if (last && isAttaching(cp)) {
      last.text += ch
      continue
    }
    const script = scriptOf(cp)
    if (last && last.script === script) last.text += ch
    else runs.push({ script, text: ch })
  }
  return runs
}

/* --- SVG path data → ShapePath ------------------------------------------- */

const TOKEN = /[MLQCZ]|-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/gi

/**
 * Appends a HarfBuzz glyph path (font units, y up) to `target`, scaled and offset.
 * HarfBuzz only emits absolute M, L, Q, C and Z commands.
 */
export function appendGlyphPath(target: ShapePath, d: string, scale: number, dx: number, dy: number) {
  const tokens = d.match(TOKEN) ?? []
  let i = 0
  const n = () => Number(tokens[i++])
  const X = () => n() * scale + dx
  const Y = () => n() * scale + dy
  let startX = 0
  let startY = 0
  let curX = 0
  let curY = 0
  while (i < tokens.length) {
    const cmd = tokens[i++].toUpperCase()
    switch (cmd) {
      case 'M':
        curX = X()
        curY = Y()
        startX = curX
        startY = curY
        target.moveTo(curX, curY)
        break
      case 'L':
        curX = X()
        curY = Y()
        target.lineTo(curX, curY)
        break
      case 'Q': {
        const cx = X()
        const cy = Y()
        curX = X()
        curY = Y()
        target.quadraticCurveTo(cx, cy, curX, curY)
        break
      }
      case 'C': {
        const c1x = X()
        const c1y = Y()
        const c2x = X()
        const c2y = Y()
        curX = X()
        curY = Y()
        target.bezierCurveTo(c1x, c1y, c2x, c2y, curX, curY)
        break
      }
      case 'Z':
        if (Math.abs(curX - startX) > 1e-9 || Math.abs(curY - startY) > 1e-9) target.lineTo(startX, startY)
        curX = startX
        curY = startY
        break
      default:
        return // malformed data: keep what we have
    }
  }
}

/* --- HarfBuzz loading ------------------------------------------------------ */

type HarfBuzz = typeof import('harfbuzzjs')
type HbFont = InstanceType<HarfBuzz['Font']>

let harfbuzz: Promise<HarfBuzz> | null = null
function loadHarfBuzz() {
  harfbuzz ??= import('harfbuzzjs')
  return harfbuzz
}

const fontCache = new Map<ShapedScript, Promise<{ font: HbFont; upem: number }>>()
function loadScriptFont(script: ShapedScript) {
  let pending = fontCache.get(script)
  if (!pending) {
    pending = (async () => {
      const hb = await loadHarfBuzz()
      const res = await fetch(`${import.meta.env.BASE_URL}glass/fonts/noto/${shapedScripts[script].font}-Bold.ttf`)
      if (!res.ok) throw new Error(`Font for ${script} failed to load (${res.status})`)
      const face = new hb.Face(new hb.Blob(await res.arrayBuffer()))
      return { font: new hb.Font(face), upem: face.upem }
    })()
    pending.catch(() => fontCache.delete(script))
    fontCache.set(script, pending)
  }
  return pending
}

export interface ShapedText {
  shapes: Shape[]
  /** Scripts that were used, for the UI. */
  scripts: ShapedScript[]
  /** Characters the fonts had no glyph for (shown to the user). */
  missing: string[]
}

/**
 * Shapes `text` and returns extrudable outlines, 1 unit = 1 em (matching
 * TextGeometry with size 1), laid out left to right.
 */
export async function shapeText(text: string): Promise<ShapedText> {
  const hb = await loadHarfBuzz()
  const runs = segmentRuns(text)
  const fonts = await Promise.all(runs.map((r) => loadScriptFont(r.script)))
  const shapes: Shape[] = []
  const missing = new Set<string>()
  let penX = 0

  runs.forEach((run, r) => {
    const { font, upem } = fonts[r]
    const scale = 1 / upem
    const buffer = new hb.Buffer()
    buffer.addText(run.text)
    buffer.guessSegmentProperties()
    hb.shape(font, buffer)
    const infos = buffer.getGlyphInfos()
    const positions = buffer.getGlyphPositions()
    // Glyph 0 is .notdef: report which characters this font cannot draw.
    if (infos.some((info) => info.codepoint === 0)) {
      for (const ch of run.text) {
        const cp = ch.codePointAt(0) ?? 0
        if (ch.trim() && !isAttaching(cp) && font.nominalGlyph(cp) === undefined) missing.add(ch)
      }
    }
    infos.forEach((info, g) => {
      const pos = positions[g]
      if (info.codepoint !== 0) {
        const d = font.glyphToPath(info.codepoint)
        if (d) {
          const path = new ShapePath()
          appendGlyphPath(path, d, scale, penX + pos.xOffset * scale, pos.yOffset * scale)
          shapes.push(...SVGLoader.createShapes(withFillRule(path)))
        }
      }
      penX += pos.xAdvance * scale
    })
  })

  // Runs that are only spaces/punctuation don't count as a script the visitor "used".
  const used = runs.filter((r) => /\p{L}|\p{M}/u.test(r.text)).map((r) => r.script)
  return { shapes, scripts: [...new Set(used)], missing: [...missing] }
}

/** SVGLoader.createShapes reads the fill rule from the path's style; glyphs use non-zero. */
function withFillRule(path: ShapePath) {
  ;(path as ShapePath & { userData?: unknown }).userData = { style: { fillRule: 'nonzero' } }
  return path
}
