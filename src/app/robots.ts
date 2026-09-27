import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/config';

// Keeps account/checkout pages out of search results (nothing there for a stranger to find,
// and no reason to index a signed-in cart or a payment redirect) while leaving every real
// content page open — in both languages, since English and /ar mirror the same paths.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/cart', '/ar/cart',
        '/checkout', '/ar/checkout',
        '/profile', '/ar/profile',
        '/sign-in', '/ar/sign-in',
        '/wishlist', '/ar/wishlist',
        '/payment-callback', '/ar/payment-callback',
        '/verify-email', '/ar/verify-email',
        '/unsubscribe', '/ar/unsubscribe',
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
