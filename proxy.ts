import { NextResponse, type NextRequest } from 'next/server';
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  isLocale,
  type Locale,
} from './app/lib/i18n/locales';

/**
 * Proxy (dahulu Middleware) untuk i18n berbasis URL.
 * - Redirect request tanpa prefix locale ke `/{locale}{path}`.
 * - Locale diambil dari cookie, lalu Accept-Language, lalu default.
 * - Menyimpan locale terpilih ke cookie agar konsisten di request berikutnya.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Sudah ada prefix locale yang valid -> lanjutkan.
  const firstSegment = pathname.split('/')[1];
  if (isLocale(firstSegment)) return NextResponse.next();

  const locale = resolveLocale(request);

  const url = request.nextUrl.clone();
  url.pathname = pathname === '/' ? `/${locale}` : `/${locale}${pathname}`;

  const response = NextResponse.redirect(url);
  response.cookies.set(LOCALE_COOKIE, locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  });
  return response;
}

function resolveLocale(request: NextRequest): Locale {
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  if (isLocale(cookieLocale)) return cookieLocale;

  const header = request.headers.get('accept-language');
  if (header) {
    const preferred = header
      .split(',')
      .map((part) => part.split(';')[0].trim().toLowerCase());
    for (const lang of preferred) {
      const base = lang.split('-')[0];
      if (isLocale(base)) return base;
    }
  }

  return DEFAULT_LOCALE;
}

export const config = {
  // Lewati API, aset Next, file statis, dan file dengan ekstensi.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
