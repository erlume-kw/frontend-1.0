import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import SiteHeader from '../components/layout/SiteHeader';
import PageLayout from '../components/layout/PageLayout';
import SideMenu from '../components/layout/SideMenu';
import { COLORS, FONTS, BREAKPOINT, SCREEN_PADDING } from '../constants/brand';
import { openWhatsApp } from '../utils/interactions';

export default function SellScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= BREAKPOINT;
  const [menuOpen, setMenuOpen] = useState(false);

  const handleWhatsApp = (prefill?: string) => {
    openWhatsApp(prefill);
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
        <TouchableOpacity
          style={[s.uploadBox, { width: uploadW, height: uploadH }]}
          onPress={() =>
            handleWhatsApp("Hi, I'd like to sell an item with erlume. I'll send photos shortly.")
          }
        >
          <Text style={[s.uploadLabel, isDesktop && { fontSize: 24, lineHeight: 30 }]}>
            Upload a photo of what you would like to sell
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.chatBtn, { width: btnW, height: btnH }]}
          onPress={() => handleWhatsApp()}
          activeOpacity={0.85}
        >
          <Text style={[s.chatIcon, { fontSize: btnFontSize }]}>💬</Text>
          <Text style={[s.chatText, { fontSize: btnFontSize }]}>LET'S CHAT</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <PageLayout
      menu={<SideMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />}
      header={<SiteHeader onMenuPress={() => setMenuOpen(true)} />}
    >
      {content}
    </PageLayout>
  );
}

const s = StyleSheet.create({
  body: { paddingHorizontal: 19, paddingVertical: 32, gap: 40 },
  bodyDesktop: {
    flex: 1,
    width: '100%',
    maxWidth: 1280,
    alignSelf: 'center',
    flexDirection: 'row',
    paddingHorizontal: SCREEN_PADDING.desktop,
    paddingVertical: 80,
    gap: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },

  copyBlock: { gap: 20 },
  copyBlockDesktop: { maxWidth: 704 },

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
