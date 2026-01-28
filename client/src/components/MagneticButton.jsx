import React, { useRef } from 'react';

const MagneticButton = ({ children, className = "", strength = 0.3, ...props }) => {
    const btnRef = useRef(null);

    const handleMouseMove = (e) => {
        if (!btnRef.current) return;

        const rect = btnRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        // Apply magnetic pull (move button towards cursor)
        btnRef.current.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
    };

    const handleMouseLeave = () => {
        if (!btnRef.current) return;
        // Reset position with spring-back
        btnRef.current.style.transform = 'translate(0, 0)';
    };

    return (
        <button
            ref={btnRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={`magnetic-btn hover-glow ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export default MagneticButton;
