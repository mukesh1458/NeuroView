import React, { useEffect, useState } from 'react';
import Loader from '../components/Loader';
import { FiExternalLink, FiCopy, FiClock, FiDownload, FiVolume2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { jsPDF } from "jspdf";

const WebSummaries = () => {
    const [loading, setLoading] = useState(false);
    const [allPosts, setAllPosts] = useState(null);
    const [searchText, setSearchText] = useState('');

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:8080/api/v1';
            const response = await fetch(`${BASE_URL}/summary-posts`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const result = await response.json();
                setAllPosts(result.data.reverse()); // Show newest first
            }
        } catch (err) {
            toast.error("Failed to fetch summaries");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        toast.success("Summary copied!");
    };

    const handleSpeak = (text) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel(); // Stop any previous speech

            const utterance = new SpeechSynthesisUtterance(text);

            // "Soft" Voice Logic: Prefer Female Google/Microsoft voices + lower pitch/rate
            const voices = window.speechSynthesis.getVoices();
            const preferredVoice = voices.find(voice =>
                (voice.name.includes("Google") && voice.name.includes("Female")) ||
                voice.name.includes("Zira") ||
                voice.name.includes("Samantha")
            );

            if (preferredVoice) utterance.voice = preferredVoice;
            utterance.pitch = 0.9; // Slightly lower pitch for calmness
            utterance.rate = 0.95; // Slightly slower

            window.speechSynthesis.speak(utterance);
        } else {
            toast.error("Text-to-Speech not supported in this browser.");
        }
    };

    const handleDownloadPDF = (post) => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 15;
        const maxLineWidth = pageWidth - margin * 2;

        doc.setFontSize(22);
        doc.setTextColor(40, 40, 40);
        doc.text("NeuroView Summary", margin, 20);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Shared by: ${post.name || 'Anonymous'} • ${new Date(post.createdAt).toLocaleDateString()}`, margin, 30);

        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);

        let splitText = doc.splitTextToSize(post.content, maxLineWidth);
        doc.text(splitText, margin, 45);

        // Footer
        doc.setFontSize(9);
        doc.setTextColor(150);
        doc.text(`Source: ${post.sourceUrl || 'Text Input'}`, margin, doc.internal.pageSize.getHeight() - 10);

        doc.save(`summary-${post._id}.pdf`);
        toast.success("PDF Downloaded!");
    };

    const [selectedPost, setSelectedPost] = useState(null);

    return (
        <section className="max-w-7xl mx-auto animate-fade-in-up pb-12">
            <div className="mb-10 text-center">
                <h1 className="heading-hero text-[32px] sm:text-[48px] leading-tight">
                    Web <span className="text-gradient-minimal">Summarizations</span>
                </h1>
                <p className="mt-2 text-zinc-400 text-[16px] max-w-[600px] mx-auto font-light">
                    Browse the collection of curated web summaries shared by the community.
                </p>
            </div>

            <div className="flex justify-center items-center">
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader />
                    </div>
                ) : (
                    <>
                        {allPosts?.length > 0 ? (
                            <div className="grid lg:grid-cols-3 sm:grid-cols-2 xs:grid-cols-1 gap-6 w-full">
                                {allPosts.map((post) => (
                                    <div
                                        key={post._id}
                                        onClick={() => setSelectedPost(post)}
                                        className="glass-panel p-0 rounded-2xl overflow-hidden flex flex-col border border-white/5 hover:border-white/10 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/10 h-full group cursor-pointer"
                                    >

                                        {/* Card Header */}
                                        <div className="p-4 bg-white/5 border-b border-white/5 flex justify-between items-center">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center border border-white/10 text-xs text-white cursor-default">
                                                    {(post.name?.[0] || 'A').toUpperCase()}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-white leading-none">{post.name || "Anonymous"}</span>
                                                    <span className="text-[10px] text-zinc-500 font-mono mt-1 flex items-center gap-1">
                                                        <FiClock className="w-3 h-3" /> {new Date(post.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>

                                            {post.sourceUrl && (
                                                <a
                                                    href={post.sourceUrl}
                                                    onClick={(e) => e.stopPropagation()}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-xs flex items-center gap-1 text-zinc-500 hover:text-purple-400 transition-colors bg-white/5 px-2 py-1 rounded-full border border-white/5 hover:border-purple-500/30"
                                                    title="View Source"
                                                >
                                                    <FiExternalLink /> Source
                                                </a>
                                            )}
                                        </div>

                                        {/* Card Content */}
                                        <div className="p-5 flex-1 max-h-[250px] overflow-hidden relative">
                                            <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap font-light line-clamp-6">
                                                {post.content}
                                            </p>
                                            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#09090b] to-transparent pointer-events-none"></div>
                                        </div>

                                        {/* Card Footer / Actions */}
                                        <div className="p-3 bg-black/20 border-t border-white/5 flex justify-between items-center mt-auto">
                                            <div className="text-[10px] text-zinc-600 font-mono uppercase tracking-wider group-hover:text-purple-400 transition-colors">
                                                Read Article <FiExternalLink className="inline ml-1" />
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleSpeak(post.content); }}
                                                    className="p-2 text-zinc-400 hover:text-pink-400 hover:bg-pink-400/10 rounded-lg transition-all"
                                                    title="Listen (Text-to-Speech)"
                                                >
                                                    <FiVolume2 size={16} />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleCopy(post.content); }}
                                                    className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                                                    title="Copy Text"
                                                >
                                                    <FiCopy size={16} />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDownloadPDF(post); }}
                                                    className="p-2 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-all"
                                                    title="Download PDF"
                                                >
                                                    <FiDownload size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center mt-10">
                                <h2 className="text-xl font-bold text-zinc-500">No summaries yet</h2>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Article Reader Modal */}
            {selectedPost && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedPost(null)}>
                    <div
                        className="glass-panel w-full max-w-3xl max-h-[85vh] flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-white/10 animate-scale-in"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/10 bg-white/5 flex justify-between items-start">
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-2 font-serif">Research Summary</h3>
                                <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400">
                                    <span className="flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-[10px] text-blue-300 border border-blue-500/30">
                                            {(selectedPost.name?.[0] || 'A').toUpperCase()}
                                        </div>
                                        {selectedPost.name || "Anonymous"}
                                    </span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                        <FiClock size={14} /> {new Date(selectedPost.createdAt).toLocaleDateString()}
                                    </span>
                                    {selectedPost.sourceUrl && (
                                        <>
                                            <span>•</span>
                                            <a href={selectedPost.sourceUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-purple-400 hover:underline">
                                                <FiExternalLink size={14} /> Source Link
                                            </a>
                                        </>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedPost(null)}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="p-8 overflow-y-auto custom-scrollbar bg-[#09090b]/50">
                            <p className="text-zinc-200 text-lg leading-loose font-serif whitespace-pre-wrap">
                                {selectedPost.content}
                            </p>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-4 border-t border-white/10 bg-white/5 flex justify-end gap-3">
                            <button
                                onClick={() => handleSpeak(selectedPost.content)}
                                className="flex items-center gap-2 px-4 py-2 bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 rounded-lg transition-colors border border-pink-500/20"
                            >
                                <FiVolume2 /> Listen
                            </button>
                            <button
                                onClick={() => handleCopy(selectedPost.content)}
                                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors border border-white/10"
                            >
                                <FiCopy /> Copy
                            </button>
                            <button
                                onClick={() => handleDownloadPDF(selectedPost)}
                                className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 rounded-lg transition-colors border border-emerald-500/20"
                            >
                                <FiDownload /> Download PDF
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default WebSummaries;
