import type { Metadata } from 'next';
import { MapPin } from 'lucide-react';
import { ModulePlaceholder } from '@/components/layout/ModulePlaceholder';

export const metadata: Metadata = { title: 'Ubicaciones' };

export default function Page() {
  return <ModulePlaceholder title="Ubicaciones" description="Ubicación de la flota (Satrack)." icon={<MapPin />} />;
}
