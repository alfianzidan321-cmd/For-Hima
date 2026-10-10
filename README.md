# For Hima

Sebuah web interaktif sinematik dengan visual mewah, perpaduan parallax bertingkat, tipografi dinamis, efek starlight torch, buku 3D interaktif, dan padang bunga bioluminescent 3D (Three.js).

## Fitur Utama

- **Osmo Parallax Header**: Visual gunung berlapis (*Sky, Stone Mountain, Living Moss, Title, Dataran Foreground*) dengan pencahayaan torch kursor.
- **Floating Synchronized Lyrics & Audio**: Musik & lirik tersinkronisasi (*Rex Orange County Playlist: Best Friend, Happiness, Amazing*).
- **Infinite Curved Word Wheel**: Roda kata interaktif berputar (*InfinityText*) dengan mode otomatis dan snap lock.
- **Interactive Split Logo Reveal**: "YOU ARE MY" dengan video reveal (*LogoHover*), tersinkronisasi langsung mengunci "BEST FRIEND" pada infinite wheel saat di-hover.
- **Poetic Generation & Dynamic Word Cycler**: Efek teks puitis bertahap (*TextGenerateEffect*) dan siklus kata (*AnimatedTextCycle*).
- **Multilingual Love Heart**: Tipografi siluet hati masif multibahasa.
- **Interactive 3D Keepsake Storybook**: Buku 3D interaktif yang dapat dibuka dan dibolak-balik per lembar dengan bayangan crease lembut dan tekstur kertas alami.
- **3D Bioluminescent Flora Meadow**: Padang bunga 3D berbasis Three.js dengan efek mekar dan pertumbuhan sesuai scroll.

## Cara Menjalankan

```bash
# 1. Install dependensi
npm install

# 2. Jalankan server pengembangan
npm run dev

# 3. Build untuk produksi
npm run build
```

## Teknologi

- **Vite** (Build Tool)
- **Three.js** (3D WebGL Engine & Shaders)
- **GSAP & ScrollTrigger** (Animasi interaktif)
- **Lenis** (Smooth Scrolling)
