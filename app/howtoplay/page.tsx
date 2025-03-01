'use client';

import Link from 'next/link';

export default function HowToPlayPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link 
            href="/" 
            className="text-gray-600 hover:text-gray-900 text-sm inline-flex items-center"
          >
            ← Back to Main Menu
          </Link>
          <h1 className="text-3xl font-bold text-center">How To Play</h1>
          <div className="w-20"></div> {/* Spacer for alignment */}
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-8">
          {/* Objective */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <span className="mr-2">🎯</span> Objective
            </h2>
            <p className="text-gray-700">
              Guess one movie and one album released in the daily year. Each day at midnight EST, 
              a new year is revealed for you to test your movie and music knowledge.
            </p>
          </section>
          
          {/* Rules */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <span className="mr-2">📋</span> Rules
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>You get <strong>3 guesses</strong> for each category (movies and albums)</li>
              <li>The year is the same for both categories</li>
              <li>You must guess a movie first, then an album</li>
              <li>Guesses must match the <strong>exact release year</strong></li>
              <li>After 3 incorrect guesses, popular answers will be revealed</li>
              <li>A new challenge is available every day at midnight EST</li>
              <li>After each guess, you'll see hints (e.g., <span className="text-emerald-500">✔️</span> if correct, <span className="text-rose-500">❌</span> if wrong).</li>
            </ul>
          </section>
          
          {/* Example */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <span className="mr-2">💡</span> Example
            </h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-bold text-xl mb-2">Today's Year: 1994</p>
              
              <div className="mb-4">
                <p className="font-semibold mb-2">🎬 Movie Guesses:</p>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <span className="w-6 h-6 rounded-full bg-rose-500 mr-2"></span>
                    <span>Guess 1: "Titanic" (1997) - ❌ Wrong year</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-6 h-6 rounded-full bg-emerald-500 mr-2"></span>
                    <span>Guess 2: "Pulp Fiction" (1994) - ✔️ Correct!</span>
                  </div>
                </div>
              </div>
              
              <div>
                <p className="font-semibold mb-2">🎵 Album Guesses:</p>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <span className="w-6 h-6 rounded-full bg-rose-500 mr-2"></span>
                    <span>Guess 1: "OK Computer" (1997) - ❌ Wrong year</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-6 h-6 rounded-full bg-rose-500 mr-2"></span>
                    <span>Guess 2: "Nevermind" (1991) - ❌ Wrong year</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-6 h-6 rounded-full bg-emerald-500 mr-2"></span>
                    <span>Guess 3: "The Downward Spiral" (1994) - ✔️ Correct!</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
          
          {/* Start Playing */}
          <div className="text-center pt-4">
            <Link 
              href="/play" 
              className="bg-[#2D0C0C] text-white py-3 px-8 rounded-full text-lg font-medium hover:bg-[#3D1C1C] transition-colors inline-block"
            >
              Start Playing
            </Link>
            <p className="mt-6 text-gray-500 italic text-sm">
              inspired by my gf • made for film and music nerds 🎬🎵
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 