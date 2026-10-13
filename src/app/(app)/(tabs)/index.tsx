import { router } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { Co2Gauge } from '@/components/co2-gauge';
import { Icon, type IconName } from '@/components/icon';
import { Recommendations } from '@/components/recommendations';
import { Card, ErrorState, GlassIconButton, Header, Loading, Screen, text } from '@/components/ui';
import { fmt, useI18n } from '@/i18n';
import { useAuth } from '@/lib/auth';
import { deviceName, devicePlace } from '@/lib/format';
import { nextRule } from '@/lib/schedule';
import { HARDWARE_CONTROL } from '@/lib/features';
import { useCommands, useDevices, useOverview, useSchedules, useSendCommand, useSetPowerAll } from '@/lib/queries';
import { colors, fonts, radius, space, switchThumb } from '@/lib/theme';
import type { Device } from '@/lib/types';

function QuickAction({ icon, label, onPress, busy = false, disabled = false }: { icon: IconName; label: string; onPress: () => void; busy?: boolean; disabled?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || busy}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.action, pressed && { backgroundColor: colors.glassStrong }, disabled && { opacity: 0.5 }]}
    >
      <View style={styles.actionIcon}>{busy ? <ActivityIndicator size="small" color={colors.brand} /> : <Icon name={icon} size={22} color={colors.deep} />}</View>
      <Text style={styles.actionText} numberOfLines={2}>
        {label}
      </Text>
    </Pressable>
  );
}

/** One trap: name, power switch (shows only what the trap confirmed), next schedule step, CO2 left. */
function TrapRow({ device, last }: { device: Device; last: boolean }) {
  const { t } = useI18n();
  const h = t.home;
  const commands = useCommands(device.id);
  const schedules = useSchedules(device.id);
  const send = useSendCommand(device.id);
  const offline = device.status === 'OFFLINE';
  const power = device.confirmedState.power;
  const pending = commands.data?.some((c) => c.type === 'SET_POWER' && (c.status === 'PENDING' || c.status === 'SENT')) ?? false;
  const next = schedules.data ? nextRule(schedules.data) : null;
  const state = offline ? h.offline : power === null ? h.unknown : power ? h.on : h.off;
  const nextText = next
    ? `${fmt(next.rule.action === 'ON' ? h.nextOn : h.nextOff, { time: next.rule.time })}${next.today ? '' : ` ${h.tomorrow}`}`
    : h.noSchedule;

  return (
    <Pressable onPress={() => router.push(`/devices/${device.id}`)} accessibilityRole="button" style={[styles.trap, !last && styles.divider]}>
      <View style={styles.trapHead}>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={styles.trapName}>{deviceName(device)}</Text>
          <Text style={text.faint}>
            {devicePlace(device)} · <Text style={{ color: offline ? colors.danger : power ? colors.success : colors.textMuted }}>{state}</Text>
          </Text>
        </View>
        {pending ? (
          <ActivityIndicator color={colors.brand} />
        ) : (
          <Switch
            value={power === true}
            disabled={HARDWARE_CONTROL && (offline || power === null || send.isPending)}
            onValueChange={(on) => send.mutate({ type: 'SET_POWER', params: { on } })}
            trackColor={{ true: colors.brand, false: colors.border }}
            {...switchThumb}
            accessibilityLabel={`${deviceName(device)} ${state}`}
          />
        )}
      </View>
      <Co2Gauge pct={device.co2LevelPct} compact />
      <View style={styles.trapFoot}>
        <Icon name="clock" size={14} color={colors.textFaint} />
        <Text style={text.faint}>{nextText}</Text>
      </View>
    </Pressable>
  );
}

export default function HomeScreen() {
  const { user } = useAuth();
  const { t, f } = useI18n();
  const h = t.home;
  const devices = useDevices();
  const overview = useOverview(7);
  const powerAll = useSetPowerAll();
  const hour = f.hour();
  const greeting = hour < 12 ? t.dashboard.morning : hour < 18 ? t.dashboard.afternoon : t.dashboard.evening;

  const list = devices.data ?? [];
  const reachable = list.filter((d) => d.status !== 'OFFLINE');
  const allOn = reachable.length > 0 && reachable.every((d) => d.confirmedState.power === true);
  const first = list[0];

  return (
    <Screen
      tab
      onRefresh={() => {
        void devices.refetch();
        void overview.refetch();
      }}
      refreshing={devices.isRefetching}
      header={<Header right={<GlassIconButton icon="bell" label={t.dashboard.notifications} onPress={() => router.push('/settings')} dot />} />}
    >
      <View>
        <Text style={text.h1}>{fmt(greeting, { name: user?.name.split(' ')[0] ?? '' })}</Text>
        {overview.data && (
          <Pressable onPress={() => router.push('/reports')} accessibilityRole="link">
            <Text style={[text.muted, { marginTop: 4 }]}>
              {fmt(h.week, { count: overview.data.totalCaptured.value })} · <Text style={{ color: colors.brand }}>{h.seeReports}</Text>
            </Text>
          </Pressable>
        )}
      </View>

      <View style={{ gap: space(3) }}>
        <Text style={text.h2}>{h.quick}</Text>
        <View style={styles.actions}>
          <QuickAction
            icon="power"
            label={powerAll.isPending ? (allOn ? h.turningOff : h.turningOn) : allOn ? h.allOff : h.allOn}
            busy={powerAll.isPending}
            disabled={HARDWARE_CONTROL && reachable.length === 0}
            onPress={() => powerAll.mutate({ devices: list, on: !allOn })}
          />
          <QuickAction
            icon="clock"
            label={h.schedule}
            disabled={!first}
            onPress={() => (list.length === 1 ? router.push(`/devices/${first.id}/controls`) : router.push('/devices'))}
          />
          <QuickAction icon="plus" label={h.addTrap} onPress={() => router.push('/devices/add')} />
          <QuickAction icon="map-pin" label={h.refill} onPress={() => router.push('/distribution')} />
        </View>
      </View>

      {devices.isLoading ? (
        <Loading />
      ) : devices.error ? (
        <ErrorState error={devices.error} onRetry={devices.refetch} />
      ) : (
        <>
          {list.length > 0 && (
            <View style={{ gap: space(3) }}>
              <Text style={text.h2}>{h.myTraps}</Text>
              <Card style={{ paddingVertical: space(1) }}>
                {list.map((d, i) => (
                  <TrapRow key={d.id} device={d} last={i === list.length - 1} />
                ))}
              </Card>
            </View>
          )}
          <Recommendations />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', gap: space(2) },
  action: {
    flex: 1,
    alignItems: 'center',
    gap: space(2),
    paddingVertical: space(3),
    paddingHorizontal: space(1),
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  actionIcon: { height: 26, alignItems: 'center', justifyContent: 'center' },
  actionText: { fontFamily: fonts.medium, fontWeight: '500', fontSize: 11.5, color: colors.text, textAlign: 'center' },
  trap: { paddingVertical: space(3.5), gap: space(3) },
  trapHead: { flexDirection: 'row', alignItems: 'center', gap: space(3) },
  trapName: { fontFamily: fonts.medium, fontWeight: '500', fontSize: 14, color: colors.text },
  trapFoot: { flexDirection: 'row', alignItems: 'center', gap: space(1.5) },
  divider: { borderBottomWidth: 1, borderBottomColor: colors.divider },
});
