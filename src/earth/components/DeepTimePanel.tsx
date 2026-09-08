import { useCallback, useEffect, useMemo, useState } from 'react'
import { eraAt, eras, formatMa, formatMaShort, maToTrack, trackToMa } from '../data/eras'
import { sunPresets, type GlobeHandle } from '../globe/globe-scene'
import { landCentroidAt } from '../globe/plates'
import { usePlayback } from '../use-playback'
import { PlayButton } from './PlayButton'

interface DeepTimePanelProps {
  handle: GlobeHandle | null
}

const allEvents = eras.flatMap((era) => era.events.map((e) => ({ ...e, accent: era.accent })))

export function DeepTimePanel({ handle }: DeepTimePanelProps) {
  const [track, setTrack] = useState(0)
  const ma = useMemo(() => trackToMa(track), [track])
  const era = eraAt(ma)
  const setPosition = useCallback((t: number) => setTrack(t), [])
  const { isPlaying, toggle, stop } = usePlayback(track, setPosition, 75)

  useEffect(() => {
    if (!handle) return
    handle.setTime(ma)
    const [lon, lat] = landCentroidAt(ma)
    handle.focusOn(lon, lat, 1)
  }, [handle, ma])

  useEffect(() => {
    handle?.setSpin(0.02)
    handle?.setSun(sunPresets.day)
    handle?.setArcs([])
    handle?.setMarkers([])
    handle?.setLights([], 0, 0)
  }, [handle])

  const latestEvent = allEvents.filter((e) => e.ma >= ma).sort((a, b) => a.ma - b.ma)[0]

  return (
    <div className="earth-panel">
      <header className="earth-panel__head">
        <p className="earth-kicker" style={{ color: era.accent }}>
          <span className="earth-kicker__dot" style={{ background: era.accent }} />
          {era.name} Eon · {era.start >= 1000 ? `${(era.start / 1000).toFixed(2)}` : era.start} – {era.end >= 1000 ? `${(era.end / 1000).toFixed(2)} Ga` : `${era.end} Ma`}
        </p>
        <h2 className="earth-panel__title">{era.tagline}</h2>
        <p className="earth-panel__time">{formatMa(ma)}</p>
      </header>

      <div className="earth-scrubber">
        <div className="earth-scrubber__row">
          <PlayButton isPlaying={isPlaying} onToggle={toggle} label="deep time" />
          <div className="earth-scrubber__track">
            <div className="earth-scrubber__eras" aria-hidden="true">
              {eras.map((e) => {
                const left = maToTrack(e.start) * 100
                const right = maToTrack(e.end) * 100
                return (
                  <button
                    key={e.id}
                    type="button"
                    className={`earth-scrubber__era ${era.id === e.id ? 'is-active' : ''}`}
                    style={{ left: `${left}%`, width: `${right - left}%`, ['--era-accent' as string]: e.accent }}
                    onClick={() => {
                      stop()
                      setTrack(maToTrack(e.start - 0.5))
                    }}
                    tabIndex={-1}
                  >
                    <span>{e.name}</span>
                  </button>
                )
              })}
            </div>
            <div className="earth-scrubber__ticks" aria-hidden="true">
              {allEvents.map((e) => (
                <span
                  key={`${e.ma}-${e.label}`}
                  className={`earth-scrubber__tick ${e.ma >= ma ? 'is-past' : ''}`}
                  style={{ left: `${maToTrack(e.ma) * 100}%`, background: e.accent }}
                />
              ))}
            </div>
            <input
              className="earth-range"
              type="range"
              min={0}
              max={1}
              step={0.0005}
              value={track}
              aria-label="Time before present"
              aria-valuetext={formatMa(ma)}
              onChange={(e) => {
                stop()
                setTrack(Number(e.target.value))
              }}
              style={{ ['--range-accent' as string]: era.accent, ['--range-progress' as string]: `${track * 100}%` }}
            />
          </div>
        </div>
        <div className="earth-scrubber__labels" aria-hidden="true">
          <span>4.54 Ga</span>
          <span>2.5 Ga</span>
          <span>541 Ma</span>
          <span>66 Ma</span>
          <span>Today</span>
        </div>
      </div>

      {latestEvent && (
        <div className="earth-event" key={latestEvent.label}>
          <span className="earth-event__marker" style={{ background: latestEvent.accent }} />
          <span className="earth-event__time">{formatMaShort(latestEvent.ma)}</span>
          <span className="earth-event__label">{latestEvent.label}</span>
        </div>
      )}

      <div className="earth-facts">
        <section className="earth-fact">
          <h3><i className="fas fa-globe" aria-hidden="true" /> The world</h3>
          <p>{era.world}</p>
        </section>
        <section className="earth-fact">
          <h3><i className="fas fa-wind" aria-hidden="true" /> Air and oceans</h3>
          <p>{era.atmosphere}</p>
        </section>
        <section className="earth-fact">
          <h3><i className="fas fa-seedling" aria-hidden="true" /> Life</h3>
          <p>{era.life}</p>
        </section>
      </div>

      <ol className="earth-events">
        {era.events.map((e) => (
          <li key={e.label} className={e.ma < ma ? 'is-future' : ''}>
            <button
              type="button"
              onClick={() => {
                stop()
                setTrack(maToTrack(e.ma))
              }}
            >
              <span className="earth-events__time">{formatMaShort(e.ma)}</span>
              <span className="earth-events__label">{e.label}</span>
            </button>
          </li>
        ))}
      </ol>

      <p className="earth-footnote">
        Continents are real present-day coastlines rotated back along schematic plate paths; terrain, oceans, ice and
        clouds are generated procedurally. Older than ~1 billion years the reconstruction is illustrative.
      </p>
    </div>
  )
}
