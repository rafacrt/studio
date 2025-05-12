
'use client';

import React, { useMemo, useState, useEffect } from 'react';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import { useOSStore } from '@/store/os-store';
import { OSStatus } from '@/lib/types';
import Link from 'next/link';
import { ArrowLeft, FileText as ReportIcon, CheckCircle2, Clock, SortAmountDown, SortAmountUp } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Helper to format minutes into hours and minutes string
const formatMinutes = (totalMinutes: number | undefined | null): string | React.ReactNode => {
    if (totalMinutes === undefined || totalMinutes === null || totalMinutes < 0) {
        return <span className="text-muted fst-italic">N/D</span>; // Not Available or Error
    }
    if (totalMinutes === 0) return "0m";
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    let result = '';
    if (hours > 0) {
        result += `${hours}h `;
    }
    if (minutes > 0) {
        result += `${minutes}m`;
    }
    return result.trim();
};

type SortKey = 'dataFinalizacao' | 'tempoProducaoMinutos' | 'numero' | 'cliente' | 'projeto';
type SortDirection = 'asc' | 'desc';

export default function ReportsPage() {
  const osList = useOSStore((state) => state.osList);
  const [isHydrated, setIsHydrated] = useState(false);
  const [sortBy, setSortBy] = useState<SortKey>('dataFinalizacao');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  useEffect(() => {
    // Simulate loading delay for demonstration
    const timer = setTimeout(() => {
        setIsHydrated(true);
    }, 300); // 0.3 second delay
    return () => clearTimeout(timer);
  }, []);

  const completedOS = useMemo(() => {
    let filtered = osList.filter(os => os.status === OSStatus.FINALIZADO);

    // Sorting logic
    filtered.sort((a, b) => {
        let compareResult = 0;
        const valA = getSortValue(a, sortBy); // Use helper for safe access
        const valB = getSortValue(b, sortBy);

        if (sortBy === 'dataFinalizacao') {
            // Handle potentially undefined values gracefully
            const timeA = valA ? parseISO(valA).getTime() : 0;
            const timeB = valB ? parseISO(valB).getTime() : 0;
            compareResult = timeA - timeB;
        } else if (sortBy === 'tempoProducaoMinutos') {
            // Handle potentially undefined values
            const timeA = valA ?? -1;
            const timeB = valB ?? -1;
            compareResult = timeA - timeB;
        } else if (sortBy === 'numero') {
            compareResult = parseInt(valA as string || '0', 10) - parseInt(valB as string || '0', 10);
        } else if (sortBy === 'cliente' || sortBy === 'projeto') {
            compareResult = (valA as string || '').localeCompare(valB as string || '');
        }

        return sortDirection === 'asc' ? compareResult : -compareResult;
    });

    return filtered;
  }, [osList, sortBy, sortDirection]);

  const handleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortDirection('asc'); // Default to ascending when changing column
    }
  };

  const renderSortIcon = (key: SortKey) => {
    if (sortBy !== key) return null;
    return sortDirection === 'asc' ? <SortAmountUp size={14} className="ms-1" /> : <SortAmountDown size={14} className="ms-1" />;
  };

  if (!isHydrated) {
    return (
      <AuthenticatedLayout>
        {/* Improved Loading Spinner */}
        <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '400px' }}>
          <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Carregando relatórios...</span>
          </div>
           <p className="text-muted">Carregando relatórios...</p>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
       {/* Add transition wrapper */}
      <div className="transition-opacity">
          <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
            <h1 className="h3 mb-0 d-flex align-items-center">
                <ReportIcon className="me-2 text-warning" /> Relatório de Tempo de Produção
            </h1>
            <Link href="/dashboard" className="btn btn-outline-secondary btn-sm">
              <ArrowLeft className="me-2" size={16} /> Voltar ao Painel
            </Link>
          </div>

          <div className="card shadow-sm transition-all">
            <div className="card-header bg-light">
              Ordens de Serviço Finalizadas
            </div>
            <div className="card-body p-0"> {/* Remove padding for full-width table */}
              {completedOS.length === 0 ? (
                <div className="text-center p-4 text-muted">
                  Nenhuma Ordem de Serviço finalizada encontrada.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-striped table-hover mb-0"> {/* Added table-hover, removed bottom margin */}
                    <thead className="table-light">
                      <tr>
                        <th scope="col" onClick={() => handleSort('numero')} style={{ cursor: 'pointer' }} className="text-nowrap">
                            Nº OS {renderSortIcon('numero')}
                        </th>
                        <th scope="col" onClick={() => handleSort('cliente')} style={{ cursor: 'pointer' }}>
                            Cliente {renderSortIcon('cliente')}
                        </th>
                        <th scope="col" onClick={() => handleSort('projeto')} style={{ cursor: 'pointer' }}>
                            Projeto {renderSortIcon('projeto')}
                        </th>
                        <th scope="col" onClick={() => handleSort('dataFinalizacao')} style={{ cursor: 'pointer' }} className="text-nowrap">
                             <CheckCircle2 size={14} className="me-1" /> Data Finalização {renderSortIcon('dataFinalizacao')}
                        </th>
                        <th scope="col" onClick={() => handleSort('tempoProducaoMinutos')} style={{ cursor: 'pointer' }} className="text-nowrap">
                             <Clock size={14} className="me-1" /> Tempo Produção {renderSortIcon('tempoProducaoMinutos')}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {completedOS.map(os => (
                        <tr key={os.id}>
                          <td className="font-monospace small">{os.numero}</td>
                          <td>{os.cliente}</td>
                          <td>{os.projeto}</td>
                          <td>
                            {os.dataFinalizacao ? format(parseISO(os.dataFinalizacao), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : '-'}
                          </td>
                          <td>{formatMinutes(os.tempoProducaoMinutos)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
             <div className="card-footer text-muted small">
                Tempo de produção é calculado do momento que a OS entra em "Em Produção" até ser "Finalizada". Apenas o tempo corrido é considerado por enquanto.
            </div>
          </div>
       </div>
    </AuthenticatedLayout>
  );
}

// Helper to safely return a value for sorting, handling potential null/undefined objects
function getSortValue<T, K extends keyof T>(obj: T | null | undefined, key: K): T[K] | null {
    return obj ? obj[key] : null;
}
