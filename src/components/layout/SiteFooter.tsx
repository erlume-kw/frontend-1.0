'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { requestEmailOtp, subscribeNewsletter, fetchDrops, type Drop } from '@/services/api';
import VerifyEmailModal from '@/components/VerifyEmailModal';
import ErrorModal from '@/components/ErrorModal';
import { FOOTER_DATA, SOCIAL_ICONS } from '@/lib/brand';
import { useDropText } from '@/lib/useDropText';
import { useIsDesktop } from '@/lib/useIsDesktop';
import MaxWidthContainer from './MaxWidthContainer';
import {
  handleFooterLink,
  openEmail,
  openExternalUrl,
  openPhone,
  SOCIAL_URLS,
} from '@/lib/interactions';

// ─── Newsletter ───────────────────────────────────────────────────────────────
const isValidEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());

function NewsletterSection({ compact = false }: { compact?: boolean }) {
  const t = useTranslations('Footer');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [errorOpen, setErrorOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [otpModalVisible, setOtpModalVisible] = useState(false);

  const showError = (message: string) => {
    setEmailError(message);
    setErrorOpen(true);
  };

  const completeSubscribe = async () => {
    setOtpModalVisible(false);
    try {
      await subscribeNewsletter(email);
      setSuccess(true);
      setEmail('');
    } catch (error: any) {
      showError(error?.message || t('genericError'));
    } finally {
      setVerifying(false);
    }
  };

  const handleSubscribe = async () => {
    if (!isValidEmail(email)) {
      showError(t('invalidEmail'));
      return;
    }

    setVerifying(true);
    setEmailError('');

    try {
      // Emails that verified once (any flow) skip the OTP entirely
      const { alreadyVerified } = await requestEmailOtp(email.trim());
      if (alreadyVerified) {
        await completeSubscribe();
        return;
      }
      setOtpModalVisible(true);
    } catch (error: any) {
      showError(error?.message || t('genericError'));
      setVerifying(false);
    }
  };

  const rowHeight = compact ? 'h-12' : 'h-14';

  return (
    <div className={`flex flex-col ${compact ? 'gap-4' : 'gap-6'}`}>
      <div className="flex flex-col gap-[6px]">
        <span className={`font-clash font-semibold ${compact ? 'text-[18px]' : 'text-[24px]'} tracking-[1px] text-white`}>
          {t('newsletterTitle')}
        </span>
        <span className="font-dm text-[15px] leading-[22px] text-white/65">
          {t('newsletterText')}
        </span>
      </div>
      {success ? (
        <span className="font-dm font-medium text-[15px] text-white">{t('subscribed')}</span>
      ) : (
        <div className="flex flex-col">
          <div className={`flex flex-row ${rowHeight}`}>
            <input
              className={`min-w-0 flex-1 ${rowHeight} border-0 bg-white/[0.12] px-4 font-dm text-[14px] text-white outline-none placeholder:text-white/45 ${emailError ? 'bg-error/[0.18]' : ''}`}
              placeholder={t('emailPlaceholder')}
              value={email}
              onChange={e => { setEmail(e.target.value); if (emailError) setEmailError(''); }}
              type="email"
              autoCapitalize="none"
            />
            <button
              className={`${rowHeight} bg-secondary px-7 ${verifying ? 'opacity-60' : ''}`}
              onClick={handleSubscribe}
              disabled={verifying}
            >
              <span className={`font-clash font-medium ${compact ? 'text-[13px]' : 'text-[14px]'} tracking-[1.2px] text-white`}>
                {verifying ? t('verifying') : t('subscribe')}
              </span>
            </button>
          </div>
        </div>
      )}
      <ErrorModal
        visible={errorOpen && !!emailError}
        title={t('newsletterModalTitle')}
        message={emailError}
        onClose={() => setErrorOpen(false)}
      />
      <VerifyEmailModal
        visible={otpModalVisible}
        email={email.trim()}
        onClose={() => { setOtpModalVisible(false); setVerifying(false); }}
        onVerified={completeSubscribe}
      />
    </div>
  );
}

// ─── Copyright bar ────────────────────────────────────────────────────────────
function FooterCopyright() {
  const isDesktop = useIsDesktop();
  const t = useTranslations('Footer');

  return (
    <div className={`flex flex-row items-center justify-between py-6 ${isDesktop ? 'px-16' : 'px-4'}`}>
      <span className="font-dm font-medium text-[16px] leading-5 text-white">{t('copyright')}</span>
      <div className="flex flex-row items-center gap-4">
        <button onClick={() => openExternalUrl(SOCIAL_URLS.instagram)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={SOCIAL_ICONS.instagram} alt="Instagram" className="h-6 w-6 object-contain" />
        </button>
        {/* WhatsApp PNG has slightly more left-side whitespace — nudge right */}
        <button onClick={() => openExternalUrl(SOCIAL_URLS.whatsapp)} className="ms-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={SOCIAL_ICONS.whatsapp} alt="WhatsApp" className="h-6 w-6 object-contain" />
        </button>
        <button onClick={() => openExternalUrl(SOCIAL_URLS.tiktok)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={SOCIAL_ICONS.tiktok} alt="TikTok" className="h-6 w-6 object-contain" />
        </button>
      </div>
    </div>
  );
}

// Arabic links go a step lighter so they read clearly below the bold headings
const footerLinkClass = 'font-clash rtl:font-light text-[16px] leading-[25px] text-white mb-1 text-start block';

// Live drops replace the old static "Our Drops" list — routes match the /drops page.
const dropHref = (d: Drop) => `/drops/${encodeURIComponent(d.name)}?dropId=${d._id}`;

// ─── Mobile footer ────────────────────────────────────────────────────────────
function MobileFooter({ drops }: { drops: Drop[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const router = useRouter();
  const t = useTranslations('Footer');
  const { dropName } = useDropText();

  return (
    <footer className="bg-primary">
      {/* Newsletter — top of footer */}
      <div className="p-4 pt-12">
        <NewsletterSection compact />
      </div>

      {/* Nav links accordion */}
      <div className="p-4">
        {Object.keys(FOOTER_DATA.columns).map(label => (
          <div key={label}>
            <button
              className="flex w-full flex-row items-center justify-between py-3"
              onClick={() => setOpen(open === label ? null : label)}
            >
              <span className="font-clash font-semibold rtl:font-bold text-[16px] leading-[25px] text-white">{t(`columns.${label}`)}</span>
              <span className={`font-clash text-[22px] text-white ${open === label ? 'rotate-90' : ''}`}>›</span>
            </button>
            {open === label && (
              <div className="flex flex-col pb-2 ps-2">
                {label === 'Our Drops'
                  ? drops.map(drop => (
                      <button key={drop._id} className="text-start" onClick={() => router.push(dropHref(drop))}>
                        <span className={footerLinkClass}>{dropName(drop)}</span>
                      </button>
                    ))
                  : FOOTER_DATA.columns[label as keyof typeof FOOTER_DATA.columns].map((item: string) => (
                      <button key={item} className="text-start" onClick={() => handleFooterLink(item, router.push)}>
                        <span className={footerLinkClass}>{t(`links.${item}`)}</span>
                      </button>
                    ))}
              </div>
            )}
          </div>
        ))}

        <div className="flex flex-col">
          <span className="mb-1 block font-clash font-semibold rtl:font-bold text-[16px] leading-[25px] text-white">{t('contactUs')}</span>
          <button className="text-start" onClick={() => openPhone(FOOTER_DATA.contact.phone)}>
            <span className={footerLinkClass}><bdi dir="ltr">{FOOTER_DATA.contact.phone}</bdi></span>
          </button>
          <button className="text-start" onClick={() => openEmail(FOOTER_DATA.contact.email)}>
            <span className={footerLinkClass}><bdi dir="ltr">{FOOTER_DATA.contact.email}</bdi></span>
          </button>
        </div>
      </div>

      <FooterCopyright />
    </footer>
  );
}

// ─── Desktop footer ───────────────────────────────────────────────────────────
function DesktopFooter({ drops }: { drops: Drop[] }) {
  const router = useRouter();
  const t = useTranslations('Footer');
  const { dropName } = useDropText();

  return (
    <footer className="bg-primary">
      {/* Newsletter — top of footer */}
      <MaxWidthContainer>
        <div className="px-16 pb-12 pt-20">
          <NewsletterSection />
        </div>
      </MaxWidthContainer>

      {/* Links grid */}
      <MaxWidthContainer>
        <div className="flex flex-row justify-between px-16 py-12">
          <div className="flex w-[247px] flex-col">
            <span className="mb-3 font-clash font-semibold rtl:font-bold text-[16px] leading-[25px] text-white">{t('contact')}</span>
            <button onClick={() => openPhone(FOOTER_DATA.contact.phone)} className="text-start">
              <span className={footerLinkClass}><bdi dir="ltr">{FOOTER_DATA.contact.phone}</bdi></span>
            </button>
            <button onClick={() => openEmail(FOOTER_DATA.contact.email)} className="text-start">
              <span className={footerLinkClass}><bdi dir="ltr">{FOOTER_DATA.contact.email}</bdi></span>
            </button>
          </div>
          {Object.entries(FOOTER_DATA.columns).map(([heading, links]) => (
            <div key={heading} className="flex w-[247px] flex-col">
              <span className="mb-3 font-clash font-semibold rtl:font-bold text-[16px] leading-[25px] text-white">{t(`columns.${heading}`)}</span>
              {heading === 'Our Drops'
                ? drops.map(drop => (
                    <button key={drop._id} onClick={() => router.push(dropHref(drop))} className="text-start">
                      <span className={footerLinkClass}>{dropName(drop)}</span>
                    </button>
                  ))
                : links.map((item: string) => (
                    <button key={item} onClick={() => handleFooterLink(item, router.push)} className="text-start">
                      <span className={footerLinkClass}>{t(`links.${item}`)}</span>
                    </button>
                  ))}
            </div>
          ))}
        </div>
      </MaxWidthContainer>

      <MaxWidthContainer>
        <FooterCopyright />
      </MaxWidthContainer>
    </footer>
  );
}

export default function SiteFooter() {
  const isDesktop = useIsDesktop();
  const [drops, setDrops] = useState<Drop[]>([]);

  useEffect(() => {
    fetchDrops()
      // Mirror the storefront /drops page: hidden drops never appear.
      .then(data => setDrops(data.filter(drop => drop.status === 'active' || drop.status === 'upcoming')))
      .catch(e => console.error('SiteFooter drops fetch error:', e));
  }, []);

  return isDesktop ? <DesktopFooter drops={drops} /> : <MobileFooter drops={drops} />;
}
