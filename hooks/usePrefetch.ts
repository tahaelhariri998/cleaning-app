import { useEffect } from 'react';
import { useRouter } from 'next/router';

export const usePrefetch = (pages: string[]) => {
  const router = useRouter();

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      navigator.serviceWorker.controller
    ) {
      // Prefetch pages in background
      navigator.serviceWorker.controller.postMessage({
        type: 'PREFETCH_PAGES',
        pages
      });

      // Prefetch using Next.js built-in prefetch
      pages.forEach(page => {
        router.prefetch(page);
      });
    }
  }, [pages, router]);
};