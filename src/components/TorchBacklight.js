/**
 * TorchBacklight.js
 * Atmospheric cursor-following torch illumination and reactive component backlighting.
 * Situated on a background layer behind UI components, active strictly after the parallax header.
 */

export class TorchBacklight {
  constructor(options = {}) {
    this.container = typeof options.container === 'string'
      ? document.querySelector(options.container)
      : (options.container || document.body);

    this.targetSelectors = options.targetSelectors || [
      '#infinity-text-root',
      '.spacer-logo-wrapper',
      '#text-gen-root',
      '#text-cycle-root'
    ];

    this.lerpFactor = options.lerpFactor ?? 0.15;
    this.proximityRadius = options.proximityRadius ?? 540; // Proximity threshold in pixels
    this.isActive = false; // Enabled strictly when parallax header is scrolled out
    this.parallaxBottom = -9999;
    this.isMouseInside = true;

    // Center coordinates as initial fallback
    const initX = typeof window !== 'undefined' ? window.innerWidth * 0.5 : 500;
    const initY = typeof window !== 'undefined' ? window.innerHeight * 0.5 : 500;

    this.targetX = initX;
    this.targetY = initY;
    this.currentX = initX;
    this.currentY = initY;

    this.currentOpacity = 0;
    this.targetOpacity = 0;
    this.rafId = null;

    this.init();
  }

  init() {
    this.createDom();
    this.cacheTargetElements();
    this.bindEvents();
    this.startLoop();
  }

  createDom() {
    // Check if layer already exists in DOM
    let layer = document.getElementById('torch-backlight-layer');
    if (!layer) {
      layer = document.createElement('div');
      layer.id = 'torch-backlight-layer';
      layer.className = 'torch-backlight-layer';
      layer.setAttribute('aria-hidden', 'true');
      layer.innerHTML = `
        <div class="torch-light-source"></div>
      `;
      this.container.appendChild(layer);
    }
    this.layerEl = layer;
  }

  cacheTargetElements() {
    this.targetElements = [];
    this.targetSelectors.forEach((sel) => {
      const el = document.querySelector(sel);
      if (el) {
        el.classList.add('torch-backlight-target');
        this.targetElements.push(el);
      }
    });
  }

  bindEvents() {
    this._onPointerMove = (e) => {
      this.targetX = e.clientX;
      this.targetY = e.clientY;
      this.isMouseInside = true;
    };

    this._onTouchMove = (e) => {
      if (e.touches && e.touches[0]) {
        this.targetX = e.touches[0].clientX;
        this.targetY = e.touches[0].clientY;
        this.isMouseInside = true;
      }
    };

    this._onPointerLeave = () => {
      this.isMouseInside = false;
    };

    this._onPointerEnter = () => {
      this.isMouseInside = true;
    };

    window.addEventListener('pointermove', this._onPointerMove, { passive: true });
    window.addEventListener('touchmove', this._onTouchMove, { passive: true });
    document.addEventListener('mouseleave', this._onPointerLeave, { passive: true });
    document.addEventListener('mouseenter', this._onPointerEnter, { passive: true });

    // Refresh cached target elements on resize
    this._onResize = () => {
      this.cacheTargetElements();
    };
    window.addEventListener('resize', this._onResize, { passive: true });
  }

  /**
   * Set active status controlled by page scroll and parallax header position.
   * Ensures torch NEVER touches or bleeds into the parallax header.
   * @param {boolean} active - True when scrolled past parallax header into content sections
   * @param {number} parallaxBottom - Current viewport bounding bottom of parallax header
   */
  setActive(active, parallaxBottom = -9999) {
    this.isActive = Boolean(active);
    this.parallaxBottom = parallaxBottom;

    // If parallax header is visible on screen, instantly extinguish torch
    if (!this.isActive || parallaxBottom > 5) {
      this.currentOpacity = 0;
      if (this.layerEl) {
        this.layerEl.style.opacity = '0';
        this.layerEl.style.visibility = 'hidden';
      }
      this.clearBacklights();
    }
  }

  /**
   * Dynamically switch lighting theme
   * @param {string} theme - 'default'
   */
  setTheme(theme) {
    if (this.currentTheme === theme) return;
    this.currentTheme = theme;
  }

  startLoop() {
    const loop = () => {
      this.updatePhysics();
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }

  getParallaxBottom() {
    const el = document.getElementById('parallax-header');
    if (!el) return -9999;
    return el.getBoundingClientRect().bottom;
  }

  updatePhysics() {
    if (!this.layerEl) return;

    // Real-time frame-accurate check of parallax position
    const realBottom = this.getParallaxBottom();
    this.parallaxBottom = realBottom;

    // Hard cutoff: torch can NEVER exist if parallax header is on screen
    if (this.parallaxBottom > 5 || !this.isActive) {
      this.currentOpacity = 0;
      this.layerEl.style.opacity = '0';
      this.layerEl.style.visibility = 'hidden';
      this.clearBacklights();
      return;
    }

    // Physical position clamping:
    // Torch radius (120px) + blur spread (34px) = 154px.
    // Clamping center to (parallaxBottom + 165px) guarantees torch light disk NEVER touches parallax!
    const minSafeY = Math.max(0, this.parallaxBottom + 165);
    if (this.targetY < minSafeY) {
      this.targetY = minSafeY;
    }

    // Smooth physical lerp positioning
    this.currentX += (this.targetX - this.currentX) * this.lerpFactor;
    this.currentY += (this.targetY - this.currentY) * this.lerpFactor;

    if (this.currentY < minSafeY) {
      this.currentY = minSafeY;
    }

    // Immediate responsive opacity lerp: visible instantly as YOU ARE MY appears
    const desiredOpacity = (this.isActive && this.isMouseInside && this.parallaxBottom <= 5) ? 1.0 : 0.0;
    this.currentOpacity += (desiredOpacity - this.currentOpacity) * 0.18;

    if (this.currentOpacity > 0.008) {
      this.layerEl.style.opacity = this.currentOpacity.toFixed(3);
      this.layerEl.style.visibility = 'visible';

      const xPx = `${this.currentX.toFixed(1)}px`;
      const yPx = `${this.currentY.toFixed(1)}px`;

      this.layerEl.style.setProperty('--torch-x', xPx);
      this.layerEl.style.setProperty('--torch-y', yPx);

      // Update reactive backlight on nearby components
      this.updateBacklights();
    } else {
      if (this.layerEl.style.visibility !== 'hidden') {
        this.layerEl.style.opacity = '0';
        this.layerEl.style.visibility = 'hidden';
        this.clearBacklights();
      }
    }
  }

  updateBacklights() {
    if (!this.targetElements || this.targetElements.length === 0) {
      this.cacheTargetElements();
    }

    const tX = this.currentX;
    const tY = this.currentY;

    for (let i = 0; i < this.targetElements.length; i++) {
      const el = this.targetElements[i];
      if (!el) continue;

      const rect = el.getBoundingClientRect();
      // Skip offscreen elements
      if (rect.bottom < -100 || rect.top > window.innerHeight + 100) {
        if (el.classList.contains('has-torch-backlight')) {
          el.style.setProperty('--backlight-intensity', '0');
          el.classList.remove('has-torch-backlight');
        }
        continue;
      }

      // Find closest boundary point to torch
      const closestX = Math.max(rect.left, Math.min(tX, rect.right));
      const closestY = Math.max(rect.top, Math.min(tY, rect.bottom));

      const edgeDx = tX - closestX;
      const edgeDy = tY - closestY;
      const edgeDist = Math.sqrt(edgeDx * edgeDx + edgeDy * edgeDy);

      // Distance from element center to torch
      const centerX = rect.left + rect.width * 0.5;
      const centerY = rect.top + rect.height * 0.5;
      const centerDx = tX - centerX;
      const centerDy = tY - centerY;
      const centerDist = Math.max(1, Math.sqrt(centerDx * centerDx + centerDy * centerDy));

      if (edgeDist < this.proximityRadius) {
        // Proximity intensity from 0 to 1
        const rawProximity = Math.max(0, 1 - (edgeDist / this.proximityRadius));
        // Smooth cubic ease for luxury luminous falloff
        const intensity = rawProximity * rawProximity * (3 - 2 * rawProximity) * this.currentOpacity;

        const dirX = centerDx / centerDist;
        const dirY = centerDy / centerDist;

        // Offset for radial backlight pseudo-element behind component
        const maxOffset = Math.min(rect.width * 0.4, 70);
        const offsetX = (dirX * Math.min(maxOffset, centerDist * 0.22)).toFixed(1);
        const offsetY = (dirY * Math.min(maxOffset, centerDist * 0.22)).toFixed(1);

        el.style.setProperty('--backlight-intensity', intensity.toFixed(3));
        el.style.setProperty('--backlight-dir-x', dirX.toFixed(3));
        el.style.setProperty('--backlight-dir-y', dirY.toFixed(3));
        el.style.setProperty('--backlight-offset-x', `${offsetX}px`);
        el.style.setProperty('--backlight-offset-y', `${offsetY}px`);
        el.classList.add('has-torch-backlight');
      } else {
        if (el.classList.contains('has-torch-backlight')) {
          el.style.setProperty('--backlight-intensity', '0');
          el.classList.remove('has-torch-backlight');
        }
      }
    }
  }

  clearBacklights() {
    if (this.targetElements) {
      this.targetElements.forEach((el) => {
        if (el && el.classList.contains('has-torch-backlight')) {
          el.style.setProperty('--backlight-intensity', '0');
          el.classList.remove('has-torch-backlight');
        }
      });
    }
  }

  destroy() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    window.removeEventListener('pointermove', this._onPointerMove);
    window.removeEventListener('touchmove', this._onTouchMove);
    document.removeEventListener('mouseleave', this._onPointerLeave);
    document.removeEventListener('mouseenter', this._onPointerEnter);
    window.removeEventListener('resize', this._onResize);
    this.clearBacklights();
    if (this.layerEl && this.layerEl.parentNode) {
      this.layerEl.parentNode.removeChild(this.layerEl);
    }
  }
}
