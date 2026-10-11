import { Icon } from '@/components/icon';
import { StyleSheet, View } from 'react-native';
import { useI18n } from '@/i18n';
import { colors } from '@/lib/theme';
import type { Species, SpeciesRisk } from '@/lib/types';
import { Badge } from './ui';

const tone = { HIGH: 'danger', MEDIUM: 'warning', UNKNOWN: 'neutral' } as const;

export function RiskBadge({ risk }: { risk: SpeciesRisk | null }) {
  const { t } = useI18n();
  return risk ? <Badge label={t.species.risk[risk]} tone={tone[risk]} /> : <Badge label={t.captures.analysing} tone="info" />;
}

/** Genus name, or "awaiting analysis" before the AI service has run. */
export function useSpeciesName() {
  const { t } = useI18n();
  return (s: Species | null) => (s ? t.species.name[s] : t.captures.awaiting);
}

const tint: Record<Species, string> = {
  ANOPHELES: colors.danger,
  AEDES: colors.violet,
  CULEX: colors.brand,
  OTHER: colors.textFaint,
};

/**
 * Stand-in for the capture photo until images are served from storage:
 * the backend returns imageUrl: null for now.
 */
export function CaptureThumb({ species, size = 64 }: { species: Species | null; size?: number }) {
  const color = species ? tint[species] : colors.textFaint;
  return (
    <View style={[styles.thumb, { width: size, height: size, borderRadius: size / 2 }]}>
      <Icon name="aperture" size={size * 0.42} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  thumb: {
    backgroundColor: colors.glassStrong,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
