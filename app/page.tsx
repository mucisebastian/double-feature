'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { differenceInDays, parseISO } from 'date-fns';

export default function Home() {
  const [gameNumber, setGameNumber] = useState(1);

  // Animation variants with smoother transitions
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  // Format date without date-fns
  const formatDate = () => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    };
    return today.toLocaleDateString('en-US', options);
  };

  // Calculate game number based on archive count + 1
  useEffect(() => {
    const calculateGameNumber = () => {
      // The archive starts from Feb 20, 2025
      const archiveStartDate = parseISO('2025-02-20');
      const today = new Date();
      
      // If today is before the archive start date, it's game #1
      if (today < archiveStartDate) {
        setGameNumber(1);
        return;
      }
      
      // Calculate days since archive start (including the start day)
      // Each day is one game in the archive, plus today's game
      const daysSinceStart = differenceInDays(today, archiveStartDate);
      const archiveCount = daysSinceStart;
      const currentGameNumber = archiveCount + 1;
      
      setGameNumber(currentGameNumber);
    };
    
    calculateGameNumber();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-b from-gray-50 to-gray-100 text-black">
      <motion.div 
        className="text-center max-w-md w-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="flex items-center justify-center mb-6">
          <motion.div 
            className="flex items-center space-x-3"
            variants={itemVariants}
          >
            <span className="text-5xl">🎬</span>
            <span className="text-5xl">🎵</span>
          </motion.div>
        </div>

        <motion.div 
          variants={itemVariants}
          className="mb-6"
        >
          <h1 className="font-black text-7xl tracking-tight leading-none">
            <span className="block mb-1">DOUBLE</span> 
            <span className="block">FEATURE</span>
          </h1>
        </motion.div>
        
        <motion.p 
          className="text-xl text-gray-600 mb-10 font-medium"
          variants={itemVariants}
        >
          Get 3 chances to match the year
        </motion.p>

        <motion.div 
          className="space-y-3 mb-12"
          variants={itemVariants}
        >
          <Link
            href="/play"
            className="block bg-black hover:bg-gray-800 text-white px-8 py-4 rounded-full
                     text-xl font-medium transition-all duration-300 hover:scale-102 shadow-sm hover:shadow-md w-full"
          >
            Play Today's Challenge
          </Link>
          
          <Link
            href="/howtoplay"
            className="block bg-white hover:bg-gray-50 text-black px-8 py-4 rounded-full
                     text-xl font-medium transition-all duration-300 hover:scale-102 shadow-sm hover:shadow-md border border-gray-200 w-full"
          >
            How To Play
          </Link>
          
          <Link 
            href="/archive" 
            className="block bg-white hover:bg-gray-50 text-black px-8 py-4 rounded-full
                     text-xl font-medium transition-all duration-300 hover:scale-102 shadow-sm hover:shadow-md border border-gray-200 w-full"
          >
            Past Challenges
          </Link>
        </motion.div>
        
        <motion.div 
          className="text-center text-gray-500 space-y-1"
          variants={itemVariants}
        >
          <p className="text-sm font-medium">{formatDate()}</p>
          <p className="text-sm font-medium">Challenge #{gameNumber}</p>
          <p className="text-sm mt-2">Created by SM</p>
        </motion.div>
      </motion.div>
    </main>
  );
} 