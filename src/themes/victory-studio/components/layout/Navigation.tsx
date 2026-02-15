
import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export const Navigation = ({ isOpen }: { isOpen: boolean }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="absolute inset-0 z-30 bg-neutral-950 flex flex-col items-center justify-center min-h-full">
        <nav className="flex flex-col gap-8 text-center">
          {['Work', 'Studio', 'Contact'].map((item, i) => (
            <motion.a href="#" key={item} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.1 }} className="text-4xl md:text-6xl font-medium tracking-tighter hover:text-white/60 transition-colors">{item}</motion.a>
          ))}
        </nav>
      </motion.div>
    )}
  </AnimatePresence>
);
