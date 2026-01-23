import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'Uniflow Assess',
  description: 'Uniflow Labs is building an AI-native business operating system: compiler, runtime, user interfaces, integrations, and AI capabilities for enterprise workflows.',
  openGraph: {
    url: 'https://uniflow.tech/',
    siteName: 'Uniflow Labs',
    title: 'Business software, compiled — Uniflow Labs',
    description: 'Uniflow Labs is building an AI-native business operating system: compiler, runtime, user interfaces, integrations, and AI capabilities for enterprise workflows.',
    type: 'website',
    images: [
      {
        url: 'https://uniflow.tech/assets/images/social-card.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Business software, compiled — Uniflow Labs',
    description: 'Uniflow Labs is building an AI-native business operating system: compiler, runtime, user interfaces, integrations, and AI capabilities for enterprise workflows.',
    images: ['https://uniflow.tech/assets/images/social-card.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-TMLW7B03V1" />
        <Script id="google-analytics">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-TMLW7B03V1');
          `}
        </Script>
        <meta name="theme-color" content="#0f172a" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
        )}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
