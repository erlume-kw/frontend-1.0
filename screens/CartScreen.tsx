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
import { showPromoApplied } from '../utils/interactions';

const PRODUCT_IMG = 'https://www.figma.com/api/mcp/asset/72c8b842-0787-4fe0-9911-5e1681b701b6';

const INITIAL_ITEMS = [
  { id: '1', brand: 'CHLOE', name: 'TOP-HANDLE BAG', price: '234 KWD', qty: 1, sold: false },
  { id: '2', brand: 'CHLOE', name: 'TOP-HANDLE BAG', price: '234 KWD', qty: 1, sold: false },
  { id: '3', brand: 'CHLOE', name: 'TOP-HANDLE BAG', price: '234 KWD', qty: 1, sold: true },
];

export default function CartScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= BREAKPOINT;
  const [menuOpen, setMenuOpen] = useState(false);
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [promoCode, setPromoCode] = useState('');
  const navigation = useNavigation();

  const removeItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id));

  const activeItems = items.filter(i => !i.sold);
  const subtotal = activeItems.reduce((sum, i) => sum + (parseInt(i.price) || 0), 0);

  const OrderSummary = () => (
    <View style={[s.summary, isDesktop && s.summaryDesktop]}>
      <Text style={[s.summaryTitle, isDesktop && { fontSize: 36 }]}>TOTAL</Text>

      <View style={s.promoRow}>
        <TextInput
          style={s.promoInput}
          placeholder="Promo code"
          placeholderTextColor={COLORS.muted}
          value={promoCode}
          onChangeText={setPromoCode}
          autoCapitalize="none"
        />
        <TouchableOpacity style={s.applyBtn} onPress={showPromoApplied}>
          <Text style={s.applyText}>APPLY</Text>
        </TouchableOpacity>
      </View>

      {[
        { label: 'Shipping', value: 'Free' },
        { label: 'Tax', value: '0 KWD' },
        { label: 'Subtotal', value: `${subtotal} KWD` },
        { label: 'Total', value: `${subtotal} KWD` },
      ].map(({ label, value }) => (
        <View key={label} style={s.lineItem}>
          <Text style={s.lineLabel}>{label}</Text>
          <Text style={s.lineValue}>{value}</Text>
        </View>
      ))}

      <TouchableOpacity
        style={s.checkoutBtn}
        onPress={() => navigation.navigate('Checkout' as never)}
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

              {items.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={[s.itemRow, item.sold && s.itemRowSold, isDesktop && s.itemRowDesktop]}
                  activeOpacity={0.85}
                  onPress={() => (navigation.navigate as Function)('ProductDetail', { productId: item.id })}
                >
                  <View style={[s.itemImgWrap, item.sold && s.itemImgSold]}>
                    <Image source={{ uri: PRODUCT_IMG }} style={s.itemImg as ImageStyle} resizeMode="cover" />
                  </View>

                  <View style={s.itemInfo}>
                    <Text style={[s.itemBrand, item.sold && s.itemTextMuted, isDesktop && { fontSize: 24 }]}>
                      {item.brand}
                    </Text>
                    <Text style={[s.itemName, item.sold && s.itemTextMuted]}>
                      {item.name}
                    </Text>
                    {item.sold ? (
                      <Text style={s.soldLabel}>SOLD</Text>
                    ) : (
                      <View style={s.priceRow}>
                        <Text style={s.strikePrice}>{item.price}</Text>
                        <Text style={s.activePrice}>{item.price}</Text>
                      </View>
                    )}
                  </View>

                  <TouchableOpacity
                    style={s.itemControls}
                    onPress={e => { e.stopPropagation?.(); removeItem(item.id); }}
                  >
                    <Text style={[s.removeBtn, item.sold && s.removeBtnBold]}>REMOVE</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
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
  priceRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  strikePrice: { fontFamily: FONTS.clashMedium, fontSize: 12, color: COLORS.olive, textDecorationLine: 'line-through' },
  activePrice: { fontFamily: FONTS.clashMedium, fontSize: 12, color: COLORS.secondary, textTransform: 'uppercase' },

  itemControls: { alignItems: 'flex-end', justifyContent: 'space-between', paddingVertical: 4 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  qtyBtn: { fontFamily: FONTS.clashMedium, fontSize: 18, color: COLORS.black, width: 24, textAlign: 'center' },
  qtyNum: { fontFamily: FONTS.clashMedium, fontSize: 16, color: COLORS.black, minWidth: 20, textAlign: 'center' },
  removeBtn: { fontFamily: FONTS.clashMedium, fontSize: 12, color: COLORS.secondary, textTransform: 'uppercase' },
  removeBtnBold: { fontFamily: FONTS.clashSemibold },

  summary: { padding: 16 },
  // paddingTop: 16 matches pageTitle's top so headings sit on the same baseline.
  // paddingLeft: 24 gives inner breathing room; no paddingRight so the checkout
  // button's right edge aligns with the header/footer boundary.
  summaryDesktop: { width: 428, paddingLeft: 24, paddingTop: 16, paddingBottom: 24 },
  summaryTitle: { fontFamily: FONTS.clashMedium, fontSize: 24, color: COLORS.black, marginBottom: 16 },

  promoRow: { flexDirection: 'row', height: 50, backgroundColor: COLORS.lightGrey, marginBottom: 16, overflow: 'hidden' },
  promoInput: { flex: 1, paddingHorizontal: 12, fontFamily: FONTS.clashMedium, fontSize: 16, color: COLORS.black },
  applyBtn: { width: 100, backgroundColor: COLORS.secondary, alignItems: 'center', justifyContent: 'center' },
  applyText: { fontFamily: FONTS.clashMedium, fontSize: 16, color: COLORS.white },

  lineItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  lineLabel: { fontFamily: FONTS.dmRegular, fontSize: 13, color: COLORS.muted },
  lineValue: { fontFamily: FONTS.dmSemibold, fontSize: 13, color: COLORS.black },

  checkoutBtn: { height: 75, backgroundColor: COLORS.secondary, alignItems: 'center', justifyContent: 'center', marginTop: 16 },
  checkoutText: { fontFamily: FONTS.clashMedium, fontSize: 16, color: COLORS.white, textTransform: 'uppercase', letterSpacing: 1.4 },
});
