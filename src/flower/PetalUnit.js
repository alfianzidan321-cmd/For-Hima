import * as THREE from 'three';
import { PETAL_VERT, PETAL_FRAG } from './shaders.js';

export class PetalUnit {
  constructor(parent, yawAngle, tiltRad, scale, layer, params) {
    this.layer = layer;
    this.scale = scale;
    this.fullTilt = tiltRad; // Target chalice tilt (radians)
    // Closed bud tilt: tightly packed upright cone
    this.budTilt = (3.0 + layer * 2.0) * (Math.PI / 180);
    this.baseYaw = yawAngle;
    this.phase = Math.random() * Math.PI * 2;
    this.depthFactor = params.depthFactor ?? 1.0;

    // Spring physics states (Hooke's Law on two axes)
    this.springTilt = 0;
    this.springTwist = 0;
    this.velTilt = 0;
    this.velTwist = 0;
    
    this.springK = params.springK ?? 0.12;
    this.damping = params.damping ?? 0.86;
    this.maxPush = params.maxPush ?? 0.38;

    this.currentBloom = 0.0;
    this.userLengthMult = 1.0;

    // --- PIVOT at flower center (0, 0, 0) ---
    this.pivot = new THREE.Group();
    this.pivot.position.set(0, 0, 0);
    this.pivot.rotation.order = 'YXZ';
    this.pivot.rotation.y = yawAngle;
    this.pivot.rotation.x = -this.budTilt; // Starts at closed bud tilt
    parent.add(this.pivot);

    // --- PETAL GEOMETRY (Compact, delicate lotus proportions) ---
    const petalWidth = 0.85 * scale;
    this.petalHeight = 2.30 * scale;
    const geo = new THREE.PlaneGeometry(petalWidth, this.petalHeight, 20, 36);
    // Base anchored at y = 0
    geo.translate(0, this.petalHeight / 2, 0);

    this.tipLocal = new THREE.Vector3(0, this.petalHeight, 0);

    // NormalBlending for translucent layered depth
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(params.petalColor || '#ffffff') },
        uInnerColor: { value: new THREE.Color(params.innerGlowColor || '#e2e8f0') },
        uTime: { value: 0 },
        uLayer: { value: layer },
        uSpring: { value: 0 },
        uBloom: { value: 0.0 },
        uDepthFactor: { value: this.depthFactor },
        uGlobalAlpha: { value: 0.0 }
      },
      vertexShader: PETAL_VERT,
      fragmentShader: PETAL_FRAG,
      transparent: true,
      side: THREE.DoubleSide,
      blending: THREE.NormalBlending,
      depthWrite: false
    });

    this.mesh = new THREE.Mesh(geo, this.material);
    this.pivot.add(this.mesh);

    this.updateLength(params.petalLength ?? 50);
  }

  updateLength(val) {
    this.userLengthMult = 0.5 + val / 100;
    this.applyScaleAndBloom(this.currentBloom);
  }

  setGlobalAlpha(alpha) {
    if (this.material && this.material.uniforms) {
      this.material.uniforms.uGlobalAlpha.value = alpha;
    }
  }

  applyScaleAndBloom(bloom) {
    this.currentBloom = Math.max(0, Math.min(1, bloom));

    // Staggered botanical bloom: outer layer peels back first
    const layerDelay = (3 - this.layer) * 0.14;
    const rawLayerBloom = Math.max(0, Math.min(1, (this.currentBloom - layerDelay) / 0.58));
    const eased = rawLayerBloom * rawLayerBloom * (3 - 2 * rawLayerBloom);

    // Interpolate tilt: from closed bud tilt to full blooming tilt
    this.currentTilt = THREE.MathUtils.lerp(this.budTilt, this.fullTilt, eased);

    // Petal scale expands gracefully from bud to full blossom
    const scaleFactor = THREE.MathUtils.lerp(0.78, 1.0, eased);
    this.mesh.scale.set(
      scaleFactor,
      scaleFactor * this.userLengthMult,
      scaleFactor
    );

    this.tipLocal.set(0, this.petalHeight * this.mesh.scale.y, 0);

    if (this.material && this.material.uniforms) {
      this.material.uniforms.uBloom.value = eased;
    }
  }

  animate(time, mouseWorld, bloom = 0.0) {
    this.applyScaleAndBloom(bloom);
    this.material.uniforms.uTime.value = time;

    // 1. Tip World Position
    const tipWorld = this.tipLocal.clone();
    this.mesh.localToWorld(tipWorld);

    // 2. Distance and directional push from mouse
    const dx = tipWorld.x - mouseWorld.x;
    const dy = tipWorld.y - mouseWorld.y;
    const dz = tipWorld.z - mouseWorld.z;
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

    const radiusSigma = THREE.MathUtils.lerp(2.5, 4.0, bloom);
    const influence = Math.exp(-(dist * dist) / radiusSigma);

    const pushX = dist > 0.01 ? dx / dist : 0;
    const pushY = dist > 0.01 ? dy / dist : 0;

    // 3. Spring physics (Hooke's Law with damping)
    const targetTilt = influence * pushY * this.maxPush;
    const targetTwist = influence * pushX * this.maxPush;

    this.velTilt += (targetTilt - this.springTilt) * this.springK;
    this.velTilt *= this.damping;
    this.springTilt += this.velTilt;

    this.velTwist += (targetTwist - this.springTwist) * this.springK;
    this.velTwist *= this.damping;
    this.springTwist += this.velTwist;

    // Safety guard against NaN/Infinity
    if (!Number.isFinite(this.springTilt)) {
      this.springTilt = 0;
      this.velTilt = 0;
    }
    if (!Number.isFinite(this.springTwist)) {
      this.springTwist = 0;
      this.velTwist = 0;
    }

    this.springTilt = THREE.MathUtils.clamp(this.springTilt, -0.6, 0.6);
    this.springTwist = THREE.MathUtils.clamp(this.springTwist, -0.6, 0.6);

    // 4. Combined rotation: Current tilt + organic wind sway + spring bounce
    const windSway = Math.sin(time * 0.7 + this.phase) * 0.022;
    this.pivot.rotation.x = -this.currentTilt + windSway + this.springTilt;
    this.pivot.rotation.z = this.springTwist;

    this.material.uniforms.uSpring.value = THREE.MathUtils.clamp(influence * 0.35, 0.0, 0.5);
  }

  dispose() {
    if (this.mesh) {
      this.mesh.geometry.dispose();
      this.material.dispose();
      if (this.pivot.parent) {
        this.pivot.parent.remove(this.pivot);
      }
    }
  }
}
