/**
 * LogoHover.js
 * Interactive Logo Hover Component adapted from Framer (Logo-Hover-PlHzvj.js).
 * Features split typographic reveal that expands on hover to play video smoothly without audio.
 */

export class LogoHover {
  constructor(options = {}) {
    this.container = typeof options.container === 'string'
      ? document.querySelector(options.container)
      : (options.container || document.getElementById('logo-hover-root'));

    this.topWord = options.topWord || 'YOU ARE';
    this.bottomWord = options.bottomWord || 'MY';
    this.videoSrc = options.videoSrc || '/assets/18913ac2-d05c-492b-8eb8-289adb6cd45f.mp4';
    this.onHoverStart = options.onHoverStart || null;
    this.onHoverEnd = options.onHoverEnd || null;

    this.isHovered = false;
    this.video = null;

    if (this.container) {
      this.init();
    }
  }

  init() {
    this.render();
    this.setupListeners();
  }

  render() {
    const renderLetters = (word) => {
      return word.split('').map((char, i) => {
        if (char === ' ') {
          return '<span class="logo-hover__space">&nbsp;</span>';
        }
        return `
          <span class="logo-hover__char" style="--char-idx: ${i}">
            <span class="logo-hover__char-primary">${char}</span>
          </span>
        `;
      }).join('');
    };

    this.container.innerHTML = `
      <div class="logo-hover" id="logo-hover" tabindex="0" role="button" aria-label="Interactive Logo ${this.topWord} ${this.bottomWord}">
        <div class="logo-hover__stack">
          <!-- Top Word -->
          <div class="logo-hover__word logo-hover__word--top">
            ${renderLetters(this.topWord)}
          </div>

          <!-- Video Reveal Container with zero-reflow grid slot -->
          <div class="logo-hover__media-slot" aria-hidden="true">
            <div class="logo-hover__media-inner">
              <div class="logo-hover__media">
                <video 
                  class="logo-hover__video" 
                  src="${this.videoSrc}" 
                  muted 
                  loop 
                  playsinline 
                  preload="auto"
                ></video>
              </div>
            </div>
          </div>

          <!-- Bottom Word -->
          <div class="logo-hover__word logo-hover__word--bottom">
            ${renderLetters(this.bottomWord)}
          </div>
        </div>
      </div>
    `;

    this.el = this.container.querySelector('.logo-hover');
    this.video = this.container.querySelector('.logo-hover__video');

    if (this.video) {
      this.video.muted = true;
      this.video.volume = 0;
      try {
        this.video.load();
      } catch (_) {}
    }
  }

  setupListeners() {
    if (!this.el) return;

    const handleEnter = () => {
      this.isHovered = true;
      this.el.classList.add('is-hovered');
      if (this.video) {
        const playPromise = this.video.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {});
        }
      }
      if (typeof this.onHoverStart === 'function') {
        this.onHoverStart();
      }
    };

    const handleLeave = () => {
      this.isHovered = false;
      this.el.classList.remove('is-hovered');
      if (this.video) {
        this.video.pause();
      }
      if (typeof this.onHoverEnd === 'function') {
        this.onHoverEnd();
      }
    };

    this.el.addEventListener('mouseenter', handleEnter);
    this.el.addEventListener('mouseleave', handleLeave);
    this.el.addEventListener('focus', handleEnter);
    this.el.addEventListener('blur', handleLeave);

    // Touch support (tap to toggle play/expand)
    this.el.addEventListener('touchstart', (e) => {
      if (!this.isHovered) {
        e.preventDefault();
        handleEnter();
      } else {
        handleLeave();
      }
    }, { passive: false });
  }

  destroy() {
    if (this.video) {
      this.video.pause();
    }
  }
}
