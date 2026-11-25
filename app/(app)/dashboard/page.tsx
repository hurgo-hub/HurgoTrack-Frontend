import type { Metadata } from 'next';
import { LayoutDashboard } from 'lucide-react';
import { ModulePlaceholder } from '@/components/layout/ModulePlaceholder';

export const metadata: Metadata = { title: 'Dashboard' };

export default function Page() {
  return <ModulePlaceholder title="Dashboard" description="Resumen de la operación." icon={<LayoutDashboard />} />;
}
