import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';

interface Props {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

// Constrains content to 1280px on desktop so ultra-wide monitors don't stretch layouts.
export default function MaxWidthContainer({ children, style }: Props) {
  return <View style={[s.container, style]}>{children}</View>;
}

const s = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 1280,
    alignSelf: 'center',
  },
});
