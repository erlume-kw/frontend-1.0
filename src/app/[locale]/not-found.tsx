'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import SiteHeader from '@/components/layout/SiteHeader';
import PageLayout from '@/components/layout/PageLayout';
import SideMenu from '@/components/layout/SideMenu';
import MaxWidthContainer from '@/components/layout/MaxWidthContainer';

// Renders whenever a route inside [locale] doesn't match (a bad URL, or a page calling
// notFound() — e.g. an ended drop). Keeps the real site chrome so a broken link still lands
// somewhere branded and navigable, in whichever language the visitor was on.
export default function NotFound() {
  const t = useTranslations('NotFound');
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <PageLayout
      menu={<SideMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />}
      header={<SiteHeader onMenuPress={() => setMenuOpen(true)} />}
    >
      <MaxWidthContainer>
        <div className="mx-auto flex min-h-[420px] w-full max-w-[520px] flex-col items-center justify-center gap-4 p-[38px] text-center">
          <span className="font-clash font-semibold text-[28px] text-black">{t('title')}</span>
          <span className="font-dm text-[14px] leading-[22px] text-muted">{t('body')}</span>
          <button className="mt-2" onClick={() => router.push('/')}>
            <span className="font-dm text-[14px] text-secondary underline">{t('cta')}</span>
          </button>
        </div>
      </MaxWidthContainer>
    </PageLayout>
  );
}
