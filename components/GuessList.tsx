'use client';

import { useState, useEffect } from 'react';
import { useMovieValidation } from '@/hooks/useMovieValidation';
import { useAlbumValidation } from '@/hooks/useAlbumValidation';

interface GuessListProps {
  guesses: string[];
  type: 'movie' | 'album';
}

export default function GuessList({ guesses, type }: GuessListProps) {
  const [guessDetails, setGuessDetails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { getMovieDetails } = useMovieValidation();
  const { getAlbumDetails } = useAlbumValidation();

  useEffect(() => {
    const fetchDetails = async () => {
      if (guesses.length === 0) {
        setGuessDetails([]);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      
      try {
        const detailsPromises = guesses.map(async (guess) => {
          if (type === 'movie') {
            return await getMovieDetails(guess);
          } else {
            return await getAlbumDetails(guess);
          }
        });
        
        const details = await Promise.all(detailsPromises);
        setGuessDetails(details);
      } catch (error) {
        console.error(`Error fetching ${type} details:`, error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDetails();
  }, [guesses, type, getMovieDetails, getAlbumDetails]);

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (guesses.length === 0) {
    return (
      <div className="text-center text-gray-500 py-4">
        No guesses yet
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h4 className="font-medium">Your Guesses:</h4>
      
      <div className="space-y-2">
        {guessDetails.map((detail, index) => {
          const isCorrectYear = detail?.isCorrectYear;
          
          return (
            <div 
              key={index}
              className={`p-3 rounded-lg border ${
                isCorrectYear 
                  ? 'bg-green-100 border-green-300 dark:bg-green-900 dark:border-green-700' 
                  : 'bg-red-100 border-red-300 dark:bg-red-900 dark:border-red-700'
              }`}
            >
              <div className="font-medium">
                {type === 'movie' ? detail?.title : detail?.name}
              </div>
              
              <div className="text-sm flex justify-between">
                <span>
                  {type === 'movie' 
                    ? detail?.director || 'Unknown director'
                    : detail?.artists?.join(', ') || 'Unknown artist'}
                </span>
                
                <span className={isCorrectYear ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}>
                  {detail?.year || 'Unknown year'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 