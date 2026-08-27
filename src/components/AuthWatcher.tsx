'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAccessToken, getMe, SESSION_EXPIRED_EVENT } from '@/services/api';

/**
 * Watches for a dead session and logs the user out. `request()` clears the
 * tokens and fires SESSION_EXPIRED_EVENT when a token-bearing call gets an
 * unrecoverable 401 (refresh failed, or the account was hard-deleted in the
 * backoffice). On mount we also proactively re-validate an existing session via
 * /api/auth/me so a hard-deleted user is bounced immediately, not only on their
 * next authenticated action.
 */
export default function AuthWatcher() {
  const router = useRouter();

  useEffect(() => {
    const onExpired = () => router.replace('/sign-in');
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);

    (async () => {
      const token = await getAccessToken();
      if (!token) return;
      // A 401 here is handled inside request() → fires SESSION_EXPIRED_EVENT.
      // Other failures (network, 5xx) must NOT log the user out.
      try {
        await getMe();
      } catch {
        /* handled by request() when it's an auth failure */
      }
    })();

    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  }, [router]);

  return null;
}
