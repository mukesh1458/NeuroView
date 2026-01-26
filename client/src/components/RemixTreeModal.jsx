import React, { useEffect, useState } from 'react';
import { FiX, FiZap, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import Loader from './Loader';

const RemixTreeModal = ({ isOpen, onClose, postId, currentPostPhoto }) => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const BASE_URL = process.env.REACT_APP_BASE_URL;

    useEffect(() => {
        if (isOpen && postId) {
            fetchLineage();
        }
    }, [isOpen, postId]);

    const fetchLineage = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/post/${postId}/lineage`);
            const result = await res.json();
            if (result.success) {
                setData(result.data);
            }
        } catch (error) {
            console.error("Failed to fetch lineage", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-[#18181b] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto relative shadow-2xl flex flex-col">

                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-white/5 sticky top-0 bg-[#18181b] z-10">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <FiZap className="text-cyan-400" /> Remix Genealogy
                    </h2>
                    <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
                        <FiX size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 flex flex-col items-center gap-6 min-h-[300px]">
                    {loading ? (
                        <div className="flex-1 flex items-center justify-center">
                            <Loader />
                        </div>
                    ) : !data ? (
                        <p className="text-zinc-500">Could not load tree data.</p>
                    ) : (
                        <>
                            {/* Parent */}
                            {data.parent ? (
                                <div className="flex flex-col items-center animate-slide-in">
                                    <div className="w-24 h-24 rounded-full border-4 border-zinc-700 overflow-hidden mb-2 relative group cursor-pointer hover:border-cyan-500 transition-colors">
                                        <img src={data.parent.photo} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-xs text-white">Parent</span>
                                        </div>
                                    </div>
                                    <FiArrowDOWN className="text-zinc-600 w-6 h-6 animate-bounce" />
                                </div>
                            ) : (
                                <p className="text-xs text-zinc-500 uppercase tracking-widest mb-4">Original Creation</p>
                            )}

                            {/* Current Node */}
                            <div className="relative z-10">
                                <div className="w-32 h-32 rounded-xl border-4 border-cyan-500 shadow-[0_0_30px_rgba(34,211,238,0.2)] overflow-hidden relative">
                                    <img src={data.current.photo} className="w-full h-full object-cover" />
                                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-center">
                                        <span className="text-xs text-white font-bold">Current</span>
                                    </div>
                                </div>
                            </div>

                            {/* Children */}
                            {data.children && data.children.length > 0 && (
                                <div className="flex flex-col items-center w-full animate-slide-in">
                                    <FiArrowDown className="text-zinc-600 w-6 h-6 mb-4" />

                                    <div className="flex flex-wrap justify-center gap-4 w-full">
                                        {data.children.map((child) => (
                                            <div key={child._id} className="flex flex-col items-center">
                                                <div className="w-20 h-20 rounded-lg border-2 border-zinc-700 overflow-hidden relative group cursor-pointer hover:border-purple-500 transition-colors">
                                                    <img src={child.photo} className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <span className="text-[10px] text-white">Remix</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {(!data.children || data.children.length === 0) && (
                                <p className="text-xs text-zinc-600 mt-4">No remixes yet. Be the first!</p>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

// Helper Icon
const FiArrowDOWN = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
)

export default RemixTreeModal;
