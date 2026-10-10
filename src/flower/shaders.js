// Shaders for the Interactive Luminescent White Flora & Miniature Bioluminescent Fireflies
// Compact flower scale, smooth scroll alpha fade, and tiny twinkling fireflies

export const PETAL_VERT = /* glsl */ `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewDir;
    varying vec3 vWorldPos;
    uniform float uTime;
    uniform float uLayer;
    uniform float uSpring;
    uniform float uBloom; // 0.0 (closed bud curl) to 1.0 (bloomed chalice)

    void main() {
        vUv = uv;
        vec3 pos = position;

        // --- Horizontal curvature: wraps petal around Y axis into organic bowl shape ---
        float baseCurv = 1.6 - float(uLayer) * 0.20;
        float curvature = mix(baseCurv * 1.5, baseCurv, clamp(uBloom, 0.0, 1.0));
        pos.z += pos.x * pos.x * curvature;

        // --- Vertical curvature: tip curls inward when bud, outward gracefully when bloomed ---
        float tipCurl = mix(-0.25, 0.45, clamp(uBloom, 0.0, 1.0));
        pos.z += pow(clamp(vUv.y, 0.0, 1.0), 2.5) * tipCurl;

        // --- Spring interaction: pushes the top of petal outward on hover ---
        pos.z += clamp(uSpring, -0.6, 0.6) * smoothstep(0.1, 0.9, clamp(vUv.y, 0.0, 1.0));

        // --- Organic micro-sway ---
        pos.x += sin(uTime * 1.2 + pos.y * 2.0) * 0.016 * clamp(vUv.y, 0.0, 1.0);

        // Dynamically compute normal vector for curved surface safely
        vec3 norm = normal;
        norm.x -= 2.0 * curvature * pos.x;
        norm.z -= tipCurl * pow(clamp(vUv.y, 0.0, 1.0), 1.5) * 1.5;
        float normLen = length(norm);
        norm = normLen > 0.0001 ? (norm / normLen) : normal;

        vec4 worldPos = modelMatrix * vec4(pos, 1.0);
        vWorldPos = worldPos.xyz;
        
        vec3 worldNorm = normalize(normalMatrix * norm);
        vNormal = worldNorm;
        vViewDir = normalize(cameraPosition - worldPos.xyz);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
`;

export const PETAL_FRAG = /* glsl */ `
    uniform vec3 uColor;
    uniform vec3 uInnerColor;
    uniform float uTime;
    uniform float uLayer;
    uniform float uDepthFactor; // 1.0 = near, 0.55 = far horizon
    uniform float uGlobalAlpha; // Smooth scroll fade in/out
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewDir;
    varying vec3 vWorldPos;

    // Symmetrical Botanical Petal SDF (smooth organic teardrop/lotus petal)
    float petalSDF(vec2 p) {
        p.x = abs(p.x);
        float d = length(p - vec2(-0.48, 0.42)) - 0.68;
        if (p.y > 0.82) {
            float excess = p.y - 0.82;
            d += excess * 1.6;
        }
        return d;
    }

    // Value noise
    float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }
    
    float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(
            mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
            mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
            u.y
        );
    }
    
    float fbm(vec2 p) {
        float v = 0.0, a = 0.5;
        for (int i = 0; i < 4; i++) {
            v += a * noise(p);
            p *= 2.0;
            a *= 0.5;
        }
        return v;
    }

    void main() {
        // SDF silhouette clipping
        float d = petalSDF(vUv - vec2(0.5, 0.0));
        if (d > 0.0) discard;

        // Domain-warped FBM veins radiating from petal base
        vec2 fromBase = vUv - vec2(0.5, 0.0);
        float r = length(fromBase);
        float theta = atan(fromBase.y, fromBase.x);
        vec2 polar = vec2(theta * 8.0, r * 6.0);
        float vein = fbm(polar + 0.5 * fbm(polar * 1.5));
        vein = pow(clamp(vein, 0.0, 1.0), 2.0) * 0.35;

        // Fresnel and X-Ray rim lighting with strict safe clamping
        float dotNV = clamp(dot(vNormal, vViewDir), -1.0, 1.0);
        float fresnel = pow(clamp(1.0 - abs(dotNV), 0.0, 1.0), 2.2);
        float xray = clamp(1.0 - abs(dotNV), 0.0, 1.0) * 0.85;

        // Silky luminescent white gradient
        vec3 baseLunar = vec3(0.85, 0.90, 0.97);
        vec3 tipPure = vec3(1.0, 1.0, 1.0);
        vec3 col = mix(baseLunar, tipPure, pow(clamp(vUv.y, 0.0, 1.0), 0.65));

        // Delicate vein luminescence
        col += vein * vec3(0.12, 0.15, 0.18);

        // Pearlescent Fresnel rim glow
        col += fresnel * vec3(0.35, 0.40, 0.45);

        // Atmospheric depth softening for distant flowers
        col = mix(vec3(0.04, 0.06, 0.08), col, clamp(uDepthFactor, 0.0, 1.0));

        // Translucent frosted silk opacity:
        float centerAlpha = mix(0.12, 0.28, pow(clamp(vUv.y, 0.0, 1.0), 0.8));
        float alpha = (centerAlpha + fresnel * 0.70 + xray * 0.25);
        alpha *= smoothstep(0.0, -0.035, d); // Silky antialiased edge
        alpha *= smoothstep(-0.01, 0.04, vUv.y); // Firm anchor at stem base
        alpha *= clamp(uDepthFactor, 0.0, 1.0); // Subtle depth falloff
        alpha *= clamp(uGlobalAlpha, 0.0, 1.0); // Smooth scroll fade

        gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0));
    }
`;

export const STEM_VERT = /* glsl */ `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewDir;
    varying float vY;
    varying float vProg;
    uniform float uTime;
    uniform float uGrowth;

    void main() {
        vUv = uv;
        vProg = uv.x; // along tube length from 0.0 (base) to 1.0 (tip)
        vec3 pos = position;
        
        // Organic wind sway matching FlowerGroup JS math exactly
        float sway = sin(uTime * 0.8 + pos.y * 0.5) * 0.12;
        float swayZ = cos(uTime * 0.6 + pos.y * 0.4) * 0.08;
        
        float influence = smoothstep(-5.0, 0.2, pos.y);
        pos.x += sway * influence;
        pos.z += swayZ * influence;

        vY = pos.y;
        vec4 worldPos = modelMatrix * vec4(pos, 1.0);
        vNormal = normalize(normalMatrix * normal);
        vViewDir = normalize(cameraPosition - worldPos.xyz);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
`;

export const STEM_FRAG = /* glsl */ `
    uniform vec3 uColor;
    uniform float uGrowth;
    uniform float uDepthFactor;
    uniform float uGlobalAlpha;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewDir;
    varying float vY;
    varying float vProg;

    void main() {
        // Discard any segment beyond current growth progress
        if (vProg > uGrowth) discard;
        
        // Edge Fresnel for prominent stem visibility with strict clamping
        float dotNV = clamp(dot(vNormal, vViewDir), -1.0, 1.0);
        float fresnel = pow(clamp(1.0 - abs(dotNV), 0.0, 1.0), 1.8);
        
        // Cylindrical light shading
        float light = clamp(dot(vNormal, normalize(vec3(0.6, 1.0, 0.8))) * 0.5 + 0.5, 0.0, 1.0);
        
        // Deep emerald jade stem base
        vec3 baseStem = uColor * (light * 1.5 + 0.35);
        // Silvery-green rim light
        vec3 rimHighlight = vec3(0.28, 0.60, 0.45) * fresnel * 1.4;
        
        // Glowing tip highlight as it shoots upwards
        float tipDist = uGrowth - vProg;
        float tipGlow = smoothstep(0.04, 0.0, tipDist);
        vec3 tipHighlight = vec3(0.55, 0.90, 0.70) * tipGlow * 1.2;
        
        vec3 col = baseStem + rimHighlight + tipHighlight;
        col = mix(vec3(0.02, 0.04, 0.03), col, clamp(uDepthFactor, 0.0, 1.0));
        
        float alpha = (0.85 + fresnel * 0.15) * clamp(uDepthFactor, 0.0, 1.0) * clamp(uGlobalAlpha, 0.0, 1.0);
        
        gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0));
    }
`;

// =========================================================================
// MINIATURE BIOLUMINESCENT FIREFLIES (Kunang-Kunang Mungil Bercahaya Hangat)
// =========================================================================

export const FIREFLY_VERT = /* glsl */ `
    uniform float uTime;
    attribute float aSize;
    attribute float aSpeed;
    attribute vec3 aOffset;
    attribute float aBlinkSpeed;
    varying float vAlpha;
    varying float vIntensity;

    void main() {
        vec3 pos = position;
        
        // Organic wandering 3D flight paths
        float t = uTime * aSpeed;
        pos.y += sin(t * 1.1 + aOffset.y) * 0.50 + cos(t * 0.5 + aOffset.z) * 0.30;
        pos.x += cos(t * 0.8 + aOffset.x) * 0.60 + sin(t * 0.3 + aOffset.y) * 0.30;
        pos.z += sin(t * 0.6 + aOffset.z) * 0.45 + cos(t * 0.9 + aOffset.x) * 0.25;

        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        
        // Miniature pinpoint firefly size with safe depth denominator
        float zDist = max(0.1, -mvPosition.z);
        gl_PointSize = clamp(aSize * (30.0 / zDist), 1.8, 16.0);
        
        // Realistic intermittent firefly blinking pulsation
        float blink = sin(uTime * aBlinkSpeed + aOffset.x * 3.14);
        blink = pow(clamp(max(0.0, blink), 0.0, 1.0), 2.2);
        float ambient = 0.30;
        vIntensity = ambient + blink * 0.85;

        // Depth alpha falloff
        vAlpha = smoothstep(22.0, 1.0, zDist) * 0.95;
    }
`;

export const FIREFLY_FRAG = /* glsl */ `
    uniform vec3 uCoreColor;
    uniform vec3 uHaloColor;
    uniform float uGlobalAlpha;
    varying float vAlpha;
    varying float vIntensity;

    void main() {
        vec2 coord = gl_PointCoord - vec2(0.5);
        float dist = length(coord);
        if (dist > 0.5) discard;
        
        // Crisp miniature glowing profile: sharp glowing core + fine halo
        float core = smoothstep(0.18, 0.0, dist);
        float halo = smoothstep(0.48, 0.0, dist);
        halo = pow(clamp(halo, 0.0, 1.0), 2.0);
        
        // Warm golden core (#fff9c4) blending into magical chartreuse-lime halo (#d4e157)
        vec3 col = mix(uHaloColor, uCoreColor, core);
        
        float alpha = halo * vIntensity * vAlpha * clamp(uGlobalAlpha, 0.0, 1.0);
        
        gl_FragColor = vec4(col * (2.2 + vIntensity * 1.5), clamp(alpha, 0.0, 1.0));
    }
`;



