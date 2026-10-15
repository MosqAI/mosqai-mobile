import { Icon } from '@/components/icon';
import { Link, router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { DeviceStatusBadge } from '@/components/device-status';
import { Card, EmptyState, ErrorState, Header, Loading, Screen, text } from '@/components/ui';
import { useI18n } from '@/i18n';
import { deviceName, devicePlace } from '@/lib/format';
import { useDevices } from '@/lib/queries';
import { colors, fonts, radius, space } from '@/lib/theme';

export default function DevicesScreen() {
  const { t } = useI18n();
  const { data, error, isLoading, refetch, isRefetching } = useDevices();

  return (
    <Screen tab onRefresh={refetch} refreshing={isRefetching} header={<Header />}>
      <View style={styles.titleRow}>
        <Text style={text.h1}>{t.devices.title}</Text>
        <Pressable
          onPress={() => router.push('/devices/add')}
          style={({ pressed }) => [styles.add, pressed && { backgroundColor: colors.brandPressed }]}
          accessibilityRole="button"
        >
          <Icon name="plus" size={16} color="#fff" />
          <Text style={styles.addText}>{t.devices.add}</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <Loading />
      ) : error || !data ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : data.length === 0 ? (
        <EmptyState icon="cpu" title={t.devices.emptyTitle} text={t.devices.emptyText} />
      ) : (
        data.map((d) => (
          <Link key={d.id} href={`/devices/${d.id}`} asChild>
            <Pressable accessibilityRole="button" accessibilityLabel={`${deviceName(d)}, ${t.devices.status[d.status]}`}>
              <Card style={styles.device}>
                <View style={styles.deviceIcon}>
                  <Icon name="shield" size={20} color={colors.textMuted} />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={styles.deviceName}>{deviceName(d)}</Text>
                  <Text style={text.faint}>{devicePlace(d)}</Text>
                </View>
                <DeviceStatusBadge status={d.status} />
                <Icon name="chevron-right" size={18} color={colors.textFaint} />
              </Card>
            </Pressable>
          </Link>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  add: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space(1.5),
    backgroundColor: colors.brand,
    paddingHorizontal: space(4),
    paddingVertical: space(2.5),
    borderRadius: radius.md,
  },
  addText: { color: '#fff', fontFamily: fonts.semibold, fontWeight: '600', fontSize: 13 },
  device: { flexDirection: 'row', alignItems: 'center', gap: space(3) },
  deviceIcon: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  deviceName: { fontSize: 16, fontFamily: fonts.semibold, fontWeight: '600', color: colors.text },
});
