import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'مركز غرب المطار',
  description: 'Smart Medical Queue Management System',
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#1e40af" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="font-cairo bg-gray-50">
        {children}
      </body>
    </html>
  );
}
