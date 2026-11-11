import {
  ACESFilmicToneMapping,
  ExtrudeGeometry,
  type BufferGeometry,
  Box3,
  CircleGeometry,
  Color,
  DirectionalLight,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  SRGBColorSpace,
  Scene,
  Texture,
  Vector3,
  WebGLRenderer,
  type DataTexture,
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { FontLoader, type Font } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import { backdropPalettes, createStudioEnvironment, lightDirection, type Backdrop, type StudioLight } from './studio-environment'
import type { PathTracerLike } from './pathtrace'

export const glassFonts = {
  helvetiker: 'Helvetiker',
  optimer: 'Optimer',
  gentilis: 'Gentilis',
  droid_serif: 'Droid Serif',
} as const
export type GlassFont = keyof typeof glassFonts

/** Optical "recipes": refractive index, fire and how sharply the letters are cut. */
export const materialKinds = {
  glass: { label: 'Glass', ior: 1.52, dispersionScale: 1.5, curveSegments: 14, bevelSegments: 8, bevelSize: 0.04, bevelThickness: 0.07 },
  crystal: { label: 'Crystal', ior: 1.7, dispersionScale: 3, curveSegments: 6, bevelSegments: 2, bevelSize: 0.06, bevelThickness: 0.09 },
  diamond: { label: 'Diamond', ior: 2.42, dispersionScale: 6, curveSegments: 4, bevelSegments: 1, bevelSize: 0.09, bevelThickness: 0.13 },
} as const
export type MaterialKind = keyof typeof materialKinds

export interface GlassMaterialParams {
  kind: MaterialKind
  /** Hex colour the glass tints light toward as it passes through. */
  tint: string
  /** 0 = water-clear, 1 = deeply coloured. */
  tintStrength: number
  /** 0 = polished, 1 = frosted. */
  frost: number
  /** Optical thickness used by the transmission model. */
  thickness: number
  /** 0 – 1, prism-like colour fringing on the edges. */
  dispersion: number
}

export interface GlassHandle {
  /** Rebuilds the letters; crystal and diamond use fewer, sharper segments so facets show. */
  setText(text: string, font: GlassFont, kind: MaterialKind): Promise<TextBuildResult | null>
  setMaterial(params: GlassMaterialParams): void
  setLight(light: StudioLight): void
  setBackdrop(backdrop: Backdrop): void
  /** Image shown behind the text when the backdrop is 'photo' (null clears it). */
  setBackdropPhoto(image: HTMLCanvasElement | HTMLImageElement | ImageBitmap | null): void
  setAutoRotate(on: boolean): void
  /** Starts progressive path tracing; resolves once the tracer is compiling/running. */
  startPathTrace(onSamples: (samples: number) => void): Promise<void>
  stopPathTrace(): void
  isPathTracing(): boolean
  /** PNG data URL of the current frame (path-traced if a render is active). */
  snapshot(): string
  dispose(): void
}

/** What the scene did with the text, for the UI. */
export interface TextBuildResult {
  /** True when HarfBuzz shaping (Noto fonts) was used instead of the chosen typeface. */
  shaped: boolean
  /** Human-readable script names that were used. */
  scripts: string[]
  /** Characters no bundled font can draw. */
  missing: string[]
}

export interface GlassSceneOptions {
  /** Called when the user drags the camera while a path-traced render is active. */
  onPathTraceInterrupted?: () => void
  lowPower?: boolean
}

export const MAX_SAMPLES = 256

const fontCache = new Map<GlassFont, Promise<Font>>()
export function loadGlassFont(font: GlassFont): Promise<Font> {
  let pending = fontCache.get(font)
  if (!pending) {
    pending = new FontLoader().loadAsync(`${import.meta.env.BASE_URL}glass/fonts/${font}_bold.typeface.json`)
    pending.catch(() => fontCache.delete(font))
    fontCache.set(font, pending)
  }
  return pending
}

/** Maps the UI's 0–1 tint strength onto Beer–Lambert attenuation distance. */
export function attenuationDistanceFor(tintStrength: number) {
  const t = Math.min(1, Math.max(0, tintStrength))
  return 40 * Math.pow(0.4 / 40, t) // 40 (clear) → 0.4 (dense)
}

/** Camera distance needed to frame a box of the given size with some margin. */
export function fitDistance(width: number, height: number, depth: number, vFovDeg: number, aspect: number, margin = 1.2) {
  const vFov = (vFovDeg * Math.PI) / 180
  const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect)
  const byHeight = height / 2 / Math.tan(vFov / 2)
  const byWidth = width / 2 / Math.tan(hFov / 2)
  return Math.max(byHeight, byWidth) * margin + depth / 2
}

export function createGlassScene(container: HTMLElement, options: GlassSceneOptions = {}): GlassHandle {
  let disposed = false
  let autoRotate = false
  // Slider drags can fire many times per frame; the studio is rebuilt at most once per frame.
  let envDirty = false
  const scene = new Scene()
  const camera = new PerspectiveCamera(32, 1, 0.05, 200)
  camera.position.set(0, 0.9, 8)

  const renderer = new WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, options.lowPower ? 1.5 : 2))
  renderer.toneMapping = ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.15
  container.appendChild(renderer.domElement)

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.07
  controls.enablePan = false
  controls.rotateSpeed = 0.6
  controls.zoomSpeed = 0.7
  controls.maxPolarAngle = Math.PI * 0.53 // a peek under the floor line, no further
  controls.autoRotateSpeed = 1.4

  /* --- Lighting -------------------------------------------------------- */
  let light: StudioLight = { color: '#ffd27a', intensity: 5, azimuth: 35, elevation: 30 }
  let backdrop: Backdrop = 'midnight'
  let environment: DataTexture | null = null
  const keyLight = new DirectionalLight(0xffffff, 1)
  scene.add(keyLight)

  function rebuildEnvironment() {
    const previous = environment
    environment = createStudioEnvironment(light, backdrop)
    scene.environment = environment
    scene.background = environment
    scene.backgroundBlurriness = 0
    scene.backgroundIntensity = 0.85
    previous?.dispose()
    const [x, y, z] = lightDirection(light.azimuth, light.elevation)
    keyLight.position.set(x, y, z).multiplyScalar(10)
    keyLight.color.set(light.color)
    keyLight.intensity = light.intensity * 0.5
    const [fr, fg, fb] = backdropPalettes[backdrop].floor
    floorMaterial.color.setRGB(Math.min(1, fr * 6), Math.min(1, fg * 6), Math.min(1, fb * 6))
  }

  /* --- Floor ------------------------------------------------------------ */
  const floorMaterial = new MeshPhysicalMaterial({ color: 0x111111, roughness: 0.28, metalness: 0, clearcoat: 0.6, clearcoatRoughness: 0.2 })
  const floor = new Mesh(new CircleGeometry(30, 96), floorMaterial)
  floor.rotation.x = -Math.PI / 2
  floor.visible = false
  scene.add(floor)

  /* --- Photo backdrop ---------------------------------------------------- */
  // A camera-facing plane behind the text, cover-fitted to the view. Being real
  // geometry (an emissive surface) the live view and the path tracer both see it
  // through the glass, bent by refraction.
  const photoMaterial = new MeshStandardMaterial({ color: 0x000000, roughness: 1, metalness: 0, emissive: 0xffffff, emissiveIntensity: 1.05 })
  const photoPlane = new Mesh(new PlaneGeometry(1, 1), photoMaterial)
  photoPlane.visible = false
  scene.add(photoPlane)
  let photoTexture: Texture | null = null
  let photoAspect = 1
  let photoPlacement = ''

  /** Keeps the photo filling the view; returns true when it moved (path tracer must rebuild). */
  function placePhoto() {
    const target = controls.target
    const toTarget = target.clone().sub(camera.position)
    const behindText = Math.max(4, textSize.x * 0.8)
    const dist = toTarget.length() + behindText
    const halfH = Math.tan(((camera.fov / 2) * Math.PI) / 180) * dist * 1.03
    const halfW = halfH * camera.aspect
    photoPlane.position.copy(camera.position).add(toTarget.normalize().multiplyScalar(dist))
    photoPlane.quaternion.copy(camera.quaternion)
    photoPlane.scale.set(halfW * 2, halfH * 2, 1)
    // Cover fit: crop the photo to the view's aspect via the UVs (no texture transform,
    // which the path tracer would not see).
    const rx = photoAspect > camera.aspect ? camera.aspect / photoAspect : 1
    const ry = photoAspect > camera.aspect ? 1 : photoAspect / camera.aspect
    const u0 = (1 - rx) / 2
    const v0 = (1 - ry) / 2
    const uv = photoPlane.geometry.attributes.uv
    uv.setXY(0, u0, v0 + ry)
    uv.setXY(1, u0 + rx, v0 + ry)
    uv.setXY(2, u0, v0)
    uv.setXY(3, u0 + rx, v0)
    const key = [...photoPlane.position.toArray(), ...photoPlane.quaternion.toArray(), halfW, rx, ry].map((n) => n.toFixed(4)).join()
    if (key === photoPlacement) return false
    uv.needsUpdate = true
    photoPlacement = key
    return true
  }

  function updatePhotoVisibility() {
    const show = backdrop === 'photo' && photoTexture !== null
    if (photoPlane.visible !== show) {
      photoPlane.visible = show
      photoPlacement = ''
      afterSceneChange(true)
    }
  }

  /* --- Glass ------------------------------------------------------------ */
  const glass = new MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0,
    roughness: 0.02,
    transmission: 1,
    ior: 1.52,
    thickness: 1,
    specularIntensity: 1,
    clearcoat: 1,
    clearcoatRoughness: 0.02,
    envMapIntensity: 1.25,
    dispersion: 0.3,
    attenuationColor: new Color('#7fd6ff'),
    attenuationDistance: attenuationDistanceFor(0.4),
  })
  let textMesh: Mesh<BufferGeometry, MeshPhysicalMaterial> | null = null
  let textToken = 0
  const textSize = new Vector3(4, 1, 0.4)

  async function setText(text: string, font: GlassFont, kind: MaterialKind) {
    const cut = materialKinds[kind]
    const token = ++textToken
    const extrude = {
      depth: 0.38,
      curveSegments: options.lowPower ? Math.min(8, cut.curveSegments) : cut.curveSegments,
      bevelEnabled: true,
      bevelThickness: cut.bevelThickness,
      bevelSize: cut.bevelSize,
      bevelOffset: 0,
      bevelSegments: options.lowPower ? Math.min(4, cut.bevelSegments) : cut.bevelSegments,
    }
    const content = text.trim() || ' '
    let geometry: BufferGeometry
    let result: TextBuildResult
    const { needsShaping } = await import('./shaped-text')
    if (needsShaping(content)) {
      // Kannada, Hindi etc. need OpenType shaping (conjuncts, reordered vowel signs).
      const { shapeText, shapedScripts } = await import('./shaped-text')
      const shaped = await shapeText(content)
      if (disposed || token !== textToken) return null
      // Indic strokes are thinner and counters smaller than Latin: a gentler bevel
      // keeps the inflated outlines from colliding.
      geometry = new ExtrudeGeometry(shaped.shapes, {
        ...extrude,
        bevelSize: extrude.bevelSize * 0.55,
        bevelThickness: extrude.bevelThickness * 0.8,
      })
      result = { shaped: true, scripts: shaped.scripts.map((sc) => shapedScripts[sc].label), missing: shaped.missing }
    } else {
      const loaded = await loadGlassFont(font)
      if (disposed || token !== textToken) return null
      geometry = new TextGeometry(content, { font: loaded, size: 1, ...extrude })
      result = { shaped: false, scripts: ['latin'], missing: [] }
    }
    // Extruded text has separate cap/side material groups; with a single material the
    // path tracer would find no material for group 1 and render the sides black.
    geometry.clearGroups()
    geometry.computeBoundingBox()
    const box = geometry.boundingBox ?? new Box3()
    // Center horizontally and in depth; stand the letters on the floor.
    geometry.translate(-(box.min.x + box.max.x) / 2, -box.min.y + 0.002, -(box.min.z + box.max.z) / 2)
    geometry.computeBoundingBox()
    geometry.boundingBox?.getSize(textSize)

    if (textMesh) {
      textMesh.geometry.dispose()
      textMesh.geometry = geometry
    } else {
      textMesh = new Mesh(geometry, glass)
      scene.add(textMesh)
    }
    frameText()
    afterSceneChange(true)
    return result
  }

  function frameText() {
    const width = Math.max(textSize.x, 1.5)
    const height = Math.max(textSize.y, 0.8)
    const dist = fitDistance(width, height, textSize.z, camera.fov, camera.aspect)
    controls.target.set(0, height * 0.45, 0)
    const dir = camera.position.clone().sub(controls.target)
    if (dir.lengthSq() < 1e-6) dir.set(0, 0.12, 1)
    camera.position.copy(controls.target).add(dir.setLength(dist))
    controls.minDistance = dist * 0.35
    controls.maxDistance = dist * 3
    controls.update()
  }

  /* --- Path tracing ----------------------------------------------------- */
  let tracer: PathTracerLike | null = null
  let tracing = false
  let onSamples: ((n: number) => void) | null = null
  let lastReportedSamples = -1
  let tracerSceneDirty = true
  let tracerMaterialsDirty = false

  function stopPathTrace() {
    if (!tracing) return
    tracing = false
    onSamples = null
    controls.autoRotate = autoRotate
  }

  /** Any change to geometry, material or light invalidates an in-progress render. */
  function afterSceneChange(geometryChanged = false) {
    if (!tracer) return
    if (tracing) {
      stopPathTrace()
      options.onPathTraceInterrupted?.()
    }
    if (geometryChanged) tracerSceneDirty = true
    else tracerMaterialsDirty = true
  }

  async function startPathTrace(cb: (samples: number) => void) {
    if (!tracer) {
      const { createPathTracer } = await import('./pathtrace')
      if (disposed) return
      tracer = createPathTracer(renderer)
    }
    if (envDirty) {
      envDirty = false
      rebuildEnvironment()
    }
    if (tracerSceneDirty) {
      tracer.setScene(scene, camera)
      tracerSceneDirty = false
      tracerMaterialsDirty = false
    } else if (tracerMaterialsDirty) {
      tracer.updateMaterials()
      tracer.updateLights()
      tracer.updateEnvironment()
      tracerMaterialsDirty = false
    }
    tracer.updateCamera()
    tracer.reset()
    tracer.pausePathTracing = false
    onSamples = cb
    lastReportedSamples = -1
    tracing = true
    controls.autoRotate = false
  }

  controls.addEventListener('start', () => {
    if (tracing) {
      stopPathTrace()
      options.onPathTraceInterrupted?.()
    }
  })

  /* --- Resize ------------------------------------------------------------ */
  function resize() {
    const { clientWidth: w, clientHeight: h } = container
    if (w === 0 || h === 0) return
    renderer.setSize(w, h, false)
    renderer.domElement.style.width = '100%'
    renderer.domElement.style.height = '100%'
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    frameText()
    if (tracer) {
      tracer.updateCamera()
      tracer.reset()
    }
  }
  resize()
  const observer = new ResizeObserver(resize)
  observer.observe(container)

  /* --- Loop --------------------------------------------------------------- */

  function renderFrame() {
    if (tracing && tracer) {
      if (tracer.samples >= MAX_SAMPLES) tracer.pausePathTracing = true
      tracer.renderSample()
      const n = Math.floor(tracer.samples)
      if (n !== lastReportedSamples) {
        lastReportedSamples = n
        onSamples?.(n)
      }
    } else {
      renderer.render(scene, camera)
    }
  }

  function frame() {
    if (disposed) return
    if (envDirty) {
      envDirty = false
      rebuildEnvironment()
    }
    controls.update()
    if (photoPlane.visible && !tracing && placePhoto() && tracer) tracerSceneDirty = true
    renderFrame()
    requestAnimationFrame(frame)
  }

  rebuildEnvironment()
  requestAnimationFrame(frame)

  return {
    setText,
    setMaterial(params) {
      const recipe = materialKinds[params.kind]
      glass.ior = recipe.ior
      glass.attenuationColor.set(params.tint)
      glass.attenuationDistance = attenuationDistanceFor(params.tintStrength)
      glass.roughness = 0.02 + Math.min(1, Math.max(0, params.frost)) * 0.45
      glass.thickness = params.thickness
      glass.dispersion = params.dispersion * recipe.dispersionScale
      afterSceneChange()
    },
    setLight(next) {
      light = { ...next }
      envDirty = true
      afterSceneChange()
    },
    setBackdrop(next) {
      backdrop = next
      envDirty = true
      afterSceneChange()
      updatePhotoVisibility()
    },
    setBackdropPhoto(image) {
      photoTexture?.dispose()
      photoTexture = null
      if (image) {
        photoTexture = new Texture(image)
        photoTexture.colorSpace = SRGBColorSpace
        photoTexture.needsUpdate = true
        photoAspect = image.width / Math.max(1, image.height)
      }
      photoMaterial.emissiveMap = photoTexture
      photoMaterial.needsUpdate = true
      photoPlacement = ''
      afterSceneChange(true)
      updatePhotoVisibility()
    },
    setAutoRotate(on) {
      autoRotate = on
      if (!tracing) controls.autoRotate = on
    },
    startPathTrace,
    stopPathTrace,
    isPathTracing: () => tracing,
    snapshot() {
      // Render and read back in the same task, so preserveDrawingBuffer isn't needed.
      if (tracing && tracer) {
        const paused = tracer.pausePathTracing
        tracer.pausePathTracing = true
        tracer.renderSample()
        tracer.pausePathTracing = paused
      } else {
        renderer.render(scene, camera)
      }
      return renderer.domElement.toDataURL('image/png')
    },
    dispose() {
      disposed = true
      observer.disconnect()
      controls.dispose()
      tracer?.dispose()
      textMesh?.geometry.dispose()
      glass.dispose()
      floor.geometry.dispose()
      floorMaterial.dispose()
      photoPlane.geometry.dispose()
      photoMaterial.dispose()
      photoTexture?.dispose()
      environment?.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    },
  }
}
