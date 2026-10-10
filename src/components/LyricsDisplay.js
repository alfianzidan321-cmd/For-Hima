/**
 * LyricsDisplay.js
 * High-performance, millisecond-accurate synchronized lyrics & multi-track music player
 * Tracks by Rex Orange County:
 * 1. "Best Friend"
 * 2. "Happiness"
 * 3. "AMAZING"
 * Features:
 * - Randomized track on startup
 * - Randomized next track on song completion (seamless playlist shuffle)
 * - Interactive Shuffle / Randomize button
 * - Millisecond-synchronized lyrics display and liquid morphing broadcast
 */

export const BEST_FRIEND_TRACK = [
  { time: 0.0, text: "I should've stayed at home" },
  { time: 3.76, text: "'Cause right now I see all these people that love me" },
  { time: 6.62, text: "But I still feel alone" },
  { time: 9.66, text: "Can't help but check my phone" },
  { time: 12.72, text: "I could've made you mine" },
  { time: 16.10, text: "But no, it wasn't meant to be" },
  { time: 18.22, text: "And see, I wasn't made for you" },
  { time: 19.92, text: "And you weren't made for me" },
  { time: 23.04, text: "Though it seemed so easy" },
  { time: 28.78, text: "And that's because I wanna be your favorite boy" },
  { time: 35.76, text: "I wanna be the one that makes your day" },
  { time: 39.02, text: "The one you think about as you lie awake" },
  { time: 43.06, text: "I can't wait to be your number one" },
  { time: 49.08, text: "I'll be your biggest fan and you'll be mine" },
  { time: 52.20, text: "But I still wanna break your heart and make you cry" },
  { time: 57.32, text: "But won't you wait?" },
  { time: 60.64, text: "You know it's too late" },
  { time: 64.38, text: "I'm on my own now" },
  { time: 67.66, text: "Let me tell you how it feels to be great" },
  { time: 73.80, text: "I feel great..." },
  { time: 78.00, text: "" }, // Instrumental piano transition
  { time: 84.00, text: "You need to be yourself" },
  { time: 86.92, text: "Love someone for loving you instead of someone really cool" },
  { time: 91.00, text: "That makes your heart melt" },
  { time: 93.78, text: "Who knows what you truly felt?" },
  { time: 97.24, text: "You're still my favorite girl" },
  { time: 100.88, text: "You better trust me when I tell you" },
  { time: 102.82, text: "There ain't no one else more beautiful" },
  { time: 104.40, text: "In this whole world" },
  { time: 107.47, text: "In this whole world..." },
  { time: 111.00, text: "" }, // Instrumental groove break
  { time: 116.20, text: "You're gonna wanna be my best friend, baby" },
  { time: 119.52, text: "You're gonna wanna be my best friend (I said that)" },
  { time: 129.40, text: "You're gonna wanna be my best friend, baby" },
  { time: 132.82, text: "You're gonna wanna be my best friend" },
  { time: 136.50, text: "" }, // Instrumental horns break
  { time: 142.60, text: "You're gonna wanna be my best friend, baby" },
  { time: 146.04, text: "You're gonna wanna be my best friend" },
  { time: 150.00, text: "" }, // Instrumental beat break
  { time: 155.86, text: "You're gonna wanna be my best friend, baby" },
  { time: 159.34, text: "You're gonna wanna be my best friend..." },
  { time: 163.00, text: "" }, // Instrumental bridge build-up
  { time: 167.62, text: "I say that I'm happy" },
  { time: 172.34, text: "I say that I'm happy" },
  { time: 174.98, text: "But no, no, no, no" },
  { time: 179.94, text: "No, no, no, oh..." },
  { time: 182.40, text: "I still wanna be your favorite boy" },
  { time: 187.66, text: "I wanna be the one that makes your day" },
  { time: 191.78, text: "The one you think about as you lie awake" },
  { time: 195.96, text: "And I can't wait to be your number one" },
  { time: 201.28, text: "I'll be your biggest fan and you'll be mine" },
  { time: 204.62, text: "But I still wanna break your heart and make you cry" },
  { time: 208.50, text: "" }, // Instrumental Guitar & Horns Solo
  { time: 238.22, text: "I still wanna be your favorite boy" },
  { time: 245.58, text: "I wanna be the one, I might just be the one" },
  { time: 249.66, text: "I might just be the one..." }
];

export const HAPPINESS_TRACK = [
  { time: 0.0, text: "I'll be the one that stays 'til the end" },
  { time: 5.5, text: "And I'll be the one that needs you again" },
  { time: 12.5, text: "And I'll be the one that proposes in a garden of roses" },
  { time: 20.5, text: "And truly loves you long after our curtain closes" },
  { time: 27.8, text: "But will you still love me when nobody wants me around?" },
  { time: 39.5, text: "When I turn 81 and forget things" },
  { time: 46.5, text: "Will you still be proud?" },
  { time: 53.5, text: "'Cause I am the one who's waited this long" },
  { time: 63.0, text: "And I am the one that might get it wrong" },
  { time: 67.5, text: "And I'll be the one that will love you" },
  { time: 71.5, text: "The way I'm supposed to, girl, oh" },
  { time: 81.5, text: "But will you still love me when nobody wants me around, around?" },
  { time: 94.5, text: "When I turn 81 and forget things" },
  { time: 101.0, text: "Will you still be proud?" },
  { time: 108.5, text: "Proud of me, of my short list of accomplishments, say" },
  { time: 116.5, text: "And me and my lack of new news" },
  { time: 123.5, text: "Me and my selfishness, oh, me and myself" },
  { time: 129.5, text: "Wish you nothing but a happy new version of you" },
  { time: 136.5, text: "Because I, I... mm-mmh" },
  { time: 145.0, text: "I want you to tell me you find it hard to be yourself" },
  { time: 152.5, text: "So I can say it's gonna be alright, yeah" },
  { time: 160.5, text: "And I want you to love me the way you love your family" },
  { time: 168.5, text: "The way you love to show me what it's like to be happy" },
  { time: 180.0, text: "To show me what it's like to be happy..." },
  { time: 195.0, text: "What it's like to be happy..." },
  { time: 212.0, text: "" }, // Instrumental orchestral strings & horns climax
  { time: 250.0, text: "" }  // Instrumental gentle piano outro
];

export const AMAZING_TRACK = [
  { time: 0.0, text: "" }, // Instrumental orchestral strings intro
  { time: 29.2, text: "There's no way to time it" },
  { time: 34.5, text: "And where you may find it is unknown" },
  { time: 40.2, text: "Until then, you're a loner" },
  { time: 44.8, text: "So you see her, she's over in the corner" },
  { time: 50.5, text: "And you can't ignore her" },
  { time: 55.0, text: "There must be a reason" },
  { time: 58.8, text: "You see it, believe it now" },
  { time: 62.0, text: "Search the definition of shame" },
  { time: 64.5, text: "I'm sure you'll see my face" },
  { time: 69.5, text: "Who's gonna save me now?" },
  { time: 72.2, text: "I hope it's you, my babe" },
  { time: 77.0, text: "Don't change a thing, you are amazing" },
  { time: 81.2, text: "I can't believe you've come and saved me" },
  { time: 85.2, text: "We can stay here, spend every day here" },
  { time: 89.5, text: "I don't mind, no" },
  { time: 92.8, text: "Don't change a thing, you are amazing" },
  { time: 96.8, text: "I can't believe you've come and saved me" },
  { time: 100.8, text: "We can stay here, spend every day here" },
  { time: 104.8, text: "I don't mind" },
  { time: 107.5, text: "See her, she's over in the corner" },
  { time: 113.2, text: "And I can't ignore her" },
  { time: 116.8, text: "I hope there's a reason" },
  { time: 121.0, text: "To see it, I see it now" },
  { time: 128.0, text: "" }, // Instrumental musical transition
  { time: 138.5, text: "Search the definition of afraid" },
  { time: 141.5, text: "And I'm sure you'll see my face" },
  { time: 146.8, text: "Who's gonna save me now?" },
  { time: 149.5, text: "I hope it's you, my babe" },
  { time: 154.5, text: "Don't change a thing, you are amazing" },
  { time: 158.5, text: "I can't believe you've come and saved me" },
  { time: 162.5, text: "We can stay here, spend every day dear" },
  { time: 166.8, text: "I wouldn't mind" },
  { time: 170.0, text: "Don't change a thing, you are amazing" },
  { time: 174.0, text: "I can't believe you've come and saved me" },
  { time: 177.5, text: "We can stay here, spend every day here" },
  { time: 181.5, text: "Oh, I don't mind, that's all right" },
  { time: 188.5, text: "(Yeah)" },
  { time: 193.0, text: "Don't change a thing, you are amazing..." },
  { time: 202.0, text: "" }  // Instrumental strings outro
];

export const PLAYLIST = [
  {
    id: 'best_friend',
    title: 'Best Friend',
    artist: 'Rex Orange County',
    tag: 'Rex Orange County — Best Friend',
    src: '/assets/best_friend.mp3',
    initialText: "I should've stayed at home",
    lyrics: BEST_FRIEND_TRACK
  },
  {
    id: 'happiness',
    title: 'Happiness',
    artist: 'Rex Orange County',
    tag: 'Rex Orange County — Happiness',
    src: '/assets/happiness.mp3',
    initialText: "I'll be the one that stays 'til the end",
    lyrics: HAPPINESS_TRACK
  },
  {
    id: 'amazing',
    title: 'AMAZING',
    artist: 'Rex Orange County',
    tag: 'Rex Orange County — AMAZING',
    src: '/assets/amazing.mp3',
    initialText: "Don't change a thing, you are amazing",
    lyrics: AMAZING_TRACK
  }
];

export class LyricsDisplay {
  constructor(containerId = 'parallax-lyrics', audioId = 'bg-music', onLyricChange = null) {
    this.container = document.getElementById(containerId);
    this.audio = document.getElementById(audioId);
    this.textEl = document.getElementById('lyrics-text');
    this.audioBtn = document.getElementById('lyrics-audio-btn');
    this.playIcon = document.getElementById('lyrics-play-icon');
    this.playText = document.getElementById('lyrics-play-text');
    this.soundWave = document.getElementById('sound-wave');
    this.songTagEl = document.getElementById('lyrics-song-tag');
    this.shuffleBtn = document.getElementById('lyrics-shuffle-btn');
    this.onLyricChange = onLyricChange;

    this.tracks = PLAYLIST;
    // Pick a random track on initial load
    this.currentTrackIndex = Math.floor(Math.random() * this.tracks.length);
    this.currentTrack = this.tracks[this.currentTrackIndex];

    this.currentIndex = 0;
    this.idleInterval = null;
    this.transitionTimeout = null;
    this.rafId = null;
    this.isPlaying = false;

    if (this.container && this.textEl) {
      this.init();
    }
  }

  init() {
    this.applyTrackMeta(this.currentTrack, false);

    // Audio setup
    if (this.audio) {
      this.audio.volume = 0.85;
      this.audio.src = this.currentTrack.src;

      this.audio.addEventListener('play', () => {
        this.isPlaying = true;
        this.updatePlayStateUI(true);
        this.stopIdleTimer();
        this.startRafLoop();
      });

      this.audio.addEventListener('pause', () => {
        this.isPlaying = false;
        this.updatePlayStateUI(false);
        this.stopRafLoop();
        this.startIdleTimer();
      });

      // When a song finishes playing, automatically pick a random next track!
      this.audio.addEventListener('ended', () => {
        this.playRandomTrack(true);
      });

      // Reliable sync events
      this.audio.addEventListener('timeupdate', () => {
        this.syncAudioLyrics();
      });

      this.audio.addEventListener('seeked', () => {
        this.syncAudioLyrics(true);
      });
    }

    // Toggle play on button click
    if (this.audioBtn) {
      this.audioBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.togglePlay();
      });
    }

    // Shuffle / Randomize button click
    if (this.shuffleBtn) {
      this.shuffleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.playRandomTrack(true);
      });
    }

    // Clicking pill also toggles playback or advances
    this.container.addEventListener('click', (e) => {
      if (e.target.closest('#lyrics-audio-btn') || e.target.closest('#lyrics-shuffle-btn')) return;
      if (this.isPlaying) {
        this.skipToNextLine();
      } else {
        this.togglePlay();
      }
    });

    // Start idle rotation if music not yet started
    this.startIdleTimer();

    // Tab visibility handling
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (!this.isPlaying) this.stopIdleTimer();
      } else {
        if (!this.isPlaying) this.startIdleTimer();
      }
    });

    // Attempt automatic playback immediately on web open
    this.attemptAutoplay();
  }

  applyTrackMeta(track, resetAudio = true) {
    if (this.songTagEl) {
      this.songTagEl.textContent = track.tag;
    }
    if (this.audio && resetAudio) {
      this.audio.src = track.src;
      this.audio.currentTime = 0;
    }
    this.currentIndex = 0;
    const initial = track.initialText || (track.lyrics[0]?.text || "");
    this.textEl.textContent = initial;
    this.textEl.classList.remove('lyric--out', 'lyric--prepare');
    this.textEl.classList.add('lyric--in');

    if (this.onLyricChange) {
      this.onLyricChange(initial, 0, track);
    }
  }

  playRandomTrack(autoPlay = true) {
    let nextIdx = Math.floor(Math.random() * this.tracks.length);
    if (this.tracks.length > 1) {
      while (nextIdx === this.currentTrackIndex) {
        nextIdx = Math.floor(Math.random() * this.tracks.length);
      }
    }
    this.switchTrack(nextIdx, autoPlay);
  }

  switchTrack(index, autoPlay = true) {
    if (index < 0 || index >= this.tracks.length) return;
    this.currentTrackIndex = index;
    this.currentTrack = this.tracks[index];

    this.stopIdleTimer();
    this.stopRafLoop();

    this.applyTrackMeta(this.currentTrack, true);

    if (autoPlay && this.audio) {
      const playPromise = this.audio.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          this.isPlaying = true;
          this.updatePlayStateUI(true);
          this.startRafLoop();
          this.syncAudioLyrics();
        }).catch((err) => {
          console.warn('Playback prevented after track switch:', err);
          this.isPlaying = false;
          this.updatePlayStateUI(false);
          this.startIdleTimer();
        });
      }
    } else {
      this.isPlaying = false;
      this.updatePlayStateUI(false);
      this.startIdleTimer();
    }
  }

  attemptAutoplay() {
    if (!this.audio) return;

    // 1. Immediate play attempt on page load
    const playPromise = this.audio.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        this.isPlaying = true;
        this.updatePlayStateUI(true);
        this.stopIdleTimer();
        this.startRafLoop();
        this.syncAudioLyrics();
      }).catch(() => {
        // 2. If browser autoplay policy blocks unprompted audio,
        // trigger playback on the very first user gesture
        const startOnFirstGesture = () => {
          if (!this.isPlaying && this.audio && this.audio.paused) {
            this.audio.play().then(() => {
              this.isPlaying = true;
              this.updatePlayStateUI(true);
              this.stopIdleTimer();
              this.startRafLoop();
              this.syncAudioLyrics();
            }).catch(() => {});
          }
          ['pointerdown', 'click', 'keydown', 'wheel', 'scroll', 'touchstart'].forEach(evt => {
            window.removeEventListener(evt, startOnFirstGesture, { capture: true });
            document.removeEventListener(evt, startOnFirstGesture, { capture: true });
          });
        };

        ['pointerdown', 'click', 'keydown', 'wheel', 'scroll', 'touchstart'].forEach(evt => {
          window.addEventListener(evt, startOnFirstGesture, { once: true, capture: true, passive: true });
          document.addEventListener(evt, startOnFirstGesture, { once: true, capture: true, passive: true });
        });
      });
    }
  }

  startRafLoop() {
    this.stopRafLoop();
    const tick = () => {
      if (this.isPlaying && this.audio && !this.audio.paused) {
        this.syncAudioLyrics();
        this.rafId = requestAnimationFrame(tick);
      }
    };
    this.rafId = requestAnimationFrame(tick);
  }

  stopRafLoop() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  togglePlay() {
    if (!this.audio) return;
    if (this.audio.paused) {
      const playPromise = this.audio.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          this.isPlaying = true;
          this.updatePlayStateUI(true);
          this.stopIdleTimer();
          this.startRafLoop();
          this.syncAudioLyrics();
        }).catch((err) => {
          console.warn('Audio playback prevented or waiting for user interaction:', err);
        });
      }
    } else {
      this.audio.pause();
      this.isPlaying = false;
      this.updatePlayStateUI(false);
      this.stopRafLoop();
      this.startIdleTimer();
    }
  }

  updatePlayStateUI(playing) {
    if (this.playIcon) this.playIcon.textContent = playing ? '⏸' : '▶';
    if (this.playText) this.playText.textContent = playing ? 'Playing' : 'Play Music';
    if (this.soundWave) {
      if (playing) {
        this.soundWave.classList.add('active');
      } else {
        this.soundWave.classList.remove('active');
      }
    }
    if (this.container) {
      if (playing) {
        this.container.classList.add('playing');
      } else {
        this.container.classList.remove('playing');
      }
    }
  }

  syncAudioLyrics(force = false) {
    if (!this.audio) return;
    if (!force && this.audio.paused) return;
    const lyricsList = this.currentTrack.lyrics;
    if (!lyricsList || lyricsList.length === 0) return;

    // 0.08s lead compensation for zero audio latency lag
    const curTime = this.audio.currentTime + 0.08;

    let targetIdx = 0;
    for (let i = 0; i < lyricsList.length; i++) {
      if (curTime >= lyricsList[i].time) {
        targetIdx = i;
      } else {
        break;
      }
    }

    if (targetIdx !== this.currentIndex) {
      this.transitionTo(targetIdx);
    }
  }

  skipToNextLine() {
    const lyricsList = this.currentTrack.lyrics;
    let nextIdx = (this.currentIndex + 1) % lyricsList.length;
    // Skip empty instrumental entries when manually skipping
    while (!lyricsList[nextIdx].text && nextIdx !== this.currentIndex) {
      nextIdx = (nextIdx + 1) % lyricsList.length;
    }
    if (this.audio && !this.audio.paused) {
      this.audio.currentTime = lyricsList[nextIdx].time;
    }
    this.transitionTo(nextIdx);
  }

  startIdleTimer() {
    this.stopIdleTimer();
    const lyricsList = this.currentTrack.lyrics;
    this.idleInterval = setInterval(() => {
      if (this.isPlaying) return;
      let nextIdx = (this.currentIndex + 1) % lyricsList.length;
      while (!lyricsList[nextIdx].text && nextIdx !== this.currentIndex) {
        nextIdx = (nextIdx + 1) % lyricsList.length;
      }
      this.transitionTo(nextIdx);
    }, 4500);
  }

  stopIdleTimer() {
    if (this.idleInterval) {
      clearInterval(this.idleInterval);
      this.idleInterval = null;
    }
  }

  transitionTo(index, overrideText = null) {
    const lyricsList = this.currentTrack.lyrics;
    const nextText = overrideText !== null ? overrideText : (lyricsList[index]?.text || "");

    if (this.currentIndex === index && this.textEl.textContent === nextText) return;

    if (this.transitionTimeout) {
      clearTimeout(this.transitionTimeout);
      this.transitionTimeout = null;
    }

    this.currentIndex = index;

    if (this.onLyricChange) {
      this.onLyricChange(nextText, index, this.currentTrack);
    }

    // Fast, responsive 100ms fade-out
    this.textEl.classList.remove('lyric--in', 'lyric--prepare');
    this.textEl.classList.add('lyric--out');

    this.transitionTimeout = setTimeout(() => {
      this.textEl.textContent = nextText;

      if (nextText.trim() !== '') {
        this.textEl.classList.remove('lyric--out');
        this.textEl.classList.add('lyric--prepare');
        void this.textEl.offsetWidth; // Force reflow

        this.textEl.classList.remove('lyric--prepare');
        this.textEl.classList.add('lyric--in');
      } else {
        // Instrumental break: keep text clean and hidden (no placeholder lyrics)
        this.textEl.classList.remove('lyric--prepare', 'lyric--in');
        this.textEl.classList.add('lyric--out');
      }
      this.transitionTimeout = null;
    }, 100);
  }

  getCurrentLyric() {
    const lyricsList = this.currentTrack.lyrics;
    const item = lyricsList[this.currentIndex];
    return item !== undefined ? item.text : (this.currentTrack.initialText || "");
  }

  getCurrentTrack() {
    return this.currentTrack;
  }

  destroy() {
    this.stopIdleTimer();
    this.stopRafLoop();
    if (this.transitionTimeout) clearTimeout(this.transitionTimeout);
    if (this.audio) {
      this.audio.pause();
    }
  }
}
