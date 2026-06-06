import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  useWindowDimensions,
  Platform,
  Alert,
  ImageStyle,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import SiteHeader from '../components/layout/SiteHeader';
import PageLayout from '../components/layout/PageLayout';
import SideMenu from '../components/layout/SideMenu';
import MaxWidthContainer from '../components/layout/MaxWidthContainer';
import { COLORS, FONTS, BREAKPOINT, SCREEN_PADDING } from '../constants/brand';
import { openWhatsApp } from '../utils/interactions';

async function pickImage(): Promise<string | null> {
  if (Platform.OS !== 'web') {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow access to your photo library.');
      return null;
    }
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: false,
    quality: 0.85,
  });
  if (!result.canceled && result.assets.length > 0) {
    return result.assets[0].uri;
  }
  return null;
}

export default function SellScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= BREAKPOINT;
  const [menuOpen, setMenuOpen] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);

  const handleUpload = async () => {
    const uri = await pickImage();
    if (uri) setImageUri(uri);
  };

  const handleWhatsApp = (prefill?: string) => openWhatsApp(prefill);

  const headlineSize = isDesktop ? 60 : 32;
  const bodySize = isDesktop ? 32 : 20;
  const bodyLine = isDesktop ? 35 : 25;
  const uploadW = isDesktop ? 337 : 237;
  const uploadH = isDesktop ? 435 : 295;
  const btnW = uploadW; // always matches the upload box width
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
        {/* Dotted upload box */}
        <TouchableOpacity
          style={[s.uploadBox, { width: uploadW, height: uploadH }]}
          onPress={handleUpload}
          activeOpacity={0.8}
        >
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={s.uploadPreview as ImageStyle}
              resizeMode="cover"
            />
          ) : (
            <>
              
              <Text style={[s.uploadLabel, isDesktop && { fontSize: 20, lineHeight: 28 }]}>
                Upload a photo of what you would like to sell
              </Text>
              <Text style={[s.uploadHint, isDesktop && { fontSize: 14 }]}>
                Tap to browse
              </Text>
            </>
          )}
          {/* Retake overlay when image selected */}
          {imageUri && (
            <View style={s.retakeOverlay}>
              <Text style={s.retakeText}>Tap to change</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.chatBtn, { width: btnW, height: btnH }]}
          onPress={() =>
            handleWhatsApp(
              imageUri
                ? "Hi, I'd like to sell an item with erlume. I've prepared a photo to share."
                : "Hi, I'd like to sell an item with erlume."
            )
          }
          activeOpacity={0.85}
        >
      
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
      {isDesktop ? (
        <MaxWidthContainer style={s.desktopWrapper}>{content}</MaxWidthContainer>
      ) : (
        content
      )}
    </PageLayout>
  );
}

const s = StyleSheet.create({
  desktopWrapper: {
    paddingHorizontal: SCREEN_PADDING.desktop,
  },
  body: { paddingHorizontal: 19, paddingVertical: 32, gap: 40 },
  bodyDesktop: {
    flexDirection: 'row',
    paddingVertical: 80,
    gap: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },

  copyBlock: { gap: 20 },
  copyBlockDesktop: { maxWidth: 704 },

  headline: { fontFamily: FONTS.clashMedium, color: COLORS.primary },
  bodyText: { fontFamily: FONTS.clashMedium, color: COLORS.primary },
  accentText: { fontFamily: FONTS.clashSemibold, color: COLORS.secondary },

  rightBlock: { alignItems: 'center', gap: 24 },
  rightBlockDesktop: { alignItems: 'flex-start' },

  uploadBox: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  uploadIcon: { fontSize: 32, marginBottom: 12 },
  uploadLabel: {
    fontFamily: FONTS.clashMedium,
    fontSize: 16,
    color: COLORS.olive,
    textAlign: 'center',
    lineHeight: 22,
  },
  uploadHint: {
    fontFamily: FONTS.dmRegular,
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 8,
  },
  uploadPreview: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  retakeOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingVertical: 10,
    alignItems: 'center',
  },
  retakeText: {
    fontFamily: FONTS.dmMedium,
    fontSize: 13,
    color: COLORS.white,
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
