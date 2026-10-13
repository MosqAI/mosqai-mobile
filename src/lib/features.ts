// Feature switches. EXPO_PUBLIC_* values are inlined at build time.

/**
 * Remote control of the trap (power, fan, UV, CO₂, mode, schedules, capture now).
 * Phase A traps have no controller board, so this stays off and the app shows an
 * "under development" popup instead. Set EXPO_PUBLIC_HARDWARE_CONTROL=true for
 * the device simulator.
 */
export const HARDWARE_CONTROL = process.env.EXPO_PUBLIC_HARDWARE_CONTROL === 'true';
