'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  isLocale,
  type Locale,
} from '@/app/lib/i18n/locales';
import { getDictionary, type Dictionary } from '@/app/lib/i18n/dictionaries';

interface LanguageContextValue {
  locale: Locale;
  /** Kamus terjemahan statis untuk locale aktif. */
  t: Dictionary;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  /** Locale untuk Intl (format angka & tanggal). */
  intlLocale: string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  // Ambil preferensi tersimpan setelah mount (hindari hydration mismatch).
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
      if (isLocale(stored)) setLocaleState(stored);
    } catch {
      /* localStorage tidak tersedia */
    }
  }, []);

  // Sinkronkan atribut <html lang> dan simpan preferensi.
  useEffect(() => {
    document.documentElement.lang = locale;
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    } catch {
      /* localStorage tidak tersedia */
    }
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
  }, []);

  const toggleLocale = useCallback(() => {
    setLocaleState((prev) => (prev === 'id' ? 'en' : 'id'));
  }, []);

  const value = useMemo<LanguageContextValue>(
    () => ({
      locale,
      t: getDictionary(locale),
      setLocale,
      toggleLocale,
      intlLocale: locale === 'id' ? 'id-ID' : 'en-US',
    }),
    [locale, setLocale, toggleLocale],
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
