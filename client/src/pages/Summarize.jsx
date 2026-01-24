import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom';
import TextareaAutosize from 'react-textarea-autosize';
import { toast } from 'react-hot-toast';
import DropdownMenuWithSelectedValue from '../components/DropDown';
import axios from 'axios'
import { languages } from '../utils';
import { FiLink2, FiCopy, FiVolume2, FiDownload, FiClock, FiStopCircle, FiArrowRight, FiRotateCcw, FiZap, FiShare2 } from 'react-icons/fi';
import { TiTick } from 'react-icons/ti';
import { AiOutlineDelete, AiOutlineHistory } from 'react-icons/ai';
import { jsPDF } from "jspdf";

import Loader from '../components/Loader';

const Typewriter = ({ text, speed = 10, onComplete }) => {
  const [displayedText, setDisplayedText] = useState('');
  const indexRef = useRef(0);

  useEffect(() => {
    setDisplayedText('');
    indexRef.current = 0;
  }, [text]);

  useEffect(() => {
    if (!text) return;

    const intervalId = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayedText((prev) => prev + text.charAt(indexRef.current));
        indexRef.current++;
      } else {
        clearInterval(intervalId);
        if (onComplete) onComplete();
      }
    }, speed);

    return () => clearInterval(intervalId);
  }, [text, speed, onComplete]);

  return <p className='font-inter text-zinc-300 leading-relaxed text-sm sm:text-base selection:bg-purple-500/30 whitespace-pre-wrap animate-fade-in-up'>{displayedText}<span className="animate-pulse text-purple-400">|</span></p>;
};

// ... (keep CheckImports or assume they are there, I will just add useNavigate to top if missing, currently logic assumes replacment of body)

const Summarize = () => {
  const navigate = useNavigate();
  const [article, setArticle] = useState({ data: "", summary: "", language: "" });
  const [allArticles, setAllArticles] = useState([]);
  const [copied, setCopied] = useState("");
  const [action, setAction] = useState("");
  const [lang, setLang] = useState("");
  const [loading, setLoading] = useState(false);

  // TTS State
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [readingCompleted, setReadingCompleted] = useState(false);



  const actions = ['Summarize', 'Summarize And Translate', 'Translate'];

  // Helper: Calculate Reading Time
  const getReadingTime = (text) => {
    if (!text || typeof text !== 'string') return 0;
    const wpm = 200;
    const words = text.trim().split(/\s+/).length;
    return Math.ceil(words / wpm);
  };

  // Handler: Text to Speech
  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      } else {
        const utterance = new SpeechSynthesisUtterance(article.summary);
        // Try to find a better voice
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(voice => voice.name.includes("Google") || voice.name.includes("Female"));
        if (preferredVoice) utterance.voice = preferredVoice;

        utterance.onend = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
      }
    } else {
      toast.error("Text-to-Speech not supported in this browser.");
    }
  };

  // Handler: PDF Export
  const handleExportPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    const maxLineWidth = pageWidth - margin * 2;

    doc.setFontSize(22);
    doc.setTextColor(40, 40, 40);
    doc.text("NeuroView Summary", margin, 20);

    doc.setFontSize(11);
    doc.setTextColor(100);

    let splitText = doc.splitTextToSize(article.summary, maxLineWidth);
    doc.text(splitText, margin, 35);

    // Add footer
    doc.setFontSize(9);
    doc.setTextColor(150);
    const date = new Date().toLocaleDateString();
    doc.text(`Generated on ${date} • Source: ${article.data.substring(0, 50)}...`, margin, doc.internal.pageSize.getHeight() - 10);

    doc.save("neuroview-summary.pdf");
    toast.success("PDF Downloaded!");
  };

  // Handler: Share to Web Summaries
  const handleShareText = async () => {
    if (!article.summary) return;

    const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:8080/api/v1';
    try {
      // Check if URL was used or just text
      const isURL = urlRegex.test(article.data);

      const response = await fetch(`${BASE_URL}/summary-posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: article.summary,
          sourceUrl: isURL ? article.data : null,
          originalText: isURL ? null : article.data
        })
      });

      if (response.ok) {
        toast.success("Shared into Web Summaries page!");
        navigate('/web-summaries');
      } else {
        toast.error("Failed to share.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error sharing post.");
    }
  };

  // Handler: Visualize (Share to Community Flow)
  const handleVisualize = () => {
    if (!article.summary) return;
    navigate('/create-post', { state: { prompt: article.summary } });
    toast.success("Prompt loaded into Generator!");
  };

  useEffect(() => {
    const articlesFromLocalStorage = JSON.parse(localStorage.getItem("articles"));
    if (articlesFromLocalStorage) {
      setAllArticles(articlesFromLocalStorage)
    }
  }, [])

  const handleDelete = (item) => {
    const newArticles = allArticles.filter((a) => a.data !== item.data);
    setArticle({ data: "", summary: "", language: "" });
    setAllArticles(newArticles);
    localStorage.setItem("articles", JSON.stringify(newArticles));
  }

  const RAPID_API = process.env.REACT_APP_RAPID_API_KEY;

  const urlRegex = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,6}([-a-zA-Z0-9@:%_\+.~#?&//=]*)?$/;

  const summarizeFromUrl = async (url, targetLang) => {
    const params = { url, length: '3' };
    if (targetLang) params.lang = targetLang; // Pass language code if provided

    const options = {
      method: 'GET',
      url: 'https://article-extractor-and-summarizer.p.rapidapi.com/summarize',
      params: params,
      headers: {
        'X-RapidAPI-Key': RAPID_API,
        'X-RapidAPI-Host': 'article-extractor-and-summarizer.p.rapidapi.com'
      }
    };
    return (await axios.request(options)).data;
  }

  // Note: 'text-summarize-pro' might not support translation directly. 
  // If use selects "Translate" with PASTED TEXT, we might need a different approach or just warn.
  // However, 'article-extractor' is robust. Let's try to use it for text too if possible? No, it takes URL.
  // We will assume for now user primarily uses URL for complex Translate+Sum tasks, or we fallback to just Summary for text if no Text-Translating API is available in this key.
  // Actually, 'google-translate-rapidapi' is common, but requires different subscription.
  // For this fix, we will enable it for URL (which is the main robust tool here) and add a check.

  const summarizeFromText = async (text) => {
    // Basic text summarizer (no translation in this specific endpoint usually)
    const encodedParams = new URLSearchParams();
    encodedParams.set('text', text);
    encodedParams.set('percentage', '40');
    const options = {
      method: 'POST',
      url: 'https://text-summarize-pro.p.rapidapi.com/summarizeFromText',
      headers: { 'content-type': 'application/x-www-form-urlencoded', 'X-RapidAPI-Key': RAPID_API, 'X-RapidAPI-Host': 'text-summarize-pro.p.rapidapi.com' },
      data: encodedParams,
    };
    return (await axios.request(options)).data;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!article.data || !action) return toast.error("Please enter text and select an action");

    const existing = allArticles.find(item => item.data === article.data && item.language === article.language);
    if (existing) {
      setArticle(existing);
      setReadingCompleted(true);
      return;
    }

    if (!RAPID_API) {
      return toast.error("Missing API Key! check .env file.");
    }

    setLoading(true);
    setReadingCompleted(false);

    try {
      let result = "";
      const isURL = urlRegex.test(article.data);

      if (isURL) {
        // URL supports both Summarize and Translate via the 'lang' param in RapidAPI
        let targetLang = null;
        if (action === "Translate" || action === "Summarize And Translate") {
          targetLang = lang;
        }
        const data = await summarizeFromUrl(article.data, targetLang);
        result = data.summary || data.message;

      } else {
        // Text Mode
        if (action === "Translate" || action === "Summarize And Translate") {
          // RapidAPI 'text-summarize-pro' doesn't support translation.
          // Fallback: Use our Local Backend for Text Translation (Hybrid Approach)
          const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:8080/api/v1';

          const response = await fetch(`${BASE_URL}/translate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: article.data,
              target_lang: lang
            })
          });

          const data = await response.json();
          if (!response.ok) throw new Error(data.message || "Translation failed");
          result = data.summary; // Backend returns 'summary' key
        } else {
          // Just Summarize (Text) -> Use RapidAPI
          const data = await summarizeFromText(article.data);
          result = data.summary || data.message;
        }
      }

      if (result) {
        const newArticle = { ...article, summary: result };
        const updated = [newArticle, ...allArticles];
        setArticle(newArticle);
        setAllArticles(updated);
        localStorage.setItem("articles", JSON.stringify(updated));
      }
    } catch (error) {
      console.error(error);
      if (error.response?.status === 403) {
        toast.error("API Key Invalid or Quota Exceeded.");
      } else if (error.response?.status === 429) {
        toast.error("Too many requests. Slow down!");
      } else {
        toast.error("Process failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  const handleCopy = (text) => {
    setCopied(text);
    navigator.clipboard.writeText(text);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <section className="max-w-7xl mx-auto animate-fade-in-up pb-12">
      <div className='mb-10 text-center'>
        <h1 className='heading-hero text-[32px] sm:text-[48px] leading-tight mb-4'>
          Study Smarter, <span className='text-gradient-minimal'>Not Harder</span>
        </h1>
        <p className='text-zinc-400 text-[16px] max-w-[600px] mx-auto font-light leading-relaxed'>
          Unlock your learning potential. Turn lengthy articles into clear, concise insights in seconds.
        </p>
      </div>

      <div className={`flex flex-col lg:flex-row gap-8 items-start transition-all duration-700 ease-in-out ${article.summary ? 'justify-between' : 'justify-center max-w-2xl mx-auto'}`}>

        {/* Left: Input Panel */}
        <div className={`glass-panel p-6 rounded-2xl flex flex-col gap-6 order-1 transition-all duration-700 ${article.summary ? 'w-full lg:w-1/2' : 'w-full'}`}>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-white/5 rounded-lg border border-white/10">
              <FiLink2 className="text-purple-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Input Content</h2>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="relative group">
              <TextareaAutosize
                minRows={3}
                placeholder="Paste URL or text to analyze..."
                value={article.data}
                onChange={(e) => setArticle({ ...article, data: e.target.value })}
                className="input-modern resize-none min-h-[120px]"
              />
              <div className="absolute bottom-3 right-3 text-xs text-zinc-500 font-mono">
                {article.data.length} chars
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DropdownMenuWithSelectedValue
                data={actions}
                selectedItem={action}
                setSelectedItem={setAction}
              />
              {(action === "Summarize And Translate" || action === "Translate") && (
                <DropdownMenuWithSelectedValue
                  data={languages}
                  selectedItem={lang}
                  setSelectedItem={setLang}
                  article={article}
                  setArticle={setArticle}
                  isLanguageArray
                />
              )}
            </div>

            <button
              type='submit'
              disabled={loading}
              className='btn-primary w-full mt-2'
            >
              {loading ? 'Processing...' : (
                <span className="flex items-center gap-2">Execute Agent <FiArrowRight /></span>
              )}
            </button>
          </form>

          {/* History Mini-List - Only show if input is focused or we have history */}
          {allArticles.length > 0 && (
            <div className="mt-4 pt-6 border-t border-white/5">
              <h3 className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-4 flex items-center gap-2">
                <AiOutlineHistory /> Recent Logic
              </h3>
              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto custom-scrollbar">
                {allArticles.slice(0, 5).map((item, idx) => (
                  <div key={idx} onClick={() => { setArticle(item); setReadingCompleted(true); }} className="flex justify-between items-center p-3 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer group transition-all border border-transparent hover:border-white/10">
                    <p className="text-sm text-zinc-400 truncate w-[80%] font-mono">{item.data}</p>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(item) }} className="text-zinc-600 hover:text-red-400 transition-colors">
                      <AiOutlineDelete />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Output Panel (Conditionally Rendered or Hidden) */}
        {(article.summary || loading) && (
          <div className="w-full lg:w-1/2 flex flex-col gap-4 order-2 sticky top-24 animate-slide-in">
            <div className={`min-h-[400px] rounded-2xl glass-card border border-white/10 p-1 relative flex flex-col ${loading ? 'justify-center items-center' : ''}`}>

              {loading ? (
                <Loader />
              ) : article.summary ? (
                <>
                  {/* Toolbar */}
                  <div className="flex justify-between items-center p-3 bg-black/20 rounded-t-xl mb-[1px]">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-purple-400 bg-purple-400/10 px-2 py-1 rounded">
                        AI_RESPONSE
                      </span>
                      <span className="text-xs text-zinc-500 flex items-center gap-1">
                        <FiClock /> {getReadingTime(article.summary)}m read
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={handleShareText} className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-lg transition-all shadow-lg shadow-teal-500/20 mr-2" title="Share text to Web Summaries">
                        <FiShare2 /> Share Text
                      </button>
                      <button onClick={handleVisualize} className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold rounded-lg transition-all shadow-lg shadow-indigo-500/20 mr-2" title="Create Image from Summary">
                        <FiZap /> Visualize
                      </button>
                      <button onClick={handleSpeak} className={`p-2 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors ${isSpeaking ? 'text-red-400 animate-pulse' : ''}`} title="Read Aloud">
                        {isSpeaking ? <FiStopCircle /> : <FiVolume2 />}
                      </button>
                      <button onClick={handleExportPDF} className="p-2 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors" title="Export PDF">
                        <FiDownload />
                      </button>
                      <button onClick={() => handleCopy(article.summary)} className="p-2 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors" title="Copy">
                        {copied === article.summary ? <TiTick className="text-green-400" /> : <FiCopy />}
                      </button>
                    </div>
                  </div>

                  {/* Content Area */}
                  <div className="p-6 bg-black/10 flex-1 rounded-b-xl overflow-y-auto max-h-[600px] custom-scrollbar">
                    {readingCompleted ? (
                      <p className='font-inter text-zinc-300 leading-relaxed text-sm sm:text-base selection:bg-purple-500/30 whitespace-pre-wrap animate-fade-in-up'>
                        {article.summary}
                      </p>
                    ) : (
                      <Typewriter text={article.summary} onComplete={() => setReadingCompleted(true)} />
                    )}
                  </div>
                </>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default Summarize