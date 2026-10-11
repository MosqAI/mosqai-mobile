import { Icon } from '@/components/icon';
import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useI18n } from '@/i18n';
import { colors, fonts, radius, space } from '@/lib/theme';
import { Backdrop } from './backdrop';
import { Wordmark } from './logo';

import type { IconName } from './icon';
export type { IconName };

/** Space kept clear at the bottom of tab screens for the floating tab bar. */
export const TAB_BAR_SPACE = 110;

/** Round frosted button, as in the design's top bar. */
export function GlassIconButton({ icon, onPress, label, dot = false }: { icon: IconName; onPress: () => void; label: string; dot?: boolean }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} hitSlop={8} style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.7 }]}>
      <Icon name={icon} size={18} color={colors.textMuted} />
      {dot && <View style={styles.iconDot} />}
    </Pressable>
  );
}

/** Transparent top bar: brand variant on tab screens, back + title on detail screens. */
export function Header({ title, back = false, right }: { title?: string; back?: boolean; right?: ReactNode }) {
  const { t } = useI18n();
  return (
    <SafeAreaView edges={['top']}>
      <View style={styles.headerRow}>
        {back && <GlassIconButton icon="arrow-left" label={t.common.goBack} onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} />}
        {title ? (
          <Text style={styles.headerTitle} accessibilityRole="header" numberOfLines={1}>
            {title}
          </Text>
        ) : (
          <View style={styles.brand}>
            <Wordmark size={17} />
          </View>
        )}
        <View style={styles.headerRight}>{right}</View>
      </View>
    </SafeAreaView>
  );
}

export function Screen({
  header,
  children,
  footer,
  scroll = true,
  tab = false,
  onRefresh,
  refreshing = false,
}: {
  header: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  scroll?: boolean;
  /** Leaves room for the floating tab bar. */
  tab?: boolean;
  onRefresh?: () => void;
  refreshing?: boolean;
}) {
  const bottom = { paddingBottom: tab ? TAB_BAR_SPACE : space(8) };
  return (
    <View style={styles.screen}>
      <Backdrop />
      {header}
      {scroll ? (
        <ScrollView
          contentContainerStyle={[styles.content, bottom]}
          refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand} /> : undefined}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, bottom, { flex: 1 }]}>{children}</View>
      )}
      {footer && (
        <SafeAreaView edges={['bottom']} style={styles.footer}>
          {footer}
        </SafeAreaView>
      )}
    </View>
  );
}

/** Frosted-glass panel. */
export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
  size = 'md',
}: {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'md' | 'sm';
  loading?: boolean;
  disabled?: boolean;
  icon?: IconName;
}) {
  const primary = variant === 'primary';
  const fg = primary ? '#fff' : variant === 'danger' ? colors.danger : colors.text;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      style={({ pressed }) => [
        styles.button,
        size === 'sm' && styles.buttonSmall,
        primary ? styles.buttonPrimary : styles.buttonSecondary,
        pressed && primary && { backgroundColor: colors.brandPressed },
        pressed && !primary && { backgroundColor: colors.glassStrong },
        (disabled || loading) && { opacity: 0.55 },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <>
          {icon && <Icon name={icon} size={size === 'sm' ? 15 : 17} color={fg} />}
          <Text style={[styles.buttonText, size === 'sm' && styles.buttonTextSmall, { color: fg }]}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}

export function Field({ icon, error, secure = false, ...props }: TextInputProps & { icon: IconName; error?: string; secure?: boolean }) {
  const { t } = useI18n();
  const [hidden, setHidden] = useState(secure);
  return (
    <View>
      <View style={[styles.field, error && { borderColor: colors.danger }]}>
        <Icon name={icon} size={17} color={colors.textFaint} />
        <TextInput placeholderTextColor={colors.textFaint} style={styles.fieldInput} secureTextEntry={hidden} autoCapitalize="none" {...props} />
        {secure && (
          <Pressable
            onPress={() => setHidden(!hidden)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={hidden ? t.auth.showPassword : t.auth.hidePassword}
          >
            <Icon name={hidden ? 'eye' : 'eye-off'} size={18} color={colors.textFaint} />
          </Pressable>
        )}
      </View>
      {error && <Text style={styles.fieldError}>{error}</Text>}
    </View>
  );
}

export type Tone = 'success' | 'danger' | 'warning' | 'info' | 'neutral';
const toneColors: Record<Tone, [string, string]> = {
  success: [colors.successSoft, colors.success],
  danger: [colors.dangerSoft, colors.danger],
  warning: [colors.warningSoft, colors.warning],
  info: [colors.infoSoft, colors.info],
  neutral: [colors.neutralSoft, colors.textMuted],
};

export function Badge({ label, tone, dot = false }: { label: string; tone: Tone; dot?: boolean }) {
  const [bg, fg] = toneColors[tone];
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      {dot && <View style={[styles.dot, { backgroundColor: fg }]} />}
      <Text style={[styles.badgeText, { color: fg }]}>{label}</Text>
    </View>
  );
}

/** Settings-style row: icon, label, optional value, chevron. */
export function Row({
  icon,
  label,
  value,
  onPress,
  danger = false,
  last = false,
}: {
  icon: IconName;
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
  last?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.row, !last && styles.rowDivider, pressed && { backgroundColor: colors.glassStrong }]}
    >
      <View style={styles.rowIcon}>
        <Icon name={icon} size={18} color={danger ? colors.danger : colors.textMuted} />
      </View>
      <Text style={[styles.rowLabel, { color: danger ? colors.danger : colors.text }]}>{label}</Text>
      {value && <Text style={styles.rowValue}>{value}</Text>}
      {!danger && <Icon name="chevron-right" size={16} color={colors.textFaint} />}
    </Pressable>
  );
}

export function DetailRow({ label, value, last = false }: { label: string; value: ReactNode; last?: boolean }) {
  return (
    <View style={[styles.detail, !last && styles.rowDivider]}>
      <Text style={styles.detailLabel}>{label}</Text>
      {typeof value === 'string' || typeof value === 'number' ? <Text style={styles.detailValue}>{value}</Text> : value}
    </View>
  );
}

/** Pill-shaped segmented control (period filters, language picker). */
export function Pills<T extends string | number>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View style={styles.pills} accessibilityRole="tablist">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={String(o.value)}
            onPress={() => onChange(o.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={[styles.pill, active && styles.pillActive]}
          >
            <Text style={[styles.pillText, active && { color: '#fff' }]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Loading() {
  return (
    <View style={styles.state}>
      <ActivityIndicator color={colors.brand} />
    </View>
  );
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const { t } = useI18n();
  return (
    <View style={styles.state}>
      <Icon name="wifi-off" size={24} color={colors.textFaint} />
      <Text style={styles.stateTitle}>{t.common.loadError}</Text>
      <Text style={styles.stateText}>{error instanceof Error ? error.message : t.common.checkConnection}</Text>
      {onRetry && <Button title={t.common.tryAgain} variant="secondary" onPress={onRetry} />}
    </View>
  );
}

export function EmptyState({ icon, title, text: body }: { icon: IconName; title: string; text: string }) {
  return (
    <View style={styles.state}>
      <Icon name={icon} size={24} color={colors.textFaint} />
      <Text style={styles.stateTitle}>{title}</Text>
      <Text style={styles.stateText}>{body}</Text>
    </View>
  );
}

export const text = StyleSheet.create({
  h1: { fontFamily: fonts.display, fontSize: 22, fontWeight: '600', color: colors.text, letterSpacing: -0.3 },
  h2: { fontFamily: fonts.display, fontSize: 15, fontWeight: '600', color: colors.text },
  body: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, color: colors.text },
  muted: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 19, color: colors.textMuted },
  faint: { fontFamily: fonts.regular, fontSize: 12, color: colors.textFaint },
});

const glass = {
  backgroundColor: colors.glass,
  borderWidth: 1,
  borderColor: colors.glassBorder,
} as const;

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: space(3), paddingHorizontal: space(5), paddingTop: space(2), paddingBottom: space(1) },
  headerTitle: { color: colors.text, fontSize: 17, fontFamily: fonts.display, fontWeight: '600', flexShrink: 1 },
  headerRight: { marginLeft: 'auto', flexDirection: 'row', gap: space(2) },
  brand: { flexDirection: 'row', alignItems: 'center', gap: space(2) },
  iconBtn: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.glassStrong, borderWidth: 1, borderColor: colors.glassBorder },
  iconDot: { position: 'absolute', top: 9, right: 10, width: 7, height: 7, borderRadius: 4, backgroundColor: colors.danger, borderWidth: 1.5, borderColor: '#fff' },
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: space(5), paddingTop: space(3), gap: space(6) },
  footer: { paddingHorizontal: space(5), paddingTop: space(2), paddingBottom: space(3), gap: space(3) },
  card: { ...glass, borderRadius: radius.lg, padding: space(4) },
  button: {
    minHeight: 44,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space(2),
    paddingHorizontal: space(4),
  },
  buttonSmall: { minHeight: 34, borderRadius: radius.sm + 2, paddingHorizontal: space(3), gap: space(1.5) },
  buttonPrimary: { backgroundColor: colors.brand },
  buttonSecondary: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  buttonText: { fontSize: 14, fontFamily: fonts.medium, fontWeight: '500' },
  buttonTextSmall: { fontSize: 13 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space(3),
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.md,
    paddingHorizontal: space(3.5),
    minHeight: 46,
    backgroundColor: colors.card,
  },
  fieldInput: { fontFamily: fonts.regular, flex: 1, fontSize: 14, color: colors.text, paddingVertical: space(3) },
  fieldError: { fontFamily: fonts.regular, color: colors.danger, fontSize: 12, marginTop: space(1), marginLeft: space(1) },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space(1.5),
    alignSelf: 'flex-start',
    borderRadius: radius.sm,
    paddingHorizontal: space(2),
    paddingVertical: 3,
  },
  badgeText: { fontSize: 11, fontFamily: fonts.medium, fontWeight: '500' },
  dot: { width: 6, height: 6, borderRadius: 3 },
  row: { flexDirection: 'row', alignItems: 'center', gap: space(3), paddingVertical: space(3.5), paddingHorizontal: space(4) },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: colors.divider },
  rowIcon: { width: 24, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { flex: 1, fontSize: 14, fontFamily: fonts.regular, fontWeight: '400' },
  rowValue: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted },
  detail: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: space(3), gap: space(3) },
  detailLabel: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted },
  detailValue: { fontSize: 13, color: colors.text, fontFamily: fonts.medium, fontWeight: '500', flexShrink: 1, textAlign: 'right' },
  pills: { flexDirection: 'row', gap: space(2), flexWrap: 'wrap' },
  pill: { paddingHorizontal: space(3.5), paddingVertical: space(1.5), borderRadius: radius.pill, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  pillActive: { backgroundColor: colors.brand, borderColor: colors.brand },
  pillText: { fontSize: 12, fontFamily: fonts.medium, fontWeight: '500', color: colors.textMuted },
  state: { alignItems: 'center', justifyContent: 'center', gap: space(3), padding: space(8), flex: 1 },
  stateTitle: { fontSize: 15, fontFamily: fonts.semibold, fontWeight: '600', color: colors.text },
  stateText: { fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted, textAlign: 'center' },
});
