// pages/_app.tsx
import { SessionProvider } from 'next-auth/react';
import type { AppProps } from 'next/app';
import { usePrefetch } from '../hooks/usePrefetch';

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  usePrefetch([
    '/',
    '/profile'
    // Add all your pages
  ]);
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}

export default MyApp;