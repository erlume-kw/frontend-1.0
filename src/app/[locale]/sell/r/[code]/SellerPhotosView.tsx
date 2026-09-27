'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import SiteHeader from '@/components/layout/SiteHeader';
import PageLayout from '@/components/layout/PageLayout';
import SideMenu from '@/components/layout/SideMenu';
import MaxWidthContainer from '@/components/layout/MaxWidthContainer';

export default function SellerPhotosView({ photos }: { photos: string[] | null }) {
  const t = useTranslations('SellerPhotos');
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <PageLayout
      menu={<SideMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />}
      header={<SiteHeader onMenuPress={() => setMenuOpen(true)} />}
    >
      <MaxWidthContainer>
        <div className="mx-auto flex w-full max-w-[720px] flex-col gap-4 px-4 pb-16 pt-10">
          {photos ? (
            <>
              <h1 className="font-clash font-medium text-[28px] leading-[1.25] text-primary">{t('title')}</h1>
              <p className="font-dm text-[14px] leading-[22px] text-muted">{t('body')}</p>
              <div className="mt-2 flex flex-col gap-4">
                {photos.map((url, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={url} src={url} alt={t('photoAlt', { n: i + 1 })} className="w-full border border-border object-contain" />
                ))}
              </div>
            </>
          ) : (
            <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 text-center">
              <span className="font-dm text-[15px] leading-[22px] text-muted">{t('notFound')}</span>
              <button onClick={() => router.push('/')}>
                <span className="font-dm text-[14px] text-secondary underline">{t('backHome')}</span>
              </button>
            </div>
          )}
        </div>
      </MaxWidthContainer>
    </PageLayout>
  );
}
