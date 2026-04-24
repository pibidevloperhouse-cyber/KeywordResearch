# Marketing Agent Setup Guide

This project now features a multi-agent AI pipeline for blog content generation.

## 🛠️ Components

1.  **Research Agent (Llama 3 via Groq)**: Analyzes search data (via SerpAPI) and generates a structured writing blueprint.
2.  **Writing Agent (Llama 3 70B via Groq)**: Authors the blog post based on research instructions, following the tone of the reference blog (empathetic, informative, professional).
3.  **Branding Agent (Llama 3 via Groq)**: Evaluates the blog's brand alignment and providing a score (1-100).

## 🚀 How to Run

### 1. Environment Variables
Ensure your `.env.local` contains the following:
```env
SERPAPI_KEY=your_serpapi_key
GROQ_API_KEY=your_groq_api_key
OPENAI_API_KEY=your_openai_api_key
RESEARCH_MODEL=llama-3.3-70b-versatile
WRITING_MODEL=llama-3.3-70b-versatile
```

### 2. Groq Setup
The writing agent now uses **Groq** for high-speed inference:
1.  Get an API key from [Groq Console](https://console.groq.com/).
2.  Add it to your `.env.local` as `GROQ_API_KEY`.

### 3. Start the Project
```bash
npm install
npm run dev
```

## 📍 Navigation
-   **Research Agent**: `/research-agent`
-   **Writing Agent**: `/writing-agent`
-   **Branding Agent**: `/branding-agent`

Use the navigation bar at the top or the "Trigger" buttons at each stage to move through the pipeline.
