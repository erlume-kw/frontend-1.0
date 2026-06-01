import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { showOrderPlaced, showPromoApplied } from '../utils/interactions';
import SiteHeader from '../components/layout/SiteHeader';
import PageLayout from '../components/layout/PageLayout';
import SideMenu from '../components/layout/SideMenu';
import MaxWidthContainer from '../components/layout/MaxWidthContainer';
import { COLORS, FONTS, BREAKPOINT } from '../constants/brand';

type PaymentMethod = 'card' | 'paypal' | 'cod';

const DELIVERY_METHODS = ['Ship', 'Pick up'] as const;

export default function CheckoutScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= BREAKPOINT;
  const [menuOpen, setMenuOpen] = useState(false);
  const navigation = useNavigation();

  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [apt, setApt] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'Ship' | 'Pick up'>('Ship');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [nameOnCard, setNameOnCard] = useState('');
  const [discountCode, setDiscountCode] = useState('');

  const inputStyle = [s.input, isDesktop && s.inputDesktop];

  const FormSection = ({ title }: { title: string }) => (
    <Text style={[s.sectionTitle, isDesktop && { fontSize: 21 }]}>{title}</Text>
  );

  const CheckoutForm = () => (
    <View style={[s.formCol, isDesktop && s.formColDesktop]}>
      {/* Contact */}
      <View style={s.section}>
        <FormSection title="Contact" />
        <TextInput
          style={inputStyle}
          placeholder="Email or phone number"
          placeholderTextColor={COLORS.muted}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      {/* Delivery */}
      <View style={s.section}>
        <FormSection title="Delivery" />

        {/* Delivery method */}
        <View style={s.choiceGroup}>
          {DELIVERY_METHODS.map(method => (
            <TouchableOpacity
              key={method}
              style={[s.choice, deliveryMethod === method && s.choiceSelected]}
              onPress={() => setDeliveryMethod(method)}
            >
              <View style={[s.radio, deliveryMethod === method && s.radioSelected]} />
              <Text style={s.choiceLabel}>{method}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Address fields */}
        <View style={s.fieldGroup}>
          <View style={[inputStyle, s.selectField]}>
            <Text style={s.selectValue}>Kuwait</Text>
            <Text style={s.chevron}>›</Text>
          </View>
          {isDesktop ? (
            <View style={s.fieldRow}>
              <TextInput style={[inputStyle, { flex: 1 }]} placeholder="First name (optional)" placeholderTextColor={COLORS.muted} value={firstName} onChangeText={setFirstName} />
              <TextInput style={[inputStyle, { flex: 1 }]} placeholder="Last name" placeholderTextColor={COLORS.muted} value={lastName} onChangeText={setLastName} />
            </View>
          ) : (
            <>
              <TextInput style={inputStyle} placeholder="First name (optional)" placeholderTextColor={COLORS.muted} value={firstName} onChangeText={setFirstName} />
              <TextInput style={inputStyle} placeholder="Last name" placeholderTextColor={COLORS.muted} value={lastName} onChangeText={setLastName} />
            </>
          )}
          <TextInput style={inputStyle} placeholder="Address" placeholderTextColor={COLORS.muted} value={address} onChangeText={setAddress} />
          <TextInput style={inputStyle} placeholder="Apartment, suite, etc. (optional)" placeholderTextColor={COLORS.muted} value={apt} onChangeText={setApt} />
          {isDesktop ? (
            <View style={s.fieldRow}>
              <TextInput style={[inputStyle, { flex: 1 }]} placeholder="City" placeholderTextColor={COLORS.muted} value={city} onChangeText={setCity} />
              <View style={[inputStyle, s.selectField, { flex: 1 }]}>
                <Text style={s.selectValue}>Province</Text>
                <Text style={s.chevron}>›</Text>
              </View>
              <TextInput style={[inputStyle, { flex: 1 }]} placeholder="Postal code" placeholderTextColor={COLORS.muted} value={postalCode} onChangeText={setPostalCode} />
            </View>
          ) : (
            <>
              <TextInput style={inputStyle} placeholder="City" placeholderTextColor={COLORS.muted} value={city} onChangeText={setCity} />
              <TextInput style={inputStyle} placeholder="Postal code" placeholderTextColor={COLORS.muted} value={postalCode} onChangeText={setPostalCode} />
            </>
          )}
        </View>

        {/* Shipping method */}
        <Text style={s.subSectionTitle}>Shipping method</Text>
        <View style={s.shippingInfo}>
          <Text style={s.shippingInfoText}>
            Enter your shipping address to view available shipping methods
          </Text>
        </View>
      </View>

      {/* Payment */}
      <View style={s.section}>
        <FormSection title="Payment" />
        <Text style={s.secureText}>All transactions are secure and encrypted</Text>

        <View style={s.choiceGroup}>
          {([['card', 'Credit card'], ['paypal', 'PayPal'], ['cod', 'Cash on Delivery (COD)']] as [PaymentMethod, string][]).map(([method, label]) => (
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

      <View style={s.promoRow}>
        <TextInput
          style={[inputStyle, { flex: 1 }]}
          placeholder="Discount code"
          placeholderTextColor={COLORS.muted}
          value={discountCode}
          onChangeText={setDiscountCode}
        />
        <TouchableOpacity style={s.applyBtn} onPress={showPromoApplied}>
          <Text style={s.applyText}>Apply</Text>
        </TouchableOpacity>
      </View>

      {[
        { label: 'Subtotal • 3 items', value: '36 KWD' },
        { label: 'Shipping', value: 'Enter address' },
        { label: 'Estimated taxes', value: '1.8 KWD' },
      ].map(({ label, value }) => (
        <View key={label} style={s.lineItem}>
          <Text style={s.lineLabel}>{label}</Text>
          <Text style={s.lineValue}>{value}</Text>
        </View>
      ))}

      <View style={s.totalRow}>
        <Text style={s.totalLabel}>Total</Text>
        <Text style={s.totalValue}>37.8 KWD</Text>
      </View>

      <TouchableOpacity style={s.payBtn} onPress={() => showOrderPlaced(navigation)}>
        <Text style={s.payBtnText}>PAY NOW</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <PageLayout
      menu={<SideMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />}
      header={<SiteHeader onMenuPress={() => setMenuOpen(true)} />}
    >
        <MaxWidthContainer>
          {isDesktop ? (
            <View style={s.desktopLayout}>
              <CheckoutForm />
              <OrderSummary />
            </View>
          ) : (
            <>
              <CheckoutForm />
              <OrderSummary />
            </>
          )}
        </MaxWidthContainer>
    </PageLayout>
  );
}

const s = StyleSheet.create({
  desktopLayout: { flexDirection: 'row', alignItems: 'flex-start' },

  formCol: { padding: 21 },
  formColDesktop: { flex: 1, padding: 38, maxWidth: 641 },

  summaryCol: { padding: 21 },
  summaryColDesktop: {
    width: 582,
    padding: 38,
    backgroundColor: COLORS.lightGrey,
    borderLeftWidth: 1,
    borderLeftColor: '#D6D6D6',
    minHeight: 600,
  },

  section: { gap: 14, marginBottom: 28 },
  sectionTitle: { fontFamily: FONTS.clashSemibold, fontSize: 18, color: COLORS.black, marginBottom: 4 },
  subSectionTitle: { fontFamily: FONTS.clashMedium, fontSize: 16, color: COLORS.black, marginTop: 8 },
  secureText: { fontFamily: FONTS.dmRegular, fontSize: 14, color: COLORS.muted },

  input: {
    height: 52,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 11,
    fontFamily: FONTS.dmRegular,
    fontSize: 14,
    color: COLORS.black,
    backgroundColor: COLORS.white,
  },
  inputDesktop: {},
  selectField: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selectValue: { fontFamily: FONTS.dmRegular, fontSize: 14, color: COLORS.black },
  chevron: { fontFamily: FONTS.clashRegular, fontSize: 18, color: COLORS.muted, transform: [{ rotate: '90deg' }] },

  fieldGroup: { gap: 14 },
  fieldRow: { flexDirection: 'row', gap: 14 },
  cardFields: { gap: 14 },

  choiceGroup: { borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' },
  choice: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  choiceSelected: { backgroundColor: '#EFF5FF', borderColor: COLORS.primary },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 1, borderColor: COLORS.border },
  radioSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primary },
  choiceLabel: { fontFamily: FONTS.dmRegular, fontSize: 14, color: COLORS.black },

  shippingInfo: { backgroundColor: COLORS.lightGrey, padding: 14 },
  shippingInfoText: { fontFamily: FONTS.dmRegular, fontSize: 14, color: COLORS.muted },

  promoRow: { flexDirection: 'row', gap: 14, marginBottom: 16 },
  applyBtn: { height: 52, paddingHorizontal: 16, backgroundColor: COLORS.lightGrey, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  applyText: { fontFamily: FONTS.dmMedium, fontSize: 14, color: COLORS.black },

  lineItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  lineLabel: { fontFamily: FONTS.dmRegular, fontSize: 14, color: COLORS.black },
  lineValue: { fontFamily: FONTS.dmRegular, fontSize: 14, color: COLORS.black },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, marginBottom: 16 },
  totalLabel: { fontFamily: FONTS.dmSemibold, fontSize: 19, color: COLORS.black },
  totalValue: { fontFamily: FONTS.dmSemibold, fontSize: 19, color: COLORS.black },

  payBtn: { height: 75, backgroundColor: COLORS.secondary, alignItems: 'center', justifyContent: 'center' },
  payBtnText: { fontFamily: FONTS.clashSemibold, fontSize: 16, color: COLORS.white, textTransform: 'uppercase', letterSpacing: 1.4 },
});
