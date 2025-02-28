'use client';
import { useEffect, useState } from 'react';

interface LoadingProps {
  timeout?: number;
}

export default function Loading({ timeout = 5000 }: LoadingProps) {
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowFallback(true);
    }, timeout);

    return () => clearTimeout(timer);
  }, [timeout]);

  return showFallback ? (
    <div className="p-4 text-center">
      <p className="text-red-500 mb-2">Taking too long to load?</p>
      <button 
        onClick={() => window.location.reload()} 
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Refresh Page
      </button>
    </div>
  ) : (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-gray-900 rounded-full"></div>
    </div>
  );
} 