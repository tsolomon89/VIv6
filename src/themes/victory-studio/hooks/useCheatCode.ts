import React, { useState, useRef, useEffect } from 'react';

export const useCheatCode = () => {
    const [hasUnlockedDebug, setHasUnlockedDebug] = useState(() => {
        return localStorage.getItem('debug_unlocked') === 'true';
    });

    const [isDebugMode, setIsDebugModeState] = useState(() => {
        const saved = localStorage.getItem('debug_mode');
        return localStorage.getItem('debug_unlocked') === 'true' && saved === 'true';
    });
    
    const [flash, setFlash] = useState(false);
    const inputBuffer = useRef<string[]>([]);
    const touchStart = useRef<{x:number, y:number} | null>(null);

    const SEQUENCE = [
        'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 
        'ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'
    ];

    const setIsDebugMode = (val: boolean) => {
        setIsDebugModeState(val);
        localStorage.setItem('debug_mode', String(val));
    };

    const checkSequence = (key: string) => {
        const buffer = inputBuffer.current;
        buffer.push(key);
        if (buffer.length > SEQUENCE.length) {
            buffer.shift();
        }
        if (JSON.stringify(buffer) === JSON.stringify(SEQUENCE)) {
            if (!hasUnlockedDebug) {
                setHasUnlockedDebug(true);
                localStorage.setItem('debug_unlocked', 'true');
            }
            setIsDebugMode(true);
            setFlash(true);
            setTimeout(() => setFlash(false), 1000);
            inputBuffer.current = [];
        }
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (!touchStart.current) return;
        const dx = e.changedTouches[0].clientX - touchStart.current.x;
        const dy = e.changedTouches[0].clientY - touchStart.current.y;
        if (Math.abs(dx) > 30 || Math.abs(dy) > 30) {
            if (Math.abs(dx) > Math.abs(dy)) {
                checkSequence(dx > 0 ? 'ArrowRight' : 'ArrowLeft');
            } else {
                checkSequence(dy > 0 ? 'ArrowDown' : 'ArrowUp');
            }
        }
        touchStart.current = null;
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => checkSequence(e.key);
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [hasUnlockedDebug]);

    return { 
        hasUnlockedDebug, 
        isDebugMode, 
        setIsDebugMode, 
        flash, 
        handleTouchStart, 
        handleTouchEnd 
    };
};