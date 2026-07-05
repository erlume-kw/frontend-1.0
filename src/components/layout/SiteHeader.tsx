'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useIsDesktop } from '@/lib/useIsDesktop';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import MaxWidthContainer from './MaxWidthContainer';
import LogoutConfirmModal from '../LogoutConfirmModal';
import { logout as apiLogout, getAccessToken } from '@/services/api';

const LOGO_ASPECT = 300 / 65;

interface SiteHeaderProps {
  onMenuPress?: () => void;
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

export default function SiteHeader({ onMenuPress }: SiteHeaderProps) {
  const isDesktop = useIsDesktop();
  const router = useRouter();
  const pathname = usePathname();
  const { count: wishlistCount } = useWishlist();
  const { count: cartCount } = useCart();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

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

  const handleConfirmLogout = async () => {
    setLoggingOut(true);
    try {
      await apiLogout();
      setIsLoggedIn(false);
      setShowLogoutConfirm(false);
      setLoggingOut(false);
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      setLoggingOut(false);
      setIsLoggedIn(false);
    }
  };

  const go = (href: string) => router.push(href);

  if (isDesktop) {
    return (
      <div className="h-[98px] bg-white">
        <MaxWidthContainer>
          <div className="flex h-[98px] w-full flex-row items-center justify-between gap-10 px-16">
            {/* Left: Logo */}
            <button onClick={() => go('/')} className="flex w-[180px] justify-start">
              <ErlumeLogo height={32} />
            </button>

            {/* Center: Navigation */}
            <div className="flex flex-1 items-center justify-center">
              <nav className="flex flex-row items-center gap-12">
                <button onClick={() => go('/')}>
                  <span className="font-clash text-[16px] text-olive">new</span>
                </button>
                <button onClick={() => go('/drops')}>
                  <span className="font-clash text-[16px] text-olive">drops</span>
                </button>
                <button onClick={() => go('/sell')}>
                  <span className="font-clash text-[16px] text-olive">sell</span>
                </button>
              </nav>
            </div>

            {/* Right: Wishlist, Cart, Login/Logout */}
            <div className="flex w-[280px] flex-row items-center justify-end gap-8">
              <button onClick={() => go('/wishlist')}>
                <span className="font-clash text-[16px] text-olive">
                  wishlist{wishlistCount > 0 ? ` (${wishlistCount})` : ''}
                </span>
              </button>
              <button onClick={() => go('/cart')}>
                <span className="font-clash text-[16px] text-olive">cart ({cartCount})</span>
              </button>
              {isLoggedIn ? (
                <button onClick={() => setShowLogoutConfirm(true)}>
                  <span className="font-clash text-[16px] text-olive">logout</span>
                </button>
              ) : (
                <button onClick={() => go('/sign-in')}>
                  <span className="font-clash text-[16px] text-olive">sign in</span>
                </button>
              )}
            </div>
          </div>
        </MaxWidthContainer>
        <LogoutConfirmModal
          visible={showLogoutConfirm}
          onCancel={() => setShowLogoutConfirm(false)}
          onConfirm={handleConfirmLogout}
          isLoading={loggingOut}
        />
      </div>
    );
  }

  return (
    <div className="flex h-[76px] flex-row items-center justify-between bg-white px-4">
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
          <span className="font-glyph text-[22px] leading-none text-primary">♡</span>
          {wishlistCount > 0 && (
            <span className="absolute -right-[2px] -top-[2px] flex h-4 min-w-[16px] items-center justify-center rounded-full bg-secondary px-[3px]">
              <span className="font-dm font-medium text-[9px] leading-3 text-white">{wishlistCount}</span>
            </span>
          )}
        </button>
        <button
          onClick={() => go('/cart')}
          className="p-1"
          aria-label={`Cart${cartCount > 0 ? `, ${cartCount} items` : ''}`}
        >
          <ShoppingBagIcon />
        </button>
      </div>
      <LogoutConfirmModal
        visible={showLogoutConfirm}
        onCancel={() => setShowLogoutConfirm(false)}
        onConfirm={handleConfirmLogout}
        isLoading={loggingOut}
      />
    </div>
  );
}
