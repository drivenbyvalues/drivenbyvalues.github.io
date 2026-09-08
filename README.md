# Driven By Values — React

A Vite, React, and TypeScript implementation of the Driven By Values personal
site. The app preserves the resume, career timeline, long-form articles,
interests and photography galleries, interactive maps, skills, learning
resources, certifications, and yearly retrospectives from the original Jekyll
site.

## Development

```bash
npm install
npm run dev
npm run lint
npm run build
npm run preview
```

## Content architecture

- `content/` contains the copied Markdown and YAML front matter.
- `scripts/generate-content.mjs` converts Markdown and the small set of legacy
  Jekyll includes into `src/generated/content.json` before every build.
- `src/components/` contains React layouts for articles, years, navigation,
  timeline filtering, photo lightboxes, and Leaflet maps.
- `public/assets/` and `public/resumes/` preserve images and downloads.
- `scripts/create-deep-link-fallback.mjs` creates `dist/404.html` so routes work
  when opened directly on GitHub Pages. Component-only routes (no Markdown
  source) such as `/earth/` are listed in its `appRoutes` array.
- `src/earth/` is the interactive Earth history page (`/earth/`), lazy-loaded so
  three.js stays out of the main bundle. `globe/` holds the renderer: real
  present-day coastlines from the bundled `world-atlas` TopoJSON are rotated
  back through time along schematic plate paths (`plates.ts`), and terrain,
  oceans, ice, clouds and city lights are painted procedurally onto canvas
  textures (`surface.ts`, `surface-params.ts`). No network APIs are used.
  `data/` holds the editable content: geological eras, human migration
  waypoints and routes, the eight ages of humanity, and city-light positions.

Edit files in `content/`, then run `npm run build`; generated content should not
be edited by hand.

## Deployment

The site deploys automatically to <https://drivenbyvalues.github.io/> whenever
changes are pushed to `main`. The GitHub Actions workflow installs dependencies,
builds the Vite app, and publishes `dist/` through GitHub Pages.

The canonical repository must remain named `drivenbyvalues.github.io`, and its
Pages source must be set to **GitHub Actions**. The Vite base path is `/` because
this is a GitHub user site rather than a project site.
