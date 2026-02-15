
import { useEffect, useRef, useState } from 'react';

// Sequence requested by user: up,down,left,right,right,left,down,up
const KONAMI_SEQUENCE = [
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowRight',
  'ArrowLeft',
  'ArrowDown',
  'ArrowUp'
];

export const useKonamiCode = (onUnlock: () => void) => {
  const [input, setInput] = useState<string[]>([]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Clear timeout for reset on key press
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      const nextInput = [...input, e.key];
      
      // Keep only as many keys as the sequence length
      if (nextInput.length > KONAMI_SEQUENCE.length) {
        nextInput.shift();
      }

      setInput(nextInput);

      // Check for match
      if (JSON.stringify(nextInput) === JSON.stringify(KONAMI_SEQUENCE)) {
        onUnlock();
        setInput([]); // Reset after unlock
      }

      // Reset buffer after 2 seconds of inactivity
      timeoutRef.current = setTimeout(() => {
        setInput([]);
      }, 2000);
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [input, onUnlock]);

  return input;
};
