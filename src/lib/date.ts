export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDays(base: Date, amount: number): Date {
  const next = new Date(base);
  next.setDate(base.getDate() + amount);
  return next;
}

export function formatDateLabel(date: Date): string {
  return date.toLocaleDateString('es-ES', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  });
}

export function formatDateTime(value?: string): string {
  if (!value) return 'Sin guardar';
  const date = new Date(value);
  return date.toLocaleString('es-ES', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}
