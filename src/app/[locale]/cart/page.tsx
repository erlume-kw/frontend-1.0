'use client';

import { useTranslations } from 'next-intl';
import { useMoney } from '@/lib/useMoney';
import { useNumerals } from '@/lib/useNumerals';
import React, { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import SiteHeader from '@/components/layout/SiteHeader';
import PageLayout from '@/components/layout/PageLayout';
import SideMenu from '@/components/layout/SideMenu';
import MaxWidthContainer from '@/components/layout/MaxWidthContainer';
import { useIsDesktop } from '@/lib/useIsDesktop';
import { useCart } from '@/contexts/CartContext';
// Promo code lives on the checkout page only (it must re-price the live payment
// session, which the cart can't do). Cart promo UI is commented out below.
// import { validateDiscountCode } from '@/services/api';

export default function CartPage() {
  const isDesktop = useIsDesktop();
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const t = useTranslations('Cart');
  const tc = useTranslations('Common');
  const money = useMoney();
  const num = useNumerals();
  const { items, removeItem, subtotal } = useCart();

  // --- Cart promo code commented out — applied on checkout only ---
  // const [promoCode, setPromoCode] = useState('');
  // const [promoError, setPromoError] = useState('');
  // const [discount, setDiscount] = useState(0);

  const activeItems = items.filter(i => !i.isSold);
  const total = subtotal;

  // const handleApplyPromo = async () => {
  //   if (!promoCode.trim()) return;
  //   try {
  //     const result = await validateDiscountCode(promoCode.trim(), subtotal);
  //     setDiscount(result.discountAmount);
  //     setPromoError('');
  //   } catch (e: any) {
  //     setPromoError(e.message ?? 'Invalid promo code');
  //     setDiscount(0);
  //   }
  // };

  const OrderSummary = (
    <div className={`${isDesktop ? 'w-[428px] pb-6 ps-6 pt-4' : 'p-4'}`}>
      <div className={`mb-4 font-clash font-medium text-black ${isDesktop ? 'text-[36px]' : 'text-[24px]'}`}>
        {t('total')}
      </div>

      {/* Promo code commented out — applied on the checkout page only.
      <div className="mb-2 flex h-[50px] flex-row overflow-hidden bg-lightGrey">
        <input
          className="min-w-0 flex-1 bg-transparent px-3 font-clash font-medium text-[16px] text-black outline-none placeholder:text-muted"
          placeholder="Promo code"
          value={promoCode}
          onChange={e => { setPromoCode(e.target.value); setPromoError(''); }}
        />
        <button className="flex w-[100px] items-center justify-center bg-secondary" onClick={handleApplyPromo}>
          <span className="font-clash font-medium text-[16px] text-white">APPLY</span>
        </button>
      </div>
      {!!promoError && <div className="mb-2 font-dm text-[13px] text-error">{promoError}</div>}
      {discount > 0 && (
        <div className="mb-2 font-dm text-[13px] text-olive">Discount applied: -{discount.toFixed(2)} KWD</div>
      )}
      */}

      {[
        { label: t('shipping'), value: t('free') },
        { label: t('tax'), value: money(0) },
        { label: t('subtotal'), value: money(subtotal.toFixed(2)) },
        { label: t('totalLabel'), value: money(total.toFixed(2)) },
      ].map(({ label, value }) => (
        <div key={label} className="flex flex-row justify-between py-[6px]">
          <span className="font-dm text-[13px] text-muted">{label}</span>
          <span className="font-dm font-semibold text-[13px] text-black">{value}</span>
        </div>
      ))}

      <button
        className={`mt-4 flex h-[75px] w-full items-center justify-center bg-secondary ${activeItems.length === 0 ? 'cursor-default opacity-40' : ''}`}
        onClick={() => activeItems.length > 0 && router.push('/checkout')}
      >
        <span className="font-clash font-medium text-[16px] uppercase tracking-[1.4px] text-white">{t('checkout')}</span>
      </button>
    </div>
  );

  return (
    <PageLayout
      menu={<SideMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />}
      header={<SiteHeader onMenuPress={() => setMenuOpen(true)} />}
    >
      <MaxWidthContainer className={isDesktop ? 'px-16 pb-12' : ''}>
        <div className={isDesktop ? 'flex flex-row items-start' : ''}>
          {/* Cart items */}
          <div className={isDesktop ? 'flex-1' : ''}>
            <div
              className={`mb-1 font-clash font-medium text-black ${isDesktop ? 'p-4 px-0 text-[36px]' : 'p-4 text-[24px]'}`}
            >
              {t('title', { count: num(activeItems.length) })}
            </div>

            {items.length === 0 ? (
              <div className="p-4 font-dm text-[16px] text-muted">{t('empty')}</div>
            ) : (
              items.map(item => (
                <div
                  key={item.id}
                  className={`flex cursor-pointer flex-row gap-3 p-4 ${isDesktop ? 'px-0' : ''}`}
                  onClick={() => router.push(`/product/${item.id}`)}
                  role="button"
                >
                  <div className={`h-[145px] w-[137px] shrink-0 ${item.isSold ? 'bg-lightGrey' : 'bg-[rgba(197,112,93,0.2)]'}`}>
                    {item.imageUri ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.imageUri}
                        alt=""
                        className="h-full w-full object-cover"
                        onError={e => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : null}
                  </div>

                  <div className="flex flex-1 flex-col justify-start gap-1">
                    <span className={`font-clash font-medium uppercase ${isDesktop ? 'text-[24px]' : 'text-[16px]'} ${item.isSold ? 'text-grey' : 'text-black'}`}>
                      {item.brand}
                    </span>
                    <span className={`font-clash font-medium text-[12px] uppercase ${item.isSold ? 'text-grey' : 'text-black'}`}>
                      {item.name}
                    </span>
                    {item.isSold ? (
                      <span className="font-clash font-medium text-[12px] uppercase text-secondary">{tc('sold')}</span>
                    ) : (
                      <span className="font-clash font-medium text-[14px] text-secondary">{money(item.price)}</span>
                    )}
                  </div>

                  <button
                    className="flex flex-col items-end justify-start py-1"
                    onClick={e => { e.stopPropagation(); removeItem(item.id); }}
                  >
                    <span className={`font-clash text-[12px] uppercase text-secondary ${item.isSold ? 'font-semibold' : 'font-medium'}`}>
                      {t('remove')}
                    </span>
                  </button>
                </div>
              ))
            )}
          </div>

          {OrderSummary}
        </div>
      </MaxWidthContainer>
    </PageLayout>
  );
}
