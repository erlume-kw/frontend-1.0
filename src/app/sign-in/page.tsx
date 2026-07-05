'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import SiteHeader from '@/components/layout/SiteHeader';
import PageLayout from '@/components/layout/PageLayout';
import SideMenu from '@/components/layout/SideMenu';
import MaxWidthContainer from '@/components/layout/MaxWidthContainer';
import { useIsDesktop } from '@/lib/useIsDesktop';
import { login, register } from '@/services/api';

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
        router.push('/');
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
      });
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
                  <input
                    className={inputClass}
                    placeholder="••••••••"
                    value={signInPassword}
                    onChange={e => setSignInPassword(e.target.value)}
                    type="password"
                    disabled={loading}
                  />
                </div>

                {signInError && <span className="mt-2 font-dm text-[13px] text-error">{signInError}</span>}

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
                  <span className={labelClass}>Username</span>
                  <input
                    className={`${inputClass} ${regErrors.username ? inputErrorClass : ''}`}
                    placeholder="Choose a username"
                    value={regUsername}
                    onChange={e => {
                      setRegUsername(e.target.value);
                      if (regErrors.username) setRegErrors({ ...regErrors, username: '' });
                    }}
                    autoCapitalize="none"
                    disabled={loading}
                  />
                  {regErrors.username && <span className={fieldErrorClass}>{regErrors.username}</span>}
                </div>

                <div className="flex flex-col gap-2">
                  <span className={labelClass}>Password</span>
                  <input
                    className={`${inputClass} ${regErrors.password ? inputErrorClass : ''}`}
                    placeholder="••••••••"
                    value={regPassword}
                    onChange={e => {
                      setRegPassword(e.target.value);
                      if (regErrors.password) setRegErrors({ ...regErrors, password: '' });
                    }}
                    type="password"
                    disabled={loading}
                  />
                  {regErrors.password && <span className={fieldErrorClass}>{regErrors.password}</span>}
                </div>

                <div className="flex flex-col gap-2">
                  <span className={labelClass}>Confirm Password</span>
                  <input
                    className={`${inputClass} ${regErrors.passwordConfirm ? inputErrorClass : ''}`}
                    placeholder="••••••••"
                    value={regPasswordConfirm}
                    onChange={e => {
                      setRegPasswordConfirm(e.target.value);
                      if (regErrors.passwordConfirm) setRegErrors({ ...regErrors, passwordConfirm: '' });
                    }}
                    type="password"
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

                <div className="flex flex-col gap-2">
                  <span className={labelClass}>City</span>
                  <input
                    className={`${inputClass} ${regErrors.city ? inputErrorClass : ''}`}
                    placeholder="City"
                    value={regCity}
                    onChange={e => {
                      setRegCity(e.target.value);
                      if (regErrors.city) setRegErrors({ ...regErrors, city: '' });
                    }}
                    disabled={loading}
                  />
                  {regErrors.city && <span className={fieldErrorClass}>{regErrors.city}</span>}
                </div>

                <div className="flex flex-col gap-2">
                  <span className={labelClass}>Governorate</span>
                  <button
                    className={`flex h-[50px] w-full flex-row items-center justify-between border border-border px-3 pr-3 ${regErrors.governorate ? inputErrorClass : ''}`}
                    onClick={() => setGovDropdownOpen(true)}
                  >
                    <span className={`font-dm text-[14px] ${regGovernorate ? 'text-black' : 'text-muted'}`}>
                      {regGovernorate || 'Select governorate'}
                    </span>
                    <span className="font-glyph text-[12px] text-muted">▼</span>
                  </button>
                  {regErrors.governorate && <span className={fieldErrorClass}>{regErrors.governorate}</span>}
                </div>

                {govDropdownOpen && (
                  <div
                    className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50"
                    onClick={() => setGovDropdownOpen(false)}
                  >
                    <div className="max-h-[300px] w-[80%] max-w-[300px] overflow-y-auto border border-border bg-white">
                      {KUWAIT_GOVERNORATES.map(gov => (
                        <button
                          key={gov}
                          className={`block w-full border-b border-border px-4 py-3 text-left ${regGovernorate === gov ? 'bg-[rgba(197,112,93,0.1)]' : ''}`}
                          onClick={e => {
                            e.stopPropagation();
                            setRegGovernorate(gov);
                            if (regErrors.governorate) setRegErrors({ ...regErrors, governorate: '' });
                            setGovDropdownOpen(false);
                          }}
                        >
                          <span className={`font-dm text-[14px] ${regGovernorate === gov ? 'font-semibold text-secondary' : 'text-black'}`}>
                            {gov}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

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
    </PageLayout>
  );
}
