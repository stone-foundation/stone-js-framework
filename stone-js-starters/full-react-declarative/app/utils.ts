
/**
 * Format date time
 *
 * @param date - Date in milliseconds
 * @returns The formatted date time
 */
export const formatDateTime = (date: number): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(date)
}
