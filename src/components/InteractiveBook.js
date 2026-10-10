/**
 * InteractiveBook.js
 * 
 * Re-implementation of Framer's InteractiveBook component:
 * https://framer.com/m/InteractiveBook-xGXc.js@uLOYl8huI2w4XDdONaRK
 * 
 * Features:
 * - Ultra-smooth 3D CSS transform-style: preserve-3d with 2500px perspective
 * - Centering offset: translateX(width / 2) when opened to keep the 2-page spread centered
 * - 4 double-sided leaves (8 custom pages) with realistic spine shadows & depth
 * - Dynamic translateZ(zOffset) layering preventing z-fighting & realistic leaf thickness
 * - Sequential reverse stagger closing animation when finished or re-closing
 * - Responsive sizing and direct page click / control navigation
 */

export class InteractiveBook {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    if (!this.container) return;

    this.pages = options.pages || [
      { front: '/assets/book/1.png', back: '/assets/book/2.png' },
      { front: '/assets/book/3.png', back: '/assets/book/4.png' },
      { front: '/assets/book/5.png', back: '/assets/book/6.png' },
      { front: '/assets/book/7.png', back: '/assets/book/8.png' },
      { front: '/assets/book/Notebook.png', back: '/assets/book/9.png' }
    ];

    this.totalLeaves = this.pages.length;
    this.flippedCount = 0;
    this.isAnimating = false;
    this.flippingIndex = null;

    this.init();
  }

  init() {
    this.render();
    this.bindEvents();
    this.updateBookState(false);
  }

  render() {
    this.container.innerHTML = `
      <div class="interactive-book-scene">
        <div class="book-ambient-glow"></div>
        <div class="book-wrapper" id="book-wrapper">
          ${this.pages.map((leaf, index) => `
            <div class="book-leaf" data-index="${index}" style="--leaf-index: ${index};">
              <!-- Front Face (Right side when closed / turning) -->
              <div class="leaf-face leaf-face--front">
                <img src="${leaf.front}" alt="Page ${index * 2 + 1}" loading="eager" draggable="false" class="leaf-img" />
                <div class="leaf-spine-shadow leaf-spine-shadow--left"></div>
                <div class="leaf-page-curl-glow"></div>
              </div>
              <!-- Back Face (Left side when open) -->
              <div class="leaf-face leaf-face--back">
                <img src="${leaf.back}" alt="Page ${index * 2 + 2}" loading="eager" draggable="false" class="leaf-img" />
                <div class="leaf-spine-shadow leaf-spine-shadow--right"></div>
                <div class="leaf-page-curl-glow"></div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    this.bookWrapper = this.container.querySelector('#book-wrapper');
    this.leafEls = Array.from(this.container.querySelectorAll('.book-leaf'));
  }

  bindEvents() {
    // Book click handling
    this.bookWrapper.addEventListener('click', (e) => {
      if (this.isAnimating) return;

      const rect = this.bookWrapper.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const isLeftSide = clickX < rect.width * 0.45;

      if (this.flippedCount === this.totalLeaves) {
        // When at the very end, clicking anywhere closes the book back to cover
        this.closeAll();
      } else if (this.flippedCount > 0 && isLeftSide) {
        // Clicking on the left side of an open spread flips backward
        this.flipPrev();
      } else {
        // Clicking right side flips next
        this.flipNext();
      }
    });
  }

  updateBookState(animate = true) {
    // Centering offset: Framer InteractiveBook moves container by translateX(width / 2) when opened
    if (this.flippedCount > 0) {
      this.bookWrapper.classList.add('is-opened');
    } else {
      this.bookWrapper.classList.remove('is-opened');
    }

    // Update each leaf
    this.leafEls.forEach((leafEl, i) => {
      const isFlipped = i < this.flippedCount;
      const isFlipping = i === this.flippingIndex;

      // Realistic z-index stack matching Framer formula
      // Flipping leaf is elevated to z-index 100
      let zIndex;
      if (isFlipping) {
        zIndex = 100;
      } else if (isFlipped) {
        zIndex = i + 1;
      } else {
        zIndex = (this.totalLeaves - i) + 1;
      }
      leafEl.style.zIndex = zIndex;

      // Subtle thickness offset (0.4px per leaf to avoid 3D z-fighting)
      const zOffset = isFlipped ? i * 0.4 : (this.totalLeaves - i) * 0.4;
      const rotateY = isFlipped ? -180 : 0;

      leafEl.style.transform = `translateZ(${zOffset}px) rotateY(${rotateY}deg)`;

      if (isFlipped) {
        leafEl.classList.add('is-flipped');
      } else {
        leafEl.classList.remove('is-flipped');
      }
    });
  }

  flipNext() {
    if (this.isAnimating) return;

    if (this.flippedCount >= this.totalLeaves) {
      this.closeAll();
      return;
    }

    const leafIndex = this.flippedCount;
    this.flippingIndex = leafIndex;
    this.isAnimating = true;

    this.flippedCount++;
    this.updateBookState(true);

    setTimeout(() => {
      this.flippingIndex = null;
      this.isAnimating = false;
      this.updateBookState(false);
    }, 750);
  }

  flipPrev() {
    if (this.isAnimating || this.flippedCount <= 0) return;

    this.flippedCount--;
    const leafIndex = this.flippedCount;
    this.flippingIndex = leafIndex;
    this.isAnimating = true;

    this.updateBookState(true);

    setTimeout(() => {
      this.flippingIndex = null;
      this.isAnimating = false;
      this.updateBookState(false);
    }, 750);
  }

  /**
   * Reverse Stagger Close Sequence (Exact Framer signature behavior)
   * Closes leaves from back to front with sequential delays.
   */
  closeAll() {
    if (this.isAnimating || this.flippedCount === 0) return;
    this.isAnimating = true;

    const leavesToClose = this.flippedCount;
    const staggerDelay = 80; // ms

    for (let step = 0; step < leavesToClose; step++) {
      setTimeout(() => {
        if (this.flippedCount > 0) {
          this.flippedCount--;
          this.flippingIndex = this.flippedCount;
          this.updateBookState(true);
        }

        if (this.flippedCount === 0) {
          setTimeout(() => {
            this.flippingIndex = null;
            this.isAnimating = false;
            this.updateBookState(false);
          }, 500);
        }
      }, step * staggerDelay);
    }
  }
}
