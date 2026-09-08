import { useEffect, useRef } from 'react'
import type { GlobeHandle } from '../globe/globe-scene'

export interface GlobeLabel {
  id: string
  lon: number
  lat: number
  text: string
  detail?: string
  color: string
  emphasis?: boolean
}

interface GlobeLabelsProps {
  handle: GlobeHandle | null
  labels: GlobeLabel[]
  onSelect?: (label: GlobeLabel) => void
}

/** HTML labels pinned to points on the globe. Positions are written directly
 * to the DOM every frame so React never re-renders on animation. */
export function GlobeLabels({ handle, labels, onSelect }: GlobeLabelsProps) {
  const nodes = useRef(new Map<string, HTMLButtonElement>())

  useEffect(() => {
    if (!handle) return
    const placed: Array<{ x: number; y: number; w: number }> = []
    return handle.onFrame(() => {
      placed.length = 0
      for (const label of labels) {
        const el = nodes.current.get(label.id)
        if (!el) continue
        const p = handle.project(label.lon, label.lat)
        const fade = Math.min(1, Math.max(0, (p.facing - 0.08) / 0.3))
        let y = p.y
        if (p.visible) {
          // Nudge labels down when they would sit on top of an earlier one.
          const w = el.offsetWidth || 90
          for (let tries = 0; tries < 4; tries++) {
            const hit = placed.some((r) => Math.abs(r.y - y) < 22 && p.x < r.x + r.w && p.x + w > r.x)
            if (!hit) break
            y += 22
          }
          placed.push({ x: p.x, y, w })
        }
        el.style.transform = `translate(${p.x.toFixed(1)}px, ${y.toFixed(1)}px)`
        el.style.opacity = p.visible ? String(fade) : '0'
        el.style.pointerEvents = p.visible && fade > 0.4 ? 'auto' : 'none'
      }
    })
  }, [handle, labels])

  return (
    <div className="globe-labels" aria-hidden={labels.length === 0}>
      {labels.map((label) => (
        <button
          key={label.id}
          type="button"
          ref={(el) => {
            if (el) nodes.current.set(label.id, el)
            else nodes.current.delete(label.id)
          }}
          className={`globe-label ${label.emphasis ? 'globe-label--emphasis' : ''}`}
          style={{ ['--label-color' as string]: label.color, opacity: 0 }}
          onClick={() => onSelect?.(label)}
          title={label.detail}
        >
          <span className="globe-label__dot" />
          <span className="globe-label__text">{label.text}</span>
        </button>
      ))}
    </div>
  )
}
