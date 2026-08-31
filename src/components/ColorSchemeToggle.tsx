import { useEffect, useState } from 'react'

type Mode = 'system' | 'light' | 'dark'

const STORAGE_KEY = 'dbv-color-scheme'

function getInitialMode(): Mode {
  if (typeof window === 'undefined') return 'system'
  const stored = window.localStorage.getItem(STORAGE_KEY)
  return stored === 'light' || stored === 'dark' ? stored : 'system'
}

function resolve(mode: Mode): 'light' | 'dark' {
  if (mode !== 'system') return mode
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const modes: { mode: Mode; icon: string; label: string }[] = [
  { mode: 'light', icon: 'fa-sun', label: 'Light' },
  { mode: 'dark', icon: 'fa-moon', label: 'Dark' },
  { mode: 'system', icon: 'fa-desktop', label: 'System' },
]

/** Light / dark / system control. Applies the resolved scheme as
 * data-color-scheme on <html> (a blocking inline script in index.html sets
 * this before first paint to avoid a flash); this component keeps it in
 * sync afterwards and reacts to OS-level changes while on "system". */
export function ColorSchemeToggle() {
  const [mode, setMode] = useState<Mode>(getInitialMode)

  useEffect(() => {
    const apply = () => {
      document.documentElement.setAttribute('data-color-scheme', resolve(mode))
    }
    apply()
    window.localStorage.setItem(STORAGE_KEY, mode)

    if (mode === 'system') {
      const media = window.matchMedia('(prefers-color-scheme: dark)')
      media.addEventListener('change', apply)
      return () => media.removeEventListener('change', apply)
    }
  }, [mode])

  return (
    <div className="color-scheme-toggle" role="group" aria-label="Color scheme">
      {modes.map(({ mode: m, icon, label }) => (
        <button
          key={m}
          type="button"
          className={`color-scheme-toggle__option ${mode === m ? 'active' : ''}`}
          onClick={() => setMode(m)}
          aria-pressed={mode === m}
          title={`${label} mode`}
        >
          <i className={`fas ${icon}`} aria-hidden="true" />
          <span className="sr-only">{label} mode</span>
        </button>
      ))}
    </div>
  )
}
