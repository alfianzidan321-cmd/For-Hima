import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { FlowerGroup } from './FlowerGroup.js';
import { FIREFLY_VERT, FIREFLY_FRAG } from './shaders.js';

// Deterministic Pseudo-Random Generator (Mulberry32) for perfectly balanced organic scattering
function createSeededRandom(seed = 133742) {
  let s = seed >>> 0;
  return function() {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Naturally Scattered Wild 3D White Flora Meadow (58 flowers across continuous 3D volume)
// Poisson-dispersed organic scattering guaranteeing no horizontal rows or awkward clusters
function generateMeadowConfigs() {
  const rand = createSeededRandom(628491);
  const candidates = [];
  const targetCount = 56;
  let attempts = 0;

  while (candidates.length < targetCount && attempts < 1000) {
    attempts++;

    // Pure continuous depth distribution: -8.2 (deep horizon) to +2.6 (near foreground)
    const z = -8.2 + rand() * 10.8;
    const zNorm = (z - (-8.2)) / 10.8; // 0.0 (far) to 1.0 (near)

    // Wide lateral spread that covers the entire wide horizon
    const xSpread = THREE.MathUtils.lerp(10.8, 6.0, zNorm);
    const x = (rand() - 0.5) * 2.0 * xSpread;

    // Organic elevation: randomized terrain + strong natural height variance
    const yCenter = THREE.MathUtils.lerp(0.35, -0.72, zNorm);
    const y = yCenter + (rand() - 0.5) * 1.15;

    // Minimum distance check: prevent horizontal line alignment and overlapping heads
    let tooClose = false;
    for (const existing of candidates) {
      const dx = Math.abs(x - existing.position.x);
      const dz = Math.abs(z - existing.position.z);
      const dy = Math.abs(y - existing.position.y);
      // Ensure sufficient 3D spacing so no two flowers form an artificial horizontal row
      if (dx < 0.95 && dz < 1.35) {
        tooClose = true;
        break;
      }
      // Also prevent near-identical screen alignment
      if (dx < 0.65 && dy < 0.35 && dz < 2.5) {
        tooClose = true;
        break;
      }
    }
    if (tooClose) continue;

    // Stem height decoupled from depth (young short shoots vs tall mature blooms)
    const stemBase = THREE.MathUtils.lerp(2.8, 4.8, zNorm);
    const stemHeight = stemBase + (rand() - 0.5) * 1.6; // Range: 2.0 to 5.6

    // Scale proportional to 3D perspective depth with individual organic variance
    const baseScale = THREE.MathUtils.lerp(0.17, 0.75, zNorm) + (rand() - 0.5) * 0.10;
    const scale = Math.max(0.15, Math.min(0.80, baseScale));

    // Dynamic 3D posture: organic stem curve, 3D ground tilt, and yaw
    const curveCurvX = (rand() - 0.5) * 0.46;
    const curveCurvZ = (rand() - 0.5) * 0.38;
    const leanX = (rand() - 0.5) * 0.28;
    const leanZ = (rand() - 0.5) * 0.30;
    const rotationY = rand() * Math.PI * 2;

    // Growth delay mapped to depth (tightened for synchronous emergence with rising lyrics)
    const growthDelay = Math.max(0.005, (1.0 - zNorm) * 0.05 + (rand() - 0.5) * 0.02);

    // Petal count: 6 for distant stars, 7-9 for foreground
    const petalCount = zNorm < 0.25 ? 6 : (zNorm < 0.60 ? 7 : (rand() > 0.45 ? 8 : 9));

    candidates.push({
      position: new THREE.Vector3(x, y, z),
      scale,
      stemHeight,
      curveCurvX,
      curveCurvZ,
      leanX,
      leanZ,
      rotationY,
      growthDelay,
      windPhase: rand() * Math.PI * 2,
      petalCount
    });
  }

  // Add 3 companion twin blooms leaning in natural opposite directions
  const clusterPairs = [
    { targetIdx: 6, offset: new THREE.Vector3(0.65, -0.15, 0.40), leanOffset: 0.20 },
    { targetIdx: 18, offset: new THREE.Vector3(-0.70, 0.18, -0.45), leanOffset: -0.22 },
    { targetIdx: 32, offset: new THREE.Vector3(0.75, 0.10, 0.35), leanOffset: 0.18 }
  ];

  clusterPairs.forEach((cp) => {
    if (candidates[cp.targetIdx]) {
      const parent = candidates[cp.targetIdx];
      candidates.push({
        position: parent.position.clone().add(cp.offset),
        scale: parent.scale * 0.82,
        stemHeight: parent.stemHeight * 0.85,
        curveCurvX: -parent.curveCurvX * 0.9,
        curveCurvZ: -parent.curveCurvZ * 0.8,
        leanX: parent.leanX + cp.leanOffset,
        leanZ: parent.leanZ - cp.leanOffset,
        rotationY: parent.rotationY + Math.PI * 0.75,
        growthDelay: parent.growthDelay + 0.02,
        windPhase: parent.windPhase + 1.4,
        petalCount: Math.max(6, parent.petalCount - 1)
      });
    }
  });

  // Sort by depth for clean alpha rendering
  candidates.sort((a, b) => a.position.z - b.position.z);
  return candidates;
}

const FLOWER_CONFIGS = generateMeadowConfigs();


export class FlowerEngine {
  constructor(container) {
    this.container = container;
    this.clock = new THREE.Clock();
    this.rafId = 0;

    // Mouse coords normalized [-1, 1]
    this.mouse = new THREE.Vector2(-99, -99);
    this.mouseSmooth = new THREE.Vector2(0, 0);
    this.isMouseActive = false;
    this.raycaster = new THREE.Raycaster();

    // Scroll targets
    this.scrollProgress = 0.0;
    this.targetGrowth = 0.0;
    this.currentGrowth = 0.0;
    this.targetBloom = 0.0;
    this.currentBloom = 0.0;

    // 1. Scene & Camera (Framed so flowers strictly sit in lower <45% of the viewport)
    this.scene = new THREE.Scene();
    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(38, w / h, 0.1, 100);
    this.camera.position.set(0, 2.8, 10.2);

    // 2. WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    THREE.ColorManagement.enabled = true;
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.setClearColor(0x000000, 1);
    this.scene.background = new THREE.Color(0x000000);
    container.appendChild(this.renderer.domElement);

    // 3. UnrealBloomPass: warm bioluminescent aura for fireflies and moonlight petals
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(w, h),
      0.18, // warm halo
      0.55, // radius
      0.68  // threshold
    );
    this.composer.addPass(this.bloomPass);

    // 4. Miniature Bioluminescent Golden Fireflies (Kunang-Kunang Kecil)
    this.initFireflies();

    // 5. Instantiate Naturally Scattered Flowers across 3D Depths
    this.flowers = FLOWER_CONFIGS.map((cfg) => {
      return new FlowerGroup(this.scene, cfg);
    });

    // 6. Event Handlers
    this._onResize = this._onResize.bind(this);
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onTouchMove = this._onTouchMove.bind(this);
    this._onMouseLeave = this._onMouseLeave.bind(this);

    this.resizeObserver = new ResizeObserver(() => this._onResize());
    this.resizeObserver.observe(container);

    window.addEventListener('mousemove', this._onMouseMove, { passive: true });
    window.addEventListener('touchmove', this._onTouchMove, { passive: true });
    window.addEventListener('mouseleave', this._onMouseLeave, { passive: true });
    window.addEventListener('touchend', this._onMouseLeave, { passive: true });

    // Initial state: 0% scroll -> underground & completely dormant
    this.setScrollProgress(0);

    // Warm up GPU: pre-compile all materials, geometries and bloom shaders to prevent initial scroll lag
    this.warmUpGPU();
  }

  warmUpGPU() {
    // Briefly bloom to force WebGL shader compilation for all meshes and postprocessing passes
    const fLen = this.flowers.length;
    for (let i = 0; i < fLen; i++) {
      this.flowers[i].setGrowthAndBloom(0.5, 0.5);
    }
    this.renderer.compile(this.scene, this.camera);
    this.composer.render();

    // Reset back to initial hidden dormant state
    this.setScrollProgress(0);
    for (let i = 0; i < fLen; i++) {
      this.flowers[i].setGrowthAndBloom(0, 0);
    }
    this.composer.render();
  }

  initFireflies() {
    const fireflyCount = 320;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(fireflyCount * 3);
    const sizes = new Float32Array(fireflyCount);
    const speeds = new Float32Array(fireflyCount);
    const offsets = new Float32Array(fireflyCount * 3);
    const blinkSpeeds = new Float32Array(fireflyCount);

    for (let i = 0; i < fireflyCount; i++) {
      // Wandering across full width and rising into the open night sky
      positions[i * 3 + 0] = (Math.random() - 0.5) * 26.0;
      positions[i * 3 + 1] = -0.5 + Math.random() * 10.0; // Spread from ground up into vast night sky
      positions[i * 3 + 2] = -7.5 + Math.random() * 12.0;

      // Miniature pinpoint size (fine, subtle glowing firefly sparkles)
      sizes[i] = 0.40 + Math.random() * 0.55;
      speeds[i] = 0.20 + Math.random() * 0.55;

      offsets[i * 3 + 0] = Math.random() * 20;
      offsets[i * 3 + 1] = Math.random() * 20;
      offsets[i * 3 + 2] = Math.random() * 20;

      // Realistic firefly blinking frequency: 1.4 - 3.8 Hz
      blinkSpeeds[i] = 1.4 + Math.random() * 2.4;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1));
    geo.setAttribute('aOffset', new THREE.BufferAttribute(offsets, 3));
    geo.setAttribute('aBlinkSpeed', new THREE.BufferAttribute(blinkSpeeds, 1));


    this.fireflyMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uGlobalAlpha: { value: 0.0 },
        uCoreColor: { value: new THREE.Color('#fff9c4') }, // Warm golden core
        uHaloColor: { value: new THREE.Color('#d4e157') }  // Bioluminescent chartreuse-lime halo
      },
      vertexShader: FIREFLY_VERT,
      fragmentShader: FIREFLY_FRAG,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.fireflies = new THREE.Points(geo, this.fireflyMat);
    this.scene.add(this.fireflies);
  }

  _onResize() {
    const w = this.container.clientWidth || window.innerWidth;
    const h = this.container.clientHeight || window.innerHeight;
    if (w === 0 || h === 0) return;

    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.composer.setSize(w, h);
    this.bloomPass.resolution.set(w, h);
  }

  _onMouseMove(e) {
    this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    this.isMouseActive = true;
  }

  _onTouchMove(e) {
    if (e.touches && e.touches.length > 0) {
      const touch = e.touches[0];
      this.mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;
      this.isMouseActive = true;
    }
  }

  _onMouseLeave() {
    this.mouse.set(-99, -99);
    this.isMouseActive = false;
  }

  setGrowthAndBloomProgress(growth, bloom) {
    this.targetGrowth = Math.max(0, Math.min(1, growth));
    this.targetBloom = Math.max(0, Math.min(1, bloom));
    this.scrollProgress = growth * 0.35 + bloom * 0.65;
  }

  setScrollProgress(progress) {
    this.scrollProgress = Math.max(0, Math.min(1, progress));

    // Silk-smooth continuous emergence curve
    if (this.scrollProgress < 0.02) {
      this.targetGrowth = 0.0;
      this.targetBloom = 0.0;
    } else {
      const gNorm = Math.max(0, Math.min(1, (this.scrollProgress - 0.02) / 0.70));
      this.targetGrowth = gNorm * gNorm * (3.0 - 2.0 * gNorm);

      const bNorm = Math.max(0, Math.min(1, (this.scrollProgress - 0.20) / 0.75));
      this.targetBloom = bNorm * bNorm * (3.0 - 2.0 * bNorm);
    }
  }

  start() {
    this._isDormant = false;

    const tick = () => {
      this.rafId = requestAnimationFrame(tick);

      // Sleep heavy Three.js bloom post-processing & raycasting when dormant at page top
      if (this.currentGrowth <= 0.001 && this.targetGrowth === 0) {
        if (!this._isDormant) {
          this.renderer.clear();
          this._isDormant = true;
        }
        return;
      }
      this._isDormant = false;

      const t = this.clock.getElapsedTime();

      // 1. Silk-smooth synchronous interpolation tracking scroll in real time
      const lerpSpeed = 0.24;
      this.currentGrowth += (this.targetGrowth - this.currentGrowth) * lerpSpeed;
      this.currentBloom += (this.targetBloom - this.currentBloom) * lerpSpeed;

      // Update all flowers across depths
      const fLen = this.flowers.length;
      for (let i = 0; i < fLen; i++) {
        this.flowers[i].setGrowthAndBloom(this.currentGrowth, this.currentBloom);
      }

      // 2. Camera breathing + 3D mouse parallax
      const canInteract = this.isMouseActive && this.currentGrowth > 0.05;
      if (canInteract) {
        this.mouseSmooth.x += (this.mouse.x - this.mouseSmooth.x) * 0.05;
        this.mouseSmooth.y += (this.mouse.y - this.mouseSmooth.y) * 0.05;
        this.raycaster.setFromCamera(this.mouse, this.camera);
      } else {
        this.mouseSmooth.x += (0 - this.mouseSmooth.x) * 0.03;
        this.mouseSmooth.y += (0 - this.mouseSmooth.y) * 0.03;
      }

      const baseCamX = Math.sin(t * 0.10) * 0.28;
      const baseCamY = 2.8 + Math.sin(t * 0.07) * 0.12;

      // 3D Parallax: framing keeps flowers strictly in lower <45% of the screen
      this.camera.position.x = baseCamX + this.mouseSmooth.x * 0.75;
      this.camera.position.y = baseCamY + this.mouseSmooth.y * 0.35;
      this.camera.position.z = 10.2;
      this.camera.lookAt(0, 1.4, 0);

      // 3. Animate each flower with spring hover physics (only raycast if active)
      for (let i = 0; i < fLen; i++) {
        this.flowers[i].animate(t, canInteract ? this.raycaster : null);
      }

      // 4. Firefly flight, blinking & synchronized emergence animation
      if (this.fireflyMat && this.fireflyMat.uniforms) {
        this.fireflyMat.uniforms.uTime.value = t;
        // Fireflies gently awaken as flowers start growing
        const fAlpha = THREE.MathUtils.smoothstep(this.currentGrowth, 0.02, 0.22);
        this.fireflyMat.uniforms.uGlobalAlpha.value = fAlpha;
      }

      // 5. Render frame
      this.composer.render();
    };

    this.rafId = requestAnimationFrame(tick);
  }

  dispose() {
    cancelAnimationFrame(this.rafId);
    this.resizeObserver.disconnect();
    window.removeEventListener('mousemove', this._onMouseMove);
    window.removeEventListener('touchmove', this._onTouchMove);
    window.removeEventListener('mouseleave', this._onMouseLeave);
    window.removeEventListener('touchend', this._onMouseLeave);

    this.renderer.dispose();
    this.flowers.forEach((f) => f.dispose());
    if (this.fireflies) {
      this.fireflies.geometry.dispose();
      this.fireflyMat.dispose();
    }
    if (this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}
