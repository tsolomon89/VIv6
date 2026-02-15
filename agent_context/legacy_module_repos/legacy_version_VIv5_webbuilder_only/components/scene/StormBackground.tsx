
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { trackContext, trackRaf } from '../../utils/performance';

interface StormProps {
    variant?: 'atmosphere' | 'lightning';
    hue?: number;
    intensity?: number;
    strikeIntensity?: number;
    frequency?: number;
    speed?: number;
    cloudiness?: number;
    boltWidth?: number;
    zigzag?: number;
    saturation?: number;
    diagonal?: number;
    depth?: number;
    cloudScale?: number;
    flashDuration?: number;
    boltDuration?: number;
    boltGlow?: number;
    suspendWhenOffscreen?: boolean;
    className?: string;
}

export const StormBackground: React.FC<StormProps> = ({ 
    variant = 'atmosphere',
    hue = 220, 
    intensity = 1.5,
    strikeIntensity = 1.0,
    frequency = 1.0,
    speed = 1.0,
    cloudiness = 0.5,
    boltWidth = 1.0,
    zigzag = 1.0,
    saturation = 0.6,
    diagonal = 0.0,
    depth = 0.0,
    cloudScale = 1.0,
    flashDuration = 1.0,
    boltDuration = 0.5,
    boltGlow = 1.0,
    suspendWhenOffscreen = false,
    className = "" 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const uniformsRef = useRef<{ 
      uMode: { value: number },
      uHue: { value: number }, 
      uIntensity: { value: number },
      uStrikeIntensity: { value: number },
      uFrequency: { value: number },
      uSpeed: { value: number },
      uCloudiness: { value: number },
      uBoltWidth: { value: number },
      uZigzag: { value: number },
      uSaturation: { value: number },
      uDiagonal: { value: number },
      uDepth: { value: number },
      uCloudScale: { value: number },
      uFlashDuration: { value: number },
      uBoltDuration: { value: number },
      uBoltGlow: { value: number }
  } | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Track Context
    trackContext(1);

    const width = window.innerWidth;
    const height = window.innerHeight;
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    camera.position.z = 1;

    const renderer = new THREE.WebGLRenderer({ 
      antialias: false, 
      powerPreference: "high-performance",
      depth: false,
      stencil: false,
      alpha: true 
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    if ((THREE as any).NoToneMapping) {
      renderer.toneMapping = (THREE as any).NoToneMapping;
    }

    mountRef.current.appendChild(renderer.domElement);

    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      uniform float uTime;
      uniform vec2 uResolution;
      uniform int uMode; // 0=Atmosphere, 1=Lightning
      uniform float uHue;
      uniform float uIntensity;
      uniform float uStrikeIntensity;
      uniform float uFrequency;
      uniform float uSpeed;
      uniform float uCloudiness;
      uniform float uBoltWidth;
      uniform float uZigzag;
      uniform float uSaturation;
      uniform float uDiagonal;
      uniform float uDepth;
      uniform float uCloudScale;
      uniform float uFlashDuration;
      uniform float uBoltDuration;
      uniform float uBoltGlow;
      varying vec2 vUv;

      vec3 hsv2rgb(vec3 c) {
          vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0,4.0,2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
          return c.z * mix(vec3(1.0), rgb, c.y);
      }
      float hash11(float p) {
          p = fract(p * .1031);
          p *= p + 33.33;
          p *= p + p;
          return fract(p);
      }
      float hash12(vec2 p) {
          vec3 p3 = fract(vec3(p.xyx) * .1031);
          p3 += dot(p3, p3.yzx + 33.33);
          return fract((p3.x + p3.y) * p3.z);
      }
      float noise(vec2 p) {
          vec2 ip = floor(p);
          vec2 fp = fract(p);
          vec2 t = smoothstep(0.0, 1.0, fp);
          float a = hash12(ip);
          float b = hash12(ip + vec2(1.0, 0.0));
          float c = hash12(ip + vec2(0.0, 1.0));
          float d = hash12(ip + vec2(1.0, 1.0));
          return mix(mix(a, b, t.x), mix(c, d, t.x), t.y);
      }
      mat2 rotate2d(float theta) {
          float c = cos(theta);
          float s = sin(theta);
          return mat2(c, -s, s, c);
      }
      #define OCTAVE_COUNT 6
      float fbm(vec2 p) {
          float value = 0.0;
          float amplitude = 0.5;
          for (int i = 0; i < OCTAVE_COUNT; ++i) {
              value += amplitude * noise(p);
              p *= rotate2d(0.45);
              p *= 2.0;
              amplitude *= 0.5;
          }
          return value;
      }
      float fbmLightning(vec2 p) {
          float value = 0.0;
          float amplitude = 0.5;
          for (int i = 0; i < 5; ++i) {
              value += amplitude * noise(p);
              p *= 2.2;
              amplitude *= 0.5;
          }
          return value;
      }
      void main() {
          vec2 uv = vUv;
          uv.x *= uResolution.x / uResolution.y;
          vec3 finalColor = vec3(0.0);
          float finalAlpha = 0.0;

          if (uMode == 0) {
              vec2 cloudUV = uv * max(0.1, uCloudScale);
              float speed = uSpeed * 0.1;
              vec2 q = vec2(0.);
              q.x = fbm(cloudUV + speed * uTime);
              q.y = fbm(cloudUV + vec2(1.0));
              vec2 r = vec2(0.);
              r.x = fbm(cloudUV + 1.0 * q + vec2(1.7, 9.2) + 1.5 * speed * uTime);
              r.y = fbm(cloudUV + 1.0 * q + vec2(8.3, 2.8) + 1.26 * speed * uTime);
              float cloudDensity = fbm(cloudUV + r);
              float densityShift = (uCloudiness - 0.5) * 0.8; 
              float effectiveDensity = clamp(cloudDensity + densityShift, 0.0, 1.0);
              vec3 bgDark = vec3(0.08, 0.1, 0.15); 
              vec3 bgLight = vec3(0.2, 0.25, 0.35); 
              if (uCloudiness > 0.7) bgLight = mix(bgLight, vec3(0.4, 0.45, 0.55), (uCloudiness - 0.7) * 3.3);
              vec3 cloudColor = mix(bgDark, bgLight, smoothstep(0.0, 1.0, effectiveDensity));
              finalColor = cloudColor;
              finalAlpha = 1.0; 
          }
          if (uMode == 1) {
              float windowDuration = 3.5 / max(0.1, uFrequency);
              float timeSlot = floor(uTime / windowDuration);
              float localTime = mod(uTime, windowDuration);
              float seed = timeSlot * 43.21; 
              float depthRnd = hash11(seed + 123.4); 
              float depthFactor = mix(1.0, 0.2, depthRnd * uDepth); 
              float startDelay = hash11(seed) * (windowDuration * 0.4); 
              float dt = localTime - startDelay;
              float hasStrike = step(0.3, hash11(seed + 1.0));
              float boltLimit = max(0.05, uBoltDuration);
              float boltAlpha = smoothstep(0.0, 0.1, dt) * smoothstep(boltLimit, boltLimit - 0.2, dt);
              float decay = 3.0 / max(0.1, uFlashDuration);
              float flashAlpha = smoothstep(0.0, 0.05, dt) * exp(-dt * decay);
              boltAlpha = max(0.0, boltAlpha) * hasStrike;
              flashAlpha = max(0.0, flashAlpha) * hasStrike;
              vec2 boltUV = uv;
              boltUV.x += (boltUV.y - 0.5) * uDiagonal;
              float boltX = (hash11(seed + 2.0) - 0.5) * 2.0; 
              boltUV.x -= boltX;
              float distortion = fbmLightning(vec2(boltUV.y * 2.5, seed)); 
              distortion += fbmLightning(vec2(boltUV.y * 8.0, seed + 1.0)) * 0.2; 
              boltUV.x += (distortion - 0.5) * 0.6 * uZigzag; 
              float dist = abs(boltUV.x);
              float boltIntensity = (0.0025 * uBoltWidth * uBoltGlow * depthFactor) / max(dist, 0.0001); 
              boltIntensity *= uIntensity * depthFactor;
              vec3 boltColor = hsv2rgb(vec3(uHue / 360.0, uSaturation, 1.0));
              vec3 lightningColor = boltColor * boltIntensity * boltAlpha;
              lightningColor += vec3(1.0) * flashAlpha * 0.15 * uStrikeIntensity * depthFactor;
              float maxComp = max(lightningColor.r, max(lightningColor.g, lightningColor.b));
              finalAlpha = clamp(maxComp, 0.0, 1.0);
              finalColor = lightningColor;
          }
          gl_FragColor = vec4(finalColor, finalAlpha);
      }
    `;

    const uniforms = {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(width, height) },
      uMode: { value: variant === 'lightning' ? 1 : 0 },
      uHue: { value: hue },
      uIntensity: { value: intensity },
      uStrikeIntensity: { value: strikeIntensity },
      uFrequency: { value: frequency },
      uSpeed: { value: speed },
      uCloudiness: { value: cloudiness },
      uBoltWidth: { value: boltWidth },
      uZigzag: { value: zigzag },
      uSaturation: { value: saturation },
      uDiagonal: { value: diagonal },
      uDepth: { value: depth },
      uCloudScale: { value: cloudScale },
      uFlashDuration: { value: flashDuration },
      uBoltDuration: { value: boltDuration },
      uBoltGlow: { value: boltGlow }
    };
    
    uniformsRef.current = uniforms;

    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: variant === 'lightning' ? THREE.AdditiveBlending : THREE.NormalBlending
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const clock = new THREE.Clock();
    let animationId: number = 0;

    const animate = () => {
      uniforms.uTime.value = clock.getElapsedTime();
      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };
    
    const startAnimation = () => {
        if (animationId) return;
        animate();
        trackRaf(1);
    };
    
    const stopAnimation = () => {
        if (!animationId) return;
        cancelAnimationFrame(animationId);
        animationId = 0;
        trackRaf(-1);
    };

    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h);
      uniforms.uResolution.value.set(w, h);
    };

    window.addEventListener('resize', handleResize);
    
    // Visibility Logic
    let io: IntersectionObserver | undefined;
    if (suspendWhenOffscreen && mountRef.current) {
        io = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) startAnimation();
            else stopAnimation();
        });
        io.observe(mountRef.current);
        startAnimation(); // Initial
    } else {
        startAnimation();
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      stopAnimation();
      io?.disconnect();
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      trackContext(-1);
    };
  }, [variant]); // Re-init on variant change

  useEffect(() => {
    if (uniformsRef.current) {
        uniformsRef.current.uMode.value = variant === 'lightning' ? 1 : 0;
        uniformsRef.current.uHue.value = hue;
        uniformsRef.current.uIntensity.value = intensity;
        uniformsRef.current.uStrikeIntensity.value = strikeIntensity;
        uniformsRef.current.uFrequency.value = frequency;
        uniformsRef.current.uSpeed.value = speed;
        uniformsRef.current.uCloudiness.value = cloudiness;
        uniformsRef.current.uBoltWidth.value = boltWidth;
        uniformsRef.current.uZigzag.value = zigzag;
        uniformsRef.current.uSaturation.value = saturation;
        uniformsRef.current.uDiagonal.value = diagonal;
        uniformsRef.current.uDepth.value = depth;
        uniformsRef.current.uCloudScale.value = cloudScale;
        uniformsRef.current.uFlashDuration.value = flashDuration;
        uniformsRef.current.uBoltDuration.value = boltDuration;
        uniformsRef.current.uBoltGlow.value = boltGlow;
    }
  }, [
    variant, hue, intensity, strikeIntensity, frequency, speed, cloudiness, 
    boltWidth, zigzag, saturation, diagonal, depth, 
    cloudScale, flashDuration, boltDuration, boltGlow
  ]);

  return <div ref={mountRef} className={`absolute inset-0 pointer-events-none ${className}`} />;
};
