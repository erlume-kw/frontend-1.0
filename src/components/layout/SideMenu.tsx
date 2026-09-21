'use client';

import { useNumerals } from '@/lib/useNumerals';
import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { getAccessToken } from '@/services/api';
import { useCart } from '@/contexts/CartContext';
import LanguageSwitcher from './LanguageSwitcher';

interface SideMenuProps {
  visible: boolean;
  onClose: () => void;
  /** Return false to block navigation (e.g. checkout leave confirmation). */
  onNavigate?: (href: string) => boolean;
}

// label doubles as the translation key in the Header messages
const NAV_LINKS = [
  { label: 'new', href: '/new' },
  { label: 'drops', href: '/drops' },
  { label: 'sell', href: '/sell' },
  { label: 'wishlist', href: '/wishlist' },
] as const;

export default function SideMenu({ visible, onClose, onNavigate }: SideMenuProps) {
  const router = useRouter();
  const t = useTranslations('Header');
  const tc = useTranslations('Common');
  const num = useNumerals();
  const { count: cartCount } = useCart();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (!visible) return;
    (async () => {
      try {
        const token = await getAccessToken();
        setIsLoggedIn(!!token && token.length > 0);
      } catch {
        setIsLoggedIn(false);
      }
    })();
  }, [visible]);

  const handleNav = (href: string) => {
    if (onNavigate && onNavigate(href) === false) {
      onClose();
      return;
    }
    onClose();
    router.push(href);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[9000]">
      <button className="absolute inset-0 bg-black/30" onClick={onClose} aria-label={tc('closeMenu')} />

      <div className="relative z-10 w-full bg-primary pb-10 pt-[26px]">
        <button
          className="ms-[15px] flex h-11 w-11 items-center justify-center"
          onClick={onClose}
          aria-label={tc('closeMenu')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="flex flex-col items-center gap-7 pt-7">
          {NAV_LINKS.map(({ label, href }) => (
            <button key={label} onClick={() => handleNav(href)}>
              <span className="font-clash font-medium text-[16px] leading-5 text-white">{t(label)}</span>
            </button>
          ))}
          <button onClick={() => handleNav('/cart')}>
            <span className="font-clash font-medium text-[16px] leading-5 text-white">{t('cart')} ({num(cartCount)})</span>
          </button>
        </div>

        {isLoggedIn ? (
          <button className="mx-auto mt-12 block" onClick={() => handleNav('/profile')}>
            <span className="font-clash font-medium text-[16px] leading-5 text-secondary">{t('profile')}</span>
          </button>
        ) : (
          <button className="mx-auto mt-12 block" onClick={() => handleNav('/sign-in')}>
            <span className="font-clash font-medium text-[16px] leading-5 text-secondary">{t('signIn')}</span>
          </button>
        )}

        <div className="mt-8 flex justify-center">
          <LanguageSwitcher textClass="font-clash font-medium text-[16px] leading-5 text-white" />
        </div>
      </div>
    </div>
  );
}
