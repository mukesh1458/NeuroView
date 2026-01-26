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
import html2canvas from 'html2canvas';

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
  const [availableVoices, setAvailableVoices] = useState([]);

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        setAvailableVoices(voices);
      }
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);



  const actions = ['Summarize', 'Translate'];

  // Helper: Calculate Reading Time
  const getReadingTime = (text) => {
    if (!text || typeof text !== 'string') return 0;
    const wpm = 200;
    const words = text.trim().split(/\s+/).length;
    return Math.ceil(words / wpm);
  };

  // Handler: Text to Speech (Dual Engine: Local + Cloud Fallback)
  const handleSpeak = () => {
    // 1. Cancel any current speaking
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      if (window.audioChunk) {
        window.audioChunk.pause();
        window.audioChunk = null;
      }
      setIsSpeaking(false);
      return;
    }

    const targetLang = article.language || 'en';
    const text = article.summary;

    // 2. CHECK LOCAL VOICES FIRST
    let localVoice = null;
    const voices = window.speechSynthesis.getVoices();
    localVoice = voices.find(v => v.lang.startsWith(targetLang));

    // 3. IF LOCAL VOICE EXISTS, USE IT (Preferred for performance)
    if (localVoice || targetLang === 'en') {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = targetLang;
      if (localVoice) utterance.voice = localVoice;

      // Quality of life: English default fallback
      if (!localVoice && targetLang === 'en') {
        const defaultVoice = voices.find(v => v.name.includes("Google") || v.name.includes("Female"));
        if (defaultVoice) utterance.voice = defaultVoice;
      }

      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
      toast.success(`Reading locally in ${targetLang}...`);
      return;
    }

    // 4. CLOUD FALLBACK (For Hindi/others missing locally)
    // "Install" behavior simulation via Google TTS
    toast("Connecting to Cloud TTS engine...", { icon: '☁️' });
    setIsSpeaking(true);

    // Split text into safe chunks (Google API limit ~200 chars)
    // We split by standard punctuation to keep sentences intact
    const chunks = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text];

    let currentChunkIndex = 0;

    const playNextChunk = () => {
      if (currentChunkIndex >= chunks.length) {
        setIsSpeaking(false);
        return;
      }

      const chunk = chunks[currentChunkIndex].trim();
      if (!chunk) {
        currentChunkIndex++;
        playNextChunk();
        return;
      }

      // Use Google Translate TTS internal API
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${targetLang}&q=${encodeURIComponent(chunk)}`;
      const audio = new Audio(url);
      window.audioChunk = audio; // Save ref to pause if needed

      audio.onended = () => {
        currentChunkIndex++;
        playNextChunk();
      };

      audio.onerror = (e) => {
        console.error("Cloud TTS failed for chunk", e);
        toast.error("Cloud TTS Network Error");
        setIsSpeaking(false);
      };

      audio.play().catch(e => {
        console.error("Audio Play Error", e);
        setIsSpeaking(false);
      });
    };

    // Start the queue
    playNextChunk();
  };

  // Handler: PDF Export (Robust with html2canvas & White Styling)
  const handleExportPDF = async () => {
    const element = document.getElementById('summary-content');
    if (!element) return toast.error("Nothing to export!");

    // Create a clone to manipulate styles for PDF (White Background, Black Text)
    const clone = element.cloneNode(true);

    // Apply temporary print-friendly styles
    Object.assign(clone.style, {
      position: 'fixed',
      top: '-9999px',
      left: '-9999px',
      backgroundColor: '#ffffff',
      color: '#000000',
      width: '210mm', // A4 width
      minHeight: '297mm',
      padding: '20mm',
      fontSize: '12pt',
      zIndex: '-1000'
    });

    // We need to ensure children texts are also black, as Tailwind classes might override inheritance
    // This simple loop helps, though complex deep nesting might need a recursive function
    // For our summary (p tags), this usually works or generic CSS rule.
    const descendants = clone.getElementsByTagName('*');
    for (let child of descendants) {
      child.style.color = '#000000';
    }

    document.body.appendChild(clone);

    try {
      // Capture the styled clone
      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      // Handle Multi-page if needed, or just fit to one if short.
      // For now, scaling to width.
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save("neuroview-summary.pdf");
      toast.success("PDF Downloaded!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate PDF");
    } finally {
      // Cleanup
      document.body.removeChild(clone);
    }
  };

  const [name, setName] = useState("");

  // Handler: Share to Web Summaries
  const handleShareText = async () => {
    if (!article.summary) return;
    if (!name.trim()) return toast.error("Please enter your name to share!");

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
          originalText: isURL ? null : article.data,
          name: name
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


  const urlRegex = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,6}([-a-zA-Z0-9@:%_\+.~#?&//=]*)?$/;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!article.data || !action) return toast.error("Please enter text and select an action");

    const existing = allArticles.find(item => item.data === article.data && item.language === article.language);
    if (existing) {
      setArticle(existing);
      setReadingCompleted(true);
      return;
    }

    setLoading(true);
    setReadingCompleted(false);

    // AUTO-DETECT: If action implies translation but no lang selected, default to 'en'
    let selectedLang = lang;
    if ((action === "Translate" || action === "Summarize And Translate") && !selectedLang) {
      selectedLang = 'English';
      setLang('English');
    }

    if (action === "Summarize") {
      selectedLang = 'English'; // Force EN for pure summary
    }

    try {
      const isURL = urlRegex.test(article.data);
      let result = "";
      const BASE_URL = 'http://localhost:8080/api/v1'; // Hardcoded for local dev or use env

      if (action === "Translate") {
        const { data } = await axios.post(`${BASE_URL}/translate`, {
          text: isURL ? null : article.data,
          url: isURL ? article.data : null,
          target_lang: selectedLang
        });
        result = data.summary; // Backend returns 'summary' key for consistency
      } else {
        // Summarize OR Summarize & Translate
        const { data } = await axios.post(`${BASE_URL}/summary`, {
          text: isURL ? null : article.data,
          url: isURL ? article.data : null,
          target_lang: (action === "Summarize And Translate") ? selectedLang : null
        });
        result = data.summary;
      }

      if (result) {
        // SAVE LANGUAGE STATE
        const finalLang = (action === "Summarize") ? 'en' : selectedLang;

        const newArticle = { ...article, summary: result, language: finalLang };
        const updated = [newArticle, ...allArticles];
        setArticle(newArticle);
        setAllArticles(updated);
        localStorage.setItem("articles", JSON.stringify(updated));
        toast.success("Processed Successfully!");
      }

    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message || "Process failed. Please try again.");
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
        <p className="mt-4 text-[10px] text-zinc-600 uppercase tracking-widest font-mono">
          Engineered by Mukesh Chowdary & Team
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
            <input
              type="text"
              placeholder="Your Name (for sharing)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-modern bg-black/40"
            />
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

                  {/* Content Area - ID ADDED FOR PDF EXPORT */}
                  <div id="summary-content" className="p-6 bg-black/10 flex-1 rounded-b-xl overflow-y-auto max-h-[600px] custom-scrollbar">
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