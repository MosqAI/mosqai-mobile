import { dictionaries, LANGUAGES, useI18n } from '@/i18n';
import { Pills } from './ui';

const SHORT = { en: 'EN', fr: 'FR', rw: 'RW' } as const;

/** EN / FR / RW switcher. `full` shows language names instead of codes. */
export function LanguagePills({ full = false }: { full?: boolean }) {
  const { lang, setLanguage } = useI18n();
  return (
    <Pills
      options={LANGUAGES.map((l) => ({ value: l, label: full ? dictionaries[l].meta.languageName : SHORT[l] }))}
      value={lang}
      onChange={(l) => void setLanguage(l)}
    />
  );
}
