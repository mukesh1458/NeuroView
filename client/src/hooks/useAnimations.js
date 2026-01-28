import React, { useEffect, useRef, useState } from 'react';

// Animated Counter Hook
export const useAnimatedCounter = (endValue, duration = 1500, startOnMount = true) => {
    const [count, setCount] = useState(0);
    const startTimeRef = useRef(null);
    const animationFrameRef = useRef(null);

    useEffect(() => {
        if (!startOnMount || endValue === 0) {
            setCount(endValue);
            return;
        }

        const animate = (timestamp) => {
            if (!startTimeRef.current) startTimeRef.current = timestamp;
            const progress = Math.min((timestamp - startTimeRef.current) / duration, 1);

            // Ease-out cubic for smooth deceleration
            const easeOut = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(easeOut * endValue));

            if (progress < 1) {
                animationFrameRef.current = requestAnimationFrame(animate);
            }
        };

        animationFrameRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [endValue, duration, startOnMount]);

    return count;
};

// Ripple Effect Hook
export const useRipple = () => {
    const createRipple = (event) => {
        const button = event.currentTarget;
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;

        // Remove existing ripples
        const existingRipple = button.querySelector('.ripple');
        if (existingRipple) existingRipple.remove();

        button.appendChild(ripple);

        // Cleanup after animation
        setTimeout(() => ripple.remove(), 600);
    };

    return createRipple;
};

// Scroll Reveal Hook
export const useScrollReveal = (threshold = 0.1) => {
    const ref = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(entry.target); // Only reveal once
                }
            },
            { threshold }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, [threshold]);

    return [ref, isVisible];
};
