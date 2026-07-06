'use client';

import { API_URL } from '@/lib/config';

const BASE_URL = API_URL;

// NOTE: tokens are intentionally NOT cleared on load — a stored token is a
// signed-in session that must survive page reloads. The default state with no
// stored token is signed out. Expired tokens are handled by the 401 auto-refresh.

// ─── Storage (localStorage, SSR-safe) ─────────────────────────────────────────

const storage = {
  get(key: string): string | null {
    if (typeof window === 'undefined') return null;
    try { return window.localStorage.getItem(key); } catch { return null; }
  },
  set(key: string, value: string): void {
    if (typeof window === 'undefined') return;
    try { window.localStorage.setItem(key, value); } catch { /* quota/private mode */ }
  },
  remove(key: string): void {
    if (typeof window === 'undefined') return;
    try { window.localStorage.removeItem(key); } catch { /* noop */ }
  },
};

// ─── Token storage ────────────────────────────────────────────────────────────

const TOKEN_KEY = 'erlume_access_token';
const REFRESH_KEY = 'erlume_refresh_token';

// Cookie helper functions
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null; // Not in browser
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
}

function setCookie(name: string, value: string, days: number = 30): void {
  if (typeof document === 'undefined') return; // Not in browser
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value}; ${expires}; path=/; SameSite=Lax`;
}

function removeCookie(name: string): void {
  if (typeof document === 'undefined') return; // Not in browser
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
}

export async function getAccessToken(): Promise<string | null> {
  // Cookies are the primary store; localStorage is the fallback
  const cookieToken = getCookie(TOKEN_KEY);
  if (cookieToken) return cookieToken;
  return storage.get(TOKEN_KEY);
}

export async function setTokens(access: string, refresh: string): Promise<void> {
  setCookie(TOKEN_KEY, access, 7); // 7 days
  setCookie(REFRESH_KEY, refresh, 30); // 30 days
  storage.set(TOKEN_KEY, access);
  storage.set(REFRESH_KEY, refresh);
}

export async function clearTokens(): Promise<void> {
  removeCookie(TOKEN_KEY);
  removeCookie(REFRESH_KEY);
  storage.remove(TOKEN_KEY);
  storage.remove(REFRESH_KEY);
}

// ─── Core fetch wrapper ───────────────────────────────────────────────────────

async function request<T>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const token = await getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  // Auto-refresh on 401
  if (res.status === 401 && retry) {
    const refreshed = await tryRefresh();
    if (refreshed) return request<T>(path, options, false);
  }

  const data = await res.json();
  if (!res.ok) {
    const error = new Error(data.error ?? `Request failed: ${res.status}`);
    (error as any).data = data; // Attach full response data for field-specific errors
    throw error;
  }
  return data as T;
}

async function tryRefresh(): Promise<boolean> {
  try {
    const refreshToken = storage.get(REFRESH_KEY) ?? getCookie(REFRESH_KEY);
    if (!refreshToken) return false;
    const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    const data = await res.json();
    if (!res.ok || !data.accessToken) return false;
    await setTokens(data.accessToken, data.refreshToken ?? refreshToken);
    return true;
  } catch {
    return false;
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Drop {
  _id: string;
  name: string;
  description: string;
  releaseDate: string;
  status: 'upcoming' | 'active' | 'ended';
  bannerImageUrl?: string;
}

export interface Item {
  _id: string;
  itemName: string;
  itemModel?: string;
  brandName: string;
  listingPrice: string;
  basePrice: string;
  condition: string;
  itemStatus: 'pending' | 'approved' | 'available' | 'sold' | 'returned' | 'rejected';
  color: string;
  size: string;
  year?: string;
  imageUrls: string[];
  approved: boolean;
  drop_id?: string;
  seller_id?: string;
  category_id?: string;
}

export interface AuthUser {
  _id: string;
  emailAddress: string;
  roles: string[];
  phoneNumber?: string;
  address?: {
    street?: string;
    block?: string;
    city?: string;
    governorate?: string;
    house?: string;
  };
}

export interface ApiList<T> {
  success: boolean;
  data: T[];
  count?: number;
}

export interface ApiSingle<T> {
  success: boolean;
  data: T;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function login(emailAddress: string, password: string): Promise<AuthUser> {
  const data = await request<{ success: boolean; accessToken: string; refreshToken: string; user: AuthUser }>(
    '/api/auth/login',
    { method: 'POST', body: JSON.stringify({ emailAddress, password }) },
  );
  await setTokens(data.accessToken, data.refreshToken);
  return data.user;
}

export async function register(payload: {
  emailAddress: string;
  password: string;
  phoneNumber: string;
  address: { street: string; block: string; city: string; governorate: string; house: string };
}): Promise<AuthUser> {
  const data = await request<{ success: boolean; accessToken: string; refreshToken: string; user: AuthUser }>(
    '/api/auth/register',
    { method: 'POST', body: JSON.stringify(payload) },
  );
  await setTokens(data.accessToken, data.refreshToken);
  return data.user;
}

export async function logout(): Promise<void> {
  const refreshToken = storage.get(REFRESH_KEY) ?? getCookie(REFRESH_KEY);
  try {
    await request('/api/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }).catch(() => {});
  } catch {
    // Logout endpoint optional — always clear local tokens
  }
  await clearTokens();
}

export async function getMe(): Promise<AuthUser> {
  const data = await request<{ success: boolean; user: AuthUser }>('/api/auth/me');
  return data.user;
}

// Profile: update own saved address
export async function updateMyAddress(
  userId: string,
  address: { street: string; block: string; city: string; governorate: string; house: string },
): Promise<void> {
  await request(`/api/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify({ address }),
  });
}

// Profile: authenticated password change (requires the current password)
export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await request('/api/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

// ─── Drops ────────────────────────────────────────────────────────────────────
// Drops require admin auth. A read-only admin token is fetched on demand and
// kept ONLY in this module variable — it must never touch cookies/localStorage,
// otherwise every visitor would appear signed in as the admin account.

let _dropsToken: string | null = null;

async function getDropsToken(): Promise<string | null> {
  if (_dropsToken) return _dropsToken;
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        emailAddress: process.env.NEXT_PUBLIC_DROPS_EMAIL ?? '',
        password: process.env.NEXT_PUBLIC_DROPS_PASSWORD ?? '',
      }),
    });
    const data = await res.json();
    if (res.ok && data.accessToken) _dropsToken = data.accessToken;
  } catch {
    // silently fail — drops will show empty rather than crash
  }
  return _dropsToken;
}

async function dropsRequest<T>(path: string): Promise<T> {
  const token = await getDropsToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (res.status === 401) _dropsToken = null; // stale — refetch on next call
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? `Request failed: ${res.status}`);
  return data as T;
}

export async function fetchDrops(status?: string): Promise<Drop[]> {
  const q = status ? `?status=${status}` : '';
  const data = await dropsRequest<ApiList<Drop>>(`/api/drops${q}`);
  return data.data;
}

export async function fetchDropById(id: string): Promise<Drop> {
  const data = await dropsRequest<ApiSingle<Drop>>(`/api/drops/${id}`);
  return data.data;
}

export async function fetchDropItems(dropId: string): Promise<Item[]> {
  const data = await dropsRequest<ApiList<Item>>(`/api/drops/${dropId}/items`);
  return data.data;
}

// ─── Items ────────────────────────────────────────────────────────────────────

export async function fetchItems(params?: Record<string, string>): Promise<Item[]> {
  const q = params ? '?' + new URLSearchParams(params).toString() : '';
  const data = await request<ApiList<Item>>(`/api/items${q}`);
  return data.data;
}

export async function fetchItemById(id: string): Promise<Item> {
  const data = await request<ApiSingle<Item>>(`/api/items/${id}`);
  return data.data;
}

// ─── Newsletter ───────────────────────────────────────────────────────────────

export async function subscribeNewsletter(email: string): Promise<void> {
  await request('/api/newsletter', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

// ─── Notify similar item ──────────────────────────────────────────────────

export async function submitNotifyRequest(email: string, item: Pick<Item, '_id' | 'itemName' | 'brandName'>): Promise<void> {
  await request('/api/notify', {
    method: 'POST',
    body: JSON.stringify({ email, itemId: item._id, itemName: item.itemName, brandName: item.brandName }),
  });
}

// ─── Wishlist ─────────────────────────────────────────────────────────────────

export async function fetchWishlist(): Promise<Item[]> {
  const data = await request<ApiList<Item>>('/api/wishlist');
  return data.data;
}

export async function addToWishlist(itemId: string): Promise<void> {
  await request('/api/wishlist', {
    method: 'POST',
    body: JSON.stringify({ itemId }),
  });
}

export async function removeFromWishlist(itemId: string): Promise<void> {
  await request(`/api/wishlist/${itemId}`, { method: 'DELETE' });
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export async function validateCart(itemIds: string[]): Promise<{ valid: boolean; errors?: string[] }> {
  const data = await request<{ success: boolean; valid: boolean; errors?: string[] }>(
    '/api/orders/validate-cart',
    { method: 'POST', body: JSON.stringify({ itemIds }) },
  );
  return { valid: data.valid, errors: data.errors };
}

export async function validateDiscountCode(code: string, orderTotal?: number): Promise<{
  discountPercentage: number;
  discountAmount: number;
  finalTotal: number;
}> {
  const data = await request<{ success: boolean; discountPercentage: number; discountAmount: number; finalTotal: number }>(
    '/api/discount-codes/validate',
    { method: 'POST', body: JSON.stringify({ code, orderTotal: orderTotal?.toString() }) },
  );
  return data;
}

export async function fetchShippingMethods(): Promise<{ _id: string; name: string; description: string; price: number }[]> {
  const data = await request<ApiList<{ _id: string; name: string; description: string; price: number }>>('/api/shipping');
  return data.data;
}

// ─── Checkout / Payments (MyFatoorah) ─────────────────────────────────────────

export interface GuestInfo {
  name: string;
  phoneNumber?: string;
  emailAddress?: string;
  shippingAddress: {
    street: string;
    city: string;
    block: string;
    governorate: string;
    house: string;
    flat?: string;
  };
}

export interface CreatedOrder {
  _id: string;
  order_status: string;
}

// Step 1 — create the order (backend puts it in pending status and reserves items)
export async function createOrder(payload: {
  user_id?: string;
  guestInfo?: GuestInfo;
  orderItems: { item_id: string; quantity?: number }[];
}): Promise<CreatedOrder> {
  const data = await request<ApiSingle<CreatedOrder>>('/api/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return data.data;
}

// Signed-in checkout: switch the pending order to a different shipping address
export async function updateOrderShippingAddress(
  orderId: string,
  payload: {
    name: string;
    shippingAddress: { street: string; city: string; block: string; governorate: string; house: string; flat?: string };
  },
): Promise<void> {
  await request(`/api/orders/${orderId}/shipping-address`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

// Step 2 — get a MyFatoorah embedded session for the order.
// The backend recomputes the amount server-side; we only receive the sessionId.
export async function initiatePayment(
  orderId: string,
  discountRate?: number,
): Promise<{ sessionId: string; amount: number }> {
  return request('/api/payments/initiate', {
    method: 'POST',
    body: JSON.stringify({ orderId, discountRate }),
  });
}

// Step 3 — after the widget finishes, hand the result to the backend for
// verification. Embedded methods send encrypted paymentData; hosted methods
// (KNET) send the paymentId from the redirect. The backend re-verifies with
// MyFatoorah either way — its answer is the only source of truth.
export async function confirmPayment(payload: {
  orderId?: string;
  encryptedPaymentData?: string;
  paymentId?: string;
}): Promise<{ success: boolean; orderId: string | null; message: string }> {
  return request('/api/payments/callback', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
