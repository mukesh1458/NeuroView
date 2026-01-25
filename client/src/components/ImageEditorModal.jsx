import React, { useState, useRef, useEffect } from 'react';
import { FiX, FiType, FiImage, FiFilm, FiCamera, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';

const FONTS = [
    'Inter',
    'Playfair Display',
    'Bebas Neue',
    'Pacifico',
    'Oswald',
    'Dancing Script'
];

const FRAMES = [
    { name: 'None', style: null },
    { name: 'Classic', style: { width: 20, color: '#ffffff' } },
    { name: 'Polaroid', style: { width: 40, color: '#ffffff', bottom: 60 } },
    { name: 'Film Strip', style: { pattern: 'film' } },
    { name: 'Modern', style: { width: 3, color: '#000000' } },
    { name: 'Vintage', style: { width: 15, color: '#d4af71' } }
];

const ImageEditorModal = ({ imageUrl, onSave, onClose }) => {
    const canvasRef = useRef(null);
    const [activeTab, setActiveTab] = useState('text');

    // Text overlay state
    const [text, setText] = useState('');
    const [textFont, setTextFont] = useState('Inter');
    const [textColor, setTextColor] = useState('#ffffff');
    const [textSize, setTextSize] = useState(48);
    const [textPosition, setTextPosition] = useState({ x: 50, y: 50 }); // percentage

    // Frame state
    const [selectedFrame, setSelectedFrame] = useState(0);

    // Film grain state
    const [filmGrainEnabled, setFilmGrainEnabled] = useState(false);
    const [filmGrainIntensity, setFilmGrainIntensity] = useState(50);

    // Cinematic filter state
    const [cinematicEnabled, setCinematicEnabled] = useState(false);

    const [baseImage, setBaseImage] = useState(null);

    // Load image
    useEffect(() => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = imageUrl;
        img.onload = () => {
            setBaseImage(img);
            renderCanvas(img);
        };
    }, [imageUrl]);

    // Re-render on any change
    useEffect(() => {
        if (baseImage) renderCanvas(baseImage);
    }, [text, textFont, textColor, textSize, textPosition, selectedFrame, filmGrainEnabled, filmGrainIntensity, cinematicEnabled, baseImage]);

    const renderCanvas = (img) => {
        const canvas = canvasRef.current;
        if (!canvas || !img) return;

        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;

        // 1. Draw base image with cinematic filter
        if (cinematicEnabled) {
            ctx.filter = 'saturate(85%) sepia(10%) contrast(110%)';
        }
        ctx.drawImage(img, 0, 0);
        ctx.filter = 'none';

        // 2. Apply vignette if cinematic
        if (cinematicEnabled) {
            const gradient = ctx.createRadialGradient(
                canvas.width / 2, canvas.height / 2, canvas.width * 0.3,
                canvas.width / 2, canvas.height / 2, canvas.width * 0.7
            );
            gradient.addColorStop(0, 'rgba(0,0,0,0)');
            gradient.addColorStop(1, 'rgba(0,0,0,0.4)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // 3. Draw frame/border
        const frame = FRAMES[selectedFrame];
        if (frame.style) {
            if (frame.style.pattern === 'film') {
                // Film strip pattern
                ctx.fillStyle = '#000000';
                ctx.fillRect(0, 0, canvas.width, 30);
                ctx.fillRect(0, canvas.height - 30, canvas.width, 30);

                // Sprocket holes
                ctx.fillStyle = '#ffffff';
                for (let i = 0; i < canvas.width; i += 40) {
                    ctx.fillRect(i + 10, 5, 20, 10);
                    ctx.fillRect(i + 10, 15, 20, 10);
                    ctx.fillRect(i + 10, canvas.height - 25, 20, 10);
                    ctx.fillRect(i + 10, canvas.height - 15, 20, 10);
                }
            } else {
                // Regular border
                ctx.strokeStyle = frame.style.color;
                ctx.lineWidth = frame.style.width;
                const offset = frame.style.width / 2;
                ctx.strokeRect(offset, offset, canvas.width - frame.style.width, canvas.height - frame.style.width);

                // Polaroid bottom spacing
                if (frame.style.bottom) {
                    ctx.fillStyle = frame.style.color;
                    ctx.fillRect(0, canvas.height - frame.style.bottom, canvas.width, frame.style.bottom);
                }
            }
        }

        // 4. Apply film grain
        if (filmGrainEnabled) {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            const intensity = filmGrainIntensity / 100;

            for (let i = 0; i < data.length; i += 4) {
                const noise = (Math.random() - 0.5) * intensity * 100;
                data[i] += noise;     // R
                data[i + 1] += noise; // G
                data[i + 2] += noise; // B
            }
            ctx.putImageData(imageData, 0, 0);
        }

        // 5. Draw text overlay
        if (text) {
            ctx.font = `bold ${textSize}px "${textFont}"`;
            ctx.fillStyle = textColor;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Add text shadow for readability
            ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
            ctx.shadowBlur = 10;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;

            const x = (textPosition.x / 100) * canvas.width;
            const y = (textPosition.y / 100) * canvas.height;
            ctx.fillText(text, x, y);

            ctx.shadowColor = 'transparent';
        }
    };

    const handleSave = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            onSave(url);
            toast.success('Image updated!');
            onClose();
        }, 'image/png');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fade-in p-4">
            <div className="w-full max-w-6xl h-[90vh] glass-panel rounded-2xl flex flex-col overflow-hidden">

                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-white/10">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <FiCamera /> Image Editor
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <FiX className="text-white" size={24} />
                    </button>
                </div>

                <div className="flex flex-1 overflow-hidden">

                    {/* Left Sidebar - Tools */}
                    <div className="w-80 border-r border-white/10 p-4 overflow-y-auto custom-scrollbar">

                        {/* Tab Selector */}
                        <div className="grid grid-cols-4 gap-2 mb-6">
                            <button
                                onClick={() => setActiveTab('text')}
                                className={`p-3 rounded-lg flex flex-col items-center gap-1 transition-all ${activeTab === 'text' ? 'bg-white/20 text-white' : 'bg-white/5 text-zinc-400 hover:bg-white/10'}`}
                            >
                                <FiType size={20} />
                                <span className="text-xs">Text</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('frame')}
                                className={`p-3 rounded-lg flex flex-col items-center gap-1 transition-all ${activeTab === 'frame' ? 'bg-white/20 text-white' : 'bg-white/5 text-zinc-400 hover:bg-white/10'}`}
                            >
                                <FiImage size={20} />
                                <span className="text-xs">Frame</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('grain')}
                                className={`p-3 rounded-lg flex flex-col items-center gap-1 transition-all ${activeTab === 'grain' ? 'bg-white/20 text-white' : 'bg-white/5 text-zinc-400 hover:bg-white/10'}`}
                            >
                                <FiFilm size={20} />
                                <span className="text-xs">Grain</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('cinematic')}
                                className={`p-3 rounded-lg flex flex-col items-center gap-1 transition-all ${activeTab === 'cinematic' ? 'bg-white/20 text-white' : 'bg-white/5 text-zinc-400 hover:bg-white/10'}`}
                            >
                                <FiCamera size={20} />
                                <span className="text-xs">Cinema</span>
                            </button>
                        </div>

                        {/* Text Tab */}
                        {activeTab === 'text' && (
                            <div className="flex flex-col gap-4">
                                <div>
                                    <label className="text-xs text-zinc-400 uppercase tracking-wider mb-2 block">Text</label>
                                    <input
                                        type="text"
                                        value={text}
                                        onChange={(e) => setText(e.target.value)}
                                        placeholder="Enter text..."
                                        className="input-modern"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs text-zinc-400 uppercase tracking-wider mb-2 block">Font</label>
                                    <select
                                        value={textFont}
                                        onChange={(e) => setTextFont(e.target.value)}
                                        className="input-modern"
                                    >
                                        {FONTS.map(font => (
                                            <option key={font} value={font} style={{ fontFamily: font }}>{font}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs text-zinc-400 uppercase tracking-wider mb-2 block">Color</label>
                                    <input
                                        type="color"
                                        value={textColor}
                                        onChange={(e) => setTextColor(e.target.value)}
                                        className="w-full h-10 rounded-lg cursor-pointer"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs text-zinc-400 uppercase tracking-wider mb-2 block">Size: {textSize}px</label>
                                    <input
                                        type="range"
                                        min="20"
                                        max="120"
                                        value={textSize}
                                        onChange={(e) => setTextSize(Number(e.target.value))}
                                        className="w-full"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs text-zinc-400 uppercase tracking-wider mb-2 block">Position X: {textPosition.x}%</label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={textPosition.x}
                                        onChange={(e) => setTextPosition({ ...textPosition, x: Number(e.target.value) })}
                                        className="w-full"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs text-zinc-400 uppercase tracking-wider mb-2 block">Position Y: {textPosition.y}%</label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={textPosition.y}
                                        onChange={(e) => setTextPosition({ ...textPosition, y: Number(e.target.value) })}
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Frame Tab */}
                        {activeTab === 'frame' && (
                            <div className="flex flex-col gap-3">
                                <label className="text-xs text-zinc-400 uppercase tracking-wider mb-2 block">Select Frame</label>
                                {FRAMES.map((frame, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedFrame(idx)}
                                        className={`p-3 rounded-lg text-left transition-all ${selectedFrame === idx ? 'bg-white/20 text-white ring-2 ring-cyan-500' : 'bg-white/5 text-zinc-300 hover:bg-white/10'}`}
                                    >
                                        {frame.name}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Film Grain Tab */}
                        {activeTab === 'grain' && (
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm text-zinc-300">Enable Film Grain</label>
                                    <button
                                        onClick={() => setFilmGrainEnabled(!filmGrainEnabled)}
                                        className={`px-4 py-2 rounded-lg transition-all ${filmGrainEnabled ? 'bg-cyan-600 text-white' : 'bg-white/10 text-zinc-400'}`}
                                    >
                                        {filmGrainEnabled ? 'ON' : 'OFF'}
                                    </button>
                                </div>

                                {filmGrainEnabled && (
                                    <div>
                                        <label className="text-xs text-zinc-400 uppercase tracking-wider mb-2 block">Intensity: {filmGrainIntensity}%</label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={filmGrainIntensity}
                                            onChange={(e) => setFilmGrainIntensity(Number(e.target.value))}
                                            className="w-full"
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Cinematic Tab */}
                        {activeTab === 'cinematic' && (
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm text-zinc-300">Cinematic Filter</label>
                                    <button
                                        onClick={() => setCinematicEnabled(!cinematicEnabled)}
                                        className={`px-4 py-2 rounded-lg transition-all ${cinematicEnabled ? 'bg-cyan-600 text-white' : 'bg-white/10 text-zinc-400'}`}
                                    >
                                        {cinematicEnabled ? 'ON' : 'OFF'}
                                    </button>
                                </div>
                                <p className="text-xs text-zinc-500">Apply film-like color grading with subtle desaturation, sepia tones, and vignette.</p>
                            </div>
                        )}
                    </div>

                    {/* Right Side - Preview */}
                    <div className="flex-1 p-6 flex flex-col items-center justify-center bg-black/20">
                        <div className="w-full h-full flex items-center justify-center">
                            <canvas
                                ref={canvasRef}
                                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 p-4 border-t border-white/10">
                    <button onClick={onClose} className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleSave} className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg transition-all flex items-center gap-2 shadow-lg">
                        <FiCheck /> Apply Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImageEditorModal;
