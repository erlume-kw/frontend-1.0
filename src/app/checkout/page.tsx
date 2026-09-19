'use client';

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import {
  validateDiscountCode,
  getAccessToken,
  getMe,
  createOrder,
  cancelOrder,
  initiatePayment,
  confirmPayment,
  requestEmailOtp,
  checkEmailVerified,
  updateOrderShippingAddress,
  AuthUser,
} from '@/services/api';
import MyFatoorahEmbed, { MFWidgetResult } from '@/components/checkout/MyFatoorahEmbed';
import CheckoutSessionModal from '@/components/CheckoutSessionModal';
import LeaveCheckoutModal from '@/components/LeaveCheckoutModal';
import ErrorModal from '@/components/ErrorModal';
import VerifyEmailModal from '@/components/VerifyEmailModal';
import SiteHeader from '@/components/layout/SiteHeader';
import PageLayout from '@/components/layout/PageLayout';
import SideMenu from '@/components/layout/SideMenu';
import MaxWidthContainer from '@/components/layout/MaxWidthContainer';
import { useIsDesktop } from '@/lib/useIsDesktop';
import SelectField from '@/components/ui/SelectField';
import { useKuwaitAreas } from '@/lib/useKuwaitAreas';
import { clearCheckoutDraft, readCheckoutDraft, writeCheckoutDraft } from '@/lib/checkoutDraft';

// Payment slot phases — the MyFatoorah embedded widget carries the actual
// payment methods (KNET / cards / Apple Pay / Google Pay); there is no PAY NOW.
type PaymentPhase = 'idle' | 'initiating' | 'paying' | 'verifying' | 'success' | 'failed';

const inputClass =
  'h-[52px] w-full border-0 bg-lightGrey px-[11px] font-dm text-[14px] text-black outline-none placeholder:text-muted';

// ─── Pending-order persistence ─────────────────────────────────────────────────
// Refreshing the checkout page must NOT mint a new order. We remember the pending
// orderId (scoped to the exact set of cart items) in sessionStorage and reuse it,
// so the same order/reservation survives reloads within the session. If the stored
// order is no longer payable (paid, cancelled, or released by the 5-min sweep) the
// backend answers 409/404 on initiate and we transparently create a fresh one.
const PENDING_ORDER_KEY = 'erlume_pending_order';

function readStoredOrder(signature: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(PENDING_ORDER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { orderId?: string; sig?: string };
    if (parsed.orderId && parsed.sig === signature) return parsed.orderId;
    // Cart changed since the order was created — that order is stale.
    window.sessionStorage.removeItem(PENDING_ORDER_KEY);
  } catch { /* corrupted storage — ignore */ }
  return null;
}

function storeOrder(orderId: string, signature: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(PENDING_ORDER_KEY, JSON.stringify({ orderId, sig: signature }));
  } catch { /* quota / private mode — reuse simply won't persist */ }
}

function clearStoredOrder(): void {
  if (typeof window === 'undefined') return;
  try { window.sessionStorage.removeItem(PENDING_ORDER_KEY); } catch { /* noop */ }
}


// ─── Session keepalive constants ───────────────────────────────────────────────
const SESSION_MS = 5 * 60 * 1000; // 5 minutes in paying state → show prompt
const EXTENSION_S = 60;            // 1-minute countdown window in the prompt

function hasActiveReservation(orderId: string | null, phase: PaymentPhase): boolean {
  return !!orderId && (phase === 'paying' || phase === 'failed' || phase === 'initiating');
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const isDesktop = useIsDesktop();
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const { areas, governorates } = useKuwaitAreas();

  // Auth state — default is signed OUT; only a stored user session flips it
  const [authChecked, setAuthChecked] = useState(false);
  const [authLoadError, setAuthLoadError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<AuthUser | null>(null);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Guest contact
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');

  // Name + address fields (guest checkout, or signed-in "different address")
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [governorate, setGovernorate] = useState('');
  const [area, setArea] = useState('');
  const [block, setBlock] = useState('');
  const [street, setStreet] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [avenue, setAvenue] = useState('');
  const [flat, setFlat] = useState('');

  // Signed-in address selection: profile address by default, or a one-off address
  const [editingAddress, setEditingAddress] = useState(false);
  const [customAddress, setCustomAddress] = useState<{
    name: string;
    shippingAddress: { street: string; city: string; block: string; governorate: string; house: string; avenue?: string; flat?: string };
  } | null>(null);
  const [addressSaving, setAddressSaving] = useState(false);
  const [addressError, setAddressError] = useState('');

  // Guest email verification popup
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  // The address the guest has verified — verification only counts while the field still matches it
  const [verifiedEmail, setVerifiedEmail] = useState('');
  const normalizedGuestEmail = guestEmail.trim().toLowerCase();
  const guestEmailVerified = !!normalizedGuestEmail && verifiedEmail === normalizedGuestEmail;

  // Payment flow
  const [phase, setPhase] = useState<PaymentPhase>('idle');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [payError, setPayError] = useState('');
  const autoStartedRef = useRef(false);

  // Session keepalive — refs for stable access inside timers
  const orderIdRef = useRef<string | null>(null);
  const phaseRef = useRef<PaymentPhase>('idle');
  const pendingNavUrlRef = useRef<string | null>(null);
  const sessionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const extCountRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cancelCheckoutRef = useRef<(targetUrl?: string) => void>(() => {});
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [extSeconds, setExtSeconds] = useState(EXTENSION_S);
  const [isExtending, setIsExtending] = useState(false);

  // Order summary
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscountCode, setAppliedDiscountCode] = useState(''); // only a validated code is sent to payment
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountError, setDiscountError] = useState('');
  const { items: cartItems, subtotal, clear: clearCart } = useCart();
  const total = Math.max(0, subtotal - discountAmount);

  const activeCartItems = cartItems.filter(i => !i.isSold);

  // Stable fingerprint of the current cart — a stored order is only reusable while
  // the exact set of items is unchanged.
  const cartSignature = useMemo(
    () => activeCartItems.map(i => i.id).sort().join(','),
    [activeCartItems],
  );

  // ─── Form draft (survives redirects) ─────────────────────────────────────────
  // Restore what the buyer had typed before a redirect/reload wiped the page, and
  // keep saving it. `draftReady` gates the auto-start and the saving so neither
  // runs against the empty initial state.
  const [draftReady, setDraftReady] = useState(false);
  const pendingDiscountRef = useRef('');

  useEffect(() => {
    const d = readCheckoutDraft();
    if (d) {
      setGuestEmail(d.guestEmail ?? '');
      setGuestPhone(d.guestPhone ?? '');
      setFirstName(d.firstName ?? '');
      setLastName(d.lastName ?? '');
      setGovernorate(d.governorate ?? '');
      setArea(d.area ?? '');
      setBlock(d.block ?? '');
      setStreet(d.street ?? '');
      setHouseNumber(d.houseNumber ?? '');
      setAvenue(d.avenue ?? '');
      setFlat(d.flat ?? '');
      setDiscountCode(d.discountCode ?? '');
      setCustomAddress(d.customAddress ?? null);
      pendingDiscountRef.current = d.appliedDiscountCode ?? '';
    }
    if (!pendingDiscountRef.current) setDraftReady(true);
  }, []);

  // A restored discount is re-checked once the cart total is known (the cart loads
  // from local storage after the first render); a code that is no longer valid is
  // simply dropped.
  useEffect(() => {
    const code = pendingDiscountRef.current;
    if (!code || subtotal <= 0) return;
    pendingDiscountRef.current = '';
    validateDiscountCode(code, subtotal)
      .then(result => {
        setDiscountAmount(result.discountAmount);
        setAppliedDiscountCode(code);
      })
      .catch(() => { /* stale code — leave it unapplied */ })
      .finally(() => setDraftReady(true));
  }, [subtotal]);

  useEffect(() => {
    if (!draftReady || phase === 'success') return;
    writeCheckoutDraft({
      guestEmail, guestPhone, firstName, lastName, governorate, area, block, street,
      houseNumber, avenue, flat, discountCode, appliedDiscountCode, customAddress,
    });
  }, [
    draftReady, phase, guestEmail, guestPhone, firstName, lastName, governorate, area, block,
    street, houseNumber, avenue, flat, discountCode, appliedDiscountCode, customAddress,
  ]);

  // Keep refs in sync so timers always see the latest values
  useEffect(() => { orderIdRef.current = orderId; }, [orderId]);
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  // ─── Leave confirmation ───────────────────────────────────────────────────────
  // Do NOT patch history.pushState — that breaks Next.js App Router / RSC fetches.
  // Header, side menu, and the Back button call requestLeave instead.
  const requestLeave = useCallback((href?: string | null) => {
    if (!hasActiveReservation(orderIdRef.current, phaseRef.current)) return true;
    pendingNavUrlRef.current = href ?? null;
    setShowLeaveDialog(true);
    return false;
  }, []);

  // Warn on tab close / refresh while a reservation is live (browser-native dialog).
  useEffect(() => {
    if (!hasActiveReservation(orderId, phase)) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [orderId, phase]);

  // ─── Auth check ──────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = await getAccessToken();
        if (!token) {
          if (!cancelled) { setIsLoggedIn(false); setUserData(null); setAuthChecked(true); }
          return;
        }
        const user = await getMe();
        if (!cancelled) { setIsLoggedIn(true); setUserData(user); setAuthChecked(true); }
      } catch (e: any) {
        if (!cancelled) {
          const status = e?.status as number | undefined;
          if (status !== undefined && status >= 500) {
            // Genuine backend fault (5xx) — surface it so the user can retry
            // rather than silently appearing as a guest.
            setAuthLoadError('Unable to load your account. Please refresh the page.');
          } else {
            // No status (network error / fetch failed), 4xx auth errors — fall
            // back to guest checkout so the user can still complete their order.
            setIsLoggedIn(false); setUserData(null);
          }
          setAuthChecked(true);
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // ─── Payment flow ────────────────────────────────────────────────────────────
  // Sequence: create order (backend reserves items, order = pending) → request
  // MyFatoorah session → embedded widget renders under the order summary.
  // The order is only confirmed after the BACKEND verifies the payment.

  const startPayment = useCallback(async (payload: Parameters<typeof createOrder>[0]) => {
    setPayError('');
    setPhase('initiating');
    // Reuse an order already tied to this session/cart (in-memory, then sessionStorage)
    // so a page refresh never creates a second order for the same items.
    let currentOrderId = orderId ?? readStoredOrder(cartSignature);
    try {
      if (currentOrderId) {
        setOrderId(currentOrderId);
        try {
          const session = await initiatePayment(currentOrderId, appliedDiscountCode || undefined);
          setSessionId(session.sessionId);
          setPhase('paying');
          storeOrder(currentOrderId, cartSignature);
          return;
        } catch (e: any) {
          // 409 = order no longer awaiting payment, 404 = swept/deleted, 5xx = bad
          // server state on the stored order — fall through and create a fresh order.
          // Any other error (network, 4xx client errors) is a real failure.
          const status = e?.status as number | undefined;
          const isRecoverable = status === 409 || status === 404 || (status !== undefined && status >= 500);
          if (!isRecoverable) throw e;
          clearStoredOrder();
          currentOrderId = null;
          setOrderId(null);
        }
      }

      // No reusable order — create one and remember it for subsequent refreshes.
      const order = await createOrder(payload);
      currentOrderId = order._id;
      setOrderId(currentOrderId);
      storeOrder(currentOrderId, cartSignature);
      const session = await initiatePayment(currentOrderId, appliedDiscountCode || undefined);
      setSessionId(session.sessionId);
      setPhase('paying');
    } catch (e: any) {
      setPayError(e.message ?? 'Could not start payment. Please try again.');
      setPhase(currentOrderId ? 'failed' : 'idle');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, appliedDiscountCode, cartSignature]);

  // Signed-in: the order is initiated automatically on arrival (profile address
  // by default) and the widget appears with no button press.
  useEffect(() => {
    if (!authChecked || !isLoggedIn || !userData?._id || !draftReady) return;
    if (autoStartedRef.current || activeCartItems.length === 0) return;
    autoStartedRef.current = true;
    startPayment({
      user_id: userData._id,
      orderItems: activeCartItems.map(i => ({ item_id: i.id, quantity: 1 })),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authChecked, isLoggedIn, userData, draftReady]);

  const handleWidgetResult = async (result: MFWidgetResult) => {
    // Hosted methods (KNET) navigate the whole page away; this callback only
    // fires for embedded methods (card / Apple Pay / Google Pay).
    if (!result.isSuccess && !result.paymentData) {
      setPayError(result.errorMessage || 'Payment could not be completed.');
      setPhase('failed');
      return;
    }
    if (!result.paymentData || !orderId) return;

    setPhase('verifying');
    try {
      const verdict = await confirmPayment({
        orderId,
        encryptedPaymentData: result.paymentData,
      });
      if (verdict.success) {
        clearCart();
        clearStoredOrder();
        clearCheckoutDraft();
        setPhase('success');
      } else {
        setPayError(verdict.message || 'Payment was not successful.');
        setPhase('failed');
      }
    } catch (e: any) {
      setPayError(e.message ?? 'Payment verification failed.');
      setPhase('failed');
    }
  };

  // A sessionId is single-use — retrying requests a fresh session for the SAME order
  const handleRetry = async () => {
    if (!orderId) { setPhase('idle'); return; }
    setPayError('');
    setPhase('initiating');
    try {
      const session = await initiatePayment(orderId, appliedDiscountCode || undefined);
      setSessionId(session.sessionId);
      setPhase('paying');
    } catch (e: any) {
      // The pending order expired/was swept — drop it and let the flow rebuild one.
      if (e?.status === 409 || e?.status === 404) { clearStoredOrder(); setOrderId(null); }
      setPayError(e.message ?? 'Could not restart payment.');
      setPhase('failed');
    }
  };

  // ─── Session keepalive ────────────────────────────────────────────────────────
  // Cancels the current order, clears stored state, and navigates away.
  // Only called on explicit leave / session timeout — never on unmount.
  const handleCancelCheckout = useCallback((targetUrl = '/') => {
    if (sessionTimerRef.current) { clearTimeout(sessionTimerRef.current); sessionTimerRef.current = null; }
    if (extCountRef.current) { clearInterval(extCountRef.current); extCountRef.current = null; }
    setShowSessionModal(false);
    setShowLeaveDialog(false);
    const oid = orderIdRef.current;
    phaseRef.current = 'idle';
    orderIdRef.current = null;
    if (oid) {
      cancelOrder(oid).catch(() => {}); // fire-and-forget; backend sweep is the fallback
      clearStoredOrder();
    }
    setOrderId(null);
    setSessionId(null);
    setPhase('idle');
    router.push(targetUrl);
  }, [router]);

  const handleConfirmLeave = useCallback(() => {
    const target = pendingNavUrlRef.current ?? '/';
    pendingNavUrlRef.current = null;
    handleCancelCheckout(target);
  }, [handleCancelCheckout]);

  useEffect(() => { cancelCheckoutRef.current = handleCancelCheckout; }, [handleCancelCheckout]);

  // Starts (or restarts) the 5-minute session timer.
  const startSessionTimer = useCallback(() => {
    if (sessionTimerRef.current) clearTimeout(sessionTimerRef.current);
    if (extCountRef.current) { clearInterval(extCountRef.current); extCountRef.current = null; }
    setShowSessionModal(false);

    sessionTimerRef.current = setTimeout(() => {
      sessionTimerRef.current = null;
      setShowSessionModal(true);
      setExtSeconds(EXTENSION_S);

      extCountRef.current = setInterval(() => {
        setExtSeconds(s => {
          if (s <= 1) {
            clearInterval(extCountRef.current!);
            extCountRef.current = null;
            setTimeout(() => cancelCheckoutRef.current(), 0);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }, SESSION_MS);
  }, []);

  useEffect(() => {
    if (phase === 'paying') {
      startSessionTimer();
    } else {
      if (sessionTimerRef.current) { clearTimeout(sessionTimerRef.current); sessionTimerRef.current = null; }
      if (extCountRef.current) { clearInterval(extCountRef.current); extCountRef.current = null; }
      setShowSessionModal(false);
    }
    return () => {
      if (sessionTimerRef.current) { clearTimeout(sessionTimerRef.current); sessionTimerRef.current = null; }
      if (extCountRef.current) { clearInterval(extCountRef.current); extCountRef.current = null; }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const handleExtendSession = async () => {
    if (!orderId) { handleCancelCheckout(); return; }
    setIsExtending(true);
    try {
      const session = await initiatePayment(orderId, appliedDiscountCode || undefined);
      setSessionId(session.sessionId);
      setIsExtending(false);
      startSessionTimer();
    } catch (e: any) {
      setIsExtending(false);
      const s = e?.status as number | undefined;
      if (s === 409 || s === 404 || (s !== undefined && s >= 500)) clearStoredOrder();
      handleCancelCheckout();
    }
  };

  // ─── Guest flow ──────────────────────────────────────────────────────────────
  const validateAddressFields = (newErrors: Record<string, string>) => {
    if (!governorate.trim()) newErrors.governorate = 'Governorate is required';
    if (!area.trim()) newErrors.area = 'Area is required';
    if (!block.trim()) newErrors.block = 'Block is required';
    if (!street.trim()) newErrors.street = 'Street is required';
    if (!houseNumber.trim()) newErrors.houseNumber = 'House number is required';
    return newErrors;
  };

  const validateGuestForm = () => {
    const newErrors: Record<string, string> = {};
    if (!guestEmail.trim()) newErrors.guestEmail = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) newErrors.guestEmail = 'Invalid email';
    else if (!guestEmailVerified) newErrors.guestEmail = 'Please verify your email before choosing a payment method';
    if (!guestPhone.trim()) newErrors.guestPhone = 'Phone number is required';
    validateAddressFields(newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Guests confirm their email with a code (own button next to the email field) before
  // they can pay. An email verified in the last day counts straight away; the backend
  // enforces this too.
  const isValidGuestEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail.trim());

  useEffect(() => {
    if (isLoggedIn || !isValidGuestEmail || guestEmailVerified) return;
    let cancelled = false;
    const t = setTimeout(async () => {
      try {
        if (await checkEmailVerified(guestEmail.trim()) && !cancelled) setVerifiedEmail(normalizedGuestEmail);
      } catch {
        // the Verify button still works
      }
    }, 500);
    return () => { cancelled = true; clearTimeout(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normalizedGuestEmail, isLoggedIn]);

  const handleVerifyEmail = async () => {
    if (!guestEmail.trim()) {
      setErrors(prev => ({ ...prev, guestEmail: 'Email is required' }));
      return;
    }
    if (!isValidGuestEmail) {
      setErrors(prev => ({ ...prev, guestEmail: 'Invalid email' }));
      return;
    }
    setSendingCode(true);
    try {
      const { alreadyVerified } = await requestEmailOtp(guestEmail.trim());
      if (alreadyVerified) setVerifiedEmail(normalizedGuestEmail);
      else setShowVerifyModal(true);
    } catch (e: any) {
      setPayError(e?.message ?? 'Could not send the verification code. Please try again.');
    } finally {
      setSendingCode(false);
    }
  };

  const handleGuestEmailVerified = () => {
    setShowVerifyModal(false);
    setVerifiedEmail(normalizedGuestEmail);
    setErrors(prev => ({ ...prev, guestEmail: '' }));
  };

  const handleChoosePaymentMethod = () => {
    if (!validateGuestForm()) return;
    if (activeCartItems.length === 0) {
      setPayError('Your cart is empty.');
      return;
    }
    startGuestPayment();
  };

  const startGuestPayment = () => {
    startPayment({
      guestInfo: {
        name: `${firstName} ${lastName}`.trim() || 'Guest',
        emailAddress: guestEmail.trim(),
        phoneNumber: guestPhone.trim(),
        shippingAddress: {
          street,
          city: area,
          block,
          governorate,
          house: houseNumber,
          ...(avenue.trim() ? { avenue: avenue.trim() } : {}),
          ...(flat.trim() ? { flat: flat.trim() } : {}),
        },
      },
      orderItems: activeCartItems.map(i => ({ item_id: i.id, quantity: 1 })),
    });
  };

  // ─── Signed-in address switch ────────────────────────────────────────────────
  const handleSaveNewAddress = async () => {
    const newErrors = validateAddressFields({});
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    if (!orderId) { setAddressError('Order not ready yet — one moment.'); return; }

    setAddressSaving(true);
    setAddressError('');
    const payload = {
      name: `${firstName} ${lastName}`.trim() || userData?.emailAddress || 'Account customer',
      shippingAddress: {
        street,
        city: area,
        block,
        governorate,
        house: houseNumber,
        ...(avenue.trim() ? { avenue: avenue.trim() } : {}),
        ...(flat.trim() ? { flat: flat.trim() } : {}),
      },
    };
    try {
      await updateOrderShippingAddress(orderId, payload);
      setCustomAddress(payload);
      setEditingAddress(false);
    } catch (e: any) {
      setAddressError(e.message ?? 'Could not update the address.');
    } finally {
      setAddressSaving(false);
    }
  };

  const handleUseProfileAddress = async () => {
    if (!orderId || !userData?.address) { setEditingAddress(false); setCustomAddress(null); return; }
    setAddressSaving(true);
    setAddressError('');
    try {
      await updateOrderShippingAddress(orderId, {
        name: userData.emailAddress ?? 'Account customer',
        shippingAddress: {
          street: userData.address.street ?? '',
          city: userData.address.city ?? '',
          block: userData.address.block ?? '',
          governorate: userData.address.governorate ?? '',
          house: userData.address.house ?? '',
          ...(userData.address.avenue ? { avenue: userData.address.avenue } : {}),
          ...(userData.address.flat ? { flat: userData.address.flat } : {}),
        },
      });
      setCustomAddress(null);
      setEditingAddress(false);
    } catch (e: any) {
      setAddressError(e.message ?? 'Could not update the address.');
    } finally {
      setAddressSaving(false);
    }
  };

  // For signed-in checkout the MyFatoorah session is created on arrival (before a
  // code is typed), so applying a discount must RE-INITIATE that session or the
  // widget keeps charging the pre-discount total. This re-prices the live session
  // to `code`; it no-ops when there's no session yet (guest flow — the code is
  // sent when the user first starts payment) so it never double-creates an order.
  const reprice = useCallback(async (code: string) => {
    if (!orderId) return;
    if (phaseRef.current !== 'paying' && phaseRef.current !== 'failed') return;
    setPhase('initiating');
    try {
      const session = await initiatePayment(orderId, code || undefined);
      setSessionId(session.sessionId);
      setPhase('paying');
    } catch (e: any) {
      if (e?.status === 409 || e?.status === 404) { clearStoredOrder(); setOrderId(null); }
      setPayError(e.message ?? 'Could not update the discount. Please try again.');
      setPhase('failed');
    }
  }, [orderId]);

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return;
    try {
      const result = await validateDiscountCode(discountCode.trim(), subtotal);
      setDiscountAmount(result.discountAmount);
      setAppliedDiscountCode(discountCode.trim());
      setDiscountError('');
      // Push the discount into the live payment session so the charge matches.
      await reprice(discountCode.trim());
    } catch (e: any) {
      setDiscountError(e.message ?? 'Invalid discount code');
      setDiscountAmount(0);
      setAppliedDiscountCode('');
    }
  };

  const ErrorText = ({ field }: { field: string }) =>
    errors[field] ? <span className="mt-1 block font-dm text-[13px] text-error">{errors[field]}</span> : null;

  const FormSection = ({ title }: { title: string }) => (
    <span className={`mb-1 block font-clash font-semibold text-black ${isDesktop ? 'text-[21px]' : 'text-[18px]'}`}>
      {title}
    </span>
  );

  const handleGovernorateSelect = (gov: string) => {
    setGovernorate(gov);
    setArea(''); // reset area when governorate changes
  };

  // ─── Shared address fields block ────────────────────────────────────────────
  const AddressFields = () => (
    <div className="flex flex-col gap-[14px]">
      {/* Country — Kuwait only */}
      <div className="flex h-[52px] flex-row items-center justify-between bg-[#E8E8E8] px-[11px]">
        <span className="flex-1 font-dm text-[14px] text-black">Kuwait</span>
        <span className="rotate-90 font-clash text-[18px] text-muted">›</span>
      </div>

      {/* Name row */}
      <div className={isDesktop ? 'flex flex-row gap-[14px]' : 'flex flex-col gap-[14px]'}>
        <input className={`${inputClass} ${isDesktop ? 'flex-1' : ''}`} placeholder="First name" value={firstName} onChange={e => setFirstName(e.target.value)} />
        <input className={`${inputClass} ${isDesktop ? 'flex-1' : ''}`} placeholder="Last name" value={lastName} onChange={e => setLastName(e.target.value)} />
      </div>

      {/* Governorate */}
      <div>
        <SelectField
          value={governorate}
          placeholder="Governorate"
          options={governorates}
          onSelect={handleGovernorateSelect}
        />
        <ErrorText field="governorate" />
      </div>

      {/* Area — filtered by governorate */}
      <div>
        <SelectField
          value={area}
          placeholder={governorate ? 'Area' : 'Select governorate first'}
          options={governorate ? (areas[governorate] ?? []) : []}
          onSelect={setArea}
          disabled={!governorate}
        />
        <ErrorText field="area" />
      </div>

      {/* Block / Street */}
      <div className={isDesktop ? 'flex flex-row gap-[14px]' : 'flex flex-col gap-[14px]'}>
        <input
          className={`${inputClass} ${isDesktop ? 'flex-1' : ''}`}
          placeholder="Block"
          value={block}
          onChange={e => setBlock(e.target.value.replace(/[^0-9]/g, ''))}
          inputMode="numeric"
        />
        <input
          className={`${inputClass} ${isDesktop ? 'flex-[2]' : ''}`}
          placeholder="Street"
          value={street}
          onChange={e => setStreet(e.target.value)}
        />
      </div>
      <ErrorText field="block" />
      <ErrorText field="street" />

      {/* House / Avenue */}
      <div className={isDesktop ? 'flex flex-row gap-[14px]' : 'flex flex-col gap-[14px]'}>
        <input
          className={`${inputClass} ${isDesktop ? 'flex-1' : ''}`}
          placeholder="House"
          value={houseNumber}
          onChange={e => setHouseNumber(e.target.value.replace(/[^0-9]/g, ''))}
          inputMode="numeric"
        />
        <input
          className={`${inputClass} ${isDesktop ? 'flex-1' : ''}`}
          placeholder="Avenue (optional)"
          value={avenue}
          onChange={e => setAvenue(e.target.value.replace(/[^0-9]/g, ''))}
          inputMode="numeric"
        />
      </div>
      <ErrorText field="houseNumber" />

      {/* Flat / Apartment (optional) */}
      <input
        className={inputClass}
        placeholder="Flat / Apartment (optional)"
        value={flat}
        onChange={e => setFlat(e.target.value)}
      />
    </div>
  );

  // ─── Signed-in: profile address as a minimized card, or one-off address ─────
  const SignedInAddress = () => {
    const active = customAddress
      ? {
          title: customAddress.name,
          line: `${customAddress.shippingAddress.street}, Block ${customAddress.shippingAddress.block}, ${customAddress.shippingAddress.city}, ${customAddress.shippingAddress.governorate}, House ${customAddress.shippingAddress.house}`,
          label: 'One-off address',
        }
      : {
          title: userData?.emailAddress ?? 'Your account',
          line: userData?.address
            ? `${userData.address.street ?? ''}, Block ${userData.address.block ?? ''}, ${userData.address.city ?? ''}, ${userData.address.governorate ?? ''}, House ${userData.address.house ?? ''}`
            : 'No address saved on your profile',
          label: 'Profile address',
        };

    return (
      <div className="mb-7 flex flex-col gap-[14px]">
        <FormSection title="Delivery address" />

        {!editingAddress ? (
          <>
            <div className="flex flex-col gap-[6px] border border-border bg-white p-4">
              <div className="flex flex-row items-center justify-between">
                <span className="font-dm font-medium text-[12px] uppercase tracking-[0.8px] text-muted">{active.label}</span>
                <span className="bg-[rgba(197,112,93,0.12)] px-2 py-[3px]">
                  <span className="font-dm font-medium text-[11px] tracking-[0.8px] text-secondary">SELECTED</span>
                </span>
              </div>
              <span className="font-dm font-semibold text-[14px] text-black">{active.title}</span>
              <span className="font-dm text-[13px] leading-[19px] text-muted">{active.line}</span>
            </div>
            <button
              className="flex h-12 items-center justify-center border border-border bg-white"
              onClick={() => { setEditingAddress(true); setAddressError(''); }}
            >
              <span className="font-clash font-medium text-[13px] tracking-[1px] text-black">USE A DIFFERENT ADDRESS</span>
            </button>
            {customAddress && (
              <button className="flex items-center justify-center py-[6px]" onClick={handleUseProfileAddress} disabled={addressSaving}>
                <span className="font-dm text-[13px] text-secondary underline">
                  {addressSaving ? 'Switching…' : 'Switch back to profile address'}
                </span>
              </button>
            )}
          </>
        ) : (
          <>
            {AddressFields()}
            {!!addressError && <span className="font-dm text-[13px] text-error">{addressError}</span>}
            <button
              className={`flex h-12 items-center justify-center border border-secondary bg-secondary ${addressSaving ? 'opacity-60' : ''}`}
              onClick={handleSaveNewAddress}
              disabled={addressSaving}
            >
              <span className="font-clash font-medium text-[13px] tracking-[1px] text-white">
                {addressSaving ? 'SAVING…' : 'DELIVER TO THIS ADDRESS'}
              </span>
            </button>
            <button className="flex items-center justify-center py-[6px]" onClick={() => { setEditingAddress(false); setAddressError(''); }}>
              <span className="font-dm text-[13px] text-secondary underline">Keep the selected address</span>
            </button>
          </>
        )}
      </div>
    );
  };

  // ─── Form column ─────────────────────────────────────────────────────────────
  const CheckoutForm = () => (
    <div className={isDesktop ? 'max-w-[641px] flex-1 py-[38px]' : 'p-[21px]'}>
      {/* Back button — always visible; triggers the leave dialog when an order is active */}
      <button
        className="mb-6 flex flex-row items-center gap-2"
        onClick={() => {
          if (hasActiveReservation(orderId, phase)) {
            requestLeave('/cart');
          } else {
            router.back();
          }
        }}
      >
        <span className="font-clash font-medium text-[13px] uppercase tracking-[1px] text-muted">← Back</span>
      </button>

      {isLoggedIn ? (
        <>
          <div className="mb-7 flex flex-col gap-[14px]">
            <FormSection title="Checkout" />
            <span className="font-dm text-[14px] text-muted">
              Signed in as {userData?.emailAddress ?? 'your account'}
            </span>
          </div>
          {SignedInAddress()}
        </>
      ) : (
        <>
          {/* Guest checkout — with a route into the sign-in flow */}
          <div className="mb-7 flex flex-col gap-[14px]">
            <FormSection title="Guest checkout" />
            <span className="font-dm text-[14px] text-muted">
              Have an account?{' '}
              <button onClick={() => { if (requestLeave('/sign-in')) router.push('/sign-in'); }}>
                <span className="text-secondary underline">Sign in</span>
              </button>
            </span>
          </div>

          <div className="mb-7 flex flex-col gap-[14px]">
            <FormSection title="Contact information" />
            <div>
              <div className="flex flex-row">
                <input
                  className={`${inputClass} min-w-0 flex-1`}
                  placeholder="Email address"
                  value={guestEmail}
                  onChange={e => {
                    setGuestEmail(e.target.value);
                    if (errors.guestEmail) setErrors({ ...errors, guestEmail: '' });
                  }}
                  type="email"
                  autoCapitalize="none"
                />
                {guestEmailVerified ? (
                  <div className="flex h-[52px] items-center bg-lightGrey pr-[14px]">
                    <span className="font-dm text-[13px] font-medium text-[#2E7D4F]">✓ Verified</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    className={`h-[52px] shrink-0 bg-secondary px-6 ${sendingCode ? 'opacity-60' : ''}`}
                    onClick={handleVerifyEmail}
                    disabled={sendingCode}
                  >
                    <span className="font-clash font-medium text-[13px] uppercase tracking-[1.2px] text-white">
                      {sendingCode ? 'SENDING…' : 'VERIFY'}
                    </span>
                  </button>
                )}
              </div>
              <ErrorText field="guestEmail" />
            </div>
            <div>
              <input
                className={inputClass}
                placeholder="Phone number"
                value={guestPhone}
                onChange={e => {
                  setGuestPhone(e.target.value);
                  if (errors.guestPhone) setErrors({ ...errors, guestPhone: '' });
                }}
                type="tel"
              />
              <ErrorText field="guestPhone" />
            </div>
          </div>

          {/* Delivery */}
          <div className="mb-7 flex flex-col gap-[14px]">
            <FormSection title="Delivery" />
            <span className="mt-1 font-clash font-medium text-[16px] text-black">Delivery methods</span>
            <div className="overflow-hidden">
              <div className="flex flex-row items-center gap-3 bg-[#EFF5FF] px-4 py-[14px]">
                <span className="block h-[18px] w-[18px] rounded-full border border-primary bg-primary" />
                <div className="flex flex-col gap-[2px]">
                  <span className="font-dm text-[14px] text-black">Express</span>
                  <span className="font-dm text-[12px] text-muted">Delivery within Kuwait</span>
                </div>
              </div>
            </div>

            <span className="mt-1 font-clash font-medium text-[16px] text-black">Address</span>
            {AddressFields()}
          </div>
        </>
      )}
    </div>
  );

  // ─── Payment slot — lives under the order summary in all flows ──────────────
  const PaymentSlot = () => (
    <div className="mt-1 flex flex-col gap-3">
      {/* Placing the order IS the acceptance, so it has to be stated before the
          buyer commits. Opens in a new tab so an in-progress checkout is not
          lost by navigating away. The order records termsAcceptedAt and
          termsVersion server-side. */}
      {(phase === 'idle' || phase === 'initiating' || phase === 'paying') && (
        <span className="font-dm text-[13px] leading-[21px] text-muted">
          By placing this order you agree to our{' '}
          <a href="/terms" target="_blank" rel="noreferrer" className="text-secondary underline">
            Terms
          </a>{' '}
          and{' '}
          <a href="/returns" target="_blank" rel="noreferrer" className="text-secondary underline">
            Returns Policy
          </a>
          .
        </span>
      )}

      {phase === 'idle' && !isLoggedIn && (
        <button
          className="flex h-[60px] items-center justify-center bg-secondary"
          onClick={handleChoosePaymentMethod}
        >
          <span className="font-clash font-semibold text-[15px] uppercase tracking-[1.2px] text-white">
            CHOOSE A PAYMENT METHOD
          </span>
        </button>
      )}

      {(phase === 'idle' || phase === 'initiating') && isLoggedIn && (
        <div className="flex flex-col items-center gap-2 py-4">
          <span className="font-dm text-[14px] text-muted">Preparing secure payment…</span>
        </div>
      )}

      {phase === 'initiating' && !isLoggedIn && (
        <div className="flex h-[60px] items-center justify-center bg-secondary opacity-60">
          <span className="font-clash font-semibold text-[15px] uppercase tracking-[1.2px] text-white">
            PREPARING PAYMENT…
          </span>
        </div>
      )}

      {(phase === 'paying' || phase === 'verifying') && sessionId && (
        <>
          <span className="font-dm text-[14px] text-muted">All transactions are secure and encrypted</span>
          <MyFatoorahEmbed sessionId={sessionId} onResult={handleWidgetResult} />
          {phase === 'verifying' && (
            <div className="flex flex-col items-center gap-2 py-4">
              <span className="font-dm text-[14px] text-muted">Verifying your payment…</span>
            </div>
          )}
        </>
      )}

      {phase === 'failed' && (
        <button className="flex h-[60px] items-center justify-center bg-secondary" onClick={handleRetry}>
          <span className="font-clash font-semibold text-[15px] uppercase tracking-[1.2px] text-white">TRY AGAIN</span>
        </button>
      )}
    </div>
  );

  const OrderSummary = () => (
    <div className={isDesktop ? 'min-h-[600px] w-[582px] bg-lightGrey p-[38px]' : 'p-[21px]'}>
      <span className="mb-1 block font-clash font-semibold text-[18px] text-black">Order summary</span>

      {cartItems.map(item => (
        <div key={item.id} className="mb-1 flex flex-row justify-between py-1">
          <span className="mr-2 flex-1 truncate font-dm text-[13px] text-black">
            {item.brand} — {item.name}
          </span>
          <span className="font-dm font-semibold text-[13px] text-black">{item.price}</span>
        </div>
      ))}

      <div className="mb-4 mt-3 flex flex-row gap-[14px]">
        <input
          className={`${inputClass} flex-1 ${isDesktop ? 'bg-white' : ''}`}
          placeholder="Discount code"
          value={discountCode}
          onChange={e => {
            setDiscountCode(e.target.value);
            setDiscountError('');
            // editing invalidates a previously applied code until re-applied —
            // re-price the live session back to full so the charge stays honest
            if (appliedDiscountCode) { setAppliedDiscountCode(''); setDiscountAmount(0); void reprice(''); }
          }}
        />
        <button className="flex h-[52px] items-center justify-center bg-lightGrey px-4" onClick={handleApplyDiscount}>
          <span className="font-dm font-medium text-[14px] text-black">Apply</span>
        </button>
      </div>
      {!!discountError && <div className="mb-2 font-dm text-[13px] text-error">{discountError}</div>}
      {discountAmount > 0 && (
        <div className="mb-2 font-dm text-[13px] text-olive">Discount: -{discountAmount.toFixed(2)} KWD</div>
      )}

      {[
        { label: `Subtotal • ${cartItems.length} item${cartItems.length !== 1 ? 's' : ''}`, value: `${subtotal.toFixed(2)} KWD` },
        { label: 'Shipping', value: 'Free' },
      ].map(({ label, value }) => (
        <div key={label} className="flex flex-row justify-between py-[6px]">
          <span className="font-dm text-[14px] text-black">{label}</span>
          <span className="font-dm text-[14px] text-black">{value}</span>
        </div>
      ))}

      <div className="mb-4 flex flex-row justify-between py-3">
        <span className="font-dm font-semibold text-[16px] text-black">Total</span>
        <span className="font-dm font-semibold text-[16px] text-black">{total.toFixed(2)} KWD</span>
      </div>

      {/* MyFatoorah widget / payment CTA — under the summary on desktop,
          below it in the stacked mobile layout */}
      {PaymentSlot()}
    </div>
  );

  const SuccessPanel = () => (
    <div className="mx-auto flex w-full max-w-[641px] flex-col gap-4 p-[38px]">
      <span className="mt-6 text-center font-clash font-semibold text-[24px] text-black">
        Thank you — order confirmed!
      </span>
      <span className="text-center font-dm text-[15px] text-muted">
        Your payment was received and your order is being processed.
      </span>
      {orderId && (
        <span className="mb-3 text-center font-dm font-medium text-[13px] text-black">
          Order reference: {orderId}
        </span>
      )}
      <button className="flex h-[60px] items-center justify-center bg-secondary" onClick={() => router.push('/')}>
        <span className="font-clash font-semibold text-[15px] uppercase tracking-[1.2px] text-white">
          CONTINUE SHOPPING
        </span>
      </button>
    </div>
  );

  return (
    <PageLayout
      menu={<SideMenu visible={menuOpen} onClose={() => setMenuOpen(false)} onNavigate={requestLeave} />}
      header={<SiteHeader onMenuPress={() => setMenuOpen(true)} onNavigate={requestLeave} />}
    >
      <LeaveCheckoutModal
        visible={showLeaveDialog}
        onStay={() => { setShowLeaveDialog(false); pendingNavUrlRef.current = null; }}
        onLeave={handleConfirmLeave}
      />
      <CheckoutSessionModal
        visible={showSessionModal}
        secondsLeft={extSeconds}
        extending={isExtending}
        onExtend={handleExtendSession}
        onLeave={() => handleCancelCheckout()}
      />
      <ErrorModal
        visible={!!payError}
        message={payError}
        onClose={() => setPayError('')}
      />
      <VerifyEmailModal
        visible={showVerifyModal}
        email={guestEmail.trim()}
        onClose={() => setShowVerifyModal(false)}
        onVerified={handleGuestEmailVerified}
      />
      <MaxWidthContainer className={isDesktop ? 'px-16' : ''}>
        {phase === 'success' ? (
          SuccessPanel()
        ) : !authChecked ? (
          <div className="flex flex-col items-center py-20">
            <span className="font-dm text-[14px] text-muted">Loading…</span>
          </div>
        ) : authLoadError ? (
          <div className="flex flex-col items-center gap-4 py-20">
            <span className="font-dm text-[14px] text-error">{authLoadError}</span>
            <button
              className="flex h-[52px] items-center justify-center bg-secondary px-8"
              onClick={() => window.location.reload()}
            >
              <span className="font-clash font-medium text-[14px] uppercase tracking-[1.2px] text-white">Refresh</span>
            </button>
          </div>
        ) : isDesktop ? (
          <div className="flex flex-row items-start gap-10">
            {CheckoutForm()}
            {OrderSummary()}
          </div>
        ) : (
          <>
            {CheckoutForm()}
            {OrderSummary()}
          </>
        )}
      </MaxWidthContainer>
    </PageLayout>
  );
}
