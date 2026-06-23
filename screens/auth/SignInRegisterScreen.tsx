import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import SiteHeader from '../../components/layout/SiteHeader';
import PageLayout from '../../components/layout/PageLayout';
import SideMenu from '../../components/layout/SideMenu';
import MaxWidthContainer from '../../components/layout/MaxWidthContainer';
import { COLORS, FONTS, BREAKPOINT, SCREEN_PADDING } from '../../constants/brand';
import { login, register } from '../../services/api';

function Toast({ message }: { message: string }) {
  return (
    <View style={s.toast}>
      <Text style={s.toastText}>{message}</Text>
    </View>
  );
}

export default function SignInRegisterScreen() {
  const { width } = useWindowDimensions();
  const navigation = useNavigation();
  const isDesktop = width >= BREAKPOINT;
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [govDropdownOpen, setGovDropdownOpen] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Sign In State
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signInError, setSignInError] = useState('');

  // Register State
  const [regEmail, setRegEmail] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPasswordConfirm, setRegPasswordConfirm] = useState('');
  const [regCountryCode, setRegCountryCode] = useState('+965');
  const [regPhone, setRegPhone] = useState('');

  // Address fields
  const [regStreet, setRegStreet] = useState('');
  const [regBlock, setRegBlock] = useState('');
  const [regHouse, setRegHouse] = useState('');
  const [regCity, setRegCity] = useState('');
  const [regGovernorate, setRegGovernorate] = useState('');

  // Field-specific errors
  const [regErrors, setRegErrors] = useState<Record<string, string>>({});

  const KUWAIT_GOVERNORATES = [
    'Al Asimah (Capital)',
    'Hawalli',
    'Farwaniya',
    'Mubarak Al-Kabeer',
    'Al Ahmadi',
    'Al Jahra',
  ];

  const handleSignIn = async () => {
    setSignInError('');
    if (!signInEmail.trim() || !signInPassword.trim()) {
      setSignInError('Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      await login(signInEmail, signInPassword);
      setToastMessage('Successfully signed in!');
      setToastVisible(true);
      setTimeout(() => {
        setToastVisible(false);
        navigation.navigate('Home' as never);
      }, 2500);
    } catch (error: any) {
      setSignInError(error?.message || 'Sign in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    const newErrors: Record<string, string> = {};

    // Validate email
    if (!regEmail.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail)) {
      newErrors.email = 'Invalid email format';
    }

    // Validate username
    if (!regUsername.trim()) {
      newErrors.username = 'Username is required';
    } else if (regUsername.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    // Validate password
    if (!regPassword.trim()) {
      newErrors.password = 'Password is required';
    } else if (regPassword.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Validate password confirmation
    if (!regPasswordConfirm.trim()) {
      newErrors.passwordConfirm = 'Please confirm your password';
    } else if (regPassword !== regPasswordConfirm) {
      newErrors.passwordConfirm = 'Passwords do not match';
    }

    // Validate phone
    if (!regPhone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (regPhone.length < 8) {
      newErrors.phone = 'Phone number must be at least 8 digits';
    }

    // Validate address
    if (!regStreet.trim()) {
      newErrors.street = 'Street is required';
    }
    if (!regBlock.trim()) {
      newErrors.block = 'Block is required';
    }
    if (!regHouse.trim()) {
      newErrors.house = 'House number is required';
    }
    if (!regCity.trim()) {
      newErrors.city = 'City is required';
    }
    if (!regGovernorate) {
      newErrors.governorate = 'Governorate is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setRegErrors(newErrors);
      return;
    }

    setRegErrors({});
    setLoading(true);
    try {
      await register({
        emailAddress: regEmail,
        password: regPassword,
        phoneNumber: `${regCountryCode}${regPhone}`,
        address: {
          street: regStreet,
          block: regBlock,
          house: regHouse,
          city: regCity,
          governorate: regGovernorate,
        },
      } as any);
      setToastMessage('Account created successfully!');
      setToastVisible(true);
      setTimeout(() => {
        setToastVisible(false);
        setMode('signin');
      }, 2500);
    } catch (error: any) {
      // Check if error has details array from validation middleware
      if (error?.data?.details && Array.isArray(error.data.details)) {
        const fieldErrors: Record<string, string> = {};
        error.data.details.forEach((detail: any) => {
          // Map backend field names to frontend field names
          const fieldName = detail.field
            .replace('emailAddress', 'email')
            .replace('phoneNumber', 'phone')
            .replace('passwordConfirm', 'passwordConfirm');
          fieldErrors[fieldName] = detail.message;
        });
        setRegErrors(fieldErrors);
      } else if (error?.data?.errors && typeof error.data.errors === 'object') {
        // Field-specific errors from backend
        setRegErrors(error.data.errors);
      } else if (error?.data?.error) {
        // Single error message from backend
        setRegErrors({ submit: error.data.error });
      } else {
        // Generic error
        setRegErrors({ submit: error?.message || 'Registration failed. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout
      menu={<SideMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />}
      header={<SiteHeader onMenuPress={() => setMenuOpen(true)} />}
      overlay={toastVisible ? <Toast message={toastMessage} /> : undefined}
    >
      <ScrollView>
        <MaxWidthContainer>
          <View style={[s.container, { paddingHorizontal: isDesktop ? SCREEN_PADDING.desktop : SCREEN_PADDING.mobile }]}>
            {/* SIGN IN CARD */}
            {mode === 'signin' && (
              <View style={s.card}>
                <View style={s.cardContent}>
                  <Text style={s.cardTitle}>Sign In to Your Account</Text>

                  <View style={s.formGroup}>
                    <Text style={s.label}>Email</Text>
                    <TextInput
                      style={s.input}
                      placeholder="your@email.com"
                      placeholderTextColor={COLORS.muted}
                      value={signInEmail}
                      onChangeText={setSignInEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      editable={!loading}
                    />
                  </View>

                  <View style={s.formGroup}>
                    <Text style={s.label}>Password</Text>
                    <TextInput
                      style={s.input}
                      placeholder="••••••••"
                      placeholderTextColor={COLORS.muted}
                      value={signInPassword}
                      onChangeText={setSignInPassword}
                      secureTextEntry
                      editable={!loading}
                    />
                  </View>

                  {signInError && <Text style={s.error}>{signInError}</Text>}

                  <TouchableOpacity
                    style={[s.submitBtn, loading && { opacity: 0.6 }]}
                    onPress={handleSignIn}
                    disabled={loading}
                  >
                    <Text style={s.submitBtnText}>{loading ? 'SIGNING IN...' : 'SIGN IN'}</Text>
                  </TouchableOpacity>

                  {/* Prompt to register */}
                  <View style={s.registerPrompt}>
                    <Text style={s.promptText}>Don't have an account? </Text>
                    <TouchableOpacity onPress={() => { setMode('register'); setSignInError(''); }}>
                      <Text style={s.promptLink}>Sign up here</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {/* REGISTER CARD */}
            {mode === 'register' && (
              <View style={s.card}>
                <View style={s.cardContent}>
                    <Text style={s.cardTitle}>Create Your Account</Text>

                    <View style={s.formGroup}>
                      <Text style={s.label}>Email</Text>
                      <TextInput
                        style={[s.input, regErrors.email && s.inputError]}
                        placeholder="your@email.com"
                        placeholderTextColor={COLORS.muted}
                        value={regEmail}
                        onChangeText={(val) => {
                          setRegEmail(val);
                          if (regErrors.email) setRegErrors({ ...regErrors, email: '' });
                        }}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        editable={!loading}
                      />
                      {regErrors.email && <Text style={s.fieldError}>{regErrors.email}</Text>}
                    </View>

                    <View style={s.formGroup}>
                      <Text style={s.label}>Username</Text>
                      <TextInput
                        style={[s.input, regErrors.username && s.inputError]}
                        placeholder="Choose a username"
                        placeholderTextColor={COLORS.muted}
                        value={regUsername}
                        onChangeText={(val) => {
                          setRegUsername(val);
                          if (regErrors.username) setRegErrors({ ...regErrors, username: '' });
                        }}
                        autoCapitalize="none"
                        editable={!loading}
                      />
                      {regErrors.username && <Text style={s.fieldError}>{regErrors.username}</Text>}
                    </View>

                    <View style={s.formGroup}>
                      <Text style={s.label}>Password</Text>
                      <TextInput
                        style={[s.input, regErrors.password && s.inputError]}
                        placeholder="••••••••"
                        placeholderTextColor={COLORS.muted}
                        value={regPassword}
                        onChangeText={(val) => {
                          setRegPassword(val);
                          if (regErrors.password) setRegErrors({ ...regErrors, password: '' });
                        }}
                        secureTextEntry
                        editable={!loading}
                      />
                      {regErrors.password && <Text style={s.fieldError}>{regErrors.password}</Text>}
                    </View>

                    <View style={s.formGroup}>
                      <Text style={s.label}>Confirm Password</Text>
                      <TextInput
                        style={[s.input, regErrors.passwordConfirm && s.inputError]}
                        placeholder="••••••••"
                        placeholderTextColor={COLORS.muted}
                        value={regPasswordConfirm}
                        onChangeText={(val) => {
                          setRegPasswordConfirm(val);
                          if (regErrors.passwordConfirm) setRegErrors({ ...regErrors, passwordConfirm: '' });
                        }}
                        secureTextEntry
                        editable={!loading}
                      />
                      {regErrors.passwordConfirm && <Text style={s.fieldError}>{regErrors.passwordConfirm}</Text>}
                    </View>

                    <View style={s.formGroup}>
                      <Text style={s.label}>Phone Number</Text>
                      <View style={s.phoneRow}>
                        <TextInput
                          style={[s.countryCodeInput]}
                          placeholder="+965"
                          placeholderTextColor={COLORS.muted}
                          value={regCountryCode}
                          onChangeText={setRegCountryCode}
                          editable={!loading}
                        />
                        <TextInput
                          style={[s.input, s.phoneInput, regErrors.phone && s.inputError]}
                          placeholder="XXXX XXXX"
                          placeholderTextColor={COLORS.muted}
                          value={regPhone}
                          onChangeText={(val) => {
                            setRegPhone(val);
                            if (regErrors.phone) setRegErrors({ ...regErrors, phone: '' });
                          }}
                          keyboardType="phone-pad"
                          editable={!loading}
                        />
                      </View>
                      {regErrors.phone && <Text style={s.fieldError}>{regErrors.phone}</Text>}
                    </View>

                    {/* Address Section */}
                    <View style={s.formGroup}>
                      <Text style={s.label}>Street Address</Text>
                      <TextInput
                        style={[s.input, regErrors.street && s.inputError]}
                        placeholder="Street name"
                        placeholderTextColor={COLORS.muted}
                        value={regStreet}
                        onChangeText={(val) => {
                          setRegStreet(val);
                          if (regErrors.street) setRegErrors({ ...regErrors, street: '' });
                        }}
                        editable={!loading}
                      />
                      {regErrors.street && <Text style={s.fieldError}>{regErrors.street}</Text>}
                    </View>

                    <View style={[s.formGroup, s.twoCol]}>
                      <View style={{ flex: 1 }}>
                        <Text style={s.label}>Block</Text>
                        <TextInput
                          style={[s.input, regErrors.block && s.inputError]}
                          placeholder="Block #"
                          placeholderTextColor={COLORS.muted}
                          value={regBlock}
                          onChangeText={(val) => {
                            setRegBlock(val);
                            if (regErrors.block) setRegErrors({ ...regErrors, block: '' });
                          }}
                          keyboardType="number-pad"
                          editable={!loading}
                        />
                        {regErrors.block && <Text style={s.fieldError}>{regErrors.block}</Text>}
                      </View>
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={s.label}>House #</Text>
                        <TextInput
                          style={[s.input, regErrors.house && s.inputError]}
                          placeholder="House #"
                          placeholderTextColor={COLORS.muted}
                          value={regHouse}
                          onChangeText={(val) => {
                            setRegHouse(val);
                            if (regErrors.house) setRegErrors({ ...regErrors, house: '' });
                          }}
                          keyboardType="number-pad"
                          editable={!loading}
                        />
                        {regErrors.house && <Text style={s.fieldError}>{regErrors.house}</Text>}
                      </View>
                    </View>

                    <View style={s.formGroup}>
                      <Text style={s.label}>City</Text>
                      <TextInput
                        style={[s.input, regErrors.city && s.inputError]}
                        placeholder="City"
                        placeholderTextColor={COLORS.muted}
                        value={regCity}
                        onChangeText={(val) => {
                          setRegCity(val);
                          if (regErrors.city) setRegErrors({ ...regErrors, city: '' });
                        }}
                        editable={!loading}
                      />
                      {regErrors.city && <Text style={s.fieldError}>{regErrors.city}</Text>}
                    </View>

                    <View style={s.formGroup}>
                      <Text style={s.label}>Governorate</Text>
                      <Pressable
                        style={[s.input, s.selectField, regErrors.governorate && s.inputError]}
                        onPress={() => setGovDropdownOpen(true)}
                      >
                        <Text style={regGovernorate ? { color: COLORS.black, fontFamily: FONTS.dmRegular, fontSize: 14 } : { color: COLORS.muted, fontFamily: FONTS.dmRegular, fontSize: 14 }}>
                          {regGovernorate || 'Select governorate'}
                        </Text>
                        <Text style={s.downArrow}>▼</Text>
                      </Pressable>
                      {regErrors.governorate && <Text style={s.fieldError}>{regErrors.governorate}</Text>}
                    </View>

                    <Modal
                      visible={govDropdownOpen}
                      transparent
                      animationType="fade"
                      onRequestClose={() => setGovDropdownOpen(false)}
                    >
                      <Pressable
                        style={s.dropdownOverlay}
                        onPress={() => setGovDropdownOpen(false)}
                      >
                        <View style={s.dropdownMenu}>
                          {KUWAIT_GOVERNORATES.map((gov) => (
                            <Pressable
                              key={gov}
                              style={[s.dropdownOption, regGovernorate === gov && s.dropdownOptionSelected]}
                              onPress={() => {
                                setRegGovernorate(gov);
                                if (regErrors.governorate) setRegErrors({ ...regErrors, governorate: '' });
                                setGovDropdownOpen(false);
                              }}
                            >
                              <Text style={[s.dropdownOptionText, regGovernorate === gov && s.dropdownOptionTextSelected]}>
                                {gov}
                              </Text>
                            </Pressable>
                          ))}
                        </View>
                      </Pressable>
                    </Modal>

                    {regErrors.submit && <Text style={s.error}>{regErrors.submit}</Text>}

                    <TouchableOpacity
                      style={[s.submitBtn, loading && { opacity: 0.6 }]}
                      onPress={handleRegister}
                      disabled={loading}
                    >
                      <Text style={s.submitBtnText}>{loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}</Text>
                    </TouchableOpacity>

                    {/* Back to sign in */}
                    <View style={s.registerPrompt}>
                      <Text style={s.promptText}>Already have an account? </Text>
                      <TouchableOpacity onPress={() => { setMode('signin'); setRegErrors({}); }}>
                        <Text style={s.promptLink}>Sign in here</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}

            <View style={{ height: 48 }} />
          </View>
        </MaxWidthContainer>
      </ScrollView>
    </PageLayout>
  );
}

const s = StyleSheet.create({
  container: {
    paddingVertical: 40,
    gap: 24,
  },
  cardsRow: {
    flexDirection: 'row',
    gap: 24,
    alignItems: 'flex-start',
  },
  cardsRowMobile: {
    flexDirection: 'column',
    gap: 24,
  },
  card: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  cardFullWidth: {
    flex: 1,
  },
  cardContent: {
    padding: 24,
    gap: 20,
  },
  cardTitle: {
    fontFamily: FONTS.clashMedium,
    fontSize: 20,
    color: COLORS.primary,
    marginBottom: 8,
  },
  formGroup: {
    gap: 8,
  },
  twoCol: {
    flexDirection: 'row',
  },
  label: {
    fontFamily: FONTS.clashMedium,
    fontSize: 12,
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    fontFamily: FONTS.dmRegular,
    fontSize: 14,
    color: COLORS.black,
  },
  selectField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 12,
  },
  downArrow: {
    fontSize: 12,
    color: COLORS.muted,
  },
  dropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownMenu: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    maxWidth: 300,
    width: '80%',
    maxHeight: 300,
  },
  dropdownOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  dropdownOptionSelected: {
    backgroundColor: 'rgba(197,112,93,0.1)',
  },
  dropdownOptionText: {
    fontFamily: FONTS.dmRegular,
    fontSize: 14,
    color: COLORS.black,
  },
  dropdownOptionTextSelected: {
    color: COLORS.secondary,
    fontWeight: '600',
  },
  inputError: {
    borderColor: COLORS.error,
    backgroundColor: 'rgba(185,64,64,0.08)',
  },
  phoneRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  countryCodeInput: {
    width: 80,
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    fontFamily: FONTS.dmRegular,
    fontSize: 14,
    color: COLORS.black,
  },
  phoneInput: {
    flex: 1,
  },
  fieldError: {
    fontFamily: FONTS.dmRegular,
    fontSize: 12,
    color: COLORS.error,
    marginTop: 4,
  },
  error: {
    fontFamily: FONTS.dmRegular,
    fontSize: 13,
    color: COLORS.error,
    marginTop: 8,
  },
  submitBtn: {
    height: 56,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitBtnText: {
    fontFamily: FONTS.clashMedium,
    fontSize: 14,
    color: COLORS.white,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  registerPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  promptText: {
    fontFamily: FONTS.dmRegular,
    fontSize: 14,
    color: COLORS.muted,
  },
  promptLink: {
    fontFamily: FONTS.dmRegular,
    fontSize: 14,
    color: COLORS.secondary,
    textDecorationLine: 'underline',
  },
  toast: {
    backgroundColor: COLORS.olive,
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
  },
  toastText: {
    fontFamily: FONTS.clashMedium,
    fontSize: 12,
    color: COLORS.white,
  },
});
