'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Debounce function to limit API calls
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

interface SearchResult {
  id: string;
  title: string;
  details?: string;
}

interface SearchInputProps {
  placeholder: string;
  onSearch: (query: string) => Promise<SearchResult[]>;
  onSelect: (result: SearchResult) => void;
  onSubmit: (query: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
  value?: string;
}

export default function SearchInput({
  placeholder,
  onSearch,
  onSelect,
  onSubmit,
  isLoading = false,
  disabled = false,
  value = ''
}: SearchInputProps) {
  const [inputValue, setInputValue] = useState(value);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [localLoading, setLocalLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Update input value when external value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Handle input change with debounce
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    if (newValue.trim().length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }
    
    // Set new timeout for debounce
    setLocalLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const searchResults = await onSearch(newValue);
        setResults(searchResults);
        setShowResults(true);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setLocalLoading(false);
      }
    }, 300);
    
    setSearchTimeout(timeout);
  }, [onSearch, searchTimeout]);

  // Handle result selection
  const handleSelect = useCallback((result: SearchResult) => {
    onSelect(result);
    setInputValue('');
    setShowResults(false);
    setResults([]);
  }, [onSelect]);

  // Handle form submission
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSubmit(inputValue);
      setShowResults(false);
    }
  }, [inputValue, onSubmit]);

  // Handle click outside to close results
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        resultsRef.current && 
        !resultsRef.current.contains(e.target as Node) &&
        inputRef.current && 
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowResults(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled || isLoading}
          className="w-full p-3 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
          autoComplete="off"
        />
        
        {(isLoading || localLoading) && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="animate-spin h-5 w-5 border-t-2 border-b-2 border-black rounded-full"></div>
          </div>
        )}
        
        {!isLoading && !localLoading && inputValue && (
          <button
            type="button"
            onClick={() => setInputValue('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        )}
        
        <button type="submit" className="sr-only">Search</button>
      </form>
      
      <AnimatePresence>
        {showResults && results.length > 0 && (
          <motion.div
            ref={resultsRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            <ul>
              {results.map((result) => (
                <li key={result.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(result)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none transition-colors"
                  >
                    <div className="font-medium">{result.title}</div>
                    {result.details && (
                      <div className="text-sm text-gray-600">{result.details}</div>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
      
      {showResults && results.length === 0 && !isLoading && !localLoading && inputValue.trim().length >= 2 && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg p-4 text-center text-gray-500">
          No results found for this year
        </div>
      )}
    </div>
  );
} 