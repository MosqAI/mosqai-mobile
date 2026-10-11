import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './api';
import type { CaptureDetail, CaptureSummary, Command, Device, DeviceSync, Overview, ScheduleRule, SpeciesReport, User } from './types';

export const useOverview = (days = 7) => useQuery({ queryKey: ['overview', days], queryFn: () => api<Overview>(`/me/overview?days=${days}`) });

export const useReport = (days: number) => useQuery({ queryKey: ['report', days], queryFn: () => api<SpeciesReport>(`/me/report?days=${days}`) });

export const useDevices = () => useQuery({ queryKey: ['devices'], queryFn: () => api<Device[]>('/devices') });

export const useDevice = (id: string) => useQuery({ queryKey: ['devices', id], queryFn: () => api<Device>(`/devices/${id}`) });

export const useDeviceSyncs = (id: string) =>
  useQuery({ queryKey: ['devices', id, 'syncs'], queryFn: () => api<DeviceSync[]>(`/devices/${id}/syncs`) });

export const useCaptures = (deviceId: string) =>
  useQuery({ queryKey: ['devices', deviceId, 'captures'], queryFn: () => api<CaptureSummary[]>(`/devices/${deviceId}/captures`) });

export const useCapture = (id: string) => useQuery({ queryKey: ['captures', id], queryFn: () => api<CaptureDetail>(`/captures/${id}`) });

const OPEN: Command['status'][] = ['PENDING', 'SENT'];

/** Polls while any command is still waiting for the device to confirm. */
export const useCommands = (deviceId: string) =>
  useQuery({
    queryKey: ['devices', deviceId, 'commands'],
    queryFn: () => api<Command[]>(`/devices/${deviceId}/commands`),
    refetchInterval: (q) => (q.state.data?.some((c) => OPEN.includes(c.status)) ? 1000 : false),
  });

export function useSendCommand(deviceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { type: string; params: Record<string, unknown> }) =>
      api<Command>(`/devices/${deviceId}/commands`, { method: 'POST', json: input }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['devices', deviceId, 'commands'] }),
  });
}

export function useClaimDevice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { deviceId: string; pairingCode: string; nickname?: string; placement?: string }) =>
      api<Device>('/devices/claim', { method: 'POST', json: input }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['devices'] }),
  });
}

export function useUpdateProfile() {
  return useMutation({
    mutationFn: (input: { name?: string; phone?: string | null; language?: string }) => api<User>('/auth/me', { method: 'PATCH', json: input }),
  });
}

export const useSchedules = (deviceId: string) =>
  useQuery({ queryKey: ['devices', deviceId, 'schedules'], queryFn: () => api<ScheduleRule[]>(`/devices/${deviceId}/schedules`) });

type ScheduleInput = Omit<ScheduleRule, 'id'>;

/**
 * Create / update / delete a schedule rule. Each change makes the backend send
 * SYNC_SCHEDULE to the device, so the command list (sync status) refreshes too.
 */
export function useScheduleMutations(deviceId: string) {
  const qc = useQueryClient();
  const base = `/devices/${deviceId}/schedules`;
  const done = (res: { schedules: ScheduleRule[] }) => {
    qc.setQueryData(['devices', deviceId, 'schedules'], res.schedules);
    void qc.invalidateQueries({ queryKey: ['devices', deviceId, 'commands'] });
  };
  type Res = { schedules: ScheduleRule[] };
  return {
    create: useMutation({ mutationFn: (input: ScheduleInput) => api<Res>(base, { method: 'POST', json: input }), onSuccess: done }),
    update: useMutation({
      mutationFn: ({ id, ...patch }: Partial<ScheduleInput> & { id: string }) => api<Res>(`${base}/${id}`, { method: 'PATCH', json: patch }),
      onSuccess: done,
    }),
    remove: useMutation({ mutationFn: (id: string) => api<Res>(`${base}/${id}`, { method: 'DELETE' }), onSuccess: done }),
  };
}

/**
 * Quick action: switch every reachable trap on or off. Sends one SET_POWER per
 * device; each is confirmed (or not) by its device like any other command.
 */
export function useSetPowerAll() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ devices, on }: { devices: Device[]; on: boolean }) => {
      const targets = devices.filter((d) => d.status !== 'OFFLINE' && d.confirmedState.power !== on);
      await Promise.all(targets.map((d) => api<Command>(`/devices/${d.id}/commands`, { method: 'POST', json: { type: 'SET_POWER', params: { on } } })));
      return targets.map((d) => d.id);
    },
    onSuccess: (ids) => {
      for (const id of ids) void qc.invalidateQueries({ queryKey: ['devices', id, 'commands'] });
      // Devices confirm within a few seconds; refresh their confirmed state then.
      setTimeout(() => void qc.invalidateQueries({ queryKey: ['devices'] }), 3000);
    },
  });
}
