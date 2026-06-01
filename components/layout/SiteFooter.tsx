import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { COLORS, FONTS, BREAKPOINT, FOOTER_DATA, SOCIAL_ICONS } from '../../constants/brand';

function FooterCopyright() {
  return (
    <View style={s.copyright}>
      <Text style={s.copyrightText}>Copyright © 2026 Erlume</Text>
      <View style={s.socialRow}>
        <TouchableOpacity>
          <Image source={{ uri: SOCIAL_ICONS.instagram }} style={s.socialLg} resizeMode="contain" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Image source={{ uri: SOCIAL_ICONS.whatsapp }} style={s.socialLg} resizeMode="contain" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Image source={{ uri: SOCIAL_ICONS.tiktok }} style={s.socialSm} resizeMode="contain" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function MobileFooter() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <View style={s.footer}>
      <View style={s.mobileInner}>
        {Object.keys(FOOTER_DATA.columns).map(label => (
          <View key={label}>
            <TouchableOpacity
              style={s.accordionRow}
              onPress={() => setOpen(open === label ? null : label)}
            >
              <Text style={s.accordionLabel}>{label}</Text>
              <Text style={[s.chevron, open === label && s.chevronOpen]}>›</Text>
            </TouchableOpacity>
            {open === label && (
              <View style={s.accordionBody}>
                {FOOTER_DATA.columns[label as keyof typeof FOOTER_DATA.columns].map((item: string) => (
                  <TouchableOpacity key={item}>
                    <Text style={s.footerLink}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ))}

        <View style={s.divider} />
        <Text style={s.contactLabel}>Contact us at</Text>
        <Text style={s.footerLink}>{FOOTER_DATA.contact.phone}</Text>
        <Text style={s.footerLink}>{FOOTER_DATA.contact.email}</Text>
      </View>
      <FooterCopyright />
    </View>
  );
}

function DesktopFooter() {
  return (
    <View style={s.footer}>
      <View style={s.desktopGrid}>
        <View style={s.desktopCol}>
          <Text style={s.colHeader}>Contact</Text>
          <Text style={s.footerLink}>{FOOTER_DATA.contact.phone}</Text>
          <Text style={s.footerLink}>{FOOTER_DATA.contact.email}</Text>
        </View>
        {Object.entries(FOOTER_DATA.columns).map(([heading, links]) => (
          <View key={heading} style={s.desktopCol}>
            <Text style={s.colHeader}>{heading}</Text>
            {links.map((item: string) => (
              <TouchableOpacity key={item}>
                <Text style={s.footerLink}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
      <FooterCopyright />
    </View>
  );
}

export default function SiteFooter() {
  const { width } = useWindowDimensions();
  return width >= BREAKPOINT ? <DesktopFooter /> : <MobileFooter />;
}

const s = StyleSheet.create({
  footer: { backgroundColor: COLORS.primary },

  mobileInner: { padding: 32 },
  accordionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  accordionLabel: { fontFamily: FONTS.clashSemibold, fontSize: 16, color: COLORS.white, lineHeight: 25 },
  chevron: { fontFamily: FONTS.clashRegular, fontSize: 22, color: COLORS.white },
  chevronOpen: { transform: [{ rotate: '90deg' }] },
  accordionBody: { paddingLeft: 8, paddingBottom: 8 },

  desktopGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  desktopCol: { width: 247 },
  colHeader: { fontFamily: FONTS.clashSemibold, fontSize: 16, color: COLORS.white, lineHeight: 25, marginBottom: 12 },

  footerLink: { fontFamily: FONTS.clashRegular, fontSize: 16, color: COLORS.white, lineHeight: 25, marginBottom: 4 },
  contactLabel: { fontFamily: FONTS.clashSemibold, fontSize: 16, color: COLORS.white, lineHeight: 25, marginBottom: 4 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.15)', marginVertical: 12 },

  copyright: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  copyrightText: { fontFamily: FONTS.dmMedium, fontSize: 16, color: COLORS.white, lineHeight: 20 },
  socialRow: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  socialLg: { width: 40, height: 40 },
  socialSm: { width: 32, height: 32 },
});
