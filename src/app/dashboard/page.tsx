import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import KanbanBoard from '@/components/kanban/KanbanBoard';

export default function DashboardPage() {
  return (
    <AuthenticatedLayout>
      <KanbanBoard />
    </AuthenticatedLayout>
  );
}
