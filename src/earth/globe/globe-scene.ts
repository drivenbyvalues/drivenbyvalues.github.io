import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  AmbientLight,
  BackSide,
  BufferGeometry,
  CanvasTexture,
  CatmullRomCurve3,
  Color,
  DirectionalLight,
  Float32BufferAttribute,
  Group,
  HemisphereLight,
  LinearFilter,
  LinearMipmapLinearFilter,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
  SRGBColorSpace,
  TubeGeometry,
  Vector3,
  WebGLRenderer,
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { greatCircleArc, lonLatToVector } from './geo'
import { landRingsAt } from './plates'
import {
  createSurfaceFields,
  makeContext,
  paintCityLights,
  paintClouds,
  paintLandMask,
  paintMoon,
  paintSurface,
  type CityLight,
  type SurfaceFields,
  type SurfaceTargets,
} from './surface'
import { surfaceParamsAt, type RGB, type SurfaceParams } from './surface-params'

const FIELD_WIDTH = 2048
const FIELD_HEIGHT = 1024

let fieldsPromise: Promise<SurfaceFields> | null = null
const progressListeners = new Set<(f: number) => void>()
export function loadSurfaceFields(onProgress?: (f: number) => void) {
  if (onProgress) progressListeners.add(onProgress)
  if (!fieldsPromise) {
    fieldsPromise = createSurfaceFields(FIELD_WIDTH, FIELD_HEIGHT, (f) => progressListeners.forEach((l) => l(f)))
  }
  return fieldsPromise
}

export interface ArcSpec {
  id: string
  from: [number, number]
  to: [number, number]
  /** 0..1 fraction of the arc revealed. */
  progress: number
  color: string
}

export interface MarkerSpec {
  id: string
  lon: number
  lat: number
  color: string
  /** 0..1 fade-in. */
  opacity: number
  size?: number
}

export interface ProjectedPoint {
  x: number
  y: number
  visible: boolean
  /** 0 at the limb → 1 facing the camera. */
  facing: number
}

export interface GlobeHandle {
  setTime(ma: number): void
  setLights(cities: CityLight[], intensity: number, sprawl: number): void
  setArcs(arcs: ArcSpec[]): void
  setMarkers(markers: MarkerSpec[]): void
  setSpin(speed: number): void
  setSun(preset: SunPreset): void
  /** `zoom` multiplies the distance at which the globe fits the viewport. */
  focusOn(lon: number, lat: number, zoom?: number): void
  project(lon: number, lat: number): ProjectedPoint
  onFrame(cb: () => void): () => void
  ready: Promise<void>
  dispose(): void
}

function rgbToColor([r, g, b]: RGB) {
  return new Color(r / 255, g / 255, b / 255)
}

function makeTexture(canvas: HTMLCanvasElement, srgb = false) {
  const tex = new CanvasTexture(canvas)
  tex.anisotropy = 4
  tex.minFilter = LinearMipmapLinearFilter
  tex.magFilter = LinearFilter
  if (srgb) tex.colorSpace = SRGBColorSpace
  return tex
}

function makeGlowSprite() {
  const size = 64
  const ctx = makeContext(size, size)
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.25, 'rgba(255,255,255,0.85)')
  g.addColorStop(0.5, 'rgba(255,255,255,0.25)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  return makeTexture(ctx.canvas)
}

function makeStars(count: number, radius: number, size: number, brightness: number) {
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  let seed = 42 + count
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0
    return seed / 4294967296
  }
  for (let i = 0; i < count; i++) {
    const u = rand() * 2 - 1
    const theta = rand() * Math.PI * 2
    const s = Math.sqrt(1 - u * u)
    // Densify toward a tilted band to suggest the Milky Way.
    const band = Math.exp(-Math.pow((u * 0.9 + Math.sin(theta) * 0.35) * 2.2, 2))
    if (rand() > 0.35 + band * 0.65) {
      i--
      continue
    }
    positions[i * 3] = s * Math.cos(theta) * radius
    positions[i * 3 + 1] = u * radius
    positions[i * 3 + 2] = s * Math.sin(theta) * radius
    const temp = rand()
    const v = brightness * (0.45 + rand() * 0.55)
    colors[i * 3] = v * (temp < 0.3 ? 0.78 : 1)
    colors[i * 3 + 1] = v * (temp < 0.3 ? 0.86 : temp > 0.85 ? 0.85 : 0.97)
    colors[i * 3 + 2] = v * (temp < 0.3 ? 1 : temp > 0.85 ? 0.7 : 0.95)
  }
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  geometry.setAttribute('color', new Float32BufferAttribute(colors, 3))
  const material = new PointsMaterial({ size, sizeAttenuation: false, vertexColors: true, transparent: true, depthWrite: false })
  return new Points(geometry, material)
}

const atmosphereVertex = /* glsl */ `
  varying vec3 vNormalW;
  varying vec3 vPositionW;
  void main() {
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vPositionW = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const haloFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uSunDir;
  uniform float uStrength;
  varying vec3 vNormalW;
  varying vec3 vPositionW;
  void main() {
    vec3 viewDir = normalize(cameraPosition - vPositionW);
    float d = clamp(-dot(normalize(vNormalW), viewDir), 0.0, 1.0);
    // Exponential falloff away from the limb, like scattered light thinning with altitude.
    float glow = pow(d * 1.9, 3.0) * 1.05;
    float sun = dot(normalize(vNormalW), uSunDir);
    float day = clamp(sun * 1.2 + 0.55, 0.06, 1.0);
    // Sunset band: warm the scattering where the terminator meets the limb.
    float dusk = smoothstep(0.35, 0.0, abs(sun + 0.05)) * 0.6;
    vec3 color = mix(uColor, vec3(1.0, 0.55, 0.3), dusk);
    gl_FragColor = vec4(color * glow * day * uStrength, glow * day);
  }
`

const rimFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uSunDir;
  uniform float uStrength;
  varying vec3 vNormalW;
  varying vec3 vPositionW;
  void main() {
    vec3 viewDir = normalize(cameraPosition - vPositionW);
    float rim = 1.0 - clamp(dot(normalize(vNormalW), viewDir), 0.0, 1.0);
    float glow = pow(rim, 3.5) * 0.75 + pow(rim, 10.0) * 0.4;
    float sun = dot(normalize(vNormalW), uSunDir);
    float day = clamp(sun * 1.5 + 0.5, 0.03, 1.0);
    float dusk = smoothstep(0.3, 0.0, abs(sun + 0.05)) * 0.5;
    vec3 color = mix(uColor, vec3(1.0, 0.6, 0.35), dusk);
    gl_FragColor = vec4(color * glow * day * uStrength, glow * day);
  }
`

export interface SunPreset {
  /** Components along the camera's right, up and back (toward viewer) axes. */
  right: number
  up: number
  toward: number
  /** Wrapped daylight bleed past the terminator, 0..1. */
  fill: number
  /** Multiplier on the ambient + hemisphere fill lights. */
  ambient: number
}

export const sunPresets = {
  /** Mostly lit disk with a dark crescent on the left—cinematic deep time. */
  day: { right: 0.55, up: 0.35, toward: 0.85, fill: 0.32, ambient: 1 } as SunPreset,
  /** Terminator running through the middle: half day, half city lights. */
  dusk: { right: 0.95, up: 0.25, toward: 0.05, fill: 0.08, ambient: 0.28 } as SunPreset,
}

export function createGlobeScene(container: HTMLElement, initialMa: number): GlobeHandle {
  const scene = new Scene()
  const camera = new PerspectiveCamera(36, 1, 0.05, 200)
  camera.position.set(0, 0.35, 3.3)

  const renderer = new WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.toneMapping = ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.18
  renderer.setClearColor(0x02040a, 1)
  container.appendChild(renderer.domElement)

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.06
  controls.enablePan = false
  controls.minDistance = 1.55
  controls.maxDistance = 7
  controls.rotateSpeed = 0.55
  controls.zoomSpeed = 0.7

  const sunDir = new Vector3(1, 0.32, 0.55).normalize()
  const targetSunDir = sunDir.clone()
  let sunPreset: SunPreset = sunPresets.day
  const sun = new DirectionalLight(0xfff6ea, 1.9)
  sun.position.copy(sunDir).multiplyScalar(20)
  scene.add(sun)
  // Bright, even fill (the globe.gl look): a neutral ambient plus a
  // sky-blue/ground-warm hemisphere so the disk never falls into hard shadow.
  const ambient = new AmbientLight(0xffffff, 0.75)
  const hemisphere = new HemisphereLight(0xbcd4ff, 0x3a2e24, 0.55)
  scene.add(ambient, hemisphere)

  scene.add(makeStars(5200, 90, 1.35, 0.85))
  scene.add(makeStars(420, 90, 2.6, 1))

  /* --- Canvases & textures ------------------------------------------- */
  const hi: SurfaceTargets = {
    color: makeContext(FIELD_WIDTH, FIELD_HEIGHT),
    bump: makeContext(FIELD_WIDTH, FIELD_HEIGHT),
    rough: makeContext(FIELD_WIDTH, FIELD_HEIGHT),
    emissive: makeContext(FIELD_WIDTH, FIELD_HEIGHT),
  }
  const lo: SurfaceTargets = {
    color: makeContext(FIELD_WIDTH / 2, FIELD_HEIGHT / 2),
    bump: makeContext(FIELD_WIDTH / 2, FIELD_HEIGHT / 2),
    rough: makeContext(FIELD_WIDTH / 2, FIELD_HEIGHT / 2),
    emissive: makeContext(FIELD_WIDTH / 2, FIELD_HEIGHT / 2),
  }
  const masks = {
    1: { mask: makeContext(FIELD_WIDTH, FIELD_HEIGHT), soft: makeContext(FIELD_WIDTH, FIELD_HEIGHT) },
    2: { mask: makeContext(FIELD_WIDTH / 2, FIELD_HEIGHT / 2), soft: makeContext(FIELD_WIDTH / 2, FIELD_HEIGHT / 2) },
  }
  let lastMask = masks[2].mask
  let lastCloudKey = ''
  const cloudCtx = makeContext(FIELD_WIDTH / 2, FIELD_HEIGHT / 2)
  const lightsCtx = makeContext(FIELD_WIDTH / 2, FIELD_HEIGHT / 2)

  const textures = {
    hi: {
      color: makeTexture(hi.color.canvas, true),
      bump: makeTexture(hi.bump.canvas),
      rough: makeTexture(hi.rough.canvas),
      emissive: makeTexture(hi.emissive.canvas, true),
    },
    lo: {
      color: makeTexture(lo.color.canvas, true),
      bump: makeTexture(lo.bump.canvas),
      rough: makeTexture(lo.rough.canvas),
      emissive: makeTexture(lo.emissive.canvas, true),
    },
    cloud: makeTexture(cloudCtx.canvas, true),
    lights: makeTexture(lightsCtx.canvas, true),
  }

  /* --- Earth ---------------------------------------------------------- */
  const world = new Group()
  scene.add(world)

  const earthMaterial = new MeshStandardMaterial({
    map: textures.lo.color,
    bumpMap: textures.lo.bump,
    bumpScale: 0.03,
    roughnessMap: textures.lo.rough,
    roughness: 1,
    metalness: 0,
    emissiveMap: textures.lo.emissive,
    emissive: new Color(0xffffff),
    emissiveIntensity: 1,
  })
  const sunDirView = new Vector3()
  const lightUniforms = {
    uLights: { value: textures.lights },
    uClouds: { value: textures.cloud },
    uCloudShift: { value: 0 },
    uSunDir: { value: sunDirView },
    uLightsIntensity: { value: 1 },
    uFill: { value: 0.32 },
  }
  earthMaterial.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, lightUniforms)
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        '#include <common>\nuniform sampler2D uLights;\nuniform sampler2D uClouds;\nuniform float uCloudShift;\nuniform vec3 uSunDir;\nuniform float uLightsIntensity;\nuniform float uFill;',
      )
      .replace(
        '#include <map_fragment>',
        `#include <map_fragment>
        {
          // Cloud shadows: sample the cloud layer offset toward the sun so
          // shadows fall slightly away from the clouds that cast them.
          vec2 shadowUv = vMapUv + vec2(uCloudShift + 0.004, -0.003);
          float cloud = texture2D(uClouds, shadowUv).a;
          diffuseColor.rgb *= 1.0 - cloud * 0.45;
        }`,
      )
      .replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
        {
          float sun = dot(normalize(normal), uSunDir);
          // Wrapped fill: lets daylight bleed well past the geometric terminator
          // so the shading rolls off gently instead of snapping to black.
          float wrap = smoothstep(-0.55, 0.35, sun);
          totalEmissiveRadiance += diffuseColor.rgb * wrap * uFill;
          float night = smoothstep(0.1, -0.3, sun);
          vec3 lights = texture2D(uLights, vMapUv).rgb;
          totalEmissiveRadiance += lights * night * uLightsIntensity * 1.6;
        }`,
      )
  }
  const earth = new Mesh(new SphereGeometry(1, 160, 112), earthMaterial)
  world.add(earth)

  const cloudMaterial = new MeshStandardMaterial({
    map: textures.cloud,
    transparent: true,
    depthWrite: false,
    roughness: 1,
    metalness: 0,
    opacity: 0.96,
  })
  const clouds = new Mesh(new SphereGeometry(1.012, 128, 96), cloudMaterial)
  world.add(clouds)

  const rimMaterial = new ShaderMaterial({
    vertexShader: atmosphereVertex,
    fragmentShader: rimFragment,
    uniforms: { uColor: { value: new Color(0x6f9dff) }, uSunDir: { value: sunDir }, uStrength: { value: 1 } },
    transparent: true,
    blending: AdditiveBlending,
    depthWrite: false,
  })
  world.add(new Mesh(new SphereGeometry(1.016, 96, 64), rimMaterial))

  const haloMaterial = new ShaderMaterial({
    vertexShader: atmosphereVertex,
    fragmentShader: haloFragment,
    uniforms: { uColor: { value: new Color(0x6f9dff) }, uSunDir: { value: sunDir }, uStrength: { value: 1 } },
    transparent: true,
    blending: AdditiveBlending,
    side: BackSide,
    depthWrite: false,
  })
  scene.add(new Mesh(new SphereGeometry(1.19, 96, 64), haloMaterial))

  /* --- Moon ----------------------------------------------------------- */
  const moonCtx = makeContext(512, 256)
  paintMoon(moonCtx)
  const moon = new Mesh(
    new SphereGeometry(0.27, 48, 32),
    new MeshStandardMaterial({ map: makeTexture(moonCtx.canvas, true), roughness: 1, metalness: 0 }),
  )
  scene.add(moon)

  /* --- Overlays: arcs & markers --------------------------------------- */
  const overlay = new Group()
  world.add(overlay)
  const glowTexture = makeGlowSprite()
  const arcMeshes = new Map<string, { mesh: Mesh<TubeGeometry, MeshBasicMaterial>; total: number; head: Sprite }>()
  const markerSprites = new Map<string, Sprite>()

  /* --- State ---------------------------------------------------------- */
  let currentMa = initialMa
  let pendingMa: number | null = initialMa
  let hiResTimer: number | undefined
  let fields: SurfaceFields | null = null
  let spinSpeed = 0.035
  let disposed = false
  let focusTarget: Vector3 | null = null
  let focusDistance = 3.3
  const frameListeners = new Set<() => void>()
  let cityCache: { cities: CityLight[]; intensity: number; sprawl: number } = { cities: [], intensity: 0, sprawl: 0 }

  function applyParams(p: SurfaceParams) {
    const atmo = rgbToColor(p.atmosphere)
    rimMaterial.uniforms.uColor.value.copy(atmo)
    haloMaterial.uniforms.uColor.value.copy(atmo)
    rimMaterial.uniforms.uStrength.value = p.atmosphereStrength
    haloMaterial.uniforms.uStrength.value = p.atmosphereStrength
    cloudMaterial.opacity = 0.7 + 0.3 * p.cloudCover
  }

  function applyTextures(set: typeof textures.hi) {
    earthMaterial.map = set.color
    earthMaterial.bumpMap = set.bump
    earthMaterial.roughnessMap = set.rough
    earthMaterial.emissiveMap = set.emissive
    set.color.needsUpdate = true
    set.bump.needsUpdate = true
    set.rough.needsUpdate = true
    set.emissive.needsUpdate = true
    earthMaterial.needsUpdate = true
  }

  function paint(ma: number, stride: 1 | 2) {
    if (!fields) return
    const params = surfaceParamsAt(ma)
    const jitter = Math.max(0, Math.min(1, (ma - 2400) / 1800)) * 0.012
    const { mask, soft } = masks[stride]
    const w = FIELD_WIDTH / stride
    const h = FIELD_HEIGHT / stride
    paintLandMask(landRingsAt(ma, w, h, jitter), mask, soft, 12 / stride)
    lastMask = mask
    const targets = stride === 1 ? hi : lo
    paintSurface({ fields, params, mask, soft, targets, stride })
    const cloudKey = `${params.cloudCover.toFixed(3)}|${params.cloudTint.map((c) => c.toFixed(0)).join(',')}`
    if (cloudKey !== lastCloudKey) {
      lastCloudKey = cloudKey
      paintClouds(fields, params, cloudCtx)
      textures.cloud.needsUpdate = true
    }
    applyTextures(stride === 1 ? textures.hi : textures.lo)
    applyParams(params)
    currentMa = ma
    if (cityCache.intensity > 0) repaintLights()
  }

  function repaintLights() {
    paintCityLights(lightsCtx, cityCache.cities, cityCache.intensity, cityCache.sprawl, lastMask.canvas)
    textures.lights.needsUpdate = true
  }

  function scheduleHiRes(ma: number) {
    window.clearTimeout(hiResTimer)
    hiResTimer = window.setTimeout(() => {
      if (disposed || pendingMa !== null) return
      paint(ma, 1)
    }, 420)
  }

  const ready = loadSurfaceFields().then((f) => {
    if (disposed) return
    fields = f
    paint(pendingMa ?? currentMa, 2)
    scheduleHiRes(pendingMa ?? currentMa)
    pendingMa = null
  })

  /* --- Resize --------------------------------------------------------- */
  /** Camera distance at which a sphere of `radius` fits the viewport. */
  function fitDistance(radius: number) {
    const vFov = (camera.fov * Math.PI) / 180
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * camera.aspect)
    return radius / Math.sin(Math.min(vFov, hFov) / 2)
  }
  let baseDistance = camera.position.length()
  function resize() {
    const { clientWidth: w, clientHeight: h } = container
    if (w === 0 || h === 0) return
    renderer.setSize(w, h, false)
    renderer.domElement.style.width = '100%'
    renderer.domElement.style.height = '100%'
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    const fit = fitDistance(1.28)
    const ratio = camera.position.length() / baseDistance
    baseDistance = fit
    camera.position.setLength(fit * ratio)
    controls.minDistance = Math.min(1.55, fit * 0.5)
    controls.maxDistance = fit * 2.2
    focusDistance = fit
  }
  resize()
  const observer = new ResizeObserver(resize)
  observer.observe(container)

  /* --- Render loop ---------------------------------------------------- */
  let last = performance.now()
  let elapsed = 0
  const tmpVec = new Vector3()
  const camRight = new Vector3()
  const camUp = new Vector3()
  const camBack = new Vector3()
  function frame(now: number) {
    if (disposed) return
    const dt = Math.min(0.1, (now - last) / 1000)
    last = now
    elapsed += dt

    if (pendingMa !== null && fields) {
      const ma = pendingMa
      pendingMa = null
      paint(ma, 2)
      scheduleHiRes(ma)
    }

    world.rotation.y += spinSpeed * dt
    clouds.rotation.y += dt * 0.006
    lightUniforms.uCloudShift.value = -clouds.rotation.y / (Math.PI * 2)

    const moonAngle = elapsed * 0.06 + 1.2
    const moonDist = 2.4 + 2.2 * Math.max(0, Math.min(1, (4500 - currentMa) / 3200))
    moon.position.set(Math.cos(moonAngle) * moonDist, Math.sin(moonAngle * 0.7) * 0.6, Math.sin(moonAngle) * moonDist)
    moon.rotation.y = moonAngle
    moon.visible = currentMa < 4505

    if (focusTarget) {
      tmpVec.copy(focusTarget).applyQuaternion(world.quaternion).normalize().multiplyScalar(focusDistance)
      camera.position.lerp(tmpVec, 1 - Math.pow(0.001, dt))
      if (camera.position.distanceTo(tmpVec) < 0.01) focusTarget = null
    }
    controls.update()

    // The sun rides with the camera so the terminator always frames the view.
    camera.matrixWorld.extractBasis(camRight, camUp, camBack)
    targetSunDir
      .copy(camRight)
      .multiplyScalar(sunPreset.right)
      .addScaledVector(camUp, sunPreset.up)
      .addScaledVector(camBack, sunPreset.toward)
      .normalize()
    sunDir.lerp(targetSunDir, 1 - Math.pow(0.02, dt)).normalize()
    const ease = 1 - Math.pow(0.05, dt)
    ambient.intensity += (0.75 * sunPreset.ambient - ambient.intensity) * ease
    hemisphere.intensity += (0.55 * sunPreset.ambient - hemisphere.intensity) * ease
    lightUniforms.uFill.value += (sunPreset.fill - lightUniforms.uFill.value) * ease
    sun.position.copy(sunDir).multiplyScalar(20)
    sunDirView.copy(sunDir).transformDirection(camera.matrixWorldInverse)

    for (const { mesh, total, head } of arcMeshes.values()) {
      const progress = mesh.userData.progress as number
      mesh.geometry.setDrawRange(0, Math.floor(total * progress))
      const pulse = 0.75 + 0.25 * Math.sin(elapsed * 4 + mesh.id)
      head.material.opacity = progress > 0 && progress < 1 ? pulse : 0
    }
    for (const sprite of markerSprites.values()) {
      const base = sprite.userData.size as number
      const s = base * (1 + 0.1 * Math.sin(elapsed * 2.2 + sprite.id))
      sprite.scale.set(s, s, 1)
    }

    renderer.render(scene, camera)
    frameListeners.forEach((cb) => cb())
    requestAnimationFrame(frame)
  }
  requestAnimationFrame(frame)

  /* --- Public API ----------------------------------------------------- */
  const project = (lon: number, lat: number): ProjectedPoint => {
    const p = lonLatToVector(lon, lat).multiplyScalar(1.02)
    world.localToWorld(p)
    const normal = p.clone().normalize()
    const toCamera = camera.position.clone().sub(p).normalize()
    const facing = normal.dot(toCamera)
    p.project(camera)
    const { clientWidth: w, clientHeight: h } = container
    return { x: ((p.x + 1) / 2) * w, y: ((1 - p.y) / 2) * h, visible: facing > 0.08 && p.z < 1, facing }
  }

  return {
    ready,
    setTime(ma) {
      if (Math.abs(ma - currentMa) < 1e-6 && pendingMa === null) return
      pendingMa = ma
    },
    setLights(cities, intensity, sprawl) {
      cityCache = { cities, intensity, sprawl }
      repaintLights()
      lightUniforms.uLightsIntensity.value = 1
    },
    setSun(preset) {
      sunPreset = preset
    },
    setArcs(arcs) {
      const keep = new Set(arcs.map((a) => a.id))
      for (const [id, entry] of arcMeshes) {
        if (!keep.has(id)) {
          overlay.remove(entry.mesh, entry.head)
          entry.mesh.geometry.dispose()
          entry.mesh.material.dispose()
          entry.head.material.dispose()
          arcMeshes.delete(id)
        }
      }
      for (const arc of arcs) {
        let entry = arcMeshes.get(arc.id)
        if (!entry) {
          const a = lonLatToVector(arc.from[0], arc.from[1])
          const b = lonLatToVector(arc.to[0], arc.to[1])
          const points = greatCircleArc(a, b, 64, 0.06).map((p) => p.multiplyScalar(1.015))
          const curve = new CatmullRomCurve3(points)
          const geometry = new TubeGeometry(curve, 96, 0.0045, 6, false)
          const material = new MeshBasicMaterial({ color: new Color(arc.color), transparent: true, opacity: 0.95, toneMapped: false })
          const mesh = new Mesh(geometry, material)
          mesh.userData.progress = 0
          mesh.userData.points = points
          const head = new Sprite(new SpriteMaterial({ map: glowTexture, color: new Color(arc.color), transparent: true, depthWrite: false, toneMapped: false }))
          head.scale.set(0.09, 0.09, 1)
          overlay.add(mesh, head)
          entry = { mesh, total: geometry.index ? geometry.index.count : geometry.attributes.position.count, head }
          arcMeshes.set(arc.id, entry)
        }
        entry.mesh.userData.progress = arc.progress
        const pts = entry.mesh.userData.points as Vector3[]
        const idx = Math.min(pts.length - 1, Math.floor(arc.progress * (pts.length - 1)))
        entry.head.position.copy(pts[idx])
      }
    },
    setMarkers(markers) {
      const keep = new Set(markers.map((m) => m.id))
      for (const [id, sprite] of markerSprites) {
        if (!keep.has(id)) {
          overlay.remove(sprite)
          sprite.material.dispose()
          markerSprites.delete(id)
        }
      }
      for (const m of markers) {
        let sprite = markerSprites.get(m.id)
        if (!sprite) {
          sprite = new Sprite(new SpriteMaterial({ map: glowTexture, color: new Color(m.color), transparent: true, depthWrite: false, toneMapped: false }))
          sprite.position.copy(lonLatToVector(m.lon, m.lat).multiplyScalar(1.018))
          overlay.add(sprite)
          markerSprites.set(m.id, sprite)
        }
        sprite.material.color.set(m.color)
        sprite.material.opacity = m.opacity
        sprite.userData.size = m.size ?? 0.07
      }
    },
    setSpin(speed) {
      spinSpeed = speed
    },
    focusOn(lon, lat, zoom = 1) {
      focusTarget = lonLatToVector(lon, lat)
      focusDistance = baseDistance * zoom
    },
    project,
    onFrame(cb) {
      frameListeners.add(cb)
      return () => frameListeners.delete(cb)
    },
    dispose() {
      disposed = true
      window.clearTimeout(hiResTimer)
      observer.disconnect()
      controls.dispose()
      scene.traverse((obj) => {
        const mesh = obj as Mesh
        mesh.geometry?.dispose?.()
        const mat = mesh.material as { dispose?: () => void } | undefined
        mat?.dispose?.()
      })
      Object.values(textures.hi).forEach((t) => t.dispose())
      Object.values(textures.lo).forEach((t) => t.dispose())
      textures.cloud.dispose()
      textures.lights.dispose()
      glowTexture.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    },
  }
}
