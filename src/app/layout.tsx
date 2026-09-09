import { Toaster } from '@/components/ui/sonner';
import { cn } from '@/utils/cn';
import type { Metadata } from 'next';
import { Kumbh_Sans, Playfair_Display } from 'next/font/google';
import AuthRedirectHandler from '../components/module/auth/AuthRedirectHandler';
import StoreModal from '../components/module/store/StoreModal';
import CookieConsent from '../components/CookieConsent';
import ImageProtection from '../components/ImageProtection';
import ReduxProvider from '../providers/ReduxProvider';
import { SocketProvider } from '../providers/SocketProvider';
import { StoreModalProvider } from '../providers/StoreModalProvider';
import ThemeProvider from '../providers/ThemeProvider';
import '../styles/globals.css';

const kumbhSans = Kumbh_Sans({
  variable: '--font-kumbh-sans',
  subsets: ['latin'],
});

// Editorial display face for marketing headlines. Kumbh Sans stays the UI face.
const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  display: 'swap',
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://yourcaptureawards.com';
const SITE_DESCRIPTION =
  'Your Capture awards the ultimate destination for photographers, discussing, and creating stunning imagery.';

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    absolute: '',
    default: 'Your Capture Awards',
    template: '%s | Your Capture Awards',
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    title: 'Your Capture Awards',
    description: SITE_DESCRIPTION,
    url: APP_URL,
    siteName: 'Your Capture Awards',
    images: [
      {
        url: '/images/banner.png',
        width: 1200,
        height: 630,
        alt: 'Your Capture Awards',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Your Capture Awards',
    description: SITE_DESCRIPTION,
    images: ['/images/banner.png'],
  },
  icons: {
    icon: '/icons/site-icon.png',
    shortcut: '/icons/site-icon.png',
    apple: '/icons/site-icon.png',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Font variables live on <html> so :root can resolve them — --font-editorial
    // in globals.css is declared at :root and would otherwise be invalid.
    <html
      lang="en"
      className={cn('dark', kumbhSans.variable, playfair.variable)}
      suppressHydrationWarning
    >
      <body
        suppressHydrationWarning
        className={cn('bg-background text-foreground antialiased', kumbhSans.className)}
      >
        <ThemeProvider>
          <ReduxProvider>
            <SocketProvider>
              <StoreModalProvider>
                <AuthRedirectHandler />
                <ImageProtection />
                {children} <StoreModal />
                <CookieConsent />
                <Toaster
                  expand
                  richColors
                  position="top-center"
                  swipeDirections={['bottom', 'left', 'right', 'top']}
                  duration={3000}
                />
              </StoreModalProvider>
            </SocketProvider>
          </ReduxProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
