'use client';

import { motion } from 'framer-motion';

interface GuessItemProps {
  guess: string;
  isCorrect: boolean;
  message?: string;
}

export function GuessItem({ guess, isCorrect, message }: GuessItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={`p-3 rounded-lg flex items-center justify-between ${
        isCorrect 
          ? 'bg-green-100 border border-green-200' 
          : 'bg-red-100 border border-red-200'
      }`}
    >
      <div className="flex items-center">
        <div 
          className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
            isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}
        >
          {isCorrect ? '✓' : '✗'}
        </div>
        <span className="font-medium">{guess}</span>
      </div>
      
      {message && (
        <span 
          className={`text-sm ${
            isCorrect ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {message}
        </span>
      )}
    </motion.div>
  );
} 