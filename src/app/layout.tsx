import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { AuthModal } from '@/components/auth';
import { Analytics } from '@vercel/analytics/next';

export const metadata: Metadata = {
  title: 'KUIRO — Your Always-On AI Marketing Employee',
  description: 'Create / Approve / Grow. Zero-click social media and messaging autopilot for Indian SMBs, founders, and agencies.',
  icons: {
    icon: [
      { url: '/brand/kuiro-favicon-circle.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" type="image/svg+xml" href="/brand/kuiro-favicon-circle.svg" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Sora:wght@600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#0B0F14] text-[#FFFFFF] font-sans antialiased selection:bg-[#FF7A00] selection:text-white">
        <AuthProvider>
          {children}
          <AuthModal />
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
