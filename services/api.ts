import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

// Clear any stale tokens on module load so expired sessions don't
// trigger failed refresh loops on first request
clearTokens().catch(() => {});

// ─── Token storage ────────────────────────────────────────────────────────────

const TOKEN_KEY = 'erlume_access_token';
const REFRESH_KEY = 'erlume_refresh_token';

// Cookie helper functions
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null; // Not in browser
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const token = parts.pop()?.split(';').shift() || null;
    console.log(`[API] getCookie(${name}):`, token ? 'FOUND' : 'NOT FOUND');
    return token;
  }
  console.log(`[API] getCookie(${name}): NOT FOUND (no match)`);
  return null;
}

function setCookie(name: string, value: string, days: number = 30): void {
  if (typeof document === 'undefined') return; // Not in browser
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value}; ${expires}; path=/; SameSite=Lax`;
  console.log(`[API] setCookie(${name}): SET`);
}

function removeCookie(name: string): void {
  if (typeof document === 'undefined') return; // Not in browser
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
  console.log(`[API] removeCookie(${name}): REMOVED`);
}

export async function getAccessToken(): Promise<string | null> {
  // Try cookies first (web), fall back to AsyncStorage (mobile)
  const cookieToken = getCookie(TOKEN_KEY);
  if (cookieToken) return cookieToken;
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function setTokens(access: string, refresh: string): Promise<void> {
  // Store in both cookies (web) and AsyncStorage (mobile)
  setCookie(TOKEN_KEY, access, 7); // 7 days
  setCookie(REFRESH_KEY, refresh, 30); // 30 days
  await AsyncStorage.multiSet([[TOKEN_KEY, access], [REFRESH_KEY, refresh]]);
}

export async function clearTokens(): Promise<void> {
  // Clear from both cookies (web) and AsyncStorage (mobile)
  removeCookie(TOKEN_KEY);
  removeCookie(REFRESH_KEY);
  await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_KEY]);
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
    const refreshToken = await AsyncStorage.getItem(REFRESH_KEY);
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
  const refreshToken = await AsyncStorage.getItem(REFRESH_KEY);
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
  const data = await request<ApiSingle<AuthUser>>('/api/auth/me');
  return data.data;
}

// ─── Drops ────────────────────────────────────────────────────────────────────
// Drops require admin auth. The service silently authenticates with the read-only
// admin account on first call so the public browsing experience works without
// requiring the customer to be logged in.

let _dropTokenReady = false;

async function ensureDropToken(): Promise<void> {
  if (_dropTokenReady) return;
  try {
    await login(
      process.env.EXPO_PUBLIC_DROPS_EMAIL ?? 'admin@erlume.com',
      process.env.EXPO_PUBLIC_DROPS_PASSWORD ?? 'Erlume965$',
    );
    _dropTokenReady = true;
  } catch {
    // silently fail — drops will show empty rather than crash
  }
}

export async function fetchDrops(status?: string): Promise<Drop[]> {
  await ensureDropToken();
  const q = status ? `?status=${status}` : '';
  const data = await request<ApiList<Drop>>(`/api/drops${q}`);
  return data.data;
}

export async function fetchDropById(id: string): Promise<Drop> {
  await ensureDropToken();
  const data = await request<ApiSingle<Drop>>(`/api/drops/${id}`);
  return data.data;
}

export async function fetchDropItems(dropId: string): Promise<Item[]> {
  await ensureDropToken();
  const data = await request<ApiList<Item>>(`/api/drops/${dropId}/items`);
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
