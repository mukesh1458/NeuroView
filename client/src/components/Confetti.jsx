import React, { useEffect, useState } from 'react';

const Confetti = ({ trigger, duration = 1500 }) => {
    const [pieces, setPieces] = useState([]);

    useEffect(() => {
        if (trigger) {
            // Generate confetti pieces
            const colors = ['#22d3ee', '#c084fc', '#facc15', '#4ade80', '#f472b6', '#818cf8'];
            const newPieces = Array.from({ length: 30 }).map((_, i) => ({
                id: i,
                left: `${Math.random() * 100}%`,
                color: colors[Math.floor(Math.random() * colors.length)],
                delay: Math.random() * 0.3,
                size: 6 + Math.random() * 6,
                rotation: Math.random() * 360,
            }));

            setPieces(newPieces);

            // Clear after animation
            const timer = setTimeout(() => setPieces([]), duration);
            return () => clearTimeout(timer);
        }
    }, [trigger, duration]);

    if (pieces.length === 0) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
            {pieces.map((piece) => (
                <div
                    key={piece.id}
                    className="confetti-piece"
                    style={{
                        left: piece.left,
                        top: '40%',
                        width: piece.size,
                        height: piece.size,
                        backgroundColor: piece.color,
                        borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                        animationDelay: `${piece.delay}s`,
                        transform: `rotate(${piece.rotation}deg)`,
                    }}
                />
            ))}
        </div>
    );
};

export default Confetti;
