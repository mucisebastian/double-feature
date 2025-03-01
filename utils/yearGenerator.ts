import { SEED_DATE, INITIAL_YEARS, CANDIDATE_YEARS, USED_YEARS, YEAR_HISTORY } from '@/data/archive-data';

/**
 * Simple seeded random number generator
 * @param seed A string seed for the random number generator
 * @returns A function that generates a random number between 0 and 1
 */
const seedRandom = (seed: string) => {
  // Simple hash function to convert seed string to number
  const hash = seed.split('').reduce((acc, char) => {
    return ((acc << 5) - acc) + char.charCodeAt(0);
  }, 0);
  
  // LCG parameters
  const m = 2**31 - 1;
  const a = 1103515245;
  const c = 12345;
  
  let state = hash;
  
  return () => {
    state = (a * state + c) % m;
    return state / m;
  };
};

/**
 * Shuffles an array using a seeded random number generator
 * @param array The array to shuffle
 * @param seed The seed for the random number generator
 * @returns A new shuffled array
 */
const seededShuffle = <T>(array: T[], seed: string): T[] => {
  const rng = seedRandom(seed);
  const result = [...array];
  
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  
  return result;
};

// In-memory cache of generated years to ensure no duplicates within a session
const generatedYears = new Map<string, number>();

// Track fallback attempts to prevent infinite loops
const fallbackAttempts = new Map<string, number>();
const MAX_FALLBACK_ATTEMPTS = 5;

/**
 * Gets a fallback year that's not in the archive
 * @param archiveYears Array of years already in the archive
 * @param targetDate The date for which we need a fallback year
 * @returns A year not in the archive
 */
const getFallbackYear = (archiveYears: number[] = [], targetDate: string): number => {
  // Get current attempt count
  const attempts = fallbackAttempts.get(targetDate) || 0;
  fallbackAttempts.set(targetDate, attempts + 1);
  
  // If we've tried too many times, just use a fixed formula
  if (attempts >= MAX_FALLBACK_ATTEMPTS) {
    // Use date components to generate a deterministic but likely unique year
    const dateComponents = targetDate.split('-').map(Number);
    const sum = dateComponents.reduce((a, b) => a + b, 0);
    return 1970 + (sum % 55); // Years between 1970-2024
  }
  
  // Try to find a year not in the archive
  const allYears = Array.from({length: 55}, (_, i) => 1970 + i);
  const availableYears = allYears.filter(y => !archiveYears.includes(y));
  
  if (availableYears.length > 0) {
    // Use a hash of the date to pick a deterministic year
    const dateHash = targetDate.split('').reduce((acc, char) => {
      return ((acc << 5) - acc) + char.charCodeAt(0);
    }, 0);
    return availableYears[Math.abs(dateHash) % availableYears.length];
  }
  
  // If somehow all years are used (shouldn't happen), use a simple formula
  const dateHash = targetDate.split('').reduce((acc, char) => {
    return ((acc << 5) - acc) + char.charCodeAt(0);
  }, 0);
  return 1970 + (Math.abs(dateHash) % 55);
};

/**
 * Gets the challenge year for a specific date
 * @param targetDate The date to get the challenge year for (YYYY-MM-DD format)
 * @param archiveYears Optional array of years to avoid (for fallback)
 * @returns The challenge year for the given date
 */
export const getChallengeYear = (targetDate: string, archiveYears?: number[]): number => {
  // Check if we've already generated this date in this session
  if (generatedYears.has(targetDate)) {
    return generatedYears.get(targetDate)!;
  }
  
  // Check if the date is in the initial years
  if (INITIAL_YEARS[targetDate]) {
    const year = INITIAL_YEARS[targetDate];
    generatedYears.set(targetDate, year);
    return year;
  }
  
  try {
    // Generate deterministic sequence for subsequent dates
    const shuffledYears = seededShuffle(CANDIDATE_YEARS, SEED_DATE);
    
    // Calculate days since seed date for linear progression
    const startDate = new Date(SEED_DATE);
    const currentDate = new Date(targetDate);
    const daysSinceStart = Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
    
    // Filter out any years that have been used since this algorithm started
    const availableYears = shuffledYears.filter(y => !Array.from(generatedYears.values()).includes(y));
    
    // If we have archive years, also filter those out
    const finalYears = archiveYears ? 
      availableYears.filter(y => !archiveYears.includes(y)) : 
      availableYears;
    
    // If we have no years left, use fallback
    if (finalYears.length === 0) {
      const fallbackYear = getFallbackYear(archiveYears, targetDate);
      generatedYears.set(targetDate, fallbackYear);
      return fallbackYear;
    }
    
    // Use daysSinceStart for index instead of modulo cycling
    const yearIndex = Math.max(0, daysSinceStart) % finalYears.length;
    const selectedYear = finalYears[yearIndex];
    
    // Double-check against used years
    if (USED_YEARS.has(selectedYear) || (archiveYears && archiveYears.includes(selectedYear))) {
      console.warn('Year collision detected, using fallback', selectedYear);
      const fallbackYear = getFallbackYear(archiveYears, targetDate);
      generatedYears.set(targetDate, fallbackYear);
      return fallbackYear;
    }
    
    // Store the generated year to ensure no duplicates
    generatedYears.set(targetDate, selectedYear);
    return selectedYear;
  } catch (error) {
    console.error('Error generating challenge year:', error);
    // Use fallback in case of any errors
    const fallbackYear = getFallbackYear(archiveYears, targetDate);
    generatedYears.set(targetDate, fallbackYear);
    return fallbackYear;
  }
};

/**
 * Gets the challenge year for today
 * @returns The challenge year for today
 */
export const getTodaysChallengeYear = (): number => {
  const today = new Date();
  const dateString = today.toISOString().split('T')[0]; // YYYY-MM-DD format
  return getChallengeYear(dateString);
};

/**
 * Verifies that a year doesn't exist in the archive
 * @param year The year to verify
 * @param archiveYears Array of years from the archive
 * @returns True if the year is unique, false if it exists in the archive
 */
export const verifyYearUniqueness = (year: number, archiveYears: number[]): boolean => {
  return !archiveYears.includes(year);
};

/**
 * Generates archive data for a specified number of days
 * @param days Number of days to generate archive data for
 * @returns Array of archive entries with date and year
 */
export const generateArchiveData = (days: number = 30): Array<{date: string, year: number}> => {
  const today = new Date();
  const archive = [];
  const usedYears: number[] = [];
  
  for (let i = 1; i <= days; i++) { // Start from yesterday (i=1) to avoid including today
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().split('T')[0];
    
    // Pass already used years to avoid duplicates
    const year = getChallengeYear(dateString, usedYears);
    usedYears.push(year);
    
    archive.push({
      date: dateString,
      year
    });
  }
  
  return archive;
}; 