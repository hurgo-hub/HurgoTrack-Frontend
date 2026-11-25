import type { Metadata } from 'next';
import { Sora } from 'next/font/google';
import AuthProvider from '@/context/AuthProvider';
import './globals.css';

const sora = Sora({ subsets: ['latin'], variable: '--font-sora', display: 'swap' });

export const metadata: Metadata = {
  title: { default: 'Hurgo Track', template: '%s · Hurgo Track' },
  description: 'Seguimiento de la carga de Hurgo Transporte, del pedido a la foto de entrega.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={sora.variable}>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
