import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import type { ContentPage } from '../types'

interface Photo {
  src: string
  alt: string
}

export function PageEnhancements({ page }: { page: ContentPage }) {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [photoIndex, setPhotoIndex] = useState<number | null>(null)
  const closeButton = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (page.route !== '/timeline/') return
    const buttons = [...document.querySelectorAll<HTMLButtonElement>('.filter-button')]
    const highlights = [...document.querySelectorAll<HTMLElement>('.timeline-highlight')]
    const links = [...document.querySelectorAll<HTMLElement>('.timeline-nav .nav-link')]
    const listeners = buttons.map((button) => {
      const listener = () => {
        const domain = button.dataset.domain || 'all'
        buttons.forEach((item) => {
          item.classList.toggle('is-active', item === button)
          item.setAttribute('aria-pressed', String(item === button))
        })
        highlights.forEach((item) => {
          const domains = (item.dataset.domains || '').split(',')
          item.classList.toggle('is-hidden', domain !== 'all' && !domains.includes(domain))
        })
        links.forEach((item) => {
          const domains = (item.dataset.domains || '').split(',')
          const matches = domain === 'all' || domains.includes(domain)
          item.classList.toggle('nav-link--dimmed', !matches)
          item.classList.toggle('nav-link--active', domain !== 'all' && matches)
        })
      }
      button.addEventListener('click', listener)
      return [button, listener] as const
    })
    return () => listeners.forEach(([button, listener]) => button.removeEventListener('click', listener))
  }, [page.route])

  useEffect(() => {
    if (page.route !== '/interests/photography/') return
    const triggers = [...document.querySelectorAll<HTMLButtonElement>('.photo-trigger')]
    const nextPhotos = triggers.map((button) => ({ src: button.dataset.src || '', alt: button.dataset.alt || '' }))
    setPhotos(nextPhotos)
    const listeners = triggers.map((button, index) => {
      const listener = () => setPhotoIndex(index)
      button.addEventListener('click', listener)
      return [button, listener] as const
    })

    const maps: L.Map[] = []
    const tileLayer = () => L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    })
    const world = document.getElementById('world-photo-map')
    if (world && page.photoLocations.length) {
      const map = L.map(world)
      const bounds = page.photoLocations.map(([lat, lng, label]) => {
        L.marker([lat, lng]).addTo(map).bindPopup(label)
        return [lat, lng] as L.LatLngTuple
      })
      tileLayer().addTo(map)
      map.fitBounds(bounds, { padding: [30, 30], maxZoom: 16 })
      maps.push(map)
    }
    const coorg = document.getElementById('coorg-map')
    if (coorg) {
      const map = L.map(coorg).setView([12.96, 75.7], 7)
      tileLayer().addTo(map)
      const coorgLabels = new Set([
        'Namdroling Monastery, Kushalnagar',
        'Udupi Krishna Temple, Udupi',
        'Shiva Statue, Murudeshwar',
        'Chennakeshava Temple, Belur',
        'Lakshmi Devi Temple, Doddagaddavalli',
        'Sringeri Vidyapeetha',
        'Chitradurga Fort, Karnataka',
        'Jog Falls',
        'Abbe Falls, Coorg',
        'Horanadu, Karnataka',
      ])
      page.photoLocations
        .filter(([, , label]) => coorgLabels.has(label))
        .forEach(([lat, lng, label]) => L.marker([lat, lng]).addTo(map).bindPopup(label))
      maps.push(map)
    }

    return () => {
      listeners.forEach(([button, listener]) => button.removeEventListener('click', listener))
      maps.forEach((map) => map.remove())
      setPhotos([])
      setPhotoIndex(null)
    }
  }, [page])

  useEffect(() => {
    if (photoIndex === null) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButton.current?.focus()
    const listener = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPhotoIndex(null)
      if (event.key === 'ArrowLeft') setPhotoIndex((value) => value === null ? null : (value - 1 + photos.length) % photos.length)
      if (event.key === 'ArrowRight') setPhotoIndex((value) => value === null ? null : (value + 1) % photos.length)
    }
    document.addEventListener('keydown', listener)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', listener)
    }
  }, [photoIndex, photos.length])

  if (photoIndex === null || !photos[photoIndex]) return null
  const photo = photos[photoIndex]
  return (
    <div className="react-lightbox" role="dialog" aria-modal="true" aria-label="Photo viewer" onMouseDown={(event) => event.target === event.currentTarget && setPhotoIndex(null)}>
      <button ref={closeButton} type="button" className="react-lightbox__close" aria-label="Close photo viewer" onClick={() => setPhotoIndex(null)}>&times;</button>
      <button type="button" className="react-lightbox__nav react-lightbox__nav--prev" aria-label="Previous photo" onClick={() => setPhotoIndex((photoIndex - 1 + photos.length) % photos.length)}>&#10094;</button>
      <figure>
        <img src={photo.src} alt={photo.alt} />
        <figcaption>{photo.alt}</figcaption>
      </figure>
      <button type="button" className="react-lightbox__nav react-lightbox__nav--next" aria-label="Next photo" onClick={() => setPhotoIndex((photoIndex + 1) % photos.length)}>&#10095;</button>
      <div className="react-lightbox__counter">{photoIndex + 1} / {photos.length}</div>
    </div>
  )
}
