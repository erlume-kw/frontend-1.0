import React from 'react';

// Constrains content to 1280px on desktop so ultra-wide monitors don't stretch layouts.
export default function MaxWidthContainer({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`w-full max-w-[1280px] mx-auto ${className}`}>{children}</div>;
}
