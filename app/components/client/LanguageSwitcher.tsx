'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useLanguage } from './LanguageProvider';
import {
  LOCALES,
  LOCALE_LABELS,
  LOCALE_NAMES,
  localePath,
  stripLocale,
} from '@/app/lib/i18n/locales';

/**
 * Toggle bahasa ID/EN berbasis route `[locale]` (tanpa terjemahan otomatis).
 * Mengganti prefix locale pada URL saat ini.
 */
export default function LanguageSwitcher() {
  const { locale, t } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();

  const switchTo = (code: (typeof LOCALES)[number]) => {
    if (code === locale) return;
    router.push(localePath(code, stripLocale(pathname)));
  };

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
          onClick={() => switchTo(code)}
        >
          {LOCALE_LABELS[code]}
        </button>
      ))}
    </div>
  );
}
