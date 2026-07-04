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
      {overlay}
      {header}
      <div>{children}</div>
      <div className="mt-auto">
        <SiteFooter />
      </div>
    </div>
  );
}
