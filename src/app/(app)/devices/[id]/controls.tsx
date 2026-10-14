import { Icon, type IconName } from '@/components/icon';
import { useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { useNotice } from '@/components/notice';
import { PowerCard, ScheduleCard } from '@/components/power-schedule';
import { Badge, Card, ErrorState, Header, Loading, Screen, text, type Tone } from '@/components/ui';
import { fmt, useI18n } from '@/i18n';
import type { Dict } from '@/i18n/en';
import { HARDWARE_CONTROL } from '@/lib/features';
import { deviceName } from '@/lib/format';
import { useCommands, useDevice, useSendCommand } from '@/lib/queries';
import { colors, fonts, radius, space, switchThumb } from '@/lib/theme';
import type { Command, CommandStatus } from '@/lib/types';

const statusTone: Record<CommandStatus, Tone> = {
  PENDING: 'info',
  SENT: 'info',
  CONFIRMED: 'success',
  FAILED: 'danger',
  REJECTED: 'danger',
  TIMED_OUT: 'warning',
};

function describe(c: Command, t: Dict) {
  const on = Boolean(c.params.on);
  switch (c.type) {
    case 'SET_POWER':
      return on ? t.controls.cmd.powerOn : t.controls.cmd.powerOff;
    case 'SYNC_SCHEDULE':
      return t.controls.cmd.sync;
    case 'SET_FAN':
      return on ? t.controls.cmd.fanOn : t.controls.cmd.fanOff;
    case 'SET_UV':
      return on ? t.controls.cmd.uvOn : t.controls.cmd.uvOff;
    case 'SET_CO2':
      return on ? t.controls.cmd.co2On : t.controls.cmd.co2Off;
    case 'SET_MODE':
      return c.params.mode === 'MANUAL' ? t.controls.cmd.modeManual : t.controls.cmd.modeAuto;
    case 'CAPTURE_IMAGE':
      return t.controls.cmd.capture;
    default:
      return c.type;
  }
}

/**
 * Manual control. Switches show only what the device has CONFIRMED; a pending
 * command shows a spinner until the device acknowledges or the command times out.
 */
export default function DeviceControlsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, f } = useI18n();
  const qc = useQueryClient();
  const device = useDevice(id);
  const commands = useCommands(id);
  const send = useSendCommand(id);
  const { underDevelopment } = useNotice();

  const open = commands.data?.filter((c) => c.status === 'PENDING' || c.status === 'SENT') ?? [];
  const latestSettled = commands.data?.find((c) => !open.includes(c));
  const settledKey = latestSettled ? `${latestSettled.id}:${latestSettled.status}` : null;
  // When a command settles, the device's confirmed state has changed: refetch it.
  useEffect(() => {
    if (settledKey) void qc.invalidateQueries({ queryKey: ['devices', id], exact: true });
  }, [settledKey, qc, id]);

  const header = <Header title={t.controls.title} back />;
  if (device.isLoading)
    return (
      <Screen header={header}>
        <Loading />
      </Screen>
    );
  if (device.error || !device.data)
    return (
      <Screen header={header}>
        <ErrorState error={device.error} onRetry={device.refetch} />
      </Screen>
    );

  const d = device.data;
  const offline = d.status === 'OFFLINE';
  const manual = d.confirmedState.mode === 'MANUAL';
  const pending = (type: string) => open.some((c) => c.type === type);

  const toggle = (type: string, label: string, value: boolean | null, icon: IconName, last = false) => (
    <View style={[styles.toggle, !last && styles.divider]} key={type}>
      <View style={styles.toggleIcon}>
        <Icon name={icon} size={20} color={colors.textMuted} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[text.body, { fontFamily: fonts.semibold, fontWeight: '600' }]}>{label}</Text>
        <Text style={text.faint}>{value === null ? t.controls.stateUnknown : value ? t.controls.onConfirmed : t.controls.offConfirmed}</Text>
      </View>
      {pending(type) ? (
        <ActivityIndicator color={colors.brand} />
      ) : (
        <Switch
          value={value ?? false}
          // Without remote control every tap opens the "under development" popup
          disabled={HARDWARE_CONTROL && (offline || !manual || value === null || send.isPending)}
          onValueChange={(on) => send.mutate({ type, params: { on } })}
          trackColor={{ true: colors.brand, false: colors.border }}
          {...switchThumb}
          accessibilityLabel={label}
        />
      )}
    </View>
  );

  return (
    <Screen header={header}>
      <Card style={{ gap: space(1) }}>
        <Text style={text.h2}>{deviceName(d)}</Text>
        <Text style={text.faint}>{d.confirmedState.updatedAt ? fmt(t.controls.stateConfirmed, { date: f.dateTime(d.confirmedState.updatedAt) }) : t.controls.noState}</Text>
        {offline && (
          <View style={styles.notice}>
            <Icon name="wifi-off" size={16} color={colors.danger} />
            <Text style={[text.muted, { flex: 1 }]}>{t.controls.offline}</Text>
          </View>
        )}
      </Card>

      {!HARDWARE_CONTROL && (
        <Pressable onPress={underDevelopment} style={styles.devNotice} accessibilityRole="button">
          <Icon name="tool" size={18} color={colors.warning} />
          <Text style={[text.muted, { flex: 1 }]}>{t.common.underDevText}</Text>
        </Pressable>
      )}

      <PowerCard
        power={d.confirmedState.power}
        pending={pending('SET_POWER')}
        disabled={HARDWARE_CONTROL && (offline || send.isPending)}
        onToggle={(on) => send.mutate({ type: 'SET_POWER', params: { on } })}
      />

      <Card>
        <Text style={[text.muted, { marginBottom: space(2) }]}>{t.controls.mode}</Text>
        <View style={styles.segment}>
          {(['AUTOMATIC', 'MANUAL'] as const).map((mode) => {
            const active = d.confirmedState.mode === mode;
            return (
              <Pressable
                key={mode}
                disabled={HARDWARE_CONTROL && (offline || active || pending('SET_MODE'))}
                onPress={() => (HARDWARE_CONTROL ? send.mutate({ type: 'SET_MODE', params: { mode } }) : underDevelopment())}
                style={[styles.segmentItem, active && styles.segmentActive]}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
              >
                <Text style={[styles.segmentText, active && { color: '#fff' }]}>{mode === 'AUTOMATIC' ? t.controls.automatic : t.controls.manual}</Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={[text.faint, { marginTop: space(2) }]}>
          {pending('SET_MODE') ? t.controls.waitingMode : manual ? t.controls.manualHint : t.controls.autoHint}
        </Text>
      </Card>

      <ScheduleCard
        deviceId={id}
        automatic={d.confirmedState.mode === 'AUTOMATIC'}
        lastSync={commands.data?.find((c) => c.type === 'SYNC_SCHEDULE')}
      />

      <Card style={{ paddingVertical: space(1) }}>
        {toggle('SET_FAN', t.controls.fan, d.confirmedState.fan, 'wind')}
        {toggle('SET_UV', t.controls.uv, d.confirmedState.uv, 'sun')}
        {toggle('SET_CO2', t.controls.co2, d.confirmedState.co2, 'cloud', true)}
      </Card>

      {send.error && <Text style={{ color: colors.danger }}>{send.error.message}</Text>}

      <Text style={text.h2}>{t.controls.recent}</Text>
      <Card style={{ paddingVertical: space(1) }}>
        {commands.data?.length ? (
          commands.data.slice(0, 8).map((c, i, all) => (
            <View key={c.id} style={[styles.command, i < all.length - 1 && styles.divider]}>
              <View style={{ flex: 1 }}>
                <Text style={text.body}>{describe(c, t)}</Text>
                <Text style={text.faint}>
                  {f.dateTime(c.issuedAt)}
                  {c.error ? ` · ${c.error}` : ''}
                </Text>
              </View>
              <Badge label={t.controls.status[c.status]} tone={statusTone[c.status]} />
            </View>
          ))
        ) : (
          <Text style={[text.muted, { paddingVertical: space(3) }]}>{t.controls.none}</Text>
        )}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  notice: {
    flexDirection: 'row',
    gap: space(2),
    alignItems: 'center',
    backgroundColor: colors.dangerSoft,
    padding: space(3),
    borderRadius: radius.md,
    marginTop: space(2),
  },
  devNotice: { flexDirection: 'row', gap: space(2), alignItems: 'center', backgroundColor: colors.warningSoft, padding: space(3), borderRadius: radius.md },
  segment: { flexDirection: 'row', backgroundColor: colors.neutralSoft, borderRadius: radius.pill, padding: 4 },
  segmentItem: { flex: 1, paddingVertical: space(2), alignItems: 'center', borderRadius: radius.pill },
  segmentActive: { backgroundColor: colors.brand },
  segmentText: { fontFamily: fonts.medium, fontWeight: '500', fontSize: 13, color: colors.textMuted },
  toggle: { flexDirection: 'row', alignItems: 'center', gap: space(3), paddingVertical: space(3) },
  toggleIcon: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  command: { flexDirection: 'row', alignItems: 'center', gap: space(3), paddingVertical: space(3) },
  divider: { borderBottomWidth: 1, borderBottomColor: colors.divider },
});
