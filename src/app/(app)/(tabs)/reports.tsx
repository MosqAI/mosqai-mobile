import { Icon } from '@/components/icon';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Badge, Card, EmptyState, ErrorState, Header, Loading, Pills, Screen, text } from '@/components/ui';
import { fmt, useI18n } from '@/i18n';
import { useReport } from '@/lib/queries';
import { colors, fonts, radius, space } from '@/lib/theme';
import type { SpeciesRisk } from '@/lib/types';

const riskTone = { HIGH: 'danger', MEDIUM: 'warning', UNKNOWN: 'neutral' } as const;
const barColor: Record<SpeciesRisk, string> = { HIGH: colors.danger, MEDIUM: colors.violet, UNKNOWN: colors.textFaint };

export default function ReportsScreen() {
  const { t } = useI18n();
  const [days, setDays] = useState(7);
  const { data, error, isLoading, refetch, isRefetching } = useReport(days);

  return (
    <Screen tab onRefresh={refetch} refreshing={isRefetching} header={<Header />}>
      <Text style={text.h1}>{t.reports.title}</Text>
      <Pills options={[7, 30, 90].map((d) => ({ value: d, label: fmt(t.reports.days, { days: d }) }))} value={days} onChange={setDays} />

      {isLoading ? (
        <Loading />
      ) : error || !data ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : (
        <>
          <Card style={styles.total}>
            <View style={styles.totalIcon}>
              <Icon name="target" size={22} color={colors.textMuted} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={text.muted}>{t.reports.totalCaptured}</Text>
              <Text style={styles.totalValue}>{data.total}</Text>
              <Text style={text.faint}>{fmt(t.reports.totalSub, { days: data.days })}</Text>
            </View>
          </Card>

          <Text style={text.h2}>{t.reports.breakdown}</Text>
          {data.total === 0 ? (
            <EmptyState icon="inbox" title={t.reports.emptyTitle} text={t.reports.emptyText} />
          ) : (
            data.species.map((s) => {
              const share = s.count / data.total;
              return (
                <Card key={s.species} style={styles.speciesCard}>
                  <View style={styles.speciesHead}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.speciesName}>{t.species.name[s.species]}</Text>
                      <Text style={text.faint}>{t.species.note[s.species]}</Text>
                    </View>
                    <Badge label={t.species.risk[s.risk]} tone={riskTone[s.risk]} />
                  </View>
                  <View style={styles.barRow}>
                    <View style={styles.barTrack}>
                      <View style={[styles.bar, { width: `${share * 100}%`, backgroundColor: barColor[s.risk] }]} />
                    </View>
                    <Text style={styles.count}>
                      {s.count} <Text style={text.faint}>({Math.round(share * 100)}%)</Text>
                    </Text>
                  </View>
                </Card>
              );
            })
          )}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  total: { flexDirection: 'row', alignItems: 'center', gap: space(4) },
  totalIcon: { width: 32, height: 44, alignItems: 'center', justifyContent: 'center' },
  totalValue: { fontSize: 24, fontFamily: fonts.display, fontWeight: '600', color: colors.text, letterSpacing: -0.5 },
  speciesCard: { gap: space(3) },
  speciesHead: { flexDirection: 'row', alignItems: 'flex-start', gap: space(3) },
  speciesName: { fontSize: 16, fontFamily: fonts.semibold, fontWeight: '600', color: colors.text },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: space(3) },
  barTrack: { flex: 1, height: 6, borderRadius: radius.pill, backgroundColor: 'rgba(148,163,184,0.25)', overflow: 'hidden' },
  bar: { height: '100%', borderRadius: radius.pill },
  count: { fontSize: 14, fontFamily: fonts.semibold, fontWeight: '600', color: colors.text, minWidth: 74, textAlign: 'right' },
});
