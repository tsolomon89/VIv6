import { useState } from 'react';
import { RefreshCw, Database, Settings as SettingsIcon } from 'lucide-react';
import { ReseedPreviewModal } from '../components/ReseedPreviewModal';

export function SettingsPage() {
    const [showReseed, setShowReseed] = useState(false);

    return (
        <div className="max-w-4xl mx-auto p-8 space-y-8">
            <header className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-zinc-800 rounded-xl">
                    <SettingsIcon size={24} className="text-zinc-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white">System Settings</h1>
                    <p className="text-zinc-500">Manage platform configuration and state.</p>
                </div>
            </header>

            <div className="grid gap-6">
                <section className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-800/20">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Database size={20} className="text-indigo-400" />
                            Data & State
                        </h2>
                    </div>
                    
                    <div className="p-6 space-y-6">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h3 className="font-medium text-white mb-1">Reseed System State</h3>
                                <p className="text-sm text-zinc-400">
                                    Verify and repair the foundational entities compared to the "known good" seed state.
                                    This uses a <strong>Diff & Patch</strong> system to ensure user data is preserved where possible.
                                </p>
                            </div>
                            <button 
                                onClick={() => setShowReseed(true)}
                                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm font-medium border border-zinc-700 flex items-center gap-2 whitespace-nowrap"
                            >
                                <RefreshCw size={16} />
                                Check State
                            </button>
                        </div>
                    </div>
                </section>
            </div>

            {showReseed && <ReseedPreviewModal onClose={() => setShowReseed(false)} />}
        </div>
    );
}
