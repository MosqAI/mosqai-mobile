import { Icon } from '@/components/icon';
import { Link, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CaptureThumb, RiskBadge, useSpeciesName } from '@/components/species';
import { Card, EmptyState, ErrorState, Header, Loading, Screen, text } from '@/components/ui';
import { useI18n } from '@/i18n';
import { useCaptures } from '@/lib/queries';
import { colors, fonts, space } from '@/lib/theme';

export default function CapturesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, f } = useI18n();
  const speciesName = useSpeciesName();
  const { data, error, isLoading, refetch, isRefetching } = useCaptures(id);

  return (
    <Screen header={<Header title={t.captures.title} back />} onRefresh={refetch} refreshing={isRefetching}>
      {isLoading ? (
        <Loading />
      ) : error || !data ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : data.length === 0 ? (
        <EmptyState icon="camera" title={t.captures.emptyTitle} text={t.captures.emptyText} />
      ) : (
        data.map((item) => (
          <Link key={item.id} href={`/captures/${item.id}`} asChild>
            <Pressable accessibilityRole="button">
              <Card style={styles.item}>
                <CaptureThumb species={item.species} size={56} />
                <View style={{ flex: 1, gap: space(1.5) }}>
                  <Text style={styles.name}>{speciesName(item.species)}</Text>
                  <RiskBadge risk={item.risk} />
                  <Text style={text.faint}>{f.dateTime(item.capturedAt)}</Text>
                </View>
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
  item: { flexDirection: 'row', alignItems: 'center', gap: space(3) },
  name: { fontSize: 16, fontFamily: fonts.semibold, fontWeight: '600', color: colors.text },
});
