import Constants from 'expo-constants';
import { Alert, Linking, Text } from 'react-native';
import { LanguagePills } from '@/components/language-pills';
import { Card, Header, Row, Screen, text } from '@/components/ui';
import { fmt, useI18n } from '@/i18n';
import { space } from '@/lib/theme';

export default function SettingsScreen() {
  const { t } = useI18n();
  const version = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <Screen header={<Header title={t.settings.title} back />}>
      <Card style={{ gap: space(3) }}>
        <Text style={text.muted}>{t.settings.appLanguage}</Text>
        <LanguagePills full />
      </Card>
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <Row icon="bell" label={t.settings.notifications} onPress={() => Alert.alert(t.settings.notifications, t.settings.notificationsText)} />
        <Row icon="lock" label={t.settings.privacy} onPress={() => Alert.alert(t.settings.privacy, t.settings.privacyText)} />
        <Row icon="info" label={t.settings.about} value={`v${version}`} onPress={() => Alert.alert('MosqAI Shield', fmt(t.settings.version, { version }))} />
        <Row icon="help-circle" label={t.settings.help} last onPress={() => void Linking.openURL('mailto:support@mosqai.rw')} />
      </Card>
      <Text style={[text.faint, { textAlign: 'center' }]}>{t.auth.tagline}</Text>
    </Screen>
  );
}
