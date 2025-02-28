/**
 * Utility functions for safely interacting with localStorage
 * These functions check if window is defined before accessing localStorage
 */

// Safe getter for localStorage
export const getLocalStorage = (key: string, defaultValue: any = null): any => {
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading localStorage key "${key}":`, error);
    return defaultValue;
  }
};

// Safe setter for localStorage
export const setLocalStorage = (key: string, value: any): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error setting localStorage key "${key}":`, error);
    return false;
  }
};

// Safe removal for localStorage
export const removeLocalStorage = (key: string): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  
  try {
    window.localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing localStorage key "${key}":`, error);
    return false;
  }
};

// Check if localStorage is available
export const isLocalStorageAvailable = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  
  try {
    const testKey = '__localStorage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
}; 