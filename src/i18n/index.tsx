import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { getItem, setItem } from '@/lib/storage';
import type { User } from '@/lib/types';
import en, { type Dict } from './en';
import fr from './fr';
import rw from './rw';

export const LANGUAGES = ['en', 'fr', 'rw'] as const;
export type Language = (typeof LANGUAGES)[number];
export const dictionaries: Record<Language, Dict> = { en, fr, rw };
const KEY = 'mosqai.lang';

const isLanguage = (v: unknown): v is Language => LANGUAGES.includes(v as Language);

/** Fills {placeholders}: fmt('Hi {name}', { name: 'Ada' }). */
export function fmt(template: string, params: Record<string, string | number> = {}) {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => (k in params ? String(params[k]) : `{${k}}`));
}

// Dates are formatted by hand: Hermes' Intl support for French and especially
// Kinyarwanda varies by platform, and every phone should show the same text.
const MONTHS: Record<Language, string[]> = {
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  fr: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  rw: ['Mutarama', 'Gashyantare', 'Werurwe', 'Mata', 'Gicurasi', 'Kamena', 'Nyakanga', 'Kanama', 'Nzeri', 'Ukwakira', 'Ugushyingo', 'Ukuboza'],
};
const FR_SHORT = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
const KIGALI_OFFSET_MS = 2 * 3600_000; // Africa/Kigali is UTC+2 year-round (no DST).

function kigali(iso: string | Date) {
  const d = new Date(new Date(iso).getTime() + KIGALI_OFFSET_MS);
  return { day: d.getUTCDate(), month: d.getUTCMonth(), year: d.getUTCFullYear(), h: d.getUTCHours(), m: d.getUTCMinutes() };
}

export function formatters(lang: Language) {
  const months = MONTHS[lang];
  const short = (m: number) => (lang === 'fr' ? FR_SHORT[m] : months[m].slice(0, 3));
  const pad = (n: number) => String(n).padStart(2, '0');
  const date = (iso: string | Date) => {
    const p = kigali(iso);
    return lang === 'en' ? `${short(p.month)} ${p.day}, ${p.year}` : `${p.day} ${lang === 'fr' ? short(p.month) : months[p.month]} ${p.year}`;
  };
  return {
    date,
    shortDate: (iso: string | Date) => {
      const p = kigali(iso);
      return lang === 'en' ? `${short(p.month)} ${p.day}` : `${p.day} ${short(p.month)}`;
    },
    time: (iso: string | Date) => {
      const p = kigali(iso);
      return `${pad(p.h)}:${pad(p.m)}`;
    },
    dateTime: (iso: string | Date) => {
      const p = kigali(iso);
      return `${date(iso)} • ${pad(p.h)}:${pad(p.m)}`;
    },
    hour: () => kigali(new Date()).h,
  };
}

export type Formatters = ReturnType<typeof formatters>;

interface I18nValue {
  lang: Language;
  t: Dict;
  f: Formatters;
  setLanguage(lang: Language): Promise<void>;
}

const I18nContext = createContext<I18nValue | null>(null);

/**
 * Language comes from the signed-in user's profile, else the device's last choice.
 * A language picked while signed out (login screen) is pushed to the profile on
 * the next sign-in, so the explicit choice wins over an older saved preference.
 */
export function I18nProvider({ children }: { children: React.ReactNode }) {
  const { user, setUser } = useAuth();
  const [stored, setStored] = useState<Language>('en');
  const pendingChoice = useRef<Language | null>(null);

  useEffect(() => {
    getItem(KEY)
      .then((v) => isLanguage(v) && setStored(v))
      .catch(() => {});
  }, []);

  const saveToProfile = useCallback(
    async (next: Language) => {
      if (!user || user.language === next) return;
      setUser({ ...user, language: next });
      await api<User>('/auth/me', { method: 'PATCH', json: { language: next } }).catch(() => {});
    },
    [user, setUser],
  );

  useEffect(() => {
    if (user && pendingChoice.current) {
      const choice = pendingChoice.current;
      pendingChoice.current = null;
      void saveToProfile(choice);
    }
  }, [user, saveToProfile]);

  const lang: Language = user && isLanguage(user.language) ? user.language : stored;

  const setLanguage = useCallback(
    async (next: Language) => {
      setStored(next);
      await setItem(KEY, next).catch(() => {});
      if (user) await saveToProfile(next);
      else pendingChoice.current = next;
    },
    [user, saveToProfile],
  );

  const value = useMemo(() => ({ lang, t: dictionaries[lang], f: formatters(lang), setLanguage }), [lang, setLanguage]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider');
  return ctx;
}
