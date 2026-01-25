import React, { useState, useEffect } from 'react';
import { FiPlus, FiX } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const CollectionModal = ({ isOpen, onClose, postId, photo, user }) => {
    const [collections, setCollections] = useState([]);
    const [newCollectionName, setNewCollectionName] = useState('');
    const [loading, setLoading] = useState(false);
    const BASE_URL = process.env.REACT_APP_BASE_URL;

    useEffect(() => {
        if (isOpen && user) {
            fetchCollections();
        }
    }, [isOpen, user]);

    const fetchCollections = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${BASE_URL}/collections`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setCollections(data.data);
        } catch (error) {
            console.error(error);
        }
    };

    const createCollection = async () => {
        if (!newCollectionName.trim()) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${BASE_URL}/collections`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name: newCollectionName })
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Board created!");
                setNewCollectionName('');
                fetchCollections();
            }
        } catch (error) {
            toast.error("Failed to create board");
        } finally {
            setLoading(false);
        }
    };

    const addToCollection = async (collectionId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${BASE_URL}/collections/${collectionId}/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ postId })
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Saved to board!");
                onClose();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error("Failed to save");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="glass-panel w-full max-w-md rounded-2xl p-6 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-zinc-400 hover:text-white">
                    <FiX size={24} />
                </button>

                <h2 className="text-xl font-bold text-white mb-6">Save to Board</h2>

                {/* Create New */}
                {/* Create New */}
                <div className="flex flex-col gap-3 mb-6 bg-white/5 p-3 rounded-xl border border-white/5">
                    <input
                        type="text"
                        placeholder="Name your new board..."
                        value={newCollectionName}
                        onChange={(e) => setNewCollectionName(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-cyan-500 transition-colors placeholder:text-zinc-600"
                    />
                    <div className="flex justify-end">
                        <button
                            onClick={createCollection}
                            disabled={loading || !newCollectionName}
                            className="px-4 py-1.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all
                            disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed
                            enabled:bg-white enabled:text-black enabled:hover:bg-cyan-400 enabled:hover:shadow-lg"
                        >
                            {loading ? 'Creating...' : 'Create Board'}
                        </button>
                    </div>
                </div>

                {/* List */}
                <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-700">
                    {collections.length === 0 ? (
                        <p className="text-zinc-500 text-center py-4">No boards yet.</p>
                    ) : (
                        collections.map(col => (
                            <button
                                key={col._id}
                                onClick={() => addToCollection(col._id)}
                                className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5 group"
                            >
                                <div className="flex flex-col items-start">
                                    <span className="font-medium text-zinc-200 group-hover:text-white">{col.name}</span>
                                    <span className="text-xs text-zinc-500">{col.posts.length} items</span>
                                </div>
                                {col.posts.some(p => (typeof p === 'object' ? p._id === postId : p === postId)) && (
                                    <span className="text-xs text-cyan-400 font-bold bg-cyan-900/20 px-2 py-1 rounded">SAVED</span>
                                )}
                            </button>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default CollectionModal;
