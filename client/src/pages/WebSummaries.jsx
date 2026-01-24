import React, { useEffect, useState } from 'react';
import Loader from '../components/Loader';
import { FiExternalLink, FiCopy, FiClock } from 'react-icons/fi';
import toast from 'react-hot-toast';

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
                                    <div key={post._id} className="glass-card hover:bg-white/5 rounded-xl p-6 flex flex-col gap-4 border border-white/10 transition-all hover:scale-[1.01] hover:shadow-xl hover:shadow-purple-500/10 h-fit">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs text-zinc-500 font-mono flex items-center gap-1">
                                                <FiClock /> {new Date(post.createdAt).toLocaleDateString()}
                                            </span>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleCopy(post.content)} className="text-zinc-400 hover:text-white transition-colors" title="Copy">
                                                    <FiCopy />
                                                </button>
                                                {post.sourceUrl && (
                                                    <a href={post.sourceUrl} target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-purple-400 transition-colors" title="Original Source">
                                                        <FiExternalLink />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                        <div className="max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                                            <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
                                                {post.content}
                                            </p>
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
        </section>
    );
};

export default WebSummaries;
