import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, View } from 'react-native';
import { COLORS, FONTS } from '../../constants/brand';
import { MYFATOORAH_SCRIPT_URL } from '../../constants/config';

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

const SCRIPT_URL = MYFATOORAH_SCRIPT_URL;

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
    script.src = SCRIPT_URL;
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
  amount,
  onResult,
}: {
  sessionId: string;
  amount: number;
  onResult: (result: MFWidgetResult) => void;
}) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  // Keep the latest onResult without re-initializing the widget
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  useEffect(() => {
    if (Platform.OS !== 'web') {
      setStatus('error');
      setErrorMsg('Embedded payment is currently available on web only.');
      return;
    }

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
    <View style={styles.wrap}>
      {status === 'loading' && (
        <View style={styles.center}>
          <ActivityIndicator color={COLORS.secondary} />
          <Text style={styles.hint}>Loading secure payment…</Text>
        </View>
      )}
      {status === 'error' && <Text style={styles.error}>{errorMsg}</Text>}
      {/* nativeID → DOM id on web; session.js renders the payment UI inside */}
      <View nativeID={CONTAINER_ID} style={styles.container} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%' },
  container: { width: '100%', minHeight: 320 },
  center: { alignItems: 'center', gap: 8, paddingVertical: 24 },
  hint: { fontFamily: FONTS.dmRegular, fontSize: 13, color: COLORS.muted },
  error: { fontFamily: FONTS.dmRegular, fontSize: 14, color: COLORS.error, paddingVertical: 12 },
});
