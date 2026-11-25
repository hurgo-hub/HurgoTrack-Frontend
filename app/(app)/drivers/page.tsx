import type { Metadata } from 'next';
import { Users } from 'lucide-react';
import { ModulePlaceholder } from '@/components/layout/ModulePlaceholder';

export const metadata: Metadata = { title: 'Conductores' };

export default function Page() {
  return <ModulePlaceholder title="Conductores" description="Conductores y su disponibilidad." icon={<Users />} />;
}
