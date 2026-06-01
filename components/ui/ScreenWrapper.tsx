import React from 'react';
import { View, ScrollView, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ScreenWrapperProps {
  children: React.ReactNode;
  scrollable?: boolean;
  style?: ViewStyle;
  className?: string;
  padded?: boolean; // applies horizontal screen-x padding
}

export default function ScreenWrapper({
  children,
  scrollable = false,
  style,
  className = '',
  padded = true,
}: ScreenWrapperProps) {
  const paddingClass = padded ? 'px-screen-x' : '';
  const inner = scrollable ? (
    <ScrollView
      className={`flex-1 ${paddingClass} ${className}`}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1 }}
      style={style}
    >
      {children}
    </ScrollView>
  ) : (
    <View className={`flex-1 ${paddingClass} ${className}`} style={style}>
      {children}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-bg-light" edges={['top', 'left', 'right']}>
      {inner}
    </SafeAreaView>
  );
}
