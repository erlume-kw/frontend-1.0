'use client';

import { useEffect } from 'react';
import { WishlistProvider } from '@/contexts/WishlistContext';
import { CartProvider } from '@/contexts/CartContext';
import CookiesBanner from '@/components/layout/CookiesBanner';
import ClientOnly from '@/components/ClientOnly';
import { enforceCanonicalHost } from '@/lib/config';

export default function Providers({ children }: { children: React.ReactNode }) {
  // One origin for cookies, cart storage, and payment redirects (localhost →
  // canonical dev host; no-op in production)
  useEffect(() => {
    enforceCanonicalHost();
  }, []);

  return (
    <ClientOnly>
      <WishlistProvider>
        <CartProvider>
          {children}
          <CookiesBanner />
        </CartProvider>
      </WishlistProvider>
    </ClientOnly>
  );
}
