import type { Metadata } from 'next';
import { Outfit, Quicksand, Caveat } from 'next/font/google';
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

export const metadata: Metadata = {
  title: 'Mural Romântico',
  description: 'Um lugar especial apenas para nós dois.',
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'theme-color': '#fff1f2',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${outfit.variable} ${quicksand.variable} ${caveat.variable} antialiased font-sans bg-rose-50 text-slate-800`}>
        {children}
      </body>
    </html>
  );
}
