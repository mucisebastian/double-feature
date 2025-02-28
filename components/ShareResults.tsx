'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ShareResultsProps {
  dailyYear: number;
  movieGuesses: { title: string; correct: boolean }[];
  albumGuesses: { title: string; correct: boolean }[];
}

export default function ShareResults({ dailyYear, movieGuesses, albumGuesses }: ShareResultsProps) {
  const [copied, setCopied] = useState(false);
  
  // Calculate statistics
  const movieAttempts = movieGuesses.findIndex(guess => guess.correct) + 1 || movieGuesses.length;
  const albumAttempts = albumGuesses.findIndex(guess => guess.correct) + 1 || albumGuesses.length;
  const movieSuccess = movieGuesses.some(guess => guess.correct);
  const albumSuccess = albumGuesses.some(guess => guess.correct);
  
  // Generate date string
  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
  
  // Generate emoji grid
  const generateEmojiGrid = (guesses: { correct: boolean }[], maxGuesses: number = 3) => {
    let grid = '';
    
    for (let i = 0; i < guesses.length; i++) {
      grid += guesses[i].correct ? '🟩' : '🟥';
    }
    
    // Add empty squares for unused guesses
    for (let i = guesses.length; i < maxGuesses; i++) {
      grid += '⬜';
    }
    
    return grid;
  };
  
  // Generate share text
  const generateShareText = () => {
    return `Double Feature (${dateString}) - ${dailyYear}\n\n` +
           `🎬 Movie: ${generateEmojiGrid(movieGuesses)} ${movieSuccess ? movieAttempts : 'X'}/${movieGuesses.length}\n` +
           `🎵 Album: ${generateEmojiGrid(albumGuesses)} ${albumSuccess ? albumAttempts : 'X'}/${albumGuesses.length}\n\n` +
           `Play at: https://doublefeature.app`;
  };
  
  // Handle share button click
  const handleShare = async () => {
    const shareText = generateShareText();
    
    // Try to use the Web Share API if available
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Double Feature - ${dailyYear}`,
          text: shareText
        });
        return;
      } catch (err) {
        console.error('Error sharing:', err);
      }
    }
    
    // Fallback to clipboard
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = shareText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  return (
    <div className="w-full">
      <button
        onClick={handleShare}
        className="w-full bg-[#2D0C0C] text-white py-3 px-6 rounded-full font-medium hover:bg-[#3D1C1C] transition-colors flex items-center justify-center gap-2"
      >
        <span>{copied ? 'Copied to clipboard!' : 'Share Results'}</span>
        <span>{copied ? '📋' : '📢'}</span>
      </button>
      
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 text-center text-sm text-green-600"
          >
            Results copied! Share them with your friends.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 