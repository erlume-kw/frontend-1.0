import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, FONTS, BREAKPOINT, SCREEN_PADDING } from '../../constants/brand';
import { handleFooterLink } from '../../utils/interactions';

const COOKIES_CONSENT_KEY = 'erlume_cookies_consent';

interface CookiesBannerProps {
  navigation: any;
}

export default function CookiesBanner({ navigation }: CookiesBannerProps) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= BREAKPOINT;
  const [showBanner, setShowBanner] = useState(false);
  const slideAnim = React.useRef(new Animated.Value(100)).current;

  useEffect(() => {
    checkCookiesConsent();
  }, []);

  const checkCookiesConsent = async () => {
    try {
      const consent = await AsyncStorage.getItem(COOKIES_CONSENT_KEY);
      if (!consent) {
        setShowBanner(true);
        // Animate in
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    } catch (error) {
      console.error('Error checking cookies consent:', error);
    }
  };

  const handleConsent = async (accepted: boolean) => {
    try {
      await AsyncStorage.setItem(COOKIES_CONSENT_KEY, JSON.stringify({ accepted, timestamp: new Date().toISOString() }));
      // Animate out
      Animated.timing(slideAnim, {
        toValue: 100,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setShowBanner(false));
    } catch (error) {
      console.error('Error saving cookies consent:', error);
    }
  };

  if (!showBanner) return null;

  const translateY = slideAnim.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 500],
  });

  return (
    <Animated.View style={[s.banner, { transform: [{ translateY }] }]}>
      <View style={s.maxWidthWrapper}>
        <View style={[s.content, { paddingHorizontal: isDesktop ? SCREEN_PADDING.desktop : SCREEN_PADDING.mobile }]}>
          {/* Text section */}
          <View style={[s.textSection, isDesktop && s.textSectionDesktop]}>
          <Text style={s.title}>We Use Cookies</Text>
          <Text style={s.description}>
            We use cookies to enhance your browsing experience, personalize content, and analyze traffic. By clicking "Accept", you consent to our use of cookies.{' '}
            <TouchableOpacity onPress={() => handleFooterLink('Cookies', navigation)}>
              <Text style={s.link}>Learn more</Text>
            </TouchableOpacity>
          </Text>
        </View>

        {/* Buttons section */}
        <View style={[s.buttonSection, isDesktop && s.buttonSectionDesktop]}>
          <TouchableOpacity
            style={s.rejectBtn}
            onPress={() => handleConsent(false)}
            activeOpacity={0.8}
          >
            <Text style={s.rejectBtnText}>DECLINE</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={s.acceptBtn}
            onPress={() => handleConsent(true)}
            activeOpacity={0.8}
          >
            <Text style={s.acceptBtnText}>ACCEPT</Text>
          </TouchableOpacity>
        </View>
        </View>
      </View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  banner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingVertical: 24,
    paddingBottom: 32,
    zIndex: 9999,
  },
  maxWidthWrapper: {
    width: '100%',
    maxWidth: 1280,
    alignSelf: 'center',
  },
  content: {
    flexDirection: 'column',
    gap: 20,
  },
  textSection: {
    gap: 8,
  },
  textSectionDesktop: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'center',
  },
  title: {
    fontFamily: FONTS.clashMedium,
    fontSize: 14,
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  description: {
    fontFamily: FONTS.dmRegular,
    fontSize: 13,
    color: COLORS.muted,
    lineHeight: 20,
  },
  link: {
    color: COLORS.secondary,
    textDecorationLine: 'underline',
  },
  buttonSection: {
    flexDirection: 'column',
    gap: 12,
  },
  buttonSectionDesktop: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'flex-end',
  },
  rejectBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectBtnText: {
    fontFamily: FONTS.clashMedium,
    fontSize: 12,
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  acceptBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptBtnText: {
    fontFamily: FONTS.clashMedium,
    fontSize: 12,
    color: COLORS.white,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
});
