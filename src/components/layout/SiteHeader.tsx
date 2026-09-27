'use client';

import { useNumerals } from '@/lib/useNumerals';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { useIsDesktop } from '@/lib/useIsDesktop';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import MaxWidthContainer from './MaxWidthContainer';
import LanguageSwitcher from './LanguageSwitcher';
import HeartIcon from '../ui/HeartIcon';
import { getAccessToken } from '@/services/api';

const LOGO_ASPECT = 300 / 65;

interface SiteHeaderProps {
  onMenuPress?: () => void;
  /** Return false to block navigation (e.g. checkout leave confirmation). */
  onNavigate?: (href: string) => boolean;
}

function ErlumeLogo({ height }: { height: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/images/erlume-logo-green.png"
      alt="erlume"
      style={{ height, width: height * LOGO_ASPECT, objectFit: 'contain' }}
    />
  );
}

// Feather "shopping-bag" icon (MIT), matching the previous @expo/vector-icons glyph
function ShoppingBagIcon({ size = 22, color = '#18230F' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

export default function SiteHeader({ onMenuPress, onNavigate }: SiteHeaderProps) {
  const isDesktop = useIsDesktop();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('Header');
  const num = useNumerals();
  const { count: wishlistCount } = useWishlist();
  const { count: cartCount } = useCart();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const checkAuthStatus = useCallback(async () => {
    try {
      const token = await getAccessToken();
      setIsLoggedIn(!!token && token.length > 0);
    } catch {
      setIsLoggedIn(false);
    }
  }, []);

  // Re-check whenever the route changes (mirror of the previous focus-based check)
  useEffect(() => {
    checkAuthStatus();
  }, [pathname, checkAuthStatus]);

  const go = (href: string) => {
    if (onNavigate && onNavigate(href) === false) return;
    router.push(href);
  };

  if (isDesktop) {
    return (
      <div className="sticky top-0 z-50 h-[98px] bg-white">
        <MaxWidthContainer>
          <div className="flex h-[98px] w-full flex-row items-center justify-between gap-10 px-16">
            {/* Left: Logo */}
            <button onClick={() => go('/')} className="flex w-[180px] justify-start">
              <ErlumeLogo height={32} />
            </button>

            {/* Center: Navigation */}
            <div className="flex flex-1 items-center justify-center">
              <nav className="flex flex-row items-center gap-12">
                <button onClick={() => go('/new')}>
                  <span className="font-clash text-[16px] text-olive">{t('new')}</span>
                </button>
                <button onClick={() => go('/drops')}>
                  <span className="font-clash text-[16px] text-olive">{t('drops')}</span>
                </button>
                <button onClick={() => go('/sell')}>
                  <span className="font-clash text-[16px] text-olive">{t('sell')}</span>
                </button>
              </nav>
            </div>

            {/* Right: Wishlist, Cart, Profile/Sign-in */}
            <div className="flex min-w-[280px] shrink-0 flex-row items-center justify-end gap-8 whitespace-nowrap">
              <button onClick={() => go('/wishlist')}>
                <span className="font-clash text-[16px] text-olive">
                  {t('wishlist')}{wishlistCount > 0 ? ` (${num(wishlistCount)})` : ''}
                </span>
              </button>
              <button onClick={() => go('/cart')}>
                <span className="font-clash text-[16px] text-olive">{t('cart')} ({num(cartCount)})</span>
              </button>
              {isLoggedIn ? (
                <button onClick={() => go('/profile')}>
                  <span className="font-clash text-[16px] text-olive">{t('profile')}</span>
                </button>
              ) : (
                <button onClick={() => go('/sign-in')}>
                  <span className="font-clash text-[16px] text-olive">{t('signIn')}</span>
                </button>
              )}
              <LanguageSwitcher />
            </div>
          </div>
        </MaxWidthContainer>
      </div>
    );
  }

  return (
    <div className="sticky top-0 z-50 flex h-[76px] flex-row items-center justify-between bg-white px-4">
      <button onClick={onMenuPress} className="flex w-[30px] flex-col justify-center gap-[5px] py-2">
        <span className="block h-[2px] w-6 bg-primary" />
        <span className="block h-[2px] w-[18px] bg-primary" />
        <span className="block h-[2px] w-6 bg-primary" />
      </button>

      <button onClick={() => go('/')} className="flex flex-1 justify-center">
        <ErlumeLogo height={28} />
      </button>

      <div className="flex flex-row items-center gap-4">
        <button onClick={() => go('/wishlist')} className="relative p-1">
          <HeartIcon size={22} color="#18230F" />
          {wishlistCount > 0 && (
            <span className="absolute -end-[2px] -top-[2px] flex h-4 min-w-[16px] items-center justify-center rounded-full bg-secondary px-[3px]">
              <span className="font-dm font-medium text-[9px] leading-3 text-white">{num(wishlistCount)}</span>
            </span>
          )}
        </button>
        <button
          onClick={() => go('/cart')}
          className="relative p-1"
          aria-label={cartCount > 0 ? t('cartAriaWithCount', { count: num(cartCount) }) : t('cartAria')}
        >
          <ShoppingBagIcon />
          {cartCount > 0 && (
            <span className="absolute -end-[2px] -top-[2px] flex h-4 min-w-[16px] items-center justify-center rounded-full bg-secondary px-[3px]">
              <span className="font-dm font-medium text-[9px] leading-3 text-white">{num(cartCount)}</span>
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
