import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  useWindowDimensions,
  ScrollView,
  Modal,
  FlatList,
  Animated,
} from 'react-native';
import SiteHeader from '../components/layout/SiteHeader';
import PageLayout from '../components/layout/PageLayout';
import SideMenu from '../components/layout/SideMenu';
import MaxWidthContainer from '../components/layout/MaxWidthContainer';
import { COLORS, FONTS, BREAKPOINT, SCREEN_PADDING } from '../constants/brand';
import { openWhatsApp } from '../utils/interactions';

type Condition = 'worn' | 'fair' | 'good' | 'excellent' | 'never-worn';

const POPULAR_BRANDS = [
  'Vintage',
  'Unknown',
  'Chanel',
  'Louis Vuitton',
  'Gucci',
  'Hermès',
  'Prada',
  'Dior',
  'Fendi',
  'Burberry',
  'Givenchy',
  'Céline',
  'Balenciaga',
  'Valentino',
  'Versace',
  'Dolce & Gabbana',
  'Coach',
  'Michael Kors',
  'Mulberry',
  'Bottega Veneta',
  'Saint Laurent',
  'Miu Miu',
  'Bally',
  'Salvatore Ferragamo',
  'Tod\'s',
  'Longchamp',
  'Marcella',
];

const CONDITIONS: { label: string; value: Condition }[] = [
  { label: 'Never Worn', value: 'never-worn' },
  { label: 'Excellent', value: 'excellent' },
  { label: 'Good', value: 'good' },
  { label: 'Fair', value: 'fair' },
  { label: 'Worn', value: 'worn' },
];

// Condition multipliers (0-1 scale)
const CONDITION_MULTIPLIERS: Record<Condition, number> = {
  'never-worn': 0.7,
  excellent: 0.6,
  good: 0.5,
  fair: 0.35,
  worn: 0.2,
};

const COMMISSION_RATE = 0.2;

export default function PricingEstimatorScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= BREAKPOINT;
  const [menuOpen, setMenuOpen] = useState(false);
  const [brandDropdownOpen, setBrandDropdownOpen] = useState(false);
  const [brandCustomInput, setBrandCustomInput] = useState('');

  const [brand, setBrand] = useState('');
  const [year, setYear] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [condition, setCondition] = useState<Condition>('good');
  const [submitted, setSubmitted] = useState(false);

  const calculatorSlideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (submitted && isDesktop) {
      Animated.timing(calculatorSlideAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    } else {
      calculatorSlideAnim.setValue(0);
    }
  }, [submitted, isDesktop, calculatorSlideAnim]);

  const handleBrandSelect = (selectedBrand: string) => {
    setBrand(selectedBrand);
    setBrandCustomInput('');
    setBrandDropdownOpen(false);
  };

  const estimatedValue = originalPrice ? parseFloat(originalPrice) * CONDITION_MULTIPLIERS[condition] : 0;
  const commission = estimatedValue * COMMISSION_RATE;
  const earnings = estimatedValue - commission;

  const handleSubmit = () => {
    if (brand.trim() && year.trim() && originalPrice.trim()) {
      setSubmitted(true);
    }
  };

  const handleReset = () => {
    setBrand('');
    setYear('');
    setOriginalPrice('');
    setCondition('good');
    setSubmitted(false);
  };

  return (
    <PageLayout
      menu={<SideMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />}
      header={<SiteHeader onMenuPress={() => setMenuOpen(true)} />}
    >
      <ScrollView>
        <MaxWidthContainer>
          {/* Page Title */}
          <View style={[s.titleSection, { paddingHorizontal: isDesktop ? SCREEN_PADDING.desktop : 16 }]}>
            <Text style={[s.pageTitle, isDesktop && { fontSize: 56 }]}>PRICING ESTIMATOR</Text>
            <Text style={[s.subtitle, isDesktop && { fontSize: 17 }]}>
              Discover how much your bag could earn
            </Text>
          </View>

          {/* Main Layout: Calculator on left, Results on right (or stacked on mobile) */}
          <View style={[s.mainContainer, isDesktop && s.mainContainerDesktop, { paddingHorizontal: isDesktop ? SCREEN_PADDING.desktop : 16 }]}>
            {/* Calculator/Form - Left Column */}
            <Animated.View
              style={[
                s.calculatorContainer,
                isDesktop && s.calculatorDesktop,
                isDesktop && {
                  transform: [
                    {
                      translateX: calculatorSlideAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -160],
                      }),
                    },
                  ],
                },
              ]}
            >
              <View style={[s.formContainer, { paddingHorizontal: isDesktop ? 32 : 16 }]}>
                {/* Brand Dropdown */}
                <View style={s.formGroup}>
                  <Text style={s.label}>Brand</Text>
                  <TouchableOpacity
                    style={s.brandDropdownBtn}
                    onPress={() => setBrandDropdownOpen(true)}
                  >
                    <Text style={[s.brandDropdownText, !brand && s.brandDropdownPlaceholder]}>
                      {brand || 'Select a brand'}
                    </Text>
                    <Text style={s.dropdownArrow}>▼</Text>
                  </TouchableOpacity>
                </View>

                {/* Brand Dropdown Modal */}
                <Modal
                  visible={brandDropdownOpen}
                  transparent
                  animationType="fade"
                  onRequestClose={() => setBrandDropdownOpen(false)}
                >
                  <TouchableOpacity
                    style={s.dropdownOverlay}
                    activeOpacity={1}
                    onPress={() => setBrandDropdownOpen(false)}
                  >
                    <View style={s.dropdownMenu}>
                      <FlatList
                        data={POPULAR_BRANDS}
                        keyExtractor={(item) => item}
                        renderItem={({ item }) => (
                          <TouchableOpacity
                            style={s.dropdownItem}
                            onPress={() => handleBrandSelect(item)}
                          >
                            <Text style={s.dropdownItemText}>{item}</Text>
                          </TouchableOpacity>
                        )}
                        scrollEnabled
                        nestedScrollEnabled
                      />
                      <View style={s.dropdownDivider} />
                      <View style={s.brandCustomInputContainer}>
                        <TextInput
                          style={s.brandCustomInput}
                          placeholder="Or type another brand"
                          placeholderTextColor={COLORS.muted}
                          value={brandCustomInput}
                          onChangeText={setBrandCustomInput}
                          autoCapitalize="words"
                        />
                        {brandCustomInput.trim() && (
                          <TouchableOpacity
                            style={s.brandCustomBtn}
                            onPress={() => handleBrandSelect(brandCustomInput.trim())}
                          >
                            <Text style={s.brandCustomBtnText}>ADD</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                </Modal>

                {/* Year Input */}
                <View style={s.formGroup}>
                  <Text style={s.label}>Year Purchased</Text>
                  <TextInput
                    style={s.input}
                    placeholder="e.g., 2020"
                    placeholderTextColor={COLORS.muted}
                    value={year}
                    onChangeText={setYear}
                    keyboardType="number-pad"
                    maxLength={4}
                  />
                </View>

                {/* Original Price Input */}
                <View style={s.formGroup}>
                  <Text style={s.label}>Original Purchase Price (KWD)</Text>
                  <TextInput
                    style={s.input}
                    placeholder="e.g., 500"
                    placeholderTextColor={COLORS.muted}
                    value={originalPrice}
                    onChangeText={setOriginalPrice}
                    keyboardType="decimal-pad"
                  />
                </View>

                {/* Condition Selector */}
                <View style={s.formGroup}>
                  <Text style={s.label}>Condition</Text>
                  <View style={s.conditionGrid}>
                    {CONDITIONS.map(({ label, value }) => (
                      <TouchableOpacity
                        key={value}
                        style={[s.conditionBtn, condition === value && s.conditionBtnActive]}
                        onPress={() => setCondition(value)}
                      >
                        <Text style={[s.conditionText, condition === value && s.conditionTextActive]}>
                          {label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Submit Button */}
                <TouchableOpacity style={s.estimateBtn} onPress={handleSubmit}>
                  <Text style={s.estimateBtnText}>GET ESTIMATE</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>

            {/* Results - Right Column (only when submitted) */}
            {submitted && (
              <View style={[s.resultContainer, isDesktop && s.resultDesktop, { paddingHorizontal: isDesktop ? 32 : 16 }]}>
                {/* Item Summary */}
                <View style={s.itemSummary}>
                  <Text style={s.summaryLabel}>{brand} • {year}</Text>
                  <Text style={s.summarySubtext}>Original price: {originalPrice} KWD • {CONDITIONS.find(c => c.value === condition)?.label}</Text>
                </View>

                {/* Divider */}
                <View style={s.divider} />

                {/* Breakdown */}
                <View style={s.breakdown}>
                  <View style={s.breakdownRow}>
                    <Text style={s.breakdownLabel}>Estimated Value</Text>
                    <Text style={s.breakdownValue}>{estimatedValue.toFixed(2)} KWD</Text>
                  </View>

                  <View style={s.breakdownRow}>
                    <Text style={s.breakdownLabel}>Erlume Commission (20%)</Text>
                    <Text style={s.breakdownValue}>-{commission.toFixed(2)} KWD</Text>
                  </View>

                  <View style={[s.breakdownRow, s.earningsRow]}>
                    <Text style={s.earningsLabel}>You Earn</Text>
                    <Text style={s.earningsValue}>{earnings.toFixed(2)} KWD</Text>
                  </View>
                </View>

                {/* WhatsApp CTA */}
                <TouchableOpacity
                  style={s.whatsappBtn}
                  onPress={() => openWhatsApp(`Hi! I'm interested in selling my ${brand} bag from ${year}.`)}
                >
                  <Text style={s.whatsappBtnText}>START CHAT ON WHATSAPP</Text>
                </TouchableOpacity>

                {/* Edit Button */}
                <TouchableOpacity style={s.editBtn} onPress={handleReset}>
                  <Text style={s.editBtnText}>CALCULATE ANOTHER</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={{ height: 48 }} />
        </MaxWidthContainer>
      </ScrollView>
    </PageLayout>
  );
}

const s = StyleSheet.create({
  titleSection: {
    paddingTop: 40,
    paddingBottom: 32,
    gap: 12,
  },
  pageTitle: {
    fontFamily: FONTS.clashMedium,
    fontSize: 36,
    color: COLORS.primary,
    lineHeight: 40,
  },
  subtitle: {
    fontFamily: FONTS.dmRegular,
    fontSize: 15,
    color: COLORS.muted,
    lineHeight: 24,
  },

  mainContainer: {
    flexDirection: 'column',
    gap: 24,
    alignItems: 'center',
  },
  mainContainerDesktop: {
    flexDirection: 'row',
    gap: 32,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },

  calculatorContainer: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    width: 450,
  },
  calculatorDesktop: {
    width: 450,
  },

  formContainer: {
    paddingVertical: 32,
    gap: 24,
  },

  formGroup: {
    gap: 8,
  },
  label: {
    fontFamily: FONTS.clashMedium,
    fontSize: 13,
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    fontFamily: FONTS.dmRegular,
    fontSize: 15,
    color: COLORS.black,
  },

  brandDropdownBtn: {
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  brandDropdownText: {
    fontFamily: FONTS.dmRegular,
    fontSize: 15,
    color: COLORS.black,
  },
  brandDropdownPlaceholder: {
    color: COLORS.muted,
  },
  dropdownArrow: {
    fontSize: 10,
    color: COLORS.muted,
  },

  dropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownMenu: {
    width: '85%',
    maxHeight: '60%',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGrey,
  },
  dropdownItemText: {
    fontFamily: FONTS.dmRegular,
    fontSize: 14,
    color: COLORS.black,
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  brandCustomInputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  brandCustomInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 8,
    fontFamily: FONTS.dmRegular,
    fontSize: 13,
    color: COLORS.black,
  },
  brandCustomBtn: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandCustomBtnText: {
    fontFamily: FONTS.clashMedium,
    fontSize: 11,
    color: COLORS.white,
    textTransform: 'uppercase',
  },

  conditionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  conditionBtn: {
    flex: 1,
    minWidth: '30%',
    height: 44,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
  conditionBtnActive: {
    borderColor: COLORS.secondary,
    backgroundColor: 'rgba(197,112,93,0.1)',
  },
  conditionText: {
    fontFamily: FONTS.dmRegular,
    fontSize: 12,
    color: COLORS.muted,
    textAlign: 'center',
  },
  conditionTextActive: {
    color: COLORS.secondary,
    fontFamily: FONTS.dmSemibold,
  },

  estimateBtn: {
    height: 60,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  estimateBtnText: {
    fontFamily: FONTS.clashMedium,
    fontSize: 14,
    color: COLORS.white,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },

  resultContainer: {
    paddingVertical: 32,
    gap: 24,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    width: 450,
  },
  resultDesktop: {
    width: 450,
    paddingVertical: 32,
  },

  itemSummary: {
    gap: 4,
  },
  summaryLabel: {
    fontFamily: FONTS.clashMedium,
    fontSize: 14,
    color: COLORS.primary,
    textTransform: 'uppercase',
  },
  summarySubtext: {
    fontFamily: FONTS.dmRegular,
    fontSize: 13,
    color: COLORS.muted,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
  },

  breakdown: {
    gap: 12,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownLabel: {
    fontFamily: FONTS.dmRegular,
    fontSize: 13,
    color: COLORS.muted,
  },
  breakdownValue: {
    fontFamily: FONTS.dmSemibold,
    fontSize: 14,
    color: COLORS.black,
  },

  earningsRow: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  earningsLabel: {
    fontFamily: FONTS.clashMedium,
    fontSize: 14,
    color: COLORS.primary,
  },
  earningsValue: {
    fontFamily: FONTS.clashMedium,
    fontSize: 18,
    color: COLORS.secondary,
  },

  whatsappBtn: {
    height: 60,
    backgroundColor: 'rgba(37,211,102,0.1)',
    borderWidth: 2,
    borderColor: '#25D366',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  whatsappBtnText: {
    fontFamily: FONTS.clashMedium,
    fontSize: 13,
    color: '#25D366',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  editBtn: {
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  editBtnText: {
    fontFamily: FONTS.clashMedium,
    fontSize: 12,
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
