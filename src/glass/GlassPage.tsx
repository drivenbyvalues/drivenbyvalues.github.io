import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { MAX_SAMPLES, glassFonts, materialKinds, type GlassFont, type MaterialKind, type TextBuildResult } from './glass-scene'
import {
  MAX_TEXT_LENGTH,
  defaultGlassSettings,
  lightPresets,
  parseGlassSettings,
  serializeGlassSettings,
  tintPresets,
  type GlassSettings,
} from './glass-params'
import type { Backdrop } from './studio-environment'
import { useGlass } from './use-glass'
import { phoneticScripts, transliterate, type PhoneticScript } from './transliterate'
import './glass.css'

type RenderState = { kind: 'live' } | { kind: 'loading' } | { kind: 'rendering'; samples: number } | { kind: 'error'; message: string }

/** One-tap samples so visitors without an Indian-language keyboard can try it. */
const sampleNames = [
  { text: 'Harish', lang: 'en', label: 'English' },
  { text: 'ಹರೀಶ್', lang: 'kn', label: 'Kannada' },
  { text: 'हरीश', lang: 'hi', label: 'Hindi' },
  { text: 'ஹரீஷ்', lang: 'ta', label: 'Tamil' },
  { text: 'హరీష్', lang: 'te', label: 'Telugu' },
]

const backdropLabels: Record<Backdrop, string> = {
  midnight: 'Midnight',
  studio: 'Studio grey',
  daylight: 'Daylight',
  sunset: 'Sunset',
  aurora: 'Aurora',
  neon: 'Neon city',
  photo: 'Your photo',
}

/** Largest side of an uploaded backdrop photo; plenty for a full-screen background. */
const MAX_PHOTO_SIDE = 2048
const PHONETIC_KEY = 'glass-phonetic'

function storedPhonetic(): PhoneticScript | '' {
  try {
    const v = window.localStorage.getItem(PHONETIC_KEY)
    return v && v in phoneticScripts ? (v as PhoneticScript) : ''
  } catch {
    return ''
  }
}

/** Decodes and downsizes a picked image file; it never leaves the device. */
async function loadPhoto(file: File) {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_PHOTO_SIDE / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  return canvas
}

export function GlassPage() {
  const stageRef = useRef<HTMLDivElement>(null)
  const [settings, setSettings] = useState<GlassSettings>(() => parseGlassSettings(window.location.search))
  const [render, setRender] = useState<RenderState>({ kind: 'live' })
  const [copied, setCopied] = useState(false)
  const [textInfo, setTextInfo] = useState<TextBuildResult | null>(null)
  const [phonetic, setPhonetic] = useState<PhoneticScript | ''>(storedPhonetic)
  const [roman, setRoman] = useState('')
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoError, setPhotoError] = useState(false)
  const photoInput = useRef<HTMLInputElement>(null)
  const onInterrupted = useCallback(() => setRender({ kind: 'live' }), [])
  const { handle, supported } = useGlass(stageRef, onInterrupted)

  const update = <K extends keyof GlassSettings>(key: K, value: GlassSettings[K]) => setSettings((s) => ({ ...s, [key]: value }))

  // Text/font rebuild geometry, so debounce while typing.
  useEffect(() => {
    if (!handle) return
    const id = window.setTimeout(() => {
      handle
        .setText(settings.text, settings.font, settings.kind)
        .then((info) => info && setTextInfo(info))
        .catch((err) => {
          console.error('[glass] text build failed', err)
          setTextInfo({ shaped: true, scripts: [], missing: ['…'] })
        })
    }, 250)
    return () => window.clearTimeout(id)
  }, [handle, settings.text, settings.font, settings.kind])

  useEffect(() => {
    handle?.setMaterial({
      kind: settings.kind,
      tint: settings.tint,
      tintStrength: settings.tintStrength,
      frost: settings.frost,
      thickness: settings.thickness,
      dispersion: settings.dispersion,
    })
  }, [handle, settings.kind, settings.tint, settings.tintStrength, settings.frost, settings.thickness, settings.dispersion])

  useEffect(() => {
    handle?.setLight({
      color: settings.lightColor,
      intensity: settings.lightIntensity,
      azimuth: settings.lightAzimuth,
      elevation: settings.lightElevation,
    })
  }, [handle, settings.lightColor, settings.lightIntensity, settings.lightAzimuth, settings.lightElevation])

  // A photo can't come from a share link, so 'photo' without one falls back.
  useEffect(() => {
    if (settings.backdrop === 'photo' && !photoPreview) update('backdrop', defaultGlassSettings.backdrop)
    else handle?.setBackdrop(settings.backdrop)
  }, [handle, settings.backdrop, photoPreview])

  useEffect(() => {
    try {
      if (phonetic) window.localStorage.setItem(PHONETIC_KEY, phonetic)
      else window.localStorage.removeItem(PHONETIC_KEY)
    } catch {
      /* private mode: just don't remember */
    }
  }, [phonetic])

  useEffect(() => () => void (photoPreview && URL.revokeObjectURL(photoPreview)), [photoPreview])

  function typeText(value: string) {
    if (phonetic) {
      setRoman(value)
      update('text', transliterate(value, phonetic).slice(0, MAX_TEXT_LENGTH))
    } else {
      update('text', value)
    }
  }

  function choosePhonetic(next: PhoneticScript | '') {
    setPhonetic(next)
    if (!next) return
    // Carry over what's typed if it's in English letters; otherwise start fresh.
    const latin = /^[ -~]*$/.test(settings.text) ? settings.text : ''
    setRoman(latin)
    if (latin) update('text', transliterate(latin, next).slice(0, MAX_TEXT_LENGTH))
  }

  async function pickPhoto(file: File | undefined) {
    if (!file || !handle) return
    try {
      const canvas = await loadPhoto(file)
      handle.setBackdropPhoto(canvas)
      setPhotoPreview(URL.createObjectURL(file))
      setPhotoError(false)
      update('backdrop', 'photo')
    } catch (err) {
      console.error('[glass] photo failed to load', err)
      setPhotoError(true)
    }
  }
  useEffect(() => handle?.setAutoRotate(settings.autoRotate), [handle, settings.autoRotate])

  // Keep the address bar shareable without adding history entries.
  useEffect(() => {
    const id = window.setTimeout(() => {
      const url = `${window.location.pathname}${serializeGlassSettings(settings)}`
      window.history.replaceState(window.history.state, '', url)
    }, 400)
    return () => window.clearTimeout(id)
  }, [settings])

  async function toggleRender() {
    if (!handle) return
    if (render.kind === 'rendering' || render.kind === 'loading') {
      handle.stopPathTrace()
      setRender({ kind: 'live' })
      return
    }
    setRender({ kind: 'loading' })
    try {
      await handle.startPathTrace((samples) => setRender({ kind: 'rendering', samples }))
    } catch (err) {
      console.error('[glass] path tracer failed', err)
      setRender({ kind: 'error', message: 'Ray-traced render is not available on this device.' })
    }
  }

  function downloadPng() {
    if (!handle) return
    const link = document.createElement('a')
    const name = settings.text.trim().replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'glass'
    link.download = `${name}-glass.png`
    link.href = handle.snapshot()
    link.click()
  }

  async function copyLink() {
    const url = `${window.location.origin}${window.location.pathname}${serializeGlassSettings(settings)}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      window.prompt('Copy this link', url)
    }
  }

  const rendering = render.kind === 'rendering' || render.kind === 'loading'
  const progress = render.kind === 'rendering' ? Math.min(1, render.samples / MAX_SAMPLES) : 0

  return (
    <div className="glass-page">
      <header className="glass-hero">
        <p className="glass-hero__kicker">Glass studio</p>
        <h1>Your name, in glass, crystal or diamond</h1>
        <p className="glass-hero__lede">
          Type any name and it's turned into beveled, refracting glass, or faceted crystal and diamond. Drag to turn it, choose the tint and the light, then press{' '}
          <strong>Render</strong> for a ray-traced still, the way Maya used to let you.
        </p>
      </header>

      <div className="glass-layout">
        <div className="glass-stage-wrap">
          {supported ? (
            <div ref={stageRef} className="glass-stage" aria-label={`3D glass text reading ${settings.text}`} role="img" />
          ) : (
            <p className="glass-stage__fallback">This browser doesn't support WebGL 2, which the glass studio needs. Try a recent Chrome, Edge, Firefox or Safari.</p>
          )}
          {supported && (
            <div className="glass-stage__status" aria-live="polite">
              {render.kind === 'loading' && 'Preparing the ray tracer…'}
              {render.kind === 'rendering' &&
                (render.samples >= MAX_SAMPLES ? `Render complete · ${render.samples} samples` : `Ray tracing · ${render.samples} / ${MAX_SAMPLES} samples`)}
              {render.kind === 'live' && 'Drag to rotate · scroll or pinch to zoom'}
              {render.kind === 'error' && render.message}
              {render.kind === 'rendering' && (
                <span className="glass-stage__progress" style={{ '--glass-progress': `${progress * 100}%` } as CSSProperties} />
              )}
            </div>
          )}
        </div>

        <aside className="glass-panel" aria-label="Glass controls">
          <Field label="Text" htmlFor="glass-text">
            <input
              id="glass-text"
              className="glass-input"
              type="text"
              value={phonetic ? roman : settings.text}
              maxLength={MAX_TEXT_LENGTH}
              placeholder={phonetic ? `Type in English letters, e.g. ${phoneticScripts[phonetic].example}` : 'Type a name'}
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              onChange={(e) => typeText(e.target.value)}
            />
          </Field>
          <div className="glass-phonetic">
            <label htmlFor="glass-phonetic" className="glass-phonetic__label">
              Keyboard
            </label>
            <select id="glass-phonetic" className="glass-input glass-input--compact" value={phonetic} onChange={(e) => choosePhonetic(e.target.value as PhoneticScript | '')}>
              <option value="">Type directly (any language)</option>
              {(Object.keys(phoneticScripts) as PhoneticScript[]).map((k) => (
                <option key={k} value={k}>
                  Phonetic → {phoneticScripts[k].label}
                </option>
              ))}
            </select>
          </div>
          {phonetic && (
            <p className="glass-note glass-note--flush">
              <span className="glass-phonetic__result" lang="und">
                {settings.text || '…'}
              </span>
              <br />
              Long vowels: aa, ee, oo (or A, I, U), E, O. Capitals for hard sounds: T, D, N, L, Sh. x = ksh, M = ṁ.
            </p>
          )}
          <div className="glass-try" aria-label="Try a script">
            {sampleNames.map((s) => (
              <button key={s.text} type="button" className="glass-chip" lang={s.lang} title={s.label} onClick={() => {
                  setPhonetic('')
                  update('text', s.text)
                }}>
                {s.text}
              </button>
            ))}
          </div>
          <p className="glass-note" aria-live="polite">
            {textInfo?.shaped
              ? `Shaped with Noto Sans · ${textInfo.scripts.join(', ')}`
              : 'Type in English or any Indian script: Kannada, Hindi, Tamil, Telugu, Malayalam, Bengali, Gujarati, Punjabi or Odia.'}
          </p>
          {textInfo && textInfo.missing.length > 0 && (
            <p className="glass-note glass-note--warn" role="status">
              Not supported yet: {textInfo.missing.join(' ')} (for example Chinese, Japanese, Arabic or emoji).
            </p>
          )}

          <Field label="Font" htmlFor="glass-font">
            <select
              id="glass-font"
              className="glass-input"
              value={settings.font}
              disabled={textInfo?.shaped}
              title={textInfo?.shaped ? 'Indian scripts use Noto Sans Bold' : undefined}
              onChange={(e) => update('font', e.target.value as GlassFont)}
            >
              {Object.entries(glassFonts).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </Field>

          <section className="glass-group">
            <h2 className="glass-group__title">Material</h2>
            <div className="glass-segmented" role="radiogroup" aria-label="Material">
              {(Object.keys(materialKinds) as MaterialKind[]).map((k) => (
                <button
                  key={k}
                  type="button"
                  role="radio"
                  aria-checked={settings.kind === k}
                  className={settings.kind === k ? 'is-active' : ''}
                  onClick={() => update('kind', k)}
                >
                  {materialKinds[k].label}
                </button>
              ))}
            </div>
            <p className="glass-note glass-note--flush">
              Refractive index {materialKinds[settings.kind].ior.toFixed(2)}
              {settings.kind === 'glass' ? ' · smooth bevels' : ' · faceted cut'}
            </p>
            <ColorRow label="Tint" value={settings.tint} presets={tintPresets} onChange={(v) => update('tint', v)} />
            <Slider label="Tint strength" value={settings.tintStrength} min={0} max={1} step={0.01} onChange={(v) => update('tintStrength', v)} />
            <Slider label="Frost" value={settings.frost} min={0} max={1} step={0.01} onChange={(v) => update('frost', v)} />
            <Slider label="Thickness" value={settings.thickness} min={0.2} max={3} step={0.05} onChange={(v) => update('thickness', v)} />
            <Slider label="Fire (dispersion)" value={settings.dispersion} min={0} max={1} step={0.01} onChange={(v) => update('dispersion', v)} />
          </section>

          <section className="glass-group">
            <h2 className="glass-group__title">Light</h2>
            <ColorRow label="Colour" value={settings.lightColor} presets={lightPresets} onChange={(v) => update('lightColor', v)} />
            <Slider label="Brightness" value={settings.lightIntensity} min={0} max={10} step={0.1} onChange={(v) => update('lightIntensity', v)} />
            <Slider label="Direction" value={settings.lightAzimuth} min={-180} max={180} step={1} unit="°" onChange={(v) => update('lightAzimuth', v)} />
            <Slider label="Height" value={settings.lightElevation} min={0} max={85} step={1} unit="°" onChange={(v) => update('lightElevation', v)} />
          </section>

          <section className="glass-group">
            <h2 className="glass-group__title">Scene</h2>
            <div className="glass-backdrops" role="radiogroup" aria-label="Backdrop">
              {(Object.keys(backdropLabels) as Backdrop[]).map((b) => (
                <button
                  key={b}
                  type="button"
                  role="radio"
                  aria-checked={settings.backdrop === b}
                  className={`glass-backdrop glass-backdrop--${b}${settings.backdrop === b ? ' is-active' : ''}`}
                  style={b === 'photo' && photoPreview ? { backgroundImage: `url(${photoPreview})` } : undefined}
                  onClick={() => (b === 'photo' && !photoPreview ? photoInput.current?.click() : update('backdrop', b))}
                >
                  <span>{b === 'photo' && !photoPreview ? 'Upload photo' : backdropLabels[b]}</span>
                </button>
              ))}
            </div>
            <input
              ref={photoInput}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                void pickPhoto(e.target.files?.[0])
                e.target.value = ''
              }}
            />
            {photoPreview && (
              <button type="button" className="glass-link" onClick={() => photoInput.current?.click()}>
                Choose a different photo
              </button>
            )}
            {photoError && (
              <p className="glass-note glass-note--warn glass-note--flush" role="status">
                That image couldn't be opened. Try a JPEG or PNG.
              </p>
            )}
            <p className="glass-note glass-note--flush">Your photo stays on this device; share links use the default backdrop instead.</p>
            <label className="glass-check">
              <input type="checkbox" checked={settings.autoRotate} onChange={(e) => update('autoRotate', e.target.checked)} />
              Turntable spin
            </label>
          </section>

          <div className="glass-actions">
            <button type="button" className="glass-btn glass-btn--primary" onClick={toggleRender} disabled={!handle || render.kind === 'error'}>
              <i className={rendering ? 'fas fa-stop' : 'fas fa-camera-retro'} aria-hidden="true" /> {rendering ? 'Back to live view' : 'Render'}
            </button>
            <button type="button" className="glass-btn" onClick={downloadPng} disabled={!handle}>
              <i className="fas fa-download" aria-hidden="true" /> Download PNG
            </button>
            <button type="button" className="glass-btn" onClick={copyLink}>
              <i className={copied ? 'fas fa-check' : 'fas fa-link'} aria-hidden="true" /> {copied ? 'Link copied' : 'Copy share link'}
            </button>
            <button type="button" className="glass-btn glass-btn--ghost" onClick={() => setSettings({ ...defaultGlassSettings, text: settings.text })}>
              <i className="fas fa-undo" aria-hidden="true" /> Reset look
            </button>
          </div>
        </aside>
      </div>
    </div>
  )
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: ReactNode }) {
  return (
    <div className="glass-field">
      <label htmlFor={htmlFor} className="glass-label">
        {label}
      </label>
      {children}
    </div>
  )
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  unit = '',
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  unit?: string
  onChange: (v: number) => void
}) {
  const id = `glass-${label.toLowerCase().replace(/[^a-z]+/g, '-')}`
  const pct = ((value - min) / (max - min)) * 100
  const shown = step >= 1 ? Math.round(value) : value.toFixed(2)
  return (
    <div className="glass-field">
      <div className="glass-field__row">
        <label htmlFor={id} className="glass-label">
          {label}
        </label>
        <span className="glass-value">
          {shown}
          {unit}
        </span>
      </div>
      <input
        id={id}
        className="glass-range"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        style={{ '--glass-range-progress': `${pct}%` } as CSSProperties}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  )
}

function ColorRow({
  label,
  value,
  presets,
  onChange,
}: {
  label: string
  value: string
  presets: { label: string; color: string }[]
  onChange: (v: string) => void
}) {
  const id = `glass-color-${label.toLowerCase()}`
  return (
    <div className="glass-field">
      <div className="glass-field__row">
        <label htmlFor={id} className="glass-label">
          {label}
        </label>
        <span className="glass-value">{value.toUpperCase()}</span>
      </div>
      <div className="glass-swatches">
        <input id={id} className="glass-color" type="color" value={value} onChange={(e) => onChange(e.target.value)} />
        {presets.map((p) => (
          <button
            key={p.color}
            type="button"
            className={`glass-swatch ${p.color.toLowerCase() === value.toLowerCase() ? 'is-active' : ''}`}
            style={{ background: p.color }}
            title={p.label}
            aria-label={`${label}: ${p.label}`}
            onClick={() => onChange(p.color)}
          />
        ))}
      </div>
    </div>
  )
}
