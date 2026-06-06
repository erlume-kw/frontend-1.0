import React from 'react';
import { View, ScrollView, StyleSheet, useWindowDimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SiteFooter from './SiteFooter';
import { BREAKPOINT, COLORS } from '../../constants/brand';

interface PageLayoutProps {
  children: React.ReactNode;
  header: React.ReactNode;
  menu?: React.ReactNode;
  overlay?: React.ReactNode;
  backgroundColor?: string;
}

/**
 * Page shell with a sticky footer on desktop: short pages keep the footer at the
 * bottom of the viewport; long pages scroll normally with the footer after content.
 */
export default function PageLayout({
  children,
  header,
  menu,
  overlay,
  backgroundColor = COLORS.white,
}: PageLayoutProps) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= BREAKPOINT;

  return (
    <SafeAreaView style={[s.root, { backgroundColor }]} edges={['top']}>
      {menu}
      {overlay}
      <ScrollView
        style={s.scroll}
        contentContainerStyle={[s.scrollContent, isDesktop && Platform.OS === 'web' && s.scrollContentWeb]}
        showsVerticalScrollIndicator={false}
      >
        {header}
        <View>{children}</View>
        <View style={isDesktop ? s.footerPush : undefined}>
          <SiteFooter />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  scrollContentWeb: { minHeight: '100%' },
  // On desktop the footer wrapper uses marginTop:'auto' so it sticks to the
  // bottom of the viewport on short pages without adding phantom whitespace
  // inside the content area on tall pages.
  footerPush: { marginTop: 'auto' as any },
});
