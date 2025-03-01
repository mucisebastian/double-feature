// Seed date for deterministic shuffle
export const SEED_DATE = "2024-02-19";

// Initial set of predefined challenges using Map for better tracking
export const YEAR_HISTORY = new Map([
  ['2024-02-20', 2020],
  ['2024-02-21', 1976],
  ['2024-02-22', 2018],
  ['2024-02-23', 1990],
  ['2024-02-24', 1982],
  ['2024-02-25', 2015],
  ['2024-02-26', 1986],
  ['2024-02-27', 2005],
  ['2024-02-28', 2010]
]);

// Convert Map to object for compatibility with existing code
export const INITIAL_YEARS = Object.fromEntries(YEAR_HISTORY.entries());

// Generate all possible years (1970-2024)
export const ALL_YEARS = Array.from({length: 2024-1970+1}, (_, i) => 1970 + i);

// Create a Set of used years for O(1) lookups
export const USED_YEARS = new Set(YEAR_HISTORY.values());

// Generate candidate years excluding those already in initial years
export const CANDIDATE_YEARS = ALL_YEARS.filter(y => !USED_YEARS.has(y));

// Validate no duplicate years in initial data
if (typeof window !== 'undefined') {
  const years = Array.from(YEAR_HISTORY.values());
  if (new Set(years).size !== years.length) {
    console.error('Duplicate years in initial dataset!');
  }
  
  // Verify candidate years are unique and non-overlapping
  const overlap = CANDIDATE_YEARS.some(y => USED_YEARS.has(y));
  if (overlap) {
    console.error('Candidate years overlap with initial dataset!');
  }
} 