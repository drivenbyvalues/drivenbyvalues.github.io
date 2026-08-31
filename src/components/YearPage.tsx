import type { ContentPage } from '../types'
import { HtmlContent } from './HtmlContent'

function ProjectCard({ project }: { project: NonNullable<ContentPage['metadata']['projects']>[number] }) {
  return (
    <article className="year-project-card">
      <header className="year-project-card__header">
        <h3 className="year-project-card__title">{project.title}</h3>
        {project.focus && <span className="year-project-card__focus">{project.focus}</span>}
      </header>
      {project.description && <p className="year-project-card__description">{project.description}</p>}
      {project.impact && <div className="year-project-card__impact"><span className="eyebrow">Impact</span><p>{project.impact}</p></div>}
      {project.stack && <ul className="year-project-card__stack">{project.stack.split('|').map((item) => <li key={item}>{item.trim()}</li>)}</ul>}
    </article>
  )
}

export function YearPage({ page }: { page: ContentPage }) {
  const { metadata } = page
  const year = Number(metadata.year || metadata.title)
  const modern = Boolean(metadata.summary || metadata.pillars || metadata.projects || metadata.story || metadata.learning || metadata.next_up || metadata.skills)

  if (!Number.isInteger(year)) {
    return <HtmlContent html={page.html} />
  }

  return (
    <main className="year-layout">
      <article className="year-article">
        <header className="year-hero">
          <div className="year-hero__meta">
            <span className="year-hero__badge">{year}</span>
            {metadata.subtitle && <span className="year-hero__subtitle">{metadata.subtitle}</span>}
          </div>
          <h1 className="year-hero__title">{metadata.headline || metadata.title}</h1>
          {metadata.summary && <p className="year-hero__summary">{metadata.summary}</p>}
          {metadata.skills && <div className="year-hero__skills">{metadata.skills.map((skill) => <span className="chip chip--tone" key={skill}>{skill}</span>)}</div>}
        </header>

        {metadata.pillars && (
          <section className="year-section">
            <div className="year-section__header"><h2>Focus Pillars</h2>{metadata.pillars_caption && <p>{metadata.pillars_caption}</p>}</div>
            <div className="year-pillars">
              {metadata.pillars.map((pillar) => (
                <article className="year-pillar-card" key={pillar.title}>
                  <h3>{pillar.title}</h3>
                  {pillar.description && <p>{pillar.description}</p>}
                  {pillar.items && <ul>{pillar.items.map((item) => <li key={item}>{item}</li>)}</ul>}
                </article>
              ))}
            </div>
          </section>
        )}

        {metadata.projects && (
          <section className="year-section">
            <div className="year-section__header"><h2>Flagship Initiatives</h2>{metadata.projects_caption && <p>{metadata.projects_caption}</p>}</div>
            <div className="year-projects">{metadata.projects.map((project) => <ProjectCard project={project} key={project.title} />)}</div>
          </section>
        )}

        {metadata.story && (
          <section className="year-section year-story">
            <div className="year-section__header"><h2>{metadata.story.title || 'Story Spotlight'}</h2></div>
            <div className="year-story__body">
              {metadata.story.summary && <p className="year-story__summary">{metadata.story.summary}</p>}
              {metadata.story.detailsHtml && <HtmlContent html={metadata.story.detailsHtml} className="year-story__details" />}
              {metadata.story.takeaway && <div className="year-story__callout"><span className="eyebrow">Takeaway</span><p>{metadata.story.takeaway}</p></div>}
            </div>
          </section>
        )}

        {(metadata.learning || metadata.next_up) && (
          <section className="year-section year-horizon">
            <div className="year-horizon__grid">
              {metadata.learning && <div className="year-horizon__column"><h3>Learning &amp; Experiments</h3><ul>{metadata.learning.map((item) => <li key={item}>{item}</li>)}</ul></div>}
              {metadata.next_up && <div className="year-horizon__column"><h3>Next Horizon</h3><ul>{metadata.next_up.map((item) => <li key={item}>{item}</li>)}</ul></div>}
            </div>
          </section>
        )}

        {page.html.trim() && (
          <section className="year-section year-notes">
            {modern && <div className="year-section__header"><h2>{metadata.notes_title || 'Additional Notes & Artifacts'}</h2></div>}
            <HtmlContent html={page.html} className="year-notes__content markdown-content" />
          </section>
        )}

        <nav className="year-navigation" aria-label="Year navigation">
          <ul>
            <li>{year > 1998 && <a href={`/${year - 1}/`} className="year-nav-link"><i className="fas fa-chevron-left" aria-hidden="true" /><span>{year - 1}</span></a>}</li>
            <li><a href="/years/" className="year-nav-link"><i className="fas fa-calendar-alt" aria-hidden="true" /><span>All Years</span></a></li>
            <li>{year < 2026 && <a href={`/${year + 1}/`} className="year-nav-link"><span>{year + 1}</span><i className="fas fa-chevron-right" aria-hidden="true" /></a>}</li>
          </ul>
        </nav>
      </article>
    </main>
  )
}
