/**
 * Simple date formatting utility function
 * @param dateString - The date string to format
 * @returns Formatted date string in the format DD/MM/YYYY
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
};
