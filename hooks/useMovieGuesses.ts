'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// Simple internal types to avoid dependencies
interface MovieGuess {
  id: string;
  title: string;
  releaseYear: number;
  posterPath?: string | null;
  isCorrect: boolean;
}

interface UseMovieGuessesProps {
  targetYear: number | null;
  onCorrectGuess?: () => void;
}

// TMDB API configuration
const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || '';
const TMDB_API_URL = 'https://api.themoviedb.org/3';

export function useMovieGuesses({ targetYear, onCorrectGuess }: UseMovieGuessesProps) {
  // Basic state
  const [guesses, setGuesses] = useState<MovieGuess[]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasWon, setHasWon] = useState(false);
  
  // Reset game when target year changes
  useEffect(() => {
    if (targetYear !== null) {
      setGuesses([]);
      setCurrentGuess('');
      setError(null);
      setHasWon(false);
      setIsLoading(false);
    }
  }, [targetYear]);
  
  // Submit a guess
  const submitGuess = useCallback(async () => {
    // Validation checks
    if (!targetYear) {
      setError('No target year set');
      return;
    }
    
    if (!currentGuess.trim()) {
      setError('Please enter a movie title');
      return;
    }
    
    if (isLoading) {
      return;
    }
    
    if (guesses.length >= 3) {
      setError('No more guesses remaining');
      return;
    }
    
    if (hasWon) {
      return;
    }
    
    // Start loading
    setIsLoading(true);
    setError(null);
    
    try {
      // Search for the movie
      const response = await fetch(
        `${TMDB_API_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(currentGuess)}&include_adult=false&language=en-US&page=1&primary_release_year=${targetYear}`
      );
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Check if any results match the year
      const matchingMovies = data.results.filter((movie: any) => {
        const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : null;
        return releaseYear === targetYear;
      });
      
      // No matching movies
      if (matchingMovies.length === 0) {
        setError(`No movies found with the title "${currentGuess}" released in ${targetYear}`);
        setIsLoading(false);
        return;
      }
      
      // Get the first matching movie
      const movie = matchingMovies[0];
      const movieId = movie.id.toString();
      
      // Check if already guessed
      if (guesses.some(g => g.id === movieId)) {
        setError('You already guessed this movie');
        setIsLoading(false);
        return;
      }
      
      // Create the new guess
      const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : targetYear;
      const isCorrect = releaseYear === targetYear;
      
      const newGuess: MovieGuess = {
        id: movieId,
        title: movie.title,
        releaseYear,
        posterPath: movie.poster_path,
        isCorrect
      };
      
      // Add the guess
      setGuesses(prev => [...prev, newGuess]);
      setCurrentGuess('');
      
      // Handle correct guess
      if (isCorrect) {
        setHasWon(true);
        if (onCorrectGuess) {
          onCorrectGuess();
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to validate movie');
    } finally {
      setIsLoading(false);
    }
  }, [currentGuess, targetYear, guesses, isLoading, hasWon, onCorrectGuess]);
  
  // Reset the game
  const resetGame = useCallback(() => {
    setGuesses([]);
    setCurrentGuess('');
    setError(null);
    setHasWon(false);
    setIsLoading(false);
  }, []);
  
  return {
    guesses,
    currentGuess,
    setCurrentGuess,
    submitGuess,
    isLoading,
    error,
    hasWon,
    resetGame,
    remainingGuesses: 3 - guesses.length
  };
} 