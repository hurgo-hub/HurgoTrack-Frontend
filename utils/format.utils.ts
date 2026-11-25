import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const currencyFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/** Formatea un número como moneda colombiana */
export const formatCurrency = (amount: number | string): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return currencyFormatter.format(Number.isFinite(numAmount) ? numAmount : 0);
};

/** Formatea una fecha ISO a formato legible */
export const formatDate = (dateString: string, formatStr: string = 'dd MMM yyyy, HH:mm'): string => {
  try {
    return format(parseISO(dateString), formatStr, { locale: es });
  } catch {
    return dateString;
  }
};

/** Formatea un número de teléfono colombiano: 300 123 4567 */
export const formatPhone = (phone: string): string => {
  if (!phone || phone.length !== 10) return phone;
  return `${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6)}`;
};

export const formatNumber = (num: number | string): string => {
  const numValue = typeof num === 'string' ? parseFloat(num) : num;
  return numValue.toLocaleString('es-CO');
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
};

/** "Hace 5 minutos", "Hace 2 horas"… */
export const timeAgo = (date: string): string => {
  const diffMs = Date.now() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Hace unos momentos';
  if (diffMins < 60) return `Hace ${diffMins} ${diffMins === 1 ? 'minuto' : 'minutos'}`;
  if (diffHours < 24) return `Hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
  return `Hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;
};

export const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};
