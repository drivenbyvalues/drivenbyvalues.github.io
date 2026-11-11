import { useEffect, useRef, useState, type RefObject } from 'react'
import { createGlassScene, type GlassHandle } from './glass-scene'

/** True when WebGL2 (required for transmission and the path tracer) is available. */
export function supportsWebGL2() {
  try {
    return !!document.createElement('canvas').getContext('webgl2')
  } catch {
    return false
  }
}

export function isLowPowerDevice() {
  return window.matchMedia?.('(pointer: coarse)').matches || (navigator.hardwareConcurrency ?? 8) <= 4
}

/** Owns the three.js glass scene for the lifetime of the container element. */
export function useGlass(containerRef: RefObject<HTMLDivElement>, onPathTraceInterrupted: () => void) {
  const [handle, setHandle] = useState<GlassHandle | null>(null)
  const [supported] = useState(supportsWebGL2)
  const interruptRef = useRef(onPathTraceInterrupted)
  interruptRef.current = onPathTraceInterrupted

  useEffect(() => {
    const container = containerRef.current
    if (!container || !supported) return
    const glass = createGlassScene(container, {
      lowPower: isLowPowerDevice(),
      onPathTraceInterrupted: () => interruptRef.current(),
    })
    setHandle(glass)
    return () => {
      glass.dispose()
      setHandle(null)
    }
  }, [containerRef, supported])

  return { handle, supported }
}
