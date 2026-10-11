import { Icon } from '@/components/icon';
import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { CaptureThumb, RiskBadge, useSpeciesName } from '@/components/species';
import { Button, Card, ErrorState, Header, Loading, Screen, text } from '@/components/ui';
import { fmt, useI18n } from '@/i18n';
import { useCapture } from '@/lib/queries';
import { colors, fonts, radius, space } from '@/lib/theme';

export default function AnalysisScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, f } = useI18n();
  const speciesName = useSpeciesName();
  const { data, error, isLoading, refetch } = useCapture(id);
  const analysis = data?.analysis;
  const confidence = Math.round((analysis?.confidence ?? 0) * 100);

  return (
    <Screen header={<Header title={t.analysis.title} back />} footer={<Button title={t.common.done} onPress={() => router.back()} />}>
      {isLoading ? (
        <Loading />
      ) : error || !data ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : !analysis ? (
        <Card>
          <Text style={text.body}>{t.analysis.pending}</Text>
        </Card>
      ) : (
        <>
          <View style={styles.visual}>
            <CaptureThumb species={analysis.species} size={100} />
            {/* AI bounding-box accent */}
            <View style={styles.box} />
          </View>

          <Card style={{ gap: space(2) }}>
            <View style={styles.row}>
              <Text style={styles.species}>{speciesName(analysis.species)}</Text>
              <RiskBadge risk={analysis.risk} />
            </View>
            {analysis.species && <Text style={text.muted}>{t.species.note[analysis.species]}</Text>}
          </Card>

          <Card style={{ gap: space(3) }}>
            <View style={styles.row}>
              <Text style={text.muted}>{t.analysis.confidence}</Text>
              <Text style={styles.confidence}>{confidence}%</Text>
            </View>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${confidence}%` }]} />
            </View>
            <Text style={text.faint}>
              {fmt(t.analysis.model, { model: analysis.modelVersion, date: f.dateTime(analysis.analysedAt), count: analysis.detections.length })}
            </Text>
          </Card>

          {analysis.species && (
            <Card style={{ gap: space(3) }}>
              <Text style={styles.featuresTitle}>{t.analysis.keyFeatures}</Text>
              {t.analysis.features[analysis.species].map((feature) => (
                <View key={feature} style={styles.feature}>
                  <Icon name="check-circle" size={16} color={colors.brand} />
                  <Text style={[text.body, { flex: 1 }]}>{feature}</Text>
                </View>
              ))}
            </Card>
          )}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  visual: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: space(10),
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255,255,255,0.45)',
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  box: { position: 'absolute', width: 150, height: 150, borderWidth: 2, borderColor: colors.brand, borderRadius: 18, borderStyle: 'dashed' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space(2) },
  species: { fontSize: 18, fontFamily: fonts.display, fontWeight: '600', color: colors.text, flexShrink: 1 },
  confidence: { fontSize: 20, fontFamily: fonts.display, fontWeight: '600', color: colors.brand },
  track: { height: 6, borderRadius: radius.pill, backgroundColor: 'rgba(148,163,184,0.25)', overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: colors.brand, borderRadius: radius.pill },
  featuresTitle: { fontSize: 12, fontFamily: fonts.display, fontWeight: '600', letterSpacing: 1, color: colors.textMuted },
  feature: { flexDirection: 'row', alignItems: 'flex-start', gap: space(2) },
});
