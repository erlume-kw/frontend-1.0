'use client';

import { toWesternDigits } from '@/lib/useNumerals';
import React, { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
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
  const t = useTranslations('SignIn');
  const locale = useLocale();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'signin' | 'register' | 'forgot'>('signin');
  const { areas, governorates, placeLabel } = useKuwaitAreas();
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
  const [regLanguage, setRegLanguage] = useState<'en' | 'ar'>('en');

  // Field-specific errors
  const [regErrors, setRegErrors] = useState<Record<string, string>>({});
  useEffect(() => { setRegLanguage(locale === 'ar' ? 'ar' : 'en'); }, [locale]);

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
      setSignInError(t('bothRequired'));
      return;
    }

    setLoading(true);
    try {
      await login(signInEmail, signInPassword);
      setToastMessage(t('signedIn'));
      setToastVisible(true);
      setTimeout(() => {
        setToastVisible(false);
        router.push('/');
      }, 2500);
    } catch (error: any) {
      setSignInError(error?.message || t('signInFailed'));
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
      setForgotError(t('forgot.validEmail'));
      return;
    }
    setLoading(true);
    try {
      await requestPasswordReset(email);
      setForgotStep('reset');
    } catch (error: any) {
      setForgotError(forgotErrorMessage(error, t('forgot.couldNotSend')));
    } finally {
      setLoading(false);
    }
  };

  // Step 2 — code + new password
  const handleResetPassword = async () => {
    setForgotError('');
    if (!/^[0-9]{4,8}$/.test(forgotCode.trim())) {
      setForgotError(t('forgot.codeRequired'));
      return;
    }
    if (forgotNewPassword.length < 8) {
      setForgotError(t('forgot.passwordMin8'));
      return;
    }
    if (forgotNewPassword !== forgotNewPasswordConfirm) {
      setForgotError(t('forgot.passwordsMismatch'));
      return;
    }
    setLoading(true);
    try {
      await resetPassword(forgotEmail.trim(), forgotCode.trim(), forgotNewPassword);
      setForgotCode('');
      setForgotNewPassword('');
      setForgotNewPasswordConfirm('');
      setToastMessage(t('forgot.resetDone'));
      setToastVisible(true);
      setTimeout(() => {
        setToastVisible(false);
        setMode('signin');
      }, 2500);
    } catch (error: any) {
      setForgotError(forgotErrorMessage(error, t('forgot.resetFailed')));
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
        language: regLanguage,
      });
      setToastMessage(t('register.created'));
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
        setRegErrors({ submit: error?.message || t('register.failed') });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    const newErrors: Record<string, string> = {};

    // Validate email
    if (!regEmail.trim()) {
      newErrors.email = t('register.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail)) {
      newErrors.email = t('register.emailInvalid');
    }

    // Validate password
    if (!regPassword.trim()) {
      newErrors.password = t('register.passwordRequired');
    } else if (regPassword.length < 6) {
      newErrors.password = t('register.passwordMin6');
    }

    // Validate password confirmation
    if (!regPasswordConfirm.trim()) {
      newErrors.passwordConfirm = t('register.confirmRequired');
    } else if (regPassword !== regPasswordConfirm) {
      newErrors.passwordConfirm = t('forgot.passwordsMismatch');
    }

    // Validate phone
    if (!regPhone.trim()) {
      newErrors.phone = t('register.phoneRequired');
    } else if (regPhone.length < 8) {
      newErrors.phone = t('register.phoneMin');
    }

    // Validate address
    if (!regStreet.trim()) newErrors.street = t('register.streetRequired');
    if (!regBlock.trim()) newErrors.block = t('register.blockRequired');
    if (!regHouse.trim()) newErrors.house = t('register.houseRequired');
    if (!regCity.trim()) newErrors.city = t('register.cityRequired');
    if (!regGovernorate) newErrors.governorate = t('register.governorateRequired');

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
      setRegErrors({ email: error?.message || t('register.codeSendFailed') });
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
                <span className="mb-2 font-clash font-medium text-[20px] text-primary">{t('signInTitle')}</span>

                <div className="flex flex-col gap-2">
                  <span className={labelClass}>{t('email')}</span>
                  <input
                    className={inputClass}
                    placeholder={t('emailPlaceholder')}
                    value={signInEmail}
                    onChange={e => setSignInEmail(e.target.value)}
                    type="email"
                    autoCapitalize="none"
                    disabled={loading}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <span className={labelClass}>{t('password')}</span>
                  <PasswordInput
                    placeholder="••••••••"
                    value={signInPassword}
                    onChange={e => setSignInPassword(e.target.value)}
                    disabled={loading}
                  />
                  <button type="button" className="self-end" onClick={openForgotPassword}>
                    <span className="font-dm text-[13px] text-secondary underline">{t('forgotLink')}</span>
                  </button>
                </div>

                <ErrorModal
                  visible={!!signInError}
                  title={t('errorTitle')}
                  message={signInError}
                  onClose={() => setSignInError('')}
                />

                <button
                  className={`mt-2 flex h-14 items-center justify-center bg-secondary ${loading ? 'opacity-60' : ''}`}
                  onClick={handleSignIn}
                  disabled={loading}
                >
                  <span className="font-clash font-medium text-[14px] uppercase tracking-[1.2px] text-white">
                    {loading ? t('signingIn') : t('signInButton')}
                  </span>
                </button>

                {/* Prompt to register */}
                <div className="mt-3 flex flex-row items-center justify-center">
                  <span className="font-dm text-[14px] text-muted">{t('noAccount')} </span>
                  <button onClick={() => { setMode('register'); setSignInError(''); }}>
                    <span className="font-dm text-[14px] text-secondary underline">{t('signUpHere')}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* FORGOT PASSWORD CARD */}
          {mode === 'forgot' && (
            <div className="border border-border bg-white">
              <div className="flex flex-col gap-5 p-6">
                <span className="mb-2 font-clash font-medium text-[20px] text-primary">{t('forgot.title')}</span>

                {forgotStep === 'email' && (
                  <>
                    <span className="font-dm text-[14px] text-muted">
                      {t('forgot.intro')}
                    </span>

                    <div className="flex flex-col gap-2">
                      <span className={labelClass}>{t('email')}</span>
                      <input
                        className={inputClass}
                        placeholder={t('emailPlaceholder')}
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
                        {loading ? t('forgot.sending') : t('forgot.sendCode')}
                      </span>
                    </button>
                  </>
                )}

                {forgotStep === 'reset' && (
                  <>
                    <span className="font-dm text-[14px] text-muted">
                      {t.rich('forgot.sentTo', {
                        email: forgotEmail.trim(),
                        addr: chunks => <span dir="ltr">{chunks}</span>,
                      })}
                    </span>

                    <div className="flex flex-col gap-2">
                      <span className={labelClass}>{t('forgot.verificationCode')}</span>
                      <input
                        className={inputClass}
                        placeholder={t('forgot.codePlaceholder')}
                        value={forgotCode}
                        onChange={e => setForgotCode(toWesternDigits(e.target.value))}
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        disabled={loading}
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <span className={labelClass}>{t('forgot.newPassword')}</span>
                      <PasswordInput
                        placeholder="••••••••"
                        value={forgotNewPassword}
                        onChange={e => setForgotNewPassword(e.target.value)}
                        disabled={loading}
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <span className={labelClass}>{t('forgot.confirmNewPassword')}</span>
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
                        {loading ? t('forgot.updating') : t('forgot.resetButton')}
                      </span>
                    </button>

                    <div className="flex flex-row items-center justify-center">
                      <button
                        onClick={() => { setForgotStep('email'); setForgotError(''); }}
                        disabled={loading}
                      >
                        <span className="font-dm text-[14px] text-secondary underline">{t('forgot.sendAgain')}</span>
                      </button>
                    </div>
                  </>
                )}

                <div className="mt-3 flex flex-row items-center justify-center">
                  <button onClick={() => { setMode('signin'); setForgotError(''); }}>
                    <span className="font-dm text-[14px] text-secondary underline">{t('forgot.backToSignIn')}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* REGISTER CARD */}
          {mode === 'register' && (
            <div className="border border-border bg-white">
              <div className="flex flex-col gap-5 p-6">
                <span className="mb-2 font-clash font-medium text-[20px] text-primary">{t('register.title')}</span>

                <div className="flex flex-col gap-2">
                  <span className={labelClass}>{t('email')}</span>
                  <input
                    className={`${inputClass} ${regErrors.email ? inputErrorClass : ''}`}
                    placeholder={t('emailPlaceholder')}
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
                  <span className={labelClass}>{t('password')}</span>
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
                  <span className={labelClass}>{t('register.confirmPassword')}</span>
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
                  <span className={labelClass}>{t('register.phone')}</span>
                  <div className="flex flex-row items-center gap-2">
                    <input
                      className="h-[50px] w-20 border border-border px-3 font-dm text-[14px] text-black outline-none placeholder:text-muted"
                      placeholder="+965"
                      dir="ltr"
                      value={regCountryCode}
                      onChange={e => setRegCountryCode(e.target.value)}
                      disabled={loading}
                    />
                    <input
                      className={`${inputClass} flex-1 ${regErrors.phone ? inputErrorClass : ''}`}
                      placeholder={t('register.phonePlaceholder')}
                      value={regPhone}
                      onChange={e => {
                        setRegPhone(toWesternDigits(e.target.value));
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
                  <span className={labelClass}>{t('register.streetAddress')}</span>
                  <input
                    className={`${inputClass} ${regErrors.street ? inputErrorClass : ''}`}
                    placeholder={t('register.streetPlaceholder')}
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
                    <span className={labelClass}>{t('register.block')}</span>
                    <input
                      className={`${inputClass} ${regErrors.block ? inputErrorClass : ''}`}
                      placeholder={t('register.blockPlaceholder')}
                      value={regBlock}
                      onChange={e => {
                        setRegBlock(toWesternDigits(e.target.value));
                        if (regErrors.block) setRegErrors({ ...regErrors, block: '' });
                      }}
                      inputMode="numeric"
                      disabled={loading}
                    />
                    {regErrors.block && <span className={fieldErrorClass}>{regErrors.block}</span>}
                  </div>
                  <div className="ms-3 flex flex-1 flex-col gap-2">
                    <span className={labelClass}>{t('register.house')}</span>
                    <input
                      className={`${inputClass} ${regErrors.house ? inputErrorClass : ''}`}
                      placeholder={t('register.house')}
                      value={regHouse}
                      onChange={e => {
                        setRegHouse(toWesternDigits(e.target.value));
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
                    <span className={labelClass}>{t('register.avenueOptional')}</span>
                    <input
                      className={inputClass}
                      placeholder={t('register.avenue')}
                      value={regAvenue}
                      onChange={e => setRegAvenue(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div className="ms-3 flex flex-1 flex-col gap-2">
                    <span className={labelClass}>{t('register.flatOptional')}</span>
                    <input
                      className={inputClass}
                      placeholder={t('register.flat')}
                      value={regFlat}
                      onChange={e => setRegFlat(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Governorate first, then City (dependent on governorate) */}
                <div className="flex flex-col gap-2">
                  <span className={labelClass}>{t('register.governorate')}</span>
                  <SelectField
                    value={regGovernorate}
                    placeholder={t('register.selectGovernorate')}
                    options={governorates}
                    optionLabel={placeLabel}
                    onSelect={handleGovernorateSelect}
                    disabled={loading}
                  />
                  {regErrors.governorate && <span className={fieldErrorClass}>{regErrors.governorate}</span>}
                </div>

                <div className="flex flex-col gap-2">
                  <span className={labelClass}>{t('register.city')}</span>
                  <SelectField
                    value={regCity}
                    placeholder={regGovernorate ? t('register.selectCity') : t('register.selectGovernorateFirst')}
                    options={regGovernorate ? (areas[regGovernorate] ?? []) : []}
                    optionLabel={placeLabel}
                    onSelect={city => {
                      setRegCity(city);
                      if (regErrors.city) setRegErrors({ ...regErrors, city: '' });
                    }}
                    disabled={loading || !regGovernorate}
                  />
                  {regErrors.city && <span className={fieldErrorClass}>{regErrors.city}</span>}
                </div>

                <div className="flex flex-col gap-[6px]">
                  <span className={labelClass}>{t('register.language')}</span>
                  <span className="font-dm text-[13px] leading-[19px] text-muted">{t('register.languageHint')}</span>
                  <div className="mt-1 flex flex-row items-center" role="radiogroup" aria-label={t('register.language')}>
                    {(['en', 'ar'] as const).map((code, i) => (
                      <React.Fragment key={code}>
                        {i > 0 && <span aria-hidden className="mx-4 h-[14px] w-px bg-border" />}
                        <button
                          type="button"
                          role="radio"
                          aria-checked={regLanguage === code}
                          disabled={loading}
                          onClick={() => setRegLanguage(code)}
                          className={`py-1 font-dm text-[14px] outline-none ${
                            regLanguage === code ? 'font-medium text-secondary underline underline-offset-[6px]' : 'text-muted'
                          } ${loading ? 'opacity-60' : ''}`}
                        >
                          {code === 'en' ? 'English' : 'العربية'}
                        </button>
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {regErrors.submit && <span className="mt-2 font-dm text-[13px] text-error">{regErrors.submit}</span>}

                <button
                  className={`mt-2 flex h-14 items-center justify-center bg-secondary ${loading ? 'opacity-60' : ''}`}
                  onClick={handleRegister}
                  disabled={loading}
                >
                  <span className="font-clash font-medium text-[14px] uppercase tracking-[1.2px] text-white">
                    {loading ? t('register.creating') : t('register.createButton')}
                  </span>
                </button>

                {/* Back to sign in */}
                <div className="mt-3 flex flex-row items-center justify-center">
                  <span className="font-dm text-[14px] text-muted">{t('register.haveAccount')} </span>
                  <button onClick={() => { setMode('signin'); setRegErrors({}); }}>
                    <span className="font-dm text-[14px] text-secondary underline">{t('register.signInHere')}</span>
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
