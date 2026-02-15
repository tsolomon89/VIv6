import React, { useEffect, useRef } from 'react';
import { Renderer, Triangle, Program, Mesh, Texture } from 'ogl';

export type PrismProps = {
  /** Height of the prism geometry */
  height?: number;
  /** Width of the prism base */
  baseWidth?: number;
  /** Animation style */
  animationType?: 'rotate' | 'hover' | '3drotate' | 'static' | 'marquee';
  /** Geometry shape */
  shape?: 'tetrahedron' | 'cube' | 'sphere' | 'cylinder' | 'torus' | 'column' | 'plane';
  /** Intensity of the glow effect */
  glow?: number;
  /** Center offset in pixels */
  offset?: { x?: number; y?: number; z?: number };
  /** Grainy noise intensity (0 to 1) */
  noise?: number;
  /** Whether the background is transparent */
  transparent?: boolean;
  /** Overall scale of the rendered output (pixels per unit) */
  scale?: number;
  /** Color hue shift in radians */
  hueShift?: number;
  /** Density of the color waves */
  colorFrequency?: number;
  /** Multiplier for hover displacement (hover mode only) */
  hoverStrength?: number;
  /** Smoothness of movement (0 to 1) */
  inertia?: number;
  /** Bloom/brightness multiplier */
  bloom?: number;
  /** Pause rendering when component is not in viewport */
  suspendWhenOffscreen?: boolean;
  /** Global animation speed multiplier */
  timeScale?: number;
  /** Container class name */
  className?: string;
  /** Color saturation multiplier */
  saturation?: number;
  /** Rainbow/Chromatic aberration spread */
  rainbow?: number;
  /** Density of the refractive volume steps */
  density?: number;
  /** Global opacity multiplier */
  opacity?: number;
  /** Rotation in static mode (radians) */
  rotation?: { x: number; y: number; z: number };
  /** Texture URL for Plane shape */
  textureUrl?: string;
  /** Sizing mode for texture: 'cover', 'contain', 'native' */
  sizingMode?: 'cover' | 'contain' | 'native';
  /** Border Radius (0-1) for Plane shape */
  borderRadius?: number;
  /** Marquee specific props */
  marqueeSpeed?: number;
  marqueeDirection?: number;
};

export const PrismBackground: React.FC<PrismProps> = ({
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
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const H = Math.max(0.001, height);
    const BW = Math.max(0.001, baseWidth);
    const BASE_HALF = BW * 0.5;
    const GLOW = Math.max(0.0, glow);
    const NOISE = Math.max(0.0, noise);
    const offX = offset?.x ?? 0;
    const offY = offset?.y ?? 0;
    const offZ = offset?.z ?? 0;
    const SAT = Math.max(0, saturation);
    const SCALE = Math.max(0.001, scale);
    const HUE = hueShift || 0;
    const CFREQ = Math.max(0.0, colorFrequency || 1);
    const BLOOM = Math.max(0.0, bloom || 1);
    const RSX = 1;
    const RSY = 1;
    const RSZ = 1;
    const TS = Math.max(0, timeScale || 1);
    const HOVSTR = Math.max(0, hoverStrength || 1);
    const INERT = Math.max(0, Math.min(1, inertia || 0.12));
    const RAINBOW = Math.max(0, rainbow);
    const DENSITY = Math.max(0.001, density);
    const OPACITY = Math.max(0, opacity);
    const BORDER_RADIUS = Math.max(0, Math.min(1, borderRadius || 0));
    
    const ROT_X = rotation?.x ?? 0;
    const ROT_Y = rotation?.y ?? 0;
    const ROT_Z = rotation?.z ?? 0;
    
    const MARQUEE_SPEED = marqueeSpeed ?? 1;
    const MARQUEE_DIR = marqueeDirection ?? 1;

    // Shape Mapping
    const shapeMap: Record<string, number> = {
      'tetrahedron': 0,
      'cube': 1,
      'sphere': 2,
      'cylinder': 3,
      'torus': 4,
      'column': 5,
      'plane': 6
    };
    const SHAPE_ID = shapeMap[shape] ?? 0;
    
    const SIZING_MODE_ID = sizingMode === 'contain' ? 1 : sizingMode === 'native' ? 2 : 0; // 0 = cover

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const renderer = new Renderer({
      dpr,
      alpha: transparent,
      antialias: false
    });

    const gl = renderer.gl;
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.disable(gl.BLEND);

    // Texture Loading
    const texture = new Texture(gl, {
        wrapS: gl.CLAMP_TO_EDGE,
        wrapT: gl.CLAMP_TO_EDGE,
        minFilter: gl.LINEAR,
        magFilter: gl.LINEAR
    });
    
    // Create a 1x1 white pixel as default to prevent warnings
    const emptyImage = new Uint8Array([255, 255, 255, 255]);
    texture.image = emptyImage;
    texture.width = 1;
    texture.height = 1;
    texture.needsUpdate = true; // IMPORTANT: Set needsUpdate to true for OGL 1.0.11

    let hasTexture = 0;
    let imgAspect = 1.0;

    if (textureUrl && shape === 'plane') {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = textureUrl;
        img.onload = () => {
            texture.image = img;
            texture.width = img.width; // Update dimensions
            texture.height = img.height;
            imgAspect = img.width / img.height;
            hasTexture = 1;
            texture.needsUpdate = true;
            // Force re-render if static
            if (animationType === 'static' && raf === 0) startRAF();
        };
    }

    Object.assign(gl.canvas.style, {
      position: 'absolute',
      inset: '0',
      width: '100%',
      height: '100%',
      display: 'block'
    } as Partial<CSSStyleDeclaration>);

    container.appendChild(gl.canvas);

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
      
      // Texture Uniforms
      uniform sampler2D uTexture;
      uniform int uHasTexture;
      uniform int uSizingMode; // 0=Cover, 1=Contain, 2=Native
      uniform float uImgAspect;
      uniform float uBorderRadius;
      
      // Marquee
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

      // --- SDF Primitives ---

      // 0: Tetrahedron / Octahedron Variant
      float sdOctaAnisoInv(vec3 p){
        vec3 q = vec3(abs(p.x) * uInvBaseHalf, abs(p.y) * uInvHeight, abs(p.z) * uInvBaseHalf);
        float m = q.x + q.y + q.z - 1.0;
        return m * uMinAxis * 0.5773502691896258;
      }
      float sdPyramidUpInv(vec3 p){
        float oct = sdOctaAnisoInv(p);
        float halfSpace = -p.y;
        return max(oct, halfSpace);
      }

      // 1: Box
      float sdBox(vec3 p, vec3 b) {
        vec3 q = abs(p) - b;
        return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
      }

      // 2: Sphere
      float sdSphere(vec3 p, float s) {
        return length(p) - s;
      }

      // 3: Capped Cylinder (Disk)
      float sdCappedCylinder(vec3 p, float h, float r) {
        vec2 d = abs(vec2(length(p.xz),p.y)) - vec2(r,h);
        return min(max(d.x,d.y),0.0) + length(max(d,0.0));
      }

      // 4: Torus (Ring)
      float sdTorus(vec3 p, vec2 t) {
        vec2 q = vec2(length(p.xz)-t.x,p.y);
        return length(q)-t.y;
      }

      // 5: Column (Infinite Cylinder along Y)
      // Note: We clamp Y in SDF logic roughly via height if needed, but here it is infinite
      // Actually SDF for infinite cylinder is just length(p.xz) - r
      // But we are in a bounded volume loop, so it effectively looks like a column.

      // Rounded Box for Plane with Radius
      float sdRoundedBox(vec3 p, vec3 b, float r) {
        vec3 q = abs(p) - b;
        return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0) - r;
      }

      // --- Scene Logic ---

      float getDist(vec3 p) {
        if (uShape == 1) {
          // Cube: Scale dimensions by BaseWidth/Height
          return sdBox(p, vec3(uBaseHalf, uHeight * 0.5, uBaseHalf));
        }
        if (uShape == 2) {
            // Sphere: Use anisotropy to allow stretching
            vec3 q = vec3(p.x * uInvBaseHalf, p.y * uInvHeight, p.z * uInvBaseHalf);
            // Re-normalize distance slightly so it doesn't get too thin
            return (length(q) - 1.0) * uMinAxis;
        }
        if (uShape == 3) {
            // Cylinder: h = Height, r = BaseWidth
            return sdCappedCylinder(p, uHeight * 0.5, uBaseHalf);
        }
        if (uShape == 4) {
            // Torus
            // Main radius = BaseWidth, Thickness = Height * 0.2
            return sdTorus(p, vec2(uBaseHalf, uHeight * 0.2));
        }
        if (uShape == 5) {
            // Column
            return length(p.xz) - uBaseHalf;
        }
        if (uShape == 6) {
            // Plane (Box with thin Z)
            float r = uBorderRadius * min(uBaseHalf, uHeight * 0.5);
            // We reduce the box size by radius so the total size remains consistent
            return sdRoundedBox(p, vec3(uBaseHalf - r, uHeight * 0.5 - r, 0.05), r);
        }
        
        // Default: Tetrahedron
        return sdPyramidUpInv(p);
      }

      mat3 hueRotation(float a){
        float c = cos(a), s = sin(a);
        mat3 W = mat3(
          0.299, 0.587, 0.114,
          0.299, 0.587, 0.114,
          0.299, 0.587, 0.114
        );
        mat3 U = mat3(
           0.701, -0.587, -0.114,
          -0.299,  0.413, -0.114,
          -0.300, -0.588,  0.886
        );
        mat3 V = mat3(
           0.168, -0.331,  0.500,
           0.328,  0.035, -0.500,
          -0.497,  0.296,  0.201
        );
        return W + U * c + V * s;
      }

      void main(){
        vec2 f = (gl_FragCoord.xy - 0.5 * iResolution.xy - uOffsetPx) * uPxScale;
        
        // Marquee Logic (Applies to screen space coord f)
        if (uIsMarquee == 1) {
             f.x += iTime * uMarqueeSpeed * uMarqueeDir * 10.0;
        }

        float z = 5.0;
        float d = 0.0;
        vec3 p;
        vec4 o = vec4(0.0);
        float centerShift = uCenterShift;
        float cf = uColorFreq;

        mat2 wob = mat2(1.0);
        if (uUseBaseWobble == 1) {
          float t = iTime * uTimeScale;
          float c0 = cos(t + 0.0);
          float c1 = cos(t + 33.0);
          float c2 = cos(t + 11.0);
          wob = mat2(c0, c1, c2, c0);
        }

        vec4 phases = vec4(0.0, 1.0, 2.0, 3.0) * uRainbow;
        
        // Texture UV variables
        vec2 texUV = vec2(0.0);
        float planeAspect = uBaseHalf / (uHeight * 0.5);

        const int STEPS = 100;
        for (int i = 0; i < STEPS; i++) {
          p = vec3(f, z);
          
          // Apply Z-offset logic:
          p.z -= uOffsetZ;

          p.xz = p.xz * wob;
          p = uRot * p;
          vec3 q = p;
          
          // Center adjustment specific to Pyramid to make it look centered
          if (uShape == 0) q.y += centerShift;
          
          d = 0.1 + uDensity * abs(getDist(q));
          z -= d;

          // Standard Glow (Accumulate into all channels including Alpha)
          // Fixed bug where only rgb was accumulated, leaving alpha 0.
          o += (sin((p.y + z) * cf + phases) + 1.0) / d;
          
          // Plane Texture Mapping (if Shape == 6 and Texture Active)
          if (uShape == 6 && uHasTexture == 1 && abs(q.z) < 0.2) {
              // Project q.xy to UV
              // Plane dims are [-uBaseHalf, uBaseHalf] x [-uHeight*0.5, uHeight*0.5]
              vec2 rawUV = (q.xy / vec2(uBaseHalf * 2.0, uHeight)) + 0.5;
              
              // Handle Sizing
              vec2 finalUV = rawUV;
              
              if (uSizingMode == 0) { // Cover
                 // Standard UV cover logic:
                 float rAspect = planeAspect; // approx
                 float iAspect = uImgAspect;
                 
                 vec2 ratio = vec2(1.0);
                 if (rAspect > iAspect) {
                     ratio.y = rAspect / iAspect;
                 } else {
                     ratio.x = iAspect / rAspect;
                 }
                 finalUV = (rawUV - 0.5) * ratio + 0.5;

              } else if (uSizingMode == 1) { // Contain
                 float rAspect = planeAspect;
                 float iAspect = uImgAspect;
                 
                 vec2 ratio = vec2(1.0);
                 if (rAspect > iAspect) {
                     ratio.x = iAspect / rAspect;
                 } else {
                     ratio.y = rAspect / iAspect;
                 }
                 ratio = 1.0 / ratio; 
                 finalUV = (rawUV - 0.5) * ratio + 0.5;
              }
              
              if (finalUV.x >= 0.0 && finalUV.x <= 1.0 && finalUV.y >= 0.0 && finalUV.y <= 1.0) {
                 // Invert Y because WebGL texture coords
                 vec4 t = texture2D(uTexture, vec2(finalUV.x, 1.0 - finalUV.y));
                 // Accumulate texture color based on density/proximity
                 // We add it to the glow. We multiply by 1/d to give it "volume" inside the raymarch.
                 // We multiply by bloom to allow brightness control.
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

        if(abs(uHueShift) > 0.0001){
          col = clamp(hueRotation(uHueShift) * col, 0.0, 1.0);
        }

        gl_FragColor = vec4(col, o.a * uOpacity);
      }
    `;

    const geometry = new Triangle(gl);
    const iResBuf = new Float32Array(2);
    const offsetPxBuf = new Float32Array(2);

    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        iResolution: { value: iResBuf },
        iTime: { value: 0 },
        uHeight: { value: H },
        uBaseHalf: { value: BASE_HALF },
        uUseBaseWobble: { value: 1 },
        uShape: { value: SHAPE_ID },
        uRot: { value: new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]) },
        uGlow: { value: GLOW },
        uOffsetPx: { value: offsetPxBuf },
        uOffsetZ: { value: offZ },
        uNoise: { value: NOISE },
        uSaturation: { value: SAT },
        uScale: { value: SCALE },
        uHueShift: { value: HUE },
        uColorFreq: { value: CFREQ },
        uBloom: { value: BLOOM },
        uCenterShift: { value: H * 0.25 },
        uInvBaseHalf: { value: 1 / BASE_HALF },
        uInvHeight: { value: 1 / H },
        uMinAxis: { value: Math.min(BASE_HALF, H) },
        uPxScale: {
          value: 1 / (SCALE * dpr)
        },
        uTimeScale: { value: TS },
        uRainbow: { value: RAINBOW },
        uDensity: { value: DENSITY },
        uOpacity: { value: OPACITY },
        // Texture Uniforms
        uTexture: { value: texture },
        uHasTexture: { value: hasTexture },
        uSizingMode: { value: SIZING_MODE_ID },
        uImgAspect: { value: imgAspect },
        uBorderRadius: { value: BORDER_RADIUS },
        // Marquee
        uMarqueeSpeed: { value: MARQUEE_SPEED },
        uMarqueeDir: { value: MARQUEE_DIR },
        uIsMarquee: { value: animationType === 'marquee' ? 1 : 0 }
      }
    });

    const mesh = new Mesh(gl, { geometry, program });

    const resize = () => {
      const w = container.clientWidth || 1;
      const h = container.clientHeight || 1;
      renderer.setSize(w, h);
      iResBuf[0] = gl.drawingBufferWidth;
      iResBuf[1] = gl.drawingBufferHeight;
      offsetPxBuf[0] = offX * dpr;
      offsetPxBuf[1] = offY * dpr;
      program.uniforms.uPxScale.value = 1 / (SCALE * dpr);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(container);
    resize();

    const rotBuf = new Float32Array(9);
    const setMat3FromEuler = (yawY: number, pitchX: number, rollZ: number, out: Float32Array) => {
      const cy = Math.cos(yawY), sy = Math.sin(yawY);
      const cx = Math.cos(pitchX), sx = Math.sin(pitchX);
      const cz = Math.cos(rollZ), sz = Math.sin(rollZ);

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

    const NOISE_IS_ZERO = NOISE < 1e-6;
    let raf = 0;
    const t0 = performance.now();

    const startRAF = () => {
      if (raf) return;
      raf = requestAnimationFrame(render);
    };

    const stopRAF = () => {
      if (!raf) return;
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const rnd = () => Math.random();
    const wX = (0.3 + rnd() * 0.6) * RSX;
    const wY = (0.2 + rnd() * 0.7) * RSY;
    const wZ = (0.1 + rnd() * 0.5) * RSZ;
    const phX = rnd() * Math.PI * 2;
    const phZ = rnd() * Math.PI * 2;

    let yaw = 0, pitch = 0, roll = 0;
    let targetYaw = 0, targetPitch = 0;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const pointer = { x: 0, y: 0, inside: true };

    const onMove = (e: PointerEvent) => {
      const ww = Math.max(1, window.innerWidth);
      const wh = Math.max(1, window.innerHeight);
      const cx = ww * 0.5;
      const cy = wh * 0.5;
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
      onPointerMove = (e: PointerEvent) => {
        onMove(e);
        startRAF();
      };
      window.addEventListener('pointermove', onPointerMove, { passive: true });
      window.addEventListener('mouseleave', onLeave);
      window.addEventListener('blur', onBlur);
      program.uniforms.uUseBaseWobble.value = 0;
    } else if (animationType === '3drotate') {
      program.uniforms.uUseBaseWobble.value = 0;
    } else if (animationType === 'static' || animationType === 'marquee') {
      program.uniforms.uUseBaseWobble.value = 0;
    } else {
      program.uniforms.uUseBaseWobble.value = 1;
    }

    const render = (t: number) => {
      const time = (t - t0) * 0.001;
      program.uniforms.iTime.value = time;
      // Update dynamic uniforms that might load async
      program.uniforms.uHasTexture.value = hasTexture;
      program.uniforms.uImgAspect.value = imgAspect;

      let continueRAF = true;

      if (animationType === 'hover') {
        const maxPitch = 0.6 * HOVSTR;
        const maxYaw = 0.6 * HOVSTR;
        targetYaw = (pointer.inside ? -pointer.x : 0) * maxYaw;
        targetPitch = (pointer.inside ? pointer.y : 0) * maxPitch;

        const prevYaw = yaw;
        const prevPitch = pitch;
        const prevRoll = roll;

        yaw = lerp(prevYaw, targetYaw, INERT);
        pitch = lerp(prevPitch, targetPitch, INERT);
        roll = lerp(prevRoll, 0, 0.1);

        program.uniforms.uRot.value = setMat3FromEuler(yaw, pitch, roll, rotBuf);

        if (NOISE_IS_ZERO) {
          const settled = Math.abs(yaw - targetYaw) < 1e-4 && Math.abs(pitch - targetPitch) < 1e-4 && Math.abs(roll) < 1e-4;
          if (settled) continueRAF = false;
        }
      } else if (animationType === '3drotate') {
        const tScaled = time * TS;
        yaw = tScaled * wY;
        pitch = Math.sin(tScaled * wX + phX) * 0.6;
        roll = Math.sin(tScaled * wZ + phZ) * 0.5;
        program.uniforms.uRot.value = setMat3FromEuler(yaw, pitch, roll, rotBuf);
        if (TS < 1e-6) continueRAF = false;
      } else {
        // Static & Marquee
        program.uniforms.uRot.value = setMat3FromEuler(ROT_Y, ROT_X, ROT_Z, rotBuf);
        if (animationType !== 'marquee' && TS < 1e-6) continueRAF = false;
      }

      renderer.render({ scene: mesh });
      if (continueRAF) {
        raf = requestAnimationFrame(render);
      } else {
        raf = 0;
      }
    };

    interface PrismContainer extends HTMLElement {
      __prismIO?: IntersectionObserver;
    }

    if (suspendWhenOffscreen) {
      const io = new IntersectionObserver(entries => {
        const vis = entries.some(e => e.isIntersecting);
        if (vis) startRAF();
        else stopRAF();
      });
      io.observe(container);
      startRAF();
      (container as PrismContainer).__prismIO = io;
    } else {
      startRAF();
    }

    return () => {
      stopRAF();
      ro.disconnect();
      if (animationType === 'hover') {
        if (onPointerMove) window.removeEventListener('pointermove', onPointerMove as EventListener);
        window.removeEventListener('mouseleave', onLeave);
        window.removeEventListener('blur', onBlur);
      }
      if (suspendWhenOffscreen) {
        const io = (container as PrismContainer).__prismIO as IntersectionObserver | undefined;
        if (io) io.disconnect();
        delete (container as PrismContainer).__prismIO;
      }
      if (gl.canvas.parentElement === container) container.removeChild(gl.canvas);
    };
  }, [
    height, baseWidth, animationType, shape, glow, noise, offset?.x, offset?.y, offset?.z,
    scale, transparent, hueShift, colorFrequency, timeScale, 
    hoverStrength, inertia, bloom, suspendWhenOffscreen,
    saturation, rainbow, density, opacity, rotation?.x, rotation?.y, rotation?.z,
    textureUrl, sizingMode, borderRadius, marqueeSpeed, marqueeDirection
  ]);

  return <div className={`w-full h-full relative overflow-hidden ${className}`} ref={containerRef} />;
};

export default PrismBackground;