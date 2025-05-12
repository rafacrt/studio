
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Clock, Square, Circle } from 'lucide-react'; // Use Square/Circle for indicators
import { DayPicker, type DayProps, type Modifiers } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { format, parseISO, startOfMonth, isSameDay, isValid, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useOSStore } from '@/store/os-store';
import type { OS } from '@/lib/types';
import { OSStatus } from '@/lib/types';

// Helper to get status color (Bootstrap class names)
const getStatusColorClass = (status: OSStatus): string => {
  switch (status) {
    case OSStatus.NA_FILA: return 'text-secondary';
    case OSStatus.AGUARDANDO_CLIENTE: return 'text-warning';
    case OSStatus.EM_PRODUCAO: return 'text-info';
    case OSStatus.AGUARDANDO_PARCEIRO: return 'text-primary';
    case OSStatus.FINALIZADO: return 'text-success';
    default: return 'text-secondary';
  }
};

// Helper to get a darker border color for contrast
const getStatusBorderColorClass = (status: OSStatus): string => {
    switch (status) {
        case OSStatus.NA_FILA: return 'border-secondary';
        case OSStatus.AGUARDANDO_CLIENTE: return 'border-warning';
        case OSStatus.EM_PRODUCAO: return 'border-info';
        case OSStatus.AGUARDANDO_PARCEIRO: return 'border-primary';
        case OSStatus.FINALIZADO: return 'border-success';
        default: return 'border-secondary';
    }
};

export default function CalendarPage() {
  const osList = useOSStore((state) => state.osList);
  const [currentMonth, setCurrentMonth] = useState<Date>(startOfMonth(new Date()));
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Simulate loading delay for demonstration
    const timer = setTimeout(() => {
        setIsHydrated(true);
    }, 500); // 0.5 second delay
    return () => clearTimeout(timer);
  }, []);

  // Memoize OS data processing
  const { scheduledDates, finalizedDates, osByDate } = useMemo(() => {
    const scheduled = new Set<string>();
    const finalized = new Set<string>();
    const osMap = new Map<string, OS[]>();

    osList.forEach(os => {
      const addOsToMap = (dateStr: string, osToAdd: OS) => {
        if (!osMap.has(dateStr)) osMap.set(dateStr, []);
        // Avoid duplicates if scheduled and finalized on same day
        if (!osMap.get(dateStr)?.some(existing => existing.id === osToAdd.id)) {
          osMap.get(dateStr)?.push(osToAdd);
        }
      };

      // Handle scheduled date
      if (os.programadoPara) {
        try {
            // Handle YYYY-MM-DD format directly
            const dateStr = os.programadoPara.split('T')[0];
            const date = parseISO(dateStr); // Parse just the date part
            if (isValid(date)) {
                scheduled.add(dateStr);
                addOsToMap(dateStr, os);
            } else {
                 console.warn(`Invalid programadoPara date format for OS ${os.numero}: ${os.programadoPara}`);
            }
        } catch (e) {
          console.warn(`Error parsing programadoPara date for OS ${os.numero}: ${os.programadoPara}`, e);
        }
      }
      // Handle finalized date
      if (os.dataFinalizacao) {
        try {
          const date = parseISO(os.dataFinalizacao); // Expecting ISO string
          if (isValid(date)) {
            const dateStr = format(date, 'yyyy-MM-dd');
            finalized.add(dateStr);
            addOsToMap(dateStr, os);
          }
        } catch (e) {
          console.warn(`Invalid dataFinalizacao date format for OS ${os.numero}: ${os.dataFinalizacao}`);
        }
      }
    });

    return {
      scheduledDates: Array.from(scheduled).map(d => parseISO(d)),
      finalizedDates: Array.from(finalized).map(d => parseISO(d)),
      osByDate: osMap,
    };
  }, [osList]);

  // --- Custom Day Component ---
  const DayContent = (props: DayProps) => {
    const dateStr = format(props.date, 'yyyy-MM-dd');
    const dayOS = osByDate.get(dateStr) || [];
    const isSelected = props.displayMonth === currentMonth && props.modifiers.selected; // Check if day is selected

    // Sort OS: Scheduled first, then by number
     const sortedDayOS = dayOS.sort((a, b) => {
        const aIsScheduled = a.programadoPara && format(parseISO(a.programadoPara.split('T')[0]), 'yyyy-MM-dd') === dateStr;
        const bIsScheduled = b.programadoPara && format(parseISO(b.programadoPara.split('T')[0]), 'yyyy-MM-dd') === dateStr;
        if (aIsScheduled && !bIsScheduled) return -1;
        if (!aIsScheduled && bIsScheduled) return 1;
        return parseInt(a.numero, 10) - parseInt(b.numero, 10);
     });

    return (
        <div className={`d-flex flex-column h-100 position-relative p-1 ${isSelected ? 'bg-primary-subtle' : ''}`} style={{ minHeight: '120px' }}> {/* Increased minHeight */}
           {/* Day Number - Positioned top-right */}
            <span className={`position-absolute top-0 end-0 p-1 small ${isToday(props.date) ? 'bg-primary text-white rounded-circle lh-1 d-inline-flex justify-content-center align-items-center' : ''}`}
                  style={isToday(props.date) ? { width: '1.5rem', height: '1.5rem'} : {}}
            >
                {format(props.date, 'd')}
            </span>
           {/* OS List */}
            <div className="mt-3 small flex-grow-1 overflow-auto" style={{ fontSize: '0.7rem' }}> {/* Reduced font size, allow scroll */}
             {sortedDayOS.slice(0, 4).map(os => { // Limit displayed OS slightly more
               const isScheduled = os.programadoPara && format(parseISO(os.programadoPara.split('T')[0]), 'yyyy-MM-dd') === dateStr;
               const isFinalized = os.dataFinalizacao && format(parseISO(os.dataFinalizacao), 'yyyy-MM-dd') === dateStr;
               const colorClass = getStatusColorClass(os.status);

               return (
                   <Link key={os.id} href={`/os/${os.id}`} className={`d-block text-decoration-none mb-1 p-1 rounded border-start border-2 ${getStatusBorderColorClass(os.status)} bg-light-subtle shadow-sm transition-transform`}>
                     <div className={`d-flex align-items-center ${colorClass}`}>
                       {isFinalized ? <CheckCircle size={10} className="me-1 flex-shrink-0"/> : <Clock size={10} className="me-1 flex-shrink-0"/>}
                       <span className="text-truncate fw-medium" title={`${os.numero}: ${os.projeto}`}>
                         <strong className="text-dark">{os.numero}</strong>: {os.projeto}
                       </span>
                     </div>
                   </Link>
               );
             })}
             {sortedDayOS.length > 4 && (
                 <div className="text-muted text-center mt-1">+{sortedDayOS.length - 4} mais</div>
             )}
            </div>
        </div>
     );
  };

  // --- Modifiers ---
  const modifiers: Modifiers = useMemo(() => ({
    scheduled: scheduledDates,
    finalized: finalizedDates,
  }), [scheduledDates, finalizedDates]);

  const modifiersStyles = {
     // Styling is mostly handled by DayContent now
  };


  if (!isHydrated) {
    return (
      <AuthenticatedLayout>
        {/* Improved Loading Spinner */}
        <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '400px' }}>
          <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Carregando calendário...</span>
          </div>
          <p className="text-muted">Carregando calendário...</p>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">Calendário de OS</h1>
        <Link href="/dashboard" className="btn btn-outline-secondary btn-sm">
          <ArrowLeft className="me-2" size={16} /> Voltar ao Painel
        </Link>
      </div>

      {/* Calendar takes full width within the container */}
      {/* Removed card wrapper */}
      <div className="border rounded shadow-sm overflow-hidden transition-all"> {/* Add border/shadow directly */}
         <DayPicker
           mode="single" // Keep single selection for potential focus/highlight
           month={currentMonth}
           onMonthChange={setCurrentMonth}
           locale={ptBR}
           showOutsideDays
           fixedWeeks // Important for grid layout
           modifiers={modifiers}
           modifiersStyles={modifiersStyles}
           components={{ DayContent }} // Use custom component
           captionLayout="dropdown-buttons"
           fromYear={2020}
           toYear={new Date().getFullYear() + 2}
           className="w-100 border-0" // DayPicker is already w-100
           classNames={{
               root: 'p-3 bg-body', // Add padding and ensure background color
               table: 'border-top border-start w-100 table-fixed', // Full width table with borders, table-fixed might help layout
               head_row: 'bg-light',
               head_cell: 'text-muted small fw-medium text-center border-end border-bottom py-2',
               row: '', // Rows don't need specific styles here
               cell: 'border-end border-bottom p-0 align-top', // Remove padding, align top, add borders
               day: 'd-block w-100 h-100', // Make day fill cell
               day_today: '', // Today styling handled in DayContent
               day_outside: 'text-muted opacity-50',
               day_selected: '', // Selection styling handled in DayContent
               caption: 'px-3 pt-2', // Add padding to caption
               caption_label: 'fs-5 fw-bold',
               nav_button: 'btn btn-outline-secondary border-0',
               // Add other classes as needed
           }}
       />
         {/* Legend */}
         <div className="p-2 border-top text-muted small d-flex align-items-center justify-content-center gap-3 bg-light">
             <span className="d-inline-flex align-items-center"><Clock size={12} className="me-1"/> Programada</span>
             <span className="d-inline-flex align-items-center"><CheckCircle size={12} className="me-1 text-success"/> Finalizada</span>
             {/* Add more legend items if needed */}
         </div>
       </div>
    </AuthenticatedLayout>
  );
}
