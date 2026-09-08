import { useCallback, useRef, useState } from 'react'
import { AgesPanel } from './components/AgesPanel'
import { DeepTimePanel } from './components/DeepTimePanel'
import { GlobeLabels, type GlobeLabel } from './components/GlobeLabels'
import { MigrationPanel } from './components/MigrationPanel'
import { useGlobe } from './use-globe'
import './earth.css'

type Chapter = 'deep-time' | 'migration' | 'ages'

const chapters: Array<{ id: Chapter; label: string; icon: string; blurb: string }> = [
  { id: 'deep-time', label: 'Deep Time', icon: 'fa-hourglass-half', blurb: '4.54 billion years of a changing planet' },
  { id: 'migration', label: 'Human Migration', icon: 'fa-route', blurb: '300,000 years out of Africa' },
  { id: 'ages', label: 'Ages of Humanity', icon: 'fa-layer-group', blurb: 'Stone to silicon to AI' },
]

export function EarthPage() {
  const stageRef = useRef<HTMLDivElement>(null)
  const { handle, progress, isReady } = useGlobe(stageRef, 4540)
  const [chapter, setChapter] = useState<Chapter>('deep-time')
  const [labels, setLabels] = useState<GlobeLabel[]>([])
  const [selectedLabel, setSelectedLabel] = useState<GlobeLabel | null>(null)
  const onLabels = useCallback((next: GlobeLabel[]) => {
    setLabels(next)
    setSelectedLabel(null)
  }, [])

  const selectLabel = useCallback(
    (label: GlobeLabel) => {
      setSelectedLabel(label)
      handle?.focusOn(label.lon, label.lat, 0.75)
    },
    [handle],
  )

  return (
    <div className="earth-page">
      {/* THESIS: one living globe, three chapters—planet, people, progress—read like a single continuous story. */}
      <header className="earth-hero">
        <p className="earth-hero__kicker">An interactive history</p>
        <h1>Earth, and everyone on it</h1>
        <p className="earth-hero__lede">
          Scrub through 4.5 billion years of drifting continents, follow the first humans across every ocean, then step
          through the eight ages that took us from flint to frontier AI—and the problems each one had to solve.
        </p>
      </header>

      <nav className="earth-chapters-nav" aria-label="Chapters">
        {chapters.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`earth-chapter ${chapter === c.id ? 'is-active' : ''}`}
            onClick={() => setChapter(c.id)}
            aria-current={chapter === c.id ? 'page' : undefined}
          >
            <i className={`fas ${c.icon}`} aria-hidden="true" />
            <span className="earth-chapter__label">{c.label}</span>
            <span className="earth-chapter__blurb">{c.blurb}</span>
          </button>
        ))}
      </nav>

      <div className="earth-layout">
        <div className="earth-stage-wrap">
          <div className="earth-stage" ref={stageRef} role="img" aria-label="Interactive 3D globe. Drag to rotate, scroll to zoom." />
          <GlobeLabels handle={handle} labels={labels} onSelect={selectLabel} />
          {!isReady && (
            <div className="earth-loading" role="status" aria-live="polite">
              <div className="earth-loading__ring" style={{ ['--progress' as string]: progress }} />
              <p>Forming the planet… {Math.round(progress * 100)}%</p>
            </div>
          )}
          <p className="earth-stage__hint">
            <i className="fas fa-hand-pointer" aria-hidden="true" /> Drag to rotate · scroll to zoom
          </p>
        </div>

        <aside className="earth-side" key={chapter}>
          {chapter === 'deep-time' && <DeepTimePanel handle={handle} />}
          {chapter === 'migration' && <MigrationPanel handle={handle} onLabels={onLabels} />}
          {chapter === 'ages' && <AgesPanel handle={handle} onLabels={onLabels} selectedLabel={selectedLabel} />}
        </aside>
      </div>
    </div>
  )
}
