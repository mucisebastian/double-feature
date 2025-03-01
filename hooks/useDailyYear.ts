'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  getArchiveData, 
  getTodaysYear, 
  checkDailyReset, 
  getYearForDate,
  validateTodaysYear,
  getArchiveYears,
  performDailyValidation
} from '@/utils/archiveManager';
import { format, parseISO } from 'date-fns';
import { verifyYearUniqueness } from '@/utils/yearGenerator';

// Define the ArchiveEntry interface
interface ArchiveEntry {
  date: string;
  year: number;
  formattedDate: string;
}

// Key for storing the current challenge number
const CHALLENGE_NUMBER_KEY = 'doubleFeature_challengeNumber';
const LAST_YEAR_KEY = 'doubleFeature_lastYear';

interface DailyYearResult {
  dailyYear: number | null;
  today: Date | null;
  isLoading: boolean;
  error: string | null;
  challengeNumber: number | null;
  isArchiveGame: boolean;
  archiveDate: string | null;
  isYearUnique: boolean;
}

export const useDailyYear = (): DailyYearResult => {
  const [dailyYear, setDailyYear] = useState<number | null>(null);
  const [today, setToday] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [challengeNumber, setChallengeNumber] = useState<number | null>(null);
  const [isArchiveGame, setIsArchiveGame] = useState(false);
  const [archiveDate, setArchiveDate] = useState<string | null>(null);
  const [isYearUnique, setIsYearUnique] = useState(true);
  
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchDailyYear = async () => {
      try {
        setIsLoading(true);
        
        // Check if we need to reset the daily challenge
        try {
          checkDailyReset();
        } catch (resetError) {
          console.warn('Error during daily reset check:', resetError);
          // Continue execution even if reset check fails
        }
        
        // Get current date
        const currentDate = new Date();
        setToday(currentDate);
        
        // Check if we're playing an archive challenge
        const dateParam = searchParams?.get('date');
        const yearParam = searchParams?.get('year');
        
        // Variable to store the year for this challenge
        let challengeYear: number = 2000; // Default fallback value
        
        if (dateParam) {
          // This is an archive game
          setIsArchiveGame(true);
          setArchiveDate(dateParam);
          
          try {
            if (yearParam) {
              // If year is provided in URL, use it
              challengeYear = parseInt(yearParam);
              setDailyYear(challengeYear);
            } else {
              // Otherwise, calculate it
              const archiveDate = new Date(dateParam);
              challengeYear = getYearForDate(archiveDate);
              setDailyYear(challengeYear);
            }
          } catch (archiveError) {
            console.error('Error getting archive year:', archiveError);
            // Fallback to a default year for archive games
            challengeYear = 2000;
            setDailyYear(challengeYear);
          }
          
          // Set today to the archive date for display purposes
          setToday(new Date(dateParam));
          
          // Archive games are always valid
          setIsYearUnique(true);
        } else {
          // This is today's challenge
          setIsArchiveGame(false);
          setArchiveDate(null);
          
          // Perform daily validation check with error handling
          try {
            await performDailyValidation();
          } catch (validationError) {
            console.warn('Error during daily validation:', validationError);
            // Continue execution even if validation fails
          }
          
          // Get today's challenge year with fallback
          try {
            challengeYear = getTodaysYear();
          } catch (yearError) {
            console.error('Error getting today\'s year:', yearError);
            // Fallback to a random year between 1970 and 2020
            challengeYear = 1970 + Math.floor(Math.random() * 51);
          }
          setDailyYear(challengeYear);
          
          // Validate that today's year doesn't exist in the archive
          try {
            const archiveYears = getArchiveYears();
            const isUnique = verifyYearUniqueness(challengeYear, archiveYears);
            setIsYearUnique(isUnique);
            
            if (!isUnique) {
              console.error('Today\'s year already exists in the archive!', challengeYear);
              // We still show the game, but log the error
            }
          } catch (uniqueError) {
            console.warn('Error checking year uniqueness:', uniqueError);
            // Assume it's unique if we can't check
            setIsYearUnique(true);
          }
        }
        
        // Get archive data to determine challenge number
        let archiveData: Array<ArchiveEntry> = [];
        try {
          archiveData = await getArchiveData();
        } catch (archiveDataError) {
          console.error('Error getting archive data:', archiveDataError);
          // Continue with empty archive data
        }
        
        // Calculate challenge number
        if (!isArchiveGame) {
          // For today's challenge, use stored challenge number or default to 14
          if (typeof window !== 'undefined') {
            try {
              const storedChallengeNumber = localStorage.getItem(CHALLENGE_NUMBER_KEY);
              const storedLastYear = localStorage.getItem(LAST_YEAR_KEY);
              
              let currentChallengeNumber = storedChallengeNumber ? parseInt(storedChallengeNumber) : 14;
              
              // If the year has changed since last time, increment the challenge number
              if (storedLastYear && storedLastYear !== String(challengeYear)) {
                currentChallengeNumber += 1;
                localStorage.setItem(CHALLENGE_NUMBER_KEY, String(currentChallengeNumber));
              }
              
              // Store the current year for next comparison
              localStorage.setItem(LAST_YEAR_KEY, String(challengeYear));
              
              setChallengeNumber(currentChallengeNumber);
            } catch (storageError) {
              console.error('Error accessing localStorage:', storageError);
              // Fallback to default challenge number
              setChallengeNumber(14);
            }
          } else {
            // Fallback for SSR
            setChallengeNumber(14);
          }
        } else if (archiveDate) {
          // For archive challenges, find its position in the archive
          try {
            const index = archiveData.findIndex(entry => entry.date === archiveDate);
            if (index !== -1) {
              setChallengeNumber(archiveData.length - index);
            } else {
              // Fallback if entry not found
              setChallengeNumber(1);
            }
          } catch (indexError) {
            console.error('Error finding archive index:', indexError);
            // Fallback to challenge #1
            setChallengeNumber(1);
          }
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching daily year:', err);
        // Set a fallback year and challenge number
        setDailyYear(2000);
        setChallengeNumber(14);
        setError('Failed to generate daily year. Please try again.');
        setIsLoading(false);
      }
    };

    fetchDailyYear();
  }, [searchParams, isArchiveGame, archiveDate]);

  return { 
    dailyYear, 
    today, 
    isLoading, 
    error, 
    challengeNumber, 
    isArchiveGame, 
    archiveDate,
    isYearUnique
  };
};

// Add default export to fix import issues
export default useDailyYear; 