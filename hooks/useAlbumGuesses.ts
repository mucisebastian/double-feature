'use client';

import { useReducer, useEffect, useCallback, useRef } from 'react';

// Define the AlbumGuess interface
interface AlbumGuess {
  id: string;
  title: string;
  year: number;
  isCorrect: boolean;
}

// Define the props interface with required dailyYear
interface UseAlbumGuessesProps {
  dailyYear: number; // Required property
  maxAttempts?: number;
}

// Define state interface
interface AlbumGuessState {
  guesses: AlbumGuess[];
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
  accessToken: string | null;
}

// Define action types - simplified
type AlbumGuessAction = 
  | { type: 'INITIALIZE'; payload: AlbumGuess[] }
  | { type: 'ADD_GUESS'; payload: AlbumGuess }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_INITIALIZED'; payload: boolean }
  | { type: 'SET_ACCESS_TOKEN'; payload: string }
  | { type: 'CLEAR_GUESSES' };

// Initial state - defined outside the component
const initialState: AlbumGuessState = {
  guesses: [],
  isLoading: false,
  error: null,
  isInitialized: false,
  accessToken: null
};

// Spotify API configuration
const SPOTIFY_CLIENT_ID = '1a70ba777fec4ffd9633c0c418af660f';
const SPOTIFY_CLIENT_SECRET = '5d45a0eba71a4db1b561a8e7a4e99e4a';

// Pure reducer function with no side effects
function albumGuessReducer(state: AlbumGuessState, action: AlbumGuessAction): AlbumGuessState {
  switch (action.type) {
    case 'INITIALIZE':
      return {
        ...state,
        guesses: action.payload,
        isInitialized: true
      };
    case 'ADD_GUESS':
      return {
        ...state,
        guesses: [...state.guesses, action.payload]
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload
      };
    case 'SET_INITIALIZED':
      return {
        ...state,
        isInitialized: action.payload
      };
    case 'SET_ACCESS_TOKEN':
      return {
        ...state,
        accessToken: action.payload
      };
    case 'CLEAR_GUESSES':
      return {
        ...state,
        guesses: []
      };
    default:
      return state;
  }
}

// Interface for Spotify album search results
interface SpotifyAlbum {
  id: string;
  name: string;
  release_date: string;
  artists: Array<{ name: string }>;
  images: Array<{ url: string; height: number; width: number }>;
}

interface SpotifySearchResponse {
  albums: {
    items: SpotifyAlbum[];
    total: number;
  };
}

export function useAlbumGuesses({ 
  dailyYear, 
  maxAttempts = 3 
}: UseAlbumGuessesProps) {
  // Validate parameters at runtime
  if (!dailyYear) {
    throw new Error('useAlbumGuesses requires dailyYear parameter');
  }

  // Create a storage key based on the daily year
  const storageKey = `doubleFeature_album_${dailyYear}`;
  
  // Use ref to track mounted state only
  const isMounted = useRef(true);
  
  // Use reducer with initial state defined outside the component
  const [state, dispatch] = useReducer(albumGuessReducer, initialState);
  const { guesses, isLoading, error, isInitialized, accessToken } = state;
  
  // Derived state
  const isCorrect = guesses.some(guess => guess.isCorrect);
  const hasMaxGuesses = guesses.length >= maxAttempts;
  
  // Get Spotify access token
  useEffect(() => {
    const getSpotifyToken = async () => {
      try {
        const response = await fetch('https://accounts.spotify.com/api/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`)
          },
          body: 'grant_type=client_credentials'
        });
        
        if (!response.ok) {
          throw new Error('Failed to get Spotify access token');
        }
        
        const data = await response.json();
        if (isMounted.current) {
          dispatch({ type: 'SET_ACCESS_TOKEN', payload: data.access_token });
        }
      } catch (err) {
        console.error('Error getting Spotify token:', err);
        if (isMounted.current) {
          dispatch({ type: 'SET_ERROR', payload: 'Failed to connect to Spotify API' });
        }
      }
    };
    
    getSpotifyToken();
  }, []);
  
  // Load data from localStorage in a separate effect
  useEffect(() => {
    // Skip SSR
    if (typeof window === 'undefined') {
      dispatch({ type: 'SET_INITIALIZED', payload: true });
      return;
    }
    
    try {
      const savedGuesses = localStorage.getItem(storageKey);
      if (savedGuesses) {
        dispatch({ type: 'INITIALIZE', payload: JSON.parse(savedGuesses) });
      } else {
        dispatch({ type: 'SET_INITIALIZED', payload: true });
      }
    } catch (err) {
      console.error('Error loading album guesses from localStorage:', err);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load saved guesses' });
      dispatch({ type: 'SET_INITIALIZED', payload: true });
    }
    
    // No dependencies to avoid re-running
  }, [storageKey]);
  
  // Save guesses to localStorage when they change
  useEffect(() => {
    // Only save after initialization and in browser
    if (!isInitialized || typeof window === 'undefined' || !isMounted.current) return;
    
    try {
      localStorage.setItem(storageKey, JSON.stringify(guesses));
    } catch (err) {
      console.error('Error saving album guesses to localStorage:', err);
    }
  }, [guesses, isInitialized, storageKey]);
  
  // Cleanup effect for unmounting
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  // Action creators as callbacks
  const addGuess = useCallback((newGuess: AlbumGuess) => {
    if (!isMounted.current) return;
    dispatch({ type: 'ADD_GUESS', payload: newGuess });
  }, []);
  
  const setLoading = useCallback((loading: boolean) => {
    if (!isMounted.current) return;
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);
  
  const setError = useCallback((errorMsg: string | null) => {
    if (!isMounted.current) return;
    dispatch({ type: 'SET_ERROR', payload: errorMsg });
  }, []);
  
  // Function to search for albums using Spotify API
  const searchAlbums = useCallback(async (query: string): Promise<Array<{ id: string; title: string; details?: string }>> => {
    if (!query.trim() || query.length < 2 || !isMounted.current || !accessToken) {
      if (!accessToken && query.trim().length >= 2) {
        setError('Spotify API connection not ready. Please try again.');
      }
      return [];
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Debounce the search to avoid too many API calls
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Call Spotify API to search for albums
      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=album&limit=10`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Spotify API error: ${response.status}`);
      }
      
      const data: SpotifySearchResponse = await response.json();
      
      // Filter albums by year and format results
      const results = data.albums.items
        .filter(album => {
          // Extract year from release_date (format: YYYY-MM-DD or YYYY)
          const releaseYear = parseInt(album.release_date.substring(0, 4), 10);
          return releaseYear === dailyYear;
        })
        .map(album => ({
          id: album.id,
          title: album.name,
          details: `${album.artists.map(a => a.name).join(', ')} (${album.release_date.substring(0, 4)})`
        }));
      
      if (isMounted.current) {
        setLoading(false);
        return results;
      }
      return [];
    } catch (err) {
      console.error('Error searching albums:', err);
      
      if (isMounted.current) {
        setError('Failed to search albums. Please try again.');
        setLoading(false);
      }
      return [];
    }
  }, [dailyYear, accessToken, setLoading, setError]);
  
  // Function to validate an album guess using Spotify API
  const validateGuess = useCallback(async (title: string) => {
    if (!title.trim() || !isMounted.current) {
      setError('Please enter an album title');
      return;
    }
    
    if (isCorrect || hasMaxGuesses || !accessToken) {
      if (!accessToken) {
        setError('Spotify API connection not ready. Please try again.');
      }
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Search for the album in Spotify
      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(title)}&type=album&limit=10`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Spotify API error: ${response.status}`);
      }
      
      const data: SpotifySearchResponse = await response.json();
      
      // Check if any results match the year
      const matchingAlbums = data.albums.items.filter(album => {
        const releaseYear = parseInt(album.release_date.substring(0, 4), 10);
        return releaseYear === dailyYear;
      });
      
      const isCorrect = matchingAlbums.length > 0;
      
      // Use the first matching album or the search term if no matches
      const albumTitle = isCorrect ? matchingAlbums[0].name : title;
      
      const newGuess: AlbumGuess = {
        id: Date.now().toString(),
        title: albumTitle,
        year: dailyYear,
        isCorrect
      };
      
      // Add the guess to state
      addGuess(newGuess);
      
      if (isMounted.current) {
        setLoading(false);
      }
    } catch (err) {
      console.error('Error validating album guess:', err);
      
      if (isMounted.current) {
        setError('Failed to validate your guess. Please try again.');
        setLoading(false);
      }
    }
  }, [dailyYear, isCorrect, hasMaxGuesses, accessToken, addGuess, setLoading, setError]);
  
  // Clear guesses
  const clearGuesses = useCallback(() => {
    if (!isMounted.current) return;
    
    dispatch({ type: 'CLEAR_GUESSES' });
    try {
      localStorage.removeItem(storageKey);
    } catch (err) {
      console.error('Error clearing guesses:', err);
    }
  }, [storageKey]);
  
  return {
    guesses,
    isLoading,
    error,
    isCorrect,
    hasMaxGuesses,
    isInitialized,
    searchAlbums,
    validateGuess,
    addGuess,
    clearGuesses
  };
} 