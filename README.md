# Global Keyword Research App

A Next.js application for keyword research across 5 regions (India, USA, UK, Canada, Australia). This app fetches data from **SerpApi** containing primary keywords, related searches, competitors, and "People Also Ask" questions.

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```
   (This should have been run automatically)

2. **Configure API Key**
   - Provide your SerpApi key in `.env.local`:
     ```
     SERPAPI_KEY=your_actual_api_key_here
     ```
   - Get a key from [SerpApi](https://serpapi.com/).

3. **Run Development Server**
   ```bash
   npm run dev
   ```
   - Open [http://localhost:3000](http://localhost:3000)

## Features

- **Multi-Region Analysis**: Automatically fetches data for IN, US, UK, CA, AU.
- **4-Box Layout**: Displays Primary Keyword, Related Searches, Competitors, and PAA Questions.
- **Premium UI**: Dark mode with glassmorphism effects.
- **Parallel Fetching**: Fast data retrieval.

## Project Structure

- `src/app/page.tsx`: Main frontend logic and UI.
- `src/app/api/research/route.ts`: Backend API route that interfaces with SerpApi (replacing thePython script).
- `src/app/globals.css`: Global styles and themes.
