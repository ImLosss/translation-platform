'use client';

import { useLanguage } from './LanguageProvider';
import { LOCALES, LOCALE_LABELS, LOCALE_NAMES } from '@/app/lib/i18n/locales';

/**
 * Toggle bahasa ID/EN berbasis kamus statis (tanpa terjemahan otomatis).
 * Preferensi disimpan di localStorage oleh LanguageProvider.
 */
export default function LanguageSwitcher() {
  const { locale, setLocale, t } = useLanguage();

  return (
    <div
      className="lang-switcher"
      role="group"
      aria-label={t.common.language}
      title={t.common.language}
    >
      {LOCALES.map((code) => (
        <button
          key={code}
          type="button"
          className={`lang-switcher-btn ${locale === code ? 'active' : ''}`}
          aria-pressed={locale === code}
          title={LOCALE_NAMES[code]}
          onClick={() => setLocale(code)}
        >
          {LOCALE_LABELS[code]}
        </button>
      ))}
    </div>
  );
}
