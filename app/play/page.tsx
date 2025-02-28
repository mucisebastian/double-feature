'use client';

import { useState, useCallback, useReducer, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { useGameData } from '@/hooks/useGameData';
import ErrorBoundary from '@/components/ErrorBoundary';
import Loading from '@/components/Loading';
import MovieSearch from '@/components/MovieSearch';
import AlbumSearch from '@/components/AlbumSearch';
import { getPopularMedia } from '@/data/popularMedia';

// Only dynamically import ShareResults as it's only needed at the end of the game
import dynamic from 'next/dynamic';
const ShareResults = dynamic(() => import('@/components/ShareResults'));

// Game state types and reducer
type GameState = {
  view: 'movie' | 'album';
  showCongrats: boolean;
  congratsMessage: string;
  showMenu: boolean;
  showPopularAnswers: boolean;
  popularAnswersDismissed: boolean;
};

type GameAction =
  | { type: 'SWITCH_TO_ALBUM' }
  | { type: 'SWITCH_TO_MOVIE' }
  | { type: 'SHOW_CONGRATS'; message: string }
  | { type: 'HIDE_CONGRATS' }
  | { type: 'TOGGLE_MENU' }
  | { type: 'SHOW_POPULAR_ANSWERS' }
  | { type: 'HIDE_POPULAR_ANSWERS' };

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SWITCH_TO_ALBUM':
      return { ...state, view: 'album' };
    case 'SWITCH_TO_MOVIE':
      return { ...state, view: 'movie' };
    case 'SHOW_CONGRATS':
      return { ...state, showCongrats: true, congratsMessage: action.message };
    case 'HIDE_CONGRATS':
      return { ...state, showCongrats: false };
    case 'TOGGLE_MENU':
      return { ...state, showMenu: !state.showMenu };
    case 'SHOW_POPULAR_ANSWERS':
      return { ...state, showPopularAnswers: true, popularAnswersDismissed: false };
    case 'HIDE_POPULAR_ANSWERS':
      return { ...state, showPopularAnswers: false, popularAnswersDismissed: true };
    default:
      return state;
  }
}

interface Guess {
  title: string;
  correct: boolean;
}

export default function PlayPage() {
  console.log('PlayPage rendering');
  const router = useRouter();
  const searchParams = useSearchParams();
  const archiveDate = searchParams.get('date');
  const archiveYear = searchParams.get('year');
  
  // Get year from URL params if available
  const yearParam = archiveYear ? parseInt(archiveYear) : null;
  console.log('Year param:', yearParam);
  
  // Force render after mount to ensure client-side data
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    console.log('PlayPage mounted');
    setIsMounted(true);
    
    // Force a re-render after a short delay if we're still loading
    const forceRenderTimeout = setTimeout(() => {
      console.log('Force re-render timeout triggered');
      setIsMounted(prev => !prev);
    }, 2000);
    
    return () => clearTimeout(forceRenderTimeout);
  }, []);
  
  // Use our new hook with proper loading state management
  const { data, loading, error } = useGameData(yearParam);
  console.log('Game data state:', { data, loading, error });
  
  // Initialize game state with reducer
  const [gameState, dispatch] = useReducer(gameReducer, {
    view: 'movie',
    showCongrats: false,
    congratsMessage: '',
    showMenu: false,
    showPopularAnswers: false,
    popularAnswersDismissed: false,
  });
  
  const [movieGuesses, setMovieGuesses] = useState<Guess[]>([]);
  const [albumGuesses, setAlbumGuesses] = useState<Guess[]>([]);
  const [popularMovies, setPopularMovies] = useState<string[]>([]);
  const [popularAlbums, setPopularAlbums] = useState<string[]>([]);
  
  // Derived state
  const hasWonMovie = movieGuesses.some(guess => guess.correct);
  const hasMaxMovieGuesses = movieGuesses.length >= 3;
  const isMovieComplete = hasWonMovie || hasMaxMovieGuesses;
  
  const hasWonAlbum = albumGuesses.some(guess => guess.correct);
  const hasMaxAlbumGuesses = albumGuesses.length >= 3;
  const isAlbumComplete = hasWonAlbum || hasMaxAlbumGuesses;
  
  const isGameComplete = isMovieComplete && isAlbumComplete;
  
  // Handle guesses
  const handleMovieGuess = useCallback((guess: Guess) => {
    setMovieGuesses(prev => [...prev, guess]);
    if (guess.correct && data?.year) {
      dispatch({ type: 'SHOW_CONGRATS', message: `You found a movie from ${data.year}!` });
      setTimeout(() => {
        dispatch({ type: 'HIDE_CONGRATS' });
        dispatch({ type: 'SWITCH_TO_ALBUM' });
      }, 2000);
    } 
  }, [data?.year]);

  const handleAlbumGuess = useCallback((guess: Guess) => {
    setAlbumGuesses(prev => [...prev, guess]);
    if (guess.correct && data?.year) {
      dispatch({ type: 'SHOW_CONGRATS', message: `You found an album from ${data.year}!` });
      setTimeout(() => dispatch({ type: 'HIDE_CONGRATS' }), 2000);
    }
  }, [data?.year]);

  // Error fallback component
  const ErrorScreen = ({ message }: { message: string }) => (
    <div className="p-6 max-w-md mx-auto text-center">
      <h2 className="text-xl font-bold text-red-600 mb-4">Error Loading Game</h2>
      <p className="mb-4">{message}</p>
      <button 
        onClick={() => window.location.reload()} 
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Try Again
      </button>
    </div>
  );

  // Render the game interface
  const GameInterface = () => {
    // Fallback to a default year if data is somehow missing
    const year = data?.year || yearParam || 2000;
  
    return (
      <div className="flex flex-col items-center min-h-screen bg-white">
        {/* Header */}
        <header className="w-full p-4 flex justify-between items-center border-b border-gray-100">
          <Link href="/" className="text-gray-800 hover:text-black transition-colors">
            <span className="text-2xl">←</span>
          </Link>
          <nav className="flex items-center space-x-4">
            <button 
              className={`text-xl ${gameState.view === 'movie' ? 'opacity-100' : 'opacity-50'} 
                       cursor-pointer transition-opacity`}
              onClick={() => !isMovieComplete && dispatch({ type: 'SWITCH_TO_MOVIE' })}
            >
              🎬
            </button>
            <button 
              className={`text-xl ${gameState.view === 'album' ? 'opacity-100' : 'opacity-50'} 
                       cursor-pointer transition-opacity`}
              onClick={() => dispatch({ type: 'SWITCH_TO_ALBUM' })}
            >
              🎵
            </button>
          </nav>
          <div className="flex items-center">
            <button 
              onClick={() => {
                // Store that we're coming from /play
                if (typeof window !== 'undefined') {
                  try {
                    sessionStorage.setItem('howToPlayReferrer', '/play');
                  } catch (error) {
                    console.error('Error setting sessionStorage:', error);
                  }
                }
                router.push('/howtoplay');
              }}
              className="mr-4 text-gray-800 hover:text-black transition-colors text-sm"
            >
              How to Play
            </button>
            <button 
              className="text-2xl text-gray-800 hover:text-black transition-colors"
              onClick={() => dispatch({ type: 'TOGGLE_MENU' })}
            >
              ⋯
            </button>
          </div>
        </header>

        {/* Menu Dropdown */}
        {gameState.showMenu && (
          <div className="absolute right-4 top-14 bg-white shadow-md rounded-lg z-40 p-2 min-w-[150px] border border-gray-100">
            {isGameComplete && (
              <div className="py-1">
                <button
                  onClick={() => {
                    // Reset game logic here
                    setMovieGuesses([]);
                    setAlbumGuesses([]);
                    dispatch({ type: 'SWITCH_TO_MOVIE' });
                    dispatch({ type: 'TOGGLE_MENU' });
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded transition-colors text-gray-800"
                >
                  Reset Game
                </button>
              </div>
            )}
          </div>
        )}

        {/* Main game area */}
        <main className="flex-1 w-full max-w-md flex flex-col items-center justify-center px-4 py-8">
          <h1 className="text-6xl font-bold mb-8 text-gray-900">{year}</h1>
          
          <div className="mb-8">
            <span className="text-4xl">{gameState.view === 'movie' ? '🎬' : '🎵'}</span>
          </div>

          {gameState.view === 'movie' ? (
            <MovieSearch 
              dailyYear={year}
              onGuess={handleMovieGuess}
              disabled={isMovieComplete}
            />
          ) : (
            <AlbumSearch 
              dailyYear={year}
              onGuess={handleAlbumGuess}
              disabled={isAlbumComplete}
            />
          )}
        </main>
      </div>
    );
  };

  // Main render with error boundary
  return (
    <ErrorBoundary fallback={<div className="p-6">Game failed to load. Please refresh the page.</div>}>
      {loading && !data ? (
        <Loading timeout={3000} />
      ) : error ? (
        <ErrorScreen message={error} />
      ) : (
        <GameInterface />
      )}
    </ErrorBoundary>
  );
} 