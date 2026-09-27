import { headers } from 'next/headers';

// The genuinely-last-resort 404: reached only when a URL doesn't even match the [locale]
// segment (a garbled link, a bad locale prefix). [locale]/not-found.tsx handles everything
// inside a real page tree (an ended drop, a missing item); this is Next's outer boundary.
//
// The root layout (app/layout.tsx) is a deliberate passthrough — [locale]/layout.tsx is the
// only place that normally owns <html>/<body>, so every real page gets exactly one. This
// route sits outside that tree entirely, so it has no ancestor to provide a document shell
// and renders its own, complete <html>/<body> here — the only place in the app that does.
//
// A route this far outside the matched tree has no routing context (usePathname() returns
// nothing useful here), so the visitor's language comes from the x-pathname header the
// middleware sets on every request — read server-side, so even a bot or a no-JS request gets
// the right language, not just a client-side correction after hydration.
export default async function RootNotFound() {
  const pathname = (await headers()).get('x-pathname') ?? '';
  const isArabic = pathname.startsWith('/ar');
  const copy = isArabic
    ? { title: 'الصفحة غير موجودة', body: 'الصفحة التي تبحث عنها غير موجودة أو ربما تم نقلها.', cta: 'العودة إلى إيرلوم' }
    : { title: 'Page not found', body: "The page you're looking for doesn't exist or may have moved.", cta: 'Back to erlume' };

  return (
    <html lang={isArabic ? 'ar' : 'en'} dir={isArabic ? 'rtl' : 'ltr'}>
      <body style={{ margin: 0 }}>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            padding: 24,
            textAlign: 'center',
            fontFamily: 'sans-serif',
          }}
        >
          <span style={{ fontSize: 28, fontWeight: 600, color: '#111D11' }}>{copy.title}</span>
          <span style={{ fontSize: 14, color: '#7A7060', maxWidth: 420 }}>{copy.body}</span>
          <a
            href={isArabic ? '/ar' : '/'}
            style={{
              marginTop: 8,
              color: '#C5705D',
              textDecoration: 'underline',
              fontSize: 14,
            }}
          >
            {copy.cta}
          </a>
        </div>
      </body>
    </html>
  );
}
