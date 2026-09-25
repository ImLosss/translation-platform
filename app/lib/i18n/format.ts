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
