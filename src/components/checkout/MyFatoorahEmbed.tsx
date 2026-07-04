'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MYFATOORAH_SCRIPT_URL } from '@/lib/config';

// Result shape passed by session.js to the callback
export interface MFWidgetResult {
  isSuccess: boolean;
  paymentCompleted?: boolean;
  sessionId?: string;
  paymentData?: string; // encrypted — forwarded to backend, never decrypted here
  paymentType?: string;
  errorMessage?: string;
}

declare global {
  interface Window {
    myfatoorah?: {
      init: (config: Record<string, unknown>) => void;
    };
  }
}

const CONTAINER_ID = 'myfatoorah-embed';

let scriptPromise: Promise<void> | null = null;

function loadScript(): Promise<void> {
  if (typeof document === 'undefined') {
    return Promise.reject(new Error('MyFatoorah widget requires a browser environment'));
  }
  if (window.myfatoorah) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = MYFATOORAH_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error('Failed to load MyFatoorah payment script'));
    };
    document.head.appendChild(script);
  });
  return scriptPromise;
}

export default function MyFatoorahEmbed({
  sessionId,
  onResult,
}: {
  sessionId: string;
  amount?: number;
  onResult: (result: MFWidgetResult) => void;
}) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  // Keep the latest onResult without re-initializing the widget
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  useEffect(() => {
    let cancelled = false;

    loadScript()
      .then(() => {
        if (cancelled || !window.myfatoorah) return;
        // A fresh session (e.g. retry) needs a clean container
        const container = document.getElementById(CONTAINER_ID);
        if (container) container.innerHTML = '';

        // Config shape must match the docs exactly — extra fields can make the
        // widget reject the session ("SessionId is not valid")
        window.myfatoorah.init({
          sessionId,
          containerId: CONTAINER_ID,
          // MyFatoorah manages OTP screens and hosted-method redirects itself
          shouldHandlePaymentUrl: true,
          callback: (response: MFWidgetResult) => onResultRef.current(response),
        });
        setStatus('ready');
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setStatus('error');
        setErrorMsg(err.message);
      });

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  return (
    <div className="w-full">
      {status === 'loading' && (
        <div className="flex flex-col items-center gap-2 py-6">
          <span className="font-dm text-[13px] text-muted">Loading secure payment…</span>
        </div>
      )}
      {status === 'error' && <span className="py-3 font-dm text-[14px] text-error">{errorMsg}</span>}
      {/* session.js renders the payment UI inside */}
      <div id={CONTAINER_ID} className="min-h-[320px] w-full" />
    </div>
  );
}
