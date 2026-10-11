import { Icon } from '@/components/icon';
import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { fmt, useI18n } from '@/i18n';
import { CO2_LOW_PCT } from '@/lib/distribution';
import { deviceName } from '@/lib/format';
import { useCommands, useDevices, useScheduleMutations, useSchedules, useSendCommand } from '@/lib/queries';
import { colors, fonts, space } from '@/lib/theme';
import type { Device } from '@/lib/types';
import { Button, Card, text, type IconName } from './ui';

type Tone = 'danger' | 'warning' | 'brand' | 'success';

const toneColor: Record<Tone, { fg: string; bg: string }> = {
  danger: { fg: colors.danger, bg: colors.dangerSoft },
  warning: { fg: colors.warning, bg: colors.warningSoft },
  brand: { fg: colors.brand, bg: colors.brandSoft },
  success: { fg: colors.success, bg: colors.successSoft },
};

function Item({
  icon,
  tone,
  title,
  body,
  action,
  last,
}: {
  icon: IconName;
  tone: Tone;
  title: string;
  body: string;
  action?: React.ReactNode;
  last?: boolean;
}) {
  const c = toneColor[tone];
  return (
    <View style={[styles.item, !last && styles.divider]}>
      <View style={styles.icon}>
        <Icon name={icon} size={20} color={c.fg} />
      </View>
      <View style={{ flex: 1, gap: space(1) }}>
        <Text style={[text.body, { fontFamily: fonts.semibold, fontWeight: '600' }]}>{title}</Text>
        <Text style={text.muted}>{body}</Text>
        {action && <View style={{ marginTop: space(2), alignSelf: 'flex-start' }}>{action}</View>}
      </View>
    </View>
  );
}

/**
 * The single most useful thing to do for one trap, if anything: bring it back
 * online, switch it on, give it a schedule, or put it back in automatic mode.
 * Buttons act directly; nothing is shown as done until the trap confirms it.
 */
function DeviceAdvice({ device, last }: { device: Device; last: boolean }) {
  const { t } = useI18n();
  const a = t.advice;
  const qc = useQueryClient();
  const schedules = useSchedules(device.id);
  const commands = useCommands(device.id);
  const send = useSendCommand(device.id);
  const sched = useScheduleMutations(device.id);
  const name = deviceName(device);

  const powerCmd = commands.data?.find((c) => c.type === 'SET_POWER');
  const powerPending = powerCmd?.status === 'PENDING' || powerCmd?.status === 'SENT';
  const settled = powerCmd && !powerPending ? `${powerCmd.id}:${powerCmd.status}` : null;
  // Once the trap confirms (or refuses), refresh the device so the advice moves on.
  useEffect(() => {
    if (settled) void qc.invalidateQueries({ queryKey: ['devices'] });
  }, [settled, qc]);

  const hasSchedule = schedules.data?.some((r) => r.enabled) ?? true;
  const { power, mode } = device.confirmedState;

  if (device.status === 'OFFLINE')
    return (
      <Item
        icon="wifi-off"
        tone="danger"
        title={fmt(a.offlineTitle, { name })}
        body={a.offlineBody}
        last={last}
        action={<Button size="sm" title={a.openDevice} variant="secondary" onPress={() => router.push(`/devices/${device.id}`)} />}
      />
    );

  if (power === false || powerPending)
    return (
      <Item
        icon="power"
        tone="warning"
        title={fmt(a.offTitle, { name })}
        body={powerPending ? a.waiting : powerCmd?.status === 'FAILED' || powerCmd?.status === 'TIMED_OUT' ? a.didNotRespond : a.offBody}
        last={last}
        action={<Button size="sm" title={a.turnOn} icon="power" loading={powerPending || send.isPending} onPress={() => send.mutate({ type: 'SET_POWER', params: { on: true } })} />}
      />
    );

  if (device.co2LevelPct !== null && device.co2LevelPct < CO2_LOW_PCT)
    return (
      <Item
        icon="wind"
        tone="danger"
        title={fmt(a.co2Title, { name, pct: device.co2LevelPct })}
        body={a.co2Body}
        last={last}
        action={<Button size="sm" title={a.findPoint} icon="map-pin" variant="secondary" onPress={() => router.push('/distribution')} />}
      />
    );

  if (!hasSchedule)
    return (
      <Item
        icon="clock"
        tone="brand"
        title={fmt(a.scheduleTitle, { name })}
        body={a.scheduleBody}
        last={last}
        action={
          <Button
            size="sm"
            title={a.setSchedule}
            icon="moon"
            loading={sched.create.isPending}
            onPress={async () => {
              await sched.create.mutateAsync({ action: 'ON', time: '18:00', days: [], enabled: true });
              await sched.create.mutateAsync({ action: 'OFF', time: '06:00', days: [], enabled: true });
            }}
          />
        }
      />
    );

  if (mode === 'MANUAL')
    return (
      <Item
        icon="sliders"
        tone="brand"
        title={fmt(a.manualTitle, { name })}
        body={a.manualBody}
        last={last}
        action={<Button size="sm" title={a.openControls} variant="secondary" onPress={() => router.push(`/devices/${device.id}/controls`)} />}
      />
    );

  return null;
}

function needsAttention(d: Device) {
  return (
    d.status === 'OFFLINE' ||
    d.confirmedState.power === false ||
    d.confirmedState.mode === 'MANUAL' ||
    (d.co2LevelPct !== null && d.co2LevelPct < CO2_LOW_PCT)
  );
}

/** "What to do now" card on the home screen. */
export function Recommendations() {
  const { t } = useI18n();
  const a = t.advice;
  const devices = useDevices();
  if (!devices.data) return null;

  const list = devices.data;
  // Devices that look fine may still lack a schedule, so they are checked too,
  // but the ones that clearly need attention come first.
  const ordered = [...list].sort((x, y) => Number(needsAttention(y)) - Number(needsAttention(x)));

  return (
    <Card style={{ paddingVertical: space(2) }}>
      <Text style={[text.h2, { marginTop: space(2), marginBottom: space(1) }]}>{a.title}</Text>
      {list.length === 0 ? (
        <Item
          icon="plus"
          tone="brand"
          title={a.addTitle}
          body={a.addBody}
          last
          action={<Button size="sm" title={a.addButton} icon="plus" onPress={() => router.push('/devices/add')} />}
        />
      ) : (
        <>
          {ordered.map((d, i) => (
            <DeviceAdvice key={d.id} device={d} last={i === ordered.length - 1 && list.some(needsAttention)} />
          ))}
          {!list.some(needsAttention) && <AllGood />}
        </>
      )}
    </Card>
  );
}

function AllGood() {
  const { t } = useI18n();
  return <Item icon="check" tone="success" title={t.advice.goodTitle} body={t.advice.goodBody} last />;
}

const styles = StyleSheet.create({
  item: { flexDirection: 'row', gap: space(3), paddingVertical: space(3.5) },
  divider: { borderBottomWidth: 1, borderBottomColor: colors.divider },
  icon: { width: 24, paddingTop: 1, alignItems: 'center' },
});
