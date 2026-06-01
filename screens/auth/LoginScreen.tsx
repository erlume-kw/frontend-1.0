import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Pressable,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#18230F" />
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Hero — wordmark area */}
        <View style={styles.hero}>
          <Text className="font-sarina text-white text-[32px] tracking-widest mb-1">
            erlume
          </Text>
          <Text className="font-dm-regular text-[#DFD3C3] text-[12px] tracking-widest uppercase">
            Buy &amp; Sell Luxury Secondhand
          </Text>
        </View>

        {/* Form panel */}
        <View style={styles.form}>
          {/* Heading */}
          <Text className="font-clash-medium text-[#18230F] text-[24px] mb-1">
            Welcome back.
          </Text>
          <Text className="font-dm-regular text-[#7A7060] text-[16px] mb-8">
            Sign in to continue shopping.
          </Text>

          {/* Email */}
          <View className="mb-4">
            <Text className="font-dm-medium text-[#18230F] text-[12px] uppercase tracking-widest mb-2">
              Email
            </Text>
            <TextInput
              style={[styles.input, emailFocused ? styles.inputFocused : styles.inputDefault]}
              placeholder="your@email.com"
              placeholderTextColor="#7A7060"
              value={email}
              onChangeText={setEmail}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Password */}
          <View className="mb-2">
            <Text className="font-dm-medium text-[#18230F] text-[12px] uppercase tracking-widest mb-2">
              Password
            </Text>
            <View style={[styles.inputRow, passwordFocused ? styles.inputFocused : styles.inputDefault]}>
              <TextInput
                style={styles.inputInner}
                placeholder="••••••••"
                placeholderTextColor="#7A7060"
                value={password}
                onChangeText={setPassword}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                secureTextEntry={!passwordVisible}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Pressable onPress={() => setPasswordVisible(v => !v)} hitSlop={12}>
                <Text className="font-dm-medium text-[#7A7060] text-[12px] uppercase tracking-widest">
                  {passwordVisible ? 'Hide' : 'Show'}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Forgot password */}
          <TouchableOpacity className="items-end mb-8">
            <Text className="font-dm-medium text-[#C5705D] text-[12px]">
              Forgot password?
            </Text>
          </TouchableOpacity>

          {/* Log in button */}
          <TouchableOpacity style={styles.button} activeOpacity={0.85}>
            <Text className="font-dm-medium text-white text-[14px] uppercase tracking-widest">
              Log In
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View className="flex-row items-center my-4">
            <View className="flex-1 bg-[#C9BFAD]" style={{ height: 1 }} />
            <Text className="font-dm-regular text-[#7A7060] text-[12px] mx-3 uppercase tracking-widest">
              or
            </Text>
            <View className="flex-1 bg-[#C9BFAD]" style={{ height: 1 }} />
          </View>

          {/* Sign up */}
          <View className="flex-row items-center justify-center">
            <Text className="font-dm-regular text-[#7A7060] text-[16px]">
              New to erlume?{' '}
            </Text>
            <TouchableOpacity>
              <Text className="font-dm-medium text-[#18230F] text-[16px] underline">
                Create an account
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#18230F',
  },
  keyboard: {
    flex: 1,
  },
  hero: {
    flex: 42,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#18230F',
    paddingHorizontal: 16,
  },
  form: {
    flex: 58,
    backgroundColor: '#DFD3C3',
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
  },
  input: {
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 0,
    paddingHorizontal: 16,
    fontFamily: 'DMSans_400Regular',
    fontSize: 16,
    color: '#18230F',
  },
  inputRow: {
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 0,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputInner: {
    flex: 1,
    fontFamily: 'DMSans_400Regular',
    fontSize: 16,
    color: '#18230F',
    borderRadius: 0,
  },
  inputDefault: {
    borderWidth: 1,
    borderColor: '#C9BFAD',
  },
  inputFocused: {
    borderWidth: 1,
    borderColor: '#18230F',
  },
  button: {
    height: 75,
    backgroundColor: '#18230F',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 0,
    marginBottom: 16,
  },
});
