import { Movie } from '@/types';

// TMDB API configuration
const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || '';
const TMDB_API_URL = 'https://api.themoviedb.org/3';

/**
 * Validates a movie guess against the TMDB API
 * @param query The movie title to search for
 * @param targetYear The target year to match against
 * @returns A Movie object if valid
 * @throws Error if validation fails
 */
export async function validateMovieGuess(query: string, targetYear: number): Promise<Movie> {
  if (!query.trim()) {
    throw new Error('Please enter a movie title');
  }

  try {
    // Call TMDB API to search for movies
    const response = await fetch(
      `${TMDB_API_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1&primary_release_year=${targetYear}`
    );
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Check if any results match the year
    const matchingMovies = data.results.filter((movie: any) => {
      const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : null;
      return releaseYear === targetYear;
    });
    
    if (matchingMovies.length === 0) {
      throw new Error(`No movies found with the title "${query}" released in ${targetYear}`);
    }
    
    // Use the first matching movie
    const movie = matchingMovies[0];
    
    return {
      id: movie.id.toString(),
      title: movie.title,
      posterPath: movie.poster_path,
      releaseYear: new Date(movie.release_date).getFullYear(),
      overview: movie.overview
    };
  } catch (err) {
    if (err instanceof Error) {
      throw err;
    }
    throw new Error('Failed to validate movie. Please try again.');
  }
}

// Debounced version of the validation function
export function debounce<T extends (...args: any[]) => Promise<any>>(
  func: T,
  wait: number = 300
) {
  let timeout: NodeJS.Timeout | null = null;
  
  return function(...args: Parameters<T>): Promise<ReturnType<T>> {
    return new Promise((resolve, reject) => {
      if (timeout) clearTimeout(timeout);
      
      timeout = setTimeout(() => {
        func(...args)
          .then(resolve)
          .catch(reject);
      }, wait);
    });
  };
}

// Export a debounced version of validateMovieGuess
export const debouncedValidateMovieGuess = debounce(validateMovieGuess, 300); 