import { useEffect } from 'react';
import { checkDailyReset } from '@/utils/archiveManager';

export const useArchiveRefresh = () => {
  useEffect(() => {
    // Initial check
    checkDailyReset();

    // Check every minute for midnight
    const checkMidnight = () => {
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        checkDailyReset();
        window.location.reload();
      }
    };
    
    const interval = setInterval(checkMidnight, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);
}; 