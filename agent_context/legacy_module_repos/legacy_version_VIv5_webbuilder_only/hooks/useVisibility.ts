
import { useState, useEffect, RefObject } from 'react';

interface UseVisibilityProps {
    ref: RefObject<HTMLElement>;
    root?: HTMLElement | null;
    rootMargin?: string;
    threshold?: number | number[];
}

export const useVisibility = ({ ref, root = null, rootMargin = '0px', threshold = 0 }: UseVisibilityProps) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (!ref.current) return;

        const observer = new IntersectionObserver(([entry]) => {
            setIsVisible(entry.isIntersecting);
        }, {
            root,
            rootMargin,
            threshold
        });

        observer.observe(ref.current);

        return () => {
            observer.disconnect();
        };
    }, [ref, root, rootMargin, threshold]);

    return isVisible;
};
