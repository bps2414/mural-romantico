import type { Metadata, Viewport } from 'next';
import { Outfit, Quicksand, Caveat } from 'next/font/google';
import { ServiceWorkerRegister } from '@/components/ServiceWorkerRegister';
import './globals.css';

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
});

const quicksand = Quicksand({
  variable: '--font-quicksand',
  subsets: ['latin'],
});

const caveat = Caveat({
  variable: '--font-handwriting',
  subsets: ['latin'],
});

export const viewport: Viewport = {
  themeColor: '#e11d48',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'Nosso Mural 💕',
  description: 'O mural de amor do Bryan e da Tata',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Nosso Mural',
  },
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/icon-192.png',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${outfit.variable} ${quicksand.variable} ${caveat.variable} antialiased font-sans bg-rose-50 text-slate-800 fixed inset-0 overflow-y-auto overscroll-none scroll-smooth`}>
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
