import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  StyleSheet,
  useWindowDimensions,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS, BREAKPOINT, SCREEN_PADDING, FOOTER_DATA, SOCIAL_ICONS } from '../../constants/brand';
import MaxWidthContainer from './MaxWidthContainer';
import {
  handleFooterLink,
  openEmail,
  openExternalUrl,
  openPhone,
  SOCIAL_URLS,
} from '../../utils/interactions';

// ─── Newsletter ───────────────────────────────────────────────────────────────
const isValidEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());

function NewsletterSection({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  const handleSubscribe = () => {
    if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    setEmailError('');
    Alert.alert('Subscribed!', 'You\'ll be the first to hear about new drops.');
    setEmail('');
  };

  return (
    <View style={[s.newsletter, compact && s.newsletterCompact]}>
      <View style={s.newsletterCopy}>
        <Text style={[s.newsletterHeading, compact && { fontSize: 18 }]}>
          STAY IN THE LOOP
        </Text>
        <Text style={s.newsletterSub}>
          Be the first to hear about new drops and exclusive pieces
        </Text>
      </View>
      <View>
        <View style={[s.newsletterRow, compact && s.newsletterRowCompact]}>
          <TextInput
            style={[s.newsletterInput, compact && { height: 48 }, !!emailError && s.newsletterInputError]}
            placeholder="your@email.com"
            placeholderTextColor="rgba(255,255,255,0.45)"
            value={email}
            onChangeText={v => { setEmail(v); if (emailError) setEmailError(''); }}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={[s.newsletterBtn, compact && { height: 48 }]}
            onPress={handleSubscribe}
            activeOpacity={0.85}
          >
            <Text style={[s.newsletterBtnText, compact && { fontSize: 13 }]}>
              SUBSCRIBE
            </Text>
          </TouchableOpacity>
        </View>
        {!!emailError && <Text style={s.emailError}>{emailError}</Text>}
      </View>
    </View>
  );
}

// ─── Copyright bar ────────────────────────────────────────────────────────────
function FooterCopyright() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= BREAKPOINT;
  const hPad = isDesktop ? SCREEN_PADDING.desktop : 32;

  return (
    <View style={[s.copyright, { paddingHorizontal: hPad }]}>
      <Text style={s.copyrightText}>Copyright © 2026 Erlume</Text>
      <View style={s.socialRow}>
        <TouchableOpacity onPress={() => openExternalUrl(SOCIAL_URLS.instagram)} accessibilityRole="link">
          <Image source={SOCIAL_ICONS.instagram} style={s.socialIcon} resizeMode="contain" />
        </TouchableOpacity>
        {/* WhatsApp PNG has slightly more left-side whitespace — nudge right */}
        <TouchableOpacity onPress={() => openExternalUrl(SOCIAL_URLS.whatsapp)} accessibilityRole="link" style={{ marginLeft: 4 }}>
          <Image source={SOCIAL_ICONS.whatsapp} style={s.socialIcon} resizeMode="contain" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => openExternalUrl(SOCIAL_URLS.tiktok)} accessibilityRole="link">
          <Image source={SOCIAL_ICONS.tiktok} style={s.socialIcon} resizeMode="contain" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Mobile footer ────────────────────────────────────────────────────────────
function MobileFooter() {
  const [open, setOpen] = useState<string | null>(null);
  const navigation = useNavigation();

  return (
    <View style={s.footer}>
      {/* Newsletter — top of footer */}
      <View style={s.mobileInner}>
        <NewsletterSection compact />
      </View>

      {/* Nav links accordion */}
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
                  <TouchableOpacity key={item} onPress={() => handleFooterLink(item, navigation)}>
                    <Text style={s.footerLink}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ))}

        <Text style={s.contactLabel}>Contact us at</Text>
        <TouchableOpacity onPress={() => openPhone(FOOTER_DATA.contact.phone)}>
          <Text style={s.footerLink}>{FOOTER_DATA.contact.phone}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => openEmail(FOOTER_DATA.contact.email)}>
          <Text style={s.footerLink}>{FOOTER_DATA.contact.email}</Text>
        </TouchableOpacity>
      </View>

      <FooterCopyright />
    </View>
  );
}

// ─── Desktop footer ───────────────────────────────────────────────────────────
function DesktopFooter() {
  const navigation = useNavigation();

  return (
    <View style={s.footer}>
      {/* Newsletter — top of footer */}
      <MaxWidthContainer>
        <View style={s.desktopNewsletter}>
          <NewsletterSection />
        </View>
      </MaxWidthContainer>

      {/* Links grid */}
      <MaxWidthContainer>
        <View style={s.desktopGrid}>
          <View style={s.desktopCol}>
            <Text style={s.colHeader}>Contact</Text>
            <TouchableOpacity onPress={() => openPhone(FOOTER_DATA.contact.phone)}>
              <Text style={s.footerLink}>{FOOTER_DATA.contact.phone}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => openEmail(FOOTER_DATA.contact.email)}>
              <Text style={s.footerLink}>{FOOTER_DATA.contact.email}</Text>
            </TouchableOpacity>
          </View>
          {Object.entries(FOOTER_DATA.columns).map(([heading, links]) => (
            <View key={heading} style={s.desktopCol}>
              <Text style={s.colHeader}>{heading}</Text>
              {links.map((item: string) => (
                <TouchableOpacity key={item} onPress={() => handleFooterLink(item, navigation)}>
                  <Text style={s.footerLink}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>
      </MaxWidthContainer>

      <MaxWidthContainer>
        <FooterCopyright />
      </MaxWidthContainer>
    </View>
  );
}

export default function SiteFooter() {
  const { width } = useWindowDimensions();
  return width >= BREAKPOINT ? <DesktopFooter /> : <MobileFooter />;
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  footer: { backgroundColor: COLORS.primary },

  // Newsletter
  newsletter: {
    gap: 24,
  },
  newsletterCompact: {
    gap: 16,
  },
  newsletterCopy: { gap: 6 },
  newsletterHeading: {
    fontFamily: FONTS.clashSemibold,
    fontSize: 24,
    color: COLORS.white,
    letterSpacing: 1,
  },
  newsletterSub: {
    fontFamily: FONTS.dmRegular,
    fontSize: 15,
    color: 'rgba(255,255,255,0.65)',
    lineHeight: 22,
  },
  newsletterRow: {
    flexDirection: 'row',
    height: 56,
  },
  newsletterRowCompact: {
    height: 48,
  },
  newsletterInput: {
    flex: 1,
    height: 56,
    borderWidth: 0,
    paddingHorizontal: 16,
    fontFamily: FONTS.dmRegular,
    fontSize: 14,
    color: COLORS.white,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  newsletterBtn: {
    height: 56,
    paddingHorizontal: 28,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newsletterBtnText: {
    fontFamily: FONTS.clashMedium,
    fontSize: 14,
    color: COLORS.white,
    letterSpacing: 1.2,
  },
  newsletterInputError: { backgroundColor: 'rgba(185,64,64,0.18)' },
  emailError: { fontFamily: FONTS.dmRegular, fontSize: 13, color: COLORS.error, marginTop: 6 },

  // Desktop layout
  desktopNewsletter: {
    paddingHorizontal: SCREEN_PADDING.desktop,
    paddingTop: 56,
    paddingBottom: 48,
  },
  desktopGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SCREEN_PADDING.desktop,
    paddingVertical: 48,
  },
  desktopCol: { width: 247 },
  colHeader: {
    fontFamily: FONTS.clashSemibold,
    fontSize: 16,
    color: COLORS.white,
    lineHeight: 25,
    marginBottom: 12,
  },

  // Mobile
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

  footerLink: {
    fontFamily: FONTS.clashRegular,
    fontSize: 16,
    color: COLORS.white,
    lineHeight: 25,
    marginBottom: 4,
  },
  contactLabel: {
    fontFamily: FONTS.clashSemibold,
    fontSize: 16,
    color: COLORS.white,
    lineHeight: 25,
    marginBottom: 4,
  },
  // Copyright bar
  copyright: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 24,
  },
  copyrightText: { fontFamily: FONTS.dmMedium, fontSize: 16, color: COLORS.white, lineHeight: 20 },
  socialRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  socialIcon: { width: 24, height: 24 },
});
