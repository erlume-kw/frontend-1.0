import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

// Locale-aware drop-ins for next/link and next/navigation: they keep the visitor in
// their language (/ar/...) when navigating. Use these instead of the next/* versions.
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
