import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Personal Ledger | Track your spending in Dhaka',
  description:
    'A smart personal finance tracker for salaried professionals in Dhaka — track expenses, forecast your month, and hit your savings goals.',
  manifest: '/manifest.json',
  themeColor: '#0a0e1a',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Ledger',
  },
  openGraph: {
    title: 'Personal Ledger',
    description: 'Smart expense tracking for Dhaka professionals',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="bg-[#0a0e1a] text-slate-100 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
