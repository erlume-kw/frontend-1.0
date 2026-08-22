'use client';

import React, { useRef, useState } from 'react';
import SiteHeader from '@/components/layout/SiteHeader';
import PageLayout from '@/components/layout/PageLayout';
import SideMenu from '@/components/layout/SideMenu';
import MaxWidthContainer from '@/components/layout/MaxWidthContainer';
import { useIsDesktop } from '@/lib/useIsDesktop';
import { openWhatsApp } from '@/lib/interactions';
import {
  identifyBagPhotos,
  estimateBagPrice,
  type BagCondition,
  type EstimateBagPriceResult,
} from '@/services/api';

const POPULAR_BRANDS = [
  'Vintage',
  'Unknown',
  'Chanel',
  'Louis Vuitton',
  'Gucci',
  'Hermès',
  'Prada',
  'Dior',
  'Fendi',
  'Burberry',
  'Givenchy',
  'Céline',
  'Balenciaga',
  'Valentino',
  'Versace',
  'Dolce & Gabbana',
  'Coach',
  'Michael Kors',
  'Mulberry',
  'Bottega Veneta',
  'Saint Laurent',
  'Miu Miu',
  'Bally',
  'Salvatore Ferragamo',
  "Tod's",
  'Longchamp',
  'Marcella',
];

// Same three tiers as the pricing formula (src/config/pricingEstimatorConfig.ts, backend).
const CONDITIONS: { label: string; value: BagCondition }[] = [
  { label: 'Like New', value: 'like-new' },
  { label: 'Gently Used', value: 'gently-used' },
  { label: 'Fair or Worn', value: 'fair-worn' },
];

const MAX_PHOTOS = 3;

const labelClass = 'font-clash font-medium text-[13px] uppercase tracking-[1px] text-primary';
const inputClass =
  'h-[50px] w-full border border-border px-3 font-dm text-[15px] text-black outline-none placeholder:text-muted';

export default function PricingEstimatorPage() {
  const isDesktop = useIsDesktop();
  const [menuOpen, setMenuOpen] = useState(false);
  const [brandDropdownOpen, setBrandDropdownOpen] = useState(false);
  const [brandCustomInput, setBrandCustomInput] = useState('');

  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [condition, setCondition] = useState<BagCondition>('gently-used');

  // AI photo identification — optional; auto-fills brand/model above
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [identifiedDetails, setIdentifiedDetails] = useState<{ size?: string; material?: string; color?: string }>({});
  const [identifying, setIdentifying] = useState(false);
  const [identifyNotice, setIdentifyNotice] = useState('');
  const [identifyError, setIdentifyError] = useState('');

  const [estimating, setEstimating] = useState(false);
  const [estimateError, setEstimateError] = useState('');
  const [result, setResult] = useState<EstimateBagPriceResult | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleBrandSelect = (selectedBrand: string) => {
    setBrand(selectedBrand);
    setBrandCustomInput('');
    setBrandDropdownOpen(false);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, MAX_PHOTOS);
    if (!files.length) return;
    photoPreviews.forEach(url => URL.revokeObjectURL(url));
    setPhotos(files);
    setPhotoPreviews(files.map(f => URL.createObjectURL(f)));
    setIdentifyNotice('');
    setIdentifyError('');
  };

  const handleIdentify = async () => {
    if (!photos.length) return;
    setIdentifying(true);
    setIdentifyError('');
    setIdentifyNotice('');
    try {
      const identified = await identifyBagPhotos(photos, {
        brand: brand.trim() || undefined,
        model: model.trim() || undefined,
      });
      if (identified.brand) handleBrandSelect(identified.brand);
      if (identified.model) setModel(identified.model);
      setIdentifiedDetails({ size: identified.size, material: identified.material, color: identified.color });
      if (identified.confidence === 'low') {
        setIdentifyNotice("We're not fully sure about this one — please double check the brand and model below.");
      }
    } catch (err: any) {
      setIdentifyError(err?.message || 'Could not identify the bag from these photos. Please fill in the details manually.');
    } finally {
      setIdentifying(false);
    }
  };

  const handleSubmit = async () => {
    if (!(brand.trim() && originalPrice.trim())) return;
    setEstimating(true);
    setEstimateError('');
    try {
      const estimated = await estimateBagPrice({
        brand: brand.trim(),
        model: model.trim() || undefined,
        size: identifiedDetails.size || undefined,
        material: identifiedDetails.material || undefined,
        color: identifiedDetails.color || undefined,
        condition,
        originalPrice: parseFloat(originalPrice),
        yearPurchased: year.trim() ? parseInt(year, 10) : undefined,
        pickupFee: 0,
      });
      setResult(estimated);
      setSubmitted(true);
    } catch (err: any) {
      setEstimateError(err?.message || 'Could not calculate an estimate. Please try again.');
    } finally {
      setEstimating(false);
    }
  };

  const handleReset = () => {
    photoPreviews.forEach(url => URL.revokeObjectURL(url));
    setBrand('');
    setModel('');
    setYear('');
    setOriginalPrice('');
    setCondition('gently-used');
    setPhotos([]);
    setPhotoPreviews([]);
    setIdentifiedDetails({});
    setIdentifyNotice('');
    setIdentifyError('');
    setEstimateError('');
    setResult(null);
    setSubmitted(false);
  };

  return (
    <PageLayout
      menu={<SideMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />}
      header={<SiteHeader onMenuPress={() => setMenuOpen(true)} />}
    >
      <MaxWidthContainer>
        {/* Page Title */}
        <div className={`flex flex-col gap-3 pb-8 pt-10 ${isDesktop ? 'px-16' : 'px-8'}`}>
          <h1 className={`font-clash font-medium leading-10 text-primary ${isDesktop ? 'text-[56px]' : 'text-[36px]'}`}>
            PRICING ESTIMATOR
          </h1>
          <p className={`font-dm leading-6 text-muted ${isDesktop ? 'text-[17px]' : 'text-[15px]'}`}>
            Discover how much your bag could earn
          </p>
        </div>

        {/* Main Layout: Calculator on left, Results on right (or stacked on mobile) */}
        <div
          className={`flex ${
            isDesktop ? 'flex-row items-start justify-center gap-8 px-16' : 'flex-col items-center gap-6 px-4'
          }`}
        >
          {/* Calculator/Form - Left Column */}
          <div className={`border border-border bg-white ${isDesktop ? 'w-[450px]' : 'w-full'}`}>
            <div className={`flex flex-col gap-6 py-8 ${isDesktop ? 'px-8' : 'px-4'}`}>
              {/* Brand Dropdown */}
              <div className="flex flex-col gap-2">
                <span className={labelClass}>Brand</span>
                <button
                  className="flex h-[50px] w-full flex-row items-center justify-between border border-border bg-white px-3"
                  onClick={() => setBrandDropdownOpen(true)}
                >
                  <span className={`font-dm text-[15px] ${brand ? 'text-black' : 'text-muted'}`}>
                    {brand || 'Select a brand'}
                  </span>
                  <span className="font-glyph text-[10px] text-muted">▼</span>
                </button>
              </div>

              {/* Brand Dropdown Modal */}
              {brandDropdownOpen && (
                <div
                  className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40"
                  onClick={() => setBrandDropdownOpen(false)}
                >
                  <div
                    className="flex max-h-[60%] w-[85%] max-w-[450px] flex-col overflow-hidden rounded border border-border bg-white"
                    onClick={e => e.stopPropagation()}
                  >
                    <div className="flex-1 overflow-y-auto">
                      {POPULAR_BRANDS.map(item => (
                        <button
                          key={item}
                          className="block w-full border-b border-lightGrey px-4 py-3 text-left"
                          onClick={() => handleBrandSelect(item)}
                        >
                          <span className="font-dm text-[14px] text-black">{item}</span>
                        </button>
                      ))}
                    </div>
                    <div className="h-px bg-border" />
                    <div className="flex flex-row gap-3 px-4 py-4">
                      <input
                        className="h-[50px] min-w-0 flex-1 border border-border px-3 font-dm text-[14px] text-black outline-none placeholder:text-muted"
                        placeholder="Or type another brand"
                        value={brandCustomInput}
                        onChange={e => setBrandCustomInput(e.target.value)}
                      />
                      {brandCustomInput.trim() && (
                        <button
                          className="flex h-[50px] items-center justify-center bg-secondary px-4"
                          onClick={() => handleBrandSelect(brandCustomInput.trim())}
                        >
                          <span className="font-clash font-medium text-[11px] uppercase text-white">ADD</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Model (optional) */}
              <div className="flex flex-col gap-2">
                <span className={labelClass}>Model (optional)</span>
                <input
                  className={inputClass}
                  placeholder="e.g., Classic Flap"
                  value={model}
                  onChange={e => setModel(e.target.value)}
                />
              </div>

              {/* Photos (optional) — AI auto-fill */}
              <div className="flex flex-col gap-2">
                <span className={labelClass}>Photos (optional) — let AI auto-fill brand &amp; model</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  className="hidden"
                  onChange={handlePhotoChange}
                />
                <div className="flex flex-row items-center gap-2">
                  <button
                    className="flex h-11 items-center justify-center border border-border px-4"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <span className="font-clash font-medium text-[12px] uppercase tracking-[1px] text-primary">
                      {photos.length ? 'CHANGE PHOTOS' : 'ADD PHOTOS'}
                    </span>
                  </button>
                  {photos.length > 0 && (
                    <button
                      className={`flex h-11 items-center justify-center bg-secondary px-4 ${identifying ? 'opacity-60' : ''}`}
                      onClick={handleIdentify}
                      disabled={identifying}
                    >
                      <span className="font-clash font-medium text-[12px] uppercase tracking-[1px] text-white">
                        {identifying ? 'IDENTIFYING…' : 'AUTO-FILL'}
                      </span>
                    </button>
                  )}
                </div>
                {photoPreviews.length > 0 && (
                  <div className="flex flex-row gap-2">
                    {photoPreviews.map((src, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={i} src={src} alt="" className="h-[76px] w-[76px] border border-border object-cover" />
                    ))}
                  </div>
                )}
                {!!identifyNotice && <span className="font-dm text-[12px] text-muted">{identifyNotice}</span>}
                {!!identifyError && <span className="font-dm text-[12px] text-error">{identifyError}</span>}
              </div>

              {/* Year Input */}
              <div className="flex flex-col gap-2">
                <span className={labelClass}>Year Purchased (optional)</span>
                <input
                  className={inputClass}
                  placeholder="e.g., 2020"
                  value={year}
                  onChange={e => setYear(e.target.value)}
                  inputMode="numeric"
                  maxLength={4}
                />
              </div>

              {/* Original Price Input */}
              <div className="flex flex-col gap-2">
                <span className={labelClass}>Original Purchase Price (KWD)</span>
                <input
                  className={inputClass}
                  placeholder="e.g., 500"
                  value={originalPrice}
                  onChange={e => setOriginalPrice(e.target.value)}
                  inputMode="decimal"
                />
              </div>

              {/* Condition Selector */}
              <div className="flex flex-col gap-2">
                <span className={labelClass}>Condition</span>
                <div className="flex flex-row flex-wrap gap-2">
                  {CONDITIONS.map(({ label, value }) => (
                    <button
                      key={value}
                      className={`flex h-11 min-w-[30%] flex-1 items-center justify-center border ${
                        condition === value ? 'border-secondary bg-[rgba(197,112,93,0.1)]' : 'border-border bg-white'
                      }`}
                      onClick={() => setCondition(value)}
                    >
                      <span
                        className={`text-center font-dm text-[12px] ${
                          condition === value ? 'font-semibold text-secondary' : 'text-muted'
                        }`}
                      >
                        {label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {!!estimateError && <span className="font-dm text-[13px] text-error">{estimateError}</span>}

              {/* Submit Button */}
              <button
                className={`mt-2 flex h-[60px] items-center justify-center bg-secondary ${estimating ? 'opacity-60' : ''}`}
                onClick={handleSubmit}
                disabled={estimating}
              >
                <span className="font-clash font-medium text-[14px] uppercase tracking-[1.2px] text-white">
                  {estimating ? 'CALCULATING…' : 'GET ESTIMATE'}
                </span>
              </button>
            </div>
          </div>

          {/* Results - Right Column (only when submitted) */}
          {submitted && result && (
            <div className={`flex flex-col gap-6 border border-border bg-white py-8 ${isDesktop ? 'w-[450px] px-8' : 'w-full px-4'}`}>
              {/* Item Summary */}
              <div className="flex flex-col gap-1">
                <span className="font-clash font-medium text-[14px] uppercase text-primary">
                  {brand}{year ? ` • ${year}` : ''}
                </span>
                <span className="font-dm text-[13px] text-muted">
                  Original price: {originalPrice} KWD • {CONDITIONS.find(c => c.value === condition)?.label}
                </span>
              </div>

              {/* Divider */}
              <div className="h-px bg-border" />

              {result.accept ? (
                <>
                  {/* Breakdown */}
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-row items-center justify-between">
                      <span className="font-dm text-[13px] text-muted">Estimated Listing Price</span>
                      <span className="font-dm font-semibold text-[14px] text-black">{result.listingPrice.toFixed(2)} KWD</span>
                    </div>

                    <div className="flex flex-row items-center justify-between">
                      <span className="font-dm text-[13px] text-muted">Erlume Commission</span>
                      <span className="font-dm font-semibold text-[14px] text-black">-{result.erlumeCut.toFixed(2)} KWD</span>
                    </div>

                    <div className="flex flex-row items-center justify-between border-t border-border pt-3">
                      <span className="font-clash font-medium text-[14px] text-primary">You Earn</span>
                      <span className="font-clash font-medium text-[18px] text-secondary">{result.sellerPayout.toFixed(2)} KWD</span>
                    </div>
                  </div>
                </>
              ) : (
                <span className="font-dm text-[14px] leading-[22px] text-muted">
                  Based on these details, this item may be below our minimum listing threshold. Message us directly
                  on WhatsApp and we&apos;ll take a closer look.
                </span>
              )}

              {/* WhatsApp CTA */}
              <button
                className="mt-2 flex h-[60px] items-center justify-center border-2 border-olive bg-[#38452D15]"
                onClick={() => openWhatsApp(`Hi! I'm interested in selling my ${brand} bag${year ? ` from ${year}` : ''}.`)}
              >
                <span className="font-clash font-medium text-[13px] uppercase tracking-[1px] text-olive">
                  START CHAT ON WHATSAPP
                </span>
              </button>

              {/* Edit Button */}
              <button className="flex h-[50px] items-center justify-center border border-border" onClick={handleReset}>
                <span className="font-clash font-medium text-[12px] uppercase tracking-[1px] text-primary">
                  CALCULATE ANOTHER
                </span>
              </button>
            </div>
          )}
        </div>

        <div className="h-12" />
      </MaxWidthContainer>
    </PageLayout>
  );
}
