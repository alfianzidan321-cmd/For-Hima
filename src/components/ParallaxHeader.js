import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Utility clamp function matching Framer math: lo(val, min, max)
 */
function clamp(val, min, max) {
  return Math.min(max, Math.max(min, val));
}

/**
 * Exact Framer radial gradient mask generator (from exquisite-road-005415.framer.app):
 * radial-gradient(circle ${r}px at ${x}px ${y}px, rgba(0,0,0,1) 0px, rgba(0,0,0,1) ${solidRadius}px, rgba(0,0,0,0) ${r}px)
 */
function buildFramerRadialMask(x, y, outerRadius, edgeBlur) {
  const r = Math.max(1, outerRadius);
  const blur = clamp(edgeBlur, 0, r);
  const solidRadius = Math.max(0, r - blur);
  return `radial-gradient(circle ${r}px at ${x.toFixed(1)}px ${y.toFixed(1)}px, rgba(0, 0, 0, 1) 0px, rgba(0, 0, 0, 1) ${solidRadius.toFixed(1)}px, rgba(0, 0, 0, 0) ${r.toFixed(1)}px)`;
}

export class ParallaxHeader {
  constructor(container) {
    this.container = container;
    this.initParallax();
    this.initHoverMask();
  }

  initParallax() {
    const triggerElement = this.container.querySelector('[data-parallax-layers]');
    if (!triggerElement) return;

    this.tl = gsap.timeline({
      scrollTrigger: {
        trigger: this.container,
        start: 'top top',
        end: 'bottom top',
        scrub: 0
      }
    });

    // 4-layer speed offsets calibrated for natural depth and contained boundaries
    const layers = [
      { layer: '1', yPercent: 20 },  // Sky background
      { layer: '2', yPercent: 12 },  // Mountain (rock base + moss)
      { layer: '3', yPercent: 15 },  // HI, HIMA title
      { layer: '4', yPercent: 0 }    // Dataran foreground ridge (anchored at base)
    ];

    layers.forEach((layerObj, idx) => {
      this.tl.to(
        triggerElement.querySelectorAll(`[data-parallax-layer="${layerObj.layer}"]`),
        {
          yPercent: layerObj.yPercent,
          ease: 'none'
        },
        idx === 0 ? undefined : '<'
      );
    });
  }

  initHoverMask() {
    const visuals = this.container.querySelector('.parallax__visuals');
    const mountainMoss = this.container.querySelector('.parallax__mountain-moss');
    const foregroundMoss = this.container.querySelector('.parallax__foreground-moss');

    if (!visuals || !mountainMoss) return;

    // Responsive configuration matching exquisite-road-005415.framer.app:
    // Desktop: maskSize = 1000px (r = 500px), edgeBlur = 200px, followDelay = 1.0s
    // Tablet (<1200px): maskSize = 780px (r = 390px), edgeBlur = 180px, followDelay = 1.0s
    // Mobile (<810px): maskSize = 560px (r = 280px), edgeBlur = 140px, followDelay = 1.0s + cosine auto-pan
    const getResponsiveConfig = () => {
      const width = window.innerWidth;
      if (width < 810) {
        return { maskSize: 560, edgeBlur: 140, followDelay: 1.0, isMobile: true };
      } else if (width < 1200) {
        return { maskSize: 780, edgeBlur: 180, followDelay: 1.0, isMobile: false };
      } else {
        return { maskSize: 1000, edgeBlur: 200, followDelay: 1.0, isMobile: false };
      }
    };

    let config = getResponsiveConfig();
    let outerRadius = Math.max(1, config.maskSize / 2);
    let edgeBlur = config.edgeBlur;
    let followDelay = config.followDelay;

    // Cache bounds
    let visualsRect = visuals.getBoundingClientRect();
    let mRect = mountainMoss.getBoundingClientRect();
    let fRect = foregroundMoss ? foregroundMoss.getBoundingClientRect() : null;

    const updateBounds = () => {
      config = getResponsiveConfig();
      outerRadius = Math.max(1, config.maskSize / 2);
      edgeBlur = config.edgeBlur;
      followDelay = config.followDelay;

      visualsRect = visuals.getBoundingClientRect();
      mRect = mountainMoss.getBoundingClientRect();
      if (foregroundMoss) fRect = foregroundMoss.getBoundingClientRect();
    };

    this.updateBounds = updateBounds;
    window.addEventListener('resize', updateBounds, { passive: true });
    window.addEventListener('scroll', updateBounds, { passive: true });

    // Resting position matching Framer component:
    // targetX = outerRadius - 200, targetY = height * 0.5 - 200
    // This perfectly centers the spotlight onto the lush left mountain crest on initial view!
    const getRestingPos = () => {
      const vH = visualsRect.height || window.innerHeight;
      return {
        x: visualsRect.left + Math.max(60, outerRadius - 200),
        y: visualsRect.top + Math.max(60, vH * 0.5 - 200)
      };
    };

    const initialResting = getRestingPos();
    let currentX = initialResting.x;
    let currentY = initialResting.y;
    let targetX = initialResting.x;
    let targetY = initialResting.y;
    let isUserHovering = false;
    let lastTime = null;

    let lastRenderedX = -9999;
    let lastRenderedY = -9999;

    // Apply exact Framer mask gradient to element with subpixel DOM caching
    const applyMask = (x, y) => {
      if (Math.abs(x - lastRenderedX) < 0.25 && Math.abs(y - lastRenderedY) < 0.25) {
        return;
      }
      lastRenderedX = x;
      lastRenderedY = y;

      // 1. Mountain Moss Layer
      if (mountainMoss && mRect && mRect.width > 0 && mRect.height > 0) {
        const mX = clamp(x - mRect.left, 0, mRect.width);
        const mY = clamp(y - mRect.top, 0, mRect.height);
        const mMask = buildFramerRadialMask(mX, mY, outerRadius, edgeBlur);
        mountainMoss.style.webkitMaskImage = mMask;
        mountainMoss.style.maskImage = mMask;
      }

      // 2. Foreground Dataran Moss Layer
      if (foregroundMoss && fRect && fRect.width > 0 && fRect.height > 0) {
        const fX = clamp(x - fRect.left, 0, fRect.width);
        const fY = clamp(y - fRect.top, 0, fRect.height);
        const fMask = buildFramerRadialMask(fX, fY, outerRadius, edgeBlur);
        foregroundMoss.style.webkitMaskImage = fMask;
        foregroundMoss.style.maskImage = fMask;
      }
    };

    // Initialize immediate mask
    applyMask(currentX, currentY);

    const onPointerMove = (e) => {
      isUserHovering = true;
      targetX = clamp(e.clientX, visualsRect.left, visualsRect.right);
      targetY = clamp(e.clientY, visualsRect.top, visualsRect.bottom);
    };

    const onPointerLeave = () => {
      isUserHovering = false;
      const resting = getRestingPos();
      targetX = resting.x;
      targetY = resting.y;
    };

    this.onPointerMove = onPointerMove;
    this.onPointerLeave = onPointerLeave;

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('mouseleave', onPointerLeave, { passive: true });

    // Framer Physics Animation Loop:
    // Frame-rate independent exponential decay with quadratic ease-out step
    const updateLoop = (timestamp) => {
      this.rafId = requestAnimationFrame(updateLoop);

      // Bypass mask processing when scrolled completely past the header
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      if (scrollY > (visualsRect.height || window.innerHeight) + 50) {
        return;
      }

      const now = timestamp || performance.now();
      const prev = lastTime ?? now;
      lastTime = now;

      // Mobile organic cosine panning if not actively touched
      if (config.isMobile && !isUserHovering) {
        const period = 60; // 60s cycle matching Framer component
        const r = (now / 1000) % period;
        const progress = r / period;
        const vW = visualsRect.width || window.innerWidth;
        const vH = visualsRect.height || window.innerHeight;
        targetX = visualsRect.left + (0.5 - 0.5 * Math.cos(2 * Math.PI * progress)) * vW;
        targetY = visualsRect.top + vH * 0.5;
      }

      const dt = Math.max(0, Math.min(0.25, (now - prev) / 1000));
      const Te = Math.max(0, followDelay);
      const alpha = Te <= 0 ? 1 : 1 - Math.exp(-dt / Te);
      const stepFactor = 1 - Math.pow(1 - alpha, 2);

      const dx = targetX - currentX;
      const dy = targetY - currentY;
      if (Math.abs(dx) < 0.05 && Math.abs(dy) < 0.05) {
        currentX = targetX;
        currentY = targetY;
      } else {
        currentX += dx * stepFactor;
        currentY += dy * stepFactor;
      }

      applyMask(currentX, currentY);
    };

    this.rafId = requestAnimationFrame(updateLoop);
  }

  destroy() {
    if (this.tl) this.tl.kill();
    if (this.rafId) cancelAnimationFrame(this.rafId);
    if (this.updateBounds) {
      window.removeEventListener('resize', this.updateBounds);
      window.removeEventListener('scroll', this.updateBounds);
    }
    if (this.onPointerMove) window.removeEventListener('pointermove', this.onPointerMove);
    if (this.onPointerLeave) document.removeEventListener('mouseleave', this.onPointerLeave);
  }
}
