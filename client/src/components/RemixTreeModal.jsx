import React, { useEffect, useState } from 'react';
import { FiX, FiZap, FiGitCommit } from 'react-icons/fi';
import Loader from './Loader';

const RemixTreeModal = ({ isOpen, onClose, postId }) => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const BASE_URL = process.env.REACT_APP_BASE_URL;

    // Fetch Lineage
    const fetchLineage = async (id) => {
        setLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/post/${id}/lineage`);
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

    // Initial Load
    useEffect(() => {
        if (isOpen && postId) {
            fetchLineage(postId);
        }
    }, [isOpen, postId]);

    // Graph Layout Constants
    const NODE_WIDTH = 220;
    const NODE_HEIGHT = 280;
    const Y_GAP = 350; // Vertical gap between generations
    const X_GAP = 250; // Horizontal gap between siblings

    const [coords, setCoords] = useState({ parent: null, current: null, children: [] });
    const [canvasHeight, setCanvasHeight] = useState(window.innerHeight);
    const [canvasWidth, setCanvasWidth] = useState(window.innerWidth);

    // Calculate Coordinates (Top-Down / Horizontal Expansion)
    useEffect(() => {
        if (!data) return;

        const childrenCount = data.children ? data.children.length : 0;

        // Calculate Total Width based on children
        // If 0 or 1 child, width is minimal. If 10 children, width is huge.
        const requiredWidth = Math.max(window.innerWidth, childrenCount * X_GAP + 400);
        const requiredHeight = Math.max(window.innerHeight, 3 * Y_GAP + 200); // Parent -> Current -> Children (3 levels)

        setCanvasWidth(requiredWidth);
        setCanvasHeight(requiredHeight);

        const centerX = requiredWidth / 2;
        const startY = 150; // Top padding

        const newCoords = {
            // Parent is Top Center
            parent: data.parent ? { x: centerX, y: startY, data: data.parent } : null,
            // Current is Middle Center
            current: { x: centerX, y: startY + Y_GAP, data: data.current },
            children: []
        };

        // Children are Bottom Row, Spreading Horizontally
        if (data.children && data.children.length > 0) {
            // Center the row of children
            const totalChildrenWidth = (childrenCount - 1) * X_GAP;
            const startX = centerX - totalChildrenWidth / 2;

            const childrenY = startY + Y_GAP * 2;

            newCoords.children = data.children.map((child, i) => ({
                x: startX + i * X_GAP,
                y: childrenY,
                data: child
            }));
        }
        setCoords(newCoords);
    }, [data]);


    const handleNodeClick = (id) => fetchLineage(id);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-2xl animate-fade-in">

            {/* Ambient Background Orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[20%] left-[20%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] animate-orb-pulse"></div>
                <div className="absolute bottom-[20%] right-[20%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] animate-orb-pulse delay-1000"></div>
            </div>

            {/* Wide Glossy Modal Box (Landscape Aspect Ratio) */}
            <div className="bg-black/40 backdrop-blur-3xl border border-white/10 rounded-[30px] w-[95vw] h-[75vh] max-w-none relative shadow-2xl flex flex-col overflow-hidden animate-pop-in ring-1 ring-white/5">

                {/* Header */}
                <div className="flex justify-between items-center px-8 py-6 border-b border-white/5 bg-white/5 backdrop-blur-md z-20">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-tr from-cyan-400 to-blue-600 rounded-2xl shadow-lg shadow-cyan-500/20">
                            <FiGitCommit className="text-white" size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                                Remix Genealogy <span className="text-xs font-normal text-cyan-300 px-2 py-0.5 rounded-full bg-cyan-900/30 border border-cyan-500/20">Horizontal View</span>
                            </h2>
                            <p className="text-sm text-zinc-400 font-medium">Tracing the creative evolution of this artwork.</p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 hover:scale-110 transition-all active:scale-95"
                    >
                        <FiX size={24} />
                    </button>
                </div>

                {/* Canvas Area */}
                <div className="flex-1 overflow-auto relative cursor-grab active:cursor-grabbing custom-scrollbar">
                    {/* Grid Background */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none"
                        style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
                    </div>

                    {loading ? (
                        <div className="absolute inset-0 flex items-center justify-center z-50">
                            <Loader />
                        </div>
                    ) : !data ? (
                        <div className="flex items-center justify-center h-full text-zinc-500">No Lineage Data Found</div>
                    ) : (
                        <svg width={canvasWidth} height={canvasHeight} className="min-w-full min-h-full">
                            <defs>
                                <linearGradient id="glossGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.8" />
                                    <stop offset="100%" stopColor="#c084fc" stopOpacity="0.8" />
                                </linearGradient>
                                <filter id="glow">
                                    <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                                    <feMerge>
                                        <feMergeNode in="coloredBlur" />
                                        <feMergeNode in="SourceGraphic" />
                                    </feMerge>
                                </filter>
                            </defs>

                            {/* Connections (Vertical Bezier) */}
                            {coords.parent && (
                                <Link
                                    from={{ x: coords.parent.x, y: coords.parent.y + NODE_HEIGHT / 2 }}
                                    to={{ x: coords.current.x, y: coords.current.y - NODE_HEIGHT / 2 }}
                                />
                            )}
                            {coords.children.map((child, i) => (
                                <Link
                                    key={`link-${i}`}
                                    from={{ x: coords.current.x, y: coords.current.y + NODE_HEIGHT / 2 }}
                                    to={{ x: child.x, y: child.y - NODE_HEIGHT / 2 }}
                                />
                            ))}

                            {/* Nodes (Glossy Cards) */}
                            {coords.parent && (
                                <Node
                                    x={coords.parent.x}
                                    y={coords.parent.y}
                                    data={coords.parent.data}
                                    width={NODE_WIDTH}
                                    height={NODE_HEIGHT}
                                    type="parent"
                                    onClick={() => handleNodeClick(coords.parent.data._id)}
                                />
                            )}

                            {coords.current && (
                                <Node
                                    x={coords.current.x}
                                    y={coords.current.y}
                                    data={coords.current.data}
                                    width={NODE_WIDTH * 1.3} // Bigger current node
                                    height={NODE_HEIGHT * 1.3}
                                    type="current"
                                    isCurrent
                                />
                            )}

                            {coords.children.map((child) => (
                                <Node
                                    key={child.data._id}
                                    x={child.x}
                                    y={child.y}
                                    data={child.data}
                                    width={NODE_WIDTH}
                                    height={NODE_HEIGHT}
                                    type="child"
                                    onClick={() => handleNodeClick(child.data._id)}
                                />
                            ))}
                        </svg>
                    )}
                </div>
            </div>
        </div>
    );
};

// Fluid Link Component (Vertical)
const Link = ({ from, to }) => {
    // Vertical S-curve: control points based on Y distance
    const midY = (from.y + to.y) / 2;
    return (
        <path
            d={`M${from.x} ${from.y} C${from.x} ${midY}, ${to.x} ${midY}, ${to.x} ${to.y}`}
            stroke="url(#glossGradient)"
            strokeWidth="3"
            fill="none"
            className="animate-dash"
            filter="url(#glow)"
        />
    );
};

// Gloss Morph Node Component
const Node = ({ x, y, data, width, height, onClick, isCurrent }) => {
    return (
        <foreignObject x={x - width / 2} y={y - height / 2} width={width} height={height} className="overflow-visible animate-pop-in">
            <div
                onClick={onClick}
                className={`
                    group relative w-full h-full rounded-[30px] overflow-hidden transition-all duration-500 cursor-pointer
                    ${isCurrent ? 'scale-100 z-20' : 'hover:scale-105 hover:-translate-y-2 z-10 opacity-90 hover:opacity-100'}
                `}
                style={{ perspective: '1000px' }}
            >
                {/* 1. Deep Gloss Background */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-black/60 backdrop-blur-xl border border-white/10 shadow-2xl rounded-[30px]"></div>

                {/* 2. Image Container */}
                <div className="absolute inset-3 bottom-20 rounded-[24px] overflow-hidden bg-black/50 shadow-inner group-hover:shadow-cyan-500/20 transition-all">
                    <img
                        src={data.photo}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        alt={data.name}
                    />
                    {/* Gloss Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>

                {/* 3. Info Glass Panel */}
                <div className="absolute bottom-3 left-3 right-3 h-14 bg-white/5 backdrop-blur-md rounded-[20px] flex items-center justify-between px-4 border border-white/10 group-hover:bg-white/10 transition-colors">
                    <div className="flex flex-col overflow-hidden">
                        <span className="text-white text-sm font-bold truncate">{data.name}</span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${isCurrent ? 'text-cyan-400' : 'text-zinc-500'}`}>
                            {isCurrent ? 'Current' : 'Remix'}
                        </span>
                    </div>
                </div>

                {/* 4. Active Glow Border */}
                {isCurrent && (
                    <div className="absolute inset-0 rounded-[30px] border-2 border-cyan-500/50 shadow-[0_0_50px_rgba(34,211,238,0.2)] pointer-events-none animate-pulse-slow"></div>
                )}
            </div>
        </foreignObject>
    );
};

export default RemixTreeModal;
