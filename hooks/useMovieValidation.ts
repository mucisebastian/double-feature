'use client';

import { useState, useCallback, useRef } from 'react';

// Cache structure
interface CacheItem {
  data: any;
  timestamp: number;
}

interface MovieCache {
  [key: string]: CacheItem;
}

// Cache expiration time (1 hour in milliseconds)
const CACHE_EXPIRATION = 60 * 60 * 1000;

// TMDB API configuration
const TMDB_API_TOKEN = process.env.NEXT_PUBLIC_TMDB_API_KEY || '';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export function useMovieValidation() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use a ref for the cache to persist between renders
  const cacheRef = useRef<MovieCache>({});

  /**
   * Normalize a string for comparison
   */
  const normalizeString = (str: string): string => {
    return str.toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove special characters
      .replace(/\s+/g, ' ')    // Replace multiple spaces with a single space
      .trim();
  };

  /**
   * Check if a cached item is still valid
   */
  const isCacheValid = (key: string): boolean => {
    const cache = cacheRef.current;
    if (!cache[key]) return false;
    
    const now = Date.now();
    return now - cache[key].timestamp < CACHE_EXPIRATION;
  };

  /**
   * Get data from cache or fetch from API
   */
  const getWithCache = async (url: string, cacheKey: string): Promise<any> => {
    // Check cache first
    if (isCacheValid(cacheKey)) {
      return cacheRef.current[cacheKey].data;
    }
    
    // If not in cache or expired, fetch from API
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${TMDB_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Store in cache
      cacheRef.current[cacheKey] = {
        data,
        timestamp: Date.now()
      };
      
      return data;
    } catch (err) {
      console.error('API fetch error:', err);
      throw err;
    }
  };

  /**
   * Search for movies by title
   */
  const searchMovies = useCallback(async (query: string): Promise<any[]> => {
    if (!query.trim() || !TMDB_API_TOKEN) {
      return [];
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const cacheKey = `search_${normalizeString(query)}`;
      const url = `${TMDB_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&include_adult=false`;
      
      const data = await getWithCache(url, cacheKey);
      return data.results || [];
    } catch (err) {
      setError('Failed to search movies');
      console.error('Movie search error:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Validate if a movie exists and matches the given year
   */
  const validateMovie = useCallback(async (title: string, year: number): Promise<{ isValid: boolean; isCorrectYear: boolean }> => {
    if (!title.trim() || !TMDB_API_TOKEN) {
      return { isValid: false, isCorrectYear: false };
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const normalizedTitle = normalizeString(title);
      const searchResults = await searchMovies(title);
      
      // Find an exact match by title
      const exactMatch = searchResults.find(movie => 
        normalizeString(movie.title) === normalizedTitle
      );
      
      if (!exactMatch) {
        return { isValid: false, isCorrectYear: false };
      }
      
      // Get the release year
      const releaseYear = exactMatch.release_date 
        ? new Date(exactMatch.release_date).getFullYear() 
        : null;
      
      return { 
        isValid: true, 
        isCorrectYear: releaseYear === year 
      };
    } catch (err) {
      setError('Failed to validate movie');
      console.error('Movie validation error:', err);
      return { isValid: false, isCorrectYear: false };
    } finally {
      setIsLoading(false);
    }
  }, [searchMovies]);

  /**
   * Get detailed information about a movie
   */
  const getMovieDetails = useCallback(async (title: string): Promise<any> => {
    if (!title.trim() || !TMDB_API_TOKEN) {
      return null;
    }
    
    try {
      const searchResults = await searchMovies(title);
      const normalizedTitle = normalizeString(title);
      
      // Find an exact match by title
      const exactMatch = searchResults.find(movie => 
        normalizeString(movie.title) === normalizedTitle
      );
      
      if (!exactMatch) {
        return null;
      }
      
      // Get more details about the movie
      const movieId = exactMatch.id;
      const cacheKey = `movie_${movieId}`;
      const url = `${TMDB_BASE_URL}/movie/${movieId}?append_to_response=credits`;
      
      const movieData = await getWithCache(url, cacheKey);
      
      // Extract director
      const director = movieData.credits?.crew?.find((person: any) => 
        person.job === 'Director'
      )?.name || 'Unknown';
      
      // Get release year
      const releaseYear = movieData.release_date 
        ? new Date(movieData.release_date).getFullYear() 
        : null;
      
      return {
        id: movieData.id,
        title: movieData.title,
        year: releaseYear,
        director,
        poster: movieData.poster_path 
          ? `https://image.tmdb.org/t/p/w500${movieData.poster_path}` 
          : null,
        isCorrectYear: false // This will be set by the component
      };
    } catch (err) {
      console.error('Error getting movie details:', err);
      return null;
    }
  }, [searchMovies]);

  return {
    isLoading,
    error,
    searchMovies,
    validateMovie,
    getMovieDetails
  };
} 