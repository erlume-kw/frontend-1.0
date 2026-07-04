'use client';

import React, { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
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
          YOUR PIECE IS REALLY ONE OF A KIND?
        </span>
        <span className="font-clash font-medium text-primary" style={{ fontSize: bodySize, lineHeight: `${bodyLine}px` }}>
          What if you could find a new home for it without the hassle?
        </span>
        <span className="font-clash font-medium text-primary" style={{ fontSize: bodySize, lineHeight: `${bodyLine}px` }}>
          Reach out to us and we&apos;ll take care of everything...
        </span>
        <span className="font-clash font-semibold text-secondary" style={{ fontSize: bodySize, lineHeight: `${bodyLine}px` }}>
          starting with how much you&apos;re going to make
        </span>
        <button className="mt-1 text-left" onClick={() => router.push('/seller-policy')}>
          <span className={`font-dm font-medium text-secondary underline ${isDesktop ? 'text-[16px]' : 'text-[13px]'}`}>
            Before submitting, review our Selling Policy →
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
            <img src={imageUri} alt="Your item" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <>
              <span
                className={`text-center font-clash font-medium text-olive ${isDesktop ? 'text-[20px] leading-7' : 'text-[16px] leading-[22px]'}`}
              >
                Upload a photo of what you would like to sell
              </span>
              <span className={`mt-2 font-dm text-muted ${isDesktop ? 'text-[14px]' : 'text-[12px]'}`}>
                Tap to browse
              </span>
            </>
          )}
          {/* Retake overlay when image selected */}
          {imageUri && (
            <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center bg-black/45 py-[10px]">
              <span className="font-dm font-medium text-[13px] text-white">Tap to change</span>
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
                ? "Hi, I'd like to sell an item with erlume. I've prepared a photo to share."
                : "Hi, I'd like to sell an item with erlume."
            )
          }
        >
          <span className="font-clash font-medium leading-[30px] text-white" style={{ fontSize: btnFontSize }}>
            LET&apos;S CHAT
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
      <SellerBanner items={[
        { label: 'Send us a photo', desc: "Upload a photo of your item. We'll handle quality checks and professional listing photography." },
        { label: 'We handle everything', desc: "From listing to delivery coordination. You don't have to worry about a thing." },
        { label: 'Earn instantly', desc: 'Get paid 1–2 days after your item sells. No waiting around for payouts.' },
      ]} />
      {isDesktop ? <MaxWidthContainer className="px-16">{content}</MaxWidthContainer> : content}
    </PageLayout>
  );
}
