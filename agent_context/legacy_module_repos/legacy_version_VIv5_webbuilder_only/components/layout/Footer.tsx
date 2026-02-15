
import React from 'react';

export const Footer = () => (
  <footer className="py-12 px-6 md:px-12 bg-neutral-950 text-white">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-24">
      <div className="col-span-1 md:col-span-2">
        <h2 className="text-4xl font-bold tracking-tighter mb-8">Superdesign®</h2>
        <p className="max-w-md text-neutral-400">A digital design studio crafting experiences for the modern web. Based in Tokyo, working globally.</p>
      </div>
    </div>
    <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/10 text-sm text-neutral-600">
      <p>© 2024 Superdesign Studio. All rights reserved.</p>
    </div>
  </footer>
);
