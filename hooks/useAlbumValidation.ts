'use client';

import { useState, useCallback, useRef } from 'react';

// Cache structure
interface CacheItem {
  data: any;
  timestamp: number;
}

interface AlbumCache {
  [key: string]: CacheItem;
}

// Cache expiration time (1 hour in milliseconds)
const CACHE_EXPIRATION = 60 * 60 * 1000;

// Spotify API configuration
const SPOTIFY_CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || '';
const SPOTIFY_CLIENT_SECRET = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET || '';
const SPOTIFY_BASE_URL = 'https://api.spotify.com/v1';
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';

export function useAlbumValidation() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  
  // Use a ref for the cache to persist between renders
  const cacheRef = useRef<AlbumCache>({});
  const tokenExpiryRef = useRef<number>(0);

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
   * Get Spotify access token
   */
  const getAccessToken = useCallback(async (): Promise<string> => {
    // If we already have a valid token, return it
    if (accessToken && Date.now() < tokenExpiryRef.current) {
      return accessToken;
    }
    
    try {
      // In a production app, this should be done server-side
      // For this demo, we'll do it client-side (not recommended for real apps)
      const response = await fetch(SPOTIFY_TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`)}`
        },
        body: 'grant_type=client_credentials'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get Spotify token: ${response.status}`);
      }
      
      const data = await response.json();
      const token = data.access_token;
      const expiresIn = data.expires_in || 3600; // Default to 1 hour
      
      setAccessToken(token);
      tokenExpiryRef.current = Date.now() + (expiresIn * 1000);
      
      return token;
    } catch (err) {
      console.error('Error getting Spotify token:', err);
      
      // Fallback to a simulated token for development
      const simulatedToken = 'simulated_spotify_token';
      const expiresIn = 3600; // 1 hour
      
      setAccessToken(simulatedToken);
      tokenExpiryRef.current = Date.now() + (expiresIn * 1000);
      
      return simulatedToken;
    }
  }, [accessToken]);

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
      const token = await getAccessToken();
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
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
   * Search for albums by name
   */
  const searchAlbums = useCallback(async (query: string): Promise<any[]> => {
    if (!query.trim()) {
      return [];
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const cacheKey = `search_album_${normalizeString(query)}`;
      const url = `${SPOTIFY_BASE_URL}/search?q=${encodeURIComponent(query)}&type=album&limit=5`;
      
      const data = await getWithCache(url, cacheKey);
      return data.albums?.items || [];
    } catch (err) {
      setError('Failed to search albums');
      console.error('Album search error:', err);
      
      // Fallback to mock data if API fails
      const mockResults = [
        {
          id: '1',
          name: 'Thriller',
          artists: [{ name: 'Michael Jackson' }],
          release_date: '1982-11-30',
          images: [{ url: 'https://example.com/thriller.jpg' }]
        },
        {
          id: '2',
          name: 'Back in Black',
          artists: [{ name: 'AC/DC' }],
          release_date: '1980-07-25',
          images: [{ url: 'https://example.com/backinblack.jpg' }]
        },
        {
          id: '3',
          name: 'The Dark Side of the Moon',
          artists: [{ name: 'Pink Floyd' }],
          release_date: '1973-03-01',
          images: [{ url: 'https://example.com/darkside.jpg' }]
        }
      ];
      
      // Filter mock results based on query
      const normalizedQuery = normalizeString(query);
      return mockResults.filter(album => 
        normalizeString(album.name).includes(normalizedQuery)
      );
    } finally {
      setIsLoading(false);
    }
  }, [getWithCache]);

  /**
   * Validate if an album exists and matches the given year
   */
  const validateAlbum = useCallback(async (name: string, year: number): Promise<{ isValid: boolean; isCorrectYear: boolean }> => {
    if (!name.trim()) {
      return { isValid: false, isCorrectYear: false };
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const normalizedName = normalizeString(name);
      const searchResults = await searchAlbums(name);
      
      // Find an exact match by name
      const exactMatch = searchResults.find(album => 
        normalizeString(album.name) === normalizedName
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
      setError('Failed to validate album');
      console.error('Album validation error:', err);
      return { isValid: false, isCorrectYear: false };
    } finally {
      setIsLoading(false);
    }
  }, [searchAlbums]);

  /**
   * Get detailed information about an album
   */
  const getAlbumDetails = useCallback(async (name: string): Promise<any> => {
    if (!name.trim()) {
      return null;
    }
    
    try {
      const searchResults = await searchAlbums(name);
      const normalizedName = normalizeString(name);
      
      // Find an exact match by name
      const exactMatch = searchResults.find(album => 
        normalizeString(album.name) === normalizedName
      );
      
      if (!exactMatch) {
        return null;
      }
      
      // Get album details
      const albumId = exactMatch.id;
      const cacheKey = `album_${albumId}`;
      const url = `${SPOTIFY_BASE_URL}/albums/${albumId}`;
      
      let albumData;
      try {
        albumData = await getWithCache(url, cacheKey);
      } catch (err) {
        console.error('Error fetching album details, using search result instead:', err);
        albumData = exactMatch;
      }
      
      // Get release year
      const releaseYear = albumData.release_date 
        ? new Date(albumData.release_date).getFullYear() 
        : null;
      
      // Get artist names
      const artists = albumData.artists.map((artist: any) => artist.name);
      
      return {
        id: albumData.id,
        name: albumData.name,
        year: releaseYear,
        artists,
        cover: albumData.images?.[0]?.url || null,
        isCorrectYear: false // This will be set by the component
      };
    } catch (err) {
      console.error('Error getting album details:', err);
      return null;
    }
  }, [searchAlbums, getWithCache]);

  return {
    isLoading,
    error,
    searchAlbums,
    validateAlbum,
    getAlbumDetails
  };
} 