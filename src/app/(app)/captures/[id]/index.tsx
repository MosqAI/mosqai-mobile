import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { CaptureThumb, RiskBadge, useSpeciesName } from '@/components/species';
import { Button, Card, ErrorState, Header, Loading, Screen, text } from '@/components/ui';
import { fmt, useI18n } from '@/i18n';
import { deviceName, devicePlace } from '@/lib/format';
import { useCapture } from '@/lib/queries';
import { colors, fonts, radius, space } from '@/lib/theme';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: space(1) }}>
      <Text style={text.faint}>{label}</Text>
      {children}
    </View>
  );
}

export default function CaptureDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, f } = useI18n();
  const speciesName = useSpeciesName();
  const { data, error, isLoading, refetch } = useCapture(id);
  const analysis = data?.analysis;

  return (
    <Screen
      header={<Header title={t.captures.details} back />}
      footer={
        data && (
          <>
            <Button title={t.captures.viewAnalysis} icon="cpu" onPress={() => router.push(`/captures/${id}/analysis`)} disabled={!analysis} />
            <Button title={t.common.back} variant="secondary" onPress={() => router.back()} />
          </>
        )
      }
    >
      {isLoading ? (
        <Loading />
      ) : error || !data ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : (
        <>
          <View style={styles.photo}>
            <CaptureThumb species={analysis?.species ?? null} size={110} />
            <Text style={text.faint}>{t.captures.previewSoon}</Text>
          </View>
          <Card style={{ gap: space(4) }}>
            <Field label={t.captures.species}>
              <View style={styles.speciesRow}>
                <Text style={styles.species}>{speciesName(analysis?.species ?? null)}</Text>
                <RiskBadge risk={analysis?.risk ?? null} />
              </View>
            </Field>
            <View style={styles.divider} />
            <Field label={t.captures.capturedAt}>
              <Text style={styles.value}>{f.dateTime(data.capturedAt)}</Text>
            </Field>
            <Field label={t.captures.device}>
              <Text style={styles.value}>
                {deviceName(data.device)} <Text style={text.muted}>({devicePlace(data.device)})</Text>
              </Text>
            </Field>
            <Field label={t.captures.analysis}>
              <Text style={styles.value}>
                {analysis?.confidence != null ? fmt(t.captures.confidence, { value: Math.round(analysis.confidence * 100) }) : t.captures.notAnalysed}
              </Text>
            </Field>
          </Card>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  photo: {
    alignItems: 'center',
    gap: space(3),
    paddingVertical: space(8),
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255,255,255,0.45)',
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  speciesRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space(2) },
  species: { fontSize: 18, fontFamily: fonts.display, fontWeight: '600', color: colors.text, flexShrink: 1 },
  divider: { height: 1, backgroundColor: colors.divider },
  value: { fontSize: 15, fontFamily: fonts.semibold, fontWeight: '600', color: colors.text },
});
