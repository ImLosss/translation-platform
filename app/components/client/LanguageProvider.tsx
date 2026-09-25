'use client';

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import { getDictionary, type Dictionary } from '@/app/lib/i18n/dictionaries';
import { intlLocaleOf, type Locale } from '@/app/lib/i18n/locales';

interface LanguageContextValue {
  locale: Locale;
  /** Kamus terjemahan statis untuk locale aktif. */
  t: Dictionary;
  /** Locale untuk Intl (format angka & tanggal). */
  intlLocale: string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

/**
 * Provider locale yang di-seed dari server (route `[locale]`).
 * Tidak ada state/effect/localStorage — nilai locale datang dari URL,
 * sehingga HTML server & client selalu identik (tanpa hydration mismatch).
 */
export function LanguageProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  const value = useMemo<LanguageContextValue>(
    () => ({
      locale,
      t: getDictionary(locale),
      intlLocale: intlLocaleOf(locale),
    }),
    [locale],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage harus digunakan di dalam LanguageProvider');
  }
  return ctx;
}

/** Shortcut untuk mengambil kamus terjemahan saja. */
export function useTranslation() {
  return useLanguage().t;
}
