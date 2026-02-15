
import { createContext, useContext } from 'react';

interface PreviewContextType {
    scrollContainer: HTMLElement | null;
}

export const PreviewContext = createContext<PreviewContextType>({
    scrollContainer: null
});

export const usePreview = () => useContext(PreviewContext);
