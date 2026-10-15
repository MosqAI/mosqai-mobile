import { Link } from 'expo-router';
import { useNotice } from '@/components/notice';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text } from 'react-native';
import { AuthShell } from '@/components/auth-shell';
import { Button, Field } from '@/components/ui';
import { useI18n } from '@/i18n';
import { useAuth } from '@/lib/auth';
import { colors, fonts } from '@/lib/theme';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const { t } = useI18n();
  const notice = useNotice();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!email.trim() || !password) return setError(t.auth.errors.missing);
    setBusy(true);
    setError(undefined);
    try {
      await signIn(email.trim(), password);
    } catch (e) {
      setError(e instanceof Error ? e.message : t.auth.errors.generic);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      footer={
        <Text style={styles.footer}>
          {t.auth.noAccount}{' '}
          <Link href="/signup" style={styles.link}>
            {t.auth.signUp}
          </Link>
        </Text>
      }
    >
      <Field
        icon="mail"
        placeholder={t.auth.email}
        keyboardType="email-address"
        autoComplete="email"
        textContentType="emailAddress"
        value={email}
        onChangeText={setEmail}
        accessibilityLabel="Email"
      />
      <Field
        icon="lock"
        placeholder={t.auth.password}
        secure
        autoComplete="password"
        textContentType="password"
        value={password}
        onChangeText={setPassword}
        onSubmitEditing={submit}
        error={error}
        accessibilityLabel="Password"
      />
      <Button title={t.auth.logIn} onPress={submit} loading={busy} />
      <Pressable onPress={() => notice.show({ title: t.auth.forgot, message: t.auth.forgotText, icon: 'tool' })} style={styles.forgot} accessibilityRole="button">
        <Text style={styles.link}>{t.auth.forgot}</Text>
      </Pressable>
      {/* The web build is how most owners get the app today */}
      {Platform.OS === 'web' && <Text style={styles.tip}>{t.auth.installTip}</Text>}
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  footer: { fontSize: 14, color: colors.textMuted },
  link: { color: colors.brand, fontFamily: fonts.semibold, fontWeight: '600', fontSize: 14 },
  forgot: { alignSelf: 'center', paddingVertical: 4 },
  tip: { fontSize: 12, lineHeight: 17, color: colors.textMuted, textAlign: 'center' },
});
