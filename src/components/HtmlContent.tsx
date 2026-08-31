export function HtmlContent({ html, className = 'markdown-content' }: { html: string; className?: string }) {
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />
}
