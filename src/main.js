import './style.css';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ParallaxHeader } from './components/ParallaxHeader.js';
import { LyricsDisplay } from './components/LyricsDisplay.js';
import { MorphingLyrics } from './components/MorphingLyrics.js';
import { FlowerEngine } from './flower/FlowerEngine.js';
import { LogoHover } from './components/LogoHover.js';
import { InfinityText } from './components/InfinityText.js';
import { AnimatedTextCycle } from './components/AnimatedTextCycle.js';
import { TextGenerateEffect } from './components/TextGenerateEffect.js';
import { TorchBacklight } from './components/TorchBacklight.js';
import { LoveHeart } from './components/LoveHeart.js';
import { InteractiveBook } from './components/InteractiveBook.js';

gsap.registerPlugin(ScrollTrigger);

// Prevent browser from restoring scroll position on reload
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

// 1. Initialize Lenis Smooth Scroll (Silky luxury exponential easing, zero jitter)
const lenis = new Lenis({
  duration: 1.35,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  wheelMultiplier: 0.88,
  touchMultiplier: 1.1,
  infinite: false
});

lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

// 2. Initialize Parallax Header
const parallaxContainer = document.getElementById('parallax-header');
let parallax = null;
if (parallaxContainer) {
  parallax = new ParallaxHeader(parallaxContainer);
}

// 2.3. Initialize Interactive Framer Logo Hover ("YOU ARE / MY" with Best Friend Video)
// 2.3. Initialize InfinityText Wheel (Framer InfinityText with poetic words)
const infinityTextRoot = document.getElementById('infinity-text-root');
let infinityText = null;
if (infinityTextRoot) {
  infinityText = new InfinityText({
    container: infinityTextRoot,
    items: [
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
    ],
    curve: 36,
    baseTextLeft: 28,
    rowGap: 14,
    fontSize: 42,
    lineHeight: 42,
    scrollMultiplier: 0.0075,
    autoScrollSpeed: 0.0009
  });
}

// 2.4. Initialize LogoHover Component (Split "YOU ARE / MY" with video reveal)
// User request: when YOU ARE MY is hovered, immediately lock infinite text on BEST FRIEND
const logoHoverRoot = document.getElementById('logo-hover-root');
let logoHover = null;
if (logoHoverRoot) {
  logoHover = new LogoHover({
    container: logoHoverRoot,
    topWord: 'YOU ARE',
    bottomWord: 'MY',
    videoSrc: '/assets/18913ac2-d05c-492b-8eb8-289adb6cd45f.mp4',
    onHoverStart: () => {
      if (infinityText) {
        infinityText.lockToItem('BEST FRIEND');
      }
    },
    onHoverEnd: () => {
      if (infinityText) {
        infinityText.unlock();
      }
    }
  });
}

// 2.44. Initialize TextGenerateEffect Component (Left column poetic reveal)
const textGenRoot = document.getElementById('text-gen-root');
let textGen = null;
if (textGenRoot) {
  textGen = new TextGenerateEffect({
    container: textGenRoot,
    words: "Some people feel like an accidental miracle in an ordinary life. In every quiet night, through laughter that saved the heaviest days, you became the sanctuary where everything finally made sense. No matter where life wanders, across every shifting storm and quiet sunrise...",
    duration: 0.55,
    stagger: 0.08
  });
}

// 2.45. Initialize AnimatedTextCycle Component (Right column dynamic word cycler)
const textCycleRoot = document.getElementById('text-cycle-root');
let textCycle = null;
if (textCycleRoot) {
  textCycle = new AnimatedTextCycle({
    container: textCycleRoot,
    prefix: "You will always be my",
    suffix: "through every season",
    words: [
      "safe place",
      "favorite human",
      "best friend",
      "soulmate",
      "greatest comfort",
      "constant light",
      "purest joy",
      "home"
    ],
    interval: 3000
  });
}

// Connect TextGenerateEffect replay to slide scroll trigger for re-animation on slide switch
const textCycleSectionEl = document.getElementById('text-cycle-section');
if (textCycleSectionEl && textGen) {
  ScrollTrigger.create({
    trigger: textCycleSectionEl,
    start: 'top 85%',
    end: 'bottom 15%',
    onEnter: () => {
      textGen.replay();
    },
    onEnterBack: () => {
      textGen.replay();
    },
    onLeave: () => {
      textGen.reset(true);
    },
    onLeaveBack: () => {
      textGen.reset(true);
    }
  });
}

// 2.5. Initialize Sticky Centered Liquid Morphing Lyrics
const morphingLyrics = new MorphingLyrics({
  containerId: 'sticky-morph-lyrics',
  text1Id: 'morph-text-1',
  text2Id: 'morph-text-2'
});

// 2.6. Initialize Parallax Header Lyrics Player with synchronized callback
const lyricsDisplay = new LyricsDisplay('parallax-lyrics', 'bg-music', (lyric) => {
  morphingLyrics.setLyric(lyric);
});

// 2.7. Initialize Atmospheric Cursor Torch & Reactive Component Backlight (Active post-parallax)
const torchBacklight = new TorchBacklight({
  targetSelectors: [
    '#infinity-text-root',
    '.spacer-logo-wrapper',
    '#text-gen-root',
    '#text-cycle-root'
  ]
});

// 2.8. Initialize Multilingual Love Heart (migrated from iremcnar's love.py)
const loveHeartRoot = document.getElementById('love-heart-root');
let loveHeart = null;
if (loveHeartRoot) {
  loveHeart = new LoveHeart(loveHeartRoot, {
    duration: 9,
    autoPlay: false
  });

  const loveSection = document.getElementById('love-heart-section');
  if (loveSection) {
    let wasInView = false;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.2) {
          if (!wasInView) {
            wasInView = true;
            loveHeart.start();
          }
        } else if (!entry.isIntersecting || entry.intersectionRatio <= 0.02) {
          if (wasInView) {
            wasInView = false;
            loveHeart.reset();
          }
        }
      });
    }, { threshold: [0, 0.2] });
    observer.observe(loveSection);
  }
}

// 2.9. Initialize Interactive 3D Keepsake Book (Framer InteractiveBook recreation)
const bookRoot = document.getElementById('interactive-book-root');
let interactiveBook = null;
if (bookRoot) {
  interactiveBook = new InteractiveBook(bookRoot);
}

// Immediately sync initial lyric
morphingLyrics.syncToCurrent(lyricsDisplay.getCurrentLyric());

// 3. Initialize Three.js 3D Flower Engine
const container = document.getElementById('webgl-canvas-container');
const engine = new FlowerEngine(container);
engine.start();

if (typeof window !== 'undefined') {
  window.lenisInstance = lenis;
  window.infinityTextInstance = infinityText;
  window.flowerEngineInstance = engine;
  window.textCycleInstance = textCycle;
  window.textGenInstance = textGen;
  window.torchBacklightInstance = torchBacklight;
  window.loveHeartInstance = loveHeart;
  window.interactiveBookInstance = interactiveBook;
  window.lyricsDisplayInstance = lyricsDisplay;
}

const scrollHint = document.getElementById('scroll-hint');
const headerLyricsEl = document.getElementById('parallax-lyrics');

// 4. Scroll Tracking Coordination
function updateScroll() {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const headerHeight = parallaxContainer ? parallaxContainer.offsetHeight : window.innerHeight;
  const spacer = document.getElementById('parallax-spacer');
  const spacerHeight = spacer ? spacer.offsetHeight : window.innerHeight * 0.5;
  const cycleSection = document.getElementById('text-cycle-section');
  const cycleHeight = cycleSection ? cycleSection.offsetHeight : 0;
  const loveSection = document.getElementById('love-heart-section');
  const loveHeight = loveSection ? loveSection.offsetHeight : 0;
  const bookSection = document.getElementById('interactive-book-section');
  const bookHeight = bookSection ? bookSection.offsetHeight : 0;
  const totalScroll = document.documentElement.scrollHeight - window.innerHeight;

  const loveStart = headerHeight + spacerHeight + cycleHeight;
  const bookStart = loveStart + loveHeight;
  const meadowStart = bookStart + bookHeight;
  const isMeadowDeep = scrollTop >= (meadowStart + window.innerHeight * 0.9);

  // Parallax header visibility guard:
  // User request: "buat space dari paralax ke komponen dibawahnya, buat paralax tidak terlihat baru terlihat komponen selanjutnya"
  const headerRect = parallaxContainer ? parallaxContainer.getBoundingClientRect() : null;
  const headerBottom = headerRect ? headerRect.bottom : (scrollTop >= headerHeight ? -9999 : 100);
  const isParallaxOutOfView = headerBottom <= 5;
  const isTorchActive = isParallaxOutOfView && !isMeadowDeep;

  // Atmospheric Cursor Torch activation:
  // Immediately active when parallax leaves view and "YOU ARE MY" appears
  torchBacklight.setActive(isTorchActive, headerBottom);

  // Maintain consistent celestial moonlight torch across all post-parallax sections

  const spacerContent = document.querySelector('.spacer-content-container');
  if (spacerContent) {
    if (isParallaxOutOfView) {
      spacerContent.classList.add('is-revealed');
    } else {
      spacerContent.classList.remove('is-revealed');
    }
  }

  // WebGL Canvas Container activation: visible only when approaching and traversing the 3D flower meadow
  const webglContainer = document.getElementById('webgl-canvas-container');
  const isNearMeadow = scrollTop >= (meadowStart - window.innerHeight * 0.5);
  if (webglContainer) {
    if (isNearMeadow) {
      webglContainer.classList.add('is-active');
    } else {
      webglContainer.classList.remove('is-active');
    }
  }

  // Check if primary header lyrics are out of view
  let isHeaderLyricsVisible = true;
  if (headerLyricsEl) {
    const rect = headerLyricsEl.getBoundingClientRect();
    isHeaderLyricsVisible = rect.bottom > 50 && rect.top < window.innerHeight;
  } else {
    isHeaderLyricsVisible = scrollTop < 350;
  }

  // Synchronized Emergence & Rising (Flowers & Lyrics rise TOGETHER in unison!)
  // User request: "lirik scroll keatas pada bagian bunga belum bareng dengan naiknya bunga, buat lebih siync"
  // Emergence starts exactly as user transitions from the cycle section into the flower meadow
  const riseSpan = window.innerHeight * 1.05;
  const emergenceEnd = meadowStart + riseSpan;

  // Second lyrics visibility coordination:
  // User confirmed: "Tampilkan lirik melayang di bagian bawah layar secara kontinu dari bagian 'YOU ARE MY' hingga 'Love Heart'"
  // As soon as primary header lyrics scrolls out of view, floating secondary lyrics stays continuously visible
  // near the bottom of the screen (38vh, like luxury music subtitles) across #parallax-spacer, #text-cycle-section,
  // #love-heart-section, and the meadow prelude, then glides up to center (0vh) as the 3D flowers bloom.
  const shouldShowSecondLyrics = !isHeaderLyricsVisible;

  if (shouldShowSecondLyrics && !morphingLyrics.isVisible) {
    morphingLyrics.syncToCurrent(lyricsDisplay.getCurrentLyric());
  }
  morphingLyrics.setVisible(shouldShowSecondLyrics);

  // 1. Calculate synchronous rise progress (0.0 -> 1.0)
  const rawRise = (scrollTop - meadowStart) / Math.max(1, riseSpan);
  const riseProgress = Math.max(0, Math.min(1, rawRise));
  const easedRise = riseProgress * riseProgress * (3 - 2 * riseProgress);

  // 2. Lyrics rises smoothly from bottom (38vh) to center (0vh)
  // Passing riseProgress applies the smoothstep curve in setApproachProgress
  morphingLyrics.setApproachProgress(riseProgress);

  // 3. Flowers emerge from ground to full stem height simultaneously with lyrics
  const bloomStart = emergenceEnd;
  const availableMeadowScroll = Math.max(1, totalScroll - bloomStart);
  const rawBloom = scrollTop <= bloomStart ? 0.0 : Math.max(0, Math.min(1, (scrollTop - bloomStart) / availableMeadowScroll));
  const easedBloom = rawBloom * rawBloom * (3 - 2 * rawBloom);

  engine.setGrowthAndBloomProgress(easedRise, easedBloom);

  // Fade out scroll hint once user initiates scrolling
  if (scrollHint) {
    if (scrollTop > 40) {
      scrollHint.classList.add('hidden');
    } else {
      scrollHint.classList.remove('hidden');
    }
  }
}

let lastScrollY = window.scrollY || document.documentElement.scrollTop;

lenis.on('scroll', (e) => {
  const currentScrollY = e.scroll !== undefined ? e.scroll : (window.scrollY || document.documentElement.scrollTop);
  const deltaY = currentScrollY - lastScrollY;
  lastScrollY = currentScrollY;

  // User requirement: "affect infinite text per scroll, infinite text scroll lebih cepat dari behavior scroll smooth"
  if (infinityText && Math.abs(deltaY) > 0.05) {
    infinityText.onPageScroll(deltaY, e.velocity || 0);
  }

  // Update flowers and lyrics progression (flower behavior is independent and unaffected by infinity text multiplier)
  updateScroll();
});

window.addEventListener('scroll', updateScroll, { passive: true });

window.addEventListener('resize', () => {
  ScrollTrigger.refresh();
  updateScroll();
}, { passive: true });

// Run initial sync
updateScroll();
