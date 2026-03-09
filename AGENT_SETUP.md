# Marketing Agent Setup Guide

This project now features a multi-agent AI pipeline for blog content generation.

## 🛠️ Components

1.  **Research Agent (Gemini 2.5 Flash)**: Analyzes search data (via SerpAPI) and generates a structured writing blueprint.
2.  **Writing Agent (Mistral 7B Local)**: Authors the blog post based on research instructions, following the tone of the reference blog (empathetic, informative, professional).
3.  **Branding Agent (Gemini 2.5 Flash)**: Evaluates the blog's brand alignment and providing a score (1-100).

## 🚀 How to Run

### 1. Environment Variables
Ensure your `.env.local` contains the following:
```env
SERPAPI_KEY=your_serpapi_key
GEMINI_API_KEY=your_gemini_api_key
LOCAL_LLM_URL=http://localhost:11434/v1/chat/completions
```

### 2. Local LLM Setup (Mistral 7B)
The writing agent requires a local LLM server. We recommend **Ollama**:
1.  Download and install Ollama from [ollama.com](https://ollama.com).
2.  Run the following command in your terminal:
    ```bash
    ollama pull mistral
    ```
3.  Keep the Ollama application running.

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
