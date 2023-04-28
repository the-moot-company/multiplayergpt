import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from 'react-query';

import { appWithTranslation } from 'next-i18next';
import { DefaultSeo } from 'next-seo';
import type { AppProps } from 'next/app';
import { Inter } from 'next/font/google';

import SEO from '@/next-seo.config';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

function App({ Component, pageProps }: AppProps<{}>) {
  const pageMeta = (Component as any)?.defaultProps?.meta || {};
  const pageSEO = { ...SEO, ...pageMeta };
  const queryClient = new QueryClient();

  return (
    <div className={inter.className}>
      <DefaultSeo {...pageSEO} />
      <Toaster />
      <QueryClientProvider client={queryClient}>
        <Component {...pageProps} />
      </QueryClientProvider>
    </div>
  );
}

export default appWithTranslation(App);
