'use client';

import { useEffect } from 'react';
import { WishlistProvider } from '@/contexts/WishlistContext';
import { CartProvider } from '@/contexts/CartContext';
import CookiesBanner from '@/components/layout/CookiesBanner';
import ClientOnly from '@/components/ClientOnly';
import AuthWatcher from '@/components/AuthWatcher';
import { enforceCanonicalHost } from '@/lib/config';

export default function Providers({ children }: { children: React.ReactNode }) {
  // One origin for cookies, cart storage, and payment redirects (localhost →
  // canonical dev host; no-op in production)
  useEffect(() => {
    enforceCanonicalHost();
  }, []);

  // TEMPORARY — compare the two Arabic font candidates: open any page with ?font=plex or
  // ?font=readex (the choice is remembered). Remove once one font is picked.
  useEffect(() => {
    try {
      const requested = new URLSearchParams(window.location.search).get('font');
      if (requested === 'plex' || requested === 'readex') {
        window.localStorage.setItem('erlume_ar_font', requested);
      }
      if (window.localStorage.getItem('erlume_ar_font') === 'plex') {
        document.documentElement.dataset.arabicFont = 'plex';
      } else {
        delete document.documentElement.dataset.arabicFont;
      }
    } catch {
      // storage unavailable — keep the default font
    }
  }, []);

  return (
    <ClientOnly>
      <AuthWatcher />
      <WishlistProvider>
        <CartProvider>
          {children}
          <CookiesBanner />
        </CartProvider>
      </WishlistProvider>
    </ClientOnly>
  );
}
