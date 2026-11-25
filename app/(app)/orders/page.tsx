import type { Metadata } from 'next';
import { Package } from 'lucide-react';
import { ModulePlaceholder } from '@/components/layout/ModulePlaceholder';

export const metadata: Metadata = { title: 'Pedidos' };

export default function Page() {
  return <ModulePlaceholder title="Pedidos" description="Pedidos sincronizados desde Odoo." icon={<Package />} />;
}
