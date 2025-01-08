// pages/_app.tsx
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import { useEffect } from 'react';
import { registerServiceWorker } from '../utils/register-sw';

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return (
    <SessionProvider session={pageProps.session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}

export default MyApp;