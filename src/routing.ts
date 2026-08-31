export function normalizePath(pathname: string) {
  let path = pathname.replace(/\/index\.html$/, '/').replace(/\.html$/, '/')
  if (!path.startsWith('/')) path = `/${path}`
  if (path !== '/' && !path.endsWith('/')) path += '/'
  return path.replace(/\/+/g, '/')
}

export function navigate(to: string) {
  const url = new URL(to, window.location.href)
  window.history.pushState({}, '', `${url.pathname}${url.search}${url.hash}`)
  window.dispatchEvent(new PopStateEvent('popstate'))
}
