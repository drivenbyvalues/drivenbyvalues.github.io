import { readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'
import { marked } from 'marked'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const contentRoot = path.join(root, 'content')
const output = path.join(root, 'src/generated/content.json')

marked.use({ gfm: true, breaks: false })

async function markdownFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const nested = await Promise.all(entries.map(async (entry) => {
    const fullPath = path.join(directory, entry.name)
    if (entry.isDirectory()) return markdownFiles(fullPath)
    return entry.name.endsWith('.md') ? [fullPath] : []
  }))
  return nested.flat()
}

function includeAttributes(source) {
  return Object.fromEntries(
    [...source.matchAll(/([a-z_]+)="([\s\S]*?)"(?=\s+[a-z_]+="|$)/g)]
      .map((match) => [match[1], match[2]]),
  )
}

function includeHtml(name, attributes) {
  const { title = '', description = '', icon = '', caption = '', value = '', label = '', items = '' } = attributes
  const list = items.split('|').map((item) => item.trim()).filter(Boolean)

  if (name === 'metric-card') {
    return `<div class="metric-card"><span class="metric-card__value">${value}</span><span class="metric-card__label">${label}</span></div>`
  }

  if (name === 'skill-column') {
    return `<div class="skill-card">${icon ? `<span class="skill-card__icon"><i class="${icon}"></i></span>` : ''}<h3 class="skill-card__title">${title}</h3>${caption ? `<p class="skill-card__caption">${caption}</p>` : ''}<ul class="skill-card__list">${list.map((item) => `<li>${item}</li>`).join('')}</ul></div>`
  }

  return `<article class="highlight-card">${icon ? `<span class="highlight-card__icon"><i class="${icon}"></i></span>` : ''}<h3 class="highlight-card__title">${title}</h3>${description ? `<p class="highlight-card__description">${description}</p>` : ''}${list.length ? `<ul class="highlight-card__list">${list.map((item) => `<li>${item}</li>`).join('')}</ul>` : ''}</article>`
}

function preprocess(source) {
  let inFence = false
  const normalizedHtml = source.split('\n').map((line) => {
    if (/^\s*```/.test(line)) inFence = !inFence
    if (!inFence && /^\s{4,}<\/?[a-z][^>]*>/i.test(line)) return line.trimStart()
    return line
  }).join('\n')

  return normalizedHtml
    .replace(/\{\{\s*(['"])(.*?)\1\s*\|\s*relative_url\s*\}\}/g, '$2')
    .replace(/\{\{\s*site\.formspree_id\s*\}\}/g, 'your-form-id')
    .replace(
      /^[ \t]*\{%\s*include\s+components\/(metric-card|highlight-card|skill-column)\.html\s*([\s\S]*?)%\}/gm,
      (_, name, attributes) => includeHtml(name, includeAttributes(attributes.trim())),
    )
    .replace(/<link[^>]+leaflet[^>]*>\s*/gi, '')
    .replace(/<script[\s\S]*?<\/script>\s*/gi, '')
    .replace(/<div class="lightbox" id="photoLightbox"[\s\S]*?<\/div>\s*/i, '')
    .replace(/\{%\s*[^%]*%\}/g, '')
}

function canonicalRoute(file, data) {
  if (data.permalink && !String(data.permalink).includes(':')) return String(data.permalink)
  const relative = path.relative(contentRoot, file).split(path.sep).join('/')
  if (relative === 'root/index.md') return '/'
  if (relative.startsWith('root/')) return `/${path.basename(relative, '.md')}/`
  if (relative.endsWith('/index.md')) {
    return `/${relative.replace(/^_pages\//, '').replace(/\/index\.md$/, '')}/`
  }
  return `/${relative.replace(/^_pages\//, '').replace(/\.md$/, '')}/`
}

function photoLocations(source) {
  const locations = []
  const seen = new Set()
  for (const match of source.matchAll(/\[\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*,\s*'([^']+)'\s*\]/g)) {
    const key = `${match[1]}:${match[2]}:${match[3]}`
    if (!seen.has(key)) {
      seen.add(key)
      locations.push([Number(match[1]), Number(match[2]), match[3]])
    }
  }
  return locations
}

const pages = []
for (const file of (await markdownFiles(contentRoot)).sort()) {
  if (file.endsWith('/years/default.md')) continue
  const source = await readFile(file, 'utf8')
  const parsed = matter(source)
  const route = canonicalRoute(file, parsed.data)
  const metadata = structuredClone(parsed.data)
  if (metadata.story?.details) {
    metadata.story.detailsHtml = marked.parse(metadata.story.details)
  }

  pages.push({
    route,
    source: path.relative(contentRoot, file).split(path.sep).join('/'),
    metadata,
    html: marked.parse(preprocess(parsed.content)),
    photoLocations: route === '/interests/photography/' ? photoLocations(parsed.content) : [],
  })
}

const deepDive = pages.find((page) => page.route === '/articles/2026-deep-dive/')
if (deepDive) pages.push({ ...deepDive, route: '/2026-deep-dive/' })

await writeFile(output, `${JSON.stringify(pages, null, 2)}\n`)
console.log(`Generated ${pages.length} React content routes`)
