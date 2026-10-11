import { Linking, StyleSheet, Text, View } from 'react-native';
import { Icon } from '@/components/icon';
import { Button, Card, Header, Screen, text } from '@/components/ui';
import { fmt, useI18n } from '@/i18n';
import { nearestPoints } from '@/lib/distribution';
import { useDevices } from '@/lib/queries';
import { colors, fonts, space } from '@/lib/theme';

/** MosqAI Shield distribution points, nearest to the owner's first trap first. */
export default function DistributionScreen() {
  const { t } = useI18n();
  const devices = useDevices();
  const from = devices.data?.[0] ?? null;
  const points = nearestPoints(from && { lat: from.lat, lng: from.lng });

  return (
    <Screen header={<Header title={t.distribution.title} back />}>
      <Text style={text.muted}>{t.distribution.intro}</Text>
      <Card style={{ paddingVertical: 0 }}>
        {points.map(({ point, km }, i) => (
          <View key={point.id} style={[styles.row, i < points.length - 1 && styles.divider]}>
            <Icon name="map-pin" size={18} color={i === 0 && km !== null ? colors.brand : colors.textFaint} />
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={[text.body, styles.name]}>{point.name}</Text>
              <Text style={text.faint}>
                {point.address}
                {km !== null ? ` · ${fmt(t.distribution.away, { km: km < 10 ? km.toFixed(1) : Math.round(km) })}` : ''}
              </Text>
              <Text style={text.faint}>{point.hours}</Text>
            </View>
            <Button
              size="sm"
              variant="secondary"
              title={t.distribution.directions}
              onPress={() => void Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${point.lat},${point.lng}`)}
            />
          </View>
        ))}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space(3), paddingVertical: space(3.5) },
  divider: { borderBottomWidth: 1, borderBottomColor: colors.divider },
  name: { fontFamily: fonts.medium, fontWeight: '500' },
});
