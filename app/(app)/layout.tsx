'use client';

import { RequireAuth } from '@/components/auth/Guards';
import { DashboardShell } from '@/components/layout/DashboardShell';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <DashboardShell>{children}</DashboardShell>
    </RequireAuth>
  );
}
