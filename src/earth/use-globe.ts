import { useEffect, useRef, useState, type RefObject } from 'react'
import { createGlobeScene, loadSurfaceFields, type GlobeHandle } from './globe/globe-scene'

export interface GlobeState {
  handle: GlobeHandle | null
  progress: number
  isReady: boolean
}

/** Owns the three.js scene for the lifetime of the container element. */
export function useGlobe(containerRef: RefObject<HTMLDivElement>, initialMa: number): GlobeState {
  const [handle, setHandle] = useState<GlobeHandle | null>(null)
  const [progress, setProgress] = useState(0)
  const [isReady, setIsReady] = useState(false)
  const initialRef = useRef(initialMa)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    let cancelled = false
    loadSurfaceFields((f) => !cancelled && setProgress(f))
    const globe = createGlobeScene(container, initialRef.current)
    setHandle(globe)
    globe.ready.then(() => {
      if (cancelled) return
      setProgress(1)
      setIsReady(true)
    })
    return () => {
      cancelled = true
      globe.dispose()
      setHandle(null)
      setIsReady(false)
    }
  }, [containerRef])

  return { handle, progress, isReady }
}
