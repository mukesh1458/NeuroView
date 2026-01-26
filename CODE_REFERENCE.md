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

## 3. Web Scraping & Language Detection (Backend)
**File:** `server/routes/summaryRoutes.js`

*   **Intelligent Scraping (`Cheerio`):**
    We use Cheerio to parse HTML and extract meaningful content (p, h1-h6, li, article), ignoring ads and scripts.
    ```javascript
    const $ = cheerio.load(html);
    $('script, style, ...').remove();
    $('p, h1, ...').each(...)
    ```

*   **Language Detection (`Franc`):**
    The system automatically detects the source language of input text to ensure accurate translation.
    ```javascript
    const detectedIso = franc(contentToTranslate);
    const src_lang = isoToMbart[detectedIso] || 'en_XX';
    ```

## 4. AI Translation & Summarization (Backend)
**File:** `server/routes/summaryRoutes.js`

*   **Translation Model:**
    Powered by `facebook/mbart-large-50-many-to-many-mmt` via Hugging Face Inference.
    ```javascript
    const translation = await hf.translation({
        model: 'facebook/mbart-large-50-many-to-many-mmt',
        inputs: contentToTranslate,
        parameters: { src_lang, tgt_lang }
    });
    ```

## 5. Client-Side Features
**File:** `client/src/pages/Summarize.jsx`

*   **PDF Export:** Uses `html2canvas` + `jsPDF` to capture visual fidelity (fonts/emojis) instead of raw text.
*   **TTS:** Integrated Stop Button logic in `WebSummaries.jsx`.

## 6. Environment Variables Reference
Ensure these are set in your `.env` files:

*   **Server:** `OPENAI_API_KEY`, `HP_TOKEN`, `CLOUD_NAME`, `API_KEY`, `API_SECRET`
*   **Client:** `REACT_APP_RAPID_API_KEY`
