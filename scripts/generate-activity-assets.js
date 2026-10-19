import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const ACTIVITY_DIR = path.resolve('assets/branding/activity');
const WEB_ACTIVITY_DIR = path.resolve('web/public/activity');
const FFMPEG_BIN = path.resolve('node_modules/ffmpeg-static/ffmpeg');

if (!fs.existsSync(ACTIVITY_DIR)) fs.mkdirSync(ACTIVITY_DIR, { recursive: true });
if (!fs.existsSync(WEB_ACTIVITY_DIR)) fs.mkdirSync(WEB_ACTIVITY_DIR, { recursive: true });

// ==========================================
// 1. BACKGROUND ASSET (1024x576)
// Clustered around the edges, open in the center
// ==========================================
const backgroundSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 576" width="1024" height="576" fill="none">
  <defs>
    <!-- Background Gradients -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#040916"/>
      <stop offset="50%" stop-color="#02050D"/>
      <stop offset="100%" stop-color="#010307"/>
    </linearGradient>

    <radialGradient id="centerDarken" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#000000" stop-opacity="0.95"/>
      <stop offset="60%" stop-color="#020612" stop-opacity="0.85"/>
      <stop offset="100%" stop-color="#020612" stop-opacity="0"/>
    </radialGradient>

    <!-- Edge Neon Glows -->
    <radialGradient id="topLeftGlow" cx="0%" cy="0%" r="45%">
      <stop offset="0%" stop-color="#00F3FF" stop-opacity="0.35"/>
      <stop offset="60%" stop-color="#5865F2" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>

    <radialGradient id="topRightGlow" cx="100%" cy="0%" r="45%">
      <stop offset="0%" stop-color="#39FF14" stop-opacity="0.30"/>
      <stop offset="60%" stop-color="#00F3FF" stop-opacity="0.10"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>

    <radialGradient id="bottomLeftGlow" cx="0%" cy="100%" r="45%">
      <stop offset="0%" stop-color="#BC13FE" stop-opacity="0.30"/>
      <stop offset="60%" stop-color="#5865F2" stop-opacity="0.10"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>

    <radialGradient id="bottomRightGlow" cx="100%" cy="100%" r="45%">
      <stop offset="0%" stop-color="#00F3FF" stop-opacity="0.30"/>
      <stop offset="60%" stop-color="#39FF14" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>

    <!-- Subtle Tech Pattern -->
    <pattern id="techGrid" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
      <circle cx="16" cy="16" r="1.2" fill="#00F3FF" opacity="0.1"/>
      <path d="M 0 16 L 32 16 M 16 0 L 16 32" stroke="#5865F2" stroke-width="0.4" opacity="0.04"/>
    </pattern>

    <filter id="neonFilter" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- Base Space Background -->
  <rect width="1024" height="576" fill="url(#bgGrad)"/>
  <rect width="1024" height="576" fill="url(#techGrid)"/>

  <!-- Edge Atmospheric Glows -->
  <rect width="1024" height="576" fill="url(#topLeftGlow)"/>
  <rect width="1024" height="576" fill="url(#topRightGlow)"/>
  <rect width="1024" height="576" fill="url(#bottomLeftGlow)"/>
  <rect width="1024" height="576" fill="url(#bottomRightGlow)"/>

  <!-- TOP EDGE ARTWORK -->
  <g>
    <!-- Top Cyber Header Rail -->
    <line x1="20" y1="28" x2="1004" y2="28" stroke="#334155" stroke-width="1" stroke-dasharray="8 6"/>
    <line x1="160" y1="28" x2="360" y2="28" stroke="#00F3FF" stroke-width="2.5" filter="url(#neonFilter)"/>
    <line x1="664" y1="28" x2="864" y2="28" stroke="#39FF14" stroke-width="2.5" filter="url(#neonFilter)"/>
    
    <!-- Top Left System Indicators -->
    <rect x="28" y="16" width="110" height="24" rx="6" fill="#061224" stroke="#00F3FF" stroke-width="1"/>
    <circle cx="40" cy="28" r="3.5" fill="#39FF14" filter="url(#neonFilter)"/>
    <text x="50" y="32" fill="#94A3B8" font-family="'JetBrains Mono', monospace" font-size="9" font-weight="700">GRID VIEW // 16:9</text>

    <!-- Top Right Frequency Indicator -->
    <rect x="880" y="16" width="116" height="24" rx="6" fill="#06141a" stroke="#39FF14" stroke-width="1"/>
    <text x="892" y="32" fill="#39FF14" font-family="'JetBrains Mono', monospace" font-size="9" font-weight="700">LORAPOK LABS</text>
  </g>

  <!-- BOTTOM EDGE ARTWORK -->
  <g>
    <!-- Bottom Frequency Ribbon & Sound Wave Nodes -->
    <line x1="20" y1="548" x2="1004" y2="548" stroke="#334155" stroke-width="1"/>
    <path d="M 120 548 Q 200 530 280 548 T 440 548" fill="none" stroke="#00F3FF" stroke-width="2" filter="url(#neonFilter)"/>
    <path d="M 584 548 Q 664 566 744 548 T 904 548" fill="none" stroke="#39FF14" stroke-width="2" filter="url(#neonFilter)"/>

    <!-- Bottom Left Audio Indicator -->
    <g transform="translate(32, 532)">
      <rect x="0" y="0" width="130" height="26" rx="6" fill="#0a0f20" stroke="#5865F2" stroke-width="1"/>
      <text x="14" y="17" fill="#818CF8" font-family="'JetBrains Mono', monospace" font-size="9" font-weight="700">AUDIO HARVESTER</text>
    </g>

    <!-- Bottom Right Telemetry -->
    <g transform="translate(862, 532)">
      <rect x="0" y="0" width="130" height="26" rx="6" fill="#081812" stroke="#39FF14" stroke-width="1"/>
      <text x="14" y="17" fill="#39FF14" font-family="'JetBrains Mono', monospace" font-size="9" font-weight="700">320KBPS ENGINE</text>
    </g>
  </g>

  <!-- LEFT EDGE ARTWORK -->
  <g transform="translate(18, 120)">
    <!-- Vertical Data Rail & Frequency Meter -->
    <line x1="12" y1="0" x2="12" y2="336" stroke="#1E293B" stroke-width="1.5"/>
    <!-- Left Equalizer Bars -->
    <rect x="22" y="40" width="18" height="4" rx="2" fill="#00F3FF" opacity="0.8"/>
    <rect x="22" y="52" width="28" height="4" rx="2" fill="#00F3FF"/>
    <rect x="22" y="64" width="40" height="4" rx="2" fill="#39FF14" filter="url(#neonFilter)"/>
    <rect x="22" y="76" width="22" height="4" rx="2" fill="#00F3FF"/>
    <rect x="22" y="88" width="14" height="4" rx="2" fill="#5865F2"/>

    <rect x="22" y="180" width="16" height="4" rx="2" fill="#BC13FE"/>
    <rect x="22" y="192" width="34" height="4" rx="2" fill="#00F3FF"/>
    <rect x="22" y="204" width="46" height="4" rx="2" fill="#39FF14" filter="url(#neonFilter)"/>
    <rect x="22" y="216" width="26" height="4" rx="2" fill="#00F3FF"/>
    <rect x="22" y="228" width="12" height="4" rx="2" fill="#5865F2"/>

    <!-- Tech Arcs -->
    <circle cx="12" cy="140" r="48" fill="none" stroke="#00F3FF" stroke-width="1" opacity="0.3" stroke-dasharray="6 8"/>
    <circle cx="12" cy="140" r="32" fill="none" stroke="#39FF14" stroke-width="1.5" opacity="0.4"/>
  </g>

  <!-- RIGHT EDGE ARTWORK -->
  <g transform="translate(950, 120)">
    <!-- Vertical Data Rail & Right Equalizer Bars -->
    <line x1="42" y1="0" x2="42" y2="336" stroke="#1E293B" stroke-width="1.5"/>
    <rect x="8"  y="40" width="26" height="4" rx="2" fill="#5865F2"/>
    <rect x="0"  y="52" width="34" height="4" rx="2" fill="#00F3FF"/>
    <rect x="-12" y="64" width="46" height="4" rx="2" fill="#39FF14" filter="url(#neonFilter)"/>
    <rect x="6"  y="76" width="28" height="4" rx="2" fill="#00F3FF"/>
    <rect x="16" y="88" width="18" height="4" rx="2" fill="#5865F2"/>

    <rect x="14" y="180" width="20" height="4" rx="2" fill="#5865F2"/>
    <rect x="-2" y="192" width="36" height="4" rx="2" fill="#00F3FF"/>
    <rect x="-16" y="204" width="50" height="4" rx="2" fill="#39FF14" filter="url(#neonFilter)"/>
    <rect x="4"  y="216" width="30" height="4" rx="2" fill="#00F3FF"/>
    <rect x="18" y="228" width="16" height="4" rx="2" fill="#BC13FE"/>

    <!-- Tech Arcs -->
    <circle cx="42" cy="140" r="48" fill="none" stroke="#39FF14" stroke-width="1" opacity="0.3" stroke-dasharray="6 8"/>
    <circle cx="42" cy="140" r="32" fill="none" stroke="#00F3FF" stroke-width="1.5" opacity="0.4"/>
  </g>

  <!-- CENTER OPEN HORIZON (Protected Space for Grid View UI Cards) -->
  <ellipse cx="512" cy="288" rx="360" ry="210" fill="url(#centerDarken)"/>
  
  <!-- Subtle Center Reticle Marks on the border of open space -->
  <path d="M 230 140 H 210 V 160" fill="none" stroke="#334155" stroke-width="2"/>
  <path d="M 794 140 H 814 V 160" fill="none" stroke="#334155" stroke-width="2"/>
  <path d="M 210 416 V 436 H 230" fill="none" stroke="#334155" stroke-width="2"/>
  <path d="M 814 416 V 436 H 794" fill="none" stroke="#334155" stroke-width="2"/>
  
  <text x="512" y="294" fill="#1E293B" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="700" letter-spacing="4" text-anchor="middle" opacity="0.3">NOCATCH // ACTIVITY CANVAS</text>
</svg>`;

// ==========================================
// 2. COVER ART ASSET (1024x576)
// Main image on the Activity Shelf with title and art
// ==========================================
const coverSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 576" width="1024" height="576" fill="none">
  <defs>
    <!-- Deep Space Background -->
    <linearGradient id="cvBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#050E22"/>
      <stop offset="45%" stop-color="#030714"/>
      <stop offset="85%" stop-color="#080718"/>
      <stop offset="100%" stop-color="#010308"/>
    </linearGradient>

    <!-- Neon Brand Text Gradient -->
    <linearGradient id="cvTitle" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="40%" stop-color="#E2F9FF"/>
      <stop offset="75%" stop-color="#00F3FF"/>
      <stop offset="100%" stop-color="#39FF14"/>
    </linearGradient>

    <radialGradient id="cvMascotGlow" cx="24%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#00F3FF" stop-opacity="0.35"/>
      <stop offset="50%" stop-color="#5865F2" stop-opacity="0.18"/>
      <stop offset="80%" stop-color="#030714" stop-opacity="0"/>
    </radialGradient>

    <radialGradient id="cvRightGlow" cx="82%" cy="40%" r="55%">
      <stop offset="0%" stop-color="#39FF14" stop-opacity="0.25"/>
      <stop offset="50%" stop-color="#00F3FF" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="#030714" stop-opacity="0"/>
    </radialGradient>

    <!-- Border Linear Gradient -->
    <linearGradient id="cvBorder" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#5865F2"/>
      <stop offset="35%" stop-color="#00F3FF"/>
      <stop offset="70%" stop-color="#39FF14"/>
      <stop offset="100%" stop-color="#BC13FE"/>
    </linearGradient>

    <filter id="cvGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur1"/>
      <feGaussianBlur stdDeviation="3" result="blur2"/>
      <feMerge>
        <feMergeNode in="blur1"/>
        <feMergeNode in="blur2"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>

    <pattern id="cvGrid" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
      <circle cx="16" cy="16" r="1.2" fill="#00F3FF" opacity="0.12"/>
      <path d="M 0 16 L 32 16 M 16 0 L 16 32" stroke="#5865F2" stroke-width="0.5" opacity="0.05"/>
    </pattern>
  </defs>

  <!-- Background Base Canvas -->
  <rect width="1024" height="576" rx="20" fill="url(#cvBg)"/>
  <rect width="1024" height="576" rx="20" fill="url(#cvGrid)"/>

  <!-- Core Neon Auras -->
  <rect width="1024" height="576" rx="20" fill="url(#cvMascotGlow)"/>
  <rect width="1024" height="576" rx="20" fill="url(#cvRightGlow)"/>

  <!-- Outer Cyber Border Frame -->
  <rect x="2" y="2" width="1020" height="572" rx="18" fill="none" stroke="url(#cvBorder)" stroke-width="2.5"/>

  <!-- Top System Rail (y: 36..64) -->
  <g transform="translate(60, 42)">
    <!-- Lorapok Labs Activity Tag -->
    <rect x="0" y="0" width="220" height="32" rx="16" fill="#08142c" stroke="#5865F2" stroke-width="1.2"/>
    <circle cx="18" cy="16" r="4.5" fill="#39FF14" filter="url(#cvGlow)"/>
    <text x="32" y="21" fill="#FFFFFF" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="700" letter-spacing="1">LORAPOK LABS <tspan fill="#5865F2">//</tspan> <tspan fill="#00F3FF">DISCORD</tspan></text>

    <!-- Activity Badge -->
    <g transform="translate(236, 0)">
      <rect x="0" y="0" width="144" height="32" rx="16" fill="#091d17" stroke="#39FF14" stroke-width="1.2"/>
      <text x="16" y="21" fill="#39FF14" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="700">⚡ DISCORD ACTIVITY</text>
    </g>

    <!-- Version Badge -->
    <g transform="translate(776, 0)">
      <rect x="0" y="0" width="128" height="32" rx="16" fill="#061224" stroke="#00F3FF" stroke-width="1.2"/>
      <text x="18" y="21" fill="#00F3FF" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="700">v2.0.0 STABLE</text>
    </g>
  </g>

  <!-- LEFT HERO MASCOT / ARTWORK (x: 80..320, y: 130..470) -->
  <g transform="translate(180, 290)">
    <!-- Sonic Radial Wave Rings around Mascot -->
    <circle cx="0" cy="0" r="160" fill="none" stroke="#5865F2" stroke-width="1.5" opacity="0.3" stroke-dasharray="8 10"/>
    <circle cx="0" cy="0" r="125" fill="none" stroke="#00F3FF" stroke-width="2" opacity="0.4" stroke-dasharray="6 8"/>
    <circle cx="0" cy="0" r="95" fill="none" stroke="#39FF14" stroke-width="2.5" opacity="0.6"/>

    <!-- Headphone Arc -->
    <path d="M -54 20 C -54 -36 -28 -68 0 -68 C 28 -68 54 -36 54 20" fill="none" stroke="#00F3FF" stroke-width="12" stroke-linecap="round" filter="url(#cvGlow)"/>

    <!-- Mascot Head Base -->
    <rect x="-42" y="-28" width="84" height="74" rx="37" fill="#042028" stroke="#00F3FF" stroke-width="4"/>
    <!-- Visor Plate -->
    <rect x="-30" y="-12" width="60" height="42" rx="16" fill="#020810"/>
    <!-- Glowing Visor Eyes -->
    <circle cx="-14" cy="9" r="6" fill="#39FF14" filter="url(#cvGlow)"/>
    <circle cx="14" cy="9" r="6" fill="#39FF14" filter="url(#cvGlow)"/>

    <!-- Ear Cups -->
    <rect x="-66" y="-6" width="20" height="42" rx="9" fill="#07152b" stroke="#00F3FF" stroke-width="3.5"/>
    <circle cx="-56" cy="15" r="4.5" fill="#39FF14"/>
    <rect x="46" y="-6" width="20" height="42" rx="9" fill="#07152b" stroke="#00F3FF" stroke-width="3.5"/>
    <circle cx="56" cy="15" r="4.5" fill="#39FF14"/>

    <!-- Antenna -->
    <path d="M 0 -68 V -84" stroke="#39FF14" stroke-width="4" stroke-linecap="round"/>
    <circle cx="0" cy="-88" r="5" fill="#39FF14" filter="url(#cvGlow)"/>
  </g>

  <!-- RIGHT HERO TITLE & CAPABILITIES (x: 360..940, y: 140..460) -->
  <g transform="translate(370, 210)">
    <!-- Main Glowing Title -->
    <text x="0" y="0" fill="url(#cvTitle)" font-family="'Inter', -apple-system, sans-serif" font-size="76" font-weight="900" letter-spacing="-1.5" filter="url(#cvGlow)">NoCatch</text>
    
    <!-- Spark Star -->
    <g transform="translate(340, -68)">
      <circle cx="20" cy="20" r="22" fill="#00F3FF" opacity="0.15" filter="url(#cvGlow)"/>
      <path d="M 20 4 L 24 16 L 36 20 L 24 24 L 20 36 L 16 24 L 4 20 L 16 16 Z" fill="#39FF14"/>
    </g>

    <!-- Subtitle Category Monospace -->
    <text x="4" y="44" fill="#94A3B8" font-family="'JetBrains Mono', monospace" font-size="19" font-weight="700" letter-spacing="3.5">GOOGLE NOTEBOOKLM HARVESTER</text>
    
    <!-- Description Paragraph -->
    <text x="4" y="82" fill="#CBD5E1" font-family="'Inter', sans-serif" font-size="15" font-weight="500">1-click audio overviews, video canvas, and studio archives directly inside Discord.</text>

    <!-- Capability Pills Strip (y: 125..175) -->
    <g transform="translate(0, 122)">
      <!-- Pill 1: Audio Overviews -->
      <g transform="translate(0, 0)">
        <rect x="0" y="0" width="176" height="46" rx="12" fill="#08142c" stroke="#00F3FF" stroke-width="1.4"/>
        <text x="20" y="28" fill="#FFFFFF" font-family="'Inter', sans-serif" font-size="13.5" font-weight="700">🎙️ 320k Audio M4A</text>
      </g>

      <!-- Pill 2: Video Canvas -->
      <g transform="translate(190, 0)">
        <rect x="0" y="0" width="172" height="46" rx="12" fill="#061816" stroke="#39FF14" stroke-width="1.4"/>
        <text x="20" y="28" fill="#FFFFFF" font-family="'Inter', sans-serif" font-size="13.5" font-weight="700">🎬 Video Canvas</text>
      </g>

      <!-- Pill 3: Complete Studio ZIP -->
      <g transform="translate(376, 0)">
        <rect x="0" y="0" width="180" height="46" rx="12" fill="#180e2d" stroke="#BC13FE" stroke-width="1.4"/>
        <text x="20" y="28" fill="#FFFFFF" font-family="'Inter', sans-serif" font-size="13.5" font-weight="700">📦 5-Artifact ZIP</text>
      </g>
    </g>
  </g>

  <!-- Right Floating Soundwave Frequency Spectrum -->
  <g transform="translate(945, 175)">
    <rect x="0"  y="45" width="5" height="50" rx="2.5" fill="#5865F2" filter="url(#cvGlow)"/>
    <rect x="10" y="20" width="5" height="75" rx="2.5" fill="#00F3FF" filter="url(#cvGlow)"/>
    <rect x="20" y="8"  width="5" height="87" rx="2.5" fill="#39FF14" filter="url(#cvGlow)"/>
    <rect x="30" y="32" width="5" height="63" rx="2.5" fill="#00F3FF"/>
    <rect x="40" y="52" width="5" height="43" rx="2.5" fill="#BC13FE"/>
  </g>
</svg>`;

async function main() {
  console.log('Generating Discord Activity Art Assets...');

  // 1. Write and convert Background (1024x576)
  const bgSvgPath = path.join(ACTIVITY_DIR, 'nocatch-activity-background-1024x576.svg');
  const bgPngPath = path.join(ACTIVITY_DIR, 'nocatch-activity-background-1024x576.png');
  fs.writeFileSync(bgSvgPath, backgroundSvg.trim());
  execSync(`rsvg-convert -w 1024 -h 576 "${bgSvgPath}" -o "${bgPngPath}"`);
  fs.copyFileSync(bgPngPath, path.join(WEB_ACTIVITY_DIR, 'nocatch-activity-background-1024x576.png'));
  console.log(`  ✔ Background generated: ${bgPngPath} (${(fs.statSync(bgPngPath).size / 1024).toFixed(1)} KB)`);

  // 2. Write and convert Cover Art (1024x576)
  const cvSvgPath = path.join(ACTIVITY_DIR, 'nocatch-activity-cover-1024x576.svg');
  const cvPngPath = path.join(ACTIVITY_DIR, 'nocatch-activity-cover-1024x576.png');
  fs.writeFileSync(cvSvgPath, coverSvg.trim());
  execSync(`rsvg-convert -w 1024 -h 576 "${cvSvgPath}" -o "${cvPngPath}"`);
  fs.copyFileSync(cvPngPath, path.join(WEB_ACTIVITY_DIR, 'nocatch-activity-cover-1024x576.png'));
  console.log(`  ✔ Cover Art generated: ${cvPngPath} (${(fs.statSync(cvPngPath).size / 1024).toFixed(1)} KB)`);

  // ==========================================
  // 3. GENERATE 10-SECOND VIDEO PREVIEW (640x360 MP4 <= 0.5 MB)
  // ==========================================
  console.log('\nGenerating 10-Second Video Preview (640x360, max 0.5 MB)...');
  const framesDir = path.resolve('/tmp/nocatch-video-frames');
  if (fs.existsSync(framesDir)) fs.rmSync(framesDir, { recursive: true });
  fs.mkdirSync(framesDir, { recursive: true });

  const fps = 24;
  const durationSec = 10;
  const totalFrames = fps * durationSec; // 240 frames

  console.log(`Rendering ${totalFrames} procedural animation frames...`);

  for (let f = 0; f < totalFrames; f++) {
    const t = f / fps; // Current time in seconds (0.0 to 10.0)

    // Dynamic procedural animation parameters
    let phaseTitle = 'INITIALIZING HARVESTER...';
    let progress = Math.min(100, Math.floor((t / 8.5) * 100));
    let pulseScale = 1 + 0.05 * Math.sin(t * 8);
    let waveOffset = t * 6;

    // Spectrum heights reacting over time
    const barHeights = [
      30 + 25 * Math.sin(t * 7 + 0.1),
      45 + 35 * Math.sin(t * 9 + 0.4),
      60 + 40 * Math.sin(t * 6 + 0.8),
      80 + 35 * Math.sin(t * 8 + 1.2),
      55 + 30 * Math.sin(t * 11 + 1.6),
      70 + 35 * Math.sin(t * 7 + 2.0),
      40 + 25 * Math.sin(t * 10 + 2.4),
      65 + 30 * Math.sin(t * 8 + 2.8),
      35 + 20 * Math.sin(t * 9 + 3.2),
      50 + 28 * Math.sin(t * 7 + 3.6),
    ];

    let phaseContent = '';

    if (t < 3.0) {
      // PHASE 1: URL Input & Inspection
      phaseTitle = 'PASTE GOOGLE NOTEBOOKLM LINK';
      phaseContent = `
        <g transform="translate(50, 140)">
          <!-- URL Input Bar -->
          <rect x="0" y="0" width="540" height="46" rx="12" fill="#0A1428" stroke="#00F3FF" stroke-width="1.8"/>
          <circle cx="24" cy="23" r="5" fill="#39FF14"/>
          <text x="38" y="28" fill="#FFFFFF" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="600">notebook.google.com/notebook/8b88ac32...artifact/48e08424</text>
          
          <!-- Scanning Laser line -->
          <line x1="${(t / 3.0) * 540}" y1="0" x2="${(t / 3.0) * 540}" y2="46" stroke="#39FF14" stroke-width="3"/>

          <!-- Status Text -->
          <text x="0" y="80" fill="#94A3B8" font-family="'Inter', sans-serif" font-size="12" font-weight="600">Resolving Google CDN Stream + Audio Overviews...</text>
        </g>
      `;
    } else if (t < 6.5) {
      // PHASE 2: Real-time Audio Spectrum & Studio Extraction
      phaseTitle = 'EXTRACTING AUDIO OVERVIEW + VIDEO';
      phaseContent = `
        <g transform="translate(50, 130)">
          <!-- Animated Audio Spectrum Visualizer -->
          <g transform="translate(140, 20)">
            ${barHeights.map((h, i) => `
              <rect x="${i * 26}" y="${80 - h}" width="14" height="${h}" rx="5" fill="${i % 2 === 0 ? '#00F3FF' : '#39FF14'}"/>
            `).join('')}
          </g>

          <!-- Realtime Harvest Status Indicators -->
          <g transform="translate(0, 110)">
            <rect x="0" y="0" width="540" height="28" rx="8" fill="#061224" stroke="#5865F2" stroke-width="1"/>
            <text x="16" y="18" fill="#39FF14" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="700">✓ 320kbps High-Bitrate Stereo Stream Synchronized (${progress}%)</text>
          </g>
        </g>
      `;
    } else {
      // PHASE 3: Studio Downloads Ready & Success
      phaseTitle = 'HARVEST COMPLETED // READY TO PLAY';
      phaseContent = `
        <g transform="translate(50, 125)">
          <!-- Card 1: Audio M4A -->
          <rect x="0" y="0" width="168" height="68" rx="10" fill="#08142c" stroke="#00F3FF" stroke-width="1.5"/>
          <text x="16" y="26" fill="#00F3FF" font-family="'Inter', sans-serif" font-size="12" font-weight="800">🎙️ Audio Overview</text>
          <text x="16" y="46" fill="#FFFFFF" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="700">320kbps .M4A Ready</text>
          <text x="16" y="60" fill="#39FF14" font-family="'JetBrains Mono', monospace" font-size="9">✓ 1-Click Play</text>

          <!-- Card 2: Video MP4 -->
          <rect x="186" y="0" width="168" height="68" rx="10" fill="#081a17" stroke="#39FF14" stroke-width="1.5"/>
          <text x="202" y="26" fill="#39FF14" font-family="'Inter', sans-serif" font-size="12" font-weight="800">🎬 Video Canvas</text>
          <text x="202" y="46" fill="#FFFFFF" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="700">HD MP4 Stream</text>
          <text x="202" y="60" fill="#00F3FF" font-family="'JetBrains Mono', monospace" font-size="9">✓ Synchronized</text>

          <!-- Card 3: 5-Artifact ZIP -->
          <rect x="372" y="0" width="168" height="68" rx="10" fill="#180e2d" stroke="#BC13FE" stroke-width="1.5"/>
          <text x="388" y="26" fill="#BC13FE" font-family="'Inter', sans-serif" font-size="12" font-weight="800">📦 Studio Bundle</text>
          <text x="388" y="46" fill="#FFFFFF" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="700">All 5 Artifacts</text>
          <text x="388" y="60" fill="#39FF14" font-family="'JetBrains Mono', monospace" font-size="9">✓ JSZip Client Pack</text>

          <!-- Bottom Zero-Retention Seal -->
          <text x="0" y="105" fill="#94A3B8" font-family="'JetBrains Mono', monospace" font-size="10.5" font-weight="600">🛡️ ZERO-RETENTION PROTOCOL // DIRECT CLIENT DOWNLOAD</text>
        </g>
      `;
    }

    const frameSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" width="640" height="360" fill="none">
      <defs>
        <linearGradient id="vfBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#040A18"/>
          <stop offset="50%" stop-color="#02050E"/>
          <stop offset="100%" stop-color="#010307"/>
        </linearGradient>
        <linearGradient id="vfBorder" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#00F3FF"/>
          <stop offset="50%" stop-color="#39FF14"/>
          <stop offset="100%" stop-color="#5865F2"/>
        </linearGradient>
      </defs>

      <!-- Background -->
      <rect width="640" height="360" fill="url(#vfBg)"/>
      <rect x="2" y="2" width="636" height="356" rx="12" fill="none" stroke="url(#vfBorder)" stroke-width="2"/>

      <!-- Header -->
      <g transform="translate(30, 30)">
        <circle cx="12" cy="12" r="10" fill="#00F3FF" opacity="0.2"/>
        <text x="0" y="16" fill="#FFFFFF" font-family="'Inter', sans-serif" font-size="18" font-weight="900" letter-spacing="-0.5">NoCatch</text>
        <text x="82" y="16" fill="#39FF14" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="700">// ${phaseTitle}</text>
        <text x="510" y="16" fill="#94A3B8" font-family="'JetBrains Mono', monospace" font-size="10">00:0${Math.floor(t)} / 00:10</text>
      </g>

      <!-- Main Animated Body -->
      ${phaseContent}

      <!-- Progress Bar (Bottom) -->
      <g transform="translate(30, 330)">
        <rect x="0" y="0" width="580" height="6" rx="3" fill="#0F172A"/>
        <rect x="0" y="0" width="${(t / 10.0) * 580}" height="6" rx="3" fill="#39FF14"/>
      </g>
    </svg>`;

    const frameSvgPath = path.join(framesDir, `frame_${String(f).padStart(4, '0')}.svg`);
    const framePngPath = path.join(framesDir, `frame_${String(f).padStart(4, '0')}.png`);
    fs.writeFileSync(frameSvgPath, frameSvg.trim());
    execSync(`rsvg-convert -w 640 -h 360 "${frameSvgPath}" -o "${framePngPath}"`);
  }

  // Compile with FFMPEG into H.264 MP4 tightly under 0.5 MB (500 KB)
  const videoMp4Path = path.join(ACTIVITY_DIR, 'nocatch-activity-preview-640x360.mp4');
  const webVideoMp4Path = path.join(WEB_ACTIVITY_DIR, 'nocatch-activity-preview-640x360.mp4');

  console.log('Compiling frames into H.264 MP4...');
  // -crf 26 ensures clean quality while staying at ~150-250 KB (well below 500 KB limit)
  execSync(`"${FFMPEG_BIN}" -y -framerate ${fps} -i "${framesDir}/frame_%04d.png" -c:v libx264 -profile:v high -level 3.1 -pix_fmt yuv420p -crf 26 -movflags +faststart "${videoMp4Path}"`);
  fs.copyFileSync(videoMp4Path, webVideoMp4Path);

  const videoStats = fs.statSync(videoMp4Path);
  const videoSizeKb = (videoStats.size / 1024).toFixed(1);
  console.log(`\n🎬 Video Preview Generated Successfully: ${videoMp4Path}`);
  console.log(`   Dimensions: 640x360 (16:9)`);
  console.log(`   Duration: ${durationSec} seconds`);
  console.log(`   File Size: ${videoSizeKb} KB (${(videoStats.size / (1024 * 1024)).toFixed(2)} MB / Max 0.5 MB) -> ${videoStats.size < 500 * 1024 ? '✅ PASSES DISCORD LIMIT' : '❌ EXCEEDS LIMIT'}`);

  // Clean temporary frames
  fs.rmSync(framesDir, { recursive: true });

  // Generate web gallery and instructions at web/public/activity/index.html
  const activityHtml = `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Discord Activity Art Assets — NoCatch | Lorapok Labs</title>
  <meta name="description" content="Official Discord Activity Background, Cover Art, and Video Preview assets for NoCatch.">
  <link rel="icon" type="image/png" href="/assets/nocatch-app-icon.png">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #030712; color: #F8FAFC; font-family: 'Inter', sans-serif; padding: 2.5rem 1.5rem; line-height: 1.6; }
    .container { max-width: 960px; margin: 0 auto; }
    h1 { font-size: 2.2rem; font-weight: 800; background: linear-gradient(135deg, #FFF, #00F3FF 60%, #39FF14 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 0.5rem; }
    .subtitle { color: #94A3B8; margin-bottom: 2rem; font-size: 0.95rem; }
    .asset-card { background: rgba(15, 23, 42, 0.75); border: 1px solid rgba(51, 65, 85, 0.6); border-radius: 1.25rem; padding: 2rem; margin-bottom: 2.5rem; }
    .asset-header { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: baseline; margin-bottom: 1rem; border-bottom: 1px solid rgba(51, 65, 85, 0.4); padding-bottom: 0.75rem; }
    .asset-title { font-size: 1.35rem; font-weight: 700; color: #FFF; }
    .asset-badge { font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; color: #39FF14; background: rgba(57, 255, 20, 0.1); border: 1px solid rgba(57, 255, 20, 0.3); padding: 0.2rem 0.6rem; border-radius: 0.4rem; }
    .asset-desc { font-size: 0.9rem; color: #94A3B8; margin-bottom: 1.25rem; }
    .asset-preview { width: 100%; border-radius: 0.75rem; border: 1px solid rgba(51, 65, 85, 0.5); overflow: hidden; margin-bottom: 1.25rem; background: #010308; }
    .asset-preview img, .asset-preview video { width: 100%; height: auto; display: block; }
    .asset-actions { display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; }
    .btn-download { display: inline-flex; align-items: center; gap: 0.5rem; background: #00F3FF; color: #000; font-weight: 700; padding: 0.6rem 1.2rem; border-radius: 0.5rem; text-decoration: none; }
    .btn-download:hover { background: #39FF14; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Discord Activity Art Assets</h1>
    <p class="subtitle">Complete, production-ready asset pack for Discord Developer Portal &gt; Activities &gt; Art Assets</p>

    <!-- 1. BACKGROUND -->
    <div class="asset-card">
      <div class="asset-header">
        <span class="asset-title">1. Background (Grid View Overlay)</span>
        <span class="asset-badge">1024 × 576 • 16:9 • PNG</span>
      </div>
      <p class="asset-desc">Artwork clustered around outer edges, leaving open center space so Discord's grid UI cards never clash.</p>
      <div class="asset-preview">
        <img src="/activity/nocatch-activity-background-1024x576.png" alt="Activity Background" />
      </div>
      <div class="asset-actions">
        <span style="color:#94A3B8">Optimized PNG</span>
        <a href="/activity/nocatch-activity-background-1024x576.png" download class="btn-download">⬇ Download Background (PNG)</a>
      </div>
    </div>

    <!-- 2. COVER ART -->
    <div class="asset-card">
      <div class="asset-header">
        <span class="asset-title">2. Cover Art (Activity Shelf)</span>
        <span class="asset-badge">1024 × 576 • 16:9 • PNG</span>
      </div>
      <p class="asset-desc">Main image on the Discord Activity Shelf featuring radiant NoCatch branding, mascot, and capability badges.</p>
      <div class="asset-preview">
        <img src="/activity/nocatch-activity-cover-1024x576.png" alt="Activity Cover Art" />
      </div>
      <div class="asset-actions">
        <span style="color:#94A3B8">Optimized PNG</span>
        <a href="/activity/nocatch-activity-cover-1024x576.png" download class="btn-download">⬇ Download Cover Art (PNG)</a>
      </div>
    </div>

    <!-- 3. VIDEO PREVIEW -->
    <div class="asset-card">
      <div class="asset-header">
        <span class="asset-title">3. Video Preview (Hover &amp; Upsell Menu)</span>
        <span class="asset-badge">640 × 360 • 16:9 • 10.0s • MP4</span>
      </div>
      <p class="asset-desc">10-second cinematic UI demonstration showing Google NotebookLM URL parsing, audio spectrum visualization, and ready studio artifacts. File size: <strong>${videoSizeKb} KB</strong> (strictly under Discord's 0.5 MB limit).</p>
      <div class="asset-preview">
        <video controls autoplay loop muted playsinline>
          <source src="/activity/nocatch-activity-preview-640x360.mp4" type="video/mp4" />
          Your browser does not support HTML5 video.
        </video>
      </div>
      <div class="asset-actions">
        <span style="color:#39FF14">File Size: ${videoSizeKb} KB / Max 500 KB</span>
        <a href="/activity/nocatch-activity-preview-640x360.mp4" download class="btn-download">⬇ Download Video (MP4)</a>
      </div>
    </div>
  </div>
</body>
</html>`;

  fs.writeFileSync(path.join(WEB_ACTIVITY_DIR, 'index.html'), activityHtml);
  console.log(`✨ Created Activity Web Gallery: ${path.join(WEB_ACTIVITY_DIR, 'index.html')}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
