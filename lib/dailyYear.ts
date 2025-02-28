import { startOfDay, addDays, differenceInDays, addHours } from 'date-fns';

// Seed date for consistent daily year generation
const SEED_DATE = new Date('2025-02-20');
// Range of years to generate from (inclusive)
const MIN_YEAR = 1970;
const MAX_YEAR = 2024;
const YEAR_RANGE = MAX_YEAR - MIN_YEAR + 1;

// Local storage key for caching
const DAILY_YEAR_KEY = 'doubleFeature_dailyYear';
const DAILY_YEAR_DATE_KEY = 'doubleFeature_dailyYearDate';

/**
 * Converts a date to EST (UTC-5) without using timezone libraries
 * Note: This is a simplified approach and doesn't account for DST changes
 */
function convertToEST(date: Date): Date {
  // EST is UTC-5 hours (simplified, not accounting for DST)
  const estOffset = -5;
  const utcOffset = date.getTimezoneOffset() / 60;
  
  // Calculate the difference between local time and EST
  const hoursDiff = utcOffset - estOffset;
  
  // Adjust the date to EST
  return addHours(date, -hoursDiff);
}

/**
 * Generates a daily year based on the current date in EST timezone
 * The year will change at 12am EST
 */
export function generateDailyYear(date?: Date): number {
  // Use provided date or current date
  const now = date || new Date();
  
  // Convert to EST timezone (simplified approach)
  const estDate = convertToEST(now);
  
  // Get start of day in EST
  const estStartOfDay = startOfDay(estDate);
  
  // Calculate days since seed date
  const daysSinceSeed = differenceInDays(estStartOfDay, SEED_DATE);
  
  // Use the day count to deterministically generate a year
  // This ensures the same year is generated all day, but changes at midnight EST
  const yearIndex = Math.abs(daysSinceSeed) % YEAR_RANGE;
  return MIN_YEAR + yearIndex;
}

/**
 * Gets the daily year, with caching to localStorage
 * This ensures the year doesn't change if the user refreshes the page
 * but will update when the date changes in EST timezone
 */
export function getDailyYear(): number {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return generateDailyYear();
  }
  
  try {
    // Get the cached date and year
    const cachedDateStr = localStorage.getItem(DAILY_YEAR_DATE_KEY);
    const cachedYear = localStorage.getItem(DAILY_YEAR_KEY);
    
    if (cachedDateStr && cachedYear) {
      const cachedDate = new Date(cachedDateStr);
      
      // Convert current date to EST
      const now = new Date();
      const estNow = convertToEST(now);
      const estStartOfDay = startOfDay(estNow);
      
      // Convert cached date to EST
      const estCachedDate = convertToEST(cachedDate);
      const estCachedStartOfDay = startOfDay(estCachedDate);
      
      // If it's still the same day in EST, use the cached year
      if (estStartOfDay.getTime() === estCachedStartOfDay.getTime()) {
        return parseInt(cachedYear, 10);
      }
    }
    
    // Generate a new daily year
    const newYear = generateDailyYear();
    
    // Cache the new year and current date
    localStorage.setItem(DAILY_YEAR_KEY, newYear.toString());
    localStorage.setItem(DAILY_YEAR_DATE_KEY, new Date().toISOString());
    
    return newYear;
  } catch (error) {
    // If localStorage is not available or there's an error, just generate the year
    console.error('Error accessing localStorage:', error);
    return generateDailyYear();
  }
} 