import { useState, useEffect } from 'react';
import { getTodaysYear } from '@/utils/archiveManager';

// Define the GameData interface
export interface GameData {
  year: number;
  date?: string;
  popularMovies?: string[];
  popularAlbums?: string[];
}

export function useGameData(yearOverride?: number | null, dateOverride?: string | null) {
  const [data, setData] = useState<GameData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // If we have a year override (e.g., from archive), use that
        if (yearOverride) {
          console.log('Using year override:', yearOverride);
          if (isMounted) {
            setData({ 
              year: yearOverride,
              date: dateOverride || new Date().toISOString().split('T')[0]
            });
            setLoading(false);
          }
          return;
        }
        
        // Get today's year from the archive manager
        const todaysYear = getTodaysYear();
        const today = new Date().toISOString().split('T')[0];
        
        const newData = { 
          year: todaysYear,
          date: today
        };
        
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
  }, [yearOverride, dateOverride]);

  return { data, loading, error };
} 