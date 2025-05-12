
'use client';

import Link from 'next/link';
import type { OS } from '@/lib/types';
import { OSStatus, ALL_OS_STATUSES } from '@/lib/types';
import { CalendarClock, Flag, Copy, AlertTriangle, CheckCircle2, Clock, Server, Users, FileText, User } from 'lucide-react'; // Using lucide-react icons
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useOSStore } from '@/store/os-store';
// Removed useToast import

interface OSCardProps {
  os: OS;
}

// Helper to get Bootstrap text/border color classes based on status
const getStatusClass = (status: OSStatus, isUrgent: boolean): string => {
  if (isUrgent) return 'border-danger text-danger'; // Urgent takes precedence

  switch (status) {
    case OSStatus.NA_FILA: return 'border-secondary text-secondary';
    case OSStatus.AGUARDANDO_CLIENTE: return 'border-warning text-warning-emphasis';
    case OSStatus.EM_PRODUCAO: return 'border-info text-info-emphasis';
    case OSStatus.AGUARDANDO_PARCEIRO: return 'border-primary text-primary-emphasis'; // Example: using primary for partner
    case OSStatus.FINALIZADO: return 'border-success text-success-emphasis';
    default: return 'border-secondary text-secondary';
  }
};

// Helper for background color for urgent badge
const getUrgentBgClass = (isUrgent: boolean): string => {
    return isUrgent ? 'bg-danger-subtle' : '';
};

const getStatusIcon = (status: OSStatus) => {
    // Using Bootstrap Icons class names potentially, or keeping Lucide
    // Using Lucide for consistency for now
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
  // Removed toast related code

  const statusClass = getStatusClass(os.status, os.isUrgent);
  const urgentBgClass = getUrgentBgClass(os.isUrgent);

  const cardClasses = `card h-100 shadow-sm hover-shadow transition-shadow duration-200 border-start border-4 ${statusClass} ${urgentBgClass}`;

  const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = event.target.value as OSStatus;
    updateOSStatus(os.id, newStatus);
    // Removed status update toast
    console.log(`OS "${os.projeto}" movida para ${newStatus}.`);
  };

  const handleToggleUrgent = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent link navigation when clicking the button
    e.stopPropagation();
    toggleUrgent(os.id);
  };

  const handleDuplicateOS = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent link navigation
    e.stopPropagation();
    duplicateOS(os.id);
  };

  return (
    // Wrap the entire card content in a Link
    <Link href={`/os/${os.id}`} passHref legacyBehavior>
        <a className="text-decoration-none text-reset d-block h-100">
            <div className={cardClasses}>
                <div className="card-header p-3 pb-2">
                    <div className="d-flex justify-content-between align-items-start mb-1">
                        <span className="fw-semibold text-primary small">OS: {os.numero}</span>
                        {os.isUrgent && (
                        <span className="badge bg-danger text-white px-1 py-0 small d-flex align-items-center">
                            <AlertTriangle size={12} className="me-1" /> Urgente
                        </span>
                        )}
                    </div>
                    <div className="d-flex justify-content-between align-items-baseline">
                        <p className="card-title fs-6 fw-medium mb-0 text-truncate" title={os.cliente}>{os.cliente}</p>
                        <p className="text-muted small ms-2 text-truncate flex-shrink-0" title={os.projeto}>{os.projeto}</p>
                    </div>
                    {os.parceiro && (
                        <p className="card-subtitle small text-muted mt-1 mb-0">Parceiro: {os.parceiro}</p>
                    )}
                </div>
                <div className="card-body p-3 pt-2 pb-2 d-flex flex-column">
                    <div className="text-muted small d-flex align-items-center mb-2">
                         <CalendarClock size={14} className="me-1 flex-shrink-0" />
                         <span className="text-truncate">
                            Abertura: {format(parseISO(os.dataAbertura), "dd/MM/yy HH:mm", { locale: ptBR })}
                         </span>
                    </div>

                    <div className="mb-3">
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
                                {/* Icon text is tricky in option, maybe skip or use unicode */}
                                {s}
                            </option>
                            ))}
                        </select>
                    </div>
                    {/* Moved Buttons to Footer */}
                </div>
                 <div className="card-footer p-2 border-top bg-light">
                    <div className="d-flex flex-column gap-1">
                         {/* Buttons */}
                        <button
                            className={`btn ${os.isUrgent ? 'btn-danger' : 'btn-outline-danger'} btn-sm w-100 d-flex align-items-center justify-content-center`}
                            onClick={handleToggleUrgent}
                            style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }} // smaller button
                        >
                            <Flag size={14} className="me-1" /> {os.isUrgent ? "Urgente!" : "Marcar Urgente"}
                        </button>
                         <button
                            className="btn btn-outline-secondary btn-sm w-100 d-flex align-items-center justify-content-center"
                            onClick={handleDuplicateOS}
                            style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }} // smaller button
                        >
                            <Copy size={14} className="me-1" /> Duplicar
                        </button>
                         {/* Removed View Details Button */}
                    </div>
                </div>
            </div>
        </a>
    </Link>
  );
}
