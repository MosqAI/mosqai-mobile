// Response shapes from mosqai-backend (/v1).
export type Role = 'OWNER' | 'AUTHORITY_VIEWER' | 'AUTHORITY_ADMIN' | 'ADMIN';
export type Species = 'ANOPHELES' | 'CULEX' | 'AEDES' | 'OTHER';
export type SpeciesRisk = 'HIGH' | 'MEDIUM' | 'UNKNOWN';
export type DeviceStatus = 'ONLINE' | 'OFFLINE' | 'WARNING';
export type CommandStatus = 'PENDING' | 'SENT' | 'CONFIRMED' | 'FAILED' | 'REJECTED' | 'TIMED_OUT';

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  language: string;
  role: Role;
  createdAt: string;
}

export interface Session {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface Device {
  id: string;
  type: 'MOSQUITO_TRAP' | 'CAMERA_TRAP' | 'WEATHER_SENSOR';
  nickname?: string | null;
  placement?: string | null;
  area: string;
  status: DeviceStatus;
  /** null = unknown (device not reporting), never 0. */
  batteryPct: number | null;
  /** CO2 lure remaining, 0-100. null = unknown (not reporting), never 0. */
  co2LevelPct: number | null;
  lat: number;
  lng: number;
  lastSeenAt: string | null;
  firmware: string | null;
  /** Only what the device itself confirmed. */
  confirmedState: {
    mode: 'MANUAL' | 'AUTOMATIC' | null;
    /** Master power (fan + UV together). */
    power: boolean | null;
    fan: boolean | null;
    uv: boolean | null;
    co2: boolean | null;
    camera: string | null;
    updatedAt: string | null;
  };
}

export interface Change {
  value: number;
  change: number | null;
}

export interface Overview {
  days: number;
  totalCaptured: Change;
  analyzedImages: Change;
  highRiskSpecies: Change;
  activeDevices: { value: number; total: number };
  trend: { date: string; captures: number | null }[];
}

export interface SpeciesReport {
  days: number;
  total: number;
  species: { species: Species; count: number; risk: SpeciesRisk }[];
}

export interface CaptureSummary {
  id: string;
  capturedAt: string;
  species: Species | null;
  risk: SpeciesRisk | null;
  confidence: number | null;
}

export interface CaptureDetail {
  id: string;
  capturedAt: string;
  device: Device;
  imageUrl: string | null;
  analysis: {
    modelVersion: string;
    analysedAt: string;
    species: Species | null;
    risk: SpeciesRisk | null;
    confidence: number | null;
    detections: { species: Species; confidence: number; bbox: number[] }[];
  } | null;
}

export interface Command {
  id: string;
  type: string;
  params: Record<string, unknown>;
  status: CommandStatus;
  issuedAt: string;
  ackAt: string | null;
  error: string | null;
}

export interface DeviceSync {
  at: string;
  captures: number;
}

export interface ScheduleRule {
  id: string;
  action: 'ON' | 'OFF';
  /** Africa/Kigali local time, "HH:MM". */
  time: string;
  /** 0 = Sunday … 6 = Saturday; empty = every day. */
  days: number[];
  enabled: boolean;
}
