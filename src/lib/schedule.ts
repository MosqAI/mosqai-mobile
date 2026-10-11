import type { ScheduleRule } from './types';

const KIGALI_OFFSET_MS = 2 * 3600_000; // UTC+2, no daylight saving

/**
 * The next enabled rule to fire after `now`, looking up to a week ahead in
 * Kigali time. `today` is false when it fires on a later day.
 */
export function nextRule(rules: ScheduleRule[], now = new Date()): { rule: ScheduleRule; today: boolean } | null {
  const local = new Date(now.getTime() + KIGALI_OFFSET_MS);
  const minutesNow = local.getUTCHours() * 60 + local.getUTCMinutes();
  const weekday = local.getUTCDay();
  let best: { rule: ScheduleRule; at: number } | null = null;
  for (const rule of rules) {
    if (!rule.enabled) continue;
    const [h, m] = rule.time.split(':').map(Number);
    const minutes = h * 60 + m;
    for (let d = 0; d < 8; d++) {
      const day = (weekday + d) % 7;
      if (rule.days.length && !rule.days.includes(day)) continue;
      if (d === 0 && minutes <= minutesNow) continue;
      const at = d * 1440 + minutes;
      if (!best || at < best.at) best = { rule, at };
      break;
    }
  }
  return best && { rule: best.rule, today: best.at < 1440 };
}
