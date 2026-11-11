import type { Camera, Scene, WebGLRenderer } from 'three'
import { WebGLPathTracer } from 'three-gpu-pathtracer'

/** The subset of WebGLPathTracer the glass scene relies on (keeps the heavy module out of the main chunk). */
export interface PathTracerLike {
  readonly samples: number
  pausePathTracing: boolean
  setScene(scene: Scene, camera: Camera): void
  updateCamera(): void
  updateMaterials(): void
  updateLights(): void
  updateEnvironment(): void
  renderSample(): void
  reset(): void
  dispose(): void
}

/** Loaded on demand when the visitor presses "Render". */
export function createPathTracer(renderer: WebGLRenderer): PathTracerLike {
  const tracer = new WebGLPathTracer(renderer)
  tracer.bounces = 8
  tracer.transmissiveBounces = 14 // glass needs many bounces to look solid rather than hollow
  tracer.filterGlossyFactor = 0.5
  tracer.minSamples = 3
  tracer.renderDelay = 0
  tracer.fadeDuration = 300
  tracer.dynamicLowRes = true
  tracer.tiles.set(2, 2)
  return tracer
}
