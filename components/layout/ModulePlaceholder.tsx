import type { ReactNode } from 'react';
import { Card, EmptyState, PageHeader } from '@/components/UI';

/** Pantalla vacía de un módulo; se reemplaza al implementar su lógica */
export function ModulePlaceholder({ title, description, icon }: { title: string; description: string; icon: ReactNode }) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} />
      <Card>
        <EmptyState icon={icon} title="Módulo en construcción" description="La estructura base está lista; aquí irá la lógica." />
      </Card>
    </div>
  );
}
