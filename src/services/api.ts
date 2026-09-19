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
  sessionExpiredHandled = false; // a fresh sign-in re-arms the expiry handler
}

export async function clearTokens(): Promise<void> {
  removeCookie(TOKEN_KEY);
  removeCookie(REFRESH_KEY);
  storage.remove(TOKEN_KEY);
  storage.remove(REFRESH_KEY);
}

// ─── Session-expiry handling ──────────────────────────────────────────────────
// Fired when a request that carried a token gets a 401 that refresh can't
// recover — i.e. the session is dead (refresh token expired/revoked, or the
// account was hard-deleted in the backoffice). We clear the local tokens and
// broadcast an event so a top-level watcher can redirect to sign-in. Guarded so
// a burst of concurrent failing requests only triggers one logout.
export const SESSION_EXPIRED_EVENT = 'erlume:session-expired';
let sessionExpiredHandled = false;

async function handleSessionExpired(): Promise<void> {
  if (sessionExpiredHandled) return;
  sessionExpiredHandled = true;
  await clearTokens();
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
  }
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

  // On 401: try a token refresh once, then retry. If we still can't recover and
  // the request actually carried a token, the session is dead → log out.
  if (res.status === 401) {
    if (retry) {
      const refreshed = await tryRefresh();
      if (refreshed) return request<T>(path, options, false);
    }
    if (token) await handleSessionExpired();
  }

  const data = await res.json();
  if (!res.ok) {
    const error = new Error(data.error ?? `Request failed: ${res.status}`);
    (error as any).data = data; // Attach full response data for field-specific errors
    (error as any).status = res.status; // Attach HTTP status for callers that branch on it
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
  status: 'upcoming' | 'active' | 'ended' | 'hidden';
  bannerImageUrl?: string;
}

export interface Banner {
  _id: string;
  order: number;
  imageUrl: string;
  description: string;
  ctaLabel: string;
  ctaUrl: string;
  showCta: boolean;
  isVisible: boolean;
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
    avenue?: string;
    flat?: string;
  };
}

export interface ApiList<T> {
  success: boolean;
  data: T[];
  count?: number;
  pagination?: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
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
  address: { street: string; block: string; city: string; governorate: string; house: string; avenue?: string; flat?: string };
}): Promise<AuthUser> {
  const data = await request<{ success: boolean; accessToken: string; refreshToken: string; user: AuthUser }>(
    '/api/auth/register',
    { method: 'POST', body: JSON.stringify(payload) },
  );
  await setTokens(data.accessToken, data.refreshToken);
  return data.user;
}

// Forgot password: the backend emails a 6-digit code to the account's email address.
export async function requestPasswordReset(emailAddress: string): Promise<void> {
  await request('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ emailAddress }),
  });
}

export async function resetPassword(emailAddress: string, otp: string, newPassword: string): Promise<void> {
  await request('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ emailAddress, otp, newPassword }),
  });
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
  address: { street: string; block: string; city: string; governorate: string; house: string; avenue?: string; flat?: string },
): Promise<void> {
  await request(`/api/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify({ address }),
  });
}

// Profile: update email (must already be OTP-verified via /api/email-verification)
export async function updateMyEmail(userId: string, emailAddress: string): Promise<AuthUser> {
  const data = await request<{ success: boolean; data: { user: AuthUser } }>(`/api/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify({ emailAddress }),
  });
  return data.data.user;
}

// Profile: update phone number
export async function updateMyPhone(userId: string, phoneNumber: string): Promise<AuthUser> {
  const data = await request<{ success: boolean; data: { user: AuthUser } }>(`/api/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify({ phoneNumber }),
  });
  return data.data.user;
}

// Profile: authenticated password change (requires the current password)
export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  const refreshToken = storage.get(REFRESH_KEY) ?? getCookie(REFRESH_KEY);
  await request('/api/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword, refreshToken }),
  });
}

// ─── Drops ────────────────────────────────────────────────────────────────────
// The /api/drops READ endpoints are public: the backend serves active drops (and
// their items) to anonymous callers and hides upcoming/hidden/ended drops
// server-side (see dropController visibility guards). No token is needed or sent
// — the storefront must never hold an admin credential.
async function dropsRequest<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? `Request failed: ${res.status}`);
  return data as T;
}

export async function fetchDrops(status?: string): Promise<Drop[]> {
  const q = status ? `?status=${status}` : '';
  const data = await dropsRequest<ApiList<Drop>>(`/api/drops${q}`);
  return data.data;
}

/** Visible homepage banners, sorted by order ascending. */
export async function fetchBanners(): Promise<Banner[]> {
  const data = await dropsRequest<ApiList<Banner>>('/api/banners');
  return (data.data ?? []).slice().sort((a, b) => a.order - b.order);
}

export async function fetchDropById(id: string): Promise<Drop> {
  const data = await dropsRequest<ApiSingle<Drop>>(`/api/drops/${id}`);
  return data.data;
}

export async function fetchDropItems(dropId: string): Promise<Item[]> {
  const data = await dropsRequest<ApiList<Item>>(`/api/drops/${dropId}/items`);
  return data.data;
}

export interface ItemsPage {
  items: Item[];
  totalCount: number;
}

/** Paginated, status-filtered slice of a drop's items — for the drop detail
 *  page's "Load more" grid. `limit` is the full count wanted so far (1..N),
 *  not a page size — see usePaginatedItems. */
export async function fetchDropItemsPage(dropId: string, itemStatus: string, limit: number): Promise<ItemsPage> {
  const q = new URLSearchParams({ itemStatus, page: '1', limit: String(limit) }).toString();
  const data = await dropsRequest<ApiList<Item>>(`/api/drops/${dropId}/items?${q}`);
  return { items: data.data, totalCount: data.pagination?.totalCount ?? data.data.length };
}

// ─── Items ────────────────────────────────────────────────────────────────────

export async function fetchItems(params?: Record<string, string>): Promise<Item[]> {
  const q = params ? '?' + new URLSearchParams(params).toString() : '';
  const data = await request<ApiList<Item>>(`/api/items${q}`);
  return data.data;
}

/** Paginated slice of the general catalog — for the "new arrivals" grid's
 *  "Load more". `limit` is the full count wanted so far, not a page size. */
export async function fetchItemsPage(params: Record<string, string> | undefined, limit: number): Promise<ItemsPage> {
  const q = new URLSearchParams({ ...(params ?? {}), page: '1', limit: String(limit) }).toString();
  const data = await request<ApiList<Item>>(`/api/items?${q}`);
  return { items: data.data, totalCount: data.pagination?.totalCount ?? data.data.length };
}

export async function fetchItemById(id: string): Promise<Item> {
  const data = await request<ApiSingle<Item>>(`/api/items/${id}`);
  return data.data;
}

// ─── Email verification (OTP) ─────────────────────────────────────────────────

// Returns alreadyVerified: true when the email completed OTP verification in
// the past — the caller can skip the code step entirely.
export async function requestEmailOtp(email: string): Promise<{ alreadyVerified: boolean }> {
  const data = await request<{ success: boolean; alreadyVerified?: boolean }>(
    '/api/email-verification/request',
    { method: 'POST', body: JSON.stringify({ email }) },
  );
  return { alreadyVerified: !!data.alreadyVerified };
}

export async function confirmEmailOtp(email: string, otp: string): Promise<void> {
  await request('/api/email-verification/confirm', {
    method: 'POST',
    body: JSON.stringify({ email, otp }),
  });
}

// Cheap, pollable check — does not send anything or touch the send rate limit.
// Used to detect that the user verified via the emailed link in another tab.
export async function checkEmailVerified(email: string): Promise<boolean> {
  const data = await request<{ success: boolean; verified: boolean }>(
    `/api/email-verification/status?email=${encodeURIComponent(email)}`,
  );
  return !!data.verified;
}

// ─── Pricing estimator ──────────────────────────────────────────────────────
// Same Pricing 3.0 logic as erlume's internal AI pricing tool. Photos are
// optional — if provided, AI auto-fills brand/model/condition hints; the
// customer can still edit everything before getting an estimate.

export interface BagIdentification {
  brand: string;
  model: string;
  size: string;
  material: string;
  color: string;
  confidence: 'high' | 'medium' | 'low';
  notes: string;
  brandTier: 'ultra' | 'premium' | 'accessible' | 'highstreet';
}

// Multipart upload — bypasses the JSON-only request() helper, same pattern
// as the drops token fetch below.
export async function identifyBagPhotos(
  photos: File[],
  hints?: { brand?: string; model?: string },
): Promise<BagIdentification> {
  const formData = new FormData();
  photos.forEach(photo => formData.append('photos', photo));
  if (hints?.brand) formData.append('brand', hints.brand);
  if (hints?.model) formData.append('model', hints.model);

  const res = await fetch(`${BASE_URL}/api/pricing-estimator/identify`, {
    method: 'POST',
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? `Request failed: ${res.status}`);
  return data as BagIdentification;
}

export type BagCondition = 'like-new' | 'gently-used' | 'fair-worn';
export type PickupMethod = 'dropoff' | 'own-driver' | 'third-party';

export interface EstimateBagPriceInput {
  brand: string;
  condition: BagCondition;
  originalPrice: number;
  yearPurchased?: number;
  pickupFee: number;
  model?: string;
  size?: string;
  material?: string;
  color?: string;
}

export interface EstimateBagPriceResult {
  listingPrice: number;
  sellerPayout: number;
  erlumeCut: number;
  pickupFee: number;
  accept: boolean;
  usingComps: boolean;
}

export async function estimateBagPrice(input: EstimateBagPriceInput): Promise<EstimateBagPriceResult> {
  const data = await request<{ success: boolean } & EstimateBagPriceResult>('/api/pricing-estimator/estimate', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return data;
}

// ─── Newsletter ───────────────────────────────────────────────────────────────

export async function subscribeNewsletter(email: string): Promise<void> {
  await request('/api/newsletter', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function unsubscribeNewsletter(email: string): Promise<void> {
  await request(`/api/newsletter/${encodeURIComponent(email)}`, { method: 'DELETE' });
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
  const data = await request<{ success: boolean; discountPercentage: number | string; discountAmount?: number | string; finalTotal?: number | string }>(
    '/api/discount-codes/validate',
    { method: 'POST', body: JSON.stringify({ code, orderTotal: orderTotal?.toString() }) },
  );
  // Backend returns the amounts as fixed-decimal strings — coerce so callers can
  // safely do arithmetic and .toFixed() on them.
  return {
    discountPercentage: Number(data.discountPercentage) || 0,
    discountAmount: Number(data.discountAmount ?? 0) || 0,
    finalTotal: Number(data.finalTotal ?? 0) || 0,
  };
}

// ─── Kuwait geographic data (governorate → cities) ────────────────────────────
// Reuses the backend enum endpoint so the app never hardcodes the list. Returns
// the same shape as the static src/lib/kuwait.ts fallback: { [governorate]: string[] }.
export async function fetchGovernorateCities(): Promise<Record<string, string[]>> {
  const res = await request<{
    success: boolean;
    // Backend shape: each governorate maps to { governorate, cities: [{label, value}] }.
    data: Record<string, { governorate: string; cities: { label: string; value: string }[] }>;
  }>('/api/enums/kuwaitGovernorateCities');
  const map: Record<string, string[]> = {};
  for (const [gov, entry] of Object.entries(res.data ?? {})) {
    map[gov] = (entry?.cities ?? []).map((c) => c.value);
  }
  return map;
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
    avenue?: string;
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

// Explicitly cancel a pending order — releases the reserved item immediately.
// Tolerates empty / non-JSON responses; callers still swallow errors as a fallback.
export async function cancelOrder(orderId: string): Promise<void> {
  const token = await getAccessToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}/api/orders/${orderId}/cancel`, {
    method: 'POST',
    headers,
  });

  if (res.ok || res.status === 404 || res.status === 409) return;

  let message = `Request failed: ${res.status}`;
  try {
    const data = await res.json();
    if (data?.error) message = data.error;
  } catch { /* non-JSON body */ }
  const error = new Error(message);
  (error as any).status = res.status;
  throw error;
}

// Signed-in checkout: switch the pending order to a different shipping address
export async function updateOrderShippingAddress(
  orderId: string,
  payload: {
    name: string;
    shippingAddress: { street: string; city: string; block: string; governorate: string; house: string; flat?: string; avenue?: string };
  },
): Promise<void> {
  await request(`/api/orders/${orderId}/shipping-address`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

// Step 2 — get a MyFatoorah embedded session for the order.
// The backend recomputes the amount server-side and re-validates the discount
// CODE against the DB (the client never dictates the discount rate); we only
// receive the sessionId and the server-computed amount.
export async function initiatePayment(
  orderId: string,
  discountCode?: string,
): Promise<{ sessionId: string; amount: number }> {
  return request('/api/payments/initiate', {
    method: 'POST',
    body: JSON.stringify({ orderId, discountCode: discountCode || undefined }),
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
