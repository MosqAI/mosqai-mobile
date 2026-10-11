// MosqAI Shield distribution points, where owners buy traps and CO2 refills.
// PLACEHOLDER LIST: these locations are illustrative until the real network of
// points is confirmed; replace them (or serve them from the backend) before release.

export interface DistributionPoint {
  id: string;
  name: string;
  district: string;
  address: string;
  lat: number;
  lng: number;
  /** Local opening hours, e.g. "Mon–Sat 08:00–18:00". */
  hours: string;
}

export const DISTRIBUTION_POINTS: DistributionPoint[] = [
  { id: 'kgl-nyarugenge', name: 'MosqAI Shield Kigali Centre', district: 'Nyarugenge', address: 'KN 4 Ave, Kigali', lat: -1.9466, lng: 30.0594, hours: 'Mon–Sat 08:00–18:00' },
  { id: 'kgl-kicukiro', name: 'MosqAI Shield Kicukiro', district: 'Kicukiro', address: 'KK 15 Rd, Kicukiro', lat: -1.9706, lng: 30.1044, hours: 'Mon–Sat 08:00–18:00' },
  { id: 'musanze', name: 'MosqAI Shield Musanze', district: 'Musanze', address: 'Musanze town centre', lat: -1.4997, lng: 29.6346, hours: 'Mon–Fri 08:00–17:00' },
  { id: 'huye', name: 'MosqAI Shield Huye', district: 'Huye', address: 'Huye town centre', lat: -2.5967, lng: 29.7394, hours: 'Mon–Fri 08:00–17:00' },
  { id: 'rubavu', name: 'MosqAI Shield Rubavu', district: 'Rubavu', address: 'Gisenyi, Rubavu', lat: -1.7022, lng: 29.2564, hours: 'Mon–Sat 08:00–17:00' },
  { id: 'bugesera', name: 'MosqAI Shield Bugesera', district: 'Bugesera', address: 'Nyamata, Bugesera', lat: -2.1489, lng: 30.0925, hours: 'Mon–Fri 08:00–17:00' },
  { id: 'gicumbi', name: 'MosqAI Shield Gicumbi', district: 'Gicumbi', address: 'Byumba, Gicumbi', lat: -1.5766, lng: 30.0675, hours: 'Mon–Fri 08:00–17:00' },
];

/** Great-circle distance in km. */
export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

/** Points ordered nearest first from `from` (the owner's trap); unsorted when unknown. */
export function nearestPoints(from: { lat: number; lng: number } | null) {
  if (!from) return DISTRIBUTION_POINTS.map((p) => ({ point: p, km: null as number | null }));
  return DISTRIBUTION_POINTS.map((p) => ({ point: p, km: distanceKm(from, p) as number | null })).sort((a, b) => a.km! - b.km!);
}

/** Below this the trap attracts noticeably fewer mosquitoes: time to refill. */
export const CO2_LOW_PCT = 25;
