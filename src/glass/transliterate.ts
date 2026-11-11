/**
 * Phonetic typing: type a name in English letters ("hareesh") and get it in an
 * Indian script (ಹರೀಶ್, हरीश, ஹரீஷ்…).
 *
 * All the Brahmic scripts in Unicode share one layout: the same sound sits at the
 * same offset from the start of each script's block (ka is always +0x15). So one
 * table of offsets serves every script, with small per-script fallbacks for
 * letters a script does not have (Tamil has no kh, g or b, Bengali has no va…).
 *
 * The scheme follows common Indian conventions (Baraha / ITRANS-like):
 *   a aa/A i ee/ii/I u oo/uu/U R e E ai o O au M (anusvara) H (visarga)
 *   capitals for retroflex: T Th D Dh N L Sh; x = ksh; f = ph; w = v.
 */

export const phoneticScripts = {
  kannada: { label: 'Kannada', base: 0x0c80, south: true, example: 'hareesh' },
  devanagari: { label: 'Hindi / Marathi (Devanagari)', base: 0x0900, south: false, example: 'hareesh' },
  tamil: { label: 'Tamil', base: 0x0b80, south: true, example: 'hareesh' },
  telugu: { label: 'Telugu', base: 0x0c00, south: true, example: 'hareesh' },
  malayalam: { label: 'Malayalam', base: 0x0d00, south: true, example: 'hareesh' },
  bengali: { label: 'Bengali', base: 0x0980, south: false, example: 'hareesh' },
  gujarati: { label: 'Gujarati', base: 0x0a80, south: false, example: 'hareesh' },
  gurmukhi: { label: 'Punjabi (Gurmukhi)', base: 0x0a00, south: false, example: 'hareesh' },
  oriya: { label: 'Odia', base: 0x0b00, south: false, example: 'hareesh' },
} as const
export type PhoneticScript = keyof typeof phoneticScripts

/** Vowels: [independent letter offset, vowel sign offset or null for the inherent "a"]. */
type Vowel = { kind: 'vowel'; letter: number; sign: number | null }
type Consonant = { kind: 'consonant'; offset: number }
type Mark = { kind: 'mark'; offset: number }
type Token = Vowel | Consonant | Mark

const V = (letter: number, sign: number | null): Vowel => ({ kind: 'vowel', letter, sign })
const C = (offset: number): Consonant => ({ kind: 'consonant', offset })

/** Short e/o differ between north (no short form) and south Indian scripts. */
function vowelTable(south: boolean): Record<string, Vowel> {
  const e = south ? V(0x0e, 0x46) : V(0x0f, 0x47)
  const o = south ? V(0x12, 0x4a) : V(0x13, 0x4b)
  return {
    a: V(0x05, null),
    aa: V(0x06, 0x3e),
    A: V(0x06, 0x3e),
    i: V(0x07, 0x3f),
    ii: V(0x08, 0x40),
    ee: V(0x08, 0x40),
    I: V(0x08, 0x40),
    u: V(0x09, 0x41),
    uu: V(0x0a, 0x42),
    oo: V(0x0a, 0x42),
    U: V(0x0a, 0x42),
    R: V(0x0b, 0x43),
    e,
    E: V(0x0f, 0x47),
    ai: V(0x10, 0x48),
    o,
    O: V(0x13, 0x4b),
    au: V(0x14, 0x4c),
  }
}

const consonants: Record<string, number> = {
  k: 0x15, q: 0x15, kh: 0x16, g: 0x17, gh: 0x18,
  ch: 0x1a, c: 0x1a, chh: 0x1b, Ch: 0x1b, j: 0x1c, z: 0x1c, jh: 0x1d,
  T: 0x1f, Th: 0x20, D: 0x21, Dh: 0x22, N: 0x23,
  t: 0x24, th: 0x25, d: 0x26, dh: 0x27, n: 0x28,
  p: 0x2a, ph: 0x2b, f: 0x2b, b: 0x2c, bh: 0x2d, m: 0x2e,
  y: 0x2f, r: 0x30, rr: 0x31, l: 0x32, L: 0x33, zh: 0x34, v: 0x35, w: 0x35,
  sh: 0x36, Sh: 0x37, s: 0x38, h: 0x39,
}

const VIRAMA = 0x4d
const ANUSVARA = 0x02
const VISARGA = 0x03

/** Offsets each script has no letter for (vowels, consonants and vowel signs). */
const unassigned: Record<PhoneticScript, number[]> = {
  devanagari: [],
  bengali: [0x0d, 0x0e, 0x11, 0x12, 0x29, 0x31, 0x33, 0x34, 0x35, 0x45, 0x46, 0x49, 0x4a],
  gurmukhi: [0x0b, 0x0c, 0x0d, 0x0e, 0x11, 0x12, 0x29, 0x31, 0x34, 0x37, 0x43, 0x45, 0x46, 0x49, 0x4a],
  gujarati: [0x0e, 0x12, 0x29, 0x31, 0x34, 0x46, 0x4a],
  oriya: [0x0d, 0x0e, 0x11, 0x12, 0x29, 0x31, 0x34, 0x45, 0x46, 0x49, 0x4a],
  tamil: [0x0b, 0x0c, 0x0d, 0x11, 0x16, 0x17, 0x18, 0x1b, 0x1d, 0x20, 0x21, 0x22, 0x25, 0x26, 0x27, 0x2b, 0x2c, 0x2d, 0x43, 0x45, 0x49],
  telugu: [0x29],
  kannada: [0x29, 0x34],
  malayalam: [],
}

/** Nearest available sound when a script lacks a letter. */
const fallbacks: Record<number, number> = {
  0x16: 0x15, 0x17: 0x15, 0x18: 0x15, // kh g gh → k
  0x1b: 0x1a, 0x1d: 0x1c, // chh → ch, jh → j
  0x20: 0x1f, 0x21: 0x1f, 0x22: 0x1f, // Th D Dh → T
  0x25: 0x24, 0x26: 0x24, 0x27: 0x24, // th d dh → t
  0x2b: 0x2a, 0x2c: 0x2a, 0x2d: 0x2a, // ph b bh → p
  0x31: 0x30, // rr → r
  0x34: 0x33, 0x33: 0x32, // zh → L → l
  0x35: 0x2c, // v → b (Bengali)
  0x37: 0x36, // Sh → sh (Punjabi)
  0x0e: 0x0f, 0x46: 0x47, 0x12: 0x13, 0x4a: 0x4b, // short e/o → long
}

/** Matching is greedy, so longer spellings are tried first. */
function tokenTable(script: PhoneticScript) {
  const table = new Map<string, Token>()
  for (const [key, v] of Object.entries(vowelTable(phoneticScripts[script].south))) table.set(key, v)
  for (const [key, offset] of Object.entries(consonants)) table.set(key, C(offset))
  // Tamil writes the English "sh" with ஷ (ssa), as in ஹரீஷ்.
  if (script === 'tamil') table.set('sh', C(0x37))
  table.set('M', { kind: 'mark', offset: ANUSVARA })
  table.set('H', { kind: 'mark', offset: VISARGA })
  return table
}

const MAX_KEY = 3

function resolve(script: PhoneticScript, offset: number): number | null {
  const missing = unassigned[script]
  let o: number | undefined = offset
  for (let guard = 0; o !== undefined && missing.includes(o) && guard < 4; guard++) o = fallbacks[o]
  return o === undefined || missing.includes(o) ? null : o
}

/**
 * Converts romanised text to `script`. Anything that is not a Latin letter
 * (spaces, digits, punctuation, text already in an Indian script) passes through.
 */
export function transliterate(input: string, script: PhoneticScript): string {
  const { base, south } = phoneticScripts[script]
  const table = tokenTable(script)
  const ch = (offset: number) => String.fromCodePoint(base + offset)
  let out = ''
  let pending = false // last output is a consonant still carrying its inherent "a"

  const endCluster = (wordEnd: boolean) => {
    // North Indian scripts drop the final "a" silently (हरीश); south Indian ones
    // mark a dead final consonant with a virama (ಹರೀಶ್).
    if (pending && (!wordEnd || south)) out += ch(VIRAMA)
    pending = false
  }

  let i = 0
  let wordStart = true
  while (i < input.length) {
    let token: Token | undefined
    let len = 0
    for (let n = Math.min(MAX_KEY, input.length - i); n > 0; n--) {
      let key = input.slice(i, i + n)
      // "Harish", "Ramesh": a capital starting a capitalised word is just a capital,
      // not retroflex/long. Capital vowels (A, E, I, O, U) keep their meaning.
      if (wordStart && /^[BCDGHJKLMNPRSTVWYZ]/.test(key) && /[a-z]/.test(input[i + 1] ?? '')) key = key[0].toLowerCase() + key.slice(1)
      const found = table.get(key)
      if (found) {
        token = found
        len = n
        break
      }
    }

    // x = k + sh (क्ष), the usual spelling of "ksh".
    if (!token && (input[i] === 'x' || (wordStart && input[i] === 'X'))) {
      if (pending) out += ch(VIRAMA)
      out += ch(0x15) + ch(VIRAMA) + ch(resolve(script, 0x37) ?? 0x36)
      pending = true
      i += 1
      wordStart = false
      continue
    }

    if (!token) {
      endCluster(true)
      out += input[i]
      wordStart = !/[A-Za-z]/.test(input[i])
      i += 1
      continue
    }

    i += len
    wordStart = false
    if (token.kind === 'consonant') {
      const offset = resolve(script, token.offset)
      if (offset === null) continue
      // Punjabi writes most clusters without a visible virama (ਗੁਰਪ੍ਰੀਤ); only r, h
      // and v take the subjoined form.
      if (pending && (script !== 'gurmukhi' || offset === 0x30 || offset === 0x39 || offset === 0x35)) out += ch(VIRAMA)
      out += ch(offset)
      pending = true
    } else if (token.kind === 'vowel') {
      if (pending) {
        if (token.sign !== null) {
          const sign = resolve(script, token.sign)
          if (sign !== null) out += ch(sign)
          // No vocalic-r sign (Tamil, Punjabi): spell it as "ri".
          else if (token.sign === 0x43) out += ch(VIRAMA) + ch(0x30) + ch(0x3f)
        }
        pending = false
      } else {
        const letter = resolve(script, token.letter)
        if (letter !== null) out += ch(letter)
        else if (token.letter === 0x0b) out += ch(0x30) + ch(0x3f)
      }
    } else {
      pending = false
      out += ch(token.offset)
    }
  }
  endCluster(true)
  return out
}
