
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import Link from 'next/link';
import { ArrowLeft, Calendar as CalendarIcon, Clock, CheckCircle, Info } from 'lucide-react';
import { DayPicker, type Modifiers } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { format, parseISO, startOfMonth, isSameDay, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useOSStore } from '@/store/os-store';
import type { OS } from '@/lib/types';
import { OSStatus } from '@/lib/types'; // Import OSStatus for styling

// Helper to get status color (simplified for calendar)
const getStatusColor = (status: OSStatus): string => {
  switch (status) {
    case OSStatus.NA_FILA: return 'secondary';
    case OSStatus.AGUARDANDO_CLIENTE: return 'warning';
    case OSStatus.EM_PRODUCAO: return 'info';
    case OSStatus.AGUARDANDO_PARCEIRO: return 'primary';
    case OSStatus.FINALIZADO: return 'success';
    default: return 'secondary';
  }
};


export default function CalendarPage() {
  const osList = useOSStore((state) => state.osList);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [currentMonth, setCurrentMonth] = useState<Date>(startOfMonth(new Date()));
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const { scheduledDates, finalizedDates, osByDate } = useMemo(() => {
    const scheduled = new Set<string>();
    const finalized = new Set<string>();
    const osMap = new Map<string, OS[]>();

    osList.forEach(os => {
      // Handle scheduled date
      if (os.programadoPara) {
          try {
            // Expecting YYYY-MM-DD string
            const date = parseISO(os.programadoPara);
            if (isValid(date)) {
                const dateStr = format(date, 'yyyy-MM-dd');
                scheduled.add(dateStr);
                if (!osMap.has(dateStr)) osMap.set(dateStr, []);
                osMap.get(dateStr)?.push(os);
            }
        } catch (e) {
             console.warn(`Invalid programadoPara date format for OS ${os.numero}: ${os.programadoPara}`);
        }
      }
      // Handle finalized date
      if (os.dataFinalizacao) {
         try {
             // Expecting ISO string
            const date = parseISO(os.dataFinalizacao);
             if (isValid(date)) {
                const dateStr = format(date, 'yyyy-MM-dd');
                finalized.add(dateStr);
                if (!osMap.has(dateStr)) osMap.set(dateStr, []);
                // Avoid adding duplicate if finalized date is same as scheduled date
                if (!osMap.get(dateStr)?.some(existingOs => existingOs.id === os.id)) {
                    osMap.get(dateStr)?.push(os);
                }
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

  const modifiers: Modifiers = {
    scheduled: scheduledDates,
    finalized: finalizedDates,
    selected: selectedDate ? [selectedDate] : [],
  };

  const modifiersStyles = {
    // Order matters for precedence if dates overlap (finalized style wins)
    scheduled: {
      border: '2px solid var(--bs-info)',
      borderRadius: '50%',
    },
    finalized: {
      border: '2px solid var(--bs-success)',
      fontWeight: 'bold',
      borderRadius: '50%',
    },
    selected: {
         backgroundColor: 'var(--bs-primary)',
         color: 'white',
         borderRadius: '50%', // Ensure selected is also round
     },
  };

  const handleDayClick = (day: Date, modifiers: Modifiers) => {
      if (modifiers.scheduled || modifiers.finalized) {
          setSelectedDate(day);
      } else {
          setSelectedDate(undefined); // Deselect if clicking a day with no OS
      }
  };

   const selectedDayOS = useMemo(() => {
    if (!selectedDate) return [];
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    return osByDate.get(dateStr) || [];
  }, [selectedDate, osByDate]);

   const Footer = () => {
        if (!selectedDate) {
            return <p className="text-center text-muted mt-3">Selecione uma data no calendário para ver as OS.</p>;
        }
        return (
            <div className="mt-4">
                <h3 className="h5 mb-3">
                    Ordens de Serviço para {format(selectedDate, 'dd/MM/yyyy', { locale: ptBR })}
                </h3>
                {selectedDayOS.length > 0 ? (
                    <div className="list-group">
                        {selectedDayOS.map(os => (
                            <Link key={os.id} href={`/os/${os.id}`} className={`list-group-item list-group-item-action flex-column align-items-start border-start border-4 border-${getStatusColor(os.status)}`}>
                                <div className="d-flex w-100 justify-content-between">
                                    <h5 className="mb-1 h6 text-primary">{os.projeto} <span className="text-muted small fw-normal">(OS: {os.numero})</span></h5>
                                    <small className={`text-${getStatusColor(os.status)} d-flex align-items-center`}>
                                        {os.dataFinalizacao && isSameDay(selectedDate, parseISO(os.dataFinalizacao)) ? <CheckCircle size={14} className="me-1"/> : <Clock size={14} className="me-1"/>}
                                        {os.status}
                                    </small>
                                </div>
                                <p className="mb-1 small text-muted">Cliente: {os.cliente}</p>
                                {os.parceiro && <p className="mb-0 small text-muted">Parceiro: {os.parceiro}</p>}
                            </Link>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-muted">Nenhuma OS encontrada para esta data.</p>
                )}
            </div>
        );
    };

   if (!isHydrated) {
       return (
          <AuthenticatedLayout>
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
                   <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Carregando calendário...</span>
                   </div>
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

        <div className="card shadow-sm">
             <div className="card-body d-flex flex-column flex-md-row align-items-start p-lg-4">
                 {/* Calendar */}
                 <div className="w-100 w-md-auto mx-auto mb-4 mb-md-0 me-md-4 d-flex justify-content-center">
                     <DayPicker
                        mode="single"
                        selected={selectedDate}
                        onSelect={(day) => handleDayClick(day!, modifiers)} // Pass modifiers to handler
                        month={currentMonth}
                        onMonthChange={setCurrentMonth}
                        locale={ptBR}
                        showOutsideDays
                        fixedWeeks
                        modifiers={modifiers}
                        modifiersStyles={modifiersStyles}
                        captionLayout="dropdown-buttons"
                        fromYear={2020}
                        toYear={new Date().getFullYear() + 2}
                        className="border rounded p-3 bg-light shadow-sm"
                        classNames={{
                            caption_label: 'fs-6 fw-medium',
                            nav_button: 'btn btn-sm btn-outline-secondary border-0',
                            day: 'btn btn-sm border-0 rounded-circle',
                            day_today: 'fw-bold text-primary bg-primary-subtle', // Highlight today
                            // Modifiers handled by modifiersStyles prop mostly
                            // day_selected: handled by modifiersStyles
                            // day_scheduled: handled by modifiersStyles
                            // day_finalized: handled by modifiersStyles
                         }}
                    />
                 </div>

                 {/* Selected Day Details */}
                 <div className="flex-grow-1 w-100">
                      {/* Legend */}
                     <div className="mb-3 d-flex justify-content-center justify-content-md-start gap-3 small text-muted">
                         <span className="d-inline-flex align-items-center">
                             <span className="d-inline-block border border-2 border-info rounded-circle me-1" style={{ width: '1rem', height: '1rem' }}></span> Programada
                         </span>
                         <span className="d-inline-flex align-items-center">
                             <span className="d-inline-block border border-2 border-success rounded-circle me-1" style={{ width: '1rem', height: '1rem' }}></span> Finalizada
                         </span>
                         <span className="d-inline-flex align-items-center">
                            <span className="d-inline-block bg-primary rounded-circle me-1" style={{ width: '1rem', height: '1rem' }}></span> Selecionada
                         </span>
                     </div>
                    <Footer />
                 </div>
            </div>
             <div className="card-footer text-muted small d-flex align-items-center">
                 <Info size={14} className="me-2"/> Datas com borda azul indicam OS programadas. Datas com borda verde indicam OS finalizadas.
            </div>
        </div>
    </AuthenticatedLayout>
  );
}
