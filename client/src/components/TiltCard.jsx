import React, { useRef, useState } from 'react';

const TiltCard = ({ children, className = "" }) => {
    const cardRef = useRef(null);
    const [rotation, setRotation] = useState({ x: 0, y: 0 });
    const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50 });
    const [isHovering, setIsHovering] = useState(false);

    const handleMouseMove = (e) => {
        if (!cardRef.current) return;

        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left; // Mouse X relative to card
        const y = e.clientY - rect.top;  // Mouse Y relative to card

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // Calculate rotation (Max tilt: 10 degrees)
        // Mouse Right -> Rotate Y Positive
        // Mouse Bottom -> Rotate X Negative
        const rotateX = ((y - centerY) / centerY) * -10;
        const rotateY = ((x - centerX) / centerX) * 10;

        // Glare position (follows mouse)
        const glareX = (x / rect.width) * 100;
        const glareY = (y / rect.height) * 100;

        setRotation({ x: rotateX, y: rotateY });
        setGlarePosition({ x: glareX, y: glareY });
    };

    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => {
        setIsHovering(false);
        setRotation({ x: 0, y: 0 }); // Reset tilt
        setGlarePosition({ x: 50, y: 50 }); // Reset glare to center
    };

    return (
        <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`relative transition-transform duration-200 ease-out preserve-3d ${className}`} // Fast duration for smooth tracking
            style={{
                transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(${isHovering ? 1.02 : 1})`,
                willChange: 'transform',
            }}
        >
            {children}

            {/* Holographic Glare Overlay */}
            <div
                className="absolute inset-0 pointer-events-none rounded-xl z-50 mix-blend-overlay transition-opacity duration-300 ease-out"
                style={{
                    background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 80%)`,
                    opacity: isHovering ? 1 : 0,
                }}
            />

            {/* Edge Reflection (Border Shine) */}
            <div
                className="absolute inset-0 rounded-xl pointer-events-none z-50 transition-opacity duration-300"
                style={{
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: isHovering ? '0 0 20px rgba(6,182,212,0.2)' : 'none',
                    opacity: isHovering ? 1 : 0
                }}
            />
        </div>
    );
};

export default TiltCard;
