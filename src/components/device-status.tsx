import { useI18n } from '@/i18n';
import type { DeviceStatus } from '@/lib/types';
import { Badge } from './ui';

const tone = { ONLINE: 'success', WARNING: 'warning', OFFLINE: 'danger' } as const;

export function DeviceStatusBadge({ status }: { status: DeviceStatus }) {
  const { t } = useI18n();
  return <Badge label={t.devices.status[status]} tone={tone[status]} dot />;
}
