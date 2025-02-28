import { useState, useEffect } from 'react';
import { getLocalStorage, setLocalStorage } from '@/utils/localStorage';

// Define the GameData interface
export interface GameData {
  year: number;
  date?: string;
  popularMovies?: string[];
  popularAlbums?: string[];
}

export function useGameData(yearOverride?: number | null) {
  const [data, setData] = useState<GameData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('useGameData effect running');
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // If we have a year override (e.g., from archive), use that
        if (yearOverride) {
          console.log('Using year override:', yearOverride);
          if (isMounted) {
            setData({ year: yearOverride });
            setLoading(false);
          }
          return;
        }
        
        // Check for cached data first
        const today = new Date().toISOString().split('T')[0];
        const cachedData = getLocalStorage(`gameData_${today}`, null);
        
        if (cachedData) {
          console.log('Using cached data:', cachedData);
          if (isMounted) {
            setData(cachedData);
            setLoading(false);
          }
          return;
        }
        
        // Generate a random year between 1960 and 2020
        // In a real app, this would come from an API
        const randomYear = Math.floor(Math.random() * (2020 - 1960 + 1)) + 1960;
        console.log('Generated random year:', randomYear);
        
        const newData = { 
          year: randomYear,
          date: today
        };
        
        // Cache the data
        setLocalStorage(`gameData_${today}`, newData);
        
        if (isMounted) {
          setData(newData);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error in useGameData:', err);
        if (isMounted) {
          setError('Failed to load game data. Please try again.');
          setLoading(false);
        }
      }
    };

    // Add a timeout to ensure loading state is shown for at least a short time
    // This prevents flickering UI and gives time for hydration
    const timeoutId = setTimeout(() => {
      fetchData();
    }, 300);
    
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [yearOverride]);

  return { data, loading, error };
} 