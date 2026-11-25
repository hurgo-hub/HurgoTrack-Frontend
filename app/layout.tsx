import type { Metadata } from 'next';
import AuthProvider from '@/context/AuthProvider';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'HurgoTrack', template: '%s · HurgoTrack' },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
