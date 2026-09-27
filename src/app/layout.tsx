// The true root layout — required by Next.js for every route to have one, but kept a pure
// passthrough on purpose: [locale]/layout.tsx is the ONLY place that renders <html>/<body>
// for every normal page (it needs the actual locale to set lang/dir, which this file has no
// way to know). Adding <html>/<body> here too would double them up on every route.
//
// The one route that sits outside [locale] entirely — app/not-found.tsx, the fallback for a
// URL that doesn't match anything — has no other ancestor to provide a document shell, so it
// renders its own <html>/<body>. Nothing else should ever need to.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
