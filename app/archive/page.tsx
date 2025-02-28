'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getLocalStorage } from '@/utils/localStorage';

// Import any other components or utilities you need

export default function ArchivePage() {
  const [archiveData, setArchiveData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') return;
    
    try {
      // Load archive data from localStorage or API
      const data = getLocalStorage('archiveData', []);
      setArchiveData(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading archive data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <header className="w-full p-4 flex justify-between items-center border-b border-gray-100">
        <Link href="/" className="text-gray-800 hover:text-black transition-colors">
          <span className="text-2xl">←</span>
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Archive</h1>
        <div className="w-8"></div> {/* Spacer for alignment */}
      </header>

      <main className="max-w-md mx-auto p-4">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        ) : archiveData.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No past challenges found.</p>
            <p className="text-gray-500 text-sm mt-2">Complete today's challenge to start your collection!</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {archiveData.map((item, index) => (
              <Link 
                href={`/play?year=${item.year}&date=${item.date}`}
                key={index}
                className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="font-bold text-xl">{item.year}</h2>
                    <p className="text-gray-600 text-sm">{new Date(item.date).toLocaleDateString()}</p>
                  </div>
                  <div className="flex space-x-2">
                    <span className="text-xl">{item.movieSolved ? '🎬✓' : '🎬'}</span>
                    <span className="text-xl">{item.albumSolved ? '🎵✓' : '🎵'}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
} 