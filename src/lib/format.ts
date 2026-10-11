import type { Device } from './types';

/** "↑ 18%" / "↓ 4%", or null when there is no earlier period to compare with. */
export function formatChange(change: number | null) {
  if (change === null) return null;
  const pct = Math.round(Math.abs(change) * 100);
  return `${change < 0 ? '↓' : '↑'} ${pct}%`;
}

export const deviceName = (d: Pick<Device, 'id' | 'nickname'>) => d.nickname ?? d.id;
export const devicePlace = (d: Pick<Device, 'placement' | 'area'>) => d.placement ?? d.area;
