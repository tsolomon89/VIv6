
import React, { useState } from 'react';
import type { RecordCardConfig } from '../config/studio-config';
import { Algo3Engine, type Algo3Input, type Algo3Output } from '../../../lib/algo3';
import { api } from '../../../lib/api';
import { Wand2, Save, ArrowLeft } from 'lucide-react';

interface RecordCardAlgo3Props {
    config: RecordCardConfig;
    parentRecord: any;
}

export const RecordCardAlgo3: React.FC<RecordCardAlgo3Props> = ({ config, parentRecord }) => {
    const [step, setStep] = useState<'select' | 'setup' | 'stupify'>('select');
    const [input, setInput] = useState<Algo3Input>({
        productName: '',
        productFeatures: [],
        personaName: '',
        personaPainPoints: [],
        tone: 'professional',
        format: 'email'
    });
    const [output, setOutput] = useState<Algo3Output | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Mock data fetching for Select step (In real app, fetch from API)
    const products = [{ name: 'Oblio BOS', features: ['Economic Physics', 'Algo 3'] }];
    const personas = [{ name: 'Decision Maker', painPoints: ['Revenue Uncertainty', 'High CAC'] }];

    const handleGenerate = () => {
        const result = Algo3Engine.generate(input);
        setOutput(result);
        setStep('stupify');
    };

    const handleSave = async () => {
        if (!output) return;
        setIsSaving(true);
        try {
            const content = `# ${output.headline}\n\n${output.body}\n\n[CTA]: ${output.callToAction}`;
            const slug = output.headline.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'new-asset-' + Date.now();
            
            await api.createEntity({
                type: 'asset',
                name: output.headline,
                slug: slug,
                data: {
                    fieldGroups: [{
                        name: 'General',
                        fields: [
                            { name: 'Group', inputType: 'text', value: parentRecord.id },
                            { name: 'Type', inputType: 'select', value: input.format },
                            { name: 'Content', inputType: 'textarea', value: content },
                            { name: 'Status', inputType: 'select', value: 'draft' }
                        ]
                    }]
                }
            });
            alert('Asset Saved!');
            setStep('select'); // Reset
        } catch (e) {
            console.error(e);
            alert('Failed to save asset.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="h-full flex flex-col bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-100 flex items-center gap-2 bg-gradient-to-r from-purple-50 to-white">
                <Wand2 className="h-5 w-5 text-purple-600" />
                <h3 className="font-semibold text-zinc-900">{config.title || 'Algo 3: Asset Generator'}</h3>
                {step !== 'select' && (
                    <span className="ml-auto text-xs font-medium px-2 py-1 rounded bg-purple-100 text-purple-700 uppercase tracking-wide">
                        {step} Phase
                    </span>
                )}
            </div>
            
            <div className="flex-1 overflow-auto p-6 space-y-6">
                {step === 'select' && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-700">Product Context</label>
                            <select 
                                className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                onChange={(e) => {
                                    const p = products.find(p => p.name === e.target.value);
                                    if (p) setInput(prev => ({ ...prev, productName: p.name, productFeatures: p.features }));
                                }}
                                value={input.productName}
                            >
                                <option value="">Select Product...</option>
                                {products.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-700">Target Persona</label>
                            <select 
                                className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                onChange={(e) => {
                                    const p = personas.find(p => p.name === e.target.value);
                                    if (p) setInput(prev => ({ ...prev, personaName: p.name, personaPainPoints: p.painPoints }));
                                }}
                                value={input.personaName}
                            >
                                <option value="">Select Persona...</option>
                                {personas.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                            </select>
                        </div>
                        <button 
                            className="w-full py-2 bg-zinc-900 text-white rounded-md hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                            onClick={() => setStep('setup')} 
                            disabled={!input.productName || !input.personaName}
                        >
                            Next: Setup
                        </button>
                    </div>
                )}

                {step === 'setup' && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-700">Format</label>
                                <select 
                                    className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    value={input.format} 
                                    onChange={(e: any) => setInput(prev => ({ ...prev, format: e.target.value }))}
                                >
                                    <option value="email">Email</option>
                                    <option value="linkedin">LinkedIn Post</option>
                                    <option value="blog">Blog Intro</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-700">Tone</label>
                                <select 
                                    className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    value={input.tone} 
                                    onChange={(e: any) => setInput(prev => ({ ...prev, tone: e.target.value }))}
                                >
                                    <option value="professional">Professional</option>
                                    <option value="urgent">Urgent</option>
                                    <option value="empathetic">Empathetic</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button 
                                className="px-4 py-2 border border-zinc-300 rounded-md hover:bg-zinc-50 font-medium text-zinc-700"
                                onClick={() => setStep('select')}
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </button>
                            <button 
                                className="flex-1 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors font-medium flex items-center justify-center gap-2"
                                onClick={handleGenerate}
                            >
                                <Wand2 className="h-4 w-4" /> Stupify (Generate)
                            </button>
                        </div>
                    </div>
                )}

                {step === 'stupify' && output && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="border border-zinc-200 rounded-lg p-4 bg-zinc-50 space-y-3 shadow-sm">
                            <div className="bg-white border border-zinc-200 rounded p-2 text-sm font-medium text-zinc-900">
                                {output.headline}
                            </div>
                            <div className="whitespace-pre-wrap text-sm text-zinc-600 leading-relaxed p-2">
                                {output.body}
                            </div>
                            <div className="flex justify-end">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {output.callToAction} &rarr;
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button 
                                className="flex-1 py-2 border border-zinc-300 rounded-md hover:bg-zinc-50 font-medium text-zinc-700"
                                onClick={() => setStep('setup')}
                            >
                                Retry
                            </button>
                            <button 
                                className="flex-1 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
                                onClick={handleSave} 
                                disabled={isSaving}
                            >
                                <Save className="h-4 w-4" /> 
                                {isSaving ? 'Saving...' : 'Save Asset'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
