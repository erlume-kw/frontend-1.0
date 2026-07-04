import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Modal,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useCart } from '../contexts/CartContext';
import {
  validateDiscountCode,
  getAccessToken,
  getMe,
  createOrder,
  initiatePayment,
  confirmPayment,
  updateOrderShippingAddress,
  AuthUser,
} from '../services/api';
import MyFatoorahEmbed, { MFWidgetResult } from '../components/checkout/MyFatoorahEmbed';
import SiteHeader from '../components/layout/SiteHeader';
import PageLayout from '../components/layout/PageLayout';
import SideMenu from '../components/layout/SideMenu';
import MaxWidthContainer from '../components/layout/MaxWidthContainer';
import { COLORS, FONTS, BREAKPOINT, SCREEN_PADDING } from '../constants/brand';

// ─── Kuwait geographic data ────────────────────────────────────────────────────
const KUWAIT_AREAS: Record<string, string[]> = {
  'Al Asimah (Capital)': [
    'Sharq', 'Dasman', 'Mirqab', 'Qibla', 'Salhiya',
    'Dasma', 'Bneid Al-Gar', 'Mansouriya', 'Faiha', 'Shamiya', 'Rawda',
    'Adailiya', 'Nuzha', 'Qadsiya', "Da'iya", 'Abdullah Al-Salem', 'Surra',
    'Yarmouk', 'Jaber Al-Ahmad', 'Sulaibikhat', 'Doha',
    'Shuwaikh Industrial', 'Shuwaikh Port',
  ],
  'Hawalli': [
    'Hawalli', 'Salmiya', 'Rumaithiya', 'Jabriya', 'Bayan', 'Mishref',
    'Maidan Hawalli', 'Salwa', "Bida'a", 'Mubarak Al-Abdullah',
    'Shuhada', 'Heteen', 'Zahra', 'Salam', 'Siddeeq',
  ],
  'Farwaniya': [
    'Farwaniya', 'Jleeb Al-Shuyoukh', 'Khaitan', 'Ardiya', 'Andalous',
    'Ferdous', 'Sabah Al-Nasser', 'Rehab', 'Rabiya', 'Al-Rai', 'Al-Riggai',
    'Al-Dajeej', 'Al-Shadadiya', 'Al-Omariya', 'Abdullah Al-Mubarak', 'Ishbiliya',
  ],
  'Mubarak Al-Kabeer': [
    'Mubarak Al-Kabeer', 'Sabah Al-Salem', 'Adan', 'Qusour', 'Qurain',
    'Fintas', 'Masila', 'Abu Fiteira', 'Funaitees', 'Subhan',
  ],
  'Al Ahmadi': [
    'Ahmadi', 'Fahaheel', 'Mangaf', 'Mahboula', 'Abu Halifa', 'Fintas',
    'Egaila', 'Hadiya', 'Dhaher', 'Riqqa', 'Sabah Al-Ahmad', 'Al-Khiran',
    'Wafra', 'Jaber Al-Ali', 'Fahad Al-Ahmad',
  ],
  'Al Jahra': [
    'Jahra', 'Saad Al-Abdullah', 'Tima', 'Oyoun', 'Qasr', 'Naseem',
    'Waha', 'Naeem', 'Nuwaiseeb', 'Jahra Industrial Area', 'Kabad', 'Sulaibiya',
  ],
};
const GOVERNORATES = Object.keys(KUWAIT_AREAS);

// Payment slot phases — the MyFatoorah embedded widget carries the actual
// payment methods (KNET / cards / Apple Pay / Google Pay); there is no PAY NOW.
type PaymentPhase = 'idle' | 'initiating' | 'paying' | 'verifying' | 'success' | 'failed';

// ─── Dropdown — uses a Modal so the list floats above all content ─────────────
type DropdownLayout = { x: number; y: number; width: number; height: number };

function SelectField({
  value,
  placeholder,
  options,
  onSelect,
  disabled = false,
}: {
  value: string;
  placeholder: string;
  options: string[];
  onSelect: (v: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [layout, setLayout] = useState<DropdownLayout | null>(null);
  const triggerRef = useRef<View>(null);

  const openDropdown = useCallback(() => {
    if (disabled || !triggerRef.current) return;
    // measureInWindow gives viewport-relative coords — correct for Modal overlay
    (triggerRef.current as any).measureInWindow(
      (x: number, y: number, width: number, height: number) => {
        setLayout({ x, y, width, height });
        setOpen(true);
      }
    );
  }, [disabled]);

  return (
    <View ref={triggerRef} collapsable={false}>
      <TouchableOpacity
        style={[s.input, s.selectField, disabled && s.inputDisabled]}
        onPress={openDropdown}
        activeOpacity={disabled ? 1 : 0.8}
      >
        <Text style={[s.selectValue, !value && { color: COLORS.muted }]}>
          {value || placeholder}
        </Text>
        <Text style={[s.chevron, open && s.chevronUp]}>›</Text>
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="none"
        onRequestClose={() => setOpen(false)}
      >
        {/* Tap outside to close */}
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          onPress={() => setOpen(false)}
          activeOpacity={1}
        />
        {layout && (
          <View
            style={[
              s.dropdownList,
              {
                position: 'absolute',
                top: layout.y + layout.height,
                left: layout.x,
                width: layout.width,
              },
            ]}
          >
            <ScrollView
              style={s.dropdownScroll}
              nestedScrollEnabled
              keyboardShouldPersistTaps="handled"
            >
              {options.map(opt => (
                <TouchableOpacity
                  key={opt}
                  style={[s.dropdownItem, value === opt && s.dropdownItemSelected]}
                  onPress={() => { onSelect(opt); setOpen(false); }}
                >
                  <Text style={[s.dropdownItemText, value === opt && s.dropdownItemTextSelected]}>
                    {opt}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </Modal>
    </View>
  );
}

// ─── Main screen ───────────────────────────────────────────────────────────────
export default function CheckoutScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= BREAKPOINT;
  const [menuOpen, setMenuOpen] = useState(false);
  const navigation = useNavigation();
  const isFocused = useIsFocused();

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
  const [payAmount, setPayAmount] = useState(0);
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
    if (!isFocused) return;
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
  }, [isFocused]);

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
      setPayAmount(session.amount);
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
      setPayAmount(session.amount);
      setPhase('paying');
    } catch (e: any) {
      setPayError(e.message ?? 'Could not restart payment.');
      setPhase('failed');
    }
  };

  // ─── Guest flow ──────────────────────────────────────────────────────────────
  const validateGuestForm = () => {
    const newErrors: Record<string, string> = {};
    if (!guestEmail.trim()) newErrors.guestEmail = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) newErrors.guestEmail = 'Invalid email';
    if (!guestPhone.trim()) newErrors.guestPhone = 'Phone number is required';
    validateAddressFields(newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateAddressFields = (newErrors: Record<string, string>) => {
    if (!governorate.trim()) newErrors.governorate = 'Governorate is required';
    if (!area.trim()) newErrors.area = 'Area is required';
    if (!block.trim()) newErrors.block = 'Block is required';
    if (!street.trim()) newErrors.street = 'Street is required';
    if (!houseNumber.trim()) newErrors.houseNumber = 'House number is required';
    return newErrors;
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

  const inputStyle = [s.input, isDesktop && s.inputDesktop];

  const ErrorText = ({ field }: { field: string }) =>
    errors[field] ? <Text style={s.errorText}>{errors[field]}</Text> : null;

  const FormSection = ({ title }: { title: string }) => (
    <Text style={[s.sectionTitle, isDesktop && { fontSize: 21 }]}>{title}</Text>
  );

  const handleGovernorateSelect = (gov: string) => {
    setGovernorate(gov);
    setArea(''); // reset area when governorate changes
  };

  // ─── Shared address fields block ────────────────────────────────────────────
  const AddressFields = () => (
    <View style={s.fieldGroup}>
      {/* Country — Kuwait only */}
      <View style={[s.input, s.selectField, s.inputDisabled]}>
        <Text style={s.selectValue}>Kuwait</Text>
        <Text style={s.chevron}>›</Text>
      </View>

      {/* Name row */}
      {isDesktop ? (
        <View style={s.fieldRow}>
          <TextInput style={[inputStyle, { flex: 1 }]} placeholder="First name" placeholderTextColor={COLORS.muted} value={firstName} onChangeText={setFirstName} />
          <TextInput style={[inputStyle, { flex: 1 }]} placeholder="Last name" placeholderTextColor={COLORS.muted} value={lastName} onChangeText={setLastName} />
        </View>
      ) : (
        <>
          <TextInput style={inputStyle} placeholder="First name" placeholderTextColor={COLORS.muted} value={firstName} onChangeText={setFirstName} />
          <TextInput style={inputStyle} placeholder="Last name" placeholderTextColor={COLORS.muted} value={lastName} onChangeText={setLastName} />
        </>
      )}

      {/* Governorate */}
      <SelectField
        value={governorate}
        placeholder="Governorate"
        options={GOVERNORATES}
        onSelect={handleGovernorateSelect}
      />
      <ErrorText field="governorate" />

      {/* Area — filtered by governorate */}
      <SelectField
        value={area}
        placeholder={governorate ? 'Area' : 'Select governorate first'}
        options={governorate ? KUWAIT_AREAS[governorate] : []}
        onSelect={setArea}
        disabled={!governorate}
      />
      <ErrorText field="area" />

      {/* Block / Street */}
      {isDesktop ? (
        <View style={s.fieldRow}>
          <TextInput
            style={[inputStyle, { flex: 1 }]}
            placeholder="Block"
            placeholderTextColor={COLORS.muted}
            value={block}
            onChangeText={t => setBlock(t.replace(/[^0-9]/g, ''))}
            keyboardType="numeric"
          />
          <TextInput
            style={[inputStyle, { flex: 2 }]}
            placeholder="Street"
            placeholderTextColor={COLORS.muted}
            value={street}
            onChangeText={setStreet}
          />
        </View>
      ) : (
        <>
          <TextInput style={inputStyle} placeholder="Block" placeholderTextColor={COLORS.muted} value={block} onChangeText={t => setBlock(t.replace(/[^0-9]/g, ''))} keyboardType="numeric" />
          <TextInput style={inputStyle} placeholder="Street" placeholderTextColor={COLORS.muted} value={street} onChangeText={setStreet} />
        </>
      )}
      <ErrorText field="block" />
      <ErrorText field="street" />

      {/* House / Avenue */}
      {isDesktop ? (
        <View style={s.fieldRow}>
          <TextInput
            style={[inputStyle, { flex: 1 }]}
            placeholder="House / Apartment no."
            placeholderTextColor={COLORS.muted}
            value={houseNumber}
            onChangeText={t => setHouseNumber(t.replace(/[^0-9]/g, ''))}
            keyboardType="numeric"
          />
          <TextInput
            style={[inputStyle, { flex: 1 }]}
            placeholder="Avenue (optional)"
            placeholderTextColor={COLORS.muted}
            value={avenue}
            onChangeText={t => setAvenue(t.replace(/[^0-9]/g, ''))}
            keyboardType="numeric"
          />
        </View>
      ) : (
        <>
          <TextInput style={inputStyle} placeholder="House / Apartment no." placeholderTextColor={COLORS.muted} value={houseNumber} onChangeText={t => setHouseNumber(t.replace(/[^0-9]/g, ''))} keyboardType="numeric" />
          <TextInput style={inputStyle} placeholder="Avenue (optional)" placeholderTextColor={COLORS.muted} value={avenue} onChangeText={t => setAvenue(t.replace(/[^0-9]/g, ''))} keyboardType="numeric" />
        </>
      )}
      <ErrorText field="houseNumber" />
    </View>
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
      <View style={s.section}>
        <FormSection title="Delivery address" />

        {!editingAddress ? (
          <>
            <View style={s.addressCard}>
              <View style={s.addressCardHeader}>
                <Text style={s.addressCardLabel}>{active.label}</Text>
                <View style={s.addressSelectedBadge}><Text style={s.addressSelectedText}>SELECTED</Text></View>
              </View>
              <Text style={s.addressCardTitle}>{active.title}</Text>
              <Text style={s.addressCardLine}>{active.line}</Text>
            </View>
            <TouchableOpacity style={s.ghostBtn} onPress={() => { setEditingAddress(true); setAddressError(''); }}>
              <Text style={s.ghostBtnText}>USE A DIFFERENT ADDRESS</Text>
            </TouchableOpacity>
            {customAddress && (
              <TouchableOpacity style={s.linkBtn} onPress={handleUseProfileAddress} disabled={addressSaving}>
                <Text style={s.linkBtnText}>{addressSaving ? 'Switching…' : 'Switch back to profile address'}</Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <>
            {AddressFields()}
            {!!addressError && <Text style={s.errorText}>{addressError}</Text>}
            <TouchableOpacity
              style={[s.ghostBtn, s.ghostBtnPrimary, addressSaving && s.btnDisabled]}
              onPress={handleSaveNewAddress}
              disabled={addressSaving}
            >
              <Text style={[s.ghostBtnText, s.ghostBtnPrimaryText]}>
                {addressSaving ? 'SAVING…' : 'DELIVER TO THIS ADDRESS'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.linkBtn} onPress={() => { setEditingAddress(false); setAddressError(''); }}>
              <Text style={s.linkBtnText}>Keep the selected address</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    );
  };

  // ─── Form column ─────────────────────────────────────────────────────────────
  const CheckoutForm = () => (
    <View style={[s.formCol, isDesktop && s.formColDesktop]}>
      {isLoggedIn ? (
        <>
          <View style={s.section}>
            <FormSection title="Checkout" />
            <Text style={s.secureText}>
              Signed in as {userData?.emailAddress ?? 'your account'}
            </Text>
          </View>
          {SignedInAddress()}
        </>
      ) : (
        <>
          {/* Guest checkout — with a route into the sign-in flow */}
          <View style={s.section}>
            <FormSection title="Guest checkout" />
            <Text style={s.helperText}>
              Have an account?{' '}
              <Text style={s.helperLink} onPress={() => navigation.navigate('SignInRegister' as never)}>
                Sign in
              </Text>
            </Text>
          </View>

          <View style={s.section}>
            <FormSection title="Contact information" />
            <View>
              <TextInput
                style={inputStyle}
                placeholder="Email address"
                placeholderTextColor={COLORS.muted}
                value={guestEmail}
                onChangeText={(val) => {
                  setGuestEmail(val);
                  if (errors.guestEmail) setErrors({ ...errors, guestEmail: '' });
                }}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <ErrorText field="guestEmail" />
            </View>
            <View>
              <TextInput
                style={inputStyle}
                placeholder="Phone number"
                placeholderTextColor={COLORS.muted}
                value={guestPhone}
                onChangeText={(val) => {
                  setGuestPhone(val);
                  if (errors.guestPhone) setErrors({ ...errors, guestPhone: '' });
                }}
                keyboardType="phone-pad"
              />
              <ErrorText field="guestPhone" />
            </View>
          </View>

          {/* Delivery */}
          <View style={s.section}>
            <FormSection title="Delivery" />
            <Text style={s.subSectionTitle}>Delivery methods</Text>
            <View style={s.choiceGroup}>
              <View style={[s.choice, s.choiceSelected]}>
                <View style={[s.radio, s.radioSelected]} />
                <View style={s.deliveryMethodInfo}>
                  <Text style={s.choiceLabel}>Express</Text>
                  <Text style={s.deliveryMethodSub}>Delivery within Kuwait</Text>
                </View>
              </View>
            </View>

            <Text style={s.subSectionTitle}>Address</Text>
            {AddressFields()}
          </View>
        </>
      )}
    </View>
  );

  // ─── Payment slot — lives under the order summary in all flows ──────────────
  const PaymentSlot = () => (
    <View style={s.paymentSlot}>
      {!!payError && <Text style={s.discountError}>{payError}</Text>}

      {phase === 'idle' && !isLoggedIn && (
        <TouchableOpacity style={s.primaryBtn} onPress={handleChoosePaymentMethod}>
          <Text style={s.primaryBtnText}>CHOOSE A PAYMENT METHOD</Text>
        </TouchableOpacity>
      )}

      {(phase === 'idle' || phase === 'initiating') && isLoggedIn && (
        <View style={s.center}>
          <ActivityIndicator color={COLORS.secondary} />
          <Text style={s.secureText}>Preparing secure payment…</Text>
        </View>
      )}

      {phase === 'initiating' && !isLoggedIn && (
        <View style={[s.primaryBtn, s.btnDisabled]}>
          <Text style={s.primaryBtnText}>PREPARING PAYMENT…</Text>
        </View>
      )}

      {(phase === 'paying' || phase === 'verifying') && sessionId && (
        <>
          <Text style={s.secureText}>All transactions are secure and encrypted</Text>
          <MyFatoorahEmbed
            sessionId={sessionId}
            amount={payAmount}
            onResult={handleWidgetResult}
          />
          {phase === 'verifying' && (
            <View style={s.center}>
              <ActivityIndicator color={COLORS.secondary} />
              <Text style={s.secureText}>Verifying your payment…</Text>
            </View>
          )}
        </>
      )}

      {phase === 'failed' && (
        <TouchableOpacity style={s.primaryBtn} onPress={handleRetry}>
          <Text style={s.primaryBtnText}>TRY AGAIN</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const OrderSummary = () => (
    <View style={[s.summaryCol, isDesktop && s.summaryColDesktop]}>
      <Text style={s.sectionTitle}>Order summary</Text>

      {cartItems.map(item => (
        <View key={item.id} style={s.summaryItem}>
          <Text style={s.summaryItemName} numberOfLines={1}>{item.brand} — {item.name}</Text>
          <Text style={s.summaryItemPrice}>{item.price}</Text>
        </View>
      ))}

      <View style={s.promoRow}>
        <TextInput
          style={[inputStyle, { flex: 1 }, isDesktop && { backgroundColor: COLORS.white }]}
          placeholder="Discount code"
          placeholderTextColor={COLORS.muted}
          value={discountCode}
          onChangeText={v => { setDiscountCode(v); setDiscountError(''); }}
        />
        <TouchableOpacity style={s.applyBtn} onPress={handleApplyDiscount}>
          <Text style={s.applyText}>Apply</Text>
        </TouchableOpacity>
      </View>
      {!!discountError && <Text style={s.discountError}>{discountError}</Text>}
      {discountAmount > 0 && <Text style={s.discountSuccess}>Discount: -{discountAmount.toFixed(2)} KWD</Text>}

      {[
        { label: `Subtotal • ${cartItems.length} item${cartItems.length !== 1 ? 's' : ''}`, value: `${subtotal.toFixed(2)} KWD` },
        { label: 'Shipping', value: 'Free' },
      ].map(({ label, value }) => (
        <View key={label} style={s.lineItem}>
          <Text style={s.lineLabel}>{label}</Text>
          <Text style={s.lineValue}>{value}</Text>
        </View>
      ))}

      <View style={s.totalRow}>
        <Text style={s.totalLabel}>Total</Text>
        <Text style={s.totalValue}>{total.toFixed(2)} KWD</Text>
      </View>

      {/* MyFatoorah widget / payment CTA — under the summary on desktop,
          below it in the stacked mobile layout */}
      {PaymentSlot()}
    </View>
  );

  const SuccessPanel = () => (
    <View style={s.successWrap}>
      <Text style={s.successTitle}>Thank you — order confirmed!</Text>
      <Text style={s.successBody}>
        Your payment was received and your order is being processed.
      </Text>
      {orderId && <Text style={s.successRef}>Order reference: {orderId}</Text>}
      <TouchableOpacity
        style={s.primaryBtn}
        onPress={() => navigation.navigate('Home' as never)}
      >
        <Text style={s.primaryBtnText}>CONTINUE SHOPPING</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <PageLayout
      menu={<SideMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />}
      header={<SiteHeader onMenuPress={() => setMenuOpen(true)} />}
    >
      <MaxWidthContainer style={isDesktop ? s.desktopPad : undefined}>
        {phase === 'success' ? (
          SuccessPanel()
        ) : !authChecked ? (
          <View style={[s.center, { paddingVertical: 80 }]}>
            <ActivityIndicator color={COLORS.secondary} />
          </View>
        ) : isDesktop ? (
          <View style={s.desktopLayout}>
            {CheckoutForm()}
            {OrderSummary()}
          </View>
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

// ─── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  desktopPad: { paddingHorizontal: SCREEN_PADDING.desktop },
  desktopLayout: { flexDirection: 'row', alignItems: 'flex-start', gap: 40 },

  formCol: { padding: 21 },
  // Horizontal padding is handled by MaxWidthContainer+desktopPad — only keep vertical
  formColDesktop: { flex: 1, paddingHorizontal: 0, paddingVertical: 38, maxWidth: 641 },

  summaryCol: { padding: 21 },
  summaryColDesktop: {
    width: 582,
    padding: 38,
    backgroundColor: COLORS.lightGrey,
    minHeight: 600,
  },

  section: { gap: 14, marginBottom: 28 },
  sectionTitle: { fontFamily: FONTS.clashSemibold, fontSize: 18, color: COLORS.black, marginBottom: 4 },
  subSectionTitle: { fontFamily: FONTS.clashMedium, fontSize: 16, color: COLORS.black, marginTop: 4 },
  secureText: { fontFamily: FONTS.dmRegular, fontSize: 14, color: COLORS.muted },

  helperText: {
    fontFamily: FONTS.dmRegular,
    fontSize: 14,
    color: COLORS.muted,
  },
  helperLink: {
    color: COLORS.secondary,
    textDecorationLine: 'underline',
  },

  input: {
    height: 52,
    borderWidth: 0,          // override browser default on web
    paddingHorizontal: 11,
    fontFamily: FONTS.dmRegular,
    fontSize: 14,
    color: COLORS.black,
    backgroundColor: COLORS.lightGrey,
  },
  inputDesktop: {},
  inputDisabled: { backgroundColor: '#E8E8E8' },
  errorText: {
    fontFamily: FONTS.dmRegular,
    fontSize: 13,
    color: COLORS.error,
    marginTop: 4,
  },

  // Dropdown trigger
  selectField: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selectValue: { fontFamily: FONTS.dmRegular, fontSize: 14, color: COLORS.black, flex: 1 },
  chevron: { fontFamily: FONTS.clashRegular, fontSize: 18, color: COLORS.muted, transform: [{ rotate: '90deg' }] },
  chevronUp: { transform: [{ rotate: '-90deg' }] },

  // Floating dropdown list (rendered inside Modal, positioned absolutely)
  dropdownList: {
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
  },
  dropdownScroll: { maxHeight: 200 },
  dropdownItem: {
    paddingHorizontal: 11,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGrey,
  },
  dropdownItemSelected: { backgroundColor: '#EFF5FF' },
  dropdownItemText: { fontFamily: FONTS.dmRegular, fontSize: 14, color: COLORS.black },
  dropdownItemTextSelected: { fontFamily: FONTS.dmMedium, color: COLORS.primary },

  fieldGroup: { gap: 14 },
  fieldRow: { flexDirection: 'row', gap: 14 },

  // Delivery method choice
  choiceGroup: { overflow: 'hidden' },
  choice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.white,
  },
  choiceSelected: { backgroundColor: '#EFF5FF' },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 1, borderColor: COLORS.border },
  radioSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primary },
  choiceLabel: { fontFamily: FONTS.dmRegular, fontSize: 14, color: COLORS.black },
  deliveryMethodInfo: { gap: 2 },
  deliveryMethodSub: { fontFamily: FONTS.dmRegular, fontSize: 12, color: COLORS.muted },

  // Signed-in address card
  addressCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    gap: 6,
  },
  addressCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  addressCardLabel: { fontFamily: FONTS.dmMedium, fontSize: 12, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 0.8 },
  addressSelectedBadge: { backgroundColor: 'rgba(197,112,93,0.12)', paddingHorizontal: 8, paddingVertical: 3 },
  addressSelectedText: { fontFamily: FONTS.dmMedium, fontSize: 11, color: COLORS.secondary, letterSpacing: 0.8 },
  addressCardTitle: { fontFamily: FONTS.dmSemibold, fontSize: 14, color: COLORS.black },
  addressCardLine: { fontFamily: FONTS.dmRegular, fontSize: 13, color: COLORS.muted, lineHeight: 19 },

  ghostBtn: {
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
  ghostBtnText: { fontFamily: FONTS.clashMedium, fontSize: 13, color: COLORS.black, letterSpacing: 1 },
  ghostBtnPrimary: { backgroundColor: COLORS.secondary, borderColor: COLORS.secondary },
  ghostBtnPrimaryText: { color: COLORS.white },
  linkBtn: { alignItems: 'center', paddingVertical: 6 },
  linkBtnText: { fontFamily: FONTS.dmRegular, fontSize: 13, color: COLORS.secondary, textDecorationLine: 'underline' },
  btnDisabled: { opacity: 0.6 },

  summaryItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, marginBottom: 4 },
  summaryItemName: { fontFamily: FONTS.dmRegular, fontSize: 13, color: COLORS.black, flex: 1, marginRight: 8 },
  summaryItemPrice: { fontFamily: FONTS.dmSemibold, fontSize: 13, color: COLORS.black },
  discountError: { fontFamily: FONTS.dmRegular, fontSize: 13, color: COLORS.error, marginBottom: 8 },
  discountSuccess: { fontFamily: FONTS.dmRegular, fontSize: 13, color: COLORS.olive, marginBottom: 8 },
  promoRow: { flexDirection: 'row', gap: 14, marginBottom: 16, marginTop: 12 },
  applyBtn: {
    height: 52,
    paddingHorizontal: 16,
    backgroundColor: COLORS.lightGrey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyText: { fontFamily: FONTS.dmMedium, fontSize: 14, color: COLORS.black },

  lineItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  lineLabel: { fontFamily: FONTS.dmRegular, fontSize: 14, color: COLORS.black },
  lineValue: { fontFamily: FONTS.dmRegular, fontSize: 14, color: COLORS.black },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, marginBottom: 16 },
  totalLabel: { fontFamily: FONTS.dmSemibold, fontSize: 19, color: COLORS.black },
  totalValue: { fontFamily: FONTS.dmSemibold, fontSize: 19, color: COLORS.black },

  paymentSlot: { gap: 12, marginTop: 4 },
  center: { alignItems: 'center', gap: 8, paddingVertical: 16 },

  primaryBtn: { height: 60, backgroundColor: COLORS.secondary, alignItems: 'center', justifyContent: 'center' },
  primaryBtnText: { fontFamily: FONTS.clashSemibold, fontSize: 15, color: COLORS.white, textTransform: 'uppercase', letterSpacing: 1.2 },

  successWrap: { padding: 38, gap: 16, alignItems: 'stretch', maxWidth: 641, alignSelf: 'center', width: '100%' },
  successTitle: { fontFamily: FONTS.clashSemibold, fontSize: 24, color: COLORS.black, textAlign: 'center', marginTop: 24 },
  successBody: { fontFamily: FONTS.dmRegular, fontSize: 15, color: COLORS.muted, textAlign: 'center' },
  successRef: { fontFamily: FONTS.dmMedium, fontSize: 13, color: COLORS.black, textAlign: 'center', marginBottom: 12 },
});
