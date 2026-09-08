import { Vector3, Quaternion } from 'three'

export const DEG = Math.PI / 180

/** Convert lon/lat (degrees) to a unit vector using three.js SphereGeometry's
 * convention (lon 0 → +X, lon -90 → +Z, north → +Y) so equirectangular
 * canvases line up with the default sphere UVs. */
export function lonLatToVector(lon: number, lat: number, target = new Vector3()) {
  const phi = (lon + 180) * DEG
  const cosLat = Math.cos(lat * DEG)
  return target.set(-Math.cos(phi) * cosLat, Math.sin(lat * DEG), Math.sin(phi) * cosLat)
}

export function vectorToLonLat(v: Vector3): [number, number] {
  const lat = Math.asin(Math.max(-1, Math.min(1, v.y))) / DEG
  let lon = Math.atan2(v.z, -v.x) / DEG - 180
  if (lon < -180) lon += 360
  if (lon > 180) lon -= 360
  return [lon, lat]
}

/** Quaternion rotating unit vector `from` onto unit vector `to` along the great circle. */
export function rotationBetween(from: Vector3, to: Vector3, target = new Quaternion()) {
  return target.setFromUnitVectors(from, to)
}

/** Shrink a point toward a centre along the great circle: scale 1 keeps it, 0 collapses to centre. */
export function scaleTowards(point: Vector3, centre: Vector3, scale: number, target = new Vector3()) {
  if (scale >= 0.999) return target.copy(point)
  const angle = centre.angleTo(point)
  if (angle < 1e-6) return target.copy(point)
  const axis = new Vector3().crossVectors(centre, point).normalize()
  return target.copy(centre).applyAxisAngle(axis, angle * scale)
}

/** Points along a great-circle arc, lifted above the surface with a sine bulge. */
export function greatCircleArc(a: Vector3, b: Vector3, segments = 48, lift = 0.08) {
  const points: Vector3[] = []
  const angle = a.angleTo(b)
  const axis = new Vector3().crossVectors(a, b)
  if (axis.lengthSq() < 1e-9) axis.set(0, 1, 0)
  axis.normalize()
  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    const p = a.clone().applyAxisAngle(axis, angle * t)
    p.multiplyScalar(1 + Math.sin(Math.PI * t) * lift * Math.min(1, angle / 0.6))
    points.push(p)
  }
  return points
}
