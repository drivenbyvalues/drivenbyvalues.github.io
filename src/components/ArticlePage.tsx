import type { ContentPage } from '../types'
import { HtmlContent } from './HtmlContent'

export function ArticlePage({ page }: { page: ContentPage }) {
  const { metadata } = page
  return (
    <>
      <header className="article-hero">
        <div className="article-hero__meta">
          {(metadata.feature_area || metadata.category) && (
            <span className="article-hero__kicker">{metadata.feature_area || metadata.category}</span>
          )}
          {metadata.year && <span className="article-hero__year">{metadata.year}</span>}
        </div>
        <h1 className="article-hero__title">{metadata.title}</h1>
        {metadata.summary && <p className="article-hero__summary">{metadata.summary}</p>}
        <div className="article-hero__crumbs">
          <a href="/articles/"><i className="fas fa-feather-alt" aria-hidden="true" /> All articles</a>
          {metadata.year && (
            <>
              <span className="dot" aria-hidden="true">·</span>
              <a href={`/${metadata.year}/`}><i className="fas fa-calendar-alt" aria-hidden="true" /> {metadata.year} in review</a>
            </>
          )}
        </div>
      </header>
      <HtmlContent html={page.html} className="article-body" />
      <nav className="article-bottom-nav" aria-label="Article navigation">
        <a className="btn btn-secondary" href="/articles/">
          <i className="fas fa-arrow-left" aria-hidden="true" /> Back to Articles
        </a>
        {metadata.year && (
          <a className="btn btn-ghost" href={`/${metadata.year}/`}>
            {metadata.year} in review <i className="fas fa-arrow-right" aria-hidden="true" />
          </a>
        )}
      </nav>
    </>
  )
}
