/**
 * InfinityText.js
 * Infinite scroll-controlled text selector with a curved active-item path.
 * Faithfully adapted from Framer InfinityText (https://framer.com/m/InfinityText-sCMW9t.js@jdbpeiMUt51NiAp1k7xZ).
 */

export class InfinityText {
  constructor(options = {}) {
    this.container = typeof options.container === 'string'
      ? document.querySelector(options.container)
      : (options.container || document.getElementById('infinity-text-root'));

    // Expanded rich poetic phrase set
    this.items = options.items || [
      'BEST FRIEND',
      'US',
      'FOREVER',
      'ME AND YOU',
      'ALWAYS',
      'MY PERSON',
      'SAFE PLACE',
      'TOGETHER',
      'SOULMATE',
      'YOU & ME',
      'FAVORITE HUMAN',
      'HOME',
      'EVERYTHING',
      'THROUGH IT ALL'
    ];

    this.visibleRadius = options.visibleRadius || 4;
    this.curve = options.curve ?? 36;
    this.baseTextLeft = options.baseTextLeft ?? 28;
    this.rowGap = options.rowGap ?? 14;
    this.fontSize = options.fontSize ?? 42;
    this.lineHeight = options.lineHeight ?? 42;
    this.rowHeight = Math.max(1, this.lineHeight + this.rowGap);

    // Slower, tranquil ambient scroll when idle ("unlimited text dibuat lebih pelan")
    this.autoScrollSpeed = options.autoScrollSpeed ?? 0.0009;
    // Calibrated gentle multiplier per page scroll delta (smooth and readable)
    this.scrollMultiplier = options.scrollMultiplier ?? 0.0075;
    this.idleDelay = options.idleDelay ?? 600; // ms idle cooldown
    this.lastUserInteractionTime = 0;

    this.renderedPosition = 0;
    this.targetPosition = 0;
    this.isDragging = false;
    this.dragStartY = 0;
    this.dragStartTarget = 0;
    this.velocity = 0;
    this.lastDragY = 0;
    this.lastDragTime = 0;
    this.settleTimer = null;
    this.animFrameId = null;
    this.isLocked = false;

    if (this.container) {
      this.init();
    }
  }

  noteUserInteraction() {
    this.lastUserInteractionTime = performance.now();
  }

  /**
   * Drives the infinite text wheel with smooth, controlled progression.
   * @param {number} deltaY - Page scroll delta
   * @param {number} velocity - Current Lenis scroll velocity
   */
  onPageScroll(deltaY, velocity = 0) {
    if (this.isDragging || this.isLocked) return;
    this.noteUserInteraction();

    const absVel = Math.abs(velocity);
    // Subtle, gentle velocity boost (capped at +35% for smooth, readable motion)
    const speedBoost = 1 + Math.min(0.35, absVel * 0.12);
    const delta = deltaY * this.scrollMultiplier * speedBoost;

    this.targetPosition += delta;
  }

  init() {
    this.render();
    this.setupListeners();
    this.startLoop();
  }

  modulo(value, divisor) {
    return ((value % divisor) + divisor) % divisor;
  }

  render() {
    const totalSlots = this.visibleRadius * 2 + 1;

    let slotsHtml = '';
    for (let i = 0; i < totalSlots; i++) {
      slotsHtml += `
        <div 
          class="infinity-text__item" 
          data-slot-idx="${i}" 
          role="option"
          style="position: absolute; top: 50%; left: ${this.baseTextLeft}px; will-change: transform, opacity;"
        >
          <span class="infinity-text__item-text"></span>
        </div>
      `;
    }

    this.container.innerHTML = `
      <div 
        class="infinity-text" 
        id="infinity-text-wheel" 
        tabindex="0" 
        role="listbox" 
        aria-label="Infinite Word Wheel"
      >
        <!-- Wheel Items Viewport (no arrow indicator) -->
        <div class="infinity-text__viewport">
          ${slotsHtml}
        </div>
      </div>
    `;

    this.wheelEl = this.container.querySelector('.infinity-text');
    this.slotEls = Array.from(this.container.querySelectorAll('.infinity-text__item'));
    this.updateWheel(0);
  }

  updateWheel(position) {
    const baseIndex = Math.round(position);
    const fraction = position - baseIndex;
    const values = this.items;

    for (let rowIndex = 0; rowIndex < this.slotEls.length; rowIndex++) {
      const el = this.slotEls[rowIndex];
      const slot = rowIndex - this.visibleRadius;
      const offset = slot - fraction;
      const distance = Math.abs(offset);

      // Only display items strictly within visible viewport bounds (prevents clipped positioned children)
      const isInside = distance <= 3.3;
      if (!isInside) {
        el.style.display = 'none';
        continue;
      }
      el.style.display = 'block';

      const itemIndex = this.modulo(baseIndex + slot, values.length);

      // Framer Gaussian curve calculation
      const curveStrength = Math.exp(-0.5 * Math.pow(distance / 2.05, 2));
      const curveX = curveStrength * this.curve;
      const scale = 0.94 + curveStrength * 0.075;
      const opacity = Math.max(0.15, Math.min(1, 1 - distance * 0.12));

      const isSelected = distance < 0.5;

      el.setAttribute('aria-selected', isSelected ? 'true' : 'false');
      el.classList.toggle('is-selected', isSelected);

      const span = el.querySelector('.infinity-text__item-text');
      if (span && span.textContent !== values[itemIndex]) {
        span.textContent = values[itemIndex];
      }

      el.style.transform = `translate3d(${curveX.toFixed(2)}px, calc(${offset.toFixed(3)} * ${this.rowHeight}px - 50%), 0) scale(${scale.toFixed(3)})`;
      el.style.opacity = opacity.toFixed(3);
    }
  }

  setupListeners() {
    if (!this.wheelEl) return;

    // Mouse wheel inside component: smooth, controlled interaction
    this.wheelEl.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.noteUserInteraction();
      const delta = e.deltaY * 0.0075;
      this.targetPosition += delta;
    }, { passive: false });

    // Pointer drag (mouse & touch)
    const handlePointerDown = (e) => {
      this.isDragging = true;
      this.noteUserInteraction();
      this.dragStartY = e.clientY;
      this.lastDragY = e.clientY;
      this.lastDragTime = performance.now();
      this.dragStartTarget = this.targetPosition;
      this.velocity = 0;
      if (e.pointerId !== undefined) {
        try { this.wheelEl.setPointerCapture(e.pointerId); } catch (_) {}
      }
    };

    const handlePointerMove = (e) => {
      if (!this.isDragging) return;
      this.noteUserInteraction();
      const now = performance.now();
      const dt = Math.max(1, now - this.lastDragTime);
      const dy = this.lastDragY - e.clientY;

      this.velocity = dy / dt;
      this.lastDragY = e.clientY;
      this.lastDragTime = now;

      const totalDelta = (this.dragStartY - e.clientY) * 0.009;
      this.targetPosition = this.dragStartTarget + totalDelta;
    };

    const handlePointerUp = (e) => {
      if (!this.isDragging) return;
      this.isDragging = false;
      this.noteUserInteraction();
      if (e.pointerId !== undefined) {
        try { this.wheelEl.releasePointerCapture(e.pointerId); } catch (_) {}
      }

      // Add gentle flick inertia
      this.targetPosition += this.velocity * 20;
    };

    this.wheelEl.addEventListener('pointerdown', handlePointerDown);
    this.wheelEl.addEventListener('pointermove', handlePointerMove);
    this.wheelEl.addEventListener('pointerup', handlePointerUp);
    this.wheelEl.addEventListener('pointercancel', handlePointerUp);

    // Keyboard navigation (Arrow keys)
    this.wheelEl.addEventListener('keydown', (e) => {
      this.noteUserInteraction();
      if (['ArrowDown', 'PageDown'].includes(e.key)) {
        e.preventDefault();
        this.targetPosition = Math.round(this.targetPosition) + 1;
      } else if (['ArrowUp', 'PageUp'].includes(e.key)) {
        e.preventDefault();
        this.targetPosition = Math.round(this.targetPosition) - 1;
      }
    });
  }

  startLoop() {
    const loop = (timestamp) => {
      const now = timestamp || performance.now();
      const isIdle = !this.isDragging && !this.isLocked && (now - this.lastUserInteractionTime > this.idleDelay);

      // User requirement: "buat infinite text scroll pelan kalau diam aja"
      if (isIdle) {
        this.targetPosition += this.autoScrollSpeed;
      }

      // Smooth, liquid spring/lerp (snappier when locking to glide swiftly to target)
      const lerpFactor = this.isLocked ? 0.12 : 0.075;
      const diff = this.targetPosition - this.renderedPosition;
      if (Math.abs(diff) > 0.0003) {
        this.renderedPosition += diff * lerpFactor;
        this.updateWheel(this.renderedPosition);
      } else if (this.renderedPosition !== this.targetPosition) {
        this.renderedPosition = this.targetPosition;
        this.updateWheel(this.renderedPosition);
      }

      this.animFrameId = requestAnimationFrame(loop);
    };

    this.animFrameId = requestAnimationFrame(loop);
  }

  /**
   * Immediately glides to and locks on a specific phrase (e.g. 'BEST FRIEND')
   * when hovered from adjacent components like LogoHover ('YOU ARE MY').
   */
  lockToItem(itemName = 'BEST FRIEND') {
    this.isLocked = true;
    const targetItemIndex = this.items.indexOf(itemName);
    if (targetItemIndex === -1) return;

    const N = this.items.length;
    const currentBase = Math.round(this.targetPosition);
    const currentMod = this.modulo(currentBase, N);

    let diff = targetItemIndex - currentMod;
    // Find shortest circular route
    if (diff > N / 2) diff -= N;
    if (diff < -N / 2) diff += N;

    this.targetPosition = currentBase + diff;
    if (this.wheelEl) {
      this.wheelEl.classList.add('is-locked-on-target');
    }
  }

  unlock() {
    this.isLocked = false;
    this.noteUserInteraction();
    if (this.wheelEl) {
      this.wheelEl.classList.remove('is-locked-on-target');
    }
  }

  destroy() {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    if (this.settleTimer) clearTimeout(this.settleTimer);
  }
}
