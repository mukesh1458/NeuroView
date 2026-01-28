import React, { useEffect, useState, useRef } from 'react';

const CustomCursor = () => {
    const cursorRef = useRef(null);
    const dotRef = useRef(null);
    const [isHovering, setIsHovering] = useState(false);

    useEffect(() => {
        document.body.classList.add('custom-cursor-enabled');

        const moveCursor = (e) => {
            if (cursorRef.current && dotRef.current) {
                // Ring follows with slight delay
                cursorRef.current.style.left = `${e.clientX - 10}px`;
                cursorRef.current.style.top = `${e.clientY - 10}px`;

                // Dot follows exactly
                dotRef.current.style.left = `${e.clientX - 3}px`;
                dotRef.current.style.top = `${e.clientY - 3}px`;
            }
        };

        const handleMouseOver = (e) => {
            // Check if hovering over interactive elements
            const target = e.target;
            const isInteractive =
                target.tagName === 'BUTTON' ||
                target.tagName === 'A' ||
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.closest('button') ||
                target.closest('a') ||
                target.classList.contains('cursor-pointer');

            setIsHovering(isInteractive);
        };

        window.addEventListener('mousemove', moveCursor);
        window.addEventListener('mouseover', handleMouseOver);

        return () => {
            document.body.classList.remove('custom-cursor-enabled');
            window.removeEventListener('mousemove', moveCursor);
            window.removeEventListener('mouseover', handleMouseOver);
        };
    }, []);

    return (
        <>
            <div
                ref={cursorRef}
                className={`custom-cursor ${isHovering ? 'hovering' : ''}`}
            />
            <div ref={dotRef} className="custom-cursor-dot" />
        </>
    );
};

export default CustomCursor;
