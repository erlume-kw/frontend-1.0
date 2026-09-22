import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: Parameters<typeof intlMiddleware>[0]) {
  const response = intlMiddleware(request);
  // The root not-found.tsx (outside the [locale] segment — reached for a URL that doesn't
  // match any route at all) has no routing context of its own, so it can't tell English from
  // Arabic any other way. Carrying the real path through as a header lets it read the /ar
  // prefix server-side, instead of guessing (or worse, always defaulting to English).
  response.headers.set('x-pathname', request.nextUrl.pathname);
  return response;
}

export const config = {
  // Everything except the API, Next internals and static files (anything with a dot)
  matcher: ['/((?!api|trpc|_next|_vercel|.*\\..*).*)'],
};
