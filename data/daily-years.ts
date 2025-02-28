/**
 * Daily year generation for Double Feature
 * 
 * This module handles the generation of a consistent daily year
 * that resets at midnight UTC for all users.
 */

// Range of years to select from
const MIN_YEAR = 1960;
const MAX_YEAR = 2023;

/**
 * Generates a pseudorandom number based on a seed
 * @param seed - The seed for the random number generator
 * @returns A number between 0 and 1
 */
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/**
 * Gets the current date in YYYY-MM-DD format at UTC
 * @returns Date string in YYYY-MM-DD format
 */
function getDateString(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Generates a daily year that is consistent for all users
 * and resets at midnight UTC
 * 
 * @returns A year between MIN_YEAR and MAX_YEAR
 */
export function getDailyYear(): number {
  try {
    // Use the current date as seed
    const dateString = getDateString();
    
    // Create a numeric seed from the date string
    let seed = 0;
    for (let i = 0; i < dateString.length; i++) {
      seed += dateString.charCodeAt(i);
    }
    
    // Generate a random number between 0 and 1
    const random = seededRandom(seed);
    
    // Map to our year range
    const yearRange = MAX_YEAR - MIN_YEAR + 1;
    const year = MIN_YEAR + Math.floor(random * yearRange);
    
    return year;
  } catch (error) {
    console.error('Error generating daily year:', error);
    
    // For demo purposes, return 1997 as shown in the mockup
    return 1997;
  }
}

/**
 * Gets the next reset time (midnight UTC)
 * @returns Date object representing the next reset time
 */
export function getNextResetTime(): Date {
  const now = new Date();
  const tomorrow = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
    0, 0, 0, 0
  ));
  return tomorrow;
}

/**
 * Calculates time remaining until the next reset
 * @returns Object containing hours, minutes, and seconds until reset
 */
export function getTimeUntilReset(): { hours: number; minutes: number; seconds: number } {
  const now = new Date();
  const resetTime = getNextResetTime();
  
  const diffMs = resetTime.getTime() - now.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  
  const hours = Math.floor(diffSec / 3600);
  const minutes = Math.floor((diffSec % 3600) / 60);
  const seconds = diffSec % 60;
  
  return { hours, minutes, seconds };
} 