import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import OSGrid from '@/components/os-grid/OSGrid'; // Updated import

export default function DashboardPage() {
  return (
    <AuthenticatedLayout>
      <OSGrid /> {/* Updated component */}
    </AuthenticatedLayout>
  );
}
