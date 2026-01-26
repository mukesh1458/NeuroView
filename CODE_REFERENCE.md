# Technical Code Reference

This document outlines the specific file locations and code snippets for the core integrations in NeuroView.

## 1. OpenAI (Image Generation)
**File:** `server/routes/dalleRoutes.js`

*   **Initialization:**
    The OpenAI SDK is initialized using the environment variable.
    ```javascript
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });
    ```

*   **Generation Logic:**
    The API call is made to the `images.generate` endpoint.
    ```javascript
    const aiResponse = await openai.images.generate({
        prompt,
        n: 1,
        size: '1024x1024',
        response_format: 'b64_json',
    });
    ```

## 2. Cloudinary Configuration (Image Storage)
**File:** `server/routes/postRoutes.js`

*   **Configuration:**
    Cloudinary is configured globally for the router using environment variables.
    ```javascript
    cloudinary.config({
        cloud_name: process.env.CLOUD_NAME,
        api_key: process.env.API_KEY,
        api_secret: process.env.API_SECRET,
    });
    ```

## 3. Web Intelligence (Hybrid Architecture)
**File:** `client/src/pages/Summarize.jsx` & `server/routes/summaryRoutes.js`

We use a **Hybrid Strategy** to ensure maximum efficiency:

*   **URL Processing (RapidAPI):**
    For extracting and summarizing articles from URLs, we use the robust **Article Extractor API** (via RapidAPI). This handles cleaning, summarization, and translation in one step.
    ```javascript
    // Summarize.jsx
    const rapidData = await summarizeFromUrl(article.data, target);
    ```

*   **Text Summarization (RapidAPI):**
    Pure text summarization also leverages RapidAPI's `text-summarize-pro` for speed and quality.
    ```javascript
    // Summarize.jsx
    const rapidData = await summarizeFromText(article.data);
    ```

*   **Text Translation (Local Backend):**
    For direct text translation, we use our private **Hugging Face mBART** instance on the backend for privacy and control.
    ```javascript
    // summaryRoutes.js
    const translation = await hf.translation({ model: 'facebook/mbart-large-50...' });
    ```

## 4. Client-Side Enhancements
**File:** `client/src/pages/Summarize.jsx`

*   **Printable PDF Export:**
    Uses `html2canvas` to clone the summary content, apply "White Paper" styling (white background, black text), and generate a clean PDF.
    ```javascript
    const clone = element.cloneNode(true);
    Object.assign(clone.style, { backgroundColor: '#ffffff', color: '#000000', ... });
    ```
*   **Multi-Language TTS:**
    Features a dual-engine TTS system:
    1.  **Local**: Tries to find a matching OS voice.
    2.  **Cloud Fallback**: Connects to Google Cloud TTS for missing languages (e.g., Hindi).

## 5. Environment Variables Reference
Ensure these are set in your `.env` files:

*   **Server:** `OPENAI_API_KEY`, `HP_TOKEN`, `CLOUD_NAME`, `API_KEY`, `API_SECRET`
*   **Client:** `REACT_APP_RAPID_API_KEY`
