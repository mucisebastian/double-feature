'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getArchiveData, getTodaysYear } from '@/utils/archiveManager';
import { format, parseISO } from 'date-fns';
import { isSameDay } from '@/utils/dateUtils';

export default function ArchivePage() {
  const [visibleDays, setVisibleDays] = useState(7);
  const [archive, setArchive] = useState<Array<{
    date: string;
    year: number;
    formattedDate: string;
    isToday: boolean;
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadArchive = async () => {
      setIsLoading(true);
      
      // Get archive data
      const archiveData = getArchiveData();
      
      // Get today's date and year
      const today = new Date();
      const todayString = today.toISOString().split('T')[0];
      const todaysYear = getTodaysYear();
      
      // Mark today's entry and ensure it has the correct year
      const archiveWithToday = archiveData.map(entry => {
        const isCurrentDay = isSameDay(parseISO(entry.date), today);
        
        // If this is today's entry, make sure it has the correct year
        if (isCurrentDay) {
          return {
            ...entry,
            year: todaysYear, // Use the actual year for today's challenge
            isToday: true
          };
        }
        
        return {
          ...entry,
          isToday: false
        };
      });
      
      // If today isn't in the archive yet, add it
      const todayInArchive = archiveWithToday.some(entry => isSameDay(parseISO(entry.date), today));
      
      if (!todayInArchive) {
        archiveWithToday.unshift({
          date: todayString,
          year: todaysYear,
          formattedDate: format(today, 'MMMM d, yyyy'),
          isToday: true
        });
      }
      
      setArchive(archiveWithToday);
      setIsLoading(false);
    };

    loadArchive();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-grow p-4 max-w-md mx-auto w-full">
        <div className="mb-6 flex items-center">
          <Link href="/" className="text-black hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold ml-4">Past Challenges</h1>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-6">
              {archive.slice(0, visibleDays).map((entry, index) => (
                <div 
                  key={entry.date} 
                  className={`p-4 rounded-lg border ${entry.isToday ? 'bg-black text-white' : 'bg-white border-gray-200'}`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{entry.formattedDate}</p>
                      <p className={`text-lg font-bold ${entry.isToday ? 'text-white' : 'text-black'}`}>
                        {entry.year}
                        {entry.isToday && <span className="ml-2 text-xs bg-white text-black px-2 py-0.5 rounded-full">TODAY</span>}
                      </p>
                    </div>
                    <Link 
                      href={entry.isToday ? '/play' : `play?date=${entry.date}&year=${entry.year}`}
                      className={`px-4 py-2 rounded-full ${entry.isToday ? 'bg-white text-black' : 'bg-black text-white'} hover:opacity-90 transition-opacity`}
                    >
                      Play
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            
            {visibleDays < archive.length && (
              <div className="text-center">
                <button 
                  onClick={() => setVisibleDays(prev => prev + 7)}
                  className="py-2 px-4 bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300 transition-colors"
                >
                  Show More
                </button>
              </div>
            )}
            
            {/* Back to Today button */}
            <div className="fixed bottom-6 left-0 right-0 flex justify-center">
              <Link 
                href="/play"
                className="py-3 px-6 bg-black text-white rounded-full shadow-lg hover:bg-gray-800 transition-colors"
              >
                Back to Today's Challenge
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 