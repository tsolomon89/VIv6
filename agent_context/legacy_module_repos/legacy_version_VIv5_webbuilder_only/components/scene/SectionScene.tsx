
import React, { useMemo } from 'react';
import { PrismBackground } from './PrismBackground';
import { StormBackground } from './StormBackground';
import { SceneDOMRenderer } from './SceneDOMRenderer';
import { MarqueeRenderer } from './MarqueeRenderer'; 
import { SceneObject, NumberParam, ConfigState } from '../../types';
import { flattenScene } from '../../utils/scene';
import { isWebGLShape, isDOMShape } from '../../utils/shapes';

// Interpolation Helper
const getRenderValue = (param: NumberParam, p: number): number => {
    if (param.isLinked && param.endValue !== null) {
      return param.value + (param.endValue - param.value) * p;
    }
    return param.value;
};

const getRenderConfig = (config: ConfigState, p: number): any => {
    const props: any = {};
    Object.keys(config).forEach(key => {
      const k = key as keyof ConfigState;
      if (
          k === 'shape' || k === 'animationType' || 
          k === 'tileHeading' || k === 'tileLabel' || k === 'tileSubtitle' || 
          k === 'tileTrailing' || k === 'tileTrailingIcon' ||
          k === 'tileAlign' || k === 'tileTag' ||
          k === 'headingColor' || k === 'labelColor' || k === 'subColor' ||
          k === 'textureUrl' || k === 'sizingMode' || 
          k === 'leadingIcon' || k === 'leadingImage' || k === 'leadingPlacement' || k === 'leadingFit' ||
          k === 'borderRadius' ||
          k === 'cardRadius' || k === 'cardBackground' || k === 'cardBorder' ||
          k === 'cardMediaSrc' || k === 'cardMediaFit' || k === 'cardClip' ||
          // List Types
          k === 'listLayout' || k === 'listTemplate' || k === 'listItems' || k === 'clipWithinSection' ||
          k === 'containerOverflow' || k === 'itemOverflow' ||
          // Marquee Specific
          k === 'marqueeHoverPause'
      ) {
        props[k] = config[k];
      } else {
        props[k] = getRenderValue(config[k] as NumberParam, p);
      }
    });
    return {
      ...props,
      offset: { x: props.offsetX, y: props.offsetY, z: props.offsetZ },
      rotation: { x: props.rotateX, y: props.rotateY, z: props.rotateZ }
    };
};

export const SectionScene = ({ objects, progress }: { objects: SceneObject[], progress: number }) => {
    
    // Flatten hierarchy for WebGL/Marquee processing
    const flatObjects = useMemo(() => flattenScene(objects), [objects]);
    
    // WebGL Objects (Prism, Storm, Planes)
    const webglObjects = useMemo(() => 
        flatObjects.filter(o => isWebGLShape(o.shape)),
    [flatObjects]);
    
    // Marquee Objects (List with layout marquee AND policy=webgl)
    const marqueeObjects = useMemo(() => 
        flatObjects.filter(o => 
            o.shape === 'list' && 
            o.listLayout === 'marquee' &&
            o.renderPolicy?.renderer === 'webgl'
        ),
    [flatObjects]);

    // DOM Objects - Passed strictly as top-level because DOMRenderer handles recursion itself
    // We allow lists and groups here. The SceneDOMRenderer will skip WebGL marquees internally.
    const domObjects = useMemo(() => 
        objects.filter(o => isDOMShape(o.shape)),
    [objects]);

    return (
        <div className="absolute inset-0 pointer-events-none z-0">
             {/* 1. WebGL Marquee Layer */}
             {marqueeObjects.map(obj => (
                 <MarqueeRenderer key={obj.id} listObject={obj} scrollProgress={progress} />
             ))}

             {/* 2. DOM Layer (Tile, Cards, Stack/Grid List, DOM Marquee) */}
             <SceneDOMRenderer objects={domObjects} scrollProgress={progress} />

             {/* 3. WebGL Layer (Prism/Storm) */}
             {webglObjects.map(obj => {
                const config = getRenderConfig(obj, progress);

                return (
                    <div key={obj.id} className="absolute inset-0 pointer-events-none">
                        {obj.shape === 'lightning' || obj.shape === 'atmosphere' ? (
                            <StormBackground
                                variant={obj.shape === 'lightning' ? 'lightning' : 'atmosphere'}
                                hue={config.hue}
                                intensity={config.intensity}
                                strikeIntensity={config.strikeIntensity}
                                frequency={config.frequency}
                                speed={config.speed}
                                cloudiness={config.cloudiness}
                                boltWidth={config.boltWidth}
                                zigzag={config.zigzag}
                                saturation={config.saturation}
                                diagonal={config.diagonal}
                                depth={config.depth}
                                cloudScale={config.cloudScale}
                                flashDuration={config.flashDuration}
                                boltDuration={config.boltDuration}
                                boltGlow={config.boltGlow}
                                suspendWhenOffscreen={true}
                            />
                        ) : (
                            <PrismBackground
                                {...config}
                                transparent={true}
                                suspendWhenOffscreen={true}
                            />
                        )}
                    </div>
                );
             })}
        </div>
    );
};
