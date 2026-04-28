export function formatKilograms(valueKg: number): string {
  return `${Math.round(valueKg).toLocaleString('en-US')} kg`;
}

export function formatTons(valueKg: number): string {
  const tons = valueKg / 1000;
  return `${tons.toFixed(1)} t`;
}

export function formatMinutes(valueMinutes: number): string {
  return `${Math.round(valueMinutes)} min`;
}

export function formatShortMonthDay(isoDate: string): { month: string; day: string } {
  const date = new Date(isoDate);
  return {
    month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
    day: date.toLocaleDateString('en-US', { day: '2-digit' }),
  };
}

export function formatMonthYear(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}
