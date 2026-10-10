import * as THREE from 'three';
import { PetalUnit } from './PetalUnit.js';
import { StamenCluster } from './StamenCluster.js';
import { STEM_VERT, STEM_FRAG } from './shaders.js';

export class FlowerGroup {
  constructor(scene, config = {}) {
    this.scene = scene;
    this.config = config;

    this.pos = config.position || new THREE.Vector3(0, 0, 0);
    this.baseScale = config.scale || 0.6;
    this.stemHeight = config.stemHeight || 4.2;
    this.growthDelay = config.growthDelay || 0.0;
    this.windPhase = config.windPhase || Math.random() * Math.PI * 2;
    this.currentPetalCount = config.petalCount || 8;

    // Atmospheric depth factor: 1.0 at foreground (z >= 1.5), 0.55 at distant horizon (z <= -4.8)
    const zRange = (this.pos.z - (-5.0)) / (2.5 - (-5.0));
    this.depthFactor = THREE.MathUtils.lerp(0.55, 1.0, Math.max(0, Math.min(1, zRange)));

    this.petals = [];
    this.growth = 0.0;
    this.bloom = 0.0;
    this.globalAlpha = 0.0;

    // Luminescent white petals with deep jade stem
    this.petalColor = '#ffffff';
    this.innerGlowColor = '#e2e8f0';
    this.stamenColor = '#ffffff';
    this.stemColor = '#14261c';

    // Root group positioned at flower's world base
    this.root = new THREE.Group();
    this.root.position.copy(this.pos);
    this.root.scale.set(this.baseScale, this.baseScale, this.baseScale);
    
    // Natural wild organic tilt & orientation
    const leanX = config.leanX !== undefined ? config.leanX : (Math.random() - 0.5) * 0.18;
    const leanZ = config.leanZ !== undefined ? config.leanZ : (Math.random() - 0.5) * 0.20;
    const rotY = config.rotationY !== undefined ? config.rotationY : Math.random() * Math.PI * 2;
    this.root.rotation.set(leanX, rotY, leanZ);
    
    scene.add(this.root);

    // Head group (anchors receptacle, stamen, petals directly onto stem tip)
    this.headGroup = new THREE.Group();
    this.root.add(this.headGroup);

    // Generate unique organic Catmull-Rom stem curve ending at y = 0.0 (compact lower-screen constraint)
    const curveCurvX = config.curveCurvX || (Math.random() - 0.5) * 0.22;
    const curveCurvZ = config.curveCurvZ || (Math.random() - 0.5) * 0.18;
    const baseH = -this.stemHeight;

    this.stemCurvePoints = [
      new THREE.Vector3(0, baseH, 0),
      new THREE.Vector3(curveCurvX * 0.8, baseH * 0.72 + 0.15, curveCurvZ * 0.8),
      new THREE.Vector3(-curveCurvX * 0.6, baseH * 0.46 + 0.25, -curveCurvZ * 0.6),
      new THREE.Vector3(curveCurvX * 0.4, baseH * 0.20 + 0.35, curveCurvZ * 0.4),
      new THREE.Vector3(0, 0.0, 0)
    ];

    this.stemCurve = new THREE.CatmullRomCurve3(this.stemCurvePoints);
    this.stemMesh = this.makeStem(this.stemColor);
    this.root.add(this.stemMesh);

    // Botanical Receptacle & Calyx
    this.buildReceptacle(this.stemColor);

    // Stamen cluster (sits in center of petal cup)
    this.stamen = new StamenCluster(this.headGroup, this.stamenColor);

    // Petals (anchored cleanly at y = 0 inside headGroup)
    this.buildPetals();

    // Initial state: 0
    this.setGrowthAndBloom(0.0, 0.0);
  }

  makeStem(color) {
    const geo = new THREE.TubeGeometry(this.stemCurve, 120, 0.05, 14, false);
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(color) },
        uTime: { value: 0 },
        uGrowth: { value: 0.0 },
        uDepthFactor: { value: this.depthFactor },
        uGlobalAlpha: { value: 0.0 }
      },
      vertexShader: STEM_VERT,
      fragmentShader: STEM_FRAG,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    return new THREE.Mesh(geo, mat);
  }

  buildReceptacle(color) {
    this.receptacleGroup = new THREE.Group();
    this.receptacleGroup.position.set(0, 0, 0);
    this.headGroup.add(this.receptacleGroup);

    // Smooth miniature organic junction cup
    const cupGeo = new THREE.CylinderGeometry(0.08, 0.05, 0.12, 14);
    cupGeo.translate(0, -0.06, 0);
    this.cupMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(color).offsetHSL(0.02, 0.1, 0.06),
      transparent: true,
      opacity: 0.0
    });
    const cup = new THREE.Mesh(cupGeo, this.cupMat);
    this.receptacleGroup.add(cup);

    // 5 delicate sepals hugging the cup
    const sepalGeo = new THREE.ConeGeometry(0.035, 0.16, 5);
    sepalGeo.translate(0, -0.08, 0);
    this.sepalMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(color).offsetHSL(0.04, 0.15, 0.1),
      transparent: true,
      opacity: 0.0
    });

    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const sepal = new THREE.Mesh(sepalGeo, this.sepalMat);
      sepal.rotation.y = angle;
      sepal.rotation.x = 0.20;
      this.receptacleGroup.add(sepal);
    }
  }

  buildPetals() {
    this.petals.forEach((p) => p.dispose());
    this.petals = [];

    const layers = 4;
    const perLayer = this.currentPetalCount;

    for (let layer = 0; layer < layers; layer++) {
      const countInLayer = Math.max(3, perLayer - layer);
      const angleOffset = (layer * Math.PI) / perLayer;
      // Natural blooming chalice angles: 16°, 30°, 44°, 58°
      const tiltDeg = 16 + layer * 14;
      const tiltRad = (tiltDeg * Math.PI) / 180;
      const petalScale = 0.82 + layer * 0.14;

      for (let i = 0; i < countInLayer; i++) {
        const yawAngle = (i / countInLayer) * Math.PI * 2 + angleOffset;
        const petal = new PetalUnit(
          this.headGroup,
          yawAngle,
          tiltRad,
          petalScale,
          layer,
          {
            petalColor: this.petalColor,
            innerGlowColor: this.innerGlowColor,
            petalLength: 50,
            springK: 0.12,
            damping: 0.86,
            depthFactor: this.depthFactor
          }
        );
        this.petals.push(petal);
      }
    }
  }

  setGrowthAndBloom(globalGrowth, globalBloom) {
    const delay = this.growthDelay;
    const localGrowth = Math.max(0, Math.min(1, (globalGrowth - delay) / (1 - delay * 0.55)));
    const localBloom = Math.max(0, Math.min(1, (globalBloom - delay * 0.45) / (1 - delay * 0.45)));

    this.growth = localGrowth;
    this.bloom = localBloom;

    // Smooth fade in & out for stems and petals during scroll
    this.globalAlpha = THREE.MathUtils.smoothstep(localGrowth, 0.001, 0.08);

    if (this.globalAlpha <= 0.0001) {
      this.root.visible = false;
      return;
    }
    this.root.visible = true;

    if (this.stemMesh && this.stemMesh.material.uniforms) {
      this.stemMesh.material.uniforms.uGrowth.value = this.growth;
      this.stemMesh.material.uniforms.uGlobalAlpha.value = this.globalAlpha;
    }

    if (this.cupMat) this.cupMat.opacity = 0.95 * this.globalAlpha;
    if (this.sepalMat) this.sepalMat.opacity = 0.85 * this.globalAlpha;

    const pLen = this.petals.length;
    for (let i = 0; i < pLen; i++) {
      this.petals[i].setGlobalAlpha(this.globalAlpha);
    }
    this.stamen.setGlobalAlpha(this.globalAlpha);
  }

  animate(time, raycaster) {
    if (!this.root.visible) return;

    // 1. Dynamic Tip Position along the stem curve
    const clampedGrowth = Math.max(0.001, Math.min(1.0, this.growth));
    const tipPoint = this.stemCurve.getPointAt(clampedGrowth);

    // Stem sway calculation matching STEM_VERT exactly
    const stemTime = time + this.windPhase;
    const sway = Math.sin(stemTime * 0.8 + tipPoint.y * 0.5) * 0.12;
    const swayZ = Math.cos(stemTime * 0.6 + tipPoint.y * 0.4) * 0.08;
    const swayInfluence = THREE.MathUtils.smoothstep(tipPoint.y, -5.0, 0.2);

    // Head group stays 100% attached to the growing stem tip
    this.headGroup.position.set(
      tipPoint.x + sway * swayInfluence,
      tipPoint.y,
      tipPoint.z + swayZ * swayInfluence
    );

    // Tangent orientation + forward tilt
    const tangent = this.stemCurve.getTangentAt(clampedGrowth);
    this.headGroup.rotation.z = tangent.x * 0.35;
    this.headGroup.rotation.x = -tangent.z * 0.35 + 0.14 * this.bloom;

    // 2. 3D Raycasting calculation for hover physics
    const headWorldPos = new THREE.Vector3();
    this.headGroup.getWorldPosition(headWorldPos);

    let mouseWorldHit = new THREE.Vector3(-999, -999, -999);
    if (raycaster && raycaster.ray) {
      const closestOnRay = new THREE.Vector3();
      raycaster.ray.closestPointToPoint(headWorldPos, closestOnRay);
      mouseWorldHit = closestOnRay;
    }

    // 3. Animate Petals & Stamen
    const pLen = this.petals.length;
    for (let i = 0; i < pLen; i++) {
      this.petals[i].animate(time, mouseWorldHit, this.bloom);
    }
    this.stamen.animate(time, this.bloom);

    // Receptacle scale with bloom
    if (this.receptacleGroup) {
      const rScale = THREE.MathUtils.lerp(0.75, 1.0, this.bloom);
      this.receptacleGroup.scale.set(rScale, rScale, rScale);
    }

    // Stem shader time
    if (this.stemMesh.material && this.stemMesh.material.uniforms) {
      this.stemMesh.material.uniforms.uTime.value = stemTime;
    }

    // Root plant sway
    this.root.rotation.z = Math.sin(time * 0.45 + this.windPhase) * 0.018;
    this.root.rotation.x = Math.cos(time * 0.35 + this.windPhase) * 0.012;
  }

  dispose() {
    this.petals.forEach((p) => p.dispose());
    this.stamen.dispose();
    if (this.stemMesh) {
      this.stemMesh.geometry.dispose();
      this.stemMesh.material.dispose();
    }
    if (this.receptacleGroup) {
      this.receptacleGroup.children.forEach((c) => {
        c.geometry.dispose();
        c.material.dispose();
      });
    }
    this.scene.remove(this.root);
  }
}
