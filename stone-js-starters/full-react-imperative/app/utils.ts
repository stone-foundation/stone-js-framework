import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

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

/**
 * Get the time from now
 *
 * @param date - Date in milliseconds
 * @returns The time from now
 */
export const dateTimeFromNow = (date: number): string => {
  return dayjs(date).fromNow()
}
