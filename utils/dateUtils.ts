import { format } from 'date-fns';
import { isSameDay as dateFnsIsSameDay } from 'date-fns';

/**
 * Formats a date into a readable string format
 * @param date The date to format
 * @returns Formatted date string (e.g., "January 1, 2023")
 */
export const formatDate = (date: Date): string => {
  return format(date, 'MMMM d, yyyy');
};

/**
 * Checks if two dates are the same day
 * @param date1 First date to compare
 * @param date2 Second date to compare
 * @returns True if the dates are the same day, false otherwise
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return dateFnsIsSameDay(date1, date2);
};

/**
 * Gets the date string in YYYY-MM-DD format for API calls and storage
 * @param date The date to format
 * @returns Date string in YYYY-MM-DD format
 */
export const getDateString = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
}; 