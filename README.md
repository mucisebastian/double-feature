# Double Feature

A daily challenge game where players guess a movie and an album from the same year.

## Features

- Daily challenges with a new year each day
- Archive of past challenges
- Movie search with TMDB API
- Album search with Spotify API
- Mobile-first responsive design
- Share results with friends

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Zustand (State Management)
- date-fns (Date Handling)
- Framer Motion (Animations)

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/double-feature.git
   cd double-feature
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file with your API keys (see `.env.example` for required variables)

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [(https://doublefeature.app/)](https://doublefeature.app/)] in your browser

## Deployment

This project is configured for deployment on Netlify. Simply connect your GitHub repository to Netlify and it will automatically deploy when you push to the main branch.

Make sure to add your environment variables in the Netlify dashboard.

## License

MIT 
