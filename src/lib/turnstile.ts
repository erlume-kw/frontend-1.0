// Cloudflare Turnstile — bot check for the public photo uploads
// (sell-with-us + pricing estimator). The backend verifies the token.
//
// NEXT_PUBLIC_TURNSTILE_SITE_KEY unset → no token is sent (local dev; the
// backend skips the check when its TURNSTILE_SECRET_KEY is unset too).

type TurnstileApi = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
const TIMEOUT_MS = 60_000;

let scriptPromise: Promise<TurnstileApi> | null = null;

function loadScript(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = SCRIPT_URL;
      s.async = true;
      s.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error('Turnstile failed to load')));
      s.onerror = () => {
        scriptPromise = null;
        reject(new Error('Turnstile failed to load'));
      };
      document.head.appendChild(s);
    });
  }
  return scriptPromise;
}

/**
 * Returns a fresh, single-use Turnstile token, or undefined when no site key is
 * configured. Most visitors never see anything; if Cloudflare wants a click,
 * the checkbox appears at the bottom of the screen until it's solved.
 */
export async function getTurnstileToken(): Promise<string | undefined> {
  if (!SITE_KEY || typeof window === 'undefined') return undefined;

  const turnstile = await loadScript();

  const container = document.createElement('div');
  container.style.cssText =
    'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:2147483647;';
  document.body.appendChild(container);

  let widgetId: string | undefined;
  const cleanup = () => {
    if (widgetId) {
      try { turnstile.remove(widgetId); } catch { /* already gone */ }
    }
    container.remove();
  };

  try {
    return await new Promise<string>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Captcha timed out')), TIMEOUT_MS);
      widgetId = turnstile.render(container, {
        sitekey: SITE_KEY,
        appearance: 'interaction-only',
        language: document.documentElement.lang === 'ar' ? 'ar' : 'en',
        callback: (token: string) => { clearTimeout(timer); resolve(token); },
        'error-callback': () => { clearTimeout(timer); reject(new Error('Captcha failed')); },
        'expired-callback': () => { clearTimeout(timer); reject(new Error('Captcha expired')); },
      });
    });
  } finally {
    cleanup();
  }
}

/** Header to attach to an upload request (empty when Turnstile isn't configured). */
export async function turnstileHeader(): Promise<Record<string, string>> {
  const token = await getTurnstileToken();
  return token ? { 'X-Turnstile-Token': token } : {};
}
