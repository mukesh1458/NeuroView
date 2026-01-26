import express from "express";
import * as dotenv from 'dotenv';
import * as cheerio from 'cheerio';
import { HfInference } from "@huggingface/inference";
// import fetch from 'node-fetch'; // Native in Node 18+

dotenv.config();

const router = express.Router();

// Initialize HuggingFace Inference
const hf = new HfInference(process.env.HP_TOKEN);

// Robust Helper to fetch and extract text
const fetchAndCleanUrl = async (url) => {
    try {
        console.log(`[Scraper] Fetching ${url}...`);
        const response = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        // Remove script, style, and irrelevant elements
        $('script, style, nav, footer, header, aside, .ads, .advertisement, noscript, iframe').remove();

        let extractedText = "";

        // Target Main Content specifically
        const selectors = ['article', 'main', '.main-content', '#content', '#bodyContent', 'body'];
        let source;

        for (const sel of selectors) {
            if ($(sel).length > 0) {
                source = $(sel);
                break;
            }
        }
        if (!source) source = $('body');

        // Extract paragraphs and headings
        source.find('p, h1, h2, h3, h4, h5, h6, li').each((i, el) => {
            const text = $(el).text().trim();
            if (text.length > 20) {
                extractedText += text + ". ";
            }
        });

        // Cleanup
        // Limit to ~3000 chars to avoid overloading the free HF model
        return extractedText.replace(/\s+/g, ' ').replace(/\.\./g, '.').trim().substring(0, 3000);

    } catch (error) {
        console.error("Scraping Error:", error);
        throw error;
    }
};

router.post('/summary', async (req, res) => {
    try {
        let { url, text } = req.body;

        // 1. If URL, scrape it first
        if (url) {
            try {
                text = await fetchAndCleanUrl(url);
                console.log(`[Scraper] Extracted ${text.length} chars.`);
            } catch (e) {
                return res.status(400).json({ success: false, message: "Failed to scrape URL. Please try pasting text instead." });
            }
        }

        if (!text || text.length < 50) {
            return res.status(400).json({ success: false, message: "Content too short or empty to summarize." });
        }

        console.log(`[HF] Summarizing (${text.length} chars)...`);

        // 2. Summarize using BART
        const result = await hf.summarization({
            model: 'facebook/bart-large-cnn',
            inputs: text,
            parameters: {
                max_length: 130,
                min_length: 30
            }
        });

        const summaryText = result.summary_text || (result.length > 0 ? result[0].summary_text : "");

        if (!summaryText) throw new Error("AI returned empty summary.");

        res.status(200).json({ success: true, summary: summaryText });

    } catch (error) {
        console.error("Summarization Error:", error);
        res.status(500).json({ success: false, message: "Summarization failed. Try shorter text." });
    }
});

router.post('/translate', async (req, res) => {
    try {
        let { url, text, target_lang } = req.body;

        if (url && !text) {
            try {
                text = await fetchAndCleanUrl(url);
            } catch (e) {
                return res.status(400).json({ success: false, message: "Failed to scrape URL." });
            }
        }

        if (!text) {
            return res.status(400).json({ success: false, message: "No content to translate." });
        }

        // Truncate for Translation (MBART has limits, usually 1024 tokens)
        if (text.length > 1000) text = text.substring(0, 1000);

        const targetCode = target_lang?.toLowerCase() || 'hindi';

        const langMap = {
            'hindi': 'hi_IN', 'hi': 'hi_IN',
            'spanish': 'es_XX', 'es': 'es_XX',
            'french': 'fr_XX', 'fr': 'fr_XX',
            'german': 'de_DE', 'de': 'de_DE',
            'italian': 'it_IT', 'it': 'it_IT',
            'english': 'en_XX', 'en': 'en_XX',
            'japanese': 'ja_XX', 'ja': 'ja_XX',
            'russian': 'ru_RU', 'ru': 'ru_RU',
            'chinese': 'zh_CN', 'zh': 'zh_CN',
            'arabic': 'ar_AR', 'ar': 'ar_AR',
            'portuguese': 'pt_XX', 'pt': 'pt_XX',
            'korean': 'ko_KR', 'ko': 'ko_KR'
        };

        let tgt_lang = langMap[targetCode];

        if (!tgt_lang) {
            console.warn(`[HF] Language '${targetCode}' not found. Defaulting to Hindi.`);
            tgt_lang = 'hi_IN';
        }

        console.log(`[HF] Translating to ${tgt_lang} (${text.length} chars)...`);

        const result = await hf.translation({
            model: 'facebook/mbart-large-50-many-to-many-mmt',
            inputs: text,
            parameters: {
                src_lang: "en_XX",
                tgt_lang: tgt_lang
            }
        });

        const translatedText = result.translation_text || (Array.isArray(result) && result[0]?.translation_text);

        if (!translatedText) throw new Error("Translation returned empty.");

        res.status(200).json({ success: true, summary: translatedText });

    } catch (error) {
        console.error("Translation Error:", error);
        res.status(500).json({ success: false, message: "Translation failed (HuggingFace)." });
    }
});

export default router;
