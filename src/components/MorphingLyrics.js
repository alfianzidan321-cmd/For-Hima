/**
 * MorphingLyrics.js
 * Sleek, high-performance, bug-free liquid morphing lyrics.
 * Delivers seamless fluid blur transitions with zero text collision,
 * synchronized with audio playback and scroll visibility.
 */

export const DEFAULT_INITIAL_LYRIC = "I should've stayed at home";

export class MorphingLyrics {
  constructor(options = {}) {
    this.container = document.getElementById(options.containerId || 'sticky-morph-lyrics');
    this.morphContainer = document.getElementById('morph-text-container');
    this.text1El = document.getElementById(options.text1Id || 'morph-text-1');
    this.text2El = document.getElementById(options.text2Id || 'morph-text-2');

    this.morphDuration = 0.40; // Snappy, elegant 0.40s liquid transition
    this.morphProgress = 1;
    this.isMorphing = false;
    this.lastTime = performance.now();
    this.animationFrameId = null;

    this.isVisible = false;
    this.currentText = options.initialText || DEFAULT_INITIAL_LYRIC;
    this.targetText = this.currentText;
    this.fromText = "";

    this.init();
  }

  init() {
    if (!this.text1El || !this.text2El) return;
    this.settleText(this.currentText);
  }

  getCurrentLyric() {
    return this.currentText;
  }

  /**
   * Immediately snap to current active lyric without animating.
   * Useful when scrolling into view or seeking audio.
   */
  syncToCurrent(text) {
    const clean = text ? text.trim() : "";
    this.stopAnimation();
    this.isMorphing = false;
    this.morphProgress = 1;
    this.currentText = clean;
    this.targetText = clean;
    this.fromText = "";
    this.settleText(clean);
  }

  setVisible(visible) {
    if (this.isVisible === visible) return;
    this.isVisible = visible;

    if (this.container) {
      if (visible) {
        this.container.classList.add('visible');
        if (this.isMorphing) {
          this.startAnimation();
        }
      } else {
        this.container.classList.remove('visible');
        this.stopAnimation();
      }
    }
  }

  /**
   * Set dynamic vertical progress as user scrolls approaching the flowers.
   * 0.0 = rests near bottom (38vh offset from center, i.e. 88vh)
   * 1.0 = dead center in screen viewport (0vh offset, i.e. 50vh)
   */
  setApproachProgress(progress) {
    if (!this.container) return;
    const p = Math.max(0, Math.min(1, progress));
    const eased = p * p * (3 - 2 * p);
    const offsetVh = 38 * (1 - eased);
    this.container.style.setProperty('--morph-lyrics-offset-y', `${offsetVh.toFixed(2)}vh`);
  }

  setLyric(lyricText) {
    const clean = lyricText ? lyricText.trim() : "";
    if (clean === this.targetText && !this.isMorphing) return;

    // If not visible, immediately update state without wasting animation frames
    if (!this.isVisible) {
      this.currentText = clean;
      this.targetText = clean;
      this.fromText = "";
      this.isMorphing = false;
      this.morphProgress = 1;
      this.settleText(clean);
      return;
    }

    // Determine current visual source text
    if (this.isMorphing) {
      this.fromText = (this.morphProgress >= 0.5 ? this.targetText : this.fromText) || this.currentText;
    } else {
      this.fromText = this.currentText;
    }

    this.targetText = clean;
    this.morphProgress = 0;
    this.isMorphing = true;
    this.lastTime = performance.now();

    this.currentDuration = clean ? this.morphDuration : 0.22;

    // Toggle container empty state for instrumental breaks
    if (this.container) {
      if (!clean) {
        this.container.classList.add('is-empty');
      } else {
        this.container.classList.remove('is-empty');
      }
    }

    this.startAnimation();
  }

  setStyles(p, fromText, toText) {
    if (!this.text1El || !this.text2El) return;

    const progress = Math.max(0, Math.min(1, p));

    // Phase 1: Outgoing text dissolves and ascends (0.00 -> 0.45)
    if (fromText && progress <= 0.45) {
      const outP = progress / 0.45;
      const outBlur = outP * 4.0;
      const outOp = Math.max(0, 1 - outP);
      const outY = -outP * 5.0;

      this.text1El.textContent = fromText;
      this.text1El.style.filter = outBlur > 0.1 ? `blur(${outBlur.toFixed(1)}px)` : 'none';
      this.text1El.style.opacity = `${(outOp * 100).toFixed(1)}%`;
      this.text1El.style.transform = `translate(-50%, -50%) translateY(${outY.toFixed(1)}px)`;
    } else {
      this.text1El.textContent = '';
      this.text1El.style.opacity = '0%';
      this.text1El.style.filter = 'none';
      this.text1El.style.transform = 'translate(-50%, -50%)';
    }

    // Phase 2: Incoming text coalesces down into crisp focus (0.35 -> 1.00)
    if (toText && progress >= 0.35) {
      const inP = (progress - 0.35) / 0.65;
      const inBlur = (1 - inP) * 4.0;
      const inOp = Math.min(1, inP);
      const inY = (1 - inP) * 5.0;

      this.text2El.textContent = toText;
      this.text2El.style.filter = inBlur > 0.1 ? `blur(${inBlur.toFixed(1)}px)` : 'none';
      this.text2El.style.opacity = `${(inOp * 100).toFixed(1)}%`;
      this.text2El.style.transform = `translate(-50%, -50%) translateY(${inY.toFixed(1)}px)`;
    } else {
      this.text2El.textContent = '';
      this.text2El.style.opacity = '0%';
      this.text2El.style.filter = 'none';
      this.text2El.style.transform = 'translate(-50%, -50%)';
    }
  }

  settleText(text) {
    this.isMorphing = false;
    this.morphProgress = 1;
    this.currentText = text;

    if (this.container) {
      if (!text) {
        this.container.classList.add('is-empty');
      } else {
        this.container.classList.remove('is-empty');
      }
    }

    if (this.text1El && this.text2El) {
      this.text1El.textContent = '';
      this.text1El.style.opacity = '0%';
      this.text1El.style.filter = 'none';
      this.text1El.style.transform = 'translate(-50%, -50%)';

      this.text2El.textContent = text;
      this.text2El.style.opacity = text ? '100%' : '0%';
      this.text2El.style.filter = 'none';
      this.text2El.style.transform = 'translate(-50%, -50%)';
    }
  }

  startAnimation() {
    this.stopAnimation();
    this.lastTime = performance.now();

    const animate = (now) => {
      if (!this.isMorphing) {
        this.stopAnimation();
        return;
      }

      this.animationFrameId = requestAnimationFrame(animate);

      const dt = Math.min((now - this.lastTime) / 1000, 0.1);
      this.lastTime = now;

      const dur = this.currentDuration || this.morphDuration;
      this.morphProgress += dt / dur;
      if (this.morphProgress >= 1) {
        this.morphProgress = 1;
        this.settleText(this.targetText);
        this.stopAnimation();
      } else {
        this.setStyles(this.morphProgress, this.fromText, this.targetText);
      }
    };

    this.animationFrameId = requestAnimationFrame(animate);
  }

  stopAnimation() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  destroy() {
    this.stopAnimation();
  }
}
