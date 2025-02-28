// Movie type definition
export interface Movie {
  id: string;
  title: string;
  posterPath?: string | null;
  releaseYear: number;
  overview?: string;
}

// Album type definition
export interface Album {
  id: string;
  title: string;
  artist: string;
  coverUrl?: string | null;
  releaseYear: number;
}

// MovieGuess interface for the old implementation
export interface MovieGuess {
  id: string;
  title: string;
  isCorrect: boolean;
}

// Game state types
export interface GameState {
  dailyYear: number | null;
  hasCompletedMovie: boolean;
  hasCompletedAlbum: boolean;
  lastPlayed: string | null;
}

// API response types
export interface TMDBSearchResponse {
  page: number;
  results: TMDBMovie[];
  total_results: number;
  total_pages: number;
}

export interface TMDBMovie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  overview: string;
  [key: string]: any;
}

export interface SpotifySearchResponse {
  albums: {
    items: SpotifyAlbum[];
    [key: string]: any;
  };
  [key: string]: any;
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  artists: { name: string }[];
  images: { url: string }[];
  release_date: string;
  [key: string]: any;
} 