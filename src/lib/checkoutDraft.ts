// Checkout form draft.
//
// The checkout fields live in React state, so any full-page navigation wipes them:
// the hosted payment redirect (KNET / 3-D Secure) and coming back with "Try again",
// or a reload. We keep the last version in sessionStorage — tab-scoped, never sent
// to the server, gone when the tab closes — and clear it once the order is paid.

const DRAFT_KEY = 'erlume_checkout_draft';

export interface CheckoutDraft {
  guestEmail: string;
  guestPhone: string;
  firstName: string;
  lastName: string;
  governorate: string;
  area: string;
  block: string;
  street: string;
  houseNumber: string;
  avenue: string;
  flat: string;
  discountCode: string;
  appliedDiscountCode: string;
  // Signed-in one-off delivery address (the order already holds it server-side)
  customAddress: {
    name: string;
    shippingAddress: {
      street: string;
      city: string;
      block: string;
      governorate: string;
      house: string;
      avenue?: string;
      flat?: string;
    };
  } | null;
}

export function readCheckoutDraft(): CheckoutDraft | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as CheckoutDraft) : null;
  } catch {
    return null; // corrupted or blocked storage — start with an empty form
  }
}

export function writeCheckoutDraft(draft: CheckoutDraft): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch { /* quota / private mode — the draft simply won't persist */ }
}

export function clearCheckoutDraft(): void {
  if (typeof window === 'undefined') return;
  try { window.sessionStorage.removeItem(DRAFT_KEY); } catch { /* noop */ }
}
