import { useCallback, useEffect, useMemo, useState } from 'react'
import { formatKya, migrationChapters, routeFamilies, routes, waypoints } from '../data/migration'
import { sunPresets, type GlobeHandle } from '../globe/globe-scene'
import { usePlayback } from '../use-playback'
import type { GlobeLabel } from './GlobeLabels'
import { PlayButton } from './PlayButton'

interface MigrationPanelProps {
  handle: GlobeHandle | null
  onLabels: (labels: GlobeLabel[]) => void
}

const MAX_KYA = 300
const MIN_KYA = 0.6
const waypointById = new Map(waypoints.map((w) => [w.id, w]))

function trackToKya(t: number) {
  return MAX_KYA * Math.pow(MIN_KYA / MAX_KYA, Math.min(1, Math.max(0, t)))
}
function kyaToTrack(kya: number) {
  return Math.log(kya / MAX_KYA) / Math.log(MIN_KYA / MAX_KYA)
}

export function MigrationPanel({ handle, onLabels }: MigrationPanelProps) {
  const [track, setTrack] = useState(0)
  const kya = useMemo(() => trackToKya(track), [track])
  const setPosition = useCallback((t: number) => setTrack(t), [])
  const { isPlaying, toggle, stop } = usePlayback(track, setPosition, 60)

  const chapter = [...migrationChapters].reverse().find((c) => c.kya >= kya) ?? migrationChapters[0]

  useEffect(() => {
    if (!handle) return
    // Last glacial maximum look for the ice-age crossings, modern after.
    handle.setTime(kya > 11.7 ? 0.02 : kya > 6 ? 0.012 : 0)
    handle.setSpin(0)
    handle.setSun(sunPresets.day)
    handle.setLights([], 0, 0)
  }, [handle, kya > 11.7, kya > 6]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!handle) return
    handle.setArcs(
      routes
        .filter((r) => r.start >= kya)
        .map((r) => {
          const from = waypointById.get(r.from)!
          const to = waypointById.get(r.to)!
          const progress = Math.min(1, Math.max(0, (r.start - kya) / (r.start - r.end)))
          return { id: r.id, from: [from.lon, from.lat], to: [to.lon, to.lat], progress, color: routeFamilies[r.family].color }
        }),
    )
    const settled = waypoints.filter((w) => w.kya >= kya)
    handle.setMarkers(
      settled.map((w) => ({
        id: w.id,
        lon: w.lon,
        lat: w.lat,
        color: '#fff7ed',
        opacity: Math.min(1, (w.kya - kya) / (w.kya * 0.12 + 0.2) + 0.35),
        size: w.id === 'eastAfrica' ? 0.1 : 0.065,
      })),
    )
    onLabels(
      settled.map((w) => ({ id: w.id, lon: w.lon, lat: w.lat, text: w.name, detail: w.evidence, color: '#fde68a', emphasis: w.id === 'eastAfrica' })),
    )
  }, [handle, kya, onLabels])

  // Follow the frontier: whichever place was reached most recently.
  const frontier = waypoints.filter((w) => w.kya >= kya).sort((a, b) => a.kya - b.kya)[0] ?? waypoints[0]
  useEffect(() => {
    handle?.focusOn(frontier.lon, frontier.lat, 1)
  }, [handle, frontier])

  useEffect(() => () => onLabels([]), [onLabels])

  return (
    <div className="earth-panel">
      <header className="earth-panel__head">
        <p className="earth-kicker" style={{ color: '#fbbf24' }}>
          <span className="earth-kicker__dot" style={{ background: '#fbbf24' }} />
          Homo sapiens · out of Africa
        </p>
        <h2 className="earth-panel__title">{chapter.title}</h2>
        <p className="earth-panel__time">{formatKya(kya)}</p>
      </header>

      <div className="earth-scrubber">
        <div className="earth-scrubber__row">
          <PlayButton isPlaying={isPlaying} onToggle={toggle} label="migration" />
          <div className="earth-scrubber__track">
            <div className="earth-scrubber__ticks" aria-hidden="true">
              {waypoints.map((w) => (
                <span
                  key={w.id}
                  className={`earth-scrubber__tick ${w.kya <= kya ? 'is-past' : ''}`}
                  style={{ left: `${kyaToTrack(w.kya) * 100}%`, background: '#fbbf24' }}
                />
              ))}
            </div>
            <input
              className="earth-range"
              type="range"
              min={0}
              max={1}
              step={0.001}
              value={track}
              aria-label="Thousands of years ago"
              aria-valuetext={formatKya(kya)}
              onChange={(e) => {
                stop()
                setTrack(Number(e.target.value))
              }}
              style={{ ['--range-accent' as string]: '#fbbf24', ['--range-progress' as string]: `${track * 100}%` }}
            />
          </div>
        </div>
        <div className="earth-scrubber__labels" aria-hidden="true">
          <span>300 kya</span>
          <span>60 kya</span>
          <span>15 kya</span>
          <span>3 kya</span>
          <span>Today</span>
        </div>
      </div>

      <p className="earth-panel__lede">{chapter.text}</p>

      <ul className="earth-legend">
        {Object.entries(routeFamilies).map(([key, fam]) => (
          <li key={key}>
            <span style={{ background: fam.color }} />
            {fam.label}
          </li>
        ))}
      </ul>

      <ol className="earth-chapters">
        {migrationChapters.map((c) => (
          <li key={c.kya} className={c.kya === chapter.kya ? 'is-active' : c.kya < kya ? 'is-future' : ''}>
            <button
              type="button"
              onClick={() => {
                stop()
                setTrack(kyaToTrack(Math.max(MIN_KYA, c.kya - 0.01)))
              }}
            >
              <span className="earth-events__time">{formatKya(c.kya)}</span>
              <span className="earth-events__label">{c.title}</span>
            </button>
          </li>
        ))}
      </ol>

      <p className="earth-footnote">
        Dates follow current archaeological and genetic consensus and remain debated at the margins (e.g. Madjedbebe at
        65 kya, White Sands at 23 kya). Hover or tap a label on the globe for the key site.
      </p>
    </div>
  )
}
