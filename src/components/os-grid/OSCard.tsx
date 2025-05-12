
'use client';

import Link from 'next/link';
import type { OS } from '@/lib/types';
import { OSStatus, ALL_OS_STATUSES } from '@/lib/types';
import { CalendarClock, Flag, Copy, AlertTriangle, CheckCircle2, Clock, Server, Users, FileText, User, Briefcase } from 'lucide-react'; // Using lucide-react icons, added Briefcase
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useOSStore } from '@/store/os-store';
import { useTheme } from '@/hooks/useTheme'; // Import useTheme

interface OSCardProps {
  os: OS;
}

// Helper to get Bootstrap text/border color classes based on status
const getStatusClass = (status: OSStatus, isUrgent: boolean): string => {
  if (isUrgent) return 'border-danger text-danger-emphasis'; // Urgent takes precedence, using emphasis for dark mode contrast

  switch (status) {
    case OSStatus.NA_FILA: return 'border-secondary text-secondary-emphasis';
    case OSStatus.AGUARDANDO_CLIENTE: return 'border-warning text-warning-emphasis';
    case OSStatus.EM_PRODUCAO: return 'border-info text-info-emphasis';
    case OSStatus.AGUARDANDO_PARCEIRO: return 'border-primary text-primary-emphasis';
    case OSStatus.FINALIZADO: return 'border-success text-success-emphasis';
    default: return 'border-secondary text-secondary-emphasis';
  }
};

// Helper for background color for urgent badge/card body
const getUrgentBgClass = (isUrgent: boolean, theme: 'light' | 'dark'): string => {
    if (!isUrgent) return '';
    // Use subtle background for better readability in both themes
    return theme === 'dark' ? 'bg-danger-subtle text-dark' : 'bg-danger-subtle';
};


const getStatusIcon = (status: OSStatus) => {
  switch (status) {
    case OSStatus.NA_FILA: return <Clock size={14} className="me-1" />;
    case OSStatus.AGUARDANDO_CLIENTE: return <User size={14} className="me-1" />;
    case OSStatus.EM_PRODUCAO: return <Server size={14} className="me-1" />;
    case OSStatus.AGUARDANDO_PARCEIRO: return <Users size={14} className="me-1" />;
    case OSStatus.FINALIZADO: return <CheckCircle2 size={14} className="me-1" />;
    default: return <FileText size={14} className="me-1" />;
  }
};


export default function OSCard({ os }: OSCardProps) {
  const { updateOSStatus, toggleUrgent, duplicateOS } = useOSStore();
  const { theme } = useTheme();

  const statusClass = getStatusClass(os.status, os.isUrgent);
  const urgentBgClass = getUrgentBgClass(os.isUrgent, theme);

  // Base card classes with transition for hover effect
  // Added text-wrap to card-body to help with wrapping
  const cardClasses = `card h-100 shadow-sm border-start border-4 ${statusClass} ${urgentBgClass} transition-shadow duration-200 ease-in-out`;
  const hoverEffectClass = "hover-lift";

  const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = event.target.value as OSStatus;
    updateOSStatus(os.id, newStatus);
    console.log(`OS "${os.projeto}" movida para ${newStatus}.`);
  };

  const handleToggleUrgent = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleUrgent(os.id);
  };

  const handleDuplicateOS = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    duplicateOS(os.id);
  };

  // Helper to truncate text safely
  const truncateText = (text: string | undefined | null, maxLength: number = 50): string => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };


  return (
    <Link href={`/os/${os.id}`} passHref legacyBehavior>
        <a className={`text-decoration-none text-reset d-block h-100 ${hoverEffectClass}`}>
            <div className={cardClasses}>
                <div className="card-header p-2 pb-1"> {/* Reduced padding */}
                    <div className="d-flex justify-content-between align-items-center mb-1">
                        {/* OS Number */}
                        <span className="fw-bold text-primary small font-monospace">OS: {os.numero}</span>
                        {/* Urgent Badge */}
                        {os.isUrgent && (
                            <span className="badge bg-danger text-white px-1 py-0 small d-flex align-items-center">
                                <AlertTriangle size={12} className="me-1" /> Urgente
                            </span>
                        )}
                    </div>
                </div>
                <div className={`card-body p-2 pt-1 pb-2 d-flex flex-column text-wrap ${urgentBgClass}`}> {/* Added text-wrap and urgent bg */}
                    {/* Client */}
                    <div className="mb-1" title={`Cliente: ${os.cliente}`}>
                        <User size={14} className="me-1 text-muted align-middle" />
                        <span className="fw-medium small text-break">{truncateText(os.cliente, 30)}</span>
                    </div>
                    {/* Partner (if exists) */}
                    {os.parceiro && (
                        <div className="mb-1" title={`Parceiro: ${os.parceiro}`}>
                            <Users size={14} className="me-1 text-muted align-middle" />
                            <span className="text-muted small text-break">{truncateText(os.parceiro, 30)}</span>
                        </div>
                    )}
                    {/* Tarefa */}
                    <div className="mb-2" title={`Tarefa: ${os.tarefa}`}>
                        <Briefcase size={14} className="me-1 text-muted align-middle" />
                        <span className="small text-muted fst-italic text-break">{truncateText(os.tarefa, 40)}</span>
                    </div>

                    {/* Abertura Date */}
                    <div className="text-muted small d-flex align-items-center mb-2 mt-auto pt-1 border-top"> {/* Push date/status down */}
                         <CalendarClock size={14} className="me-1 flex-shrink-0" />
                         <span className="text-truncate">
                            Aberto em: {format(parseISO(os.dataAbertura), "dd/MM/yy HH:mm", { locale: ptBR })}
                         </span>
                    </div>

                    {/* Status Dropdown */}
                    <div className="mb-0"> {/* Reduced margin */}
                         <select
                            className={`form-select form-select-sm ${statusClass.replace('text-', 'border-')}`} // Use border color for select
                            value={os.status}
                            onChange={handleStatusChange}
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }} // Prevent link navigation
                            aria-label="Mudar status da OS"
                            style={{ fontSize: '0.75rem' }} // smaller text
                        >
                            {ALL_OS_STATUSES.map(s => (
                            <option key={s} value={s}>
                                {s}
                            </option>
                            ))}
                        </select>
                    </div>
                </div>
                 <div className="card-footer p-2 border-top bg-light-subtle"> {/* Use subtle background */}
                    <div className="d-flex flex-column gap-1">
                         {/* Urgent Button */}
                        <button
                            className={`btn ${os.isUrgent ? 'btn-danger' : 'btn-outline-danger'} btn-sm w-100 d-flex align-items-center justify-content-center`}
                            onClick={handleToggleUrgent}
                            style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }} // smaller button
                        >
                            <Flag size={14} className="me-1" /> {os.isUrgent ? "Urgente!" : "Marcar Urgente"}
                        </button>
                         {/* Duplicate Button */}
                         <button
                            className="btn btn-outline-secondary btn-sm w-100 d-flex align-items-center justify-content-center"
                            onClick={handleDuplicateOS}
                            style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }} // smaller button
                        >
                            <Copy size={14} className="me-1" /> Duplicar
                        </button>
                    </div>
                </div>
            </div>
        </a>
    </Link>
  );
}
