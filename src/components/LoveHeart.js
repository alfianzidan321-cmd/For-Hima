/**
 * LoveHeart.js
 * High-performance JavaScript migration of iremcnar/loveYou (love.py).
 * 
 * Generative typographic heart silhouette composed of "I love you" in 20 languages:
 * - Parametric heart boundary curve: x = 16*sin^3(a), y = 13*cos(a) - 5*cos(2a) - 2*cos(3a) - cos(4a)
 * - Exact scanline span computation and interval intersections
 * - Multilingual phrases with real Canvas text metrics
 * - Edge-first perimeter tracing followed by inner radial filling
 * - Cubic ease-out float animation with luminous flash settling
 * - Continuous ambient shimmering glimmers
 * - Interactive mouse hover halo glow & click pulse
 * - HiDPI / Retina responsive scaling (expanded large scale, pure black background)
 */

export class LoveHeart {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.getElementById(container) : container;
    if (!this.container) return;

    this.options = Object.assign({
      duration: 9,        // Duration in seconds to spawn all phrases
      tickMs: 16,         // Tick rate (~60fps)
      animFrames: 42,     // Frames per phrase float-in
      fontFamily: 'Outfit, -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Arial, sans-serif',
      bgColor: '#000000', // Pure pitch black matching the rest of the site
      interactive: true,
      autoPlay: true
    }, options);

    // Curated international multilingual dataset: 186 strictly unique global languages
    // User request: "bahasa di love kalo bisa beda semua, bahasa internasional"
    this.phrases = [
      // Asian & Southeast Asian Languages
      "Aku cinta kamu",         // Indonesian
      "I love you",             // English
      "愛してる",               // Japanese
      "사랑해",                 // Korean
      "我爱你",                 // Mandarin
      "Anh yêu em",             // Vietnamese
      "ฉันรักเธอ",              // Thai
      "Mahal kita",             // Tagalog / Filipino
      "Saya sayang awak",       // Malay
      "မင်းကိုချစ်တယ်",           // Burmese
      "ខ្ញុំស្រឡាញ់អ្នក",           // Khmer
      "ຂ້ອຍຮັກເຈົ້າ",            // Lao
      "Би чамд хайртай",        // Mongolian
      "ང་ཁྱེད་རང་ལ་དགའ་པོ་ཡོད།",  // Tibetan
      "Ha'u hadomi o",          // Tetum (East Timor)
      "ང་གིས་ཁྱོད་ལུ་དགའ་",      // Dzongkha (Bhutan)
      "Gihigugma ko ikaw",      // Cebuano
      "Ay-ayaten ka",           // Ilocano

      // South Asian Languages
      "मैं तुमसे प्यार करता हूँ",  // Hindi
      "আমি তোমাকে ভালোবাসি",    // Bengali
      "நான் உன்னை காதலிக்கிறேன்",  // Tamil
      "నేను నిన్ను ప్రేమిస్తున్నాను",  // Telugu
      "ನಾನು ನಿನ್ನನ್ನು ಪ್ರೀತಿಸುತ್ತೇನೆ",  // Kannada
      "ഞാൻ നിന്നെ സ്നേഹിക്കുന്നു",  // Malayalam
      "माझं तुझ्यावर प्रेम आहे",  // Marathi
      "હું તને પ્રેમ કરું છું",   // Gujarati
      "ਮੈਂ ਤੈਨੂੰ ਪਿਆਰ ਕਰਦਾ ਹਾਂ",  // Punjabi
      "میں تم سے محبت کرتا ہوں",  // Urdu
      "म तिमीलाई माया गर्छु",     // Nepali
      "මම ඔයාට ආදරෙයි",          // Sinhala
      "ମୁଁ ତୁମକୁ ଭଲପାଏ",         // Odia
      "মই তোমাক ভাল পাওঁ",       // Assamese
      "مان توکي پيار ڪريان ٿو",   // Sindhi
      "زه تا سره مینه لرم",      // Pashto
      "عاشقت هستم",             // Dari
      "އަހަރެން ކަލާދެކެ ލޯބިވޭ", // Dhivehi (Maldives)

      // Central & Western Asian Languages
      "دوستت دارم",              // Persian / Farsi
      "Мен сені сүйемін",       // Kazakh
      "Men seni sevaman",       // Uzbek
      "Мен сени сүйөм",         // Kyrgyz
      "Men seni söýýärin",      // Turkmen
      "Ман туро дӯст медорам",  // Tajik
      "Mən səni sevirəm",       // Azerbaijani
      "Ես քեզ սիրում եմ",       // Armenian
      "მიყვარხარ",              // Georgian
      "Ez te hez dikim",        // Kurdish

      // Middle Eastern & Semitic Languages
      "أحبك",                   // Arabic
      "אני אוהב אותך",          // Hebrew
      "Seni seviyorum",         // Turkish
      "Inħobbok",               // Maltese
      "Ana rahmelekh",          // Aramaic
      "Azettan bakh",           // Assyrian
      "Hemlegh kem",            // Tamazight / Berber

      // European Languages (Romance, Germanic, Slavic, Celtic, Baltic, Finno-Ugric)
      "Je t'aime",              // French
      "Te amo",                 // Spanish
      "Eu te amo",              // Portuguese
      "Ti amo",                 // Italian
      "Ich liebe dich",         // German
      "Ik hou van jou",         // Dutch
      "Jag älskar dig",         // Swedish
      "Jeg elsker deg",         // Norwegian
      "Ég elska þig",           // Icelandic
      "Eg elski teg",           // Faroese
      "Minä rakastan sinua",    // Finnish
      "Ma armastan sind",       // Estonian
      "Es tevi mīlu",           // Latvian
      "Aš tave myliu",          // Lithuanian
      "Mo ghrá thú",            // Irish Gaelic
      "Tha gaol agam ort",      // Scottish Gaelic
      "Rwy'n dy garu di",       // Welsh
      "Da garout a ran",        // Breton
      "Ta graih aym ort",       // Manx
      "My a'th kar",            // Cornish
      "Maite zaitut",           // Basque
      "T'estimo",               // Catalan
      "Ámote",                  // Galician
      "Ech hunn dech gär",      // Luxembourgish
      "Jau hai tai char",       // Romansh
      "Ik hâld fan dy",         // Frisian
      "Σ' αγαπώ",               // Greek
      "Я тебя люблю",           // Russian
      "Я тебе кохаю",           // Ukrainian
      "Kocham cię",             // Polish
      "Miluji tě",              // Czech
      "Ľúbim ťa",               // Slovak
      "Szeretlek",              // Hungarian
      "Te iubesc",              // Romanian
      "Обичам те",              // Bulgarian
      "Волим те",               // Serbian
      "Ljubim te",              // Slovenian
      "Те сакам",               // Macedonian
      "Të dua",                 // Albanian
      "Я цябе кахаю",           // Belarusian
      "Vos amo",                // Latin
      "Mi amas vin",            // Esperanto
      "איך האָב דיך ליב",        // Yiddish
      "Ti tengu caru",          // Corsican
      "T'amo meda",             // Sardinian
      "T'aimi",                 // Occitan
      "Dji vos veye voltî",     // Walloon
      "J't'ainme",              // Picard
      "Ti vuei ben",            // Friulian
      "Lubuju te",              // Sorbian
      "Kòchóm ce",              // Kashubian
      "Przajã ci",              // Silesian
      "Я тя люблю",             // Rusyn

      // African Languages
      "Nakupenda",              // Swahili
      "እወድሃለሁ",               // Amharic
      "Mo nifẹ rẹ",             // Yoruba
      "A hụrụ m gị n'anya",     // Igbo
      "Ina son ki",             // Hausa
      "Ngiyakuthanda",          // Zulu
      "Ndiyakuthanda",          // Xhosa
      "Ek het jou lief",        // Afrikaans
      "Ndinokuda",              // Shona
      "Waan ku jecelahay",      // Somali
      "Sin jaalladha",          // Oromo
      "Tiako ianao",            // Malagasy
      "Ndagukunda",             // Kinyarwanda
      "Nalingi yo",             // Lingala
      "Ningwendete",            // Kikuyu
      "Nkwagala",               // Luganda
      "Aheri",                  // Luo
      "Ke a go rata",           // Setswana / Sesotho
      "Ndzi rhandza wena",       // Tsonga
      "Ndi a ni funa",          // Venda
      "Dama la bëgg",           // Wolof
      "M'bi fe",                // Bambara
      "Me dɔ wo",               // Twi / Akan
      "Mélɔ̃ wo",                // Ewe
      "Mido yidma",             // Fulani
      "Ndimakukonda",           // Chichewa
      "የፍቅረኪ እየ",             // Tigrinya
      "Mo kontan twa",          // Mauritian Creole
      "Mon kontan ou",          // Seychellois Creole
      "N ta ama-u",             // Cape Verdean Creole

      // Pacific & Oceanic Languages
      "Kei te aroha au ki a koe", // Maori
      "Aloha au iā ʻoe",        // Hawaiian
      "Ou te alofa ia te oe",   // Samoan
      "'Ofa 'atu",              // Tongan
      "Au domoni iko",          // Fijian
      "Ua here vau ia oe",      // Tahitian
      "Hu guiaya hao",          // Chamorro
      "Yokwe eok",              // Marshallese
      "Ak mle kau",             // Palauan
      "Mi lavim yu",            // Tok Pisin
      "Mi lavem yu",            // Bislama
      "Hanga rahi au kia koe",  // Rapa Nui
      "Tofa alofa kia koe",      // Tuvaluan
      "I tangiriko",            // Kiribati

      // Indigenous Americas & Regional Creoles
      "Nimitznequi",            // Nahuatl
      "In yaakumech",           // Maya
      "Munakuykim",             // Quechua
      "Munasmawa",              // Aymara
      "Rohayhu",                // Guarani
      "Inche poyeyu",           // Mapudungun
      "Gvgeyuhi",               // Cherokee
      "Ayóó ʼánííníshní",       // Navajo
      "Nagligivagit",           // Inuktitut
      "Kenkamken",              // Yupik
      "Kisâkihitin",            // Cree
      "Gizhawenimin",           // Ojibwe
      "Thečhíȟila",             // Lakota
      "Chi hollo li",           // Choctaw
      "Mi stima bo",            // Papiamento
      "Mwen renmen ou",         // Haitian Creole
      "Mi luv yuh",             // Jamaican Patois

      // Eurasian & Caucasus Languages
      "Мин сине яратам",        // Tatar
      "Мин һине яратам",        // Bashkir
      "Эпӗ сана юрататӑп",      // Chuvash
      "Мон тонэ яратӥсько",     // Udmurt
      "Мый тыйым йӧратем",      // Mari
      "Мон вечктан тонть",      // Erzya
      "Мин эйиигин таптыыбын",  // Yakut
      "Мен сеңээ ынак мен",     // Tuvan
      "Би шамдаа дуратайб",     // Buryat
      "Би чамд дуртав",         // Kalmyk
      "Æз дæу уарзын",          // Ossetian
      "Суна хьо дукха веза",    // Chechen
      "Сона хьо еза",           // Ingush
      "Дида мун йокьула",       // Avar
      "Заз вун кIанда",         // Lezgian
      "Men seni sevem",         // Crimean Tatar
      "Bän seni bäänerim",      // Gagauz
      "Me amoras tu",           // Ido
      "Io te ama"               // Interlingua
    ];

    this.wine = [0.58, 0.0, 0.09];
    this.crimson = [0.90, 0.05, 0.14];
    this.blood = [0.98, 0.10, 0.16];
    this.flashColor = [1.0, 0.95, 0.95];
    this.bgRgb = [0, 0, 0];

    this.canvas = document.createElement('canvas');
    this.canvas.className = 'love-heart-canvas';
    this.ctx = this.canvas.getContext('2d', { alpha: true });
    this.container.appendChild(this.canvas);

    this.mouseX = -9999;
    this.mouseY = -9999;
    this.isHovering = false;

    this.items = [];
    this.active = [];
    this.mainItems = [];
    this.animId = null;
    this.isSpawning = false;
    this.acc = 0;
    this.spawnRate = 0;
    this.spawnIndex = 0;
    this.hasCompleted = false;

    this.initCanvasSize();
    this.bindEvents();

    if (this.options.autoPlay) {
      this.start();
    }
  }

  // Seeded random matching love.py RNG
  random(seed = 11) {
    let s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    return () => {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
  }

  initCanvasSize() {
    const rect = this.container.getBoundingClientRect();
    const width = Math.max(320, rect.width || window.innerWidth);
    const height = Math.max(320, rect.height || window.innerHeight);
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.canvasWidth = width;
    this.canvasHeight = height;
    this.canvas.width = Math.round(width * this.dpr);
    this.canvas.height = Math.round(height * this.dpr);
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    // Dynamic responsive parameters: scale up significantly ("besarkaan")
    // Heart spans up to ~94% of viewport width and ~92% of height
    const targetHeartWidth = Math.min(width * 0.94, height * 1.05, 1140);
    // Since parametric width is 32 * sc => sc = targetHeartWidth / 32
    this.sc = Math.max(16, targetHeartWidth / 32);
    this.oy = this.sc * 0.95;

    // Scale font sizes, row height, lift, and gap proportionally with sc
    const scaleRatio = this.sc / 21;
    this.rowH = Math.round(20 * scaleRatio);
    this.sizes = [9, 10, 11, 12].map(s => Math.max(9, Math.round(s * scaleRatio)));
    this.lift = Math.round(34 * scaleRatio);
    this.gap = Math.max(5, Math.round(7 * scaleRatio));
  }

  // Parametric heart formula
  heartPoint(a) {
    const x = 16 * Math.pow(Math.sin(a), 3);
    const y = 13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a);
    return [x * this.sc, y * this.sc + this.oy];
  }

  mathDist(x, y, cy) {
    return Math.hypot(x / (16 * this.sc), (y - cy) / (14.5 * this.sc));
  }

  mix(a, b, k) {
    return [
      a[0] + (b[0] - a[0]) * k,
      a[1] + (b[1] - a[1]) * k,
      a[2] + (b[2] - a[2]) * k
    ];
  }

  dim(c, k) {
    return [c[0] * k, c[1] * k, c[2] * k];
  }

  toHex(c) {
    const r = Math.round(Math.max(0, Math.min(1, c[0])) * 255);
    const g = Math.round(Math.max(0, Math.min(1, c[1])) * 255);
    const b = Math.round(Math.max(0, Math.min(1, c[2])) * 255);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  clamp(v) {
    return Math.max(0, Math.min(1, v));
  }

  buildLayout() {
    const rng = this.random(11);
    const poly = [];
    for (let i = 0; i < 720; i++) {
      poly.push(this.heartPoint(2 * Math.PI * i / 720));
    }

    const edges = [];
    for (let i = 0; i < poly.length; i++) {
      edges.push([poly[i], poly[(i + 1) % poly.length]]);
    }

    const yVals = poly.map(p => p[1]);
    const yMax = Math.max(...yVals);
    const yMin = Math.min(...yVals);
    const cy = (yMax + yMin) / 2;

    const spans = (y) => {
      const xs = [];
      for (const [[x1, y1], [x2, y2]] of edges) {
        if ((y1 <= y && y < y2) || (y2 <= y && y < y1)) {
          xs.push(x1 + (y - y1) * (x2 - x1) / (y2 - y1));
        }
      }
      xs.sort((a, b) => a - b);
      const res = [];
      for (let i = 0; i < xs.length; i += 2) {
        if (i + 1 < xs.length) res.push([xs[i], xs[i + 1]]);
      }
      return res;
    };

    const intersect = (A, B) => {
      const out = [];
      for (const a of A) {
        for (const b of B) {
          const lo = Math.max(a[0], b[0]);
          const hi = Math.min(a[1], b[1]);
          if (hi - lo > (14 * (this.sc / 21))) out.push([lo, hi]);
        }
      }
      return out;
    };

    // Available unique phrase pool shuffled deterministically
    // User request: "buat love nya pake bahasa lebih dari ini, jangan di ulang ulang bahasanya"
    const pool = [...this.phrases];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    const rowH = this.rowH;
    const half = rowH / 2;
    const placed = [];

    // Measure text helper on context
    const measure = (text, size) => {
      this.ctx.font = `bold ${size}px ${this.options.fontFamily}`;
      return this.ctx.measureText(text).width;
    };

    let y = yMax - half;
    while (y > yMin + half) {
      const row = intersect(spans(y + half), spans(y - half));

      for (let [lo, hi] of row) {
        lo += 4;
        hi -= 4;
        let cur = lo + rng() * 8;
        const line = [];

        while (true) {
          let fit = null;
          let fitIndex = -1;

          // Find an unused phrase from pool that fits into the remaining width
          for (let i = 0; i < pool.length; i++) {
            const candidate = pool[i];
            // Test font sizes from largest down to smallest
            for (let sIdx = this.sizes.length - 1; sIdx >= 0; sIdx--) {
              const size = this.sizes[sIdx];
              const w = measure(candidate, size);
              if (cur + w <= hi) {
                fit = [candidate, size, w];
                fitIndex = i;
                break;
              }
            }
            if (fit) break;
          }

          // If no phrase fits or pool exhausted, break row
          if (!fit) break;

          const [text, size, w] = fit;
          // Splice out the chosen phrase so it is NEVER repeated
          pool.splice(fitIndex, 1);

          line.push([cur + w / 2, text, size, w]);
          cur += w + this.gap;
        }

        if (line.length === 0) continue;

        if (line.length > 1) {
          const left = hi - (line[line.length - 1][0] + line[line.length - 1][3] / 2);
          for (let i = 0; i < line.length; i++) {
            line[i][0] += (left * i) / (line.length - 1);
          }
        } else {
          line[0][0] = (lo + hi) / 2;
        }

        for (let i = 0; i < line.length; i++) {
          const [x, text, size, w] = line[i];
          const edge = (i === 0 || i === line.length - 1);
          placed.push({ x, y, text, size, w, edge });
        }
      }

      y -= rowH;
    }

    // Color gradient based on distance from center
    for (const p of placed) {
      const rad = Math.min(1.0, this.mathDist(p.x, p.y, cy));
      let base = this.mix(this.wine, this.crimson, 0.25 + 0.75 * rad);
      base = this.mix(base, this.blood, rng() * 0.35 + (p.edge ? 0.3 : 0));
      p.color = base.map(v => Math.min(1, Math.max(0, v)));
      p.rad = rad;
      p.f = 0;
      p.dx = (rng() - 0.5) * (this.sc * 0.85); // Organic horizontal drift
      p.shimmerTime = 0;
      p.shimmerIntensity = 0;
    }

    // Spawning order: edges around perimeter first, then inner radial
    const edgePhrases = placed.filter(p => p.edge);
    const innerPhrases = placed.filter(p => !p.edge);

    edgePhrases.sort((a, b) => {
      const angA = (Math.atan2(a.x, a.y - cy) + 2 * Math.PI) % (2 * Math.PI);
      const angB = (Math.atan2(b.x, b.y - cy) + 2 * Math.PI) % (2 * Math.PI);
      return angA - angB;
    });

    innerPhrases.sort((a, b) => (-a.rad + rng() * 0.08) - (-b.rad + rng() * 0.08));

    this.items = [...edgePhrases, ...innerPhrases];
    this.cy = cy;
  }

  start() {
    this.stop();
    this.initCanvasSize();
    this.buildLayout();

    this.active = [];
    this.mainItems = [];
    this.isSpawning = true;
    this.hasCompleted = false;
    this.spawnIndex = 0;
    this.acc = 0;

    const totalTicks = (this.options.duration * 1000) / this.options.tickMs;
    this.spawnRate = this.items.length / totalTicks;

    this.lastTime = performance.now();
    this.loop();
  }

  stop() {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    this.isSpawning = false;
  }

  spawnNext() {
    if (this.spawnIndex >= this.items.length) {
      this.isSpawning = false;
      return;
    }
    const p = this.items[this.spawnIndex++];
    p.f = 0;
    p.settled = false;
    this.active.push(p);
    this.mainItems.push(p);
  }

  triggerShimmer() {
    if (this.mainItems.length === 0) return;
    const target = this.mainItems[Math.floor(Math.random() * this.mainItems.length)];
    if (target && target.settled) {
      target.shimmerTime = 30; // ~500ms at 60fps
      target.shimmerIntensity = 0.85;
    }
  }

  loop() {
    this.animId = requestAnimationFrame(() => this.loop());

    const now = performance.now();
    const dt = Math.min(32, now - (this.lastTime || now));
    this.lastTime = now;

    // Spawning logic
    if (this.isSpawning) {
      this.acc += this.spawnRate * (dt / this.options.tickMs);
      while (this.acc >= 1 && this.spawnIndex < this.items.length) {
        this.acc -= 1;
        this.spawnNext();
      }
      if (this.spawnIndex >= this.items.length) {
        this.isSpawning = false;
      }
    }

    // Update active animations
    for (let i = this.active.length - 1; i >= 0; i--) {
      const p = this.active[i];
      p.f += (dt / this.options.tickMs);
      if (p.f >= this.options.animFrames) {
        p.settled = true;
        this.active.splice(i, 1);
      }
    }

    // Trigger continuous shimmers once started settling
    if (this.mainItems.length > 20 && Math.random() < 0.22) {
      this.triggerShimmer();
    }

    this.render();
  }

  render() {
    const ctx = this.ctx;
    const w = this.canvasWidth;
    const h = this.canvasHeight;
    const dpr = this.dpr;

    ctx.save();
    ctx.scale(dpr, dpr);

    // Clear transparent canvas
    ctx.clearRect(0, 0, w, h);

    // Coordinate transform: center (0, 0) in canvas
    ctx.translate(w / 2, h / 2);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const animSpan = this.options.animFrames;
    const lift = this.lift;

    // Draw settled & animating items
    for (let i = 0; i < this.mainItems.length; i++) {
      const p = this.mainItems[i];
      const u = this.clamp(p.f / animSpan);
      const e = 1 - Math.pow(1 - u, 3); // Cubic ease-out

      const hover = (1 - e) * lift;
      const baseX = p.x + p.dx * (1 - e);
      const baseY = -p.y - hover; // Invert y to match coordinate system

      // Interactive mouse proximity calculation
      let mouseBoost = 0;
      if (this.isHovering) {
        const screenX = (w / 2) + baseX;
        const screenY = (h / 2) + baseY;
        const dist = Math.hypot(this.mouseX - screenX, this.mouseY - screenY);
        const proxRadius = 140;
        if (dist < proxRadius) {
          const raw = 1 - (dist / proxRadius);
          // Smooth Hermite cubic interpolation for silky organic falloff
          mouseBoost = raw * raw * (3 - 2 * raw);
        }
      }

      // Dynamic tactile lift and scale when illuminated by torch
      const scaleBoost = 1 + mouseBoost * 0.12; // Up to 12% tactile enlargement
      const liftBoost = mouseBoost * 3.0;       // Floats 3px higher toward user
      const drawX = baseX;
      const drawY = baseY - liftBoost;
      const drawSize = Math.max(9, Math.round(p.size * scaleBoost));

      // 1. Clean Drop Shadow
      if (e > 0.05) {
        ctx.font = `bold ${drawSize}px ${this.options.fontFamily}`;
        const shadowCol = this.mix(this.bgRgb, this.dim(p.color, 0.25), e);
        ctx.fillStyle = this.toHex(shadowCol);
        ctx.fillText(p.text, drawX + 2, drawY + 2);
      }

      // 2. Main Text with arrival flash, ambient shimmer, and pure scarlet red illumination
      ctx.font = `bold ${drawSize}px ${this.options.fontFamily}`;

      let flashVal = 0;
      if (u < 1) {
        const flashPhase = this.clamp((u - 0.55) / 0.45);
        flashVal = 0.75 * Math.sin(Math.PI * flashPhase);
      }

      // Apply ambient shimmer decay
      if (p.shimmerTime > 0) {
        p.shimmerTime--;
        p.shimmerIntensity *= 0.94;
        flashVal = Math.max(flashVal, p.shimmerIntensity);
      }

      // Base color interpolated with arrival animation
      let curCol = this.mix(this.bgRgb, p.color, Math.pow(e, 1.5));

      // Arrival flash highlight (clean white)
      if (flashVal > 0) {
        curCol = this.mix(curCol, this.flashColor, flashVal);
      }

      // Torch illumination: brighten into vivid, pure scarlet/crimson red (strictly zero pink tint)
      if (mouseBoost > 0) {
        const pureScarletRed = [1.0, 0.08, 0.14]; // Pure, rich vibrant crimson-scarlet
        curCol = this.mix(curCol, pureScarletRed, mouseBoost * 0.88);
      }

      ctx.fillStyle = this.toHex(curCol);
      ctx.fillText(p.text, drawX, drawY);
    }

    ctx.restore();
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.initCanvasSize();
    }, { passive: true });

    const updatePointer = (clientX, clientY) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      if (x >= -40 && x <= rect.width + 40 && y >= -40 && y <= rect.height + 40) {
        this.mouseX = x;
        this.mouseY = y;
        this.isHovering = true;
      } else {
        this.isHovering = false;
        this.mouseX = -9999;
        this.mouseY = -9999;
      }
    };

    window.addEventListener('pointermove', (e) => {
      updatePointer(e.clientX, e.clientY);
    }, { passive: true });

    this.canvas.addEventListener('mouseleave', () => {
      this.isHovering = false;
      this.mouseX = -9999;
      this.mouseY = -9999;
    }, { passive: true });
  }

  reset() {
    this.stop();
    this.active = [];
    this.mainItems = [];
    this.spawnIndex = 0;
    this.acc = 0;
    this.hasCompleted = false;
    if (this.ctx && this.canvas) {
      this.ctx.save();
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.restore();
    }
  }

  replay() {
    this.start();
  }
}
