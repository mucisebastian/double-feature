'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { debounce } from 'lodash';

interface AlbumResult {
  id: string;
  name: string;
  artist: string;
  releaseDate: string;
  releaseYear: number;
  albumType: string;
  images: { url: string }[];
}

interface Props {
  dailyYear: number;
  onGuess: (guess: { title: string; correct: boolean }) => void;
  disabled?: boolean;
  guesses?: { title: string; correct: boolean }[];
  onBackToMovies?: () => void;
}

// Spotify API credentials
const SPOTIFY_CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET;

export default function AlbumSearch({ dailyYear, onGuess, disabled = false, guesses = [], onBackToMovies }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AlbumResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [tokenLoading, setTokenLoading] = useState(false);

  // Get Spotify access token
  useEffect(() => {
    const getSpotifyToken = async () => {
      if (accessToken) return;
      
      setTokenLoading(true);
      try {
        const response = await fetch('https://accounts.spotify.com/api/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`)}`
          },
          body: 'grant_type=client_credentials'
        });

        if (!response.ok) {
          throw new Error('Failed to get Spotify access token');
        }

        const data = await response.json();
        setAccessToken(data.access_token);
        console.log('Spotify token acquired');
      } catch (err) {
        console.error('Error getting Spotify token:', err);
        setError('Failed to authenticate with Spotify');
      } finally {
        setTokenLoading(false);
      }
    };

    getSpotifyToken();
  }, [accessToken]);

  // Filter out non-original albums
  const filterNonOriginalAlbums = (albums: AlbumResult[]): AlbumResult[] => {
    const lowerCaseFilters = [
      'remaster', 'remastered', 'deluxe', 'edition', 'anniversary', 
      'live', 'demo', 'acoustic', 'remix', 'version', 'expanded',
      'bonus', 'track', 'special', 'collector', 'extended', 'single',
      'ep', 'soundtrack', 'compilation', 'greatest hits', 'best of',
      'collection', 'complete', 'sessions', 'anniversary', 'cover'
    ];

    return albums.filter(album => {
      // Only include albums (not singles, compilations, etc.)
      if (album.albumType !== 'album') return false;
      
      const lowerName = album.name.toLowerCase();
      
      // Filter out albums with suspicious keywords in the title
      return !lowerCaseFilters.some(filter => lowerName.includes(filter));
    });
  };

  // Search for albums using Spotify API
  const searchAlbums = useCallback(
    debounce(async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(searchQuery)}&type=album&limit=10`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to search albums');
        }

        const data = await response.json();
        
        if (!data.albums || !data.albums.items) {
          setResults([]);
          setIsLoading(false);
          return;
        }

        const albumResults: AlbumResult[] = data.albums.items.map((item: any) => ({
          id: item.id,
          name: item.name,
          artist: item.artists.map((artist: any) => artist.name).join(', '),
          releaseDate: item.release_date,
          releaseYear: new Date(item.release_date).getFullYear(),
          albumType: item.album_type,
          images: item.images
        }));

        // Filter out non-original albums
        const filteredResults = filterNonOriginalAlbums(albumResults);
        
        // Sort by release date (newest first)
        filteredResults.sort((a, b) => b.releaseYear - a.releaseYear);
        
        setResults(filteredResults);
      } catch (err) {
        console.error('Error searching albums:', err);
        setError('Failed to search albums. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }, 300),
    [accessToken]
  );

  useEffect(() => {
    if (query) {
      searchAlbums(query);
    } else {
      setResults([]);
    }

    return () => {
      searchAlbums.cancel();
    };
  }, [query, searchAlbums]);

  const handleSelect = (album: AlbumResult) => {
    const isCorrect = album.releaseYear === dailyYear;
    const guessText = `${album.name} - ${album.artist}`;
    
    onGuess({ title: guessText, correct: isCorrect });
    setQuery('');
    setResults([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim() || disabled) return;
    
    // If there are filtered results, use the first one
    if (results.length > 0) {
      handleSelect(results[0]);
    } else {
      // Direct guess with no results
      onGuess({ title: query, correct: false });
      setQuery('');
    }
  };

  // Check if there's a correct guess
  const hasCorrectGuess = guesses.some(guess => guess.correct);

  return (
    <div className="w-full flex flex-col items-center">
      {/* Search input */}
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <span className="text-gray-500">🔍</span>
        </div>
        
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type answer here..."
          className="w-full pl-10 pr-4 py-3 bg-pink-50 rounded-full border-none shadow-sm focus:outline-none focus:ring-0"
          disabled={disabled || hasCorrectGuess}
        />
        
        <AnimatePresence>
          {results.length > 0 && !disabled && !hasCorrectGuess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg max-h-60 overflow-y-auto"
            >
              {results.map((album) => (
                <div
                  key={album.id}
                  className="p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer flex items-center"
                  onClick={() => handleSelect(album)}
                >
                  {album.images.length > 0 && (
                    <img 
                      src={album.images[album.images.length - 1].url} 
                      alt={album.name} 
                      className="w-10 h-10 mr-3 object-cover rounded"
                    />
                  )}
                  <div>
                    <div className="font-medium">{album.name}</div>
                    <div className="text-sm text-gray-600">
                      {album.artist}
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Submit button */}
      <button
        onClick={handleSubmit}
        disabled={disabled || !query.trim() || hasCorrectGuess}
        className="w-full bg-[#2D0C0C] text-white py-3 px-6 rounded-full font-medium hover:bg-[#3D1C1C] transition-colors mt-4"
      >
        Submit
      </button>
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="mt-4 flex justify-center">
          <div className="animate-spin h-5 w-5 border-t-2 border-b-2 border-gray-900 rounded-full"></div>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <p className="mt-2 text-rose-500 text-sm">{error}</p>
      )}
      
      {/* Correct guess display */}
      {hasCorrectGuess && (
        <div className="mt-4 w-full">
          <div className="bg-green-50 p-3 rounded-lg border border-green-100 flex items-center justify-between">
            <span className="font-medium">
              {guesses.find(guess => guess.correct)?.title}
            </span>
            <span className="text-green-500">✔️</span>
          </div>
        </div>
      )}
      
      {/* Back to Movies button */}
      {onBackToMovies && (
        <button
          onClick={onBackToMovies}
          className="mt-6 text-sm text-gray-700 flex items-center"
        >
          ← Back to Movies
        </button>
      )}
    </div>
  );
} 