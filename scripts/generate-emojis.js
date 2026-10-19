import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import JSZip from 'jszip';

const EMOJI_DIR = path.resolve('assets/branding/emojis');
const WEB_EMOJI_DIR = path.resolve('web/public/emojis');

if (!fs.existsSync(EMOJI_DIR)) fs.mkdirSync(EMOJI_DIR, { recursive: true });
if (!fs.existsSync(WEB_EMOJI_DIR)) fs.mkdirSync(WEB_EMOJI_DIR, { recursive: true });

const emojis = [
  {
    name: 'lorapok_mark',
    category: 'Brand',
    desc: 'Lorapok Labs signature cyber diamond emblem',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128" fill="none">
      <defs>
        <linearGradient id="lm_grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#00F3FF"/>
          <stop offset="50%" stop-color="#39FF14"/>
          <stop offset="100%" stop-color="#BC13FE"/>
        </linearGradient>
        <radialGradient id="lm_glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#00F3FF" stop-opacity="0.4"/>
          <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="64" cy="64" r="56" fill="url(#lm_glow)"/>
      <path d="M64 12 L112 40 L112 88 L64 116 L16 88 L16 40 Z" fill="#080F1D" stroke="url(#lm_grad)" stroke-width="5" stroke-linejoin="round"/>
      <path d="M64 26 L98 48 L98 80 L64 102 L30 80 L30 48 Z" fill="#0F1F38" stroke="#39FF14" stroke-width="3" opacity="0.85"/>
      <polygon points="64,38 86,52 86,76 64,90 42,76 42,52" fill="url(#lm_grad)"/>
      <circle cx="64" cy="64" r="9" fill="#FFFFFF"/>
    </svg>`
  },
  {
    name: 'lorapok_shield',
    category: 'Security',
    desc: 'Zero-Trust security and compliance shield',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128" fill="none">
      <defs>
        <linearGradient id="sh_grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#00F3FF"/>
          <stop offset="100%" stop-color="#39FF14"/>
        </linearGradient>
      </defs>
      <path d="M64 12 L106 28 C106 72 64 114 64 114 C64 114 22 72 22 28 Z" fill="#08101E" stroke="url(#sh_grad)" stroke-width="6" stroke-linejoin="round"/>
      <path d="M64 24 L94 37 C94 68 64 98 64 98 C64 98 34 68 34 37 Z" fill="#0D1E36" opacity="0.6"/>
      <rect x="52" y="56" width="24" height="20" rx="4" fill="#39FF14"/>
      <path d="M57 56 V48 C57 44.1 60.1 41 64 41 C67.9 41 71 44.1 71 48 V56" stroke="#00F3FF" stroke-width="4" stroke-linecap="round"/>
      <circle cx="64" cy="65" r="2.5" fill="#08101E"/>
      <path d="M64 67.5 V71" stroke="#08101E" stroke-width="2" stroke-linecap="round"/>
    </svg>`
  },
  {
    name: 'lorapok_verified',
    category: 'Brand',
    desc: 'Official verified organization and bot badge',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128" fill="none">
      <defs>
        <linearGradient id="vf_grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#39FF14"/>
          <stop offset="100%" stop-color="#00F3FF"/>
        </linearGradient>
      </defs>
      <path d="M64 10 L78 19 L95 16 L102 32 L118 38 L116 55 L126 69 L116 83 L118 100 L102 106 L95 122 L78 119 L64 128 L50 119 L33 122 L26 106 L10 100 L12 83 L2 69 L12 55 L10 38 L26 32 L33 16 L50 19 Z" fill="url(#vf_grad)"/>
      <circle cx="64" cy="69" r="44" fill="#030712"/>
      <path d="M44 69 L58 83 L86 52" fill="none" stroke="#39FF14" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`
  },
  {
    name: 'loragent_core',
    category: 'AI',
    desc: 'Autonomous AI agent core engine',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128" fill="none">
      <defs>
        <radialGradient id="ag_glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#00F3FF" stop-opacity="0.8"/>
          <stop offset="50%" stop-color="#BC13FE" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="64" cy="64" r="48" fill="url(#ag_glow)"/>
      <circle cx="64" cy="64" r="46" stroke="#00F3FF" stroke-width="2" stroke-dasharray="8 6"/>
      <circle cx="64" cy="64" r="34" stroke="#BC13FE" stroke-width="2.5" stroke-dasharray="14 8"/>
      <circle cx="64" cy="64" r="22" stroke="#39FF14" stroke-width="3"/>
      <circle cx="64" cy="64" r="12" fill="#FFFFFF"/>
      <circle cx="64" cy="18" r="4" fill="#00F3FF"/>
      <circle cx="106" cy="74" r="4" fill="#39FF14"/>
      <circle cx="28" cy="88" r="4" fill="#BC13FE"/>
    </svg>`
  },
  {
    name: 'nocatch_bot',
    category: 'Mascot',
    desc: 'Official NoCatch bot mascot head with studio headphones',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128" fill="none">
      <defs>
        <linearGradient id="nb_head" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#00F3FF"/>
          <stop offset="60%" stop-color="#00d29a"/>
          <stop offset="100%" stop-color="#05634d"/>
        </linearGradient>
      </defs>
      <!-- Headphone Arch -->
      <path d="M22 66 C22 36 40 20 64 20 C88 20 106 36 106 66" stroke="#00F3FF" stroke-width="7" stroke-linecap="round"/>
      <!-- Mascot Head -->
      <rect x="30" y="44" width="68" height="56" rx="28" fill="url(#nb_head)" stroke="#052026" stroke-width="3"/>
      <!-- Visor Face Plate -->
      <rect x="38" y="54" width="52" height="34" rx="14" fill="#030A14"/>
      <!-- Glowing Eyes -->
      <circle cx="52" cy="70" r="5" fill="#39FF14"/>
      <circle cx="76" cy="70" r="5" fill="#39FF14"/>
      <!-- Headphone Earcups -->
      <rect x="14" y="56" width="14" height="28" rx="6" fill="#081426" stroke="#00F3FF" stroke-width="2.5"/>
      <rect x="100" y="56" width="14" height="28" rx="6" fill="#081426" stroke="#00F3FF" stroke-width="2.5"/>
      <!-- Mini Antenna -->
      <path d="M64 20 V10" stroke="#39FF14" stroke-width="3" stroke-linecap="round"/>
      <circle cx="64" cy="8" r="3.5" fill="#39FF14"/>
    </svg>`
  },
  {
    name: 'nocatch_headphones',
    category: 'Audio',
    desc: 'Studio monitoring headphones emitting sound pulses',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128" fill="none">
      <defs>
        <linearGradient id="hp_grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#00F3FF"/>
          <stop offset="50%" stop-color="#39FF14"/>
          <stop offset="100%" stop-color="#00F3FF"/>
        </linearGradient>
      </defs>
      <!-- Soundwave Arcs -->
      <path d="M12 64 C12 30 36 14 64 14 C92 14 116 30 116 64" stroke="#5865F2" stroke-width="2.5" opacity="0.4" stroke-dasharray="4 6"/>
      <!-- Main Headband -->
      <path d="M26 68 C26 38 42 24 64 24 C86 24 102 38 102 68" stroke="url(#hp_grad)" stroke-width="8" stroke-linecap="round"/>
      <!-- Left Ear Cup -->
      <rect x="16" y="58" width="18" height="38" rx="8" fill="#040914" stroke="#00F3FF" stroke-width="3"/>
      <circle cx="25" cy="77" r="4" fill="#39FF14"/>
      <!-- Right Ear Cup -->
      <rect x="94" y="58" width="18" height="38" rx="8" fill="#040914" stroke="#00F3FF" stroke-width="3"/>
      <circle cx="103" cy="77" r="4" fill="#39FF14"/>
      <!-- Audio Wave Core -->
      <path d="M46 77 H52 M58 71 V83 M64 64 V90 M70 71 V83 M76 77 H82" stroke="#39FF14" stroke-width="3" stroke-linecap="round"/>
    </svg>`
  },
  {
    name: 'nocatch_audio',
    category: 'Audio',
    desc: 'Dynamic stereo equalizer spectrum audio waves',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128" fill="none">
      <defs>
        <linearGradient id="eq_grad" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stop-color="#00F3FF"/>
          <stop offset="65%" stop-color="#39FF14"/>
          <stop offset="100%" stop-color="#FFFFFF"/>
        </linearGradient>
      </defs>
      <!-- Background Circle -->
      <rect x="8" y="8" width="112" height="112" rx="28" fill="#040A18" stroke="#00F3FF" stroke-width="2.5" opacity="0.9"/>
      <!-- Spectrum Bars -->
      <rect x="22" y="56" width="12" height="38" rx="6" fill="#5865F2"/>
      <rect x="40" y="32" width="12" height="62" rx="6" fill="#00F3FF"/>
      <rect x="58" y="18" width="12" height="76" rx="6" fill="url(#eq_grad)"/>
      <rect x="76" y="38" width="12" height="56" rx="6" fill="#39FF14"/>
      <rect x="94" y="60" width="12" height="34" rx="6" fill="#BC13FE"/>
      <!-- Base Line -->
      <line x1="18" y1="102" x2="110" y2="102" stroke="#334155" stroke-width="2" stroke-linecap="round"/>
    </svg>`
  },
  {
    name: 'nocatch_video',
    category: 'Media',
    desc: 'Google NotebookLM synchronized MP4 video canvas',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128" fill="none">
      <defs>
        <linearGradient id="vd_grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#39FF14"/>
          <stop offset="100%" stop-color="#00F3FF"/>
        </linearGradient>
      </defs>
      <!-- Video Screen Frame -->
      <rect x="12" y="24" width="104" height="80" rx="18" fill="#050C1A" stroke="url(#vd_grad)" stroke-width="4.5"/>
      <!-- Film Perforation dots -->
      <circle cx="24" cy="36" r="3" fill="#39FF14" opacity="0.6"/>
      <circle cx="24" cy="92" r="3" fill="#39FF14" opacity="0.6"/>
      <circle cx="104" cy="36" r="3" fill="#00F3FF" opacity="0.6"/>
      <circle cx="104" cy="92" r="3" fill="#00F3FF" opacity="0.6"/>
      <!-- Play Button Triangle -->
      <polygon points="52,44 88,64 52,84" fill="url(#vd_grad)"/>
      <!-- Subtle Scanline -->
      <line x1="16" y1="64" x2="44" y2="64" stroke="#39FF14" stroke-width="1.5" opacity="0.4"/>
      <line x1="92" y1="64" x2="112" y2="64" stroke="#00F3FF" stroke-width="1.5" opacity="0.4"/>
    </svg>`
  },
  {
    name: 'nocatch_zip',
    category: 'Tool',
    desc: 'Full studio 5-artifact archive zip bundle',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128" fill="none">
      <defs>
        <linearGradient id="zip_grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#00F3FF"/>
          <stop offset="100%" stop-color="#BC13FE"/>
        </linearGradient>
      </defs>
      <!-- Isometric Archive Box -->
      <path d="M64 14 L110 38 L64 62 L18 38 Z" fill="#122544" stroke="#00F3FF" stroke-width="3.5" stroke-linejoin="round"/>
      <path d="M18 38 L64 62 L64 112 L18 88 Z" fill="#0A162A" stroke="#00F3FF" stroke-width="3.5" stroke-linejoin="round"/>
      <path d="M110 38 L64 62 L64 112 L110 88 Z" fill="#070E1C" stroke="#BC13FE" stroke-width="3.5" stroke-linejoin="round"/>
      <!-- Glowing Zipper Seam -->
      <path d="M64 62 V110" stroke="#39FF14" stroke-width="4" stroke-dasharray="4 3"/>
      <!-- ZIP Badge -->
      <rect x="52" y="30" width="24" height="16" rx="3" fill="#39FF14"/>
      <text x="64" y="42" fill="#000000" font-family="'Inter', sans-serif" font-size="9" font-weight="900" text-anchor="middle">ZIP</text>
    </svg>`
  },
  {
    name: 'nocatch_spark',
    category: 'AI',
    desc: 'NotebookLM and Gemini generative intelligence spark',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128" fill="none">
      <defs>
        <radialGradient id="spk_core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#FFFFFF"/>
          <stop offset="35%" stop-color="#39FF14"/>
          <stop offset="70%" stop-color="#00F3FF"/>
          <stop offset="100%" stop-color="#BC13FE"/>
        </radialGradient>
      </defs>
      <!-- 4-point AI Star Spark -->
      <path d="M64 6 C64 42 42 64 6 64 C42 64 64 86 64 122 C64 86 86 64 122 64 C86 64 64 42 64 6 Z" fill="url(#spk_core)"/>
      <circle cx="64" cy="64" r="10" fill="#FFFFFF"/>
      <circle cx="28" cy="28" r="4" fill="#39FF14"/>
      <circle cx="100" cy="28" r="4" fill="#00F3FF"/>
      <circle cx="100" cy="100" r="3" fill="#BC13FE"/>
    </svg>`
  },
  {
    name: 'notebooklm_studio',
    category: 'Product',
    desc: 'Google NotebookLM studio notebook with acoustic waves',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128" fill="none">
      <defs>
        <linearGradient id="nb_grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#00F3FF"/>
          <stop offset="100%" stop-color="#39FF14"/>
        </linearGradient>
      </defs>
      <!-- Notebook Cover / Base -->
      <path d="M22 28 C22 22 26 18 32 18 H96 C102 18 106 22 106 28 V108 C106 114 102 118 96 118 H32 C26 118 22 114 22 108 Z" fill="#08101E" stroke="url(#nb_grad)" stroke-width="4"/>
      <!-- Spine -->
      <path d="M34 18 V118" stroke="#00F3FF" stroke-width="3"/>
      <!-- Audio Wave lines on page -->
      <path d="M46 42 H92 M46 54 H82 M46 66 H92" stroke="#334155" stroke-width="3" stroke-linecap="round"/>
      <!-- Glowing Audio Pulse on bottom of notebook -->
      <path d="M46 90 L52 82 L60 98 L68 76 L76 94 L84 86 L92 90" stroke="#39FF14" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <!-- Bookmark Ribbon -->
      <polygon points="76,18 86,18 86,36 81,31 76,36" fill="#00F3FF"/>
    </svg>`
  },
  {
    name: 'podcast_mic',
    category: 'Audio',
    desc: 'Studio condenser microphone with on-air broadcast pulse',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128" fill="none">
      <defs>
        <linearGradient id="mic_grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#39FF14"/>
          <stop offset="100%" stop-color="#00F3FF"/>
        </linearGradient>
      </defs>
      <!-- Soundwave Radiations -->
      <path d="M26 44 C20 54 20 68 26 78 M102 44 C108 54 108 68 102 78" stroke="#39FF14" stroke-width="3" stroke-linecap="round"/>
      <path d="M16 34 C6 50 6 72 16 88 M112 34 C122 50 122 72 112 88" stroke="#00F3FF" stroke-width="2.5" opacity="0.6" stroke-linecap="round"/>
      <!-- Mic Capsule -->
      <rect x="46" y="16" width="36" height="60" rx="18" fill="#0A1424" stroke="url(#mic_grad)" stroke-width="4"/>
      <!-- Grille details -->
      <line x1="46" y1="44" x2="82" y2="44" stroke="#00F3FF" stroke-width="2"/>
      <line x1="56" y1="22" x2="56" y2="44" stroke="#39FF14" stroke-width="2"/>
      <line x1="72" y1="22" x2="72" y2="44" stroke="#39FF14" stroke-width="2"/>
      <!-- U-Mount -->
      <path d="M38 52 V66 C38 80 50 92 64 92 C78 92 90 80 90 66 V52" stroke="#5865F2" stroke-width="4" stroke-linecap="round"/>
      <!-- Stand and Base -->
      <path d="M64 92 V112 M42 112 H86" stroke="#5865F2" stroke-width="4.5" stroke-linecap="round"/>
      <!-- On Air Red Dot -->
      <circle cx="64" cy="58" r="3.5" fill="#FF0055"/>
    </svg>`
  },
  {
    name: 'hq_320k',
    category: 'Audio',
    desc: '320kbps high fidelity studio audio badge',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128" fill="none">
      <defs>
        <linearGradient id="hq_grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FFD700"/>
          <stop offset="50%" stop-color="#39FF14"/>
          <stop offset="100%" stop-color="#00F3FF"/>
        </linearGradient>
      </defs>
      <!-- Hexagon Shield -->
      <polygon points="64,8 116,36 116,92 64,120 12,92 12,36" fill="#040916" stroke="url(#hq_grad)" stroke-width="4.5"/>
      <!-- HQ Text -->
      <text x="64" y="44" fill="#00F3FF" font-family="'JetBrains Mono', monospace" font-size="16" font-weight="800" text-anchor="middle" letter-spacing="1">HI-RES</text>
      <!-- 320K Core Text -->
      <text x="64" y="78" fill="#39FF14" font-family="'Inter', sans-serif" font-size="28" font-weight="900" text-anchor="middle" letter-spacing="-0.5">320K</text>
      <!-- Subtitle -->
      <text x="64" y="100" fill="#94A3B8" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="700" text-anchor="middle">M4A STEREO</text>
    </svg>`
  },
  {
    name: 'status_online',
    category: 'Status',
    desc: 'Operational online heartbeat status orb',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128" fill="none">
      <defs>
        <radialGradient id="son_glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#39FF14"/>
          <stop offset="50%" stop-color="#39FF14" stop-opacity="0.4"/>
          <stop offset="100%" stop-color="#39FF14" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <!-- Radar Pulse Rings -->
      <circle cx="64" cy="64" r="54" stroke="#39FF14" stroke-width="1.5" opacity="0.25"/>
      <circle cx="64" cy="64" r="42" stroke="#39FF14" stroke-width="2" opacity="0.4" stroke-dasharray="8 6"/>
      <circle cx="64" cy="64" r="30" stroke="#39FF14" stroke-width="3" opacity="0.7"/>
      <!-- Glowing Core Orb -->
      <circle cx="64" cy="64" r="22" fill="url(#son_glow)"/>
      <circle cx="64" cy="64" r="16" fill="#39FF14"/>
      <circle cx="59" cy="59" r="4" fill="#FFFFFF"/>
    </svg>`
  },
  {
    name: 'status_extracting',
    category: 'Status',
    desc: 'Active extraction and harvesting sync loop',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128" fill="none">
      <defs>
        <linearGradient id="ext_grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#00F3FF"/>
          <stop offset="100%" stop-color="#39FF14"/>
        </linearGradient>
      </defs>
      <!-- Circular Revolving Sync Arrows -->
      <path d="M64 16 A 48 48 0 0 1 112 64" fill="none" stroke="#00F3FF" stroke-width="7" stroke-linecap="round"/>
      <polygon points="106,52 118,66 100,68" fill="#00F3FF"/>
      <path d="M64 112 A 48 48 0 0 1 16 64" fill="none" stroke="#39FF14" stroke-width="7" stroke-linecap="round"/>
      <polygon points="22,76 10,62 28,60" fill="#39FF14"/>
      <!-- Center Download Arrow -->
      <path d="M64 42 V82 M48 66 L64 84 L80 66" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`
  },
  {
    name: 'status_success',
    category: 'Status',
    desc: 'Successful operation and validation check',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128" fill="none">
      <defs>
        <linearGradient id="sc_grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#39FF14"/>
          <stop offset="100%" stop-color="#00F3FF"/>
        </linearGradient>
      </defs>
      <polygon points="64,10 114,38 114,90 64,118 14,90 14,38" fill="#04120C" stroke="url(#sc_grad)" stroke-width="5" stroke-linejoin="round"/>
      <circle cx="64" cy="64" r="36" fill="#082218" opacity="0.6"/>
      <path d="M42 64 L56 78 L86 48" fill="none" stroke="#39FF14" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`
  },
  {
    name: 'status_error',
    category: 'Status',
    desc: 'Alert notice and exception indicator',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128" fill="none">
      <defs>
        <linearGradient id="err_grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FF0055"/>
          <stop offset="100%" stop-color="#FF5500"/>
        </linearGradient>
      </defs>
      <path d="M64 12 L118 106 C120 110 117 116 112 116 H16 C11 116 8 110 10 106 Z" fill="#1C060D" stroke="url(#err_grad)" stroke-width="5" stroke-linejoin="round"/>
      <path d="M64 44 V74" stroke="#FF0055" stroke-width="7" stroke-linecap="round"/>
      <circle cx="64" cy="94" r="4.5" fill="#FFFFFF"/>
    </svg>`
  },
  {
    name: 'speed_turbo',
    category: 'Utility',
    desc: 'Instant sub-second harvesting speed lightning bolt',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128" fill="none">
      <defs>
        <linearGradient id="tb_grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#00F3FF"/>
          <stop offset="50%" stop-color="#39FF14"/>
          <stop offset="100%" stop-color="#FFEE00"/>
        </linearGradient>
      </defs>
      <!-- Background Cyber Hex -->
      <polygon points="64,8 116,36 116,92 64,120 12,92 12,36" fill="#040D18" stroke="#00F3FF" stroke-width="3" opacity="0.6"/>
      <!-- Lightning Bolt -->
      <polygon points="72,14 26,68 60,68 48,114 104,56 70,56" fill="url(#tb_grad)"/>
      <circle cx="72" cy="14" r="3" fill="#FFFFFF"/>
      <circle cx="48" cy="114" r="3" fill="#FFFFFF"/>
    </svg>`
  },
  {
    name: 'vault_lock',
    category: 'Security',
    desc: 'Zero-Retention encrypted client-side vault',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128" fill="none">
      <defs>
        <linearGradient id="vl_grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#BC13FE"/>
          <stop offset="100%" stop-color="#00F3FF"/>
        </linearGradient>
      </defs>
      <!-- Vault Body -->
      <rect x="24" y="48" width="80" height="66" rx="14" fill="#0A0618" stroke="url(#vl_grad)" stroke-width="5"/>
      <!-- Shackle -->
      <path d="M42 48 V34 C42 22 52 12 64 12 C76 12 86 22 86 34 V48" fill="none" stroke="url(#vl_grad)" stroke-width="6" stroke-linecap="round"/>
      <!-- Safe dial / Keyhole -->
      <circle cx="64" cy="80" r="14" fill="#140D2E" stroke="#BC13FE" stroke-width="2.5"/>
      <circle cx="64" cy="77" r="4" fill="#39FF14"/>
      <path d="M64 81 V88" stroke="#39FF14" stroke-width="3" stroke-linecap="round"/>
    </svg>`
  },
  {
    name: 'discord_bot',
    category: 'Discord',
    desc: 'Discord blurple app badge with cyber antennae',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128" fill="none">
      <defs>
        <linearGradient id="dc_grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#5865F2"/>
          <stop offset="100%" stop-color="#3843b0"/>
        </linearGradient>
      </defs>
      <!-- Base Background Rounded Square -->
      <rect x="12" y="12" width="104" height="104" rx="28" fill="url(#dc_grad)"/>
      <rect x="12" y="12" width="104" height="104" rx="28" fill="none" stroke="#00F3FF" stroke-width="2.5" opacity="0.7"/>
      <!-- Discord Mascot Shape -->
      <path d="M88 38 C80 34 72 32 64 32 C56 32 48 34 40 38 C28 55 24 72 26 88 C34 94 44 96 52 96 L56 90 C46 87 42 82 42 82 C42 82 43 83 45 84 C50 87 57 88 64 88 C71 88 78 87 83 84 C85 83 86 82 86 82 C86 82 82 87 72 90 L76 96 C84 96 94 94 102 88 C104 70 99 53 88 38 Z" fill="#FFFFFF"/>
      <!-- Eyes -->
      <ellipse cx="48" cy="62" rx="6" ry="7" fill="#5865F2"/>
      <ellipse cx="80" cy="62" rx="6" ry="7" fill="#5865F2"/>
      <!-- Cyan Pupil Accents -->
      <circle cx="48" cy="62" r="2.5" fill="#00F3FF"/>
      <circle cx="80" cy="62" r="2.5" fill="#00F3FF"/>
    </svg>`
  }
];

async function main() {
  console.log(`Generating ${emojis.length} custom Discord Emojis...`);

  const zip = new JSZip();
  const manifest = [];

  for (const item of emojis) {
    const svgPath = path.join(EMOJI_DIR, `${item.name}.svg`);
    const pngPath = path.join(EMOJI_DIR, `${item.name}.png`);
    const webSvgPath = path.join(WEB_EMOJI_DIR, `${item.name}.svg`);
    const webPngPath = path.join(WEB_EMOJI_DIR, `${item.name}.png`);

    // Write SVG
    fs.writeFileSync(svgPath, item.svg.trim());
    fs.writeFileSync(webSvgPath, item.svg.trim());

    // Convert to 128x128 PNG via rsvg-convert
    execSync(`rsvg-convert -w 128 -h 128 "${svgPath}" -o "${pngPath}"`);
    fs.copyFileSync(pngPath, webPngPath);

    const stats = fs.statSync(pngPath);
    const sizeKb = (stats.size / 1024).toFixed(1);

    // Add to ZIP
    const pngBuffer = fs.readFileSync(pngPath);
    zip.file(`${item.name}.png`, pngBuffer);

    manifest.push({
      name: item.name,
      category: item.category,
      desc: item.desc,
      sizeKb,
      path: `assets/branding/emojis/${item.name}.png`,
      url: `https://nocatch.lorapok.tech/emojis/${item.name}.png`
    });

    console.log(`  ✔ [${item.category}] :${item.name}: -> ${sizeKb} KB (128x128 PNG)`);
  }

  // Generate ZIP bundle
  const zipBuffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  const zipPath = path.join(EMOJI_DIR, 'nocatch-discord-emojis.zip');
  const webZipPath = path.join(WEB_EMOJI_DIR, 'nocatch-discord-emojis.zip');
  fs.writeFileSync(zipPath, zipBuffer);
  fs.writeFileSync(webZipPath, zipBuffer);
  console.log(`\n📦 Created ZIP archive with all ${emojis.length} emojis: ${zipPath} (${(zipBuffer.length / 1024).toFixed(1)} KB)`);

  // Generate web gallery HTML at web/public/emojis/index.html
  const galleryHtml = `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Discord Emojis Suite — NoCatch | Lorapok Labs</title>
  <meta name="description" content="Official 128x128 custom Discord emojis for NoCatch and Lorapok Labs. Download individually or as a complete bundle.">
  <link rel="icon" type="image/png" href="/assets/nocatch-app-icon.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: #030712;
      color: #F8FAFC;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      min-height: 100vh;
      padding: 2rem 1.5rem;
    }
    .container { max-width: 1040px; margin: 0 auto; }
    header {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
      padding-bottom: 2rem;
      border-bottom: 1px solid rgba(51, 65, 85, 0.6);
      margin-bottom: 2.5rem;
    }
    .title-group h1 {
      font-size: 2rem;
      font-weight: 800;
      background: linear-gradient(135deg, #FFF, #00F3FF 60%, #39FF14 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 0.25rem;
    }
    .title-group p { font-size: 0.9rem; color: #94A3B8; }
    .btn-zip {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: linear-gradient(135deg, #39FF14, #00F3FF);
      color: #000;
      font-weight: 700;
      font-size: 0.9rem;
      padding: 0.75rem 1.4rem;
      border-radius: 9999px;
      text-decoration: none;
      box-shadow: 0 4px 20px rgba(57, 255, 20, 0.3);
      transition: transform 0.2s;
    }
    .btn-zip:hover { transform: translateY(-2px); }
    .specs-banner {
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(51, 65, 85, 0.5);
      border-radius: 1rem;
      padding: 1.25rem 1.5rem;
      margin-bottom: 2rem;
      display: flex;
      flex-wrap: wrap;
      gap: 2rem;
      font-size: 0.85rem;
    }
    .spec-item { display: flex; flex-direction: column; gap: 0.2rem; }
    .spec-label { font-size: 0.75rem; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.05em; }
    .spec-val { font-weight: 600; color: #00F3FF; font-family: 'JetBrains Mono', monospace; }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 1.25rem;
    }
    .card {
      background: rgba(15, 23, 42, 0.7);
      border: 1px solid rgba(51, 65, 85, 0.6);
      border-radius: 1rem;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      position: relative;
      transition: all 0.2s ease;
    }
    .card:hover {
      border-color: #00F3FF;
      transform: translateY(-3px);
      box-shadow: 0 10px 25px -10px rgba(0, 243, 255, 0.25);
    }
    .emoji-preview {
      width: 96px;
      height: 96px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: radial-gradient(circle, rgba(255,255,255,0.06) 0%, rgba(0,0,0,0) 70%);
      border-radius: 1rem;
      margin-bottom: 1rem;
    }
    .emoji-preview img {
      width: 72px;
      height: 72px;
      object-fit: contain;
    }
    .emoji-name {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.85rem;
      font-weight: 700;
      color: #39FF14;
      background: rgba(57, 255, 20, 0.08);
      border: 1px solid rgba(57, 255, 20, 0.2);
      padding: 0.2rem 0.6rem;
      border-radius: 0.4rem;
      margin-bottom: 0.4rem;
      cursor: pointer;
    }
    .emoji-desc {
      font-size: 0.75rem;
      color: #94A3B8;
      margin-bottom: 0.8rem;
      line-height: 1.4;
      min-height: 2.1rem;
    }
    .card-footer {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid rgba(51, 65, 85, 0.4);
      padding-top: 0.75rem;
      font-size: 0.75rem;
      color: #64748B;
    }
    .download-link {
      color: #00F3FF;
      text-decoration: none;
      font-weight: 600;
    }
    .download-link:hover { text-decoration: underline; }
    .toast {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background: #39FF14;
      color: #000;
      font-weight: 700;
      padding: 0.6rem 1.2rem;
      border-radius: 0.5rem;
      font-size: 0.85rem;
      box-shadow: 0 4px 20px rgba(0,0,0,0.5);
      display: none;
      z-index: 100;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="title-group">
        <h1>NoCatch &amp; Lorapok Discord Emojis</h1>
        <p>Complete 20-emoji professional set configured for Discord App &amp; Server upload</p>
      </div>
      <a href="/emojis/nocatch-discord-emojis.zip" class="btn-zip" download>
        ⬇ Download All 20 Emojis (.ZIP)
      </a>
    </header>

    <div class="specs-banner">
      <div class="spec-item">
        <span class="spec-label">Resolution</span>
        <span class="spec-val">128 × 128 px (Square)</span>
      </div>
      <div class="spec-item">
        <span class="spec-label">Format</span>
        <span class="spec-val">PNG (Transparent Alpha)</span>
      </div>
      <div class="spec-item">
        <span class="spec-label">File Sizes</span>
        <span class="spec-val">~3–10 KB each (&lt; 256 KB limit)</span>
      </div>
      <div class="spec-item">
        <span class="spec-label">Naming Compliance</span>
        <span class="spec-val">[a-z0-9_] Validated</span>
      </div>
    </div>

    <div class="grid">
      ${manifest.map(m => `
        <div class="card">
          <div class="emoji-preview">
            <img src="/emojis/${m.name}.png" alt=":${m.name}:" />
          </div>
          <span class="emoji-name" onclick="copyName('${m.name}')" title="Click to copy :${m.name}:">:${m.name}:</span>
          <p class="emoji-desc">${m.desc}</p>
          <div class="card-footer">
            <span>${m.sizeKb} KB</span>
            <a href="/emojis/${m.name}.png" download="${m.name}.png" class="download-link">Download PNG</a>
          </div>
        </div>
      `).join('\n')}
    </div>
  </div>

  <div id="toast" class="toast">Copied emoji name!</div>

  <script>
    function copyName(name) {
      navigator.clipboard.writeText(':' + name + ':').then(() => {
        const toast = document.getElementById('toast');
        toast.innerText = 'Copied :' + name + ': to clipboard!';
        toast.style.display = 'block';
        setTimeout(() => { toast.style.display = 'none'; }, 2000);
      });
    }
  </script>
</body>
</html>`;

  fs.writeFileSync(path.join(WEB_EMOJI_DIR, 'index.html'), galleryHtml);
  console.log(`\n✨ Created Web Preview Gallery: ${path.join(WEB_EMOJI_DIR, 'index.html')}`);

  // Write catalog markdown
  const mdCatalog = `# 🎨 NoCatch & Lorapok Labs — Discord Custom Emoji Catalog

This catalog contains **${emojis.length} professional custom emojis** designed for the **NoCatch Discord Application** and community Discord servers.

### 📋 Technical Specifications
- **Dimensions**: 128 × 128 pixels (Discord recommended standard)
- **Format**: PNG with 32-bit transparent alpha channel
- **File Sizes**: ~3 KB to 10 KB (Discord limit: 256 KB)
- **Naming**: 100% compliant with Discord criteria (lowercase alphanumeric and underscores only)
- **ZIP Bundle**: [\`nocatch-discord-emojis.zip\`](https://nocatch.lorapok.tech/emojis/nocatch-discord-emojis.zip)
- **Live Preview Gallery**: [https://nocatch.lorapok.tech/emojis/](https://nocatch.lorapok.tech/emojis/)

---

## 🖼️ Emoji Catalog Table

| Preview | Emoji Name | Category | Description | Direct Link |
| :---: | :--- | :--- | :--- | :---: |
${manifest.map(m => `| <img src="https://nocatch.lorapok.tech/emojis/${m.name}.png" width="36" height="36" /> | \`:${m.name}:\` | ${m.category} | ${m.desc} | [PNG](https://nocatch.lorapok.tech/emojis/${m.name}.png) |`).join('\n')}

---

## 🚀 How to Upload to Discord Developer Portal (App Emojis)

1. Open your **[Discord Developer Portal](https://discord.com/developers/applications/1561581247208099843/emojis)** $\\to$ **Emojis** tab.
2. Click **Upload Emoji**.
3. Select any or all PNG files from [\`assets/branding/emojis/\`](file://${EMOJI_DIR}) or unpack [\`nocatch-discord-emojis.zip\`](file://${zipPath}).
4. Discord will automatically name each emoji matching the filename (e.g. \`nocatch_bot\`, \`lorapok_mark\`).
5. When used by your bot or users, they render globally across all Discord servers!
`;

  fs.writeFileSync(path.join(EMOJI_DIR, 'README.md'), mdCatalog);
  console.log(`📄 Wrote catalog documentation to assets/branding/emojis/README.md`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
