import { copyFile, mkdir, readFile } from 'node:fs/promises'
import path from 'node:path'

const entrypoint = new URL('../dist/index.html', import.meta.url)
const pages = JSON.parse(await readFile(new URL('../src/generated/content.json', import.meta.url), 'utf8'))

await copyFile(entrypoint, new URL('../dist/404.html', import.meta.url))

for (const { route } of pages) {
  const routePath = route.replace(/^\/+|\/+$/g, '')
  if (!routePath) continue

  const directory = new URL(`../dist/${routePath}/`, import.meta.url)
  await mkdir(directory, { recursive: true })
  await copyFile(entrypoint, new URL(path.posix.join(routePath, 'index.html'), new URL('../dist/', import.meta.url)))
}

console.log(`Created GitHub Pages entrypoints for ${pages.length} routes`)
