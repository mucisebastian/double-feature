'use client';

import { useEffect, useState } from 'react';
import { performDailyValidation, getTodaysYear } from '@/utils/archiveManager';

export default function YearValidator() {
  const [validationError, setValidationError] = useState<string | null>(null);
  const [refreshAttempts, setRefreshAttempts] = useState(0);
  const [forceShowGame, setForceShowGame] = useState(false);

  useEffect(() => {
    // Skip validation if we've already tried too many times or if user chose to continue
    if (refreshAttempts >= 2 || forceShowGame) {
      return;
    }

    const verifyUniqueYear = async () => {
      try {
        const validationPassed = await performDailyValidation();
        
        if (!validationPassed) {
          setValidationError(`System detected a duplicate year (${getTodaysYear()}). This may affect your gameplay experience.`);
          setRefreshAttempts(prev => prev + 1);
        }
      } catch (error) {
        console.error('Error during year validation:', error);
        // Don't show error to user for validation issues, just log it
      }
    };

    // Run validation on component mount
    verifyUniqueYear();
  }, [refreshAttempts, forceShowGame]);

  // Only render something if there's an error
  if (!validationError) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full text-center">
        <p className="text-red-600 font-medium mb-4">{validationError}</p>
        
        {refreshAttempts < 2 ? (
          <>
            <p className="text-gray-700 mb-4">Attempting to fix the issue...</p>
            <div className="mt-4 animate-spin h-8 w-8 border-t-2 border-b-2 border-red-600 rounded-full mx-auto"></div>
          </>
        ) : (
          <>
            <p className="text-gray-700 mb-4">
              We're having trouble generating a unique year. You can try again later or continue with the current challenge.
            </p>
            <div className="flex flex-col space-y-3 mt-6">
              <button 
                onClick={() => window.location.reload()}
                className="py-2 px-4 bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300 transition-colors"
              >
                Try Again
              </button>
              <button 
                onClick={() => setForceShowGame(true)}
                className="py-2 px-4 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
              >
                Continue Anyway
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 