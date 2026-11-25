import type { Metadata } from 'next';
import { Route } from 'lucide-react';
import { ModulePlaceholder } from '@/components/layout/ModulePlaceholder';

export const metadata: Metadata = { title: 'Viajes' };

export default function Page() {
  return <ModulePlaceholder title="Viajes" description="Construcción, asignación y seguimiento de viajes." icon={<Route />} />;
}
