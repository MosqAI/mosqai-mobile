import { Link } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { z } from 'zod';
import { AuthShell } from '@/components/auth-shell';
import { Button, Field } from '@/components/ui';
import { useI18n } from '@/i18n';
import type { Dict } from '@/i18n/en';
import { useAuth } from '@/lib/auth';
import { colors, fonts } from '@/lib/theme';

// Mirrors the backend's /auth/register validation so errors show before submitting.
const makeSchema = (e: Dict['auth']['errors']) =>
  z.object({
    name: z.string().trim().min(2, e.name),
    email: z.email(e.email),
    phone: z
      .string()
      .trim()
      .transform((v) => v || undefined)
      .pipe(z.string().min(6, e.phone).optional()),
    password: z.string().min(8, e.password),
  });
type Errors = Partial<Record<'name' | 'email' | 'phone' | 'password' | 'form', string>>;

export default function SignUpScreen() {
  const { signUp } = useAuth();
  const { t, lang } = useI18n();
  const schema = useMemo(() => makeSchema(t.auth.errors), [t]);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const set = (key: keyof typeof form) => (value: string) => setForm((f) => ({ ...f, [key]: value }));

  const submit = async () => {
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const flat = z.flattenError(parsed.error).fieldErrors;
      return setErrors(Object.fromEntries(Object.entries(flat).map(([k, v]) => [k, v?.[0]])));
    }
    setErrors({});
    setBusy(true);
    try {
      await signUp({ ...parsed.data, language: lang });
    } catch (e) {
      setErrors({ form: e instanceof Error ? e.message : t.auth.errors.generic });
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title={t.auth.createAccount}
      footer={
        <Text style={styles.footer}>
          {t.auth.haveAccount}{' '}
          <Link href="/login" style={styles.link}>
            {t.auth.logIn}
          </Link>
        </Text>
      }
    >
      <Field icon="user" placeholder={t.auth.fullName} autoCapitalize="words" value={form.name} onChangeText={set('name')} error={errors.name} accessibilityLabel="Full name" />
      <Field icon="mail" placeholder={t.auth.email} keyboardType="email-address" autoComplete="email" value={form.email} onChangeText={set('email')} error={errors.email} accessibilityLabel="Email" />
      <Field icon="phone" placeholder={t.auth.phoneOptional} keyboardType="phone-pad" value={form.phone} onChangeText={set('phone')} error={errors.phone} accessibilityLabel="Phone number" />
      <Field icon="lock" placeholder={t.auth.password} secure autoComplete="new-password" value={form.password} onChangeText={set('password')} error={errors.password ?? errors.form} accessibilityLabel="Password" />
      <Button title={t.auth.signUp} onPress={submit} loading={busy} />
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  footer: { fontSize: 14, color: colors.textMuted },
  link: { color: colors.brand, fontFamily: fonts.semibold, fontWeight: '600', fontSize: 14 },
});
