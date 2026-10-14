import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, radius, space } from '@/lib/theme';
import { Backdrop } from './backdrop';
import { LanguagePills } from './language-pills';
import { Tagline, Wordmark } from './logo';

/** Login / Sign Up layout: language switch, logo, wordmark and tagline, form card, footer link. */
export function AuthShell({ title, children, footer }: { title?: string; children: ReactNode; footer: ReactNode }) {
  return (
    <View style={styles.root}>
      <Backdrop />
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <View style={styles.lang}>
              <LanguagePills />
            </View>
            <View style={styles.brand}>
              <Wordmark size={34} layout="stacked" />
              <View style={{ marginTop: space(4) }}>
                <Tagline />
              </View>
            </View>
            <View style={styles.card}>
              {title && <Text style={styles.title}>{title}</Text>}
              <View style={styles.form}>{children}</View>
            </View>
            <View style={styles.footer}>{footer}</View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { flexGrow: 1, paddingHorizontal: space(5), paddingTop: space(3), paddingBottom: space(6) },
  lang: { alignItems: 'flex-end' },
  brand: { alignItems: 'center', gap: space(2), marginTop: space(8), marginBottom: space(6) },
  card: {
    backgroundColor: colors.glass,
    borderColor: colors.glassBorder,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: space(5),
  },
  title: { fontSize: 17, fontFamily: fonts.semibold, fontWeight: '600', color: colors.text, marginBottom: space(4) },
  form: { gap: space(4) },
  footer: { marginTop: 'auto', paddingTop: space(8), alignItems: 'center' },
});
