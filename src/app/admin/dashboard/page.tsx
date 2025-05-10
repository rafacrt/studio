
"use client";

import { useEffect, useState } from 'react';
import { DollarSign, Users, Home, CalendarCheck } from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import { MonthlyRevenueChart } from '@/components/charts/MonthlyRevenueChart';
import { BookingStatusChart } from '@/components/charts/BookingStatusChart';
import { getAdminDashboardStats, getMonthlyRevenueData, getBookingStatusData } from '@/lib/mock-data';

interface DashboardStats {
  totalRevenue: number;
  newUsers: number;
  pendingApprovals: number;
  activeBookings: number;
}

interface RevenueData {
  month: string;
  revenue: number;
}

interface BookingStatusData {
  status: string;
  count: number;
  fill: string;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [bookingStatusData, setBookingStatusData] = useState<BookingStatusData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [statsData, monthlyRevenue, bookingStatus] = await Promise.all([
          getAdminDashboardStats(),
          getMonthlyRevenueData(),
          getBookingStatusData(),
        ]);
        setStats(statsData);
        setRevenueData(monthlyRevenue);
        setBookingStatusData(bookingStatus);
      } catch (error) {
        console.error("Falha ao buscar dados do dashboard:", error);
        // TODO: Adicionar toast de erro
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-foreground">Painel Administrativo</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Receita Total"
          value={isLoading || !stats ? "..." : `R$${stats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={DollarSign}
          description="Receita total gerada"
          isLoading={isLoading}
        />
        <StatCard
          title="Novos Usuários"
          value={isLoading || !stats ? "..." : stats.newUsers}
          icon={Users}
          description="Usuários cadastrados este mês"
          isLoading={isLoading}
        />
        <StatCard
          title="Quartos Pendentes"
          value={isLoading || !stats ? "..." : stats.pendingApprovals}
          icon={Home}
          description="Aguardando aprovação"
          isLoading={isLoading}
        />
        <StatCard
          title="Reservas Ativas"
          value={isLoading || !stats ? "..." : stats.activeBookings}
          icon={CalendarCheck}
          description="Reservas atualmente ativas"
          isLoading={isLoading}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <MonthlyRevenueChart data={revenueData} isLoading={isLoading} />
        <BookingStatusChart data={bookingStatusData} isLoading={isLoading} />
      </div>
      
      {/* TODO: Adicionar mais seções, como "Últimas Atividades" ou "Quartos mais Populares" */}
    </div>
  );
}
