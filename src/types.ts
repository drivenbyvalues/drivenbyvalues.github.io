export interface Project {
  title: string
  focus?: string
  description?: string
  impact?: string
  stack?: string
}

export interface Story {
  title?: string
  summary?: string
  details?: string
  detailsHtml?: string
  takeaway?: string
}

export interface PageMetadata {
  layout?: string
  title?: string | number
  permalink?: string
  subtitle?: string
  headline?: string
  summary?: string
  year?: string | number
  category?: string
  feature_area?: string
  skills?: string[]
  pillars?: Array<{ title: string; description?: string; items?: string[] }>
  pillars_caption?: string
  projects?: Project[]
  projects_caption?: string
  story?: Story
  learning?: string[]
  next_up?: string[]
  notes_title?: string
}

export interface ContentPage {
  route: string
  source: string
  metadata: PageMetadata
  html: string
  photoLocations: Array<[number, number, string]>
}
