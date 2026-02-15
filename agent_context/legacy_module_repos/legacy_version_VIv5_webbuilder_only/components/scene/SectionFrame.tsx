
import React, { useRef, useState, useEffect } from 'react';
import { SectionScene } from './SectionScene';
import { SceneObject } from '../../types';
import { useVisibility } from '../../hooks/useVisibility';
import { usePreview } from '../../contexts/PreviewContext';

interface SectionFrameProps {
    id: string;
    height: number;
    pinHeight: number;
    objects: SceneObject[];
    setRef: (el: HTMLElement | null) => void;
    children?: React.ReactNode;
    className?: string;
    clip?: boolean;
    overscanPx?: number;
}

/**
 * SectionFrame (Phase L1)
 * Owns the structural contract for a section:
 * - Document flow height
 * - Sticky/Pinning behavior
 * - Local coordinate system
 * - Visibility culling wrapper (with overscan)
 * - Section-local progress calculation (Phase I2)
 */
export const SectionFrame: React.FC<SectionFrameProps> = ({ 
    id, height, pinHeight, objects, setRef, children, className = "", clip = true, overscanPx = 500
}) => {
    const localRef = useRef<HTMLDivElement>(null);
    const { scrollContainer } = usePreview();
    
    // Phase I3: Visibility culling + configurable overscan to prevent pop-in
    // We pass scrollContainer as root if available, though null (viewport) is often sufficient 
    // unless scaling/clipping applies.
    const isVisible = useVisibility({ 
        ref: localRef, 
        root: scrollContainer,
        rootMargin: `${overscanPx}px` 
    }); 
    
    const [progress, setProgress] = useState(0);

    const handleRef = (el: HTMLDivElement | null) => {
        localRef.current = el;
        setRef(el);
    };

    // Phase I2: Section-local progress math
    useEffect(() => {
        const handleScroll = () => {
            if (!localRef.current) return;
            const rect = localRef.current.getBoundingClientRect();
            
            // Calculate distance the user must scroll to complete this section
            // Formula: Height (Flow) - PinHeight (Window)
            const distance = height - pinHeight;
            
            // Guard: If section isn't taller than its pin window (e.g. standard Hero),
            // we default to 0 or 1 based on position.
            if (distance < 1) {
                setProgress(rect.top > 0 ? 0 : 1);
                return;
            }

            // Raw Progress: 0 when top aligns with viewport top. 
            // Increases as we scroll down (rect.top becomes negative).
            const raw = -rect.top / distance;
            setProgress(raw);
        };

        // Performance: Only attach scroll listener if we are close to viewport
        // IMPORTANT: Attach to the scrollContainer, not window
        if (isVisible && scrollContainer) {
            scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
            handleScroll(); // Initial calculation
        }
        
        return () => {
            if (scrollContainer) {
                scrollContainer.removeEventListener('scroll', handleScroll);
            }
        };
    }, [isVisible, height, pinHeight, scrollContainer]);

    // Clamp progress for rendering scene (safety against out-of-bounds inputs)
    const clampedProgress = Math.max(0, Math.min(1, progress));

    return (
        <div 
            ref={handleRef} 
            id={id}
            style={{ height: `${height}px` }} 
            className={`relative w-full ${className}`}
        >
            <div 
                className={`sticky top-0 w-full ${clip ? 'overflow-hidden' : 'overflow-visible'}`}
                style={{ height: `${pinHeight}px` }}
            >
                <div className="relative w-full h-full">
                    {/* Render Content (Always rendered for SEO/Search/Layout) */}
                    <div className="relative z-10 w-full h-full">
                        {children}
                    </div>
                    
                    {/* Render Scene Background (Culled when offscreen) */}
                    <div className="absolute inset-0 z-0">
                        {isVisible && <SectionScene objects={objects} progress={clampedProgress} />}
                    </div>
                </div>
            </div>
        </div>
    );
};
