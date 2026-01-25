import express from "express";
import * as dotenv from 'dotenv';
import { HfInference } from '@huggingface/inference';
import fetch from 'node-fetch';

dotenv.config();

const router = express.Router();
const hf = new HfInference(process.env.HP_TOKEN);

// Helper to strip HTML tags (Basic)
const stripHtml = (html) => {
    return html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<[^>]+>/g, '')
        .replace(/\s+/g, ' ')
        .trim();
};

router.post('/summary', async (req, res) => {
    try {
        const { text, url } = req.body;
        let contentToSummarize = text;

        if (url) {
            try {
                const response = await fetch(url, {
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
                    }
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
                }

                const html = await response.text();

                // Improved extraction: prefer <p> tags for article content
                // Regex finding all paragraphs
                const paragraphRegex = /<p[^>]*>(.*?)<\/p>/gi;
                let extractedText = "";
                let match;
                while ((match = paragraphRegex.exec(html)) !== null) {
                    extractedText += match[1] + " ";
                }

                // If paragraphs found, use them; otherwise fallback to stripping body
                if (extractedText.length > 200) {
                    contentToSummarize = stripHtml(extractedText);
                } else {
                    contentToSummarize = stripHtml(html);
                }

                // Truncate if too long for the model (BART has limits, usually 1024 tokens ~ 3000 chars safe bet to truncate)
                if (contentToSummarize.length > 4000) {
                    contentToSummarize = contentToSummarize.substring(0, 4000);
                }
            } catch (fetchError) {
                console.error("Error fetching URL:", fetchError);
                return res.status(400).json({ success: false, message: "Failed to fetch content from URL." });
            }
        }

        if (!contentToSummarize || contentToSummarize.length < 50) {
            return res.status(400).json({ success: false, message: "Content too short or empty." });
        }

        const summary = await hf.summarization({
            model: 'sshleifer/distilbart-cnn-12-6',
            inputs: contentToSummarize,
            parameters: {
                max_length: 150,
                min_length: 50,
            }
        });

        // HF returns object or array depending on task. Summarization usually { summary_text: "..." }
        // The SDK might return { summary_text: "..." } or [{ summary_text: "..." }]
        const summaryText = summary.summary_text || (summary[0] && summary[0].summary_text);

        res.status(200).json({ success: true, summary: summaryText });

    } catch (error) {
        console.error("Summarization Error:", error);

        // Retry with a fallback model if the primary one fails
        if (error.message.includes("index out of range") || error.message.includes("500") || error.message.includes("503")) {
            try {
                console.log("Retrying with fallback model (distilbart-cnn-12-6)...");
                const summary = await hf.summarization({
                    model: 'sshleifer/distilbart-cnn-12-6',
                    inputs: contentToSummarize,
                    parameters: { max_length: 150, min_length: 30 }
                });
                const summaryText = summary.summary_text || (summary[0] && summary[0].summary_text);
                return res.status(200).json({ success: true, summary: summaryText });
            } catch (retryError) {
                console.error("Fallback Summarization Error:", retryError);
            }
        }

        res.status(500).json({ success: false, message: "AI Service Busy. Please try again with shorter text." });
    }
});

router.post('/translate', async (req, res) => {
    try {
        const { text, target_lang, url } = req.body;
        let contentToTranslate = text;
        const targetLangCode = target_lang || 'es'; // default to spanish if missing

        if (url) {
            // ... reusing url fetch logic if needed, or simple error for now 
            // Ideally refactor helper, but for speed keeping simple
            try {
                const response = await fetch(url, {
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
                    }
                });
                if (!response.ok) throw new Error("Fetch failed");
                const html = await response.text();

                const paragraphRegex = /<p[^>]*>(.*?)<\/p>/gi;
                let extractedText = "";
                let match;
                while ((match = paragraphRegex.exec(html)) !== null) {
                    extractedText += match[1] + " ";
                }

                if (extractedText.length > 200) {
                    contentToTranslate = stripHtml(extractedText).substring(0, 3000);
                } else {
                    contentToTranslate = stripHtml(html).substring(0, 3000);
                }
            } catch (e) {
                return res.status(400).json({ success: false, message: "Failed to fetch URL" });
            }
        }

        if (!contentToTranslate) return res.status(400).json({ success: false, message: "No content." });

        // For simplicity with generic Inference API, we'll try 'Helsinki-NLP/opus-mt-en-{target}' dynamically or a big model.
        // Let's use 'facebook/mbart-large-50-many-to-many-mmt' which is standard.
        // inputs: text, parameters: { src_lang: "en_XX", tgt_lang: "fr_XX" }

        // MAPPING ISO codes to mBART codes (Simplified subset)
        const langMap = {
            'en': 'en_XX', 'fr': 'fr_XX', 'es': 'es_XX', 'de': 'de_DE',
            'it': 'it_IT', 'pt': 'pt_XX', 'hi': 'hi_IN', 'zh': 'zh_CN',
            'ja': 'ja_XX', 'ru': 'ru_RU', 'ar': 'ar_AR', 'ko': 'ko_KR',
            'pa': 'hi_IN' // Fallback for Punjabi (similar script/region) or leave default. mBART50 lacks 'pa'. Mapping to 'hi_IN' or 'en_XX' is safer. Let's map to hi_IN for closest regional match or just en. 
            // Actually, let's strictly support what's there. 
            // 'pa' is NOT in mBART-50.
        };
        // Correction: Simply don't map 'pa' -> falls back to 'en_XX' or handle explicitly.
        // Let's at least add 'ar' and 'ko' which ARE supported.

        const langMapFinal = {
            'en': 'en_XX', 'fr': 'fr_XX', 'es': 'es_XX', 'de': 'de_DE',
            'it': 'it_IT', 'pt': 'pt_XX', 'hi': 'hi_IN', 'zh': 'zh_CN',
            'ja': 'ja_XX', 'ru': 'ru_RU', 'ar': 'ar_AR', 'ko': 'ko_KR'
        };

        const tgt = langMapFinal[targetLangCode] || 'en_XX';

        const translation = await hf.translation({
            model: 'facebook/mbart-large-50-many-to-many-mmt',
            inputs: contentToTranslate,
            parameters: {
                src_lang: 'en_XX', // Assuming English source for now as per app intent
                tgt_lang: tgt
            }
        });

        // HF Response: { translation_text: "..." } or [{ translation_text: "..." }]
        const translatedText = translation.translation_text || (translation[0] && translation[0].translation_text);
        res.status(200).json({ success: true, summary: translatedText }); // Keeping key 'summary' for frontend compatibility

    } catch (error) {
        console.error("Translation Error:", error);
        // Handle specific HF errors
        if (error.message.includes("Model too busy") || error.message.includes("503")) {
            return res.status(503).json({ success: false, message: "Translation service is currently busy. Please try again." });
        }
        res.status(500).json({ success: false, message: "Translation failed. Try simpler text." });
    }
});

export default router;
