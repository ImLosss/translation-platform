export const LOCALES = ['id', 'en'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'id';

export const LOCALE_LABELS: Record<Locale, string> = {
  id: 'ID',
  en: 'EN',
};

export const LOCALE_NAMES: Record<Locale, string> = {
  id: 'Bahasa Indonesia',
  en: 'English',
};

export const LOCALE_STORAGE_KEY = 'subnova.locale';

/** Nama cookie untuk menyimpan preferensi locale (dipakai proxy + server). */
export const LOCALE_COOKIE = 'subnova.locale';

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

/** Locale untuk Intl (format angka & tanggal). */
export function intlLocaleOf(locale: Locale): string {
  return locale === 'id' ? 'id-ID' : 'en-US';
}

/** Bangun path dengan prefix locale, mis. localePath('en', '/translate') -> '/en/translate'. */
export function localePath(locale: Locale, path: string): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  if (clean === '/') return `/${locale}`;
  return `/${locale}${clean}`;
}

/** Ambil locale dari segmen pertama pathname, atau null jika tidak ada. */
export function getLocaleFromPathname(pathname: string): Locale | null {
  const segment = pathname.split('/')[1];
  return isLocale(segment) ? segment : null;
}

/** Hapus prefix locale dari pathname, mis. '/en/translate' -> '/translate'. */
export function stripLocale(pathname: string): string {
  const locale = getLocaleFromPathname(pathname);
  if (!locale) return pathname;
  const rest = pathname.slice(locale.length + 1);
  return rest === '' ? '/' : rest;
}
