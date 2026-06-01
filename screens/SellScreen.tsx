import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SiteHeader from '../components/layout/SiteHeader';
import SiteFooter from '../components/layout/SiteFooter';
import SideMenu from '../components/layout/SideMenu';
import { COLORS, FONTS, BREAKPOINT } from '../constants/brand';

const WHATSAPP_NUMBER = '+96597226735';

export default function SellScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= BREAKPOINT;
  const [menuOpen, setMenuOpen] = useState(false);

  const handleWhatsApp = () => {
    const url = `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}`;
    Linking.openURL(url).catch(() => {});
  };

  const headlineSize = isDesktop ? 60 : 32;
  const bodySize = isDesktop ? 32 : 20;
  const bodyLine = isDesktop ? 35 : 25;
  const uploadW = isDesktop ? 337 : 237;
  const uploadH = isDesktop ? 435 : 295;
  const btnW = isDesktop ? 337 : 342;
  const btnH = isDesktop ? 87 : 50;
  const btnFontSize = isDesktop ? 24 : 16;

  const content = (
    <View style={[s.body, isDesktop && s.bodyDesktop]}>
      {/* Copy block */}
      <View style={[s.copyBlock, isDesktop && s.copyBlockDesktop]}>
        <Text style={[s.headline, { fontSize: headlineSize, lineHeight: headlineSize + 2 }]}>
          YOUR PIECE IS REALLY ONE OF A KIND?
        </Text>
        <Text style={[s.bodyText, { fontSize: bodySize, lineHeight: bodyLine }]}>
          What if you could find a new home for it without the hassle?
        </Text>
        <Text style={[s.bodyText, { fontSize: bodySize, lineHeight: bodyLine }]}>
          Reach out to us and we'll take care of everything...
        </Text>
        <Text style={[s.accentText, { fontSize: bodySize, lineHeight: bodyLine }]}>
          starting with how much you're going to make
        </Text>
      </View>

      {/* Upload + CTA block */}
      <View style={[s.rightBlock, isDesktop && s.rightBlockDesktop]}>
        <TouchableOpacity style={[s.uploadBox, { width: uploadW, height: uploadH }]}>
          <Text style={[s.uploadLabel, isDesktop && { fontSize: 24, lineHeight: 30 }]}>
            Upload a photo of what you would like to sell
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.chatBtn, { width: btnW, height: btnH }]}
          onPress={handleWhatsApp}
          activeOpacity={0.85}
        >
          <Text style={[s.chatIcon, { fontSize: btnFontSize }]}>💬</Text>
          <Text style={[s.chatText, { fontSize: btnFontSize }]}>LET'S CHAT</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <SideMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <SiteHeader onMenuPress={() => setMenuOpen(true)} />
        {content}
        <SiteFooter />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.white },

  body: { paddingHorizontal: 19, paddingVertical: 32, gap: 40 },
  bodyDesktop: {
    flexDirection: 'row',
    paddingHorizontal: 150,
    paddingVertical: 80,
    gap: 60,
    alignItems: 'flex-start',
  },

  copyBlock: { gap: 20 },
  copyBlockDesktop: { flex: 1, maxWidth: 704 },

  headline: {
    fontFamily: FONTS.clashMedium,
    color: COLORS.primary,
  },
  bodyText: {
    fontFamily: FONTS.clashMedium,
    color: COLORS.primary,
  },
  accentText: {
    fontFamily: FONTS.clashSemibold,
    color: COLORS.secondary,
  },

  rightBlock: { alignItems: 'center', gap: 24 },
  rightBlockDesktop: { alignItems: 'flex-start' },

  uploadBox: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  uploadLabel: {
    fontFamily: FONTS.clashMedium,
    fontSize: 16,
    color: COLORS.olive,
    textAlign: 'justify',
    lineHeight: 22,
  },

  chatBtn: {
    backgroundColor: COLORS.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    paddingHorizontal: 32,
    overflow: 'hidden',
  },
  chatIcon: { color: COLORS.white },
  chatText: {
    fontFamily: FONTS.clashMedium,
    color: COLORS.white,
    lineHeight: 30,
  },
});
