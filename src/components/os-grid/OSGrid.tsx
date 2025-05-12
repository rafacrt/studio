
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

    // Filter by Selected Date (using programadoPara or dataAbertura as fallback)
    if (selectedDate) {
       filtered = filtered.filter(os => {
          if (os.programadoPara) {
              try {
                 return isSameDay(parseISO(os.programadoPara), selectedDate);
              } catch {
                 // Handle potential invalid date format in programadoPara
                 return false;
              }
          }
          // Optional: Fallback to dataAbertura if programadoPara is not set
          // else {
          //    try {
          //       return isSameDay(parseISO(os.dataAbertura), selectedDate);
          //    } catch {
          //        return false;
          //    }
          // }
          return false; // Only filter by programadoPara if set
       });
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
        {/* Placeholder for controls */}
        <div className="mb-4 p-3 border rounded bg-light placeholder-glow">
            <div className="row g-2 align-items-end">
                <div className="col-md-6 col-lg-3"><span className="placeholder col-12"></span></div>
                <div className="col-md-6 col-lg-3"><span className="placeholder col-12"></span></div>
                <div className="col-lg-4"><span className="placeholder col-12"></span></div>
                <div className="col-lg-2"><span className="placeholder col-12"></span></div>
            </div>
        </div>
        {/* Placeholder for grid */}
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-xl-4 g-4">
          {[...Array(8)].map((_, i) => (
            <div className="col" key={i}>
              <div className="card placeholder-glow" aria-hidden="true" style={{ height: '250px' }}>
                <div className="card-header placeholder-glow">
                    <span className="placeholder col-4"></span>
                </div>
                <div className="card-body">
                  <span className="placeholder col-6 d-block mb-2"></span>
                  <span className="placeholder col-8 d-block mb-2"></span>
                  <span className="placeholder col-7 d-block mb-2"></span>
                  <span className="placeholder col-5 d-block mt-auto"></span>
                </div>
                 <div className="card-footer placeholder-glow">
                    <span className="placeholder col-10 d-block mb-1"></span>
                    <span className="placeholder col-10 d-block"></span>
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
        <div className="flex-grow-1 d-flex flex-column align-items-center justify-content-center text-center mt-5 p-4 rounded bg-light">
          <p className="fs-5 text-muted fw-medium">Nenhuma Ordem de Serviço encontrada.</p>
          <p className="text-muted small">
            Tente ajustar os filtros ou {searchTerm ? `limpar o termo de busca "${searchTerm}".` : 'crie uma nova OS.'}
            {selectedDate && ` (Data programada filtrada: ${selectedDate.toLocaleDateString('pt-BR')})`}
          </p>
           {selectedDate && (
              <button className="btn btn-sm btn-outline-secondary mt-2" onClick={() => setSelectedDate(undefined)}>
                 Limpar Filtro de Data
              </button>
            )}
            {(filterStatus !== 'all' || searchTerm) && (
                 <button
                    className="btn btn-sm btn-outline-secondary mt-2 ms-2"
                    onClick={() => {
                        setFilterStatus('all');
                        setSearchTerm('');
                        setSelectedDate(undefined); // Also clear date if clearing filters
                    }}
                 >
                    Limpar Todos os Filtros
                 </button>
            )}
        </div>
      ) : (
         // Use Bootstrap grid: Updated for 4 columns on xl screens
         // Drag and Drop functionality is complex and not implemented here.
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
