'use client';

import { useEffect, useState } from 'react';

/**
 * Defers rendering to the client. The app is a fully client-driven SPA
 * (auth tokens, cart, and the payment widget live in the browser) — matching
 * the behavior of the previous build, where nothing rendered until the JS
 * bundle booted. Also avoids desktop/mobile hydration mismatches, since the
 * responsive tree is chosen with window.innerWidth.
 */
export default function ClientOnly({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <>{children}</>;
}
