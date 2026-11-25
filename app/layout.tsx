import type { Metadata, Viewport } from 'next';
import { Geist_Mono, Mona_Sans } from 'next/font/google';
import AuthProvider from '@/context/AuthProvider';
import { AppToaster } from '@/components/layout/AppToaster';
import { ErrorBoundary } from '@/components/UI/ErrorBoundary';
import './globals.css';

const monaSans = Mona_Sans({ subsets: ['latin'], variable: '--font-mona', display: 'swap' });
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono', display: 'swap' });

export const metadata: Metadata = {
  title: { default: 'HurgoTrack', template: '%s · HurgoTrack' },
  description: 'Gestión de pedidos, viajes, flota y conductores de Hurgo Transporte.',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f9fafb' },
    { media: '(prefers-color-scheme: dark)', color: '#110d1a' },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${monaSans.variable} ${geistMono.variable}`}>
      <body suppressHydrationWarning>
        <ErrorBoundary>
          <AuthProvider>
            {children}
            <AppToaster />
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
