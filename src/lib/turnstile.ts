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

// Tokens are single-use and valid for 300 s; reuse a prepared one only while it's
// comfortably inside that window.
const TOKEN_MAX_AGE_MS = 240_000;
let prepared: { promise: Promise<string | undefined>; at: number } | null = null;

/**
 * Starts the bot check early — call it when the visitor picks their photos, while
 * they're still on the page. If Cloudflare wants a click, the checkbox shows up
 * then, instead of behind the WhatsApp tab that opens on submit.
 */
export function prepareTurnstileToken(): void {
  if (!SITE_KEY || typeof window === 'undefined') return;
  if (prepared && Date.now() - prepared.at < TOKEN_MAX_AGE_MS) return;
  const promise = solveTurnstile().catch(err => {
    if (prepared?.promise === promise) prepared = null;
    throw err;
  });
  promise.catch(() => {}); // no unhandled rejection while nobody is waiting on it yet
  prepared = { promise, at: Date.now() };
}

/**
 * Returns a single-use Turnstile token (the prepared one if still fresh, else a
 * new one), or undefined when no site key is configured.
 */
export async function getTurnstileToken(): Promise<string | undefined> {
  if (!SITE_KEY || typeof window === 'undefined') return undefined;
  const p = prepared && Date.now() - prepared.at < TOKEN_MAX_AGE_MS ? prepared.promise : solveTurnstile();
  prepared = null; // single-use
  return p;
}

async function solveTurnstile(): Promise<string | undefined> {
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
