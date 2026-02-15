
import React from 'react';

interface AppShellProps {
    children: React.ReactNode;
    sidebarContent: React.ReactNode;
    isSidebarOpen: boolean;
    setScrollContainer: (el: HTMLElement | null) => void;
}

export const AppShell: React.FC<AppShellProps> = ({ children, sidebarContent, isSidebarOpen, setScrollContainer }) => {
    return (
        <div className="relative h-screen w-full overflow-hidden bg-[#1A1A1B]">
            {/* Main Content Wrapper (Scroll Container) */}
            <div 
                ref={setScrollContainer}
                className="h-full overflow-y-auto overflow-x-hidden custom-scrollbar relative"
                style={{ 
                    marginRight: isSidebarOpen ? '420px' : '0px',
                    transition: 'margin-right 300ms ease-in-out'
                }}
            >
                {children}
            </div>

            {/* Sidebar - Fixed Right */}
            <div 
                className={`fixed top-0 right-0 h-screen w-[420px] bg-[#111] border-l border-white/10 z-50 shadow-2xl transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                {/* Sidebar Content Container */}
                <div className="w-full h-full flex flex-col overflow-hidden text-white/80 bg-[#1A1A1B]">
                    {sidebarContent}
                </div>
            </div>
        </div>
    );
};
