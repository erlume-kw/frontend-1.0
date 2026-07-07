'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SiteHeader from '@/components/layout/SiteHeader';
import PageLayout from '@/components/layout/PageLayout';
import SideMenu from '@/components/layout/SideMenu';
import MaxWidthContainer from '@/components/layout/MaxWidthContainer';
import LogoutConfirmModal from '@/components/LogoutConfirmModal';
import SelectField from '@/components/ui/SelectField';
import { SkeletonBox } from '@/components/ui/Skeleton';
import { KUWAIT_AREAS, GOVERNORATES } from '@/lib/kuwait';
import { useIsDesktop } from '@/lib/useIsDesktop';
import {
  getAccessToken,
  getMe,
  logout as apiLogout,
  updateMyAddress,
  changePassword,
  type AuthUser,
} from '@/services/api';

const inputClass =
  'h-[52px] w-full border-0 bg-lightGrey px-[11px] font-dm text-[14px] text-black outline-none placeholder:text-muted';

export default function ProfilePage() {
  const isDesktop = useIsDesktop();
  const router = useRouter();
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
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({});
  const [addressSaving, setAddressSaving] = useState(false);
  const [addressError, setAddressError] = useState('');
  const [addressSaved, setAddressSaved] = useState(false);

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
    setAddressErrors({});
    setAddressError('');
    setAddressSaved(false);
    setEditingAddress(true);
  };

  const handleSaveAddress = async () => {
    const errs: Record<string, string> = {};
    if (!governorate.trim()) errs.governorate = 'Governorate is required';
    if (!area.trim()) errs.area = 'Area is required';
    if (!block.trim()) errs.block = 'Block is required';
    if (!street.trim()) errs.street = 'Street is required';
    if (!houseNumber.trim()) errs.houseNumber = 'House number is required';
    setAddressErrors(errs);
    if (Object.keys(errs).length > 0 || !user) return;

    setAddressSaving(true);
    setAddressError('');
    const address = { street, block, city: area, governorate, house: houseNumber };
    try {
      await updateMyAddress(user._id, address);
      setUser({ ...user, address });
      setEditingAddress(false);
      setAddressSaved(true);
    } catch (e: any) {
      setAddressError(e.message ?? 'Could not save the address.');
    } finally {
      setAddressSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Please fill in all password fields.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
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
      setPasswordError(e.message ?? 'Could not change the password.');
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
    ? `${user.address.street ?? ''}, Block ${user.address.block ?? ''}, ${user.address.city ?? ''}, ${user.address.governorate ?? ''}, House ${user.address.house ?? ''}`
    : 'No address saved yet.';

  return (
    <PageLayout
      menu={<SideMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />}
      header={<SiteHeader onMenuPress={() => setMenuOpen(true)} />}
    >
      <MaxWidthContainer className={isDesktop ? 'px-16' : ''}>
        {loading ? (
          <div className={`w-full ${isDesktop ? 'py-12' : 'p-[21px]'}`}>
            {/* Title */}
            <SkeletonBox width={isDesktop ? 240 : 170} height={isDesktop ? 48 : 34} className="mb-7" />

            {/* Account section */}
            <div className="mb-8 flex flex-col gap-[14px]">
              <SkeletonBox width={110} height={isDesktop ? 24 : 21} />
              <div className="flex flex-col gap-4 border border-border bg-white p-4">
                <div className="flex flex-col gap-2">
                  <SkeletonBox width={60} height={12} />
                  <SkeletonBox width="55%" height={16} />
                </div>
                <div className="flex flex-col gap-2">
                  <SkeletonBox width={110} height={12} />
                  <SkeletonBox width="40%" height={16} />
                </div>
              </div>
            </div>

            {/* Saved address section */}
            <div className="mb-8 flex flex-col gap-[14px]">
              <SkeletonBox width={150} height={isDesktop ? 24 : 21} />
              <div className="flex flex-col gap-[10px] border border-border bg-white p-4">
                <SkeletonBox width={130} height={12} />
                <SkeletonBox width="70%" height={14} />
                <SkeletonBox width={100} height={12} className="mt-1" />
              </div>
            </div>

            {/* Change password + logout */}
            <SkeletonBox width={190} height={48} className="mb-8" />
            <SkeletonBox height={48} />
          </div>
        ) : (
          <div className={`w-full ${isDesktop ? 'py-12' : 'p-[21px]'}`}>
            <h1 className={`mb-7 font-clash font-medium text-black ${isDesktop ? 'text-[40px]' : 'text-[28px]'}`}>
              PROFILE
            </h1>

            {/* Account details */}
            <div className="mb-8 flex flex-col gap-[14px]">
              <span className={sectionTitle}>Account</span>
              <div className="flex flex-col gap-3 border border-border bg-white p-4">
                <div className="flex flex-col gap-[2px]">
                  <span className="font-dm font-medium text-[12px] uppercase tracking-[0.8px] text-muted">Email</span>
                  <span className="break-all font-dm text-[14px] text-black">{user?.emailAddress}</span>
                </div>
                <div className="flex flex-col gap-[2px]">
                  <span className="font-dm font-medium text-[12px] uppercase tracking-[0.8px] text-muted">Phone number</span>
                  <span className="font-dm text-[14px] text-black">{user?.phoneNumber ?? '—'}</span>
                </div>
              </div>
            </div>

            {/* Saved address */}
            <div className="mb-8 flex flex-col gap-[14px]">
              <span className={sectionTitle}>Saved address</span>

              {!editingAddress ? (
                <>
                  <div className="flex flex-col gap-[6px] border border-border bg-white p-4">
                    <div className="flex flex-row items-center justify-between">
                      <span className="font-dm font-medium text-[12px] uppercase tracking-[0.8px] text-muted">
                        Profile address
                      </span>
                      {user?.address && (
                        <span className="bg-[rgba(197,112,93,0.12)] px-2 py-[3px]">
                          <span className="font-dm font-medium text-[11px] tracking-[0.8px] text-secondary">DEFAULT</span>
                        </span>
                      )}
                    </div>
                    <span className="font-dm text-[13px] leading-[19px] text-muted">{addressLine}</span>
                    <button className="mt-2 self-start" onClick={startEditingAddress}>
                      <span className="font-clash font-medium text-[12px] uppercase tracking-[0.8px] text-secondary">
                        EDIT ADDRESS
                      </span>
                    </button>
                  </div>
                  {addressSaved && (
                    <span className="font-dm text-[13px] text-olive">Address updated.</span>
                  )}
                </>
              ) : (
                <>
                  <div className="flex flex-col gap-[14px]">
                    <div>
                      <SelectField
                        value={governorate}
                        placeholder="Governorate"
                        options={GOVERNORATES}
                        onSelect={g => { setGovernorate(g); setArea(''); }}
                      />
                      <ErrorText field="governorate" />
                    </div>
                    <div>
                      <SelectField
                        value={area}
                        placeholder={governorate ? 'Area' : 'Select governorate first'}
                        options={governorate ? KUWAIT_AREAS[governorate] ?? [] : []}
                        onSelect={setArea}
                        disabled={!governorate}
                      />
                      <ErrorText field="area" />
                    </div>
                    <div className={isDesktop ? 'flex flex-row gap-[14px]' : 'flex flex-col gap-[14px]'}>
                      <input
                        className={`${inputClass} ${isDesktop ? 'flex-1' : ''}`}
                        placeholder="Block"
                        value={block}
                        onChange={e => setBlock(e.target.value.replace(/[^0-9]/g, ''))}
                        inputMode="numeric"
                      />
                      <input
                        className={`${inputClass} ${isDesktop ? 'flex-[2]' : ''}`}
                        placeholder="Street"
                        value={street}
                        onChange={e => setStreet(e.target.value)}
                      />
                    </div>
                    <ErrorText field="block" />
                    <ErrorText field="street" />
                    <input
                      className={inputClass}
                      placeholder="House / Apartment no."
                      value={houseNumber}
                      onChange={e => setHouseNumber(e.target.value.replace(/[^0-9]/g, ''))}
                      inputMode="numeric"
                    />
                    <ErrorText field="houseNumber" />
                  </div>
                  {!!addressError && <span className="font-dm text-[13px] text-error">{addressError}</span>}
                  <button
                    className={`flex h-12 items-center justify-center border border-secondary bg-secondary ${addressSaving ? 'opacity-60' : ''}`}
                    onClick={handleSaveAddress}
                    disabled={addressSaving}
                  >
                    <span className="font-clash font-medium text-[13px] tracking-[1px] text-white">
                      {addressSaving ? 'SAVING…' : 'SAVE ADDRESS'}
                    </span>
                  </button>
                  <button
                    className="flex items-center justify-center py-[6px]"
                    onClick={() => setEditingAddress(false)}
                  >
                    <span className="font-dm text-[13px] text-secondary underline">Cancel</span>
                  </button>
                </>
              )}
            </div>

            {/* Change password — just a button, no section heading */}
            <div className="mb-8 flex flex-col gap-[14px]">
              {!editingPassword ? (
                <>
                  {passwordSaved && (
                    <span className="font-dm text-[13px] text-olive">Password changed.</span>
                  )}
                  <button
                    className="flex h-12 items-center justify-center self-start border border-border bg-white px-6"
                    onClick={() => { setEditingPassword(true); setPasswordError(''); setPasswordSaved(false); }}
                  >
                    <span className="font-clash font-medium text-[13px] tracking-[1px] text-black">CHANGE PASSWORD</span>
                  </button>
                </>
              ) : (
                <>
                  <input
                    className={inputClass}
                    placeholder="Current password"
                    type="password"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                  />
                  <input
                    className={inputClass}
                    placeholder="New password"
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                  />
                  <input
                    className={inputClass}
                    placeholder="Confirm new password"
                    type="password"
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
                      {passwordSaving ? 'SAVING…' : 'UPDATE PASSWORD'}
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
                    <span className="font-dm text-[13px] text-secondary underline">Cancel</span>
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
                LOG OUT
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
    </PageLayout>
  );
}
