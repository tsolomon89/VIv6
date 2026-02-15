import React, { useEffect, useRef } from 'react';
import { Renderer, Triangle, Program, Mesh, Texture } from 'ogl';

export type PrismProps = {
  height?: number;
  baseWidth?: number;
  animationType?: 'rotate' | 'hover' | '3drotate' | 'static' | 'marquee';
  shape?: 'tetrahedron' | 'cube' | 'sphere' | 'cylinder' | 'torus' | 'column' | 'plane';
  glow?: number;
  offset?: { x?: number; y?: number; z?: number };
  noise?: number;
  transparent?: boolean;
  scale?: number;
  hueShift?: number;
  colorFrequency?: number;
  hoverStrength?: number;
  inertia?: number;
  bloom?: number;
  suspendWhenOffscreen?: boolean;
  timeScale?: number;
  className?: string;
  saturation?: number;
  rainbow?: number;
  density?: number;
  opacity?: number;
  rotation?: { x: number; y: number; z: number };
  textureUrl?: string;
  sizingMode?: 'cover' | 'contain' | 'native';
  borderRadius?: number;
  marqueeSpeed?: number;
  marqueeDirection?: number;
};

export const PrismBackground: React.FC<PrismProps> = (props) => {
  const {
    height = 1,
    baseWidth = 1,
    animationType = 'rotate',
    shape = 'tetrahedron',
    glow = 1,
    offset = { x: 0, y: 0, z: 0 },
    noise = 0.5,
    transparent = true,
    scale = 100,
    hueShift = 0,
    colorFrequency = 1,
    hoverStrength = 2,
    inertia = 0.05,
    bloom = 1,
    suspendWhenOffscreen = false,
    timeScale = 0.5,
    className = "",
    saturation = 1.1,
    rainbow = 1.0,
    density = 0.2,
    opacity = 1.0,
    rotation = { x: 0, y: 0, z: 0 },
    textureUrl = "",
    sizingMode = 'cover',
    borderRadius = 0,
    marqueeSpeed = 1,
    marqueeDirection = 1
  } = props;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useEffect(() => {

    const container = containerRef.current;
    if (!container) return;

    // Initial Params (will be updated in render loop from propsRef)
    // We set defaults here just for init
    const H = Math.max(0.001, height);
    const BW = Math.max(0.001, baseWidth);
    const BASE_HALF = BW * 0.5;
    
    // Shape Mapping (Legacy Alignment)
    const shapeMap: Record<string, number> = {
      'tetrahedron': 0,
      'cube': 1,
      'sphere': 2,
      'cylinder': 3,
      'torus': 4,
      'column': 5,
      'plane': 6
    };
    // Default to 0 (Tetrahedron) if not found
    const getShapeId = (s: string) => shapeMap[s] ?? 0;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let renderer: any;
    let gl: any;
    let program: any;
    let mesh: any;
    let ro: ResizeObserver;
    let raf = 0;
    // Identity matrix for initial state
    const rotBuf = new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]);

    try {
        renderer = new Renderer({
            dpr,
            alpha: transparent,
            antialias: false,
            powerPreference: 'high-performance'
        });
        gl = renderer.gl;

    } catch (e) {
        console.error('[PrismBackground] CRITICAL: Renderer Init Failed:', e);
        return;
    }

    Object.assign(gl.canvas.style, {
      position: 'absolute',
      inset: '0',
      width: '100%',
      height: '100%',
      display: 'block'
    });
    container.appendChild(gl.canvas);
    
    // Restore GL State Config from old_builder
    if (gl) {
        gl.disable(gl.DEPTH_TEST);
        gl.disable(gl.CULL_FACE);
        gl.disable(gl.BLEND);
    }

    // Texture Loading
    let texture: any;
    let hasTexture = 0;
    let imgAspect = 1.0;

    try {
        texture = new Texture(gl, {
            wrapS: gl.CLAMP_TO_EDGE,
            wrapT: gl.CLAMP_TO_EDGE,
            minFilter: gl.LINEAR,
            magFilter: gl.LINEAR
        });
        // Default 1x1 white
        texture.image = new Uint8Array([255, 255, 255, 255]);
        texture.width = 1;
        texture.height = 1;
        texture.needsUpdate = true;

        if (textureUrl && shape === 'plane') {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.src = textureUrl;
            img.onload = () => {
                texture.image = img;
                texture.width = img.width;
                texture.height = img.height;
                imgAspect = img.width / img.height;
                hasTexture = 1;
                texture.needsUpdate = true;
                // Update uniform immediately if possible, or wait for next frame
                if(program) {
                    program.uniforms.uHasTexture.value = 1;
                    program.uniforms.uImgAspect.value = imgAspect;
                }
            };
        }
    } catch (e) {
        console.error('[PrismBackground] Texture Init Failed', e);
    }

    const vertex = /* glsl */ `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    const fragment = /* glsl */ `
      precision highp float;
      uniform vec2  iResolution;
      uniform float iTime;
      uniform float uHeight;
      uniform float uBaseHalf;
      uniform mat3  uRot;
      uniform int   uUseBaseWobble;
      uniform int   uShape;
      uniform float uGlow;
      uniform vec2  uOffsetPx;
      uniform float uOffsetZ;
      uniform float uNoise;
      uniform float uSaturation;
      uniform float uScale;
      uniform float uHueShift;
      uniform float uColorFreq;
      uniform float uBloom;
      uniform float uCenterShift;
      uniform float uInvBaseHalf;
      uniform float uInvHeight;
      uniform float uMinAxis;
      uniform float uPxScale;
      uniform float uTimeScale;
      uniform float uRainbow;
      uniform float uDensity;
      uniform float uOpacity;
      
      uniform sampler2D uTexture;
      uniform int uHasTexture;
      uniform int uSizingMode; 
      uniform float uImgAspect;
      uniform float uBorderRadius;
      
      uniform float uMarqueeSpeed;
      uniform float uMarqueeDir;
      uniform int uIsMarquee;

      vec4 tanh4(vec4 x){
        vec4 e2x = exp(2.0*x);
        return (e2x - 1.0) / (e2x + 1.0);
      }
      float rand(vec2 co){
        return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453123);
      }

      // SDFs
      float sdOctaAnisoInv(vec3 p){
        vec3 q = vec3(abs(p.x) * uInvBaseHalf, abs(p.y) * uInvHeight, abs(p.z) * uInvBaseHalf);
        float m = q.x + q.y + q.z - 1.0;
        return m * uMinAxis * 0.5773502691896258;
      }
      float sdPyramidUpInv(vec3 p){
        return max(sdOctaAnisoInv(p), -p.y);
      }
      float sdBox(vec3 p, vec3 b) {
        vec3 q = abs(p) - b;
        return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
      }
      float sdCappedCylinder(vec3 p, float h, float r) {
        vec2 d = abs(vec2(length(p.xz),p.y)) - vec2(r,h);
        return min(max(d.x,d.y),0.0) + length(max(d,0.0));
      }
      float sdTorus(vec3 p, vec2 t) {
        vec2 q = vec2(length(p.xz)-t.x,p.y);
        return length(q)-t.y;
      }
      float sdRoundedBox(vec3 p, vec3 b, float r) {
        vec3 q = abs(p) - b;
        return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0) - r;
      }

      float getDist(vec3 p) {
        if (uShape == 1) return sdBox(p, vec3(uBaseHalf, uHeight * 0.5, uBaseHalf));
        if (uShape == 2) {
            vec3 q = vec3(p.x * uInvBaseHalf, p.y * uInvHeight, p.z * uInvBaseHalf);
            return (length(q) - 1.0) * uMinAxis;
        }
        if (uShape == 3) return sdCappedCylinder(p, uHeight * 0.5, uBaseHalf);
        if (uShape == 4) return sdTorus(p, vec2(uBaseHalf, uHeight * 0.2));
        if (uShape == 5) return length(p.xz) - uBaseHalf;
        if (uShape == 6) {
            float r = uBorderRadius * min(uBaseHalf, uHeight * 0.5);
            return sdRoundedBox(p, vec3(uBaseHalf - r, uHeight * 0.5 - r, 0.05), r);
        }
        return sdPyramidUpInv(p);
      }

      mat3 hueRotation(float a){
        float c = cos(a), s = sin(a);
        mat3 W = mat3(0.299, 0.587, 0.114, 0.299, 0.587, 0.114, 0.299, 0.587, 0.114);
        mat3 U = mat3(0.701, -0.587, -0.114, -0.299, 0.413, -0.114, -0.300, -0.588, 0.886);
        mat3 V = mat3(0.168, -0.331, 0.500, 0.328, 0.035, -0.500, -0.497, 0.296, 0.201);
        return W + U * c + V * s;
      }

      void main(){
        vec2 f = (gl_FragCoord.xy - 0.5 * iResolution.xy - uOffsetPx) * uPxScale;
        if (uIsMarquee == 1) f.x += iTime * uMarqueeSpeed * uMarqueeDir * 10.0;

        float z = 5.0;
        float d = 0.0;
        vec3 p;
        vec4 o = vec4(0.0);
        float centerShift = uCenterShift;
        
        mat2 wob = mat2(1.0);
        if (uUseBaseWobble == 1) {
          float t = iTime * uTimeScale;
          float c0 = cos(t), c1 = cos(t+33.0), c2 = cos(t+11.0);
          wob = mat2(c0, c1, c2, c0);
        }
        vec4 phases = vec4(0.0, 1.0, 2.0, 3.0) * uRainbow;
        
        for (int i = 0; i < 80; i++) {
          p = vec3(f, z);
          p.z -= uOffsetZ;
          p.xz = p.xz * wob;
          p = uRot * p;
          vec3 q = p;
          if (uShape == 0) q.y += centerShift;
          
          d = 0.1 + uDensity * abs(getDist(q));
          z -= d;
          o += (sin((p.y + z) * uColorFreq + phases) + 1.0) / d;
          
          // Texture Mapping (Plane)
          if (uShape == 6 && uHasTexture == 1 && abs(q.z) < 0.2) {
              vec2 rawUV = (q.xy / vec2(uBaseHalf * 2.0, uHeight)) + 0.5;
              vec2 finalUV = rawUV;
              if (uSizingMode == 0) { // Cover
                 float rAspect = uBaseHalf / (uHeight * 0.5);
                 vec2 ratio = vec2(1.0);
                 if (rAspect > uImgAspect) ratio.y = rAspect / uImgAspect;
                 else ratio.x = uImgAspect / rAspect;
                 finalUV = (rawUV - 0.5) * ratio + 0.5;
              } else if (uSizingMode == 1) { // Contain
                 float rAspect = uBaseHalf / (uHeight * 0.5);
                 vec2 ratio = vec2(1.0);
                 if (rAspect > uImgAspect) ratio.x = uImgAspect / rAspect;
                 else ratio.y = rAspect / uImgAspect;
                 finalUV = (rawUV - 0.5) / ratio + 0.5;
              }
              if (finalUV.x >= 0. && finalUV.x <= 1. && finalUV.y >= 0. && finalUV.y <= 1.) {
                 vec4 t = texture2D(uTexture, vec2(finalUV.x, 1.0 - finalUV.y));
                 o += t * (1.0/d) * 0.2 * uBloom; 
              }
          }
        }
        
        o = tanh4(o * o * (uGlow * uBloom) / 1e5);
        vec3 col = o.rgb;
        float n = rand(gl_FragCoord.xy + vec2(iTime));
        col += (n - 0.5) * uNoise;
        col = clamp(col, 0.0, 1.0);
        float L = dot(col, vec3(0.2126, 0.7152, 0.0722));
        col = clamp(mix(vec3(L), col, uSaturation), 0.0, 1.0);
        if(abs(uHueShift) > 0.0001) col = clamp(hueRotation(uHueShift) * col, 0.0, 1.0);
        
        // DEBUG: Force output red to verify render
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); 
        
        // gl_FragColor = vec4(col, o.a * uOpacity);
      }
    `;

    // Uniform Buffers
    const iResBuf = new Float32Array(2);
    const offsetPxBuf = new Float32Array(2);
    // rotBuf uses top-level identity one now

    try {

        const geometry = new Triangle(gl);
        program = new Program(gl, {
            vertex,
            fragment,
            uniforms: {
                iResolution: { value: iResBuf },
                iTime: { value: 0 },
                uHeight: { value: H },
                uBaseHalf: { value: BASE_HALF },
                uUseBaseWobble: { value: 1 },
                uShape: { value: getShapeId(shape) },
                uRot: { value: rotBuf },
                uGlow: { value: glow },
                uOffsetPx: { value: offsetPxBuf },
                uOffsetZ: { value: offset?.z || 0 },
                uNoise: { value: noise },
                uSaturation: { value: saturation },
                uScale: { value: scale },
                uHueShift: { value: hueShift },
                uColorFreq: { value: colorFrequency },
                uBloom: { value: bloom },
                uCenterShift: { value: H * 0.25 },
                uInvBaseHalf: { value: 1 / BASE_HALF },
                uInvHeight: { value: 1 / H },
                uMinAxis: { value: Math.min(BASE_HALF, H) },
                uPxScale: { value: 1 / (scale * dpr) },
                uTimeScale: { value: timeScale },
                uRainbow: { value: rainbow },
                uDensity: { value: density },
                uOpacity: { value: opacity },
                uTexture: { value: texture },
                uHasTexture: { value: hasTexture },
                uSizingMode: { value: sizingMode === 'contain' ? 1 : 0 },
                uImgAspect: { value: imgAspect },
                uBorderRadius: { value: borderRadius },
                uMarqueeSpeed: { value: marqueeSpeed },
                uMarqueeDir: { value: marqueeDirection },
                uIsMarquee: { value: animationType === 'marquee' ? 1 : 0 }
            }
        });
        mesh = new Mesh(gl, { geometry, program });

    } catch (e) {
        console.error('[PrismBackground] Program Init Failed:', e);
        return;
    }

    const resize = () => {
      const w = container.clientWidth || 1;
      const h = container.clientHeight || 1;
      renderer.setSize(w, h);
      iResBuf[0] = gl.drawingBufferWidth;
      iResBuf[1] = gl.drawingBufferHeight;
      // Get latest props for resize too
      const p = propsRef.current;
      const ox = p.offset?.x || 0;
      const oy = p.offset?.y || 0;
      const sc = p.scale || 100;
      offsetPxBuf[0] = ox * dpr;
      offsetPxBuf[1] = oy * dpr;
      program.uniforms.uPxScale.value = 1 / (sc * dpr);
    };

    ro = new ResizeObserver(resize);
    ro.observe(container);
    resize();

    // Helper math
    const setMat3FromEuler = (yawY: number, pitchX: number, rollZ: number, out: Float32Array) => {
      const cy = Math.cos(yawY), sy = Math.sin(yawY);
      const cx = Math.cos(pitchX), sx = Math.sin(pitchX);
      const cz = Math.cos(rollZ), sz = Math.sin(rollZ);
      // R = Rz * Rx * Ry (standard extrinsic)
      const r00 = cy * cz + sy * sx * sz;
      const r01 = -cy * sz + sy * sx * cz;
      const r02 = sy * cx;
      const r10 = cx * sz;
      const r11 = cx * cz;
      const r12 = -sx;
      const r20 = -sy * cz + cy * sx * sz;
      const r21 = sy * sz + cy * sx * cz;
      const r22 = cy * cx;
      out[0] = r00; out[1] = r10; out[2] = r20;
      out[3] = r01; out[4] = r11; out[5] = r21;
      out[6] = r02; out[7] = r12; out[8] = r22;
      return out;
    };

    // raf already declared above
    const t0 = performance.now();
    
    // Animation state
    let yaw = 0, pitch = 0, roll = 0;
    let targetYaw = 0, targetPitch = 0;
    const pointer = { x: 0, y: 0, inside: true };
    
    // Random seeds
    const RSX = 1.0, RSY = 1.0, RSZ = 1.0;
    const rnd = () => Math.random();
    const wX = (0.3 + rnd() * 0.6) * RSX;
    const wY = (0.2 + rnd() * 0.7) * RSY;
    const wZ = (0.1 + rnd() * 0.5) * RSZ;
    const phX = rnd() * Math.PI * 2;
    const phZ = rnd() * Math.PI * 2;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const onMove = (e: PointerEvent) => {
      const ww = Math.max(1, window.innerWidth);
      const wh = Math.max(1, window.innerHeight);
      const cx = ww * 0.5, cy = wh * 0.5;
      const nx = (e.clientX - cx) / (ww * 0.5);
      const ny = (e.clientY - cy) / (wh * 0.5);
      pointer.x = Math.max(-1, Math.min(1, nx));
      pointer.y = Math.max(-1, Math.min(1, ny));
      pointer.inside = true;
    };
    const onLeave = () => { pointer.inside = false; };
    const onBlur = () => { pointer.inside = false; };

    let onPointerMove: ((e: PointerEvent) => void) | null = null;
    if (animationType === 'hover') {
        onPointerMove = (e) => { onMove(e); if(!raf) startRAF(); };
        window.addEventListener('pointermove', onPointerMove, { passive: true });
        window.addEventListener('mouseleave', onLeave);
        window.addEventListener('blur', onBlur);
    }

    const startRAF = () => { if (!raf) raf = requestAnimationFrame(render); };
    const stopRAF = () => { if (raf) { cancelAnimationFrame(raf); raf = 0; } };


    const render = (t: number) => {
        const time = (t - t0) * 0.001;
        const p = propsRef.current;
        
        // Update all dynamic uniforms from Props
        const H = Math.max(0.001, p.height || 1);
        const BW = Math.max(0.001, p.baseWidth || 1);
        const BASE_HALF = BW * 0.5;
        const rot = p.rotation || {x:0, y:0, z:0};
        
        const u = program.uniforms;
        u.iTime.value = time;
        u.uHeight.value = H;
        u.uBaseHalf.value = BASE_HALF;
        u.uShape.value = getShapeId(p.shape || 'tetrahedron');
        u.uGlow.value = p.glow ?? 1;
        u.uOffsetZ.value = p.offset?.z || 0;
        u.uNoise.value = p.noise ?? 0.5;
        u.uSaturation.value = p.saturation ?? 1.1;
        u.uScale.value = p.scale ?? 100;
        u.uHueShift.value = p.hueShift ?? 0;
        u.uColorFreq.value = p.colorFrequency ?? 1;
        u.uBloom.value = p.bloom ?? 1;
        u.uCenterShift.value = H * 0.25;
        u.uInvBaseHalf.value = 1 / BASE_HALF;
        u.uInvHeight.value = 1 / H;
        u.uMinAxis.value = Math.min(BASE_HALF, H);
        // uPxScale handled by resize, but relies on scale prop which might change
        // We really should update uPxScale here too if scale changes, but resize handles it efficiently?
        // Actually resize only runs on window resize. If prop 'scale' changes, we need to update uPxScale.
        u.uPxScale.value = 1 / ((p.scale ?? 100) * dpr);
        
        u.uTimeScale.value = p.timeScale ?? 0.5;
        u.uRainbow.value = p.rainbow ?? 1.0;
        u.uDensity.value = p.density ?? 0.2;
        u.uOpacity.value = p.opacity ?? 1.0;
        u.uSizingMode.value = p.sizingMode === 'contain' ? 1 : 0;
        u.uBorderRadius.value = p.borderRadius ?? 0;
        u.uMarqueeSpeed.value = p.marqueeSpeed ?? 1;
        u.uMarqueeDir.value = p.marqueeDirection ?? 1;
        u.uIsMarquee.value = p.animationType === 'marquee' ? 1 : 0;
        u.uUseBaseWobble.value = (p.animationType === 'rotate' || p.animationType === undefined) ? 1 : 0;

        // Texture uniforms updated by onload, but good ensures:
        u.uHasTexture.value = hasTexture;
        u.uImgAspect.value = imgAspect;

        let continueRAF = true;
        const anim = p.animationType;
        const TS = p.timeScale ?? 0.5;
        const HOVSTR = p.hoverStrength ?? 2;
        const INERT = p.inertia ?? 0.05;

        if (anim === 'hover') {
            const maxPitch = 0.6 * HOVSTR;
            const maxYaw = 0.6 * HOVSTR;
            targetYaw = (pointer.inside ? -pointer.x : 0) * maxYaw;
            targetPitch = (pointer.inside ? pointer.y : 0) * maxPitch;
            yaw = lerp(yaw, targetYaw, INERT);
            pitch = lerp(pitch, targetPitch, INERT);
            roll = lerp(roll, 0, 0.1);
            u.uRot.value = setMat3FromEuler(yaw, pitch, roll, rotBuf);
        } else if (anim === '3drotate') {
            const tScaled = time * TS;
            yaw = tScaled * wY;
            pitch = Math.sin(tScaled * wX + phX) * 0.6;
            roll = Math.sin(tScaled * wZ + phZ) * 0.5;
            u.uRot.value = setMat3FromEuler(yaw, pitch, roll, rotBuf);
        } else {
            u.uRot.value = setMat3FromEuler(rot.y, rot.x, rot.z, rotBuf);
        }

        try {
            renderer.render({ scene: mesh });
        } catch (e) {
            console.error('[PrismBackground] Render Error during RAF:', e);
            continueRAF = false; // Stop loop on error
        }

        if (continueRAF) raf = requestAnimationFrame(render);
    };

    startRAF();

    return () => {

      stopRAF();
      if(ro) ro.disconnect();
      if (onPointerMove) window.removeEventListener('pointermove', onPointerMove as any);
      window.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('blur', onBlur);
      if (gl && gl.canvas && gl.canvas.parentElement === container) {
          container.removeChild(gl.canvas);
      }
      // Force lose context? No need usually.
    };
  }, [textureUrl]); // Only re-init if texture changes

  return <div className={`w-full h-full relative overflow-hidden ${className}`} ref={containerRef} />;
};
