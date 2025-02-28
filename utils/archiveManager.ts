import { format } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
import { INITIAL_ARCHIVE } from '@/data/initialArchive';

const EST_TIMEZONE = 'America/New_York';
const ARCHIVE_KEY = 'doubleFeatureArchive';

export const initializeArchive = () => {
  if (typeof window === 'undefined') return;
  
  const stored = localStorage.getItem(ARCHIVE_KEY);
  if (!stored) {
    localStorage.setItem(ARCHIVE_KEY, JSON.stringify(INITIAL_ARCHIVE));
  }
};

export const getArchiveData = (): Array<{ date: string; year: number }> => {
  initializeArchive();
  const stored = localStorage.getItem(ARCHIVE_KEY)!;
  const data = JSON.parse(stored);
  
  return Object.entries(data)
    .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
    .map(([date, year]) => ({
      date: format(new Date(date), 'MMMM d, yyyy'),
      year: Number(year)
    }));
};

export const generateNewDailyYear = () => {
  const now = utcToZonedTime(new Date(), EST_TIMEZONE);
  const todayKey = format(now, 'yyyy-MM-dd');
  
  const stored = JSON.parse(localStorage.getItem(ARCHIVE_KEY)!);
  if (stored[todayKey]) return;

  const last5Years = Object.values(stored)
    .slice(-5)
    .map(Number);
  
  let newYear: number;
  do {
    newYear = 1970 + Math.floor(Math.random() * 56); // Years from 1970 to 2025
  } while (last5Years.some(y => Math.abs(y - newYear) < 5));

  const newArchive = { ...stored, [todayKey]: newYear };
  localStorage.setItem(ARCHIVE_KEY, JSON.stringify(newArchive));
}; 