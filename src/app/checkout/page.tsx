'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import {
  validateDiscountCode,
  getAccessToken,
  getMe,
  createOrder,
  initiatePayment,
  confirmPayment,
  updateOrderShippingAddress,
  AuthUser,
} from '@/services/api';
import MyFatoorahEmbed, { MFWidgetResult } from '@/components/checkout/MyFatoorahEmbed';
import SiteHeader from '@/components/layout/SiteHeader';
import PageLayout from '@/components/layout/PageLayout';
import SideMenu from '@/components/layout/SideMenu';
import MaxWidthContainer from '@/components/layout/MaxWidthContainer';
import { useIsDesktop } from '@/lib/useIsDesktop';
import SelectField from '@/components/ui/SelectField';
import { KUWAIT_AREAS, GOVERNORATES } from '@/lib/kuwait';

// Payment slot phases — the MyFatoorah embedded widget carries the actual
// payment methods (KNET / cards / Apple Pay / Google Pay); there is no PAY NOW.
type PaymentPhase = 'idle' | 'initiating' | 'paying' | 'verifying' | 'success' | 'failed';

const inputClass =
  'h-[52px] w-full border-0 bg-lightGrey px-[11px] font-dm text-[14px] text-black outline-none placeholder:text-muted';


// ─── Kuwait geographic data ────────────────────────────────────────────────────
// ─── Main page ─────────────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const isDesktop = useIsDesktop();
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  // Auth state — default is signed OUT; only a stored user session flips it
  const [authChecked, setAuthChecked] = useState(false);
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

  // Signed-in address selection: profile address by default, or a one-off address
  const [editingAddress, setEditingAddress] = useState(false);
  const [customAddress, setCustomAddress] = useState<{
    name: string;
    shippingAddress: { street: string; city: string; block: string; governorate: string; house: string };
  } | null>(null);
  const [addressSaving, setAddressSaving] = useState(false);
  const [addressError, setAddressError] = useState('');

  // Payment flow
  const [phase, setPhase] = useState<PaymentPhase>('idle');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [payError, setPayError] = useState('');
  const autoStartedRef = useRef(false);

  // Order summary
  const [discountCode, setDiscountCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountRate, setDiscountRate] = useState(0); // percentage, passed to backend
  const [discountError, setDiscountError] = useState('');
  const { items: cartItems, subtotal, clear: clearCart } = useCart();
  const total = Math.max(0, subtotal - discountAmount);

  const activeCartItems = cartItems.filter(i => !i.isSold);

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
      } catch {
        if (!cancelled) { setIsLoggedIn(false); setUserData(null); setAuthChecked(true); }
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
    try {
      // Reuse the pending order on retry — never create a new order per attempt
      let currentOrderId = orderId;
      if (!currentOrderId) {
        const order = await createOrder(payload);
        currentOrderId = order._id;
        setOrderId(currentOrderId);
      }
      const session = await initiatePayment(currentOrderId, discountRate || undefined);
      setSessionId(session.sessionId);
      setPhase('paying');
    } catch (e: any) {
      setPayError(e.message ?? 'Could not start payment. Please try again.');
      setPhase(orderId ? 'failed' : 'idle');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, discountRate]);

  // Signed-in: the order is initiated automatically on arrival (profile address
  // by default) and the widget appears with no button press.
  useEffect(() => {
    if (!authChecked || !isLoggedIn || !userData?._id) return;
    if (autoStartedRef.current || activeCartItems.length === 0) return;
    autoStartedRef.current = true;
    startPayment({
      user_id: userData._id,
      orderItems: activeCartItems.map(i => ({ item_id: i.id, quantity: 1 })),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authChecked, isLoggedIn, userData]);

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
      const session = await initiatePayment(orderId, discountRate || undefined);
      setSessionId(session.sessionId);
      setPhase('paying');
    } catch (e: any) {
      setPayError(e.message ?? 'Could not restart payment.');
      setPhase('failed');
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
    if (!guestPhone.trim()) newErrors.guestPhone = 'Phone number is required';
    validateAddressFields(newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChoosePaymentMethod = () => {
    if (!validateGuestForm()) return;
    if (activeCartItems.length === 0) {
      setPayError('Your cart is empty.');
      return;
    }
    startPayment({
      guestInfo: {
        name: `${firstName} ${lastName}`.trim() || 'Guest',
        emailAddress: guestEmail.trim(),
        phoneNumber: guestPhone.trim(),
        shippingAddress: {
          street: avenue ? `${street}, Ave ${avenue}` : street,
          city: area,
          block,
          governorate,
          house: houseNumber,
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
        street: avenue ? `${street}, Ave ${avenue}` : street,
        city: area,
        block,
        governorate,
        house: houseNumber,
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

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return;
    try {
      const result = await validateDiscountCode(discountCode.trim(), subtotal);
      setDiscountAmount(result.discountAmount);
      setDiscountRate(result.discountPercentage);
      setDiscountError('');
    } catch (e: any) {
      setDiscountError(e.message ?? 'Invalid discount code');
      setDiscountAmount(0);
      setDiscountRate(0);
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
          options={GOVERNORATES}
          onSelect={handleGovernorateSelect}
        />
        <ErrorText field="governorate" />
      </div>

      {/* Area — filtered by governorate */}
      <div>
        <SelectField
          value={area}
          placeholder={governorate ? 'Area' : 'Select governorate first'}
          options={governorate ? KUWAIT_AREAS[governorate] : []}
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
          placeholder="House / Apartment no."
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
              <button onClick={() => router.push('/sign-in')}>
                <span className="text-secondary underline">Sign in</span>
              </button>
            </span>
          </div>

          <div className="mb-7 flex flex-col gap-[14px]">
            <FormSection title="Contact information" />
            <div>
              <input
                className={inputClass}
                placeholder="Email address"
                value={guestEmail}
                onChange={e => {
                  setGuestEmail(e.target.value);
                  if (errors.guestEmail) setErrors({ ...errors, guestEmail: '' });
                }}
                type="email"
                autoCapitalize="none"
              />
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
      {!!payError && <span className="mb-2 font-dm text-[13px] text-error">{payError}</span>}

      {phase === 'idle' && !isLoggedIn && (
        <button className="flex h-[60px] items-center justify-center bg-secondary" onClick={handleChoosePaymentMethod}>
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
          onChange={e => { setDiscountCode(e.target.value); setDiscountError(''); }}
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
        <span className="font-dm font-semibold text-[19px] text-black">Total</span>
        <span className="font-dm font-semibold text-[19px] text-black">{total.toFixed(2)} KWD</span>
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
      menu={<SideMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />}
      header={<SiteHeader onMenuPress={() => setMenuOpen(true)} />}
    >
      <MaxWidthContainer className={isDesktop ? 'px-16' : ''}>
        {phase === 'success' ? (
          SuccessPanel()
        ) : !authChecked ? (
          <div className="flex flex-col items-center py-20">
            <span className="font-dm text-[14px] text-muted">Loading…</span>
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
