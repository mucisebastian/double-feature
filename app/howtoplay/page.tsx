'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function HowToPlayPage() {
  const router = useRouter();
  const [referrer, setReferrer] = useState<string | null>(null);
  
  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') return;
    
    // Get the referrer from document.referrer or sessionStorage
    const docReferrer = document.referrer;
    let storedReferrer = null;
    
    try {
      storedReferrer = sessionStorage.getItem('howToPlayReferrer');
    } catch (error) {
      console.error('Error accessing sessionStorage:', error);
    }
    
    // If coming from /play, store that as referrer
    if (docReferrer && docReferrer.includes('/play')) {
      setReferrer('/play');
      try {
        sessionStorage.setItem('howToPlayReferrer', '/play');
      } catch (error) {
        console.error('Error setting sessionStorage:', error);
      }
    } else if (storedReferrer) {
      setReferrer(storedReferrer);
    } else {
      setReferrer('/');
    }
    
    console.log('HowToPlay referrer:', docReferrer || storedReferrer || '/');
  }, []);
  
  const handleBackClick = () => {
    // Navigate back to the referrer page
    if (referrer) {
      router.push(referrer);
    } else {
      router.push('/');
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-white">
      {/* Header */}
      <header className="w-full p-4 flex justify-between items-center border-b border-gray-100">
        <button 
          onClick={handleBackClick}
          className="text-gray-800 hover:text-black transition-colors"
        >
          <span className="text-2xl">←</span>
        </button>
        <h1 className="text-xl font-bold text-gray-900">How To Play</h1>
        <div className="w-8"></div> {/* Spacer for alignment */}
      </header>

      {/* Main content */}
      <main className="flex-1 w-full max-w-md mx-auto px-4 py-8">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="space-y-8">
            <section>
              <h2 className="font-bold text-xl mb-3">1. THE YEAR IS REVEALED</h2>
              <p className="text-gray-700">
                A random year will appear at the top of the screen. Your goal is to guess <strong>ONE FILM</strong> and <strong>ONE ALBUM</strong> released in that exact year.
              </p>
            </section>

            <section>
              <h2 className="font-bold text-xl mb-3">2. GUESS THE FILM FIRST</h2>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li>Type your guess under "🎬" and submit.</li>
                <li>You get <strong>3 tries</strong> to guess the correct film.</li>
                <li>After each guess, you'll see hints (e.g., <span className="text-emerald-500">✓</span> if correct, <span className="text-rose-500">❌</span> if wrong).</li>
                <li className="mt-2">
                  <strong>Example (Year: 1994):</strong><br />
                  <span className="flex items-center">
                    <span className="mr-1">🎬</span> Guess 1: "Forrest Gump" → <span className="text-rose-500">❌</span> (Wrong)
                  </span>
                  <span className="flex items-center">
                    <span className="mr-1">🎬</span> Guess 2: "Pulp Fiction" → <span className="text-emerald-500">✓</span> (Correct!)
                  </span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-bold text-xl mb-3">3. THEN GUESS THE ALBUM</h2>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li>Once you solve the film, the year stays the same. Now guess an <strong>ALBUM</strong> from that year.</li>
                <li>Again, you get <strong>3 tries</strong>.</li>
                <li className="mt-2">
                  <strong>Example (Year: 1994):</strong><br />
                  <span className="flex items-center">
                    <span className="mr-1">🎵</span> Guess 1: "Frank - Amy Winehouse" → <span className="text-rose-500">❌</span> (Wrong)
                  </span>
                  <span className="flex items-center">
                    <span className="mr-1">🎵</span> Guess 2: "Illmatic - Nas" → <span className="text-emerald-500">✓</span> (Correct!)
                  </span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-bold text-xl mb-3">4. DAILY CHALLENGE</h2>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li>A new year drops every day! Can you solve both the film and album?</li>
                <li>Stuck? After 3 wrong guesses, the most popular answers are revealed.</li>
              </ul>
            </section>

            <p className="text-sm text-gray-600 italic mt-8 text-center">
              Made for music and movie nerds. 🎬🎵
            </p>
          </div>

          <div className="mt-8 text-center">
            <button 
              onClick={() => router.push('/play')}
              className="bg-[#2D0C0C] text-white py-2 px-6 rounded-full text-sm hover:bg-[#3D1C1C] transition-colors inline-block"
            >
              Start Playing
            </button>
          </div>
        </div>
      </main>
    </div>
  );
} 