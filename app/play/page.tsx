'use client';

import { useState, useEffect, useCallback, useReducer, Suspense } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import useDailyYear from '@/hooks/useDailyYear';
import { getPopularMedia } from '@/data/popularMedia';
import MovieSearch from '@/components/MovieSearch';
import AlbumSearch from '@/components/AlbumSearch';
import HowToPlay from '@/components/HowToPlay';
import { format } from 'date-fns';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Only dynamically import ShareResults as it's only needed at the end of the game
const ShareResults = dynamic(() => import('@/components/ShareResults'));

// Force dynamic rendering to handle useSearchParams
export const dynamicRendering = 'force-dynamic';

// Game state types and reducer
type GameState = {
  view: 'movie' | 'album';
  showCongrats: boolean;
  congratsMessage: string;
  showMenu: boolean;
  showHowToPlay: boolean;
  showPopularAnswers: boolean;
  popularAnswersDismissed: boolean;
};

type GameAction =
  | { type: 'SWITCH_TO_ALBUM' }
  | { type: 'SWITCH_TO_MOVIE' }
  | { type: 'SHOW_CONGRATS'; message: string }
  | { type: 'HIDE_CONGRATS' }
  | { type: 'TOGGLE_MENU' }
  | { type: 'SHOW_HOW_TO_PLAY' }
  | { type: 'HIDE_HOW_TO_PLAY' }
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
    case 'SHOW_HOW_TO_PLAY':
      return { ...state, showHowToPlay: true, showMenu: false };
    case 'HIDE_HOW_TO_PLAY':
      return { ...state, showHowToPlay: false };
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

// Mock popular answers data - in a real app, this would come from an API or database
const getPopularMovies = (year: number): string[] => {
  const popularMoviesByYear: Record<number, string[]> = {
    1970: ["Patton", "M*A*S*H", "Five Easy Pieces"],
    1971: ["A Clockwork Orange", "The French Connection", "Dirty Harry"],
    1972: ["The Godfather", "Deliverance", "Cabaret"],
    1973: ["The Exorcist", "American Graffiti", "Paper Moon"],
    1974: ["The Godfather Part II", "Chinatown", "Blazing Saddles"],
    1975: ["Jaws", "One Flew Over the Cuckoo's Nest", "Dog Day Afternoon"],
    1976: ["Taxi Driver", "Rocky", "Network"],
    1977: ["Star Wars", "Annie Hall", "Saturday Night Fever"],
    1978: ["Halloween", "Superman", "Grease"],
    1979: ["Alien", "Apocalypse Now", "Kramer vs. Kramer"],
    1980: ["The Shining", "Raging Bull", "The Empire Strikes Back"],
    1981: ["Raiders of the Lost Ark", "Mad Max 2: The Road Warrior", "Das Boot"],
    1982: ["E.T. the Extra-Terrestrial", "Blade Runner", "The Thing"],
    1983: ["Scarface", "Return of the Jedi", "Terms of Endearment"],
    1984: ["The Terminator", "Ghostbusters", "This Is Spinal Tap"],
    1985: ["Back to the Future", "The Breakfast Club", "The Goonies"],
    1986: ["Aliens", "Platoon", "Ferris Bueller's Day Off"],
    1987: ["Full Metal Jacket", "The Princess Bride", "Predator"],
    1988: ["Die Hard", "Who Framed Roger Rabbit", "Rain Man"],
    1989: ["Batman", "Indiana Jones and the Last Crusade", "Dead Poets Society"],
    1990: ["Goodfellas", "Home Alone", "Edward Scissorhands"],
    1991: ["The Silence of the Lambs", "Terminator 2: Judgment Day", "Beauty and the Beast"],
    1992: ["Reservoir Dogs", "Aladdin", "The Bodyguard"],
    1993: ["Jurassic Park", "Schindler's List", "Groundhog Day"],
    1994: ["Pulp Fiction", "The Shawshank Redemption", "Forrest Gump"],
    1995: ["Toy Story", "Se7en", "The Usual Suspects"],
    1996: ["Fargo", "Trainspotting", "Scream"],
    1997: ["Titanic", "Good Will Hunting", "The Fifth Element"],
    1998: ["Saving Private Ryan", "The Big Lebowski", "The Truman Show"],
    1999: ["The Matrix", "Fight Club", "The Sixth Sense"],
    2000: ["Gladiator", "Memento", "Requiem for a Dream"],
    2001: ["The Lord of the Rings: The Fellowship of the Ring", "Harry Potter and the Philosopher's Stone", "Shrek"],
    2002: ["The Lord of the Rings: The Two Towers", "Spider-Man", "Catch Me If You Can"],
    2003: ["The Lord of the Rings: The Return of the King", "Finding Nemo", "Lost in Translation"],
    2004: ["Eternal Sunshine of the Spotless Mind", "The Incredibles", "Shaun of the Dead"],
    2005: ["Batman Begins", "Brokeback Mountain", "Pride & Prejudice"],
    2006: ["The Departed", "Pan's Labyrinth", "The Prestige"],
    2007: ["No Country for Old Men", "There Will Be Blood", "Ratatouille"],
    2008: ["The Dark Knight", "WALL-E", "Slumdog Millionaire"],
    2009: ["Avatar", "Up", "Inglourious Basterds"],
    2010: ["Inception", "The Social Network", "Toy Story 3"],
    2011: ["Drive", "Harry Potter and the Deathly Hallows – Part 2", "The Artist"],
    2012: ["The Avengers", "Django Unchained", "The Dark Knight Rises"],
    2013: ["Her", "12 Years a Slave", "Gravity"],
    2014: ["Interstellar", "Whiplash", "The Grand Budapest Hotel"],
    2015: ["Mad Max: Fury Road", "Inside Out", "The Revenant"],
    2016: ["La La Land", "Moonlight", "Arrival"],
    2017: ["Get Out", "Call Me by Your Name", "Lady Bird"],
    2018: ["Spider-Man: Into the Spider-Verse", "A Star Is Born", "Black Panther"],
    2019: ["Parasite", "Joker", "1917"],
    2020: ["Soul", "Tenet", "Nomadland"],
    2021: ["Dune", "The Power of the Dog", "Spider-Man: No Way Home"],
    2022: ["Everything Everywhere All at Once", "Top Gun: Maverick", "The Batman"],
    2023: ["Oppenheimer", "Barbie", "Spider-Man: Across the Spider-Verse"],
    2024: ["Dune: Part Two", "Inside Out 2", "Deadpool & Wolverine"],
    2025: ["Avengers: The Kang Dynasty", "Avatar 3", "Star Wars: New Jedi Order"]
  };
  
  // If we don't have data for the specific year, return movies from the closest year
  if (!popularMoviesByYear[year]) {
    const years = Object.keys(popularMoviesByYear).map(Number);
    const closestYear = years.reduce((prev, curr) => 
      Math.abs(curr - year) < Math.abs(prev - year) ? curr : prev
    );
    // Return movies without year information
    return popularMoviesByYear[closestYear];
  }
  
  return popularMoviesByYear[year];
};

const getPopularAlbums = (year: number): string[] => {
  const popularAlbumsByYear: Record<number, string[]> = {
    1970: ["Bridge Over Troubled Water - Simon & Garfunkel", "Let It Be - The Beatles", "Black Sabbath - Black Sabbath"],
    1971: ["Sticky Fingers - The Rolling Stones", "What's Going On - Marvin Gaye", "Led Zeppelin IV - Led Zeppelin"],
    1972: ["The Rise and Fall of Ziggy Stardust - David Bowie", "Exile on Main St. - The Rolling Stones", "Harvest - Neil Young"],
    1973: ["The Dark Side of the Moon - Pink Floyd", "Innervisions - Stevie Wonder", "Goodbye Yellow Brick Road - Elton John"],
    1974: ["Court and Spark - Joni Mitchell", "Autobahn - Kraftwerk", "Born to Run - Bruce Springsteen"],
    1975: ["Wish You Were Here - Pink Floyd", "Blood on the Tracks - Bob Dylan", "A Night at the Opera - Queen"],
    1976: ["Songs in the Key of Life - Stevie Wonder", "Hotel California - Eagles", "Station to Station - David Bowie"],
    1977: ["Rumours - Fleetwood Mac", "Never Mind the Bollocks - Sex Pistols", "Exodus - Bob Marley & The Wailers"],
    1978: ["Darkness on the Edge of Town - Bruce Springsteen", "Parallel Lines - Blondie", "Some Girls - The Rolling Stones"],
    1979: ["London Calling - The Clash", "The Wall - Pink Floyd", "Off the Wall - Michael Jackson"],
    1980: ["Back in Black - AC/DC", "Remain in Light - Talking Heads", "The River - Bruce Springsteen"],
    1981: ["Moving Pictures - Rush", "Computer World - Kraftwerk", "Faith - The Cure"],
    1982: ["Thriller - Michael Jackson", "The Number of the Beast - Iron Maiden", "Nebraska - Bruce Springsteen"],
    1983: ["Synchronicity - The Police", "War - U2", "Murmur - R.E.M."],
    1984: ["Purple Rain - Prince", "Born in the U.S.A. - Bruce Springsteen", "Like a Virgin - Madonna"],
    1985: ["Brothers in Arms - Dire Straits", "Hounds of Love - Kate Bush", "Fables of the Reconstruction - R.E.M."],
    1986: ["The Queen Is Dead - The Smiths", "Master of Puppets - Metallica", "Graceland - Paul Simon"],
    1987: ["The Joshua Tree - U2", "Sign o' the Times - Prince", "Appetite for Destruction - Guns N' Roses"],
    1988: ["Straight Outta Compton - N.W.A.", "Daydream Nation - Sonic Youth", "Surfer Rosa - Pixies"],
    1989: ["Doolittle - Pixies", "Paul's Boutique - Beastie Boys", "Disintegration - The Cure"],
    1990: ["Violator - Depeche Mode", "The Immaculate Collection - Madonna", "Rhythm Nation 1814 - Janet Jackson"],
    1991: ["Nevermind - Nirvana", "Achtung Baby - U2", "Ten - Pearl Jam"],
    1992: ["The Chronic - Dr. Dre", "Automatic for the People - R.E.M.", "Rage Against the Machine - Rage Against the Machine"],
    1993: ["Enter the Wu-Tang (36 Chambers) - Wu-Tang Clan", "Siamese Dream - Smashing Pumpkins", "Pablo Honey - Radiohead"],
    1994: ["Illmatic - Nas", "The Downward Spiral - Nine Inch Nails", "Definitely Maybe - Oasis"],
    1995: ["(What's the Story) Morning Glory? - Oasis", "The Bends - Radiohead", "Mellon Collie and the Infinite Sadness - The Smashing Pumpkins"],
    1996: ["Endtroducing..... - DJ Shadow", "Reasonable Doubt - Jay-Z", "If You're Feeling Sinister - Belle & Sebastian"],
    1997: ["OK Computer - Radiohead", "Homework - Daft Punk", "Either/Or - Elliott Smith"],
    1998: ["Mezzanine - Massive Attack", "In the Aeroplane Over the Sea - Neutral Milk Hotel", "The Miseducation of Lauryn Hill - Lauryn Hill"],
    1999: ["The Slim Shady LP - Eminem", "The Soft Bulletin - The Flaming Lips", "Play - Moby"],
    2000: ["Kid A - Radiohead", "Stankonia - OutKast", "The Marshall Mathers LP - Eminem"],
    2001: ["Is This It - The Strokes", "Discovery - Daft Punk", "Amnesiac - Radiohead"],
    2002: ["A Rush of Blood to the Head - Coldplay", "Sea Change - Beck", "Songs for the Deaf - Queens of the Stone Age"],
    2003: ["Elephant - The White Stripes", "Speakerboxxx/The Love Below - OutKast", "Room on Fire - The Strokes"],
    2004: ["Funeral - Arcade Fire", "American Idiot - Green Day", "The College Dropout - Kanye West"],
    2005: ["Late Registration - Kanye West", "Illinois - Sufjan Stevens", "Silent Alarm - Bloc Party"],
    2006: ["Whatever People Say I Am, That's What I'm Not - Arctic Monkeys", "Back to Black - Amy Winehouse", "The Life Pursuit - Belle & Sebastian"],
    2007: ["In Rainbows - Radiohead", "Graduation - Kanye West", "Sound of Silver - LCD Soundsystem"],
    2008: ["Dear Science - TV on the Radio", "For Emma, Forever Ago - Bon Iver", "Viva la Vida or Death and All His Friends - Coldplay"],
    2009: ["xx - The xx", "Merriweather Post Pavilion - Animal Collective", "Wolfgang Amadeus Phoenix - Phoenix"],
    2010: ["My Beautiful Dark Twisted Fantasy - Kanye West", "The Suburbs - Arcade Fire", "This Is Happening - LCD Soundsystem"],
    2011: ["Bon Iver - Bon Iver", "House of Balloons - The Weeknd", "Let England Shake - PJ Harvey"],
    2012: ["Channel Orange - Frank Ocean", "good kid, m.A.A.d city - Kendrick Lamar", "Lonerism - Tame Impala"],
    2013: ["Random Access Memories - Daft Punk", "Modern Vampires of the City - Vampire Weekend", "Yeezus - Kanye West"],
    2014: ["Lost in the Dream - The War on Drugs", "1989 - Taylor Swift", "To Pimp a Butterfly - Kendrick Lamar"],
    2015: ["Currents - Tame Impala", "Carrie & Lowell - Sufjan Stevens", "In Colour - Jamie xx"],
    2016: ["Blonde - Frank Ocean", "A Seat at the Table - Solange", "Blackstar - David Bowie"],
    2017: ["DAMN. - Kendrick Lamar", "Melodrama - Lorde", "Ctrl - SZA"],
    2018: ["Golden Hour - Kacey Musgraves", "Dirty Computer - Janelle Monáe", "Be the Cowboy - Mitski"],
    2019: ["Norman Fucking Rockwell! - Lana Del Rey", "IGOR - Tyler, the Creator", "When We All Fall Asleep, Where Do We Go? - Billie Eilish"],
    2020: ["Folklore - Taylor Swift", "Future Nostalgia - Dua Lipa", "Fetch the Bolt Cutters - Fiona Apple"],
    2021: ["Sour - Olivia Rodrigo", "Promises - Floating Points, Pharoah Sanders & The London Symphony Orchestra", "Call Me If You Get Lost - Tyler, the Creator"],
    2022: ["Midnights - Taylor Swift", "Renaissance - Beyoncé", "Un Verano Sin Ti - Bad Bunny"],
    2023: ["Did You Know That There's a Tunnel Under Ocean Blvd - Lana Del Rey", "The Record - boygenius", "Guts - Olivia Rodrigo"],
    2024: ["Cowboy Carter - Beyoncé", "Hit Me Hard and Soft - Billie Eilish", "The Rise and Fall of a Midwest Princess - Chappell Roan"],
    2025: ["Utopia (Deluxe) - Travis Scott", "The Next Wave - Olivia Rodrigo", "Ultraromance - The Weeknd"]
  };
  
  // If we don't have data for the specific year, return albums from the closest year
  if (!popularAlbumsByYear[year]) {
    const years = Object.keys(popularAlbumsByYear).map(Number);
    const closestYear = years.reduce((prev, curr) => 
      Math.abs(curr - year) < Math.abs(prev - year) ? curr : prev
    );
    // Return albums without year information
    return popularAlbumsByYear[closestYear];
  }
  
  return popularAlbumsByYear[year];
};

export default function PlayPage() {
  return (
    <ErrorBoundary fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-bold text-red-500 mb-4">Something went wrong</h2>
          <p className="text-gray-700 mb-4">
            We encountered an error while loading the game.
          </p>
          <Link 
            href="/"
            className="bg-gray-900 text-white py-2 px-4 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors inline-block"
          >
            Back to Home
          </Link>
          <button 
            onClick={() => window.location.reload()} 
            className="ml-2 bg-white text-gray-800 py-2 px-4 rounded-full text-sm font-medium border border-gray-300 hover:bg-gray-100 transition-colors inline-block"
          >
            Try Again
          </button>
        </div>
      </div>
    }>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-gray-900 rounded-full" />
        </div>
      }>
        <PlayContent />
      </Suspense>
    </ErrorBoundary>
  );
}

function PlayContent() {
  const searchParams = useSearchParams();
  const archiveDate = searchParams.get('date');
  const archiveYear = searchParams.get('year');
  const showHowToPlay = searchParams.get('view') === 'howToPlay';

  // Use archive year if provided, otherwise use daily year
  const yearData = useDailyYear();
  const dailyYear = yearData.dailyYear;
  const targetYear = archiveYear ? parseInt(archiveYear) : dailyYear;
  const isArchiveGame = Boolean(archiveDate && archiveYear);

  // Initialize game state with reducer
  const [gameState, dispatch] = useReducer(gameReducer, {
    view: 'movie',
    showCongrats: false,
    congratsMessage: '',
    showMenu: false,
    showHowToPlay: showHowToPlay || false,
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
  
  // Set document title based on game type
  useEffect(() => {
    if (isArchiveGame && archiveDate) {
      document.title = `Double Feature | Archive: ${format(new Date(archiveDate), 'MMM d, yyyy')}`;
    } else {
      document.title = 'Double Feature | Daily Challenge';
    }
  }, [isArchiveGame, archiveDate]);

  // Load popular media only when needed
  useEffect(() => {
    if (!targetYear) return;
    
    if (hasMaxMovieGuesses && !hasWonMovie) {
      setPopularMovies(getPopularMovies(targetYear as number));
    }
    
    if (hasMaxAlbumGuesses && !hasWonAlbum) {
      setPopularAlbums(getPopularAlbums(targetYear as number));
    }
  }, [targetYear, hasMaxMovieGuesses, hasWonMovie, hasMaxAlbumGuesses, hasWonAlbum]);

  // Handle guesses
  const handleMovieGuess = useCallback((guess: Guess) => {
    setMovieGuesses(prev => [...prev, guess]);
    if (guess.correct) {
      dispatch({ type: 'SHOW_CONGRATS', message: `You found a movie from ${targetYear}!` });
      setTimeout(() => {
        dispatch({ type: 'HIDE_CONGRATS' });
        dispatch({ type: 'SWITCH_TO_ALBUM' });
      }, 2000);
    } else if ([...movieGuesses, guess].length >= 3) {
      // Show popular movies when user reaches max guesses without a correct answer
      setTimeout(() => {
        dispatch({ type: 'SHOW_POPULAR_ANSWERS' });
      }, 1000);
    }
  }, [targetYear, movieGuesses]);

  const handleAlbumGuess = useCallback((guess: Guess) => {
    setAlbumGuesses(prev => [...prev, guess]);
    if (guess.correct) {
      dispatch({ type: 'SHOW_CONGRATS', message: `You found an album from ${targetYear}!` });
      setTimeout(() => dispatch({ type: 'HIDE_CONGRATS' }), 2000);
    } else if ([...albumGuesses, guess].length >= 3) {
      // Show popular albums when user reaches max guesses without a correct answer
      setTimeout(() => {
        dispatch({ type: 'SHOW_POPULAR_ANSWERS' });
      }, 1000);
    }
  }, [targetYear, albumGuesses]);

  // Show loading state if we don't have a year yet
  if (yearData.isLoading || !targetYear) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-gray-900 rounded-full" />
      </div>
    );
  }

  // Show error state if there was an error
  if (yearData.error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">
          Error: {yearData.error}
          <button 
            onClick={() => window.location.reload()} 
            className="ml-4 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

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
        <button 
          className="text-2xl text-gray-800 hover:text-black transition-colors"
          onClick={() => dispatch({ type: 'TOGGLE_MENU' })}
        >
          ⋯
        </button>
      </header>

      {/* Menu Dropdown */}
      {gameState.showMenu && (
        <div className="absolute right-4 top-14 bg-white shadow-md rounded-lg z-40 p-2 min-w-[150px] border border-gray-100">
          <div className="py-1">
            <button
              onClick={() => {
                dispatch({ type: 'SHOW_HOW_TO_PLAY' });
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded transition-colors text-gray-800"
            >
              How To Play
            </button>
          </div>
          {isGameComplete && (
            <div className="py-1 mt-1 border-t border-gray-100">
              <button
                onClick={() => {
                  window.location.reload();
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded transition-colors text-gray-800"
              >
                Reset Game
              </button>
            </div>
          )}
        </div>
      )}

      {/* How To Play Modal */}
      {gameState.showHowToPlay && (
        <HowToPlay onClose={() => dispatch({ type: 'HIDE_HOW_TO_PLAY' })} />
      )}

      {/* Congratulations overlay */}
      {gameState.showCongrats && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-8 rounded-lg text-center shadow-xl">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Correct! 🎉</h2>
            <p className="mb-4 text-gray-800">{gameState.congratsMessage}</p>
            {gameState.view === 'movie' && (
              <p className="text-sm text-gray-600">Moving to album section...</p>
            )}
            {gameState.view === 'album' && isGameComplete && (
              <p className="text-sm text-gray-600">You've completed today's challenge!</p>
            )}
          </div>
        </div>
      )}

      {/* Popular Answers Modal */}
      {gameState.showPopularAnswers && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-gray-900">
              {gameState.view === 'movie' ? 'Popular Movies from ' : 'Popular Albums from '}{targetYear}
            </h2>
            
            <p className="mb-4 text-gray-700">
              Here are some popular {gameState.view === 'movie' ? 'movies' : 'albums'} released in {targetYear}:
            </p>
            
            <ul className="space-y-2 mb-6">
              {gameState.view === 'movie' 
                ? popularMovies.map((movie, index) => (
                    <li key={index} className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg flex justify-between items-center">
                      <span className="font-medium text-gray-800">{movie}</span>
                      <span className="text-emerald-600">✔️</span>
                    </li>
                  ))
                : popularAlbums.map((album, index) => (
                    <li key={index} className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg flex justify-between items-center">
                      <span className="font-medium text-gray-800">{album}</span>
                      <span className="text-emerald-600">✔️</span>
                    </li>
                  ))
              }
            </ul>
            
            {gameState.view === 'movie' ? (
              <button
                onClick={() => {
                  dispatch({ type: 'HIDE_POPULAR_ANSWERS' });
                  dispatch({ type: 'SWITCH_TO_ALBUM' });
                }}
                className="w-full py-2 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
              >
                Continue to Albums →
              </button>
            ) : (
              <button
                onClick={() => dispatch({ type: 'HIDE_POPULAR_ANSWERS' })}
                className="w-full py-2 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
              >
                Got it
              </button>
            )}
          </div>
        </div>
      )}

      {/* Archive mode badge */}
      {isArchiveGame && (
        <div className="bg-amber-100 text-amber-800 px-4 py-2 text-sm text-center w-full">
          Playing archive challenge from {archiveDate ? format(new Date(archiveDate), 'MMMM d, yyyy') : ''}
        </div>
      )}

      {/* Main game area */}
      <main className="flex-1 w-full max-w-md flex flex-col items-center justify-center px-4 py-8">
        <h1 className="text-6xl font-bold mb-8 text-gray-900">{targetYear}</h1>
        
        <div className="mb-8">
          <span className="text-4xl">{gameState.view === 'movie' ? '🎬' : '🎵'}</span>
        </div>

        {gameState.view === 'movie' ? (
          <MovieSearch 
            dailyYear={targetYear as number}
            onGuess={handleMovieGuess}
            disabled={isMovieComplete}
          />
        ) : (
          <AlbumSearch 
            dailyYear={targetYear as number}
            onGuess={handleAlbumGuess}
            disabled={isAlbumComplete}
          />
        )}

        {/* Guess indicators */}
        <div className="flex space-x-4 mt-8">
          {[...Array(3)].map((_, i) => {
            const guesses = gameState.view === 'movie' ? movieGuesses : albumGuesses;
            return (
              <div 
                key={`guess-${i}`}
                className={`w-6 h-6 rounded-full ${
                  i < guesses.length 
                    ? (guesses[i].correct 
                        ? 'bg-emerald-500 border-emerald-500' 
                        : 'bg-rose-500 border-rose-500') 
                    : 'bg-white border-2 border-gray-200'
                }`}
              />
            );
          })}
        </div>
        
        {/* Stacked wrong guesses */}
        <div className="mt-6 w-full space-y-2">
          {gameState.view === 'movie' && 
            movieGuesses.filter(guess => !guess.correct).map((guess, index) => (
              <div 
                key={`wrong-movie-${index}`}
                className="p-3 rounded-lg bg-rose-50 border border-rose-100 w-full"
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-800">{guess.title}</span>
                  <span>❌</span>
                </div>
              </div>
            ))
          }
              
          {gameState.view === 'album' && 
            albumGuesses.filter(guess => !guess.correct).map((guess, index) => (
              <div 
                key={`wrong-album-${index}`}
                className="p-3 rounded-lg bg-rose-50 border border-rose-100 w-full"
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-800">{guess.title}</span>
                  <span>❌</span>
                </div>
              </div>
            ))
          }
          
          {/* Correct guess (if any) */}
          {gameState.view === 'movie' && movieGuesses.find(guess => guess.correct) && (
            <div 
              className="p-3 rounded-lg bg-emerald-50 border border-emerald-100 w-full"
            >
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-800">{movieGuesses.find(guess => guess.correct)?.title}</span>
                <span className="text-emerald-600">✔️</span>
              </div>
            </div>
          )}
          
          {gameState.view === 'album' && albumGuesses.find(guess => guess.correct) && (
            <div 
              className="p-3 rounded-lg bg-emerald-50 border border-emerald-100 w-full"
            >
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-800">{albumGuesses.find(guess => guess.correct)?.title}</span>
                <span className="text-emerald-600">✔️</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Navigation buttons */}
        {hasWonMovie && gameState.view === 'movie' && !gameState.showCongrats && (
          <button
            className="mt-6 bg-gray-900 text-white py-3 px-6 rounded-full font-medium hover:bg-gray-800 transition-colors shadow-sm"
            onClick={() => dispatch({ type: 'SWITCH_TO_ALBUM' })}
          >
            Continue to Albums →
          </button>
        )}
        
        {hasMaxMovieGuesses && !hasWonMovie && gameState.view === 'movie' && !gameState.showPopularAnswers && (
          <div className="mt-6 text-center">
            <p className="text-rose-600 font-medium">No more guesses!</p>
            <p className="text-sm text-gray-600 mt-1">Showing popular movies from {targetYear}...</p>
          </div>
        )}
        
        {isMovieComplete && gameState.view === 'album' && (
          <button
            className="mt-6 bg-gray-900 text-white py-3 px-6 rounded-full font-medium hover:bg-gray-800 transition-colors shadow-sm"
            onClick={() => dispatch({ type: 'SWITCH_TO_MOVIE' })}
          >
            ← Back to Movies
          </button>
        )}

        {/* Game completion message and share */}
        {isGameComplete && !gameState.showPopularAnswers && (
          <div className="mt-8 text-center p-4 bg-emerald-50 rounded-lg border border-emerald-100 w-full shadow-sm">
            <h3 className="text-xl font-bold mb-2 text-gray-900">
              {hasWonMovie || hasWonAlbum ? "Challenge Complete! 🎉" : "Challenge Finished"}
            </h3>
            
            {hasWonMovie && hasWonAlbum ? (
              <p className="mb-4 text-gray-800">You've found both a movie and an album from {targetYear}!</p>
            ) : hasWonMovie ? (
              <p className="mb-4 text-gray-800">You found a movie from {targetYear}, but not an album.</p>
            ) : hasWonAlbum ? (
              <p className="mb-4 text-gray-800">You found an album from {targetYear}, but not a movie.</p>
            ) : (
              <p className="mb-4 text-gray-800">
                Better luck next time! You can see popular movies and albums from {targetYear} below.
              </p>
            )}
            
            {/* Show Popular Answers buttons */}
            <div className="mt-4 mb-6 flex flex-col space-y-2">
              {hasMaxMovieGuesses && !hasWonMovie && (
                <button
                  onClick={() => {
                    dispatch({ type: 'SWITCH_TO_MOVIE' });
                    dispatch({ type: 'SHOW_POPULAR_ANSWERS' });
                  }}
                  className="bg-gray-900 text-white py-2 px-4 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  Show Popular Movies
                </button>
              )}
              
              {hasMaxAlbumGuesses && !hasWonAlbum && (
                <button
                  onClick={() => {
                    dispatch({ type: 'SWITCH_TO_ALBUM' });
                    dispatch({ type: 'SHOW_POPULAR_ANSWERS' });
                  }}
                  className="bg-gray-900 text-white py-2 px-4 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  Show Popular Albums
                </button>
              )}
            </div>
            
            <div className="mt-6">
              <ShareResults 
                dailyYear={targetYear as number}
                movieGuesses={movieGuesses}
                albumGuesses={albumGuesses}
                isArchiveGame={isArchiveGame}
              />
            </div>
            
            <div className="mt-6 flex flex-col space-y-2">
              <Link
                href="/"
                className="bg-gray-900 text-white py-2 px-4 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                Back to Main Menu
              </Link>
              
              <Link
                href="/archive"
                className="bg-white text-gray-800 py-2 px-4 rounded-full text-sm font-medium border border-gray-300 hover:bg-gray-100 transition-colors"
              >
                View Archive
              </Link>
            </div>
            
            <p className="text-sm text-gray-600 mt-4">Come back tomorrow for a new challenge!</p>
          </div>
        )}
      </main>
    </div>
  );
} 