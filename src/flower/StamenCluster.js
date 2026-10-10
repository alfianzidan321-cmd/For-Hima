import * as THREE from 'three';

export class StamenCluster {
  constructor(parent, color = '#ffffff') {
    this.group = new THREE.Group();
    this.group.position.y = 0.03;
    parent.add(this.group);

    this.fibers = [];
    const count = 75;
    // Delicate miniature capsule fibers sprouting upwards
    const geo = new THREE.CapsuleGeometry(0.003, 0.25, 4, 6);
    geo.translate(0, 0.125, 0);

    for (let i = 0; i < count; i++) {
      const mat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(color),
        transparent: true,
        opacity: 0.0, // Managed by global alpha
        blending: THREE.NormalBlending
      });
      const m = new THREE.Mesh(geo, mat);
      const a = i * 2.39996; // Golden angle phyllotaxis
      const r = Math.sqrt(i / count) * 0.16;

      m.position.set(Math.cos(a) * r, Math.random() * 0.06, Math.sin(a) * r);
      m.rotation.set((Math.random() - 0.5) * 0.18, a, (Math.random() - 0.5) * 0.18);

      this.fibers.push(m);
      this.group.add(m);
    }
  }

  setGlobalAlpha(alpha) {
    const len = this.fibers.length;
    for (let i = 0; i < len; i++) {
      this.fibers[i].material.opacity = 0.88 * alpha;
    }
  }

  animate(time, bloom = 1.0) {
    // Hidden in bud, delicately emerging in bloom
    const clusterScale = THREE.MathUtils.lerp(0.02, 1.0, Math.max(0, (bloom - 0.22) / 0.78));
    this.group.scale.set(clusterScale, clusterScale, clusterScale);

    const len = this.fibers.length;
    for (let i = 0; i < len; i++) {
      const f = this.fibers[i];
      // Subtle organic shimmer
      f.scale.y = (1.0 + Math.sin(time * 3.5 + i * 0.08) * 0.15) * clusterScale;
    }
  }

  updateColor(color) {
    const len = this.fibers.length;
    for (let i = 0; i < len; i++) {
      this.fibers[i].material.color.set(color);
    }
  }

  dispose() {
    if (this.fibers.length > 0) {
      this.fibers[0].geometry.dispose();
      this.fibers.forEach((f) => f.material.dispose());
    }
    if (this.group.parent) {
      this.group.parent.remove(this.group);
    }
  }
}
