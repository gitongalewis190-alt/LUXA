import type { Metadata, Viewport } from 'next';
import { Space_Grotesk, Inter, JetBrains_Mono } from 'next/font/google';
import Script from 'next/script';
import '../styles/globals.css';
import { Providers } from './Providers';

const spaceGrotesk = Space_Grotesk({
  subsets:  ['latin'],
  weight:   ['300', '400', '500', '600', '700'],
  variable: '--font-display',
  display:  'swap',
});

const inter = Inter({
  subsets:  ['latin'],
  weight:   ['300', '400', '500', '600'],
  variable: '--font-body',
  display:  'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets:  ['latin'],
  weight:   ['400', '500'],
  variable: '--font-mono',
  display:  'swap',
});

export const metadata: Metadata = {
  title: {
    default:  'LUXA — Advanced Vehicle Innovation Platform',
    template: '%s | LUXA',
  },
  description:
    'Discover, showcase, and acquire advanced vehicle concepts, engineering innovations, and automotive project documentation. Curated by Antonio.',
  keywords:   ['automotive', 'vehicle concepts', 'engineering', 'car parts', 'custom builds'],
  authors:    [{ name: 'Antonio', url: 'https://luxa.app' }],
  creator:    'Antonio',
  publisher:  'LUXA',
  robots:     { index: true, follow: true },
  openGraph: {
    type:        'website',
    locale:      'en_US',
    url:         'https://luxa.app',
    siteName:    'LUXA',
    title:       'LUXA — Advanced Vehicle Innovation Platform',
    description: 'Discover and acquire advanced vehicle concepts. Curated by Antonio.',
    images: [{ url: '/images/og-image.jpg', width: 1200, height: 630, alt: 'LUXA Platform' }],
  },
  twitter: {
    card:        'summary_large_image',
    title:       'LUXA — Advanced Vehicle Innovation Platform',
    description: 'Discover and acquire advanced vehicle concepts.',
    images:      ['/images/og-image.jpg'],
  },
  icons: {
    icon:    [{ url: '/icons/favicon.ico' }],
    apple:   [{ url: '/icons/apple-touch-icon.png', sizes: '180x180' }],
    shortcut:'/icons/favicon-32x32.png',
  },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width:        'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor:   '#050810',
  colorScheme:  'dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://firebasestorage.googleapis.com" />
        <link rel="dns-prefetch" href="https://firestore.googleapis.com" />
      </head>

      <body className="font-body bg-luxa-void text-luxa-text antialiased min-h-dvh overflow-x-hidden">

        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}', { page_path: window.location.pathname, anonymize_ip: true });
              `}
            </Script>
          </>
        )}

        <Providers>
          {children}
        </Providers>

      </body>
    </html>
  );
}
