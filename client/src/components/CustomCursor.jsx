import React, { useEffect, useState, useRef } from 'react';

const CustomCursor = () => {
    const cursorRef = useRef(null); // The Ring
    const dotRef = useRef(null);    // The Dot

    const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
    const [ringPosition, setRingPosition] = useState({ x: -100, y: -100 });
    const [isHovering, setIsHovering] = useState(false);
    const [isClicked, setIsClicked] = useState(false);

    // Physics constants
    const LAG_FACTOR = 0.15; // Lower = slower lag, Higher = faster catchup

    useEffect(() => {
        document.body.classList.add('custom-cursor-enabled');

        const onMouseMove = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        const onMouseDown = () => setIsClicked(true);
        const onMouseUp = () => setIsClicked(false);

        const onMouseOver = (e) => {
            const target = e.target;
            const isInteractive =
                target.tagName === 'BUTTON' ||
                target.tagName === 'A' ||
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.closest('button') ||
                target.closest('a') ||
                target.closest('.cursor-pointer') ||
                target.closest('.interactive') ||
                getComputedStyle(target).cursor === 'pointer';

            setIsHovering(isInteractive);
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mouseup', onMouseUp);
        window.addEventListener('mouseover', onMouseOver);

        return () => {
            document.body.classList.remove('custom-cursor-enabled');
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mousedown', onMouseDown);
            window.removeEventListener('mouseup', onMouseUp);
            window.removeEventListener('mouseover', onMouseOver);
        };
    }, []);

    // Animation Loop for Smooth Physics
    useEffect(() => {
        let animationFrameId;

        const loop = () => {
            setRingPosition((prev) => {
                const dx = mousePosition.x - prev.x;
                const dy = mousePosition.y - prev.y;

                return {
                    x: prev.x + dx * LAG_FACTOR,
                    y: prev.y + dy * LAG_FACTOR
                };
            });
            animationFrameId = requestAnimationFrame(loop);
        };

        loop();
        return () => cancelAnimationFrame(animationFrameId);
    }, [mousePosition]);

    // Update Transform directly for performance
    useEffect(() => {
        if (dotRef.current) {
            dotRef.current.style.transform = `translate3d(${mousePosition.x}px, ${mousePosition.y}px, 0)`;
        }
        if (cursorRef.current) {
            cursorRef.current.style.transform = `translate3d(${ringPosition.x}px, ${ringPosition.y}px, 0) scale(${isClicked ? 0.8 : isHovering ? 1.5 : 1})`;
        }
    }, [mousePosition, ringPosition, isClicked, isHovering]);

    return (
        <>
            <div ref={dotRef} className="custom-cursor-dot" />
            <div ref={cursorRef} className={`custom-cursor-ring ${isHovering ? 'hovering' : ''}`} />
        </>
    );
};

export default CustomCursor;
