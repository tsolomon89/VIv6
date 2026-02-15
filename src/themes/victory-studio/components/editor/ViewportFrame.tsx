
import React, { useState } from 'react';
import { Smartphone, Tablet, Monitor, Maximize } from 'lucide-react';

interface ViewportFrameProps {
    children: React.ReactNode;
}

export const ViewportFrame: React.FC<ViewportFrameProps> = ({ children }) => {
    const [width, setWidth] = useState<string>('100%');
    const [device, setDevice] = useState<'mobile' | 'tablet' | 'desktop' | 'full'>('full');

    const handleResize = (mode: 'mobile' | 'tablet' | 'desktop' | 'full') => {
        setDevice(mode);
        switch (mode) {
            case 'mobile': setWidth('390px'); break; // iPhone 14 Proish
            case 'tablet': setWidth('820px'); break; // iPad Airish
            case 'desktop': setWidth('1440px'); break;
            case 'full': setWidth('100%'); break;
        }
    };

    return (
        <div className="flex flex-col w-full h-full relative">
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 flex bg-black/80 backdrop-blur-md border border-white/10 rounded-full p-1 shadow-xl">
                <button 
                    onClick={() => handleResize('mobile')}
                    className={`p-2 rounded-full transition-colors ${device === 'mobile' ? 'bg-blue-500 text-white' : 'text-white/50 hover:text-white'}`}
                    title="Mobile (390px)"
                >
                    <Smartphone className="w-4 h-4" />
                </button>
                <button 
                    onClick={() => handleResize('tablet')}
                    className={`p-2 rounded-full transition-colors ${device === 'tablet' ? 'bg-blue-500 text-white' : 'text-white/50 hover:text-white'}`}
                    title="Tablet (820px)"
                >
                    <Tablet className="w-4 h-4" />
                </button>
                <button 
                    onClick={() => handleResize('desktop')}
                    className={`p-2 rounded-full transition-colors ${device === 'desktop' ? 'bg-blue-500 text-white' : 'text-white/50 hover:text-white'}`}
                    title="Desktop (1440px)"
                >
                    <Monitor className="w-4 h-4" />
                </button>
                <div className="w-px bg-white/10 mx-1" />
                <button 
                    onClick={() => handleResize('full')}
                    className={`p-2 rounded-full transition-colors ${device === 'full' ? 'bg-blue-500 text-white' : 'text-white/50 hover:text-white'}`}
                    title="Full Width"
                >
                    <Maximize className="w-4 h-4" />
                </button>
            </div>

            <div className="flex-1 w-full flex justify-center overflow-x-hidden bg-[#0a0a0a]">
                <div 
                    className="relative transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)] bg-[#1A1A1B] shadow-2xl overflow-hidden mx-auto shrink-0"
                    style={{ 
                        width: width,
                        marginTop: device !== 'full' ? '20px' : '0',
                        marginBottom: device !== 'full' ? '20px' : '0',
                        borderRadius: device !== 'full' ? '12px' : '0', // Add radius when framed
                        border: device !== 'full' ? '1px solid rgba(255,255,255,0.1)' : 'none',
                        minHeight: '100%' // Ensure it fills height
                    }}
                >
                    {children}
                </div>
            </div>
        </div>
    );
};
