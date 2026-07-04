'use client';

import React from 'react';
import { useIsDesktop } from '@/lib/useIsDesktop';

interface CriteriaSectionProps {
  title: string;
  subtitle?: string;
  items: string[];
}

export default function CriteriaSection({ title, subtitle, items }: CriteriaSectionProps) {
  const isDesktop = useIsDesktop();

  return (
    <div className={`py-8 ${isDesktop ? 'px-16' : 'px-4'}`}>
      <h2 className={`mb-3 font-clash font-medium text-primary ${isDesktop ? 'text-[48px]' : 'text-[32px]'}`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`mb-7 font-dm leading-6 text-muted ${isDesktop ? 'text-[17px]' : 'text-[15px]'}`}>
          {subtitle}
        </p>
      )}
      <div className="flex flex-col gap-4">
        {items.map((item, i) => (
          <div key={i} className="flex flex-row items-start gap-[14px]">
            <span className="mt-[6px] block h-2 w-2 shrink-0 bg-secondary" />
            <span className={`flex-1 font-dm leading-6 text-olive ${isDesktop ? 'text-[16px]' : 'text-[15px]'}`}>
              {item}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
