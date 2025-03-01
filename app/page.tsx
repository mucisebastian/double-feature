'use client';

import Link from 'next/link';
import { useEffect, useState, Suspense } from 'react';
import useDailyYear from '@/hooks/useDailyYear';
import { formatDate } from '@/utils/dateUtils';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Force dynamic rendering to handle useSearchParams
export const dynamic = 'force-dynamic';

export default function HomePage() {
  return (
    <ErrorBoundary fallback={
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-bold text-red-500 mb-4">Something went wrong</h2>
          <p className="text-gray-700 mb-4">
            We encountered an error while loading the page.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-gray-900 text-white py-2 px-4 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    }>
      <Suspense fallback={
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
          <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-gray-900 rounded-full"></div>
        </div>
      }>
        <HomeContent />
      </Suspense>
    </ErrorBoundary>
  );
}

function HomeContent() {
  const { dailyYear, today, challengeNumber } = useDailyYear();
  const [timeUntilNext, setTimeUntilNext] = useState('');
  
  // Calculate time until next challenge
  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const diff = tomorrow.getTime() - now.getTime();
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      return `${hours}h ${minutes}m ${seconds}s`;
    };
    
    const timer = setInterval(() => {
      setTimeUntilNext(calculateTimeRemaining());
    }, 1000);
    
    setTimeUntilNext(calculateTimeRemaining());
    
    return () => clearInterval(timer);
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full flex flex-col items-center">
        {/* Icons */}
        <div className="flex items-center justify-center space-x-6 mb-4">
          <span className="text-4xl">🎬</span>
          <span className="text-4xl">🎵</span>
        </div>
        
        {/* Logo/Title */}
        <div className="text-center mb-6">
          <h1 className="text-7xl font-black text-black tracking-tight leading-tight">
            DOUBLE<br />FEATURE
          </h1>
          <p className="text-gray-700 mt-4 text-lg">
            Get 3 chances to match the year
          </p>
        </div>
        
        {/* Menu Options */}
        <div className="w-full space-y-4 mt-4">
          <Link 
            href="/play" 
            className="block w-full py-3 bg-black text-white rounded-full text-center text-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Play Today's Challenge
          </Link>
          
          <Link 
            href="/howtoplay" 
            className="block w-full py-3 bg-white border border-gray-300 text-black rounded-full text-center text-lg font-medium hover:bg-gray-50 transition-colors"
          >
            How To Play
          </Link>
          
          <Link 
            href="/archive" 
            className="block w-full py-3 bg-white border border-gray-300 text-black rounded-full text-center text-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Past Challenges
          </Link>
        </div>
        
        {/* Challenge Info */}
        <div className="mt-16 text-center text-gray-600">
          {today && (
            <p>{formatDate(today)}</p>
          )}
          {challengeNumber && (
            <p className="mt-1">Challenge #{challengeNumber}</p>
          )}
          <p className="mt-1">Created by SM</p>
        </div>
      </div>
    </div>
  );
} 