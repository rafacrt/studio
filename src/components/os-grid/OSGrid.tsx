
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import type { OS } from '@/lib/types';
import { OSStatus, ALL_OS_STATUSES } from '@/lib/types';
import { useOSStore } from '@/store/os-store';
import OSCard from './OSCard';
import DashboardControls from '@/components/dashboard/DashboardControls'; // Import new controls component
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css'; // Default style
import { ptBR } from 'date-fns/locale';
import { parseISO, isSameDay } from 'date-fns';

type SortKey = 'dataAbertura' | 'numero' | 'cliente' | 'projeto';

export default function OSGrid() {
  const osList = useOSStore((state) => state.osList);
  const [isHydrated, setIsHydrated] = useState(false);

  // Filter, Sort, Search State
  const [filterStatus, setFilterStatus] = useState<OSStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortKey>('dataAbertura');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const filteredAndSortedOS = useMemo(() => {
    let filtered = osList;

    // Filter by Status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(os => os.status === filterStatus);
    }

    // Filter by Selected Date (using dataAbertura for now)
    if (selectedDate) {
      filtered = filtered.filter(os => isSameDay(parseISO(os.dataAbertura), selectedDate));
    }

    // Filter by Search Term (Client, Project, OS Number, Partner, Tarefa)
    if (searchTerm.trim() !== '') {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(os =>
        os.cliente.toLowerCase().includes(lowerSearchTerm) ||
        os.projeto.toLowerCase().includes(lowerSearchTerm) ||
        os.numero.includes(searchTerm) || // OS number is exact match
        (os.parceiro && os.parceiro.toLowerCase().includes(lowerSearchTerm)) ||
        os.tarefa.toLowerCase().includes(lowerSearchTerm)
      );
    }

    // Sort: Primary sort + Urgent priority
    filtered.sort((a, b) => {
      // 1. Prioritize Urgent OS
      if (a.isUrgent && !b.isUrgent) return -1;
      if (!a.isUrgent && b.isUrgent) return 1;

      // 2. Apply selected sort key
      if (sortBy === 'dataAbertura') {
        return parseISO(b.dataAbertura).getTime() - parseISO(a.dataAbertura).getTime(); // Descending
      }
      if (sortBy === 'numero') {
        return parseInt(a.numero, 10) - parseInt(b.numero, 10); // Ascending
      }
      if (sortBy === 'cliente') {
        return a.cliente.localeCompare(b.cliente); // Ascending
      }
      if (sortBy === 'projeto') {
        return a.projeto.localeCompare(b.projeto); // Ascending
      }
      return 0; // Should not happen
    });

    return filtered;
  }, [osList, filterStatus, sortBy, searchTerm, selectedDate]);

  if (!isHydrated) {
    // Simplified loading state using placeholders
    return (
      <div className="container-fluid mt-4">
        <div className="placeholder-glow mb-4 d-flex justify-content-between align-items-center">
          <span className="placeholder col-3 placeholder-lg"></span>
          <span className="placeholder col-2 placeholder-lg"></span>
          <span className="placeholder col-1 placeholder-lg"></span>
        </div>
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-xl-4 g-4">
          {[...Array(8)].map((_, i) => (
            <div className="col" key={i}>
              <div className="card placeholder-glow" aria-hidden="true">
                <div className="card-body">
                  <span className="placeholder col-6"></span>
                  <span className="placeholder col-8"></span>
                  <span className="placeholder col-4"></span>
                  <span className="placeholder col-7"></span>
                  <span className="placeholder col-5"></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column h-100">
      {/* Pass state and setters to the controls component */}
      <DashboardControls
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        sortBy={sortBy}
        setSortBy={setSortBy}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
      />

      {filteredAndSortedOS.length === 0 ? (
        <div className="flex-grow-1 d-flex flex-column align-items-center justify-content-center text-center mt-5">
          <p className="fs-5 text-muted">Nenhuma Ordem de Serviço encontrada.</p>
          <p className="text-muted small">
            Tente ajustar os filtros ou crie uma nova OS.
            {selectedDate && ` (Data selecionada: ${selectedDate.toLocaleDateString('pt-BR')})`}
          </p>
           {selectedDate && (
              <button className="btn btn-sm btn-outline-secondary mt-2" onClick={() => setSelectedDate(undefined)}>
                 Limpar Filtro de Data
              </button>
            )}
        </div>
      ) : (
         // Use Bootstrap grid: Updated for 4 columns on xl screens
         // NOTE: Drag and Drop functionality is complex and has been deferred.
         <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-xl-4 g-3 pb-4 flex-grow-1"> {/* g-3 for slightly less gap */}
          {filteredAndSortedOS.map((os) => (
            <div className="col" key={os.id}>
              <OSCard os={os} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
