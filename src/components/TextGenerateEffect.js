/**
 * TextGenerateEffect.js
 * Vanilla JS adaptation of Aceternity UI TextGenerateEffect component.
 * Features staggered word-by-word blur-to-clear fade-in with smooth easing,
 * scroll intersection trigger, and zero reflow jitter.
 */

export class TextGenerateEffect {
  constructor(options = {}) {
    this.container = typeof options.container === 'string'
      ? document.querySelector(options.container)
      : options.container;

    this.badge = options.badge ?? "✦ A NOTE FOR YOU";
    this.words = options.words || `Some people feel like an accidental miracle in an ordinary life. In every quiet night, through laughter that saved the heaviest days, you became the sanctuary where everything finally made sense. No matter where life wanders, across every shifting storm and quiet sunrise...`;
    
    this.duration = options.duration ?? 0.6; // duration per word in seconds
    this.stagger = options.stagger ?? 0.085; // stagger delay between words in seconds
    this.filter = options.filter !== false; // blur filter enabled by default
    this.timeouts = [];
    this._replayTimer = null;
    this.isPlaying = false;
    this.isRevealed = false;

    if (this.container) {
      this.init();
    }
  }

  init() {
    this.render();
    this.setupIntersectionObserver();
  }

  render() {
    const rawWords = this.words.trim().split(/\s+/);

    const spansHtml = rawWords.map((word, idx) => {
      // Split into span tokens with initial blurred/hidden state
      return `<span class="text-gen__word" data-word-idx="${idx}">${word}&nbsp;</span>`;
    }).join('');

    this.container.innerHTML = `
      <div class="text-gen" role="region" aria-label="Poetic Dedication Message">
        <div class="text-gen__content">
          <p class="text-gen__paragraph" aria-live="polite">
            ${spansHtml}
          </p>
        </div>
      </div>
    `;

    this.wordSpans = Array.from(this.container.querySelectorAll('.text-gen__word'));
  }

  setupIntersectionObserver() {
    if (!('IntersectionObserver' in window)) {
      this.play();
      return;
    }

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Replay staggered blur reveal on slide enter or reload if not currently animating
          if (!this.isPlaying && !this.isRevealed) {
            this.replay();
          }
        } else {
          // Reset to initial blurred/hidden state when scrolled out
          this.reset(true);
        }
      });
    }, { 
      threshold: 0.1,
      rootMargin: '20px 0px -40px 0px' 
    });

    this.observer.observe(this.container);
  }

  play() {
    this.clearTimeouts();
    if (!this.wordSpans || this.wordSpans.length === 0) return;

    this.isPlaying = true;
    this.isRevealed = false;

    this.wordSpans.forEach((span, idx) => {
      const delay = idx * this.stagger * 1000;
      const t = setTimeout(() => {
        span.classList.add('is-revealed');
        if (idx === this.wordSpans.length - 1) {
          this.isPlaying = false;
          this.isRevealed = true;
        }
      }, delay);
      this.timeouts.push(t);
    });
  }

  reset(immediate = true) {
    this.clearTimeouts();
    this.isPlaying = false;
    this.isRevealed = false;

    if (this.wordSpans) {
      this.wordSpans.forEach((span) => {
        if (immediate) {
          const prevTransition = span.style.transition;
          span.style.transition = 'none';
          span.classList.remove('is-revealed');
          void span.offsetWidth; // Force layout flush so state resets cleanly
          span.style.transition = prevTransition;
        } else {
          span.classList.remove('is-revealed');
        }
      });
    }
  }

  replay() {
    this.reset(true);
    this.clearTimeouts();
    this._replayTimer = setTimeout(() => {
      this.play();
    }, 50);
  }

  clearTimeouts() {
    if (this._replayTimer) {
      clearTimeout(this._replayTimer);
      this._replayTimer = null;
    }
    this.timeouts.forEach((t) => clearTimeout(t));
    this.timeouts = [];
  }

  destroy() {
    this.clearTimeouts();
    if (this.observer) this.observer.disconnect();
  }
}
