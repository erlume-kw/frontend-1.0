import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Modal,
  useWindowDimensions,
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { showOrderPlaced } from '../utils/interactions';
import { useCart } from '../contexts/CartContext';
import { validateDiscountCode, getAccessToken, getMe } from '../services/api';
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

type PaymentMethod = 'knet' | 'card';

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

  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Contact
  const [email, setEmail] = useState('');

  // Name
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // Kuwait address
  const [governorate, setGovernorate] = useState('');
  const [area, setArea] = useState('');
  const [block, setBlock] = useState('');
  const [street, setStreet] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [avenue, setAvenue] = useState('');

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('knet');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [nameOnCard, setNameOnCard] = useState('');

  // Checkout type (guest vs account)
  const [checkoutType, setCheckoutType] = useState<'guest' | 'account'>('guest');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');

  // Order summary
  const [discountCode, setDiscountCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountError, setDiscountError] = useState('');
  const { items: cartItems, subtotal } = useCart();
  const total = Math.max(0, subtotal - discountAmount);

  // Check auth status on mount and when screen is focused
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('[CheckoutScreen] Checking auth status...');
        const token = await getAccessToken();
        console.log('[CheckoutScreen] Token:', token ? 'EXISTS' : 'NOT FOUND');
        if (token) {
          console.log('[CheckoutScreen] User is logged in, fetching user data...');
          setIsLoggedIn(true);
          try {
            const user = await getMe();
            console.log('[CheckoutScreen] User data:', user);
            setUserData(user);
            // Pre-fill address from user data
            if (user.address) {
              setFirstName(user.emailAddress?.split('@')[0] || '');
              setGovernorate(user.address.governorate || '');
              setArea(user.address.city || '');
              setBlock(user.address.block || '');
              setStreet(user.address.street || '');
              setHouseNumber(user.address.house || '');
            }
          } catch (userError) {
            console.log('[CheckoutScreen] Error fetching user data:', userError);
            setIsLoggedIn(false);
            setUserData(null);
          }
        } else {
          console.log('[CheckoutScreen] User is not logged in');
          setIsLoggedIn(false);
          setUserData(null);
        }
      } catch (error) {
        console.log('[CheckoutScreen] Auth check error:', error);
        setIsLoggedIn(false);
        setUserData(null);
      }
    };
    if (isFocused) {
      console.log('[CheckoutScreen] Screen is focused, checking auth');
      checkAuth();
    } else {
      console.log('[CheckoutScreen] Screen is not focused');
    }
  }, [isFocused]);

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return;
    try {
      const result = await validateDiscountCode(discountCode.trim(), subtotal);
      setDiscountAmount(result.discountAmount);
      setDiscountError('');
    } catch (e: any) {
      setDiscountError(e.message ?? 'Invalid discount code');
      setDiscountAmount(0);
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (isLoggedIn) {
      // Logged in user validation
      if (!governorate.trim()) newErrors.governorate = 'Governorate is required';
      if (!area.trim()) newErrors.area = 'Area is required';
      if (!block.trim()) newErrors.block = 'Block is required';
      if (!street.trim()) newErrors.street = 'Street is required';
      if (!houseNumber.trim()) newErrors.houseNumber = 'House number is required';
    } else if (checkoutType === 'guest') {
      // Guest checkout validation
      if (!guestEmail.trim()) newErrors.guestEmail = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) newErrors.guestEmail = 'Invalid email';
      if (!guestPhone.trim()) newErrors.guestPhone = 'Phone number is required';
    } else {
      // Account checkout validation
      if (!email.trim()) newErrors.email = 'Email is required';
    }

    // Address validation for both guest and account
    if (!governorate.trim()) newErrors.governorate = 'Governorate is required';
    if (!area.trim()) newErrors.area = 'Area is required';
    if (!block.trim()) newErrors.block = 'Block is required';
    if (!street.trim()) newErrors.street = 'Street is required';
    if (!houseNumber.trim()) newErrors.houseNumber = 'House number is required';

    // Payment validation
    if (paymentMethod === 'card') {
      if (!cardNumber.trim()) newErrors.cardNumber = 'Card number is required';
      if (!expiryDate.trim()) newErrors.expiryDate = 'Expiry date is required';
      if (!cvv.trim()) newErrors.cvv = 'CVV is required';
      if (!nameOnCard.trim()) newErrors.nameOnCard = 'Name on card is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const CheckoutForm = () => (
    <View style={[s.formCol, isDesktop && s.formColDesktop]}>
      {/* Checkout Type Toggle - only show if not logged in */}
      {!isLoggedIn && (
        <View style={s.section}>
          <FormSection title="Checkout" />
          <View style={s.checkoutTypeToggle}>
            <TouchableOpacity
              style={[s.checkoutTypeBtn, checkoutType === 'guest' && s.checkoutTypeBtnActive]}
              onPress={() => setCheckoutType('guest')}
            >
              <Text style={[s.checkoutTypeBtnText, checkoutType === 'guest' && s.checkoutTypeBtnTextActive]}>
                GUEST CHECKOUT
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.checkoutTypeBtn, checkoutType === 'account' && s.checkoutTypeBtnActive]}
              onPress={() => setCheckoutType('account')}
            >
              <Text style={[s.checkoutTypeBtnText, checkoutType === 'account' && s.checkoutTypeBtnTextActive]}>
                SIGN IN
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Guest Checkout Fields - only show if not logged in */}
      {!isLoggedIn && checkoutType === 'guest' && (
        <View style={s.section}>
          <FormSection title="Contact Information" />
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
      )}

      {/* Account Checkout - Sign In Form - only show if not logged in */}
      {!isLoggedIn && checkoutType === 'account' && (
        <View style={s.section}>
          <FormSection title="Sign In to Your Account" />
          <TextInput
            style={inputStyle}
            placeholder="Email address"
            placeholderTextColor={COLORS.muted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Text style={s.helperText}>
            Don't have an account? <Text style={s.helperLink} onPress={() => navigation.navigate('SignInRegister' as never)}>Sign up here</Text>
          </Text>
        </View>
      )}

      {/* Regular Contact */}
      {checkoutType === 'guest' && (
        <View style={s.section}>
          <FormSection title="Contact" />
          <TextInput
            style={inputStyle}
            placeholder="Full name"
            placeholderTextColor={COLORS.muted}
            value={firstName}
            onChangeText={setFirstName}
          />
        </View>
      )}

      {/* Delivery */}
      <View style={s.section}>
        <FormSection title="Delivery" />

        {/* Delivery methods */}
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

        {/* Address */}
        <Text style={s.subSectionTitle}>Address</Text>
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

          {/* Area — filtered by governorate */}
          <SelectField
            value={area}
            placeholder={governorate ? 'Area' : 'Select governorate first'}
            options={governorate ? KUWAIT_AREAS[governorate] : []}
            onSelect={setArea}
            disabled={!governorate}
          />

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
        </View>
      </View>

      {/* Payment */}
      <View style={s.section}>
        <FormSection title="Payment" />
        <Text style={s.secureText}>All transactions are secure and encrypted</Text>

        <View style={s.choiceGroup}>
          {([
            ['knet', 'KNET'],
            ['card', 'Debit / Credit Card'],
          ] as [PaymentMethod, string][]).map(([method, label]) => (
            <TouchableOpacity
              key={method}
              style={[s.choice, paymentMethod === method && s.choiceSelected]}
              onPress={() => setPaymentMethod(method)}
            >
              <View style={[s.radio, paymentMethod === method && s.radioSelected]} />
              <Text style={s.choiceLabel}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* KNET — placeholder for gateway integration */}
        {paymentMethod === 'knet' && (
          <View style={s.knetBox}>
            <Text style={s.knetTitle}>KNET Secure Payment</Text>
            <Text style={s.knetBody}>
              You will be redirected to the KNET secure payment gateway to complete your purchase.
            </Text>
            {/* TODO: integrate KNET payment gateway SDK/redirect here */}
          </View>
        )}

        {/* Debit / Credit Card */}
        {paymentMethod === 'card' && (
          <View style={s.cardFields}>
            <TextInput style={inputStyle} placeholder="Card number" placeholderTextColor={COLORS.muted} value={cardNumber} onChangeText={setCardNumber} keyboardType="numeric" />
            <View style={isDesktop ? s.fieldRow : undefined}>
              <TextInput style={[inputStyle, isDesktop && { flex: 1 }]} placeholder="Expiration date (MM/YY)" placeholderTextColor={COLORS.muted} value={expiryDate} onChangeText={setExpiryDate} />
              <TextInput style={[inputStyle, isDesktop && { flex: 1 }]} placeholder="Security code" placeholderTextColor={COLORS.muted} value={cvv} onChangeText={setCvv} keyboardType="numeric" />
            </View>
            <TextInput style={inputStyle} placeholder="Name on card" placeholderTextColor={COLORS.muted} value={nameOnCard} onChangeText={setNameOnCard} />
          </View>
        )}
      </View>
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

      <TouchableOpacity
        style={s.payBtn}
        onPress={() => {
          if (validateForm()) {
            showOrderPlaced(navigation);
          }
        }}
      >
        <Text style={s.payBtnText}>PAY NOW</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <PageLayout
      menu={<SideMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />}
      header={<SiteHeader onMenuPress={() => setMenuOpen(true)} />}
    >
      <MaxWidthContainer style={isDesktop ? s.desktopPad : undefined}>
        {isDesktop ? (
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

  checkoutTypeToggle: { flexDirection: 'row', gap: 12 },
  checkoutTypeBtn: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  checkoutTypeBtnActive: {
    borderColor: COLORS.secondary,
    backgroundColor: 'rgba(197,112,93,0.08)',
  },
  checkoutTypeBtnText: {
    fontFamily: FONTS.clashMedium,
    fontSize: 12,
    color: COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  checkoutTypeBtnTextActive: {
    color: COLORS.secondary,
  },
  helperText: {
    fontFamily: FONTS.dmRegular,
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 8,
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
  cardFields: { gap: 14 },

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

  // KNET placeholder
  knetBox: {
    backgroundColor: COLORS.lightGrey,
    padding: 20,
    gap: 8,
  },
  knetTitle: { fontFamily: FONTS.clashMedium, fontSize: 15, color: COLORS.primary },
  knetBody: { fontFamily: FONTS.dmRegular, fontSize: 13, color: COLORS.muted, lineHeight: 20 },

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

  payBtn: { height: 75, backgroundColor: COLORS.secondary, alignItems: 'center', justifyContent: 'center' },
  payBtnText: { fontFamily: FONTS.clashSemibold, fontSize: 16, color: COLORS.white, textTransform: 'uppercase', letterSpacing: 1.4 },
});
