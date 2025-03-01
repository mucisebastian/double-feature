import { format, parseISO, subDays, isToday, isSameDay } from 'date-fns';
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';
import { generateArchiveData, getChallengeYear, verifyYearUniqueness } from './yearGenerator';

const EST_TIMEZONE = 'America/New_York';
const ARCHIVE_KEY = 'doubleFeatureArchive';
const LAST_PLAYED_KEY = 'lastPlayedDate';
const GAME_STATE_KEY = 'gameState';
const VALIDATION_KEY = 'archiveValidation';
const VALIDATION_ATTEMPTS_KEY = 'validationAttempts';

/**
 * Gets the current date in EST timezone
 * @returns Current date in EST timezone
 */
export const getCurrentDate = (): Date => {
  const now = new Date();
  return utcToZonedTime(now, EST_TIMEZONE);
};

/**
 * Formats a date as YYYY-MM-DD
 * @param date The date to format
 * @returns Formatted date string
 */
export const formatDateString = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

/**
 * Initializes the archive in localStorage if it doesn't exist
 */
export const initializeArchive = () => {
  if (typeof window === 'undefined') return;
  
  const stored = localStorage.getItem(ARCHIVE_KEY);
  if (!stored) {
    // Generate initial archive data for the past 30 days (excluding today)
    const archiveData = generateArchiveData(30);
    localStorage.setItem(ARCHIVE_KEY, JSON.stringify(archiveData));
  }
};

/**
 * Gets the archive data from localStorage
 * @returns Array of archive entries with date and year
 */
export const getArchiveData = (): Array<{ date: string; year: number; formattedDate: string }> => {
  if (typeof window === 'undefined') return [];
  
  initializeArchive();
  const stored = localStorage.getItem(ARCHIVE_KEY);
  if (!stored) return [];
  
  try {
    const data = JSON.parse(stored);
    
    // Handle both object and array formats
    if (Array.isArray(data)) {
      // Already in array format
      return data.map(entry => ({
        date: entry.date,
        year: entry.year,
        formattedDate: format(parseISO(entry.date), 'MMMM d, yyyy')
      }));
    } else if (typeof data === 'object') {
      // Convert from object format to array format
      return Object.entries(data)
        .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
        .map(([date, year]) => ({
          date,
          year: Number(year),
          formattedDate: format(parseISO(date), 'MMMM d, yyyy')
        }));
    }
    
    // If data is in an unexpected format, return empty array and reinitialize
    console.error('Archive data in unexpected format, reinitializing');
    localStorage.removeItem(ARCHIVE_KEY);
    initializeArchive();
    return getArchiveData();
  } catch (error) {
    console.error('Error parsing archive data:', error);
    // Reset archive data if there's an error
    localStorage.removeItem(ARCHIVE_KEY);
    initializeArchive();
    return getArchiveData();
  }
};

/**
 * Gets just the years from the archive for validation
 * @returns Array of years from the archive
 */
export const getArchiveYears = (): number[] => {
  const archiveData = getArchiveData();
  return archiveData.map(entry => entry.year);
};

/**
 * Checks if the daily challenge needs to be reset
 * Resets game state if it's a new day
 */
export const checkDailyReset = () => {
  if (typeof window === 'undefined') return;
  
  const estNow = getCurrentDate();
  const today = formatDateString(estNow);
  
  const lastPlayed = localStorage.getItem(LAST_PLAYED_KEY);
  
  if (lastPlayed !== today) {
    // It's a new day, reset game state
    localStorage.removeItem(GAME_STATE_KEY);
    localStorage.setItem(LAST_PLAYED_KEY, today);
    
    // Reset validation attempts for the new day
    localStorage.removeItem(VALIDATION_ATTEMPTS_KEY);
    
    // Update archive with yesterday's challenge (not today's)
    updateArchive();
  }
};

/**
 * Updates the archive with yesterday's challenge
 */
const updateArchive = () => {
  if (typeof window === 'undefined') return;
  
  const now = getCurrentDate();
  const yesterday = subDays(now, 1);
  const yesterdayString = formatDateString(yesterday);
  
  // Get current archive years to avoid duplicates
  const archiveYears = getArchiveYears();
  
  // Get yesterday's challenge year, passing archive years to avoid duplicates
  const year = getChallengeYear(yesterdayString, archiveYears);
  
  // Get current archive
  const archiveData = getArchiveData();
  
  // Check if yesterday's challenge is already in the archive
  const yesterdayInArchive = archiveData.some(entry => entry.date === yesterdayString);
  
  if (!yesterdayInArchive) {
    // Add yesterday's challenge to the archive
    archiveData.unshift({ 
      date: yesterdayString, 
      year, 
      formattedDate: format(parseISO(yesterdayString), 'MMMM d, yyyy') 
    });
    
    // Keep only the last 30 days
    const updatedArchive = archiveData.slice(0, 30);
    
    // Validate no duplicates in the archive
    const years = updatedArchive.map(entry => entry.year);
    const uniqueYears = new Set(years);
    
    if (uniqueYears.size !== years.length) {
      console.error('Duplicate year detected in archive!');
      // Log validation error
      localStorage.setItem(VALIDATION_KEY, JSON.stringify({
        error: 'Duplicate year detected',
        date: new Date().toISOString(),
        years
      }));
    }
    
    // Save updated archive
    localStorage.setItem(ARCHIVE_KEY, JSON.stringify(updatedArchive));
  }
};

/**
 * Validates that today's year doesn't exist in the archive
 * @returns True if today's year is unique, false if it exists in the archive
 */
export const validateTodaysYear = (): boolean => {
  const todaysYear = getTodaysYear();
  const archiveYears = getArchiveYears();
  return verifyYearUniqueness(todaysYear, archiveYears);
};

/**
 * Performs a daily validation check to ensure no duplicate years
 * @returns Promise that resolves to true if validation passes, false otherwise
 */
export const performDailyValidation = async (): Promise<boolean> => {
  if (typeof window === 'undefined') return true;
  
  try {
    // Check if we've already tried validation too many times today
    const attemptsStr = localStorage.getItem(VALIDATION_ATTEMPTS_KEY);
    const attempts = attemptsStr ? parseInt(attemptsStr) : 0;
    
    // If we've tried too many times, just return true to avoid infinite loops
    if (attempts >= 3) {
      console.warn('Skipping validation after too many attempts');
      return true;
    }
    
    // Increment and save attempts
    localStorage.setItem(VALIDATION_ATTEMPTS_KEY, (attempts + 1).toString());
    
    const today = formatDateString(getCurrentDate());
    const archiveYears = getArchiveYears();
    
    // Get today's year, passing archive years to avoid duplicates
    const todaysYear = getChallengeYear(today, archiveYears);
    
    // Check if today's year is in the archive
    const isUnique = verifyYearUniqueness(todaysYear, archiveYears);
    
    if (!isUnique) {
      console.error('System error: Duplicate year detected!', todaysYear);
      
      // Log validation error
      localStorage.setItem(VALIDATION_KEY, JSON.stringify({
        error: 'Today\'s year already exists in archive',
        date: new Date().toISOString(),
        year: todaysYear,
        archiveYears
      }));
      
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error during daily validation:', error);
    return true; // Return true on error to avoid blocking the game
  }
};

/**
 * Gets the challenge year for a specific date
 * @param date The date to get the challenge year for (Date object)
 * @returns The challenge year for the given date
 */
export const getYearForDate = (date: Date): number => {
  const dateString = formatDateString(date);
  const archiveYears = getArchiveYears();
  return getChallengeYear(dateString, archiveYears);
};

/**
 * Gets the challenge year for today
 * @returns The challenge year for today
 */
export const getTodaysYear = (): number => {
  const today = formatDateString(getCurrentDate());
  const archiveYears = getArchiveYears();
  return getChallengeYear(today, archiveYears);
}; 