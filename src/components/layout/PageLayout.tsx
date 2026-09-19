'use client';

import React from 'react';
import SiteFooter from './SiteFooter';

interface PageLayoutProps {
  children: React.ReactNode;
  header: React.ReactNode;
  menu?: React.ReactNode;
  overlay?: React.ReactNode;
  backgroundColor?: string;
}

/**
 * Page shell with a sticky footer: short pages keep the footer at the bottom
 * of the viewport; long pages scroll normally with the footer after content.
 * Main content is flex-1 so pages can stretch children to fill remaining space.
 */
export default function PageLayout({
  children,
  header,
  menu,
  overlay,
  backgroundColor = '#FFFFFF',
}: PageLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor }}>
      {menu}
      {header}
      {overlay ? (
        // Below SiteHeader: 76px mobile / 98px desktop
        <div className="sticky top-[76px] z-40 md:top-[98px]">{overlay}</div>
      ) : null}
      <div className="flex flex-1 flex-col">{children}</div>
      <SiteFooter />
    </div>
  );
}
