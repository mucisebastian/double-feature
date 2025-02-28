import { useState, useEffect } from 'react';

// Define the GameData interface
export interface GameData {
  year: number;
  popularMovies?: string[];
  popularAlbums?: string[];
}

export const useGameData = (year?: number | null) => {
  const [data, setData] = useState<GameData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('useGameData effect running, year:', year);
    
    // Immediately clear loading if we're in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode detected, ensuring loading state clears quickly');
      const quickTimeout = setTimeout(() => {
        if (loading) {
          console.log('Force clearing loading state after quick timeout');
          setLoading(false);
          
          // If we don't have data yet, create fallback data
          if (!data) {
            const fallbackYear = year || 1990;
            console.log('Creating fallback data with year:', fallbackYear);
            setData({ year: fallbackYear });
          }
        }
      }, 1000); // Much shorter timeout for development
      
      return () => clearTimeout(quickTimeout);
    }

    // If we already have a year, use it directly
    if (year) {
      console.log('Using provided year:', year);
      setData({ year });
      setLoading(false);
      return;
    }

    // Otherwise, get the daily year from localStorage or generate a new one
    const fetchData = async () => {
      try {
        console.log('Fetching game data...');
        // For now, generate a random year between 1970 and 2020
        const randomYear = 1970 + Math.floor(Math.random() * 51);
        console.log('Generated random year:', randomYear);
        setData({ year: randomYear });
      } catch (err) {
        console.error('Error loading game data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        // Critical fix - always clear loading state
        console.log('Clearing loading state');
        setLoading(false);
      }
    };

    fetchData();
    
    // Add a safety timeout to ensure loading state is cleared
    const safetyTimeout = setTimeout(() => {
      if (loading) {
        console.log('Safety timeout triggered - forcing loading state to clear');
        setLoading(false);
        
        // If we still don't have data, create emergency fallback
        if (!data) {
          const emergencyYear = year || 2000;
          console.log('Creating emergency fallback data with year:', emergencyYear);
          setData({ year: emergencyYear });
        }
      }
    }, 3000); // Shorter timeout
    
    return () => {
      console.log('Cleaning up useGameData effect');
      clearTimeout(safetyTimeout);
    };
  }, [year, loading, data]);

  return { data, loading, error };
}; 