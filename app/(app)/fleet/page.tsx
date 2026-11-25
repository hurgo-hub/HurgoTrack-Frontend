import type { Metadata } from 'next';
import { Truck } from 'lucide-react';
import { ModulePlaceholder } from '@/components/layout/ModulePlaceholder';

export const metadata: Metadata = { title: 'Flota' };

export default function Page() {
  return <ModulePlaceholder title="Flota" description="Vehículos y documentos." icon={<Truck />} />;
}
