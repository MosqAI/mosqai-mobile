import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Co2Gauge } from '@/components/co2-gauge';
import { DeviceStatusBadge } from '@/components/device-status';
import { Logo } from '@/components/logo';
import { Button, Card, DetailRow, ErrorState, Header, Loading, Screen, text } from '@/components/ui';
import { useI18n } from '@/i18n';
import { deviceName, devicePlace } from '@/lib/format';
import { useDevice, useDeviceSyncs } from '@/lib/queries';
import { colors, fonts, space } from '@/lib/theme';

function Battery({ pct }: { pct: number | null }) {
  const { t } = useI18n();
  if (pct === null) return <Text style={text.faint}>{t.devices.batteryUnknown}</Text>;
  const color = pct < 25 ? colors.danger : colors.brand;
  return (
    <View style={styles.battery}>
      <View style={styles.batteryTrack}>
        <View style={{ width: `${pct}%`, height: '100%', backgroundColor: color, borderRadius: 4 }} />
      </View>
      <Text style={[styles.batteryText, { color }]}>{pct}%</Text>
    </View>
  );
}

export default function DeviceDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, f } = useI18n();
  const device = useDevice(id);
  const syncs = useDeviceSyncs(id);
  const total = syncs.data?.reduce((a, s) => a + s.captures, 0);

  return (
    <Screen
      header={<Header title={t.devices.details} back />}
      footer={
        device.data && (
          <>
            <Button title={t.devices.viewCaptures} icon="camera" onPress={() => router.push(`/devices/${id}/captures`)} />
            <Button title={t.devices.settings} icon="sliders" variant="secondary" onPress={() => router.push(`/devices/${id}/controls`)} />
          </>
        )
      }
    >
      {device.isLoading ? (
        <Loading />
      ) : device.error || !device.data ? (
        <ErrorState error={device.error} onRetry={device.refetch} />
      ) : (
        <>
          <Card style={styles.hero}>
            <View style={styles.heroIcon}>
              <Logo size={44} />
            </View>
            <Text style={text.h2}>{deviceName(device.data)}</Text>
            <Text style={text.faint}>{devicePlace(device.data)}</Text>
            <DeviceStatusBadge status={device.data.status} />
          </Card>
          <Card style={{ paddingVertical: 0 }}>
            <DetailRow label={t.devices.id} value={device.data.id} />
            <DetailRow label={t.devices.lastSeen} value={device.data.lastSeenAt ? f.dateTime(device.data.lastSeenAt) : t.devices.never} />
            <DetailRow label={t.devices.capturesRecent} value={<Text style={styles.big}>{total ?? '…'}</Text>} />
            <DetailRow label={t.devices.battery} value={<Battery pct={device.data.batteryPct} />} last />
          </Card>
          <Card>
            <Co2Gauge pct={device.data.co2LevelPct} />
          </Card>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: space(2), paddingVertical: space(6) },
  heroIcon: { marginBottom: space(1) },
  big: { fontSize: 16, fontFamily: fonts.display, fontWeight: '600', color: colors.text },
  battery: { flexDirection: 'row', alignItems: 'center', gap: space(2) },
  batteryTrack: { width: 56, height: 6, borderRadius: 4, backgroundColor: 'rgba(148,163,184,0.3)', overflow: 'hidden' },
  batteryText: { fontSize: 14, fontFamily: fonts.semibold, fontWeight: '600' },
});
