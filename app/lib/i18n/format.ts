/**
 * Ganti placeholder `{key}` pada string kamus dengan nilai dari `vars`.
 * Contoh: interpolate('File "{name}" berhasil', { name: 'a.srt' })
 */
export function interpolate(
  template: string,
  vars: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match,
  );
}

/**
 * Format mata uang secara deterministik agar hasil di server (Node ICU) dan
 * browser (client ICU) identik — mencegah hydration mismatch.
 * Jumlah desimal dipatok eksplisit (default 0 untuk IDR).
 */
export function formatCurrency(
  value: number,
  intlLocale: string,
  currency = 'IDR',
  fractionDigits = 0,
): string {
  return new Intl.NumberFormat(intlLocale, {
    style: 'currency',
    currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}
