'use client';

import { useEffect, useState } from 'react';

interface LoadingProps {
  timeout?: number;
  message?: string;
}

export default function Loading({ timeout = 5000, message = 'Loading...' }: LoadingProps) {
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowFallback(true);
    }, timeout);

    return () => clearTimeout(timer);
  }, [timeout]);

  if (showFallback) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] p-4 text-center">
        <p className="text-red-500 mb-2">Taking too long to load</p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm hover:bg-blue-700 transition-colors"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] p-4">
      <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-gray-900 rounded-full mb-4"></div>
      <p className="text-gray-600">{message}</p>
    </div>
  );
} 