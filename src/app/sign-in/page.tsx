'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import SiteHeader from '@/components/layout/SiteHeader';
import PageLayout from '@/components/layout/PageLayout';
import SideMenu from '@/components/layout/SideMenu';
import MaxWidthContainer from '@/components/layout/MaxWidthContainer';
import { useIsDesktop } from '@/lib/useIsDesktop';
import { useKuwaitAreas } from '@/lib/useKuwaitAreas';
import SelectField from '@/components/ui/SelectField';
import PasswordInput from '@/components/ui/PasswordInput';
import { login, register, requestEmailOtp, requestPasswordReset, resetPassword } from '@/services/api';
import VerifyEmailModal from '@/components/VerifyEmailModal';
import ErrorModal from '@/components/ErrorModal';

function Toast({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center bg-olive px-5 py-3">
      <span className="font-clash font-medium text-[12px] text-white">{message}</span>
    </div>
  );
}

const inputClass =
  'h-[50px] w-full border border-border px-3 font-dm text-[14px] text-black outline-none placeholder:text-muted';
const inputErrorClass = 'border-error bg-[rgba(185,64,64,0.08)]';
const labelClass = 'font-clash font-medium text-[12px] uppercase tracking-[1px] text-primary';
const fieldErrorClass = 'mt-1 block font-dm text-[12px] text-error';

export default function SignInRegisterPage() {
  const isDesktop = useIsDesktop();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'signin' | 'register' | 'forgot'>('signin');
  const { areas, governorates } = useKuwaitAreas();
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Sign In State
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signInError, setSignInError] = useState('');

  // Forgot Password State
  const [forgotStep, setForgotStep] = useState<'email' | 'reset'>('email');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotCode, setForgotCode] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotNewPasswordConfirm, setForgotNewPasswordConfirm] = useState('');
  const [forgotError, setForgotError] = useState('');

  // Register State
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPasswordConfirm, setRegPasswordConfirm] = useState('');
  const [regCountryCode, setRegCountryCode] = useState('+965');
  const [regPhone, setRegPhone] = useState('');

  // Address fields
  const [regStreet, setRegStreet] = useState('');
  const [regBlock, setRegBlock] = useState('');
  const [regAvenue, setRegAvenue] = useState('');
  const [regFlat, setRegFlat] = useState('');
  const [regHouse, setRegHouse] = useState('');
  const [regCity, setRegCity] = useState('');
  const [regGovernorate, setRegGovernorate] = useState('');

  // Field-specific errors
  const [regErrors, setRegErrors] = useState<Record<string, string>>({});

  // Email OTP verification (runs before the account is created)
  const [showOtpModal, setShowOtpModal] = useState(false);
  // One-shot lock so a single signup can only hit the register API once. The
  // verify modal can fire onVerified twice (manual confirm + the background
  // poll that watches for the email-link verification), which would otherwise
  // create the account then report a false "already in use" failure.
  const registeringRef = useRef(false);

  // The seller welcome email links to /sign-in?forgot=1&email=… — open the reset form directly
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('forgot') === '1') {
      setMode('forgot');
      setForgotEmail(params.get('email') ?? '');
    }
  }, []);

  const handleGovernorateSelect = (gov: string) => {
    setRegGovernorate(gov);
    setRegCity(''); // city depends on governorate — reset when it changes
    if (regErrors.governorate) setRegErrors({ ...regErrors, governorate: '' });
  };

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
        router.push('/');
      }, 2500);
    } catch (error: any) {
      setSignInError(error?.message || 'Sign in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const openForgotPassword = () => {
    setMode('forgot');
    setForgotEmail(signInEmail.trim());
    setForgotStep('email');
    setForgotError('');
    setSignInError('');
  };

  const forgotErrorMessage = (error: any, fallback: string) =>
    error?.data?.details?.[0]?.message || error?.data?.error || error?.message || fallback;

  // Step 1 — the backend emails a code to the account's email address
  const handleSendResetCode = async () => {
    setForgotError('');
    const email = forgotEmail.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setForgotError('Please enter a valid email address');
      return;
    }
    setLoading(true);
    try {
      await requestPasswordReset(email);
      setForgotStep('reset');
    } catch (error: any) {
      setForgotError(forgotErrorMessage(error, 'Could not send the code. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  // Step 2 — code + new password
  const handleResetPassword = async () => {
    setForgotError('');
    if (!/^[0-9]{4,8}$/.test(forgotCode.trim())) {
      setForgotError('Please enter the code from your email');
      return;
    }
    if (forgotNewPassword.length < 8) {
      setForgotError('Password must be at least 8 characters');
      return;
    }
    if (forgotNewPassword !== forgotNewPasswordConfirm) {
      setForgotError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await resetPassword(forgotEmail.trim(), forgotCode.trim(), forgotNewPassword);
      setForgotCode('');
      setForgotNewPassword('');
      setForgotNewPasswordConfirm('');
      setToastMessage('Password updated. You can now sign in.');
      setToastVisible(true);
      setTimeout(() => {
        setToastVisible(false);
        setMode('signin');
      }, 2500);
    } catch (error: any) {
      setForgotError(forgotErrorMessage(error, 'Could not reset your password. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  // Creates the account — called only after the email is verified (or was
  // already verified in a past flow)
  const completeRegister = async () => {
    if (registeringRef.current) return; // a duplicate onVerified — ignore
    registeringRef.current = true;
    setShowOtpModal(false);
    try {
      await register({
        emailAddress: regEmail,
        password: regPassword,
        phoneNumber: `${regCountryCode}${regPhone}`,
        address: {
          street: regStreet,
          block: regBlock,
          ...(regAvenue.trim() ? { avenue: regAvenue.trim() } : {}),
          ...(regFlat.trim() ? { flat: regFlat.trim() } : {}),
          house: regHouse,
          city: regCity,
          governorate: regGovernorate,
        },
      });
      setToastMessage('Account created successfully!');
      setToastVisible(true);
      setTimeout(() => {
        setToastVisible(false);
        setMode('signin');
      }, 2500);
    } catch (error: any) {
      registeringRef.current = false; // failed — allow the user to retry
      // Check if error has details array from validation middleware
      if (error?.data?.details && Array.isArray(error.data.details)) {
        const fieldErrors: Record<string, string> = {};
        error.data.details.forEach((detail: any) => {
          // Map backend field names to frontend field names
          const fieldName = detail.field
            .replace('emailAddress', 'email')
            .replace('phoneNumber', 'phone');
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

  const handleRegister = async () => {
    const newErrors: Record<string, string> = {};

    // Validate email
    if (!regEmail.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail)) {
      newErrors.email = 'Invalid email format';
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
    if (!regStreet.trim()) newErrors.street = 'Street is required';
    if (!regBlock.trim()) newErrors.block = 'Block is required';
    if (!regHouse.trim()) newErrors.house = 'House number is required';
    if (!regCity.trim()) newErrors.city = 'City is required';
    if (!regGovernorate) newErrors.governorate = 'Governorate is required';

    if (Object.keys(newErrors).length > 0) {
      setRegErrors(newErrors);
      return;
    }

    setRegErrors({});
    setLoading(true);
    registeringRef.current = false; // fresh attempt — clear any prior lock
    try {
      // Emails that verified once (any flow) skip the OTP entirely
      const { alreadyVerified } = await requestEmailOtp(regEmail.trim());
      if (alreadyVerified) {
        await completeRegister();
        return;
      }
      setShowOtpModal(true);
    } catch (error: any) {
      setRegErrors({ email: error?.message || 'Could not send the verification code. Please try again.' });
      setLoading(false);
    }
  };

  return (
    <PageLayout
      menu={<SideMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />}
      header={<SiteHeader onMenuPress={() => setMenuOpen(true)} />}
      overlay={toastVisible ? <Toast message={toastMessage} /> : undefined}
    >
      <MaxWidthContainer>
        <div className={`flex flex-col gap-6 py-10 ${isDesktop ? 'px-16' : 'px-4'}`}>
          {/* SIGN IN CARD */}
          {mode === 'signin' && (
            <div className="border border-border bg-white">
              <div className="flex flex-col gap-5 p-6">
                <span className="mb-2 font-clash font-medium text-[20px] text-primary">Sign In to Your Account</span>

                <div className="flex flex-col gap-2">
                  <span className={labelClass}>Email</span>
                  <input
                    className={inputClass}
                    placeholder="your@email.com"
                    value={signInEmail}
                    onChange={e => setSignInEmail(e.target.value)}
                    type="email"
                    autoCapitalize="none"
                    disabled={loading}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <span className={labelClass}>Password</span>
                  <PasswordInput
                    placeholder="••••••••"
                    value={signInPassword}
                    onChange={e => setSignInPassword(e.target.value)}
                    disabled={loading}
                  />
                  <button type="button" className="self-end" onClick={openForgotPassword}>
                    <span className="font-dm text-[13px] text-secondary underline">Forgot password?</span>
                  </button>
                </div>

                <ErrorModal
                  visible={!!signInError}
                  title="Sign In Error"
                  message={signInError}
                  onClose={() => setSignInError('')}
                />

                <button
                  className={`mt-2 flex h-14 items-center justify-center bg-secondary ${loading ? 'opacity-60' : ''}`}
                  onClick={handleSignIn}
                  disabled={loading}
                >
                  <span className="font-clash font-medium text-[14px] uppercase tracking-[1.2px] text-white">
                    {loading ? 'SIGNING IN...' : 'SIGN IN'}
                  </span>
                </button>

                {/* Prompt to register */}
                <div className="mt-3 flex flex-row items-center justify-center">
                  <span className="font-dm text-[14px] text-muted">Don&apos;t have an account? </span>
                  <button onClick={() => { setMode('register'); setSignInError(''); }}>
                    <span className="font-dm text-[14px] text-secondary underline">Sign up here</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* FORGOT PASSWORD CARD */}
          {mode === 'forgot' && (
            <div className="border border-border bg-white">
              <div className="flex flex-col gap-5 p-6">
                <span className="mb-2 font-clash font-medium text-[20px] text-primary">Reset Your Password</span>

                {forgotStep === 'email' && (
                  <>
                    <span className="font-dm text-[14px] text-muted">
                      Enter the email address on your account and we&apos;ll send you a verification code.
                    </span>

                    <div className="flex flex-col gap-2">
                      <span className={labelClass}>Email</span>
                      <input
                        className={inputClass}
                        placeholder="your@email.com"
                        value={forgotEmail}
                        onChange={e => setForgotEmail(e.target.value)}
                        type="email"
                        autoCapitalize="none"
                        disabled={loading}
                      />
                    </div>

                    {forgotError && <span className="mt-2 font-dm text-[13px] text-error">{forgotError}</span>}

                    <button
                      className={`mt-2 flex h-14 items-center justify-center bg-secondary ${loading ? 'opacity-60' : ''}`}
                      onClick={handleSendResetCode}
                      disabled={loading}
                    >
                      <span className="font-clash font-medium text-[14px] uppercase tracking-[1.2px] text-white">
                        {loading ? 'SENDING...' : 'SEND CODE'}
                      </span>
                    </button>
                  </>
                )}

                {forgotStep === 'reset' && (
                  <>
                    <span className="font-dm text-[14px] text-muted">
                      We&apos;ve sent a code to {forgotEmail.trim()}. It expires in 10 minutes.
                    </span>

                    <div className="flex flex-col gap-2">
                      <span className={labelClass}>Verification Code</span>
                      <input
                        className={inputClass}
                        placeholder="123456"
                        value={forgotCode}
                        onChange={e => setForgotCode(e.target.value)}
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        disabled={loading}
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <span className={labelClass}>New Password</span>
                      <PasswordInput
                        placeholder="••••••••"
                        value={forgotNewPassword}
                        onChange={e => setForgotNewPassword(e.target.value)}
                        disabled={loading}
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <span className={labelClass}>Confirm New Password</span>
                      <PasswordInput
                        placeholder="••••••••"
                        value={forgotNewPasswordConfirm}
                        onChange={e => setForgotNewPasswordConfirm(e.target.value)}
                        disabled={loading}
                      />
                    </div>

                    {forgotError && <span className="mt-2 font-dm text-[13px] text-error">{forgotError}</span>}

                    <button
                      className={`mt-2 flex h-14 items-center justify-center bg-secondary ${loading ? 'opacity-60' : ''}`}
                      onClick={handleResetPassword}
                      disabled={loading}
                    >
                      <span className="font-clash font-medium text-[14px] uppercase tracking-[1.2px] text-white">
                        {loading ? 'UPDATING...' : 'RESET PASSWORD'}
                      </span>
                    </button>

                    <div className="flex flex-row items-center justify-center">
                      <button
                        onClick={() => { setForgotStep('email'); setForgotError(''); }}
                        disabled={loading}
                      >
                        <span className="font-dm text-[14px] text-secondary underline">Didn&apos;t get a code? Send it again</span>
                      </button>
                    </div>
                  </>
                )}

                <div className="mt-3 flex flex-row items-center justify-center">
                  <button onClick={() => { setMode('signin'); setForgotError(''); }}>
                    <span className="font-dm text-[14px] text-secondary underline">Back to sign in</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* REGISTER CARD */}
          {mode === 'register' && (
            <div className="border border-border bg-white">
              <div className="flex flex-col gap-5 p-6">
                <span className="mb-2 font-clash font-medium text-[20px] text-primary">Create Your Account</span>

                <div className="flex flex-col gap-2">
                  <span className={labelClass}>Email</span>
                  <input
                    className={`${inputClass} ${regErrors.email ? inputErrorClass : ''}`}
                    placeholder="your@email.com"
                    value={regEmail}
                    onChange={e => {
                      setRegEmail(e.target.value);
                      if (regErrors.email) setRegErrors({ ...regErrors, email: '' });
                    }}
                    type="email"
                    autoCapitalize="none"
                    disabled={loading}
                  />
                  {regErrors.email && <span className={fieldErrorClass}>{regErrors.email}</span>}
                </div>

                <div className="flex flex-col gap-2">
                  <span className={labelClass}>Password</span>
                  <PasswordInput
                    placeholder="••••••••"
                    value={regPassword}
                    onChange={e => {
                      setRegPassword(e.target.value);
                      if (regErrors.password) setRegErrors({ ...regErrors, password: '' });
                    }}
                    error={!!regErrors.password}
                    disabled={loading}
                  />
                  {regErrors.password && <span className={fieldErrorClass}>{regErrors.password}</span>}
                </div>

                <div className="flex flex-col gap-2">
                  <span className={labelClass}>Confirm Password</span>
                  <PasswordInput
                    placeholder="••••••••"
                    value={regPasswordConfirm}
                    onChange={e => {
                      setRegPasswordConfirm(e.target.value);
                      if (regErrors.passwordConfirm) setRegErrors({ ...regErrors, passwordConfirm: '' });
                    }}
                    error={!!regErrors.passwordConfirm}
                    disabled={loading}
                  />
                  {regErrors.passwordConfirm && <span className={fieldErrorClass}>{regErrors.passwordConfirm}</span>}
                </div>

                <div className="flex flex-col gap-2">
                  <span className={labelClass}>Phone Number</span>
                  <div className="flex flex-row items-center gap-2">
                    <input
                      className="h-[50px] w-20 border border-border px-3 font-dm text-[14px] text-black outline-none placeholder:text-muted"
                      placeholder="+965"
                      value={regCountryCode}
                      onChange={e => setRegCountryCode(e.target.value)}
                      disabled={loading}
                    />
                    <input
                      className={`${inputClass} flex-1 ${regErrors.phone ? inputErrorClass : ''}`}
                      placeholder="XXXX XXXX"
                      value={regPhone}
                      onChange={e => {
                        setRegPhone(e.target.value);
                        if (regErrors.phone) setRegErrors({ ...regErrors, phone: '' });
                      }}
                      type="tel"
                      disabled={loading}
                    />
                  </div>
                  {regErrors.phone && <span className={fieldErrorClass}>{regErrors.phone}</span>}
                </div>

                {/* Address Section */}
                <div className="flex flex-col gap-2">
                  <span className={labelClass}>Street Address</span>
                  <input
                    className={`${inputClass} ${regErrors.street ? inputErrorClass : ''}`}
                    placeholder="Street name"
                    value={regStreet}
                    onChange={e => {
                      setRegStreet(e.target.value);
                      if (regErrors.street) setRegErrors({ ...regErrors, street: '' });
                    }}
                    disabled={loading}
                  />
                  {regErrors.street && <span className={fieldErrorClass}>{regErrors.street}</span>}
                </div>

                <div className="flex flex-row">
                  <div className="flex flex-1 flex-col gap-2">
                    <span className={labelClass}>Block</span>
                    <input
                      className={`${inputClass} ${regErrors.block ? inputErrorClass : ''}`}
                      placeholder="Block #"
                      value={regBlock}
                      onChange={e => {
                        setRegBlock(e.target.value);
                        if (regErrors.block) setRegErrors({ ...regErrors, block: '' });
                      }}
                      inputMode="numeric"
                      disabled={loading}
                    />
                    {regErrors.block && <span className={fieldErrorClass}>{regErrors.block}</span>}
                  </div>
                  <div className="ml-3 flex flex-1 flex-col gap-2">
                    <span className={labelClass}>House #</span>
                    <input
                      className={`${inputClass} ${regErrors.house ? inputErrorClass : ''}`}
                      placeholder="House #"
                      value={regHouse}
                      onChange={e => {
                        setRegHouse(e.target.value);
                        if (regErrors.house) setRegErrors({ ...regErrors, house: '' });
                      }}
                      inputMode="numeric"
                      disabled={loading}
                    />
                    {regErrors.house && <span className={fieldErrorClass}>{regErrors.house}</span>}
                  </div>
                </div>

                <div className="flex flex-row">
                  <div className="flex flex-1 flex-col gap-2">
                    <span className={labelClass}>Avenue (optional)</span>
                    <input
                      className={inputClass}
                      placeholder="Avenue"
                      value={regAvenue}
                      onChange={e => setRegAvenue(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div className="ml-3 flex flex-1 flex-col gap-2">
                    <span className={labelClass}>Flat / Apt (optional)</span>
                    <input
                      className={inputClass}
                      placeholder="Flat / Apartment"
                      value={regFlat}
                      onChange={e => setRegFlat(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Governorate first, then City (dependent on governorate) */}
                <div className="flex flex-col gap-2">
                  <span className={labelClass}>Governorate</span>
                  <SelectField
                    value={regGovernorate}
                    placeholder="Select governorate"
                    options={governorates}
                    onSelect={handleGovernorateSelect}
                    disabled={loading}
                  />
                  {regErrors.governorate && <span className={fieldErrorClass}>{regErrors.governorate}</span>}
                </div>

                <div className="flex flex-col gap-2">
                  <span className={labelClass}>City</span>
                  <SelectField
                    value={regCity}
                    placeholder={regGovernorate ? 'Select city' : 'Select governorate first'}
                    options={regGovernorate ? (areas[regGovernorate] ?? []) : []}
                    onSelect={city => {
                      setRegCity(city);
                      if (regErrors.city) setRegErrors({ ...regErrors, city: '' });
                    }}
                    disabled={loading || !regGovernorate}
                  />
                  {regErrors.city && <span className={fieldErrorClass}>{regErrors.city}</span>}
                </div>

                {regErrors.submit && <span className="mt-2 font-dm text-[13px] text-error">{regErrors.submit}</span>}

                <button
                  className={`mt-2 flex h-14 items-center justify-center bg-secondary ${loading ? 'opacity-60' : ''}`}
                  onClick={handleRegister}
                  disabled={loading}
                >
                  <span className="font-clash font-medium text-[14px] uppercase tracking-[1.2px] text-white">
                    {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
                  </span>
                </button>

                {/* Back to sign in */}
                <div className="mt-3 flex flex-row items-center justify-center">
                  <span className="font-dm text-[14px] text-muted">Already have an account? </span>
                  <button onClick={() => { setMode('signin'); setRegErrors({}); }}>
                    <span className="font-dm text-[14px] text-secondary underline">Sign in here</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="h-12" />
        </div>
      </MaxWidthContainer>
      <VerifyEmailModal
        visible={showOtpModal}
        email={regEmail.trim()}
        onClose={() => { setShowOtpModal(false); setLoading(false); }}
        onVerified={completeRegister}
      />
    </PageLayout>
  );
}
