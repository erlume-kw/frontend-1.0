'use client';

import { useTranslations } from 'next-intl';
import React, { useRef, useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import SiteHeader from '@/components/layout/SiteHeader';
import PageLayout from '@/components/layout/PageLayout';
import SideMenu from '@/components/layout/SideMenu';
import MaxWidthContainer from '@/components/layout/MaxWidthContainer';
import SellerBanner from '@/components/seller/SellerBanner';
import { useIsDesktop } from '@/lib/useIsDesktop';
import { openWhatsApp } from '@/lib/interactions';

export default function SellPage() {
  const isDesktop = useIsDesktop();
  const [menuOpen, setMenuOpen] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const t = useTranslations('Sell');

  const handleUpload = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setImageUri(URL.createObjectURL(file));
  };

  const headlineSize = isDesktop ? 60 : 32;
  const bodySize = isDesktop ? 32 : 20;
  const bodyLine = isDesktop ? 35 : 25;
  const uploadW = isDesktop ? 337 : 237;
  const uploadH = isDesktop ? 435 : 295;
  const btnW = uploadW; // always matches the upload box width
  const btnH = isDesktop ? 87 : 50;
  const btnFontSize = isDesktop ? 24 : 16;

  const content = (
    <div
      className={
        isDesktop
          ? 'flex flex-row items-center justify-between gap-[60px] px-0 py-20'
          : 'flex flex-col gap-10 px-[19px] py-8'
      }
    >
      {/* Copy block */}
      <div className={`flex flex-col gap-5 ${isDesktop ? 'flex-1' : ''}`}>
        <span className="font-clash font-medium text-primary" style={{ fontSize: headlineSize, lineHeight: `${headlineSize + 2}px` }}>
          {t('headline')}
        </span>
        <span className="font-clash font-medium text-primary" style={{ fontSize: bodySize, lineHeight: `${bodyLine}px` }}>
          {t('ask')}
        </span>
        <span className="font-clash font-medium text-primary" style={{ fontSize: bodySize, lineHeight: `${bodyLine}px` }}>
          {t('reach')}
        </span>
        <span className="font-clash font-semibold text-secondary" style={{ fontSize: bodySize, lineHeight: `${bodyLine}px` }}>
          {t('earn')}
        </span>
        <button className="mt-1 text-start" onClick={() => router.push('/seller-policy')}>
          <span className={`font-dm font-medium text-secondary underline ${isDesktop ? 'text-[16px]' : 'text-[13px]'}`}>
            {t('policyLink')}
          </span>
        </button>
      </div>

      {/* Upload + CTA block */}
      <div className={`flex flex-col gap-6 ${isDesktop ? 'items-start' : 'items-center'}`}>
        {/* Dotted upload box */}
        <button
          className="relative flex flex-col items-center justify-center overflow-hidden border border-dashed border-primary px-6"
          style={{ width: uploadW, height: uploadH }}
          onClick={handleUpload}
        >
          {imageUri ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUri} alt={t('itemAlt')} className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <>
              <span
                className={`text-center font-clash font-medium text-olive ${isDesktop ? 'text-[20px] leading-7' : 'text-[16px] leading-[22px]'}`}
              >
                {t('upload')}
              </span>
              <span className={`mt-2 font-dm text-muted ${isDesktop ? 'text-[14px]' : 'text-[12px]'}`}>
                {t('tapBrowse')}
              </span>
            </>
          )}
          {/* Retake overlay when image selected */}
          {imageUri && (
            <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center bg-black/45 py-[10px]">
              <span className="font-dm font-medium text-[13px] text-white">{t('tapChange')}</span>
            </div>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        <button
          className="flex flex-row items-center justify-center gap-5 overflow-hidden bg-secondary px-8"
          style={{ width: btnW, height: btnH }}
          onClick={() =>
            openWhatsApp(
              imageUri
                ? t('waWithPhoto')
                : t('wa')
            )
          }
        >
          <span className="font-clash font-medium leading-[30px] text-white" style={{ fontSize: btnFontSize }}>
            {t('chat')}
          </span>
        </button>
      </div>
    </div>
  );

  return (
    <PageLayout
      menu={<SideMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />}
      header={<SiteHeader onMenuPress={() => setMenuOpen(true)} />}
    >
      <SellerBanner items={t.raw('steps') as { label: string; desc: string }[]} />
      {isDesktop ? <MaxWidthContainer className="px-16">{content}</MaxWidthContainer> : content}
    </PageLayout>
  );
}
