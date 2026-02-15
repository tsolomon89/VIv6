
import React, { useEffect, useRef, useMemo, useState } from 'react';
import { SceneObject, NumberParam, LeadingPlacement, LeadingKind, ConfigState } from '../../types';
import { getIcon } from '../../utils/iconRegistry';
import { trackRaf } from '../../utils/performance';
import { useVisibility } from '../../hooks/useVisibility';
import { isDOMShape } from '../../utils/shapes';

// Helper to interpolate scroll-linked params with Default Value support
const getVal = (param: NumberParam | undefined, scrollProgress: number, def: number = 0) => {
    if (!param) return def;
    if (param.isLinked && param.endValue !== null) {
        return param.value + (param.endValue - param.value) * scrollProgress;
    }
    return param.value;
};

interface DOMItemProps {
    obj: SceneObject;
    scrollProgress: number;
    className?: string;
    isChild?: boolean; // For nesting context
}

// --- Single Item Renderer ---
const SingleItemRenderer = ({ obj, scrollProgress, className = "", isChild = false }: DOMItemProps) => {
    const isCard = obj.shape === 'card';
    const isTile = obj.shape === 'tile';
    
    // Base Transforms - Defaults: Scale 100 (1x), Opacity 1
    const x = getVal(obj.offsetX, scrollProgress, 0);
    const y = getVal(obj.offsetY, scrollProgress, 0);
    const z = getVal(obj.offsetZ, scrollProgress, 0);
    const scale = getVal(obj.scale, scrollProgress, 100) / 100;
    const opacity = getVal(obj.opacity, scrollProgress, 1);
    const itemOverflow = obj.itemOverflow || 'visible';
    
    // Check Visibility (Opacity culling)
    if (opacity < 0.01) return null;

    // --- Card Props ---
    const width = isCard ? getVal(obj.cardWidth, scrollProgress, 400) : undefined;
    const height = isCard ? getVal(obj.cardHeight, scrollProgress, 560) : undefined;
    const radius = obj.cardRadius || '0px';
    const bg = obj.cardBackground || 'transparent';
    const padding = isCard ? getVal(obj.cardPadding, scrollProgress, 0) : 0;
    
    // Border Logic
    const borderWidth = isCard ? getVal(obj.cardBorderWidth, scrollProgress, 0) : 0;
    const borderColor = obj.cardBorderColor || 'transparent';
    const borderStyle = borderWidth > 0 ? `${borderWidth}px solid ${borderColor}` : obj.cardBorder || 'none';

    const cardElevation = isCard ? getVal(obj.cardElevation || {value: 0, endValue: null, isLinked: false}, scrollProgress, 0) : 0;
    const cardOpacity = isCard ? getVal(obj.cardOpacity || {value: 1, endValue: null, isLinked: false}, scrollProgress, 1) : 1;
    const cardClip = isCard ? (obj.cardClip !== false) : false; 
    
    const cardMediaSrc = obj.cardMediaSrc;
    const cardMediaHeight = isCard ? getVal(obj.cardMediaHeight || {value: 200, endValue: null, isLinked: false}, scrollProgress, 200) : 0;
    const cardMediaFit = obj.cardMediaFit || 'cover';

    // --- Tile Props ---
    const Tag = (obj.tileTag || 'div') as any;
    const align = obj.tileAlign || 'center';
    
    // Unified Leading Model
    const placement: LeadingPlacement = (obj.leadingPlacement as any) || 'none';
    const kind: LeadingKind = (obj.leadingKind as any) || 'icon';
    
    const tileHeading = obj.tileHeading;
    const tileLabel = obj.tileLabel;
    const tileSubtitle = obj.tileSubtitle;
    const tileTrailing = obj.tileTrailing;
    const tileTrailingIcon = obj.tileTrailingIcon;
    
    // --- Style Construction ---
    const shadows = [
        'none',
        '0 1px 2px 0 rgba(0,0,0,0.05)',
        '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
        '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
        '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
        '0 25px 50px -12px rgba(0,0,0,0.25)'
    ];
    const shadowStyle = isCard ? shadows[Math.min(5, Math.round(cardElevation))] : undefined;

    const style: React.CSSProperties = {
        transform: !isChild ? `translate3d(${x}px, ${y}px, ${z}px) scale(${scale})` : undefined,
        opacity: !isChild ? opacity : undefined,
        position: !isChild ? 'absolute' : 'relative',
        top: !isChild ? '50%' : undefined,
        left: !isChild ? '50%' : undefined,
        marginTop: !isChild ? (isCard && height ? -height/2 : 0) : 0,
        marginLeft: !isChild ? (isCard && width ? -width/2 : -300) : 0, 
        width: isCard ? width : (!isChild ? 600 : '100%'),
        height: isCard ? height : undefined,
        borderRadius: isCard ? radius : undefined,
        backgroundColor: isCard ? bg : undefined,
        border: borderStyle,
        padding: 0, 
        boxShadow: shadowStyle,
        overflow: (isCard && cardClip) ? 'hidden' : itemOverflow,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: isTile ? 'center' : 'flex-start',
        textAlign: align,
        pointerEvents: 'auto',
        willChange: 'transform'
    };
    
    const hasTileContent = tileHeading || tileLabel || tileSubtitle;
    const hasChildren = obj.children && obj.children.length > 0;

    // --- Sub-components ---
    const LeadingElement = () => {
        if (placement === 'none') return null;

        const size = getVal(obj.leadingSize, scrollProgress, 40);
        const lOpacity = getVal(obj.leadingOpacity, scrollProgress, 1);
        const radius = getVal(obj.leadingRadius, scrollProgress, 0);
        const padding = getVal(obj.leadingPadding, scrollProgress, 0);
        const fit = obj.leadingFit || 'cover';
        const bg = obj.leadingBackground || 'transparent';
        const color = obj.leadingColor || obj.headingColor;
        
        // Common style
        const style: React.CSSProperties = {
            width: kind === 'image' ? 'auto' : size,
            height: size,
            opacity: lOpacity,
            borderRadius: radius,
            objectFit: fit as any,
            backgroundColor: bg,
            padding: padding,
            // Spacing
            marginBottom: placement === 'above' ? getVal(obj.leadingGap, scrollProgress, 12) : 0,
            marginRight: placement === 'left' ? getVal(obj.leadingGap, scrollProgress, 12) : 0,
            display: 'flex', // Centering for icons
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
        };

        if (kind === 'image' && obj.leadingImage) {
            return <img src={obj.leadingImage} alt="Leading" style={style} />;
        }
        
        if (kind === 'icon' && obj.leadingIcon) {
            const IconEntry = getIcon(obj.leadingIcon);
            if (IconEntry) {
                return (
                    <div style={style}>
                        {IconEntry.render({ 
                            style: { width: '100%', height: '100%', color: color } 
                        })}
                    </div>
                );
            }
        }
        return null;
    };

    const TrailingIconElement = () => {
        if (!tileTrailingIcon) return null;
        const IconEntry = getIcon(tileTrailingIcon);
        if (IconEntry) {
            return IconEntry.render({ className: "w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" });
        }
        return null;
    }

    const TileContent = () => (
        <div className="w-full">
             {placement === 'above' && (
                <div className={`flex ${align === 'center' ? 'justify-center' : align === 'right' ? 'justify-end' : 'justify-start'}`}>
                    <LeadingElement />
                </div>
            )}

            {tileLabel && (
                <div style={{
                    fontSize: `${getVal(obj.labelSize, scrollProgress, 12)}px`,
                    letterSpacing: `${getVal(obj.labelSpacing, scrollProgress, 0.2)}em`,
                    color: obj.labelColor
                }} className="font-bold uppercase mb-2 font-mono">
                    {tileLabel}
                </div>
            )}
            
            {(tileHeading || (placement === 'left' && (obj.leadingIcon || obj.leadingImage)) || tileTrailing || tileTrailingIcon) && (
                 <div className={`flex items-center ${align === 'center' ? 'justify-center' : align === 'right' ? 'justify-end' : 'justify-start'}`}>
                     {placement === 'left' && <LeadingElement />}
                     
                     {tileHeading && (
                        <Tag style={{
                            fontSize: `${getVal(obj.headingSize, scrollProgress, 120)}px`,
                            letterSpacing: `${getVal(obj.headingSpacing, scrollProgress, -0.05)}em`,
                            lineHeight: getVal(obj.headingHeight, scrollProgress, 0.9),
                            color: obj.headingColor,
                            whiteSpace: 'pre-wrap'
                        }} className="font-medium tracking-tighter">
                            {tileHeading}
                        </Tag>
                     )}
                     
                     {(tileTrailing || tileTrailingIcon) && (
                         <div className="flex items-center gap-2 ml-auto shrink-0">
                            {tileTrailing && <span className="text-sm font-mono opacity-50">{tileTrailing}</span>}
                            <TrailingIconElement />
                         </div>
                     )}
                 </div>
            )}
            
            {tileSubtitle && (
                <p style={{
                    fontSize: `${getVal(obj.subSize, scrollProgress, 18)}px`,
                    color: obj.subColor
                }} className="font-light mt-2 max-w-md leading-relaxed mx-auto">
                    {tileSubtitle}
                </p>
            )}
        </div>
    );

    return (
        <div 
            style={style} 
            className={`
                transition-all duration-300 
                ${isCard ? 'group hover:shadow-xl cursor-pointer' : ''} 
                ${className}
            `}
        >
            {/* 1. Background Media */}
            {isCard && obj.textureUrl && (
                <div className="absolute inset-0 z-0 overflow-hidden" style={{ opacity: cardOpacity }}>
                    <img 
                        src={obj.textureUrl} 
                        alt="Card Background" 
                        className="w-full h-full transition-all duration-700 ease-out group-hover:scale-105 group-hover:grayscale-0 grayscale"
                        style={{ objectFit: obj.sizingMode === 'native' ? 'fill' : obj.sizingMode }}
                    />
                </div>
            )}

            {/* 2. Top Media Slot */}
            {isCard && cardMediaSrc && (
                <div className="relative z-10 w-full overflow-hidden shrink-0" style={{ height: cardMediaHeight }}>
                    <img 
                        src={cardMediaSrc}
                        alt="Media"
                        className="w-full h-full transition-transform duration-700 group-hover:scale-105"
                        style={{ objectFit: (cardMediaFit === 'native' ? 'none' : cardMediaFit) as any }}
                    />
                    {/* Floating Icon Over Media */}
                    <div className="absolute top-4 right-4 bg-white rounded-full p-2 opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-lg">
                        {getIcon('lucide:ArrowUpRight')?.render({ className: "w-5 h-5 text-black" })}
                    </div>
                </div>
            )}

            {/* 3. Content Container */}
            {(hasTileContent || hasChildren) && (
                <div 
                    className={`relative z-10 w-full flex flex-col ${isCard ? 'h-full' : ''}`}
                    style={{ 
                        padding: isCard ? padding : 0,
                        background: (isCard && obj.textureUrl && hasTileContent) ? 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' : undefined 
                    }}
                >
                    {hasChildren && obj.children?.map(child => (
                        <DOMItem 
                            key={child.id} 
                            obj={child} 
                            scrollProgress={scrollProgress} 
                            isChild={true} 
                            className="relative"
                        />
                    ))}

                    {hasTileContent && (
                        <div className={isCard ? (cardMediaSrc ? "mt-4" : "mt-auto") : ""}>
                            <TileContent />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// --- List / Collection Renderer ---
const mergeConfig = (template: Partial<ConfigState>, override: any, index: number): SceneObject => {
    return {
        ...(template as SceneObject), // Base
        ...override, // Overrides
        id: override.id || `generated-item-${index}`, // Stable ID generation for DOM diffing
        shape: template.shape || 'tile',
        mode: 'single', // Force items to single to prevent recursion
    };
};

const ListRenderer = ({ obj, scrollProgress }: DOMItemProps) => {
    // RENDER POLICY APPLICATION
    const policy = obj.renderPolicy || {};
    
    // Suppress if WebGL renderer is requested
    if (policy.renderer === 'webgl') return null;

    const listLayout = obj.listLayout || 'stack';
    const template = obj.listTemplate || {};
    const overrides = obj.listItems || [];
    const gap = getVal(obj.listGap, scrollProgress, 24);
    
    const maxItems = policy.maxItems || 100; // Default safety limit
    const rawCount = Math.max(0, Math.floor(getVal(obj.listCount, scrollProgress, 100)));
    const count = Math.min(rawCount, maxItems);
    
    // Transform Container
    const x = getVal(obj.offsetX, scrollProgress, 0);
    const y = getVal(obj.offsetY, scrollProgress, 0);
    const z = getVal(obj.offsetZ, scrollProgress, 0);
    const opacity = getVal(obj.opacity, scrollProgress, 1);
    
    // --- HOOKS ---
    const containerRef = useRef<HTMLDivElement>(null);
    const isVisible = useVisibility({ 
        ref: containerRef, 
        rootMargin: '200px 0px 200px 0px' 
    });
    
    // Marquee-specific hooks
    const trackRef = useRef<HTMLDivElement>(null);
    const marqueeState = useRef({ offset: 0, contentWidth: 0 });

    // --- Prepare Items ---
    let displayItems = overrides;
    // Apply count limit
    if (count < displayItems.length) {
        displayItems = displayItems.slice(0, count);
    }

    const speed = getVal(obj.listSpeed, scrollProgress, 1);
    const direction = getVal(obj.listDirection, scrollProgress, 1);
    const itemCount = displayItems.length;

    // Marquee Animation Effect
    useEffect(() => {
        if (listLayout !== 'marquee' || !trackRef.current) return;
        if (!isVisible) return; 
        
        const el = trackRef.current;
        let rafId: number;
        let lastTime = performance.now();
        
        // Robust Width Calculation
        const updateWidth = () => {
            if(el && itemCount > 0 && el.children.length >= itemCount * 2) {
                const children = Array.from(el.children) as HTMLElement[];
                const startA = children[0].offsetLeft;
                const startB = children[itemCount].offsetLeft;
                const width = startB - startA;
                
                if (width > 0) marqueeState.current.contentWidth = width;
            }
        }
        
        // Trigger width update on mount/resize
        const resizeObserver = new ResizeObserver(updateWidth);
        resizeObserver.observe(el);
        // Also retry after a slight delay to allow images/fonts to load/settle
        setTimeout(updateWidth, 100);
        setTimeout(updateWidth, 500); 
        
        const tick = (time: number) => {
            const dt = (time - lastTime) / 1000;
            lastTime = time;
            
            // Update width if it was 0 (e.g. initial render race)
            if (marqueeState.current.contentWidth === 0) updateWidth();

            // Pause on Hover (if container hovered)
            if (el.matches(':hover') || el.parentElement?.matches(':hover')) {
                rafId = requestAnimationFrame(tick);
                return; 
            }

            // Pixels per second: speed * 60 
            const delta = (speed * 60) * direction * dt;
            
            marqueeState.current.offset += delta;
            
            // Seamless Loop Logic
            const w = marqueeState.current.contentWidth;
            if (w > 0) {
                // Moving Left (negative direction)
                if (direction < 0 && marqueeState.current.offset <= -w) {
                    marqueeState.current.offset += w;
                } 
                // Moving Right (positive direction)
                else if (direction > 0 && marqueeState.current.offset >= 0) {
                    marqueeState.current.offset -= w;
                }
            }
            
            el.style.transform = `translate3d(${marqueeState.current.offset}px, 0, 0)`;
            rafId = requestAnimationFrame(tick);
        };
        
        rafId = requestAnimationFrame(tick);
        trackRaf(1);
        
        return () => {
            cancelAnimationFrame(rafId);
            resizeObserver.disconnect();
            trackRaf(-1);
        };
    }, [listLayout, speed, direction, isVisible, gap, itemCount]); 

    // Early return logic AFTER hooks
    if (opacity < 0.01) return null;

    // --- Grid / Stack Logic ---
    if (listLayout === 'grid' || listLayout === 'stack') {
        if (listLayout === 'grid') {
            const cols = Math.max(1, Math.floor(getVal(obj.listColumns, scrollProgress, 3)));
            const rowsPerPage = Math.max(1, Math.floor(getVal(obj.listRows, scrollProgress, 2)));
            const page = Math.floor(getVal(obj.listPage, scrollProgress, 0));
            const perPage = cols * rowsPerPage;
            const start = page * perPage;
            
            // Grid Pagination Logic
            if (rowsPerPage > 0 && perPage > 0) {
                 if (start < displayItems.length) {
                    displayItems = displayItems.slice(start, start + perPage);
                } else {
                    displayItems = [];
                }
            }
        }

        const renderListItems = (items: any[]) => items.map((item, i) => {
            const merged = mergeConfig(template, item, i);
            return (
                <DOMItem 
                    key={merged.id}
                    obj={merged}
                    scrollProgress={scrollProgress}
                    isChild={true} // Relative layout
                    className="relative shrink-0"
                />
            );
        });

        const containerStyle: React.CSSProperties = {
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: `translate3d(${x}px, ${y}px, ${z}px) translate(-50%, -50%)`, // Centered
            opacity,
            display: listLayout === 'grid' ? 'grid' : 'flex',
            flexDirection: listLayout === 'stack' ? 'column' : undefined,
            justifyContent: 'center',
            alignItems: 'center',
            gap,
            gridTemplateColumns: listLayout === 'grid' ? `repeat(${Math.floor(getVal(obj.listColumns, scrollProgress, 3))}, auto)` : undefined,
            overflow: obj.clipWithinSection ? 'hidden' : 'visible',
            width: 'max-content',
            maxWidth: '100vw',
            pointerEvents: 'none' // Important: Grid container shouldn't block, but items should have auto
        };

        return (
            <div ref={containerRef} style={containerStyle}>
                {renderListItems(displayItems)}
            </div>
        );
    }

    // --- Marquee Logic ---
    if (listLayout === 'marquee') {
        const renderListItems = (items: any[], keyPrefix: string) => items.map((item, i) => {
            const merged = mergeConfig(template, item, i);
            return (
                <DOMItem 
                    key={`${keyPrefix}-${merged.id}`}
                    obj={merged}
                    scrollProgress={scrollProgress}
                    isChild={true} 
                    className="relative shrink-0"
                />
            );
        });

        // Marquee container
        const containerStyle: React.CSSProperties = {
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: `translate3d(${x}px, ${y}px, ${z}px) translateY(-50%)`, // Center vertically
            opacity,
            width: '100vw',
            marginLeft: '-50vw',
            overflow: obj.clipWithinSection ? 'hidden' : 'visible',
            pointerEvents: 'none', // Ensure container doesn't block clicks but children do
        };

        return (
            <div ref={containerRef} style={containerStyle}>
                <div ref={trackRef} style={{ display: 'flex', gap, willChange: 'transform', pointerEvents: 'auto', width: 'max-content' }} className="py-12 cursor-move select-none">
                    {renderListItems(displayItems, 'A')}
                    {renderListItems(displayItems, 'B')}
                </div>
            </div>
        );
    }

    return null;
};

// --- Main Router ---
const DOMItem: React.FC<DOMItemProps> = (props) => {
    if (props.obj.shape === 'list') {
        return <ListRenderer {...props} />;
    }
    return <SingleItemRenderer {...props} />;
};

// --- Root Renderer ---
export const SceneDOMRenderer = ({ objects, scrollProgress }: { objects: SceneObject[], scrollProgress: number }) => {
    // Only render DOM-capable shapes
    const validObjects = useMemo(() => 
        objects.filter(o => isDOMShape(o.shape)), 
    [objects]);

    return (
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
            {validObjects.map(obj => (
                <DOMItem key={obj.id} obj={obj} scrollProgress={scrollProgress} />
            ))}
        </div>
    );
};
