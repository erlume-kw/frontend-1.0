'use client';

import { toWesternDigits } from '@/lib/useNumerals';
import { useTranslations } from 'next-intl';
import React, { useEffect, useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import SiteHeader from '@/components/layout/SiteHeader';
import PageLayout from '@/components/layout/PageLayout';
import SideMenu from '@/components/layout/SideMenu';
import MaxWidthContainer from '@/components/layout/MaxWidthContainer';
import LogoutConfirmModal from '@/components/LogoutConfirmModal';
import VerifyEmailModal from '@/components/VerifyEmailModal';
import SelectField from '@/components/ui/SelectField';
import PasswordInput from '@/components/ui/PasswordInput';
import { SkeletonBox } from '@/components/ui/Skeleton';
import { useKuwaitAreas } from '@/lib/useKuwaitAreas';
import { useIsDesktop } from '@/lib/useIsDesktop';
import {
  getAccessToken,
  getMe,
  logout as apiLogout,
  updateMyAddress,
  updateMyEmail,
  updateMyPhone,
  requestEmailOtp,
  changePassword,
  type AuthUser,
} from '@/services/api';

const inputClass =
  'h-[52px] w-full border-0 bg-lightGrey px-[11px] font-dm text-[14px] text-black outline-none placeholder:text-muted';

// A skeleton bar that occupies the same line box as real text (font-size × 1.5,
// the app-wide default line-height), so the placeholder sits exactly where the
// text will land. `bar` controls the visible bar thickness inside that line box.
function SkeletonLine({
  font,
  width,
  bar,
  className = '',
}: {
  font: number;
  width: number | string;
  bar: number;
  className?: string;
}) {
  return (
    <div className={`flex items-center ${className}`} style={{ height: Math.round(font * 1.5) }}>
      <SkeletonBox width={width} height={bar} />
    </div>
  );
}

export default function ProfilePage() {
  const isDesktop = useIsDesktop();
  const { areas, governorates, placeLabel } = useKuwaitAreas();
  const router = useRouter();
  const t = useTranslations('Profile');
  const [menuOpen, setMenuOpen] = useState(false);

  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Address editing
  const [editingAddress, setEditingAddress] = useState(false);
  const [governorate, setGovernorate] = useState('');
  const [area, setArea] = useState('');
  const [block, setBlock] = useState('');
  const [street, setStreet] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [avenue, setAvenue] = useState('');
  const [flat, setFlat] = useState('');
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({});
  const [addressSaving, setAddressSaving] = useState(false);
  const [addressError, setAddressError] = useState('');
  const [addressSaved, setAddressSaved] = useState(false);

  // Email editing (requires OTP verification before save)
  const [editingEmail, setEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [emailSaved, setEmailSaved] = useState(false);
  const [showEmailVerifyModal, setShowEmailVerifyModal] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');

  // Phone editing
  const [editingPhone, setEditingPhone] = useState(false);
  const [newPhone, setNewPhone] = useState('');
  const [phoneSaving, setPhoneSaving] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [phoneSaved, setPhoneSaved] = useState(false);

  // Change password
  const [editingPassword, setEditingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSaved, setPasswordSaved] = useState(false);

  // Logout
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Signed-out visitors have no profile — send them to the sign-in flow
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = await getAccessToken();
        if (!token) {
          router.replace('/sign-in');
          return;
        }
        const me = await getMe();
        if (!cancelled) { setUser(me); setLoading(false); }
      } catch {
        if (!cancelled) router.replace('/sign-in');
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startEditingAddress = () => {
    // Pre-fill the form with the saved address
    setGovernorate(user?.address?.governorate ?? '');
    setArea(user?.address?.city ?? '');
    setBlock(user?.address?.block ?? '');
    setStreet(user?.address?.street ?? '');
    setHouseNumber(user?.address?.house ?? '');
    setAvenue(user?.address?.avenue ?? '');
    setFlat(user?.address?.flat ?? '');
    setAddressErrors({});
    setAddressError('');
    setAddressSaved(false);
    setEditingAddress(true);
  };

  const handleSaveAddress = async () => {
    const errs: Record<string, string> = {};
    if (!governorate.trim()) errs.governorate = t('errGovernorate');
    if (!area.trim()) errs.area = t('errArea');
    if (!block.trim()) errs.block = t('errBlock');
    if (!street.trim()) errs.street = t('errStreet');
    if (!houseNumber.trim()) errs.houseNumber = t('errHouse');
    setAddressErrors(errs);
    if (Object.keys(errs).length > 0 || !user) return;

    setAddressSaving(true);
    setAddressError('');
    const address = {
      street,
      block,
      city: area,
      governorate,
      house: houseNumber,
      ...(avenue.trim() ? { avenue: avenue.trim() } : {}),
      ...(flat.trim() ? { flat: flat.trim() } : {}),
    };
    try {
      await updateMyAddress(user._id, address);
      setUser({ ...user, address });
      setEditingAddress(false);
      setAddressSaved(true);
    } catch (e: any) {
      setAddressError(e.message ?? t('couldNotSaveAddress'));
    } finally {
      setAddressSaving(false);
    }
  };

  const completeEmailChange = async (email: string) => {
    if (!user) return;
    setShowEmailVerifyModal(false);
    setEmailSaving(true);
    setEmailError('');
    try {
      const updated = await updateMyEmail(user._id, email);
      setUser(updated);
      setEditingEmail(false);
      setNewEmail('');
      setPendingEmail('');
      setEmailSaved(true);
    } catch (e: any) {
      setEmailError(e.message ?? t('couldNotUpdateEmail'));
    } finally {
      setEmailSaving(false);
    }
  };

  const handleRequestEmailChange = async () => {
    setEmailError('');
    const trimmed = newEmail.trim();
    if (!trimmed) {
      setEmailError(t('emailRequired'));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailError(t('emailInvalid'));
      return;
    }
    if (trimmed.toLowerCase() === user?.emailAddress.toLowerCase()) {
      setEditingEmail(false);
      setNewEmail('');
      return;
    }

    setEmailSaving(true);
    try {
      const { alreadyVerified } = await requestEmailOtp(trimmed);
      setPendingEmail(trimmed);
      if (alreadyVerified) {
        await completeEmailChange(trimmed);
      } else {
        setShowEmailVerifyModal(true);
      }
    } catch (e: any) {
      setEmailError(e.message ?? t('couldNotSendVerify'));
    } finally {
      setEmailSaving(false);
    }
  };

  const handleSavePhone = async () => {
    setPhoneError('');
    const trimmed = newPhone.trim();
    if (!trimmed) {
      setPhoneError(t('phoneRequired'));
      return;
    }
    if (!/^[+]?[\s\-]?[0-9]{7,15}$/.test(trimmed)) {
      setPhoneError(t('phoneInvalid'));
      return;
    }
    if (!user) return;

    setPhoneSaving(true);
    try {
      const updated = await updateMyPhone(user._id, trimmed);
      setUser(updated);
      setEditingPhone(false);
      setNewPhone('');
      setPhoneSaved(true);
    } catch (e: any) {
      setPhoneError(e.message ?? t('couldNotUpdatePhone'));
    } finally {
      setPhoneSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError(t('fillAllPasswords'));
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError(t('passwordMin6'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError(t('passwordMismatch'));
      return;
    }

    setPasswordSaving(true);
    try {
      await changePassword(currentPassword, newPassword);
      setEditingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordSaved(true);
    } catch (e: any) {
      setPasswordError(e.message ?? t('couldNotChangePassword'));
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleConfirmLogout = async () => {
    setLoggingOut(true);
    try {
      await apiLogout();
      setShowLogoutConfirm(false);
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      setLoggingOut(false);
    }
  };

  const ErrorText = ({ field }: { field: string }) =>
    addressErrors[field] ? (
      <span className="mt-1 block font-dm text-[13px] text-error">{addressErrors[field]}</span>
    ) : null;

  const sectionTitle = `block font-clash font-semibold text-black ${isDesktop ? 'text-[21px]' : 'text-[18px]'}`;

  const addressLine = user?.address
    ? t('addressLine', {
        street: user.address.street ?? '',
        block: user.address.block ?? '',
        city: placeLabel(user.address.city ?? ''),
        governorate: placeLabel(user.address.governorate ?? ''),
        house: user.address.house ?? '',
      })
    : t('noAddress');

  return (
    <PageLayout
      menu={<SideMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />}
      header={<SiteHeader onMenuPress={() => setMenuOpen(true)} />}
    >
      <MaxWidthContainer className={isDesktop ? 'px-16' : ''}>
        {loading ? (
          // Mirrors the loaded layout exactly — same wrappers, gaps and margins,
          // with each text placeholder reserving its real line-box height so
          // nothing shifts when the content arrives.
          <div className={`w-full ${isDesktop ? 'py-12' : 'p-[21px]'}`}>
            {/* Title */}
            <SkeletonLine font={isDesktop ? 40 : 28} width={isDesktop ? 240 : 170} bar={isDesktop ? 34 : 26} className="mb-7" />

            {/* Account section */}
            <div className="mb-8 flex flex-col gap-[14px]">
              <SkeletonLine font={isDesktop ? 21 : 18} width={110} bar={20} />
              <div className="flex flex-col gap-3 border border-border bg-white p-4">
                <div className="flex flex-col gap-[2px]">
                  <SkeletonLine font={12} width={60} bar={10} />
                  <SkeletonLine font={14} width="55%" bar={12} />
                </div>
                <div className="flex flex-col gap-[2px]">
                  <SkeletonLine font={12} width={110} bar={10} />
                  <SkeletonLine font={14} width="40%" bar={12} />
                </div>
              </div>
            </div>

            {/* Saved address section */}
            <div className="mb-8 flex flex-col gap-[14px]">
              <SkeletonLine font={isDesktop ? 21 : 18} width={150} bar={20} />
              <div className="flex flex-col gap-[6px] border border-border bg-white p-4">
                <div className="flex flex-row items-center justify-between">
                  <SkeletonLine font={12} width={130} bar={10} />
                  <SkeletonBox width={64} height={22} />
                </div>
                <SkeletonLine font={13} width="70%" bar={11} />
                <SkeletonLine font={12} width={100} bar={10} className="mt-2" />
              </div>
            </div>

            {/* Change password */}
            <div className="mb-8 flex flex-col gap-[14px]">
              <SkeletonBox width={190} height={48} />
            </div>

            {/* Logout */}
            <SkeletonBox height={48} />
          </div>
        ) : (
          <div className={`w-full ${isDesktop ? 'py-12' : 'p-[21px]'}`}>
            <h1 className={`mb-7 font-clash font-medium text-black ${isDesktop ? 'text-[40px]' : 'text-[28px]'}`}>
              {t('title')}
            </h1>

            {/* Account details */}
            <div className="mb-8 flex flex-col gap-[14px]">
              <span className={sectionTitle}>{t('account')}</span>
              <div className="flex flex-col gap-4 border border-border bg-white p-4">
                {/* Email */}
                <div className="flex flex-col gap-[6px]">
                  <span className="font-dm font-medium text-[12px] uppercase tracking-[0.8px] text-muted">{t('email')}</span>
                  {!editingEmail ? (
                    <>
                      <span className="break-all font-dm text-[14px] text-black"><bdi dir="ltr">{user?.emailAddress}</bdi></span>
                      <button
                        className="self-start"
                        onClick={() => {
                          setEditingEmail(true);
                          setNewEmail(user?.emailAddress ?? '');
                          setEmailError('');
                          setEmailSaved(false);
                        }}
                      >
                        <span className="font-clash font-medium text-[12px] uppercase tracking-[0.8px] text-secondary">
                          {t('editEmail')}
                        </span>
                      </button>
                      {emailSaved && (
                        <span className="font-dm text-[13px] text-olive">{t('emailUpdated')}</span>
                      )}
                    </>
                  ) : (
                    <>
                      <input
                        className={inputClass}
                        placeholder={t('emailPlaceholder')}
                        value={newEmail}
                        onChange={e => setNewEmail(e.target.value)}
                        type="email"
                        autoCapitalize="none"
                        disabled={emailSaving}
                      />
                      {!!emailError && <span className="font-dm text-[13px] text-error">{emailError}</span>}
                      <button
                        className={`flex h-12 items-center justify-center border border-secondary bg-secondary ${emailSaving ? 'opacity-60' : ''}`}
                        onClick={handleRequestEmailChange}
                        disabled={emailSaving}
                      >
                        <span className="font-clash font-medium text-[13px] tracking-[1px] text-white">
                          {emailSaving ? t('sending') : t('verifySave')}
                        </span>
                      </button>
                      <button
                        className="flex items-center justify-center py-[6px]"
                        onClick={() => {
                          setEditingEmail(false);
                          setNewEmail('');
                          setEmailError('');
                          setPendingEmail('');
                        }}
                        disabled={emailSaving}
                      >
                        <span className="font-dm text-[13px] text-secondary underline">{t('cancel')}</span>
                      </button>
                    </>
                  )}
                </div>

                {/* Phone */}
                <div className="flex flex-col gap-[6px] border-t border-border pt-4">
                  <span className="font-dm font-medium text-[12px] uppercase tracking-[0.8px] text-muted">{t('phone')}</span>
                  {!editingPhone ? (
                    <>
                      <span className="font-dm text-[14px] text-black"><bdi dir="ltr">{user?.phoneNumber ?? '—'}</bdi></span>
                      <button
                        className="self-start"
                        onClick={() => {
                          setEditingPhone(true);
                          setNewPhone(user?.phoneNumber ?? '');
                          setPhoneError('');
                          setPhoneSaved(false);
                        }}
                      >
                        <span className="font-clash font-medium text-[12px] uppercase tracking-[0.8px] text-secondary">
                          {t('editPhone')}
                        </span>
                      </button>
                      {phoneSaved && (
                        <span className="font-dm text-[13px] text-olive">{t('phoneUpdated')}</span>
                      )}
                    </>
                  ) : (
                    <>
                      <input
                        className={inputClass}
                        placeholder="+965 XXXX XXXX"
                        value={newPhone}
                        onChange={e => setNewPhone(toWesternDigits(e.target.value))}
                        type="tel"
                        disabled={phoneSaving}
                      />
                      {!!phoneError && <span className="font-dm text-[13px] text-error">{phoneError}</span>}
                      <button
                        className={`flex h-12 items-center justify-center border border-secondary bg-secondary ${phoneSaving ? 'opacity-60' : ''}`}
                        onClick={handleSavePhone}
                        disabled={phoneSaving}
                      >
                        <span className="font-clash font-medium text-[13px] tracking-[1px] text-white">
                          {phoneSaving ? t('saving') : t('savePhone')}
                        </span>
                      </button>
                      <button
                        className="flex items-center justify-center py-[6px]"
                        onClick={() => {
                          setEditingPhone(false);
                          setNewPhone('');
                          setPhoneError('');
                        }}
                        disabled={phoneSaving}
                      >
                        <span className="font-dm text-[13px] text-secondary underline">{t('cancel')}</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Saved address */}
            <div className="mb-8 flex flex-col gap-[14px]">
              <span className={sectionTitle}>{t('savedAddress')}</span>

              {!editingAddress ? (
                <>
                  <div className="flex flex-col gap-[6px] border border-border bg-white p-4">
                    <div className="flex flex-row items-center justify-between">
                      <span className="font-dm font-medium text-[12px] uppercase tracking-[0.8px] text-muted">
                        {t('profileAddress')}
                      </span>
                      {user?.address && (
                        <span className="bg-[rgba(197,112,93,0.12)] px-2 py-[3px]">
                          <span className="font-dm font-medium text-[11px] tracking-[0.8px] text-secondary">{t('default')}</span>
                        </span>
                      )}
                    </div>
                    <span className="font-dm text-[13px] leading-[19px] text-muted">{addressLine}</span>
                    <button className="mt-2 self-start" onClick={startEditingAddress}>
                      <span className="font-clash font-medium text-[12px] uppercase tracking-[0.8px] text-secondary">
                        {t('editAddress')}
                      </span>
                    </button>
                  </div>
                  {addressSaved && (
                    <span className="font-dm text-[13px] text-olive">{t('addressUpdated')}</span>
                  )}
                </>
              ) : (
                <>
                  <div className="flex flex-col gap-[14px]">
                    <div>
                      <SelectField
                        value={governorate}
                        placeholder={t('governorate')}
                        options={governorates}
                        optionLabel={placeLabel}
                        onSelect={g => { setGovernorate(g); setArea(''); }}
                      />
                      <ErrorText field="governorate" />
                    </div>
                    <div>
                      <SelectField
                        value={area}
                        placeholder={governorate ? t('area') : t('selectGovernorateFirst')}
                        options={governorate ? areas[governorate] ?? [] : []}
                        optionLabel={placeLabel}
                        onSelect={setArea}
                        disabled={!governorate}
                      />
                      <ErrorText field="area" />
                    </div>
                    <div className={isDesktop ? 'flex flex-row gap-[14px]' : 'flex flex-col gap-[14px]'}>
                      <input
                        className={`${inputClass} ${isDesktop ? 'flex-1' : ''}`}
                        placeholder={t('block')}
                        value={block}
                        onChange={e => setBlock(toWesternDigits(e.target.value).replace(/[^0-9]/g, ''))}
                        inputMode="numeric"
                      />
                      <input
                        className={`${inputClass} ${isDesktop ? 'flex-[2]' : ''}`}
                        placeholder={t('street')}
                        value={street}
                        onChange={e => setStreet(e.target.value)}
                      />
                    </div>
                    <ErrorText field="block" />
                    <ErrorText field="street" />
                    <input
                      className={inputClass}
                      placeholder={t('house')}
                      value={houseNumber}
                      onChange={e => setHouseNumber(toWesternDigits(e.target.value).replace(/[^0-9]/g, ''))}
                      inputMode="numeric"
                    />
                    <ErrorText field="houseNumber" />
                    <div className={isDesktop ? 'flex flex-row gap-[14px]' : 'flex flex-col gap-[14px]'}>
                      <input
                        className={`${inputClass} ${isDesktop ? 'flex-1' : ''}`}
                        placeholder={t('avenueOptional')}
                        value={avenue}
                        onChange={e => setAvenue(e.target.value)}
                      />
                      <input
                        className={`${inputClass} ${isDesktop ? 'flex-1' : ''}`}
                        placeholder={t('flatOptional')}
                        value={flat}
                        onChange={e => setFlat(e.target.value)}
                      />
                    </div>
                  </div>
                  {!!addressError && <span className="font-dm text-[13px] text-error">{addressError}</span>}
                  <button
                    className={`flex h-12 items-center justify-center border border-secondary bg-secondary ${addressSaving ? 'opacity-60' : ''}`}
                    onClick={handleSaveAddress}
                    disabled={addressSaving}
                  >
                    <span className="font-clash font-medium text-[13px] tracking-[1px] text-white">
                      {addressSaving ? t('saving') : t('saveAddress')}
                    </span>
                  </button>
                  <button
                    className="flex items-center justify-center py-[6px]"
                    onClick={() => setEditingAddress(false)}
                  >
                    <span className="font-dm text-[13px] text-secondary underline">{t('cancel')}</span>
                  </button>
                </>
              )}
            </div>

            {/* Change password — just a button, no section heading */}
            <div className="mb-8 flex flex-col gap-[14px]">
              {!editingPassword ? (
                <>
                  {passwordSaved && (
                    <span className="font-dm text-[13px] text-olive">{t('passwordChanged')}</span>
                  )}
                  <button
                    className="flex h-12 items-center justify-center self-start border border-border bg-white px-6"
                    onClick={() => { setEditingPassword(true); setPasswordError(''); setPasswordSaved(false); }}
                  >
                    <span className="font-clash font-medium text-[13px] tracking-[1px] text-black">{t('changePassword')}</span>
                  </button>
                </>
              ) : (
                <>
                  <PasswordInput
                    variant="filled"
                    placeholder={t('currentPassword')}
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                  />
                  <PasswordInput
                    variant="filled"
                    placeholder={t('newPassword')}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                  />
                  <PasswordInput
                    variant="filled"
                    placeholder={t('confirmNewPassword')}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                  />
                  {!!passwordError && <span className="font-dm text-[13px] text-error">{passwordError}</span>}
                  <button
                    className={`flex h-12 items-center justify-center border border-secondary bg-secondary ${passwordSaving ? 'opacity-60' : ''}`}
                    onClick={handleChangePassword}
                    disabled={passwordSaving}
                  >
                    <span className="font-clash font-medium text-[13px] tracking-[1px] text-white">
                      {passwordSaving ? t('saving') : t('updatePassword')}
                    </span>
                  </button>
                  <button
                    className="flex items-center justify-center py-[6px]"
                    onClick={() => {
                      setEditingPassword(false);
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                      setPasswordError('');
                    }}
                  >
                    <span className="font-dm text-[13px] text-secondary underline">{t('cancel')}</span>
                  </button>
                </>
              )}
            </div>

            {/* Logout */}
            <button
              className="flex h-12 w-full items-center justify-center border border-border bg-white"
              onClick={() => setShowLogoutConfirm(true)}
            >
              <span className="font-clash font-medium text-[13px] uppercase tracking-[1px] text-secondary">
                {t('logout')}
              </span>
            </button>
          </div>
        )}
      </MaxWidthContainer>

      <LogoutConfirmModal
        visible={showLogoutConfirm}
        onCancel={() => setShowLogoutConfirm(false)}
        onConfirm={handleConfirmLogout}
        isLoading={loggingOut}
      />

      <VerifyEmailModal
        visible={showEmailVerifyModal}
        email={pendingEmail}
        onClose={() => { setShowEmailVerifyModal(false); setPendingEmail(''); }}
        onVerified={() => completeEmailChange(pendingEmail)}
      />
    </PageLayout>
  );
}
