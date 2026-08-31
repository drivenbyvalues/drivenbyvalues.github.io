import { useState } from 'react'
import { normalizePath } from '../routing'

const navItems = [
  ['About', '/', 'fas fa-user'],
  ['Skills', '/skills/', 'fas fa-code'],
  ['Timeline', '/timeline/', 'fas fa-history'],
  ['Articles', '/articles/', 'fas fa-feather-alt'],
  ['Interests', '/interests/', 'fas fa-palette'],
  ['Certifications', '/certifications/', 'fas fa-certificate'],
  ['Learning', '/learning/', 'fas fa-graduation-cap'],
  ['Years', '/years/', 'fas fa-calendar-alt'],
  ['Contact', '/#contact', 'fas fa-envelope'],
] as const

export function SiteNavigation({ currentPath }: { currentPath: string }) {
  const [open, setOpen] = useState(false)

  return (
    <nav className="main-nav" aria-label="Primary navigation">
      <div className="nav-container">
        <a href="/" className="nav-logo" onClick={() => setOpen(false)}>
          <i className="fas fa-compass" aria-hidden="true" />
          Driven By Values
        </a>
        <div className={`nav-links ${open ? 'active' : ''}`} id="primary-navigation">
          {navItems.map(([label, href, icon]) => {
            const itemPath = normalizePath(href.split('#')[0])
            const active = itemPath === '/'
              ? currentPath === '/'
              : currentPath === itemPath || currentPath.startsWith(itemPath)
            return (
              <a key={label} href={href} className={active ? 'active' : ''} onClick={() => setOpen(false)}>
                <i className={icon} aria-hidden="true" /> {label}
              </a>
            )
          })}
        </div>
        <button
          className="mobile-menu-toggle"
          type="button"
          aria-controls="primary-navigation"
          aria-expanded={open}
          aria-label={open ? 'Close navigation' : 'Open navigation'}
          onClick={() => setOpen((value) => !value)}
        >
          <i className={`fas ${open ? 'fa-times' : 'fa-bars'}`} aria-hidden="true" />
        </button>
      </div>
    </nav>
  )
}
