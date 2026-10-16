'use client';

import { useTranslations } from 'next-intl';

export default function SendingView() {
  const t = useTranslations('SellerPhotos');

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-white px-6 text-center">
      <div className="flex flex-col gap-2" role="status">
        <h1 className="font-clash font-medium text-[22px] leading-7 text-primary">{t('sendingTitle')}</h1>
        <p className="font-dm text-[14px] leading-[22px] text-muted">{t('sendingBody')}</p>
      </div>
      <div className="flex gap-2" aria-hidden="true">
        {[0, 1, 2].map(i => (
          <span
            key={i}
            className="h-2 w-2 animate-pulse rounded-full bg-secondary"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </main>
  );
}
