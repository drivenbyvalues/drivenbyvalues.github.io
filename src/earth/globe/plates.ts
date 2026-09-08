import { Quaternion, Vector3 } from 'three'
import { feature } from 'topojson-client'
import type { Topology, GeometryCollection } from 'topojson-specification'
import type { MultiPolygon, Polygon, Position } from 'geojson'
import countriesTopo from 'world-atlas/countries-110m.json'
import { lonLatToVector, rotationBetween, scaleTowards, vectorToLonLat } from './geo'

export type PlateId =
  | 'northAmerica'
  | 'southAmerica'
  | 'africa'
  | 'eurasia'
  | 'india'
  | 'australia'
  | 'antarctica'
  | 'arabia'

interface Pose {
  /** Millions of years ago. */
  ma: number
  lon: number
  lat: number
  /** Rotation about the plate's own centre, degrees. */
  spin: number
  /** Fraction of modern continental extent (early cratons were tiny). */
  scale: number
}

interface Plate {
  id: PlateId
  /** Modern centre of the plate, lon/lat. */
  centre: [number, number]
  poses: Pose[]
}

/* Schematic reconstructions. Positions are approximate—good enough to
 * tell the story of Rodinia → Pannotia → Gondwana/Laurussia → Pangaea →
 * today, not a substitute for GPlates. Times are Ma; poses are
 * interpolated linearly between keyframes. */
const plates: Plate[] = [
  {
    id: 'northAmerica',
    centre: [-100, 45],
    poses: [
      { ma: 0, lon: -100, lat: 45, spin: 0, scale: 1 },
      { ma: 65, lon: -85, lat: 45, spin: 5, scale: 1 },
      { ma: 150, lon: -55, lat: 38, spin: 18, scale: 0.98 },
      { ma: 250, lon: -38, lat: 28, spin: 28, scale: 0.96 },
      { ma: 400, lon: -22, lat: 8, spin: 45, scale: 0.9 },
      { ma: 600, lon: -20, lat: -45, spin: 70, scale: 0.85 },
      { ma: 1000, lon: 0, lat: 0, spin: 95, scale: 0.8 },
      { ma: 1800, lon: 10, lat: 15, spin: 120, scale: 0.6 },
      { ma: 2500, lon: 30, lat: 20, spin: 140, scale: 0.42 },
      { ma: 3200, lon: 45, lat: 25, spin: 160, scale: 0.26 },
      { ma: 3800, lon: 60, lat: 30, spin: 180, scale: 0.12 },
      { ma: 4100, lon: 60, lat: 30, spin: 180, scale: 0.05 },
    ],
  },
  {
    id: 'southAmerica',
    centre: [-60, -15],
    poses: [
      { ma: 0, lon: -60, lat: -15, spin: 0, scale: 1 },
      { ma: 65, lon: -55, lat: -18, spin: 0, scale: 1 },
      { ma: 150, lon: -35, lat: -22, spin: -8, scale: 0.98 },
      { ma: 250, lon: -28, lat: -22, spin: -12, scale: 0.96 },
      { ma: 400, lon: -42, lat: -48, spin: -20, scale: 0.9 },
      { ma: 600, lon: -50, lat: -62, spin: 10, scale: 0.85 },
      { ma: 1000, lon: -34, lat: -12, spin: 40, scale: 0.78 },
      { ma: 1800, lon: -70, lat: -20, spin: 60, scale: 0.55 },
      { ma: 2500, lon: -95, lat: -25, spin: 80, scale: 0.38 },
      { ma: 3200, lon: -110, lat: -20, spin: 90, scale: 0.22 },
      { ma: 3800, lon: -120, lat: -15, spin: 90, scale: 0.1 },
      { ma: 4100, lon: -120, lat: -15, spin: 90, scale: 0.04 },
    ],
  },
  {
    id: 'africa',
    centre: [20, 5],
    poses: [
      { ma: 0, lon: 20, lat: 5, spin: 0, scale: 1 },
      { ma: 65, lon: 15, lat: -2, spin: -4, scale: 1 },
      { ma: 150, lon: 5, lat: -12, spin: -10, scale: 0.98 },
      { ma: 250, lon: 8, lat: -18, spin: -14, scale: 0.96 },
      { ma: 400, lon: 5, lat: -52, spin: -30, scale: 0.9 },
      { ma: 600, lon: 20, lat: -70, spin: 30, scale: 0.85 },
      { ma: 1000, lon: -8, lat: -38, spin: 35, scale: 0.72 },
      { ma: 1800, lon: -20, lat: -55, spin: 50, scale: 0.55 },
      { ma: 2500, lon: -30, lat: -50, spin: 60, scale: 0.38 },
      { ma: 3200, lon: -35, lat: -40, spin: 70, scale: 0.24 },
      { ma: 3800, lon: -40, lat: -35, spin: 70, scale: 0.12 },
      { ma: 4100, lon: -40, lat: -35, spin: 70, scale: 0.05 },
    ],
  },
  {
    id: 'eurasia',
    centre: [75, 50],
    poses: [
      { ma: 0, lon: 75, lat: 50, spin: 0, scale: 1 },
      { ma: 65, lon: 72, lat: 52, spin: -3, scale: 1 },
      { ma: 150, lon: 62, lat: 52, spin: -10, scale: 0.97 },
      { ma: 250, lon: 50, lat: 48, spin: -18, scale: 0.94 },
      { ma: 400, lon: 45, lat: 28, spin: -35, scale: 0.82 },
      { ma: 600, lon: 70, lat: 20, spin: -40, scale: 0.78 },
      { ma: 1000, lon: 42, lat: 22, spin: 60, scale: 0.62 },
      { ma: 1800, lon: 90, lat: 35, spin: 80, scale: 0.5 },
      { ma: 2500, lon: 120, lat: 40, spin: 100, scale: 0.35 },
      { ma: 3200, lon: 140, lat: 40, spin: 110, scale: 0.2 },
      { ma: 3800, lon: 150, lat: 40, spin: 110, scale: 0.1 },
      { ma: 4100, lon: 150, lat: 40, spin: 110, scale: 0.04 },
    ],
  },
  {
    id: 'india',
    centre: [78, 22],
    poses: [
      { ma: 0, lon: 78, lat: 22, spin: 0, scale: 1 },
      { ma: 65, lon: 64, lat: -8, spin: 8, scale: 1 },
      { ma: 150, lon: 48, lat: -38, spin: 20, scale: 0.98 },
      { ma: 250, lon: 45, lat: -42, spin: 25, scale: 0.96 },
      { ma: 400, lon: 42, lat: -60, spin: 30, scale: 0.9 },
      { ma: 600, lon: 60, lat: -62, spin: 40, scale: 0.85 },
      { ma: 1000, lon: 30, lat: -24, spin: 55, scale: 0.78 },
      { ma: 1800, lon: 40, lat: -40, spin: 60, scale: 0.55 },
      { ma: 2500, lon: 60, lat: -45, spin: 60, scale: 0.4 },
      { ma: 3200, lon: 80, lat: -50, spin: 60, scale: 0.25 },
      { ma: 3800, lon: 90, lat: -55, spin: 60, scale: 0.1 },
      { ma: 4100, lon: 90, lat: -55, spin: 60, scale: 0.04 },
    ],
  },
  {
    id: 'australia',
    centre: [135, -25],
    poses: [
      { ma: 0, lon: 135, lat: -25, spin: 0, scale: 1 },
      { ma: 65, lon: 122, lat: -48, spin: 5, scale: 1 },
      { ma: 150, lon: 100, lat: -58, spin: 10, scale: 0.98 },
      { ma: 250, lon: 88, lat: -60, spin: 10, scale: 0.96 },
      { ma: 400, lon: 92, lat: -58, spin: 10, scale: 0.9 },
      { ma: 600, lon: 110, lat: -50, spin: 30, scale: 0.85 },
      { ma: 1000, lon: 32, lat: 16, spin: 90, scale: 0.78 },
      { ma: 1800, lon: -10, lat: 40, spin: 110, scale: 0.55 },
      { ma: 2500, lon: -40, lat: 50, spin: 120, scale: 0.4 },
      { ma: 3200, lon: -60, lat: 55, spin: 120, scale: 0.25 },
      { ma: 3800, lon: -70, lat: 55, spin: 120, scale: 0.12 },
      { ma: 4100, lon: -70, lat: 55, spin: 120, scale: 0.05 },
    ],
  },
  {
    id: 'antarctica',
    centre: [0, -90],
    poses: [
      { ma: 0, lon: 0, lat: -90, spin: 0, scale: 1 },
      { ma: 65, lon: 10, lat: -84, spin: 0, scale: 1 },
      { ma: 150, lon: 30, lat: -78, spin: 0, scale: 0.98 },
      { ma: 250, lon: 40, lat: -74, spin: 0, scale: 0.96 },
      { ma: 400, lon: 45, lat: -78, spin: 0, scale: 0.9 },
      { ma: 600, lon: 70, lat: -80, spin: 0, scale: 0.85 },
      { ma: 1000, lon: 20, lat: -10, spin: 0, scale: 0.7 },
      { ma: 1800, lon: 60, lat: -10, spin: 0, scale: 0.5 },
      { ma: 2500, lon: 100, lat: -5, spin: 0, scale: 0.35 },
      { ma: 3200, lon: 120, lat: 0, spin: 0, scale: 0.2 },
      { ma: 3800, lon: 130, lat: 0, spin: 0, scale: 0.1 },
      { ma: 4100, lon: 130, lat: 0, spin: 0, scale: 0.04 },
    ],
  },
  {
    id: 'arabia',
    centre: [45, 24],
    poses: [
      { ma: 0, lon: 45, lat: 24, spin: 0, scale: 1 },
      { ma: 65, lon: 40, lat: 14, spin: -5, scale: 1 },
      { ma: 150, lon: 30, lat: 2, spin: -10, scale: 0.98 },
      { ma: 250, lon: 32, lat: -4, spin: -14, scale: 0.96 },
      { ma: 400, lon: 28, lat: -40, spin: -30, scale: 0.9 },
      { ma: 600, lon: 40, lat: -58, spin: 20, scale: 0.85 },
      { ma: 1000, lon: -2, lat: -28, spin: 35, scale: 0.6 },
      { ma: 1800, lon: -10, lat: -70, spin: 50, scale: 0.45 },
      { ma: 2500, lon: -10, lat: -75, spin: 60, scale: 0.3 },
      { ma: 3200, lon: -10, lat: -75, spin: 60, scale: 0.15 },
      { ma: 3800, lon: -10, lat: -75, spin: 60, scale: 0.06 },
      { ma: 4100, lon: -10, lat: -75, spin: 60, scale: 0.02 },
    ],
  },
]

function classify(lon: number, lat: number): PlateId {
  if (lat < -60) return 'antarctica'
  if ((lon >= 110 || lon < -170) && lat < -8) return 'australia'
  if (lon >= -170 && lon <= -30 && lat > 12) return 'northAmerica'
  if (lon >= -95 && lon <= -30 && lat <= 12) return 'southAmerica'
  if (lon >= 34 && lon <= 60 && lat >= 12 && lat <= 31) return 'arabia'
  if (lon >= 60 && lon <= 93 && lat >= 5 && lat <= 36 && !(lon < 72 && lat > 32)) return 'india'
  if (lon >= -25 && lon <= 52 && lat >= -40 && lat <= 38) return 'africa'
  return 'eurasia'
}

interface Landmass {
  plate: PlateId
  rings: Position[][]
}

function ringCentroid(ring: Position[]): [number, number] {
  let x = 0
  let y = 0
  let z = 0
  const v = new Vector3()
  for (const [lon, lat] of ring) {
    lonLatToVector(lon, lat, v)
    x += v.x
    y += v.y
    z += v.z
  }
  return vectorToLonLat(v.set(x, y, z).normalize())
}

function loadLandmasses(): Landmass[] {
  const topo = countriesTopo as unknown as Topology<{ countries: GeometryCollection }>
  const collection = feature(topo, topo.objects.countries)
  const result: Landmass[] = []
  for (const f of collection.features) {
    const geom = f.geometry as Polygon | MultiPolygon
    const polygons = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates
    for (const polygon of polygons) {
      const outer = polygon[0]
      if (outer.length < 4) continue
      const [clon, clat] = ringCentroid(outer)
      result.push({ plate: classify(clon, clat), rings: [outer] })
    }
  }
  return result
}

let landmasses: Landmass[] | null = null
export function getLandmasses() {
  if (!landmasses) landmasses = loadLandmasses()
  return landmasses
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function poseAt(plate: Plate, ma: number): Pose {
  const { poses } = plate
  if (ma <= poses[0].ma) return poses[0]
  const last = poses[poses.length - 1]
  if (ma >= last.ma) return last
  for (let i = 0; i < poses.length - 1; i++) {
    const a = poses[i]
    const b = poses[i + 1]
    if (ma >= a.ma && ma <= b.ma) {
      const t = (ma - a.ma) / (b.ma - a.ma)
      const s = t * t * (3 - 2 * t)
      const va = lonLatToVector(a.lon, a.lat)
      const vb = lonLatToVector(b.lon, b.lat)
      const vc = va.lerp(vb, s).normalize()
      const [lon, lat] = vectorToLonLat(vc)
      return { ma, lon, lat, spin: lerp(a.spin, b.spin, s), scale: lerp(a.scale, b.scale, s) }
    }
  }
  return last
}

interface PlateTransform {
  centre: Vector3
  spin: Quaternion
  move: Quaternion
  scale: number
}

function transformsAt(ma: number): Record<PlateId, PlateTransform> {
  const out = {} as Record<PlateId, PlateTransform>
  for (const plate of plates) {
    const pose = poseAt(plate, ma)
    const centre = lonLatToVector(plate.centre[0], plate.centre[1])
    const target = lonLatToVector(pose.lon, pose.lat)
    out[plate.id] = {
      centre,
      spin: new Quaternion().setFromAxisAngle(centre, pose.spin * DEG_),
      move: rotationBetween(centre, target),
      scale: pose.scale,
    }
  }
  return out
}

const DEG_ = Math.PI / 180

/** Where the bulk of the continental crust sits at `ma`—used to keep the
 * camera pointed at land rather than at the Panthalassa ocean. */
export function landCentroidAt(ma: number): [number, number] {
  const sum = new Vector3()
  for (const plate of plates) {
    const pose = poseAt(plate, ma)
    const weight = pose.scale * (plate.id === 'eurasia' || plate.id === 'africa' ? 1.6 : plate.id === 'northAmerica' ? 1.3 : 1)
    sum.addScaledVector(lonLatToVector(pose.lon, pose.lat), weight)
  }
  if (sum.lengthSq() < 1e-6) return [0, 10]
  const [lon, lat] = vectorToLonLat(sum.normalize())
  return [lon, Math.max(-35, Math.min(35, lat))]
}

/** Project every landmass to its position `ma` million years ago and return
 * equirectangular pixel rings (x in [0,width), y in [0,height)) ready to be
 * filled on a canvas. Rings that wrap the antimeridian are returned three
 * times, offset by ±width, so the caller can fill them naïvely. */
export function landRingsAt(ma: number, width: number, height: number, jitter = 0): number[][] {
  const transforms = transformsAt(ma)
  const rings: number[][] = []
  const v = new Vector3()
  const scratch = new Vector3()

  for (const land of getLandmasses()) {
    const tf = transforms[land.plate]
    if (tf.scale < 0.02) continue
    for (const ring of land.rings) {
      const pts: number[] = []
      let prevLon = 0
      let offset = 0
      let meanLat = 0
      for (let i = 0; i < ring.length; i++) {
        const [lon0, lat0] = ring[i]
        lonLatToVector(lon0, lat0, v)
        v.applyQuaternion(tf.spin)
        scaleTowards(v, tf.centre, tf.scale, scratch)
        scratch.applyQuaternion(tf.move)
        if (jitter > 0) {
          scratch.x += (Math.sin(i * 12.9898 + ma) * 0.5) * jitter
          scratch.y += (Math.sin(i * 78.233 + ma * 0.7) * 0.5) * jitter
          scratch.normalize()
        }
        const [lon0t, lat] = vectorToLonLat(scratch)
        let lon = lon0t
        if (i > 0) {
          const d = lon - prevLon
          if (d > 180) offset -= 360
          else if (d < -180) offset += 360
        }
        prevLon = lon
        lon += offset
        meanLat += lat
        pts.push(((lon + 180) / 360) * width, ((90 - lat) / 180) * height)
      }
      meanLat /= ring.length
      const wraps = Math.abs(pts[pts.length - 2] - pts[0]) > width * 0.5
      if (wraps) {
        const poleY = meanLat < 0 ? height + 4 : -4
        pts.push(pts[pts.length - 2], poleY, pts[0], poleY)
      }
      rings.push(pts)
      const shifted = (dx: number) => pts.map((p, i) => (i % 2 === 0 ? p + dx : p))
      rings.push(shifted(-width), shifted(width))
    }
  }
  return rings
}
