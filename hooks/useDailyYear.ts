'use client';

import { useState, useEffect } from 'react';
import { generateNewDailyYear, getArchiveData } from '@/utils/archiveManager';

// Define the range of years to use for challenges
const MIN_YEAR = 1960;
const MAX_YEAR = 2020;
const STORAGE_KEY = 'doubleFeature_dailyYear';

interface UseDailyYearResult {
  dailyYear: number | null;
  timeUntilReset: string;
  isLoading: boolean;
  error: string | null;
}

export function useDailyYear(): UseDailyYearResult {
  const [dailyYear, setDailyYear] = useState<number | null>(null);
  const [timeUntilReset, setTimeUntilReset] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Generate a deterministic year based on the current date
  const generateDailyYear = () => {
    try {
      // Get current date in UTC
      const now = new Date();
      const utcDay = now.getUTCDate();
      const utcMonth = now.getUTCMonth();
      const utcYear = now.getUTCFullYear();
      
      // Create a date string in format YYYY-MM-DD for consistent hashing
      const dateString = `${utcYear}-${utcMonth + 1}-${utcDay}`;
      
      // Create a simple hash from the date string
      let hash = 0;
      for (let i = 0; i < dateString.length; i++) {
        hash = ((hash << 5) - hash) + dateString.charCodeAt(i);
        hash |= 0; // Convert to 32bit integer
      }
      
      // Use the hash to generate a year within our range
      const yearRange = MAX_YEAR - MIN_YEAR + 1;
      const yearOffset = Math.abs(hash) % yearRange;
      const generatedYear = MIN_YEAR + yearOffset;
      
      return generatedYear;
    } catch (err) {
      console.error('Error generating daily year:', err);
      // Fallback to a random year if something goes wrong
      return MIN_YEAR + Math.floor(Math.random() * (MAX_YEAR - MIN_YEAR + 1));
    }
  };

  // Calculate time until next reset (midnight UTC)
  const calculateTimeUntilReset = () => {
    const now = new Date();
    const tomorrow = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + 1,
      0, 0, 0, 0
    ));
    
    const diffMs = tomorrow.getTime() - now.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${diffHrs}h ${diffMins}m`;
  };

  // Update the time until reset every minute
  useEffect(() => {
    const updateTimeUntilReset = () => {
      setTimeUntilReset(calculateTimeUntilReset());
    };
    
    // Initial calculation
    updateTimeUntilReset();
    
    // Update every minute
    const interval = setInterval(updateTimeUntilReset, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Load or generate the daily year
  useEffect(() => {
    const loadDailyYear = () => {
      setIsLoading(true);
      
      try {
        if (typeof window === 'undefined') {
          // For SSR, just use a placeholder
          setDailyYear(2000);
          setIsLoading(false);
          return;
        }
        
        // Check if we have a stored year and date
        const storedData = localStorage.getItem(STORAGE_KEY);
        
        if (storedData) {
          const { year, date } = JSON.parse(storedData);
          
          // Check if the stored date is still today (in UTC)
          const now = new Date();
          const today = `${now.getUTCFullYear()}-${now.getUTCMonth() + 1}-${now.getUTCDate()}`;
          
          if (date === today) {
            // Use the stored year if it's still the same day
            setDailyYear(year);
            setIsLoading(false);
            return;
          }
        }
        
        // Generate a new year for today
        const newYear = generateDailyYear();
        const now = new Date();
        const today = `${now.getUTCFullYear()}-${now.getUTCMonth() + 1}-${now.getUTCDate()}`;
        
        // Store the new year and date
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ year: newYear, date: today }));
        
        setDailyYear(newYear);
      } catch (err) {
        console.error('Error loading daily year:', err);
        setError('Failed to generate today\'s challenge. Please refresh the page.');
        
        // Fallback to a random year
        setDailyYear(MIN_YEAR + Math.floor(Math.random() * (MAX_YEAR - MIN_YEAR + 1)));
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDailyYear();
  }, []);

  return {
    dailyYear,
    timeUntilReset,
    isLoading,
    error
  };
} 