
import React, { useState } from 'react';
import { ConfigState, LeadingKind, LeadingPlacement, ShapeType, CollectionLayout, NumberParam } from '../../types';
import { ControlSlider } from './ControlSlider';
import { Image as ImageIcon, LayoutGrid, List as ListIcon, MoveRight, Type, CreditCard, AlignLeft, AlignCenter, AlignRight, PauseCircle, BoxSelect, Plus, Trash2, Edit2, ChevronLeft, Play, MousePointer2, Palette, Monitor } from 'lucide-react';
import { getIconList } from '../../utils/iconRegistry';

// Helper for safe params in templates
const safeParam = (p: NumberParam | undefined, def: number): NumberParam => {
    return p || { value: def, endValue: null, isLinked: false };
};

export function AddButton({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) {
    return (
        <button 
            onClick={onClick}
            className="flex flex-col items-center justify-center gap-1.5 py-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 hover:border-white/20 hover:scale-105 active:scale-95 transition-all group"
        >
            <div className="text-white/60 group-hover:text-white transition-colors">{icon}</div>
            <span className="text-[10px] font-medium text-white/40 group-hover:text-white/80 transition-colors">{label}</span>
        </button>
    )
}

export function SectionHeader({ title, top, className = "", rightAction }: { title: string, top: number, className?: string, rightAction?: React.ReactNode }) {
    return (
        <div 
            className={`sticky z-20 bg-[#121212]/90 backdrop-blur-md border-y border-white/5 py-2 mb-3 shadow-sm flex items-center justify-between ${className}`}
            style={{ top: `${top}px` }}
        >
            <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">{title}</span>
            {rightAction}
        </div>
    );
}

interface ConfigControlsProps {
    config: ConfigState;
    onChange: (key: keyof ConfigState, value: any) => void;
    headerOffset?: number;
    sectionHeaderClass?: string;
}

export function ConfigControls({ config, onChange, headerOffset = 0, sectionHeaderClass = "" }: ConfigControlsProps) {
    const isStorm = config.shape === 'lightning' || config.shape === 'atmosphere';
    const isLightning = config.shape === 'lightning';
    const isAtmosphere = config.shape === 'atmosphere';
    const isList = config.shape === 'list';
    
    // Internal state for List Item navigation
    const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null);
    
    // Determine if we are editing a standalone Card/Tile or if we are inside a List Template
    const isStandaloneTile = config.shape === 'tile';
    const isStandaloneCard = config.shape === 'card';
    const isStandalonePlane = config.shape === 'plane';

    // --- REUSABLE CONTROL GROUPS ---

    const renderTileSettings = (cfg: Partial<ConfigState>, onUpd: (k: keyof ConfigState, v: any) => void) => (
        <>
            <div className="space-y-5">
                <SectionHeader title="Text Content" top={headerOffset} className={sectionHeaderClass} />
                <div className="space-y-3">
                     {/* Tag Selector */}
                     <div>
                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-2">HTML Tag</label>
                        <div className="flex bg-black/40 p-1 rounded-xl border border-white/10 flex-wrap gap-1">
                            {['h1', 'h2', 'h3', 'p', 'div'].map((tag) => (
                                <button 
                                    key={tag}
                                    onClick={() => onUpd('tileTag', tag as any)}
                                    className={`flex-1 min-w-[30px] py-1.5 rounded-lg text-xs font-mono font-medium transition-all uppercase ${cfg.tileTag === tag ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/70'}`}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                     </div>
                     
                     <div>
                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1">Heading</label>
                        <input type="text" value={cfg.tileHeading || ''} onChange={e => onUpd('tileHeading', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30 transition-colors font-medium" />
                     </div>
                     
                     <div>
                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1">Label</label>
                        <input type="text" value={cfg.tileLabel || ''} onChange={e => onUpd('tileLabel', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30 transition-colors" />
                     </div>
                     
                     <div>
                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1">Subtitle</label>
                        <textarea rows={2} value={cfg.tileSubtitle || ''} onChange={e => onUpd('tileSubtitle', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30 transition-colors" />
                     </div>
                </div>
            </div>

            <div className="space-y-5">
                <SectionHeader title="Leading Element" top={headerOffset} className={sectionHeaderClass} />
                
                <div className="space-y-4">
                     {/* Placement */}
                     <div>
                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-2">Placement</label>
                        <div className="flex bg-black/40 p-1 rounded-xl border border-white/10">
                            {['none', 'left', 'above'].map((mode) => (
                                <button 
                                    key={mode}
                                    onClick={() => onUpd('leadingPlacement', mode as any)}
                                    className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all capitalize ${cfg.leadingPlacement === mode ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/70'}`}
                                >
                                    {mode}
                                </button>
                            ))}
                        </div>
                     </div>

                     {cfg.leadingPlacement !== 'none' && (
                         <>
                            {/* Kind Selector */}
                            <div>
                                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-2">Type</label>
                                <div className="flex bg-black/40 p-1 rounded-xl border border-white/10">
                                    {['icon', 'image'].map((kind) => (
                                        <button 
                                            key={kind}
                                            onClick={() => onUpd('leadingKind', kind as any)}
                                            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all capitalize ${cfg.leadingKind === kind ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/70'}`}
                                        >
                                            {kind}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Specific Inputs */}
                            {cfg.leadingKind === 'image' && (
                                 <div>
                                     <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1">Image URL</label>
                                     <div className="relative">
                                        <ImageIcon className="absolute left-3 top-2.5 w-4 h-4 text-white/40" />
                                        <input 
                                            type="text" 
                                            value={cfg.leadingImage || ''} 
                                            onChange={e => onUpd('leadingImage', e.target.value)} 
                                            placeholder="https://..."
                                            className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-white/30 transition-colors" 
                                        />
                                     </div>
                                 </div>
                            )}

                            {cfg.leadingKind === 'icon' && (
                                 <div>
                                     <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-2">Select Icon</label>
                                     <select 
                                        value={cfg.leadingIcon || ''} 
                                        onChange={(e) => onUpd('leadingIcon', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30 transition-colors appearance-none cursor-pointer"
                                     >
                                        <option value="">None</option>
                                        {getIconList().map(entry => (
                                            <option key={entry.id} value={entry.id}>
                                                {entry.label} {entry.source === 'repo' ? '(SVG)' : ''}
                                            </option>
                                        ))}
                                     </select>
                                 </div>
                            )}

                            {/* Shared Controls */}
                            <div className="pt-2 border-t border-white/5 space-y-4">
                                <ControlSlider label="Size / Height" param={safeParam(cfg.leadingSize, 40)} min={12} max={200} step={1} onChange={(v) => onUpd('leadingSize', v)} />
                                <ControlSlider label="Gap" param={safeParam(cfg.leadingGap, 12)} min={0} max={100} step={1} onChange={(v) => onUpd('leadingGap', v)} />
                                <ControlSlider label="Radius" param={safeParam(cfg.leadingRadius, 0)} min={0} max={100} step={1} onChange={(v) => onUpd('leadingRadius', v)} />
                                <ControlSlider label="Opacity" param={safeParam(cfg.leadingOpacity, 1)} min={0} max={1} step={0.05} onChange={(v) => onUpd('leadingOpacity', v)} />
                            </div>
                         </>
                     )}
                </div>
            </div>

            <div className="space-y-6">
                <SectionHeader title="Typography Styles" top={headerOffset} className={sectionHeaderClass} />
                
                <div className="space-y-3 p-3 bg-white/5 rounded-xl border border-white/5">
                    <label className="text-[10px] font-bold text-white/60 uppercase tracking-widest block border-b border-white/5 pb-2">Heading Style</label>
                    <div className="grid grid-cols-2 gap-3 mb-2">
                         <div>
                            <label className="text-[9px] text-white/40 block mb-1">Color (Hex/RGBA)</label>
                            <input type="text" value={cfg.headingColor || ''} onChange={e => onUpd('headingColor', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-xs font-mono text-white" />
                         </div>
                    </div>
                    <ControlSlider label="Size (px)" param={safeParam(cfg.headingSize, 120)} min={20} max={300} step={1} onChange={(v) => onUpd('headingSize', v)} />
                    <ControlSlider label="Spacing (em)" param={safeParam(cfg.headingSpacing, -0.05)} min={-0.2} max={1.0} step={0.01} onChange={(v) => onUpd('headingSpacing', v)} />
                    <ControlSlider label="Line Height" param={safeParam(cfg.headingHeight, 0.9)} min={0.5} max={2.0} step={0.05} onChange={(v) => onUpd('headingHeight', v)} />
                </div>

                <div className="space-y-3 p-3 bg-white/5 rounded-xl border border-white/5">
                    <label className="text-[10px] font-bold text-white/60 uppercase tracking-widest block border-b border-white/5 pb-2">Label Style</label>
                    <div>
                        <label className="text-[9px] text-white/40 block mb-1">Color</label>
                        <input type="text" value={cfg.labelColor || ''} onChange={e => onUpd('labelColor', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-xs font-mono text-white mb-3" />
                    </div>
                    <ControlSlider label="Size (px)" param={safeParam(cfg.labelSize, 12)} min={8} max={40} step={1} onChange={(v) => onUpd('labelSize', v)} />
                    <ControlSlider label="Spacing (em)" param={safeParam(cfg.labelSpacing, 0.2)} min={-0.1} max={1.0} step={0.05} onChange={(v) => onUpd('labelSpacing', v)} />
                </div>

                <div className="space-y-3 p-3 bg-white/5 rounded-xl border border-white/5">
                    <label className="text-[10px] font-bold text-white/60 uppercase tracking-widest block border-b border-white/5 pb-2">Subtitle Style</label>
                    <div>
                        <label className="text-[9px] text-white/40 block mb-1">Color</label>
                        <input type="text" value={cfg.subColor || ''} onChange={e => onUpd('subColor', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-xs font-mono text-white mb-3" />
                    </div>
                    <ControlSlider label="Size (px)" param={safeParam(cfg.subSize, 18)} min={10} max={60} step={1} onChange={(v) => onUpd('subSize', v)} />
                </div>
            </div>

            <div className="space-y-3">
                <SectionHeader title="Alignment" top={headerOffset} className={sectionHeaderClass} />
                <div className="flex bg-black/40 p-1 rounded-xl border border-white/10">
                    {[
                        { id: 'left', icon: <AlignLeft className="w-4 h-4" /> }, 
                        { id: 'center', icon: <AlignCenter className="w-4 h-4" /> }, 
                        { id: 'right', icon: <AlignRight className="w-4 h-4" /> }
                    ].map((align) => (
                        <button 
                            key={align.id}
                            onClick={() => onUpd('tileAlign', align.id as any)}
                            className={`flex-1 flex items-center justify-center py-2 rounded-lg text-xs font-medium transition-all ${cfg.tileAlign === align.id ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/70'}`}
                            title={align.id}
                        >
                            {align.icon}
                        </button>
                    ))}
                </div>
            </div>
        </>
    );

    const renderCardSettings = (cfg: Partial<ConfigState>, onUpd: (k: keyof ConfigState, v: any) => void) => (
        <div className="space-y-5">
            <SectionHeader title="Card Appearance" top={headerOffset} className={sectionHeaderClass} />
            
            <div className="space-y-3">
                 <div>
                     <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1">Background Image</label>
                     <div className="flex gap-2">
                        <div className="relative flex-1">
                            <ImageIcon className="absolute left-3 top-2.5 w-4 h-4 text-white/40" />
                            <input 
                                type="text" 
                                value={cfg.textureUrl || ''} 
                                onChange={e => onUpd('textureUrl', e.target.value)} 
                                placeholder="https://..."
                                className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-white/30 transition-colors" 
                            />
                        </div>
                     </div>
                </div>

                <div>
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-2">Background Fit</label>
                    <div className="flex bg-black/40 p-1 rounded-xl border border-white/10">
                        {['cover', 'contain', 'native'].map((mode) => (
                            <button 
                                key={mode}
                                onClick={() => onUpd('sizingMode', mode as any)}
                                className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all capitalize ${cfg.sizingMode === mode ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/70'}`}
                            >
                                {mode}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

             {/* New Media Slot Controls */}
            {cfg.shape !== 'plane' && (
                <div className="space-y-3 pt-4 border-t border-white/5">
                    <SectionHeader title="Top Media Slot" top={headerOffset} className={sectionHeaderClass} />
                    <div>
                         <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1">Media URL</label>
                         <input 
                            type="text" 
                            value={cfg.cardMediaSrc || ''} 
                            onChange={e => onUpd('cardMediaSrc', e.target.value)} 
                            placeholder="Optional top image..."
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30 transition-colors" 
                        />
                    </div>
                    {cfg.cardMediaSrc && (
                        <>
                             <ControlSlider label="Media Height" param={safeParam(cfg.cardMediaHeight, 200)} min={0} max={500} step={10} onChange={(v) => onUpd('cardMediaHeight', v)} />
                             <div>
                                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-2">Media Fit</label>
                                <div className="flex bg-black/40 p-1 rounded-xl border border-white/10">
                                    {['cover', 'contain', 'native'].map((mode) => (
                                        <button 
                                            key={mode}
                                            onClick={() => onUpd('cardMediaFit', mode as any)}
                                            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all capitalize ${cfg.cardMediaFit === mode ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/70'}`}
                                        >
                                            {mode}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}

            <div className="space-y-3 pt-4 border-t border-white/5">
                <SectionHeader title="Styling" top={headerOffset} className={sectionHeaderClass} />

                {cfg.shape !== 'plane' && (
                    <>
                        <div>
                            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1">Background Color</label>
                            <input type="text" value={cfg.cardBackground || '#ffffff'} onChange={e => onUpd('cardBackground', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white" />
                        </div>
                        
                        <div className="flex items-center justify-between py-2">
                             <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Clip Content</label>
                             <button 
                                onClick={() => onUpd('cardClip', !(cfg.cardClip ?? true))}
                                className={`w-8 h-4 rounded-full transition-colors relative ${cfg.cardClip !== false ? 'bg-blue-500' : 'bg-white/20'}`}
                             >
                                 <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${cfg.cardClip !== false ? 'left-4.5' : 'left-0.5'}`} style={{ left: cfg.cardClip !== false ? '18px' : '2px' }} />
                             </button>
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1">Border Radius</label>
                            <input type="text" value={cfg.cardRadius || '0px'} onChange={e => onUpd('cardRadius', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-mono" placeholder="10px 0 10px 0" />
                        </div>
                        
                        {/* New Border Controls */}
                        <div className="grid grid-cols-2 gap-3 pt-2">
                             <div>
                                <label className="text-[9px] text-white/40 block mb-1">Border Width</label>
                                <ControlSlider label="" param={safeParam(cfg.cardBorderWidth, 0)} min={0} max={20} step={1} onChange={(v) => onUpd('cardBorderWidth', v)} />
                             </div>
                             <div>
                                <label className="text-[9px] text-white/40 block mb-1">Border Color</label>
                                <input type="text" value={cfg.cardBorderColor || '#ffffff'} onChange={e => onUpd('cardBorderColor', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-xs font-mono text-white h-8" />
                             </div>
                        </div>
                        
                        <ControlSlider label="Elevation" param={safeParam(cfg.cardElevation, 0)} min={0} max={5} step={1} onChange={(v) => onUpd('cardElevation', v)} />
                        <ControlSlider label="Padding" param={safeParam(cfg.cardPadding, 0)} min={0} max={100} step={1} onChange={(v) => onUpd('cardPadding', v)} />
                        <ControlSlider label="Width" param={safeParam(cfg.cardWidth, 400)} min={100} max={1000} step={10} onChange={(v) => onUpd('cardWidth', v)} />
                        <ControlSlider label="Height" param={safeParam(cfg.cardHeight, 560)} min={100} max={1000} step={10} onChange={(v) => onUpd('cardHeight', v)} />
                        <ControlSlider label="Surface Opacity" param={safeParam(cfg.cardOpacity, 1)} min={0} max={1} step={0.05} onChange={(v) => onUpd('cardOpacity', v)} />
                    </>
                )}
                
                {cfg.shape === 'plane' && (
                    <ControlSlider label="Border Radius" param={safeParam(cfg.borderRadius, 0)} min={0} max={1} step={0.01} onChange={(v) => onUpd('borderRadius', v)} />
                )}
            </div>
        </div>
    );

    // --- STORM CONTROLS ---
    if (isStorm) {
        return (
            <div className="space-y-8">
                 <div className="space-y-3">
                    <SectionHeader title={isLightning ? "Lightning Settings" : "Atmosphere Settings"} top={headerOffset} className={sectionHeaderClass} />
                    
                    {isAtmosphere && (
                        <div className="space-y-5">
                            <ControlSlider label="HUE" param={safeParam(config.hue, 220)} min={0} max={360} step={1} onChange={(v) => onChange('hue', v)} />
                            <ControlSlider label="SATURATION" param={safeParam(config.saturation, 0.6)} min={0} max={1.0} step={0.05} onChange={(v) => onChange('saturation', v)} />
                            <ControlSlider label="CLOUDS" param={safeParam(config.cloudiness, 0.5)} min={0} max={1.0} step={0.05} onChange={(v) => onChange('cloudiness', v)} />
                            <ControlSlider label="SCALE" param={safeParam(config.cloudScale, 1.0)} min={0.1} max={5.0} step={0.1} onChange={(v) => onChange('cloudScale', v)} />
                            <ControlSlider label="WIND" param={safeParam(config.speed, 1.0)} min={0} max={5.0} step={0.1} onChange={(v) => onChange('speed', v)} />
                        </div>
                    )}

                    {isLightning && (
                        <div className="space-y-5">
                            <ControlSlider label="HUE" param={safeParam(config.hue, 220)} min={0} max={360} step={1} onChange={(v) => onChange('hue', v)} />
                            <ControlSlider label="INTENSITY" param={safeParam(config.intensity, 1.5)} min={0.1} max={5.0} step={0.1} onChange={(v) => onChange('intensity', v)} />
                            <ControlSlider label="FREQUENCY" param={safeParam(config.frequency, 1.0)} min={0.1} max={5.0} step={0.1} onChange={(v) => onChange('frequency', v)} />
                            <ControlSlider label="STRIKE FLASH" param={safeParam(config.strikeIntensity, 1.0)} min={0} max={5.0} step={0.1} onChange={(v) => onChange('strikeIntensity', v)} />
                            <ControlSlider label="FLASH FADE" param={safeParam(config.flashDuration, 1.0)} min={0.1} max={5.0} step={0.1} onChange={(v) => onChange('flashDuration', v)} />
                            <ControlSlider label="BOLT GLOW" param={safeParam(config.boltGlow, 1.0)} min={0.1} max={5.0} step={0.1} onChange={(v) => onChange('boltGlow', v)} />
                            <ControlSlider label="BOLT WIDTH" param={safeParam(config.boltWidth, 1.0)} min={0.1} max={5.0} step={0.1} onChange={(v) => onChange('boltWidth', v)} />
                            <ControlSlider label="BOLT DURATION" param={safeParam(config.boltDuration, 0.5)} min={0.05} max={2.0} step={0.05} onChange={(v) => onChange('boltDuration', v)} />
                            <ControlSlider label="ZIGZAG" param={safeParam(config.zigzag, 1.0)} min={0} max={2.0} step={0.1} onChange={(v) => onChange('zigzag', v)} />
                            <ControlSlider label="SKEW" param={safeParam(config.diagonal, 0.0)} min={-1.0} max={1.0} step={0.05} onChange={(v) => onChange('diagonal', v)} />
                            <ControlSlider label="DEPTH VAR" param={safeParam(config.depth, 0.0)} min={0} max={1.0} step={0.05} onChange={(v) => onChange('depth', v)} />
                        </div>
                    )}
                 </div>
                 <div className="space-y-5">
                     <SectionHeader title="Position" top={headerOffset} className={sectionHeaderClass} />
                     <ControlSlider label="Offset Z" param={safeParam(config.offsetZ, 0)} min={-500} max={500} step={10} onChange={(v) => onChange('offsetZ', v)} />
                 </div>
            </div>
        )
    }

    // --- LIST / COLLECTION CONTROLS ---
    if (isList) {
        const template = config.listTemplate || {};
        const templateShape = template.shape || 'card';
        const items = config.listItems || [];

        const updateTemplate = (key: keyof ConfigState, value: any) => {
             onChange('listTemplate', { ...template, [key]: value });
        };

        const updateItem = (index: number, key: keyof ConfigState, value: any) => {
            const newItems = [...items];
            newItems[index] = { ...newItems[index], [key]: value };
            onChange('listItems', newItems);
        };

        const deleteItem = (index: number) => {
            if (window.confirm('Delete this item?')) {
                const newItems = [...items];
                newItems.splice(index, 1);
                onChange('listItems', newItems);
            }
        };

        const addItem = () => {
            const newItems = [...items, { ...template }]; // Clone template as base for new override
            onChange('listItems', newItems);
        };

        // --- SUB-VIEW: ITEM EDITOR ---
        if (activeItemIndex !== null && items[activeItemIndex]) {
            const activeItem = items[activeItemIndex];
            // Ensure the item has the minimal shape prop for the editor to render correct group
            const itemConfigForEditor = { 
                ...activeItem, 
                shape: activeItem.shape || templateShape // Fallback to template shape
            } as ConfigState; 

            return (
                <div className="space-y-4">
                    <button 
                        onClick={() => setActiveItemIndex(null)}
                        className="flex items-center gap-2 text-xs font-medium text-white/60 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-3 py-2 rounded-lg w-full mb-4"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Back to List Config
                    </button>
                    
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-[10px] text-blue-200">
                        Editing Item #{activeItemIndex + 1}. Values set here override the template.
                    </div>

                    <ConfigControls 
                        config={itemConfigForEditor} 
                        onChange={(k, v) => updateItem(activeItemIndex, k, v)}
                        headerOffset={headerOffset}
                        sectionHeaderClass={sectionHeaderClass}
                    />
                </div>
            );
        }

        // --- MAIN VIEW: LIST CONFIG ---
        return (
            <div className="space-y-8">
                <div className="space-y-5">
                    <SectionHeader title="Layout Strategy" top={headerOffset} className={sectionHeaderClass} />
                    
                    <div className="flex bg-black/40 p-1 rounded-xl border border-white/10">
                        {['stack', 'grid', 'marquee'].map((l) => (
                            <button 
                                key={l}
                                onClick={() => onChange('listLayout', l as CollectionLayout)}
                                className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-lg text-[10px] font-medium transition-all uppercase ${config.listLayout === l ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/70'}`}
                            >
                                {l === 'stack' && <ListIcon className="w-4 h-4" />}
                                {l === 'grid' && <LayoutGrid className="w-4 h-4" />}
                                {l === 'marquee' && <MoveRight className="w-4 h-4" />}
                                {l}
                            </button>
                        ))}
                    </div>

                    <ControlSlider label="Limit Count" param={safeParam(config.listCount, 100)} min={1} max={100} step={1} onChange={(v) => onChange('listCount', v)} />
                    <ControlSlider label="Gap (px)" param={safeParam(config.listGap, 24)} min={0} max={200} step={1} onChange={(v) => onChange('listGap', v)} />
                    
                    {config.listLayout === 'grid' && (
                        <ControlSlider label="Columns" param={safeParam(config.listColumns, 3)} min={1} max={6} step={1} onChange={(v) => onChange('listColumns', v)} />
                    )}
                    
                    {/* Render Policy Controls (New) */}
                    <div className="space-y-5">
                         <SectionHeader title="Render Policy" top={headerOffset} className={sectionHeaderClass} />
                         <div className="p-3 bg-white/5 rounded-xl space-y-4 border border-white/5">
                             <div>
                                 <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-2 flex items-center gap-2">
                                     <Monitor className="w-3.5 h-3.5" />
                                     Renderer Engine
                                 </label>
                                 <div className="flex bg-black/40 p-1 rounded-xl border border-white/10">
                                     {['dom', 'webgl'].map((r) => (
                                         <button 
                                             key={r}
                                             onClick={() => onChange('renderPolicy', { ...config.renderPolicy, renderer: r })}
                                             className={`flex-1 py-1.5 rounded-lg text-[10px] font-medium transition-all uppercase ${config.renderPolicy?.renderer === r ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/70'}`}
                                         >
                                             {r}
                                         </button>
                                     ))}
                                 </div>
                             </div>
                             
                             <div>
                                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-2">Virtualization</label>
                                <div className="flex bg-black/40 p-1 rounded-xl border border-white/10">
                                     {['none', 'window'].map((v) => (
                                         <button 
                                             key={v}
                                             onClick={() => onChange('renderPolicy', { ...config.renderPolicy, virtualization: v })}
                                             className={`flex-1 py-1.5 rounded-lg text-[10px] font-medium transition-all uppercase ${config.renderPolicy?.virtualization === v ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/70'}`}
                                         >
                                             {v}
                                         </button>
                                     ))}
                                 </div>
                             </div>
                             
                             <div className="grid grid-cols-2 gap-3">
                                 <div>
                                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1">Overscan (px)</label>
                                    <input 
                                        type="number" 
                                        value={config.renderPolicy?.overscanPx ?? 100}
                                        onChange={(e) => onChange('renderPolicy', { ...config.renderPolicy, overscanPx: parseInt(e.target.value) })}
                                        className="w-full bg-black/40 border border-white/10 rounded px-2 py-1.5 text-xs font-mono text-white focus:border-white/30 outline-none"
                                    />
                                 </div>
                                 <div>
                                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1">Max Items</label>
                                    <input 
                                        type="number" 
                                        value={config.renderPolicy?.maxItems ?? 100}
                                        onChange={(e) => onChange('renderPolicy', { ...config.renderPolicy, maxItems: parseInt(e.target.value) })}
                                        className="w-full bg-black/40 border border-white/10 rounded px-2 py-1.5 text-xs font-mono text-white focus:border-white/30 outline-none"
                                    />
                                 </div>
                             </div>
                         </div>
                    </div>
                    
                    {/* EXHAUSTIVE MARQUEE CONTROLS */}
                    {config.listLayout === 'marquee' && (
                        <div className="space-y-6 pt-4 border-t border-white/5">
                            
                            {/* 1. Motion Settings */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block flex items-center gap-2">
                                    <Play className="w-3.5 h-3.5" />
                                    Motion Settings
                                </label>
                                <ControlSlider label="Speed (Multiplier)" param={safeParam(config.listSpeed, 1.0)} min={0} max={5} step={0.1} onChange={(v) => onChange('listSpeed', v)} />
                                <ControlSlider label="Direction" param={safeParam(config.listDirection, 1.0)} min={-1} max={1} step={2} onChange={(v) => onChange('listDirection', v)} />
                                
                                <div className="flex items-center justify-between p-2 rounded-xl border border-white/10 bg-white/5 mt-2">
                                    <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest flex items-center gap-2">
                                        <PauseCircle className="w-3.5 h-3.5" />
                                        Pause on Hover
                                    </span>
                                    <button 
                                        onClick={() => onChange('marqueeHoverPause', !config.marqueeHoverPause)}
                                        className={`w-8 h-4 rounded-full transition-colors relative ${config.marqueeHoverPause ? 'bg-blue-500' : 'bg-white/20'}`}
                                    >
                                         <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${config.marqueeHoverPause ? 'left-4.5' : 'left-0.5'}`} style={{ left: config.marqueeHoverPause ? '18px' : '2px' }} />
                                    </button>
                                </div>
                            </div>

                            {/* 2. Visual Pattern */}
                            <div className="space-y-3 pt-2 border-t border-white/5">
                                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                                    <BoxSelect className="w-3.5 h-3.5" />
                                    Visual Pattern
                                </label>
                                <div className="space-y-1">
                                    <label className="text-[9px] text-white/30 block">Radius Sequence (Pipe Separated)</label>
                                    <textarea 
                                        rows={2}
                                        value={config.listRadiusPattern || ''}
                                        onChange={(e) => onChange('listRadiusPattern', e.target.value)}
                                        placeholder="100px 0 0 0 | 40px | ..."
                                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs font-mono text-white/80 placeholder:text-white/20 focus:outline-none focus:border-white/30"
                                    />
                                </div>
                            </div>

                            {/* 3. Interaction Effects */}
                            <div className="space-y-3 pt-2 border-t border-white/5">
                                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block flex items-center gap-2">
                                    <MousePointer2 className="w-3.5 h-3.5" />
                                    Interaction Effects
                                </label>
                                <ControlSlider label="Hover Scale" param={safeParam(config.itemHoverScale, 1.05)} min={1.0} max={1.5} step={0.01} onChange={(v) => onChange('itemHoverScale', v)} />
                                <ControlSlider label="Transition Speed" param={safeParam(config.listSmoothness, 0.1)} min={0.01} max={1} step={0.01} onChange={(v) => onChange('listSmoothness', v)} />
                                
                                <div className="space-y-1 pt-2">
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">
                                        <Palette className="w-3.5 h-3.5" />
                                        Grayscale Effect
                                    </div>
                                    <ControlSlider label="Base (Idle)" param={safeParam(config.itemBaseGrayscale, 0)} min={0} max={1} step={0.1} onChange={(v) => onChange('itemBaseGrayscale', v)} />
                                    <ControlSlider label="Hover State" param={safeParam(config.itemHoverGrayscale, 0)} min={0} max={1} step={0.1} onChange={(v) => onChange('itemHoverGrayscale', v)} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-3 pt-4 border-t border-white/5">
                    <SectionHeader 
                        title={`List Items (${items.length})`} 
                        top={headerOffset} 
                        className={sectionHeaderClass} 
                        rightAction={
                            <button onClick={addItem} className="p-1 hover:bg-white/10 rounded text-white/50 hover:text-white transition-colors" title="Add Item">
                                <Plus className="w-4 h-4" />
                            </button>
                        }
                    />
                    
                    <div className="space-y-2">
                        {items.length === 0 && <div className="text-[10px] text-white/30 italic px-2 py-4 text-center">No items. Template only.</div>}
                        {items.map((item: any, idx: number) => {
                            // Determine preview label/image
                            const label = item.tileHeading || item.tileLabel || `Item ${idx + 1}`;
                            const img = item.textureUrl || item.leadingImage;
                            
                            return (
                                <div key={idx} className="group flex items-center gap-2 p-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg transition-colors">
                                    <div className="text-[10px] font-mono text-white/30 w-4">{idx + 1}</div>
                                    
                                    {img ? (
                                        <img src={img} alt="" className="w-8 h-8 rounded bg-black/50 object-cover" />
                                    ) : (
                                        <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center">
                                            <BoxSelect className="w-4 h-4 text-white/30" />
                                        </div>
                                    )}
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs font-medium text-white/80 truncate">{label}</div>
                                        <div className="text-[9px] text-white/40 truncate">{Object.keys(item).length} overrides</div>
                                    </div>
                                    
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => setActiveItemIndex(idx)} className="p-1.5 hover:bg-white/10 rounded text-white/60 hover:text-white" title="Edit Item">
                                            <Edit2 className="w-3.5 h-3.5" />
                                        </button>
                                        <button onClick={() => deleteItem(idx)} className="p-1.5 hover:bg-red-500/20 rounded text-white/40 hover:text-red-400" title="Delete Item">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-white/5">
                     <SectionHeader title="Default Template" top={headerOffset} className={sectionHeaderClass} />
                     <div className="flex bg-black/40 p-1 rounded-xl border border-white/10">
                        {['card', 'tile'].map((s) => (
                             <button 
                                key={s}
                                onClick={() => updateTemplate('shape', s)}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all capitalize ${templateShape === s ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/70'}`}
                             >
                                 {s === 'card' && <CreditCard className="w-3.5 h-3.5" />}
                                 {s === 'tile' && <Type className="w-3.5 h-3.5" />}
                                 {s}
                             </button>
                        ))}
                     </div>
                </div>

                {templateShape === 'card' && renderCardSettings(template, updateTemplate)}
                {templateShape === 'tile' && renderTileSettings(template, updateTemplate)}

                <div className="space-y-5">
                     <SectionHeader title="Position" top={headerOffset} className={sectionHeaderClass} />
                     <ControlSlider label="Offset X" param={safeParam(config.offsetX, 0)} min={-500} max={500} step={10} onChange={(v) => onChange('offsetX', v)} />
                     <ControlSlider label="Offset Y" param={safeParam(config.offsetY, 0)} min={-500} max={500} step={10} onChange={(v) => onChange('offsetY', v)} />
                     <ControlSlider label="Offset Z" param={safeParam(config.offsetZ, 0)} min={-500} max={500} step={10} onChange={(v) => onChange('offsetZ', v)} />
                     <ControlSlider label="Opacity" param={safeParam(config.opacity, 1)} min={0} max={1} step={0.05} onChange={(v) => onChange('opacity', v)} />
                </div>
            </div>
        );
    }

    // --- TILE & CARD CONTROLS (Standalone) ---
    return (
        <div className="space-y-8">
             {/* Geometry Switch */}
             <div className="space-y-3">
                <SectionHeader title="Shape Type" top={headerOffset} className={sectionHeaderClass} />
                <div className="grid grid-cols-4 gap-2">
                    {['tile', 'card', 'list', 'plane'].map((shape) => (
                        <button
                            key={shape}
                            onClick={() => onChange('shape', shape as ShapeType)}
                            className={`px-2 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 border capitalize ${
                                config.shape === shape 
                                ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)] scale-[1.02]' 
                                : 'bg-white/5 text-white/60 border-transparent hover:bg-white/10 hover:text-white'
                            }`}
                        >
                            {shape}
                        </button>
                    ))}
                </div>
            </div>

            {isStandaloneTile && renderTileSettings(config, onChange)}
            {(isStandaloneCard || isStandalonePlane) && renderCardSettings(config, onChange)}

            {/* Animation Type */}
            <div className="space-y-3">
                <SectionHeader title="Animation Mode" top={headerOffset} className={sectionHeaderClass} />
                <div className="grid grid-cols-2 gap-2">
                    {['static', 'rotate', 'hover', '3drotate'].map((mode) => (
                        <button
                            key={mode}
                            onClick={() => onChange('animationType', mode as any)}
                            className={`px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 border capitalize ${
                                config.animationType === mode 
                                ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)] scale-[1.02]' 
                                : 'bg-white/5 text-white/60 border-transparent hover:bg-white/10 hover:text-white'
                            }`}
                        >
                            {mode === '3drotate' ? '3D Rotate' : mode}
                        </button>
                    ))}
                </div>
            </div>

            {/* Static Rotation Controls */}
            {(config.animationType === 'static') && (
                <div className="space-y-5">
                    <SectionHeader title="Rotation" top={headerOffset} className={sectionHeaderClass} />
                    <ControlSlider label="Rotate X" param={safeParam(config.rotateX, 0)} min={-3.14} max={3.14} step={0.01} onChange={(v) => onChange('rotateX', v)} />
                    <ControlSlider label="Rotate Y" param={safeParam(config.rotateY, 0)} min={-3.14} max={3.14} step={0.01} onChange={(v) => onChange('rotateY', v)} />
                    <ControlSlider label="Rotate Z" param={safeParam(config.rotateZ, 0)} min={-3.14} max={3.14} step={0.01} onChange={(v) => onChange('rotateZ', v)} />
                </div>
            )}

            {/* Common Transform (Position/Opacity) */}
            <div className="space-y-5">
                 <SectionHeader title="Transform" top={headerOffset} className={sectionHeaderClass} />
                 <ControlSlider label="Scale" param={safeParam(config.scale, 100)} min={10} max={500} step={1} onChange={(v) => onChange('scale', v)} />
                 <ControlSlider label="Offset X" param={safeParam(config.offsetX, 0)} min={-500} max={500} step={10} onChange={(v) => onChange('offsetX', v)} />
                 <ControlSlider label="Offset Y" param={safeParam(config.offsetY, 0)} min={-500} max={500} step={10} onChange={(v) => onChange('offsetY', v)} />
                 <ControlSlider label="Offset Z" param={safeParam(config.offsetZ, 0)} min={-500} max={500} step={10} onChange={(v) => onChange('offsetZ', v)} />
                 <ControlSlider label="Opacity" param={safeParam(config.opacity, 1)} min={0} max={1} step={0.05} onChange={(v) => onChange('opacity', v)} />
            </div>
        </div>
    );
}
