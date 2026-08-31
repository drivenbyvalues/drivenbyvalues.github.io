import { useEffect, useState } from 'react'

type Theme = 'current' | 'future'

const STORAGE_KEY = 'dbv-theme'

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'future'
  const stored = window.localStorage.getItem(STORAGE_KEY)
  return stored === 'current' ? 'current' : 'future'
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    if (theme === 'future') {
      document.documentElement.setAttribute('data-theme', 'future')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
    window.localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  const isFuture = theme === 'future'

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={() => setTheme(isFuture ? 'current' : 'future')}
      aria-pressed={isFuture}
      title={isFuture ? 'Switch to the classic design' : 'Switch back to the new look'}
    >
      <i className={`fas ${isFuture ? 'fa-wand-magic-sparkles' : 'fa-swatchbook'}`} aria-hidden="true" />
      <span>{isFuture ? 'New look' : 'Classic look'}</span>
      <span className="theme-toggle__track" aria-hidden="true">
        <span className="theme-toggle__thumb" />
      </span>
    </button>
  )
}
