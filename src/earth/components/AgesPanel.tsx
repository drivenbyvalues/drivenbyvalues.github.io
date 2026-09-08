import { useEffect, useState } from 'react'
import { cityLightsForAge } from '../data/cities'
import { humanAges } from '../data/human-ages'
import { sunPresets, type GlobeHandle } from '../globe/globe-scene'
import type { GlobeLabel } from './GlobeLabels'

interface AgesPanelProps {
  handle: GlobeHandle | null
  onLabels: (labels: GlobeLabel[]) => void
  selectedLabel: GlobeLabel | null
}

export function AgesPanel({ handle, onLabels, selectedLabel }: AgesPanelProps) {
  const [index, setIndex] = useState(humanAges.length - 1)
  const age = humanAges[index]

  useEffect(() => {
    if (!handle) return
    handle.setTime(index === 0 ? 0.012 : 0)
    handle.setSpin(0)
    handle.setSun(sunPresets.dusk)
    handle.setArcs([])
    handle.setLights(cityLightsForAge(index), age.lights, age.sprawl)
    handle.setMarkers(
      age.civilizations.map((c) => ({ id: `${age.id}-${c.name}`, lon: c.lon, lat: c.lat, color: age.accent, opacity: 0.95, size: 0.075 })),
    )
    onLabels(
      age.civilizations.map((c) => ({ id: `${age.id}-${c.name}`, lon: c.lon, lat: c.lat, text: c.name, detail: c.note, color: age.accent })),
    )
    const focus = age.civilizations[0]
    handle.focusOn(focus.lon, focus.lat, 1)
  }, [handle, index, age, onLabels])

  useEffect(() => () => onLabels([]), [onLabels])

  const highlighted = selectedLabel ? age.civilizations.find((c) => `${age.id}-${c.name}` === selectedLabel.id) : null

  return (
    <div className="earth-panel">
      <header className="earth-panel__head">
        <p className="earth-kicker" style={{ color: age.accent }}>
          <span className="earth-kicker__dot" style={{ background: age.accent }} />
          Age {index + 1} of {humanAges.length} · {age.span}
        </p>
        <h2 className="earth-panel__title">{age.name}</h2>
        <p className="earth-panel__time">{age.tagline}</p>
      </header>

      <nav className="earth-ages" aria-label="Ages of humanity">
        {humanAges.map((a, i) => (
          <button
            key={a.id}
            type="button"
            className={`earth-age-chip ${i === index ? 'is-active' : ''} ${i < index ? 'is-past' : ''}`}
            style={{ ['--age-accent' as string]: a.accent }}
            onClick={() => setIndex(i)}
            aria-current={i === index ? 'step' : undefined}
          >
            <i className={`fas ${a.icon}`} aria-hidden="true" />
            <span>{a.name}</span>
          </button>
        ))}
      </nav>

      <p className="earth-panel__lede">{age.summary}</p>
      <p className="earth-population">
        <i className="fas fa-users" aria-hidden="true" /> World population: {age.population}
      </p>

      {highlighted && (
        <div className="earth-highlight" style={{ ['--age-accent' as string]: age.accent }}>
          <strong>{highlighted.name}</strong>
          <span>{highlighted.note}</span>
        </div>
      )}

      <section className="earth-fact">
        <h3><i className="fas fa-landmark" aria-hidden="true" /> Major civilizations &amp; centres</h3>
        <ul className="earth-civs">
          {age.civilizations.map((c) => (
            <li key={c.name}>
              <button type="button" onClick={() => handle?.focusOn(c.lon, c.lat, 0.8)} style={{ ['--age-accent' as string]: age.accent }}>
                <span className="earth-civs__name">{c.name}</span>
                <span className="earth-civs__note">{c.note}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="earth-fact">
        <h3><i className="fas fa-bolt" aria-hidden="true" /> Breakthroughs</h3>
        <ul className="earth-list">
          {age.breakthroughs.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      </section>

      <section className="earth-fact">
        <h3><i className="fas fa-exchange-alt" aria-hidden="true" /> Problems &amp; how they were overcome</h3>
        <ol className="earth-challenges">
          {age.challenges.map((c) => (
            <li key={c.problem} style={{ ['--age-accent' as string]: age.accent }}>
              <div className="earth-challenge__problem">
                <span className="earth-challenge__tag">Problem</span>
                <p>{c.problem}</p>
              </div>
              <div className="earth-challenge__solution">
                <span className="earth-challenge__tag">Solution</span>
                <p>{c.solution}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <div className="earth-pager">
        <button type="button" className="btn btn-secondary" disabled={index === 0} onClick={() => setIndex((i) => Math.max(0, i - 1))}>
          <i className="fas fa-arrow-left" aria-hidden="true" /> {index > 0 ? humanAges[index - 1].name : 'Start'}
        </button>
        <button
          type="button"
          className="btn btn-primary"
          disabled={index === humanAges.length - 1}
          onClick={() => setIndex((i) => Math.min(humanAges.length - 1, i + 1))}
        >
          {index < humanAges.length - 1 ? humanAges[index + 1].name : 'Now'} <i className="fas fa-arrow-right" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
