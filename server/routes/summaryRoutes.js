import express from "express";
import * as dotenv from 'dotenv';
import { HfInference } from '@huggingface/inference';
import fetch from 'node-fetch';
import { franc } from 'franc';
import * as cheerio from 'cheerio';

dotenv.config();

const router = express.Router();
const hf = new HfInference(process.env.HP_TOKEN);

// ISO 639-3 to mBART-50 code mapping
const isoToMbart = {
    'arb': 'ar_AR', 'ces': 'cs_CZ', 'deu': 'de_DE', 'eng': 'en_XX', 'spa': 'es_XX',
    'est': 'et_EE', 'fin': 'fi_FI', 'fra': 'fr_XX', 'guj': 'gu_IN', 'hin': 'hi_IN',
    'ita': 'it_IT', 'jpn': 'ja_XX', 'kaz': 'kk_KZ', 'kor': 'ko_KR', 'lit': 'lt_LT',
    'lav': 'lv_LV', 'mya': 'my_MM', 'nep': 'ne_NP', 'nld': 'nl_XX', 'ron': 'ro_RO',
    'rus': 'ru_RU', 'sin': 'si_LK', 'tur': 'tr_TR', 'vie': 'vi_VN', 'zho': 'zh_CN',
    'afr': 'af_ZA', 'aze': 'az_AZ', 'ben': 'bn_IN', 'fas': 'fa_IR', 'heb': 'he_IL',
    'hrv': 'hr_HR', 'ind': 'id_ID', 'kat': 'ka_GE', 'khm': 'km_KH', 'mkd': 'mk_MK',
    'mal': 'ml_IN', 'mon': 'mn_MN', 'mar': 'mr_IN', 'pol': 'pl_PL', 'pus': 'ps_AF',
    'por': 'pt_XX', 'swe': 'sv_SE', 'swa': 'sw_KE', 'tam': 'ta_IN', 'tel': 'te_IN',
    'tha': 'th_TH', 'tgl': 'tl_XX', 'ukr': 'uk_UA', 'urd': 'ur_PK', 'xho': 'xh_ZA',
    'glg': 'gl_ES', 'slv': 'sl_SI'
};

// Robust Helper to fetch and extract text
const fetchAndCleanUrl = async (url) => {
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
        const $ = cheerio.load(html);

        // Remove script, style, and irrelevant elements
        $('script, style, nav, footer, header, aside, .ads, .advertisement').remove();

        // Wikipedia/MediaWiki Specific Cleanup
        $('.mw-editsection, .reference, .noprint, .mw-jump-link, .infobox, table').remove();
        $('sup').remove(); // Remove footnote references [1][2]

        // Extract text from paragraphs, headings, and lists
        let extractedText = "";

        // Prioritize article body if possible
        const mainContent = $('article, #bodyContent, #content, main, .main-content');
        const source = mainContent.length > 0 ? mainContent : $('body');

        source.find('p, h1, h2, h3, h4, h5, h6, li').each((i, el) => {
            const text = $(el).text().trim();
            // Skip very short lines that are likely navigation or trash (e.g. "v t e")
            if (text.length > 20) {
                extractedText += text + " ";
            }
        });

        // Cleanup whitespace
        const finalClean = extractedText.replace(/\s+/g, ' ').trim();
        console.log("Scraped Text Preview (First 200 chars):", finalClean.substring(0, 200));
        return finalClean;

    } catch (error) {
        console.error("Scraping Error:", error);
        throw error;
    }
};

router.post('/summary', async (req, res) => {
    try {
        const { text, url } = req.body;
        let contentToSummarize = text;

        if (url) {
            try {
                const scraped = await fetchAndCleanUrl(url);
                if (scraped.length > 50) {
                    contentToSummarize = scraped;
                }

                // Truncate (BART max is ~1024 tokens)
                if (contentToSummarize.length > 3000) {
                    contentToSummarize = contentToSummarize.substring(0, 3000);
                }
            } catch (fetchError) {
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
                repetition_penalty: 1.2, // Prevent loops
                wait_for_model: true
            }
        });

        const summaryText = summary.summary_text || (summary[0] && summary[0].summary_text);
        res.status(200).json({ success: true, summary: summaryText });

    } catch (error) {
        console.error("Summarization Error:", error);
        if (error.message.includes("index out of range") || error.message.includes("500") || error.message.includes("503")) {
            try {
                // Fallback Logic
                const summary = await hf.summarization({
                    model: 'sshleifer/distilbart-cnn-12-6',
                    inputs: contentToSummarize,
                    parameters: {
                        max_length: 150,
                        min_length: 30,
                        repetition_penalty: 1.5 // Stronger penalty on retry
                    }
                });
                const summaryText = summary.summary_text || (summary[0] && summary[0].summary_text);
                return res.status(200).json({ success: true, summary: summaryText });
            } catch (retryError) { }
        }
        res.status(500).json({ success: false, message: "AI Service Busy." });
    }
});

router.post('/translate', async (req, res) => {
    try {
        const { text, target_lang, url } = req.body;
        let contentToTranslate = text;
        const targetLangCode = target_lang || 'en';

        if (url) {
            try {
                const scraped = await fetchAndCleanUrl(url);
                if (scraped.length > 50) {
                    contentToTranslate = scraped.substring(0, 3000);
                }
            } catch (e) {
                return res.status(400).json({ success: false, message: "Failed to fetch URL" });
            }
        }

        if (!contentToTranslate) return res.status(400).json({ success: false, message: "No content." });

        // Language Detection
        const detectedIso = franc(contentToTranslate);
        const src_lang = isoToMbart[detectedIso] || 'en_XX';

        console.log(`Translation Request: Detected ${detectedIso} -> Mapped ${src_lang} | Target ${targetLangCode}`);

        const langMapFinal = {
            'en': 'en_XX', 'fr': 'fr_XX', 'es': 'es_XX', 'de': 'de_DE',
            'it': 'it_IT', 'pt': 'pt_XX', 'hi': 'hi_IN', 'zh': 'zh_CN',
            'ja': 'ja_XX', 'ru': 'ru_RU', 'ar': 'ar_AR', 'ko': 'ko_KR',
            'ta': 'ta_IN', 'te': 'te_IN'
        };

        const tgt = langMapFinal[targetLangCode] || 'en_XX';

        const translation = await hf.translation({
            model: 'facebook/mbart-large-50-many-to-many-mmt',
            inputs: contentToTranslate,
            parameters: {
                src_lang: src_lang,
                tgt_lang: tgt,
                repetition_penalty: 1.2 // Added penalty
            }
        });

        const translatedText = translation.translation_text || (translation[0] && translation[0].translation_text);
        res.status(200).json({ success: true, summary: translatedText });

    } catch (error) {
        console.error("Translation Error:", error);
        if (error.message.includes("Model too busy") || error.message.includes("503")) {
            return res.status(503).json({ success: false, message: "Service busy." });
        }
        res.status(500).json({ success: false, message: "Translation failed." });
    }
});

export default router;
