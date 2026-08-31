import type { ContentPage } from '../types'

export function YearsIndex({ pages }: { pages: ContentPage[] }) {
  const years = pages
    .filter((page) => /^\/\d{4}\/$/.test(page.route))
    .sort((a, b) => Number(b.metadata.year || b.metadata.title) - Number(a.metadata.year || a.metadata.title))

  return (
    <div className="years-page">
      <h1>Years Overview</h1>
      <p>Select a year to view details about that year&apos;s activities and achievements.</p>
      <div className="years-grid">
        {years.map((page) => {
          const year = page.metadata.year || page.metadata.title
          return (
            <a href={page.route} className="year-card" key={page.route}>
              <div className="year-number">{year}</div>
              <div className="year-preview">{page.metadata.subtitle && <div className="year-subtitle">{page.metadata.subtitle}</div>}</div>
            </a>
          )
        })}
      </div>
    </div>
  )
}
