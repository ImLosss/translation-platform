import type { ReactNode } from 'react';

/**
 * Root layout minimal. Elemen <html>/<body> didefinisikan di
 * `app/[locale]/layout.tsx` agar atribut `lang` mengikuti locale.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
