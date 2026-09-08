import { useEffect, useRef, useState } from 'react'

/** Drives a 0..1 track position forward while playing. `duration` is the
 * number of seconds to traverse the whole track. */
export function usePlayback(position: number, setPosition: (t: number) => void, duration: number) {
  const [isPlaying, setIsPlaying] = useState(false)
  const positionRef = useRef(position)
  positionRef.current = position

  useEffect(() => {
    if (!isPlaying) return
    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      const dt = (now - last) / 1000
      last = now
      const next = positionRef.current + dt / duration
      if (next >= 1) {
        setPosition(1)
        setIsPlaying(false)
        return
      }
      setPosition(next)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [isPlaying, duration, setPosition])

  const toggle = () => {
    if (!isPlaying && positionRef.current >= 0.999) setPosition(0)
    setIsPlaying((v) => !v)
  }

  return { isPlaying, toggle, stop: () => setIsPlaying(false) }
}
