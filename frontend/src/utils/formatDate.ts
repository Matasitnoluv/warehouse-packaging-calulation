/**
 * Simple date formatting utility function
 * @param dateString - The date string to format
 * @returns Formatted date string in the format DD/MM/YYYY
 */
export const formatDate = (date?: Date | string): string => {
  if (!date) return '-';

  const d = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(d.getTime())) return '-';
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
};
