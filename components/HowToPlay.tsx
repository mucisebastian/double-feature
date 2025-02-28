'use client';

import { motion } from 'framer-motion';

export default function HowToPlay({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <button 
            onClick={onClose}
            className="text-2xl mr-2 text-gray-700 hover:text-black transition-colors"
          >
            ←
          </button>
          <h2 className="text-xl font-bold text-gray-900">How To Play</h2>
          <div className="w-8"></div>
        </div>

        <div className="space-y-6">
          <section>
            <h3 className="font-bold text-lg mb-2">1. THE YEAR IS REVEALED</h3>
            <p className="text-gray-700">
              A random year will appear at the top of the screen. Your goal is to guess ONE FILM and ONE ALBUM released in that exact year.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-lg mb-2">2. GUESS THE FILM FIRST</h3>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              <li>Type your guess under "🎬" and submit</li>
              <li>You get 3 tries to guess the correct film</li>
              <li>After each guess, you'll see if it's correct or not</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold text-lg mb-2">3. THEN GUESS THE ALBUM</h3>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              <li>Once you solve the film (or use all guesses), move to albums</li>
              <li>You get 3 tries to guess an album from the same year</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold text-lg mb-2">4. DAILY CHALLENGE</h3>
            <p className="text-gray-700">
              A new year drops every day at midnight! Come back daily for new challenges.
            </p>
          </section>
        </div>
      </motion.div>
    </motion.div>
  );
} 