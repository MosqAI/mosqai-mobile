import { StyleSheet, Text, View } from 'react-native';
import { fmt, useI18n } from '@/i18n';
import { CO2_LOW_PCT } from '@/lib/distribution';
import { colors, fonts } from '@/lib/theme';

/** How much CO2 lure is left in the trap. Unknown (not reporting) is shown as such, never as 0. */
export function Co2Gauge({ pct, compact = false }: { pct: number | null; compact?: boolean }) {
  const { t } = useI18n();
  const color = pct === null ? colors.textFaint : pct < CO2_LOW_PCT ? colors.danger : pct < 50 ? colors.warning : colors.brand;
  return (
    <View style={styles.root} accessibilityLabel={pct === null ? t.co2.unknown : fmt(t.co2.level, { pct })}>
      <View style={styles.head}>
        <Text style={styles.label}>{t.co2.label}</Text>
        <Text style={[styles.value, { color }]}>
          {pct === null ? t.co2.unknownShort : `${pct}%`}
          {!compact && pct !== null && pct < CO2_LOW_PCT ? ` · ${t.co2.low}` : ''}
        </Text>
      </View>
      <View style={styles.track}>
        {pct !== null && <View style={[styles.fill, { width: `${Math.max(pct, 2)}%`, backgroundColor: color }]} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: 6 },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  label: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted },
  value: { fontFamily: fonts.medium, fontWeight: '500', fontSize: 12 },
  track: { height: 5, borderRadius: 3, backgroundColor: colors.neutralSoft, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 3 },
});
