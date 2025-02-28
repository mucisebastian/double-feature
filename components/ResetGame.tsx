'use client';

import { useCallback } from 'react';

interface ResetGameProps {
  className?: string;
}

export function ResetGame({ className = '' }: ResetGameProps) {
  const handleReset = useCallback(() => {
    try {
      // Get the current daily year from localStorage
      const dailyYearData = localStorage.getItem('doubleFeature_dailyYear');
      let dailyYear = null;
      
      if (dailyYearData) {
        try {
          const { year } = JSON.parse(dailyYearData);
          dailyYear = year;
        } catch (err) {
          console.error('Error parsing daily year:', err);
        }
      }
      
      // Clear specific keys for the current daily year
      if (dailyYear) {
        localStorage.removeItem(`doubleFeature_movie_${dailyYear}`);
        localStorage.removeItem(`doubleFeature_album_${dailyYear}`);
      }
      
      // Clear any other game-related keys
      const keysToRemove = [];
      
      // Find all keys that start with 'doubleFeature_'
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('doubleFeature_') && key !== 'doubleFeature_dailyYear') {
          keysToRemove.push(key);
        }
      }
      
      // Remove all found keys
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });
      
      // Force a complete page reload
      window.location.reload();
    } catch (err) {
      console.error('Error resetting game:', err);
      // Fallback: force reload anyway
      window.location.reload();
    }
  }, []);

  return (
    <button
      onClick={handleReset}
      className={`py-3 px-6 rounded-full font-medium w-full transition-colors ${className}`}
    >
      Play Again
    </button>
  );
} 