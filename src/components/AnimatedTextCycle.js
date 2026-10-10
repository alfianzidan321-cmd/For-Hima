/**
 * AnimatedTextCycle.js
 * High-performance Vanilla JS adaptation of Framer Motion AnimatedTextCycle component.
 * Features dynamic spring width measurement, multi-directional blur fades, and zero layout thrashing.
 */

export class AnimatedTextCycle {
  constructor(options = {}) {
    this.container = typeof options.container === 'string'
      ? document.querySelector(options.container)
      : options.container;

    this.prefix = options.prefix ?? "You will always be my";
    this.suffix = options.suffix ?? "through every season";
    this.words = options.words || [
      "safe place",
      "favorite human",
      "best friend",
      "soulmate",
      "greatest comfort",
      "constant light",
      "purest joy",
      "home"
    ];

    this.interval = options.interval ?? 3000;
    this.currentIndex = 0;
    this.timer = null;
    this.wordWidths = [];
    this.isTransitioning = false;
    this.isVisible = true;

    if (this.container) {
      this.init();
    }
  }

  init() {
    this.render();
    this.measureWordWidths();
    this.applyCurrentWord(false);
    this.setupFontListener();
    this.startCycle();
  }

  setupFontListener() {
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        this.measureWordWidths();
        if (this.dynamicBox) {
          const w = this.wordWidths[this.currentIndex] || 120;
          this.dynamicBox.style.width = `${w}px`;
        }
      });
    }
  }

  render() {
    // Hidden measurement spans with exact matching font typography
    const measureSpans = this.words
      .map((word, i) => `<span class="text-cycle__measure-item" data-measure-idx="${i}">${word}</span>`)
      .join('');

    this.container.innerHTML = `
      <div class="text-cycle__statement" role="region" aria-label="Animated Poetic Dedication">
        <!-- Hidden measurement sandbox (zero visual footprint) -->
        <div class="text-cycle__measure-sandbox" aria-hidden="true">
          ${measureSpans}
        </div>

        <h2 class="text-cycle__heading">
          <span class="text-cycle__line-top">
            <span class="text-cycle__prefix">${this.prefix}</span>
            <span class="text-cycle__slot" aria-live="polite">
              <span class="text-cycle__dynamic-box" id="text-cycle-dynamic-box">
                <span class="text-cycle__word-layer text-cycle__word-layer--active"></span>
              </span>
            </span>
          </span>
          <span class="text-cycle__suffix">${this.suffix}</span>
        </h2>
      </div>
    `;

    this.dynamicBox = this.container.querySelector('#text-cycle-dynamic-box');
    this.wordLayer = this.container.querySelector('.text-cycle__word-layer--active');
    this.prefixEl = this.container.querySelector('.text-cycle__prefix');
  }

  measureWordWidths() {
    const sandbox = this.container.querySelector('.text-cycle__measure-sandbox');
    if (!sandbox) return;

    const measureItems = sandbox.querySelectorAll('.text-cycle__measure-item');
    this.wordWidths = Array.from(measureItems).map((el) => {
      // Add 8px safety buffer to prevent text clipping or subpixel wrapping
      return Math.ceil(el.getBoundingClientRect().width) + 8;
    });
  }

  applyCurrentWord(animate = true) {
    if (!this.dynamicBox || !this.wordLayer || this.words.length === 0) return;

    const currentWord = this.words[this.currentIndex];
    const targetWidth = this.wordWidths[this.currentIndex] || 120;

    if (!animate) {
      this.dynamicBox.style.width = `${targetWidth}px`;
      if (this.prefixEl) {
        this.prefixEl.style.transition = 'none';
        this.prefixEl.style.transform = 'translateX(0)';
      }
      this.wordLayer.textContent = currentWord;
      this.wordLayer.style.transform = 'translateY(0)';
      this.wordLayer.style.opacity = '1';
      this.wordLayer.style.filter = 'blur(0px)';
      return;
    }

    if (this.isTransitioning) return;
    this.isTransitioning = true;
    clearTimeout(this._safetyTimer);
    this._safetyTimer = setTimeout(() => {
      this.isTransitioning = false;
    }, 550);

    // 1. FLIP animation on prefix: animate GPU transform: translateX instead of layout property width
    let dx = 0;
    if (this.prefixEl) {
      const firstX = this.prefixEl.getBoundingClientRect().left;
      this.dynamicBox.style.width = `${targetWidth}px`;
      const lastX = this.prefixEl.getBoundingClientRect().left;
      dx = firstX - lastX;
    } else {
      this.dynamicBox.style.width = `${targetWidth}px`;
    }

    if (this.prefixEl && Math.abs(dx) > 0.2) {
      this.prefixEl.style.transition = 'none';
      this.prefixEl.style.transform = `translateX(${dx.toFixed(2)}px)`;
      void this.prefixEl.offsetWidth; // flush styles to commit inverted transform
      this.prefixEl.style.transition = 'transform 0.42s cubic-bezier(0.16, 1, 0.3, 1)';
      this.prefixEl.style.transform = 'translateX(0)';
    }

    // 2. Outgoing word exits downwards via compositor-only properties
    const outgoing = this.wordLayer;
    outgoing.style.transition = 'transform 0.32s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.22s ease, filter 0.22s ease';
    outgoing.style.transform = 'translateY(14px)';
    outgoing.style.opacity = '0';
    outgoing.style.filter = 'blur(6px)';

    // 3. Incoming word enters in parallel without artificial delay
    const incoming = document.createElement('span');
    incoming.className = 'text-cycle__word-layer text-cycle__word-layer--incoming';
    incoming.textContent = currentWord;
    incoming.style.transform = 'translateY(-14px)';
    incoming.style.opacity = '0';
    incoming.style.filter = 'blur(6px)';

    this.dynamicBox.appendChild(incoming);

    requestAnimationFrame(() => {
      incoming.style.transition = 'transform 0.42s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.36s ease, filter 0.36s ease';
      incoming.style.transform = 'translateY(0)';
      incoming.style.opacity = '1';
      incoming.style.filter = 'blur(0px)';
    });

    setTimeout(() => {
      if (outgoing.parentNode) outgoing.parentNode.removeChild(outgoing);
      incoming.className = 'text-cycle__word-layer text-cycle__word-layer--active';
      this.wordLayer = incoming;
      this.isTransitioning = false;
    }, 450);
  }

  next() {
    this.currentIndex = (this.currentIndex + 1) % this.words.length;
    this.applyCurrentWord(true);
  }

  startCycle() {
    this.stopCycle();
    this.timer = setInterval(() => {
      this.next();
    }, this.interval);
  }

  stopCycle() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  setupIntersectionObserver() {
    if (!('IntersectionObserver' in window)) return;

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          this.isVisible = entry.isIntersecting;
        });
      },
      { threshold: 0.15 }
    );

    this.observer.observe(this.container);

    // Remeasure widths on window resize for responsive layout accuracy
    this._onResize = () => {
      this.measureWordWidths();
      if (this.dynamicBox && this.wordWidths[this.currentIndex]) {
        this.dynamicBox.style.width = `${this.wordWidths[this.currentIndex]}px`;
      }
    };
    window.addEventListener('resize', this._onResize, { passive: true });
  }

  destroy() {
    this.stopCycle();
    if (this.observer) this.observer.disconnect();
    if (this._onResize) window.removeEventListener('resize', this._onResize);
  }
}
