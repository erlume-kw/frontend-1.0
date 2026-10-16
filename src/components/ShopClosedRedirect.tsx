'use client';

import { useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';

/** Cart/checkout while the shop is view-only (SHOP_ENABLED=false): send visitors home. */
export default function ShopClosedRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/');
  }, [router]);
  return null;
}
