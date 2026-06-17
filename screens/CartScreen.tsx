import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  StyleSheet,
  useWindowDimensions,
  ImageStyle,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import SiteHeader from '../components/layout/SiteHeader';
import PageLayout from '../components/layout/PageLayout';
import SideMenu from '../components/layout/SideMenu';
import MaxWidthContainer from '../components/layout/MaxWidthContainer';
import { COLORS, FONTS, BREAKPOINT, SCREEN_PADDING } from '../constants/brand';
import { useCart } from '../contexts/CartContext';
import { validateDiscountCode } from '../services/api';

export default function CartScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= BREAKPOINT;
  const [menuOpen, setMenuOpen] = useState(false);
  const navigation = useNavigation();
  const { items, removeItem, subtotal } = useCart();

  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState('');
  const [discount, setDiscount] = useState(0);

  const activeItems = items.filter(i => !i.isSold);
  const total = Math.max(0, subtotal - discount);

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    try {
      const result = await validateDiscountCode(promoCode.trim(), subtotal);
      setDiscount(result.discountAmount);
      setPromoError('');
    } catch (e: any) {
      setPromoError(e.message ?? 'Invalid promo code');
      setDiscount(0);
    }
  };

  const OrderSummary = () => (
    <View style={[s.summary, isDesktop && s.summaryDesktop]}>
      <Text style={[s.summaryTitle, isDesktop && { fontSize: 36 }]}>TOTAL</Text>

      <View style={s.promoRow}>
        <TextInput
          style={s.promoInput}
          placeholder="Promo code"
          placeholderTextColor={COLORS.muted}
          value={promoCode}
          onChangeText={v => { setPromoCode(v); setPromoError(''); }}
          autoCapitalize="none"
        />
        <TouchableOpacity style={s.applyBtn} onPress={handleApplyPromo}>
          <Text style={s.applyText}>APPLY</Text>
        </TouchableOpacity>
      </View>
      {!!promoError && <Text style={s.promoError}>{promoError}</Text>}
      {discount > 0 && <Text style={s.promoSuccess}>Discount applied: -{discount.toFixed(2)} KWD</Text>}

      {[
        { label: 'Shipping', value: 'Free' },
        { label: 'Tax', value: '0 KWD' },
        { label: 'Subtotal', value: `${subtotal.toFixed(2)} KWD` },
        { label: 'Total', value: `${total.toFixed(2)} KWD` },
      ].map(({ label, value }) => (
        <View key={label} style={s.lineItem}>
          <Text style={s.lineLabel}>{label}</Text>
          <Text style={s.lineValue}>{value}</Text>
        </View>
      ))}

      <TouchableOpacity
        style={[s.checkoutBtn, activeItems.length === 0 && s.checkoutBtnDisabled]}
        onPress={() => activeItems.length > 0 && navigation.navigate('Checkout' as never)}
        activeOpacity={activeItems.length > 0 ? 0.85 : 1}
      >
        <Text style={s.checkoutText}>CHECKOUT</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <PageLayout
      menu={<SideMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />}
      header={<SiteHeader onMenuPress={() => setMenuOpen(true)} />}
    >
      <MaxWidthContainer style={isDesktop ? [s.desktopPad, s.desktopBottom] : undefined}>
        <View style={isDesktop ? s.desktopLayout : undefined}>
          {/* Cart items */}
          <View style={isDesktop ? s.desktopItems : undefined}>
            <Text style={[s.pageTitle, isDesktop && { fontSize: 36, paddingHorizontal: 0 }]}>
              YOUR CART ({activeItems.length})
            </Text>

            {items.length === 0 ? (
              <Text style={s.emptyText}>Your cart is empty.</Text>
            ) : (
              items.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={[s.itemRow, item.isSold && s.itemRowSold, isDesktop && s.itemRowDesktop]}
                  activeOpacity={0.85}
                  onPress={() => (navigation.navigate as Function)('ProductDetail', { productId: item.id })}
                >
                  <View style={[s.itemImgWrap, item.isSold && s.itemImgSold]}>
                    {item.imageUri ? (
                      <Image source={{ uri: item.imageUri }} style={s.itemImg as ImageStyle} resizeMode="cover" />
                    ) : null}
                  </View>

                  <View style={s.itemInfo}>
                    <Text style={[s.itemBrand, item.isSold && s.itemTextMuted, isDesktop && { fontSize: 24 }]}>
                      {item.brand}
                    </Text>
                    <Text style={[s.itemName, item.isSold && s.itemTextMuted]}>
                      {item.name}
                    </Text>
                    {item.isSold ? (
                      <Text style={s.soldLabel}>SOLD</Text>
                    ) : (
                      <Text style={s.activePrice}>{item.price}</Text>
                    )}
                  </View>

                  <TouchableOpacity
                    style={s.itemControls}
                    onPress={e => { e.stopPropagation?.(); removeItem(item.id); }}
                    hitSlop={8}
                  >
                    <Text style={[s.removeBtn, item.isSold && s.removeBtnBold]}>REMOVE</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))
            )}
          </View>

          <OrderSummary />
        </View>
      </MaxWidthContainer>
    </PageLayout>
  );
}

const s = StyleSheet.create({
  desktopPad: { paddingHorizontal: SCREEN_PADDING.desktop },
  desktopBottom: { paddingBottom: 48 },
  pageTitle: { fontFamily: FONTS.clashMedium, fontSize: 24, color: COLORS.black, padding: 16, marginBottom: 4 },
  emptyText: { fontFamily: FONTS.dmRegular, fontSize: 16, color: COLORS.muted, padding: 16 },

  desktopLayout: { flexDirection: 'row', alignItems: 'flex-start' },
  desktopItems: { flex: 1 },

  itemRow: { flexDirection: 'row', padding: 16, gap: 12 },
  itemRowDesktop: { paddingHorizontal: 0 },
  itemRowSold: {},
  itemImgWrap: { width: 137, height: 145, backgroundColor: 'rgba(197,112,93,0.2)' },
  itemImgSold: { backgroundColor: COLORS.lightGrey },
  itemImg: { width: '100%', height: '100%' },

  itemInfo: { flex: 1, justifyContent: 'flex-start', gap: 4 },
  itemBrand: { fontFamily: FONTS.clashMedium, fontSize: 16, color: COLORS.black, textTransform: 'uppercase' },
  itemName: { fontFamily: FONTS.clashMedium, fontSize: 12, color: COLORS.black, textTransform: 'uppercase' },
  itemTextMuted: { color: COLORS.grey },
  soldLabel: { fontFamily: FONTS.clashMedium, fontSize: 12, color: COLORS.secondary, textTransform: 'uppercase' },
  activePrice: { fontFamily: FONTS.clashMedium, fontSize: 14, color: COLORS.secondary },

  itemControls: { alignItems: 'flex-end', justifyContent: 'flex-start', paddingVertical: 4 },
  removeBtn: { fontFamily: FONTS.clashMedium, fontSize: 12, color: COLORS.secondary, textTransform: 'uppercase' },
  removeBtnBold: { fontFamily: FONTS.clashSemibold },

  summary: { padding: 16 },
  summaryDesktop: { width: 428, paddingLeft: 24, paddingTop: 16, paddingBottom: 24 },
  summaryTitle: { fontFamily: FONTS.clashMedium, fontSize: 24, color: COLORS.black, marginBottom: 16 },

  promoRow: { flexDirection: 'row', height: 50, backgroundColor: COLORS.lightGrey, marginBottom: 8, overflow: 'hidden' },
  promoInput: { flex: 1, paddingHorizontal: 12, fontFamily: FONTS.clashMedium, fontSize: 16, color: COLORS.black },
  applyBtn: { width: 100, backgroundColor: COLORS.secondary, alignItems: 'center', justifyContent: 'center' },
  applyText: { fontFamily: FONTS.clashMedium, fontSize: 16, color: COLORS.white },
  promoError: { fontFamily: FONTS.dmRegular, fontSize: 13, color: COLORS.error, marginBottom: 8 },
  promoSuccess: { fontFamily: FONTS.dmRegular, fontSize: 13, color: COLORS.olive, marginBottom: 8 },

  lineItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  lineLabel: { fontFamily: FONTS.dmRegular, fontSize: 13, color: COLORS.muted },
  lineValue: { fontFamily: FONTS.dmSemibold, fontSize: 13, color: COLORS.black },

  checkoutBtn: { height: 75, backgroundColor: COLORS.secondary, alignItems: 'center', justifyContent: 'center', marginTop: 16 },
  checkoutBtnDisabled: { opacity: 0.4 },
  checkoutText: { fontFamily: FONTS.clashMedium, fontSize: 16, color: COLORS.white, textTransform: 'uppercase', letterSpacing: 1.4 },
});
