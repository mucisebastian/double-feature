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
        checkDailyReset();
        
        // Get current date
        const currentDate = new Date();
        setToday(currentDate);
        
        // Check if we're playing an archive challenge
        const dateParam = searchParams?.get('date');
        const yearParam = searchParams?.get('year');
        
        if (dateParam) {
          // This is an archive game
          setIsArchiveGame(true);
          setArchiveDate(dateParam);
          
          if (yearParam) {
            // If year is provided in URL, use it
            setDailyYear(parseInt(yearParam));
          } else {
            // Otherwise, calculate it
            const archiveDate = new Date(dateParam);
            const year = getYearForDate(archiveDate);
            setDailyYear(year);
          }
          
          // Set today to the archive date for display purposes
          setToday(new Date(dateParam));
          
          // Archive games are always valid
          setIsYearUnique(true);
        } else {
          // This is today's challenge
          setIsArchiveGame(false);
          setArchiveDate(null);
          
          // Perform daily validation check
          const validationPassed = await performDailyValidation();
          
          if (!validationPassed) {
            // If validation fails, show an error but continue with the game
            console.error('Daily validation failed: Year may be a duplicate');
            // We don't set an error message to avoid disrupting the user experience
          }
          
          // Get today's challenge year
          const year = getTodaysYear();
          setDailyYear(year);
          
          // Validate that today's year doesn't exist in the archive
          const archiveYears = getArchiveYears();
          const isUnique = verifyYearUniqueness(year, archiveYears);
          setIsYearUnique(isUnique);
          
          if (!isUnique) {
            console.error('Today\'s year already exists in the archive!', year);
            // We still show the game, but log the error
          }
        }
        
        // Get archive data to determine challenge number
        const archiveData = await getArchiveData();
        
        // Calculate challenge number
        if (!isArchiveGame) {
          // For today's challenge, it's the total number of challenges so far
          setChallengeNumber(archiveData.length + 1);
        } else if (archiveDate) {
          // For archive challenges, find its position in the archive
          const index = archiveData.findIndex(entry => entry.date === archiveDate);
          if (index !== -1) {
            setChallengeNumber(archiveData.length - index);
          }
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching daily year:', err);
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