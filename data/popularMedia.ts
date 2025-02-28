export const popularMoviesByYear: Record<number, string[]> = {
  1970: ["Patton", "M*A*S*H", "Five Easy Pieces"],
  1971: ["A Clockwork Orange", "The French Connection", "Dirty Harry"],
  // ... rest of the movies data
};

export const popularAlbumsByYear: Record<number, string[]> = {
  1970: ["Bridge Over Troubled Water - Simon & Garfunkel", "Let It Be - The Beatles", "Black Sabbath - Black Sabbath"],
  1971: ["Sticky Fingers - The Rolling Stones", "What's Going On - Marvin Gaye", "Led Zeppelin IV - Led Zeppelin"],
  // ... rest of the albums data
};

export const getPopularMedia = (year: number, type: 'movies' | 'albums'): string[] => {
  const data = type === 'movies' ? popularMoviesByYear : popularAlbumsByYear;
  
  // If we don't have data for the specific year, return media from the closest year
  if (!data[year]) {
    const years = Object.keys(data).map(Number);
    const closestYear = years.reduce((prev, curr) => 
      Math.abs(curr - year) < Math.abs(prev - year) ? curr : prev
    );
    return data[closestYear].map(item => `${item} (from ${closestYear})`);
  }
  
  return data[year];
}; 