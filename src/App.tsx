import { Suspense, lazy, useEffect, useMemo, useState } from 'react'
import generatedPages from './generated/content.json'
import { ArticlePage } from './components/ArticlePage'
import { HtmlContent } from './components/HtmlContent'
import { PageEnhancements } from './components/PageEnhancements'
import { SiteNavigation } from './components/SiteNavigation'
import { ThemeToggle } from './components/ThemeToggle'
import { YearPage } from './components/YearPage'
import { YearsIndex } from './components/YearsIndex'
import { navigate, normalizePath } from './routing'
import type { ContentPage } from './types'

const pages = generatedPages as ContentPage[]
const pageByRoute = new Map(pages.map((page) => [normalizePath(page.route), page]))

const EarthPage = lazy(() => import('./earth/EarthPage').then((m) => ({ default: m.EarthPage })))
const EARTH_ROUTE = '/earth/'
const appRoutes = new Set([EARTH_ROUTE])
const isKnownRoute = (path: string) => pageByRoute.has(path) || appRoutes.has(path)

function App() {
  const [location, setLocation] = useState(() => window.location)
  const currentPath = normalizePath(location.pathname)
  const page = pageByRoute.get(currentPath)
  const isEarth = currentPath === EARTH_ROUTE

  useEffect(() => {
    const updateLocation = () => setLocation(new URL(window.location.href) as unknown as Location)
    window.addEventListener('popstate', updateLocation)
    return () => window.removeEventListener('popstate', updateLocation)
  }, [])

  useEffect(() => {
    const clickHandler = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const link = (event.target as Element).closest<HTMLAnchorElement>('a[href]')
      if (!link || link.target === '_blank' || link.hasAttribute('download')) return
      const url = new URL(link.href, window.location.href)
      if (url.origin !== window.location.origin || (!isKnownRoute(normalizePath(url.pathname)) && url.pathname !== window.location.pathname)) return
      event.preventDefault()
      navigate(`${url.pathname}${url.search}${url.hash}`)
    }
    document.addEventListener('click', clickHandler)
    return () => document.removeEventListener('click', clickHandler)
  }, [])

  useEffect(() => {
    document.title = isEarth ? 'Earth, and everyone on it | Driven By Values' : page?.metadata.title ? `${page.metadata.title}` : 'Driven By Values'
    requestAnimationFrame(() => {
      if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView()
      else window.scrollTo({ top: 0 })
    })
  }, [location, page, isEarth])

  const content = useMemo(() => {
    if (isEarth) {
      return (
        <Suspense fallback={<div className="earth-page-loading" aria-busy="true" />}>
          <EarthPage />
        </Suspense>
      )
    }
    if (!page) {
      return (
        <section className="not-found">
          <p className="not-found__code">404</p>
          <h1>That page is not in this journey.</h1>
          <p>The link may be old, or the page may have moved.</p>
          <a className="btn btn-primary" href="/">Return to the resume</a>
        </section>
      )
    }
    if (page.route === '/years/') return <YearsIndex pages={pages} />
    if (page.metadata.layout === 'article') return <ArticlePage page={page} />
    if (page.metadata.layout === 'year-range') return <YearPage page={page} />
    return <HtmlContent html={page.html} />
  }, [page, isEarth])

  return (
    <>
      {/* THESIS: Preserve the content-first Driven By Values resume while replacing Jekyll with route-aware React. */}
      <SiteNavigation currentPath={currentPath} />
      {isEarth ? (
        <div key={currentPath}>{content}</div>
      ) : (
        <div className="container" key={currentPath}>
          {content}
        </div>
      )}
      {page && <PageEnhancements page={page} />}
      <ThemeToggle />
    </>
  )
}

export default App