'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import debounce from 'lodash/debounce';

interface MovieResult {
  id: number;
  title: string;
  poster_path?: string;
  release_date: string;
}

interface Props {
  dailyYear: number;
  onGuess: (movie: { title: string; correct: boolean }) => void;
  disabled?: boolean;
}

// Hardcoded TMDB API token as fallback
const FALLBACK_API_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkZjJiMDM1YTlhMzgxYTkxZDc4NmEyM2NlYTU5OTJmZSIsIm5iZiI6MTc0MDM3MTAxMi4zNzc5OTk4LCJzdWIiOiI2N2JiZjQ0NGJmNTIxZjE5MGYwYTg5YTIiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.7DrGCkSMhLuBT-AZCQOUjPYWjhfUEWWhjV5_Fi1Qa0E';

export default function MovieSearch({ dailyYear, onGuess, disabled = false }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MovieResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedMovie, setSelectedMovie] = useState<MovieResult | null>(null);
  const [showResults, setShowResults] = useState(false);

  // Debounced API search
  const searchMovies = useCallback(debounce(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setIsLoading(true);
    setError('');
    setShowResults(true);

    try {
      // Get API token from environment or use fallback
      const apiToken = process.env.NEXT_PUBLIC_TMDB_KEY || FALLBACK_API_TOKEN;
      
      console.log('Searching for:', searchQuery);
      
      const response = await fetch(
        `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(searchQuery)}&include_adult=false&language=en-US&page=1`,
        {
          headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('TMDB API error:', response.status, errorData);
        throw new Error(`Search failed: ${response.status} ${errorData.status_message || ''}`);
      }
      
      const data = await response.json();
      console.log('Search results:', data.results.length);
      
      // Filter movies with release dates
      const filteredResults = data.results.filter((m: MovieResult) => m.release_date);
      setResults(filteredResults);
      
      if (filteredResults.length === 0 && data.results.length > 0) {
        setError('No movies with valid release dates found');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err.message : 'Failed to search movies');
    } finally {
      setIsLoading(false);
    }
  }, 300), []);

  useEffect(() => {
    if (query.trim()) {
      searchMovies(query);
    } else {
      setResults([]);
      setShowResults(false);
    }
    return () => searchMovies.cancel();
  }, [query, searchMovies]);

  // Hide results when clicking outside the component
  useEffect(() => {
    const handleClickOutside = () => {
      setShowResults(false);
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const handleSelect = (movie: MovieResult, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the outside click handler from firing
    setSelectedMovie(movie);
    setQuery(movie.title);
    setShowResults(false); // Hide dropdown after selection
    setResults([]); // Clear results to ensure dropdown doesn't reappear
  };

  const handleInputClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the outside click handler from firing
    if (query.trim() && results.length > 0) {
      setShowResults(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedMovie) {
      // Use the selected movie
      const releaseYear = selectedMovie.release_date ? new Date(selectedMovie.release_date).getFullYear() : null;
      const correct = releaseYear === dailyYear;
      
      console.log('Submitting movie:', selectedMovie.title, 'Release year:', releaseYear, 'Target year:', dailyYear, 'Correct:', correct);
      
      onGuess({ title: selectedMovie.title, correct });
      setQuery('');
      setSelectedMovie(null);
      setShowResults(false);
      setResults([]);
    } else if (query.trim()) {
      // If there's no selected movie but there is a query, make a direct guess
      onGuess({ title: query, correct: false });
      setQuery('');
      setShowResults(false);
      setResults([]);
    }
  };

  // For testing/demo purposes - allow direct guessing without API
  const handleDirectGuess = () => {
    if (!query.trim()) return;
    
    // This is a fallback for when the API isn't working
    // It will always mark the guess as incorrect
    onGuess({ title: query, correct: false });
    setQuery('');
    setSelectedMovie(null);
    setShowResults(false);
    setResults([]);
  };

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <span className="text-gray-500">🔍</span>
          </div>
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedMovie(null); // Clear selection when typing
            }}
            onClick={handleInputClick} // Show results when clicking on input
            placeholder="Type answer here..."
            className="w-full p-4 pl-10 rounded-full bg-pink-100 border-none shadow-sm"
            disabled={disabled}
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
            </div>
          )}
        </div>
        
        <button
          type="submit"
          className="w-full bg-[#2D0C0C] text-white py-3 px-6 rounded-full font-medium hover:bg-[#3D1C1C] transition-colors mt-4"
          disabled={disabled || !query.trim() || isLoading}
        >
          Submit
        </button>
        
        {error && (
          <button
            type="button"
            onClick={handleDirectGuess}
            className="w-full bg-gray-200 text-black py-3 px-6 rounded-full font-medium hover:bg-gray-300 transition-colors mt-2"
            disabled={disabled || !query.trim() || isLoading}
          >
            Guess Anyway
          </button>
        )}
      </form>
      
      <AnimatePresence>
        {(query && results.length > 0 && !disabled && showResults) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-10 w-full mt-2 bg-white border rounded-lg shadow-lg max-h-80 overflow-auto"
            onClick={(e) => e.stopPropagation()} // Prevent clicks inside dropdown from closing it
          >
            {results.map((movie) => (
              <button
                key={movie.id}
                onClick={(e) => handleSelect(movie, e)}
                className="flex items-center w-full p-3 hover:bg-gray-50 transition-colors text-left"
              >
                {movie.poster_path && (
                  <img
                    src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                    alt={movie.title}
                    className="w-12 h-16 object-cover rounded mr-3"
                  />
                )}
                <span className="font-medium truncate">{movie.title}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="text-red-500 text-sm mt-2">
          {error}
        </div>
      )}
    </div>
  );
} 