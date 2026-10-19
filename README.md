# ⚡ NoCatch

> **Universal Google NotebookLM Media & Artifact Harvester**  
> *Official Product of [Lorapok Labs](https://lorapok.tech) • Hosted at [nocatch.lorapok.tech](https://nocatch.lorapok.tech)*

[![Lorapok Labs](https://img.shields.io/badge/Lorapok%20Labs-Official%20Product-00F3FF?style=for-the-badge&logo=google)](https://lorapok.tech)
[![License: MIT](https://img.shields.io/badge/License-MIT-39FF14?style=for-the-badge)](LICENSE)
[![Ecosystem: Loragent](https://img.shields.io/badge/Ecosystem-Loragent%20v2.0-BC13FE?style=for-the-badge)](https://github.com/Maijied/Loragent)

---

## 🌟 Overview

**NoCatch** is the definitive, zero-loss extraction engine for **Google NotebookLM** (formerly Project Tailwind). It allows developers, researchers, and creators to download **Audio Overviews (podcasts)**, transcripts, briefing documents, study guides, FAQs, mind maps, notes, and cited sources in **1-click** — as **single items** or **bundled completely at once**.

### 💎 Key Features
- **⚡ Direct RPC Protocol Harvester:** Communicates with Google's internal `v9rmvd` batchExecute protocol directly in <2 seconds. No flaky headless browser overhead required for public artifacts.
- **🎙 Pristine 128kbps AAC (M4A) Audio:** Resolves high-fidelity Google CDN streams directly from `drum.usercontent.google.com` with original metadata and duration tags.
- **📦 Single Item or "Download Everything" (ZIP Bundle):** Download an individual podcast episode or bundle audio + synthesized markdown notes + source citation manifests into a single indexed ZIP archive.
- **🌐 Alive Cybernetic Web Application:** Hosted at `nocatch.lorapok.tech` featuring real-time soundwave visualization, interactive cyber player with waveform scrubbing, speed multipliers (0.75x to 2x), and instant download triggers.
- **🤖 Dedicated Discord Application & Bot:** Ingests Discord message links, auto-detects NotebookLM links in server channels and DMs, and generates rich embeds with download buttons.
- **🧩 Cross-Browser Social Media Extension:** Injects a 1-click download bar directly on `notebook.google.com` and renders a floating `⚡ NoCatch` badge on **Discord Web, X (Twitter), Reddit, LinkedIn, Facebook, and Slack**.
- **🦾 Loragent Ecosystem Agent:** Integrated into Loragent as `loragent-nocatch` (`/mnt/NewVolume/Personal_Projects/loragent/agents/loragent-nocatch/SKILL.md`).

---

## 🏛 System Architecture

```
nocatch/
├── assets/branding/             # Lorapok Labs official logos, SVGs & marks
│   ├── nocatch-logo.svg         # Official NoCatch brand mark
│   └── loragent-logo-mark.svg   # Lorapok squircle mark
├── packages/core/               # Core Extraction Library & CLI (@lorapok/nocatch-core)
│   ├── bin/nocatch.js           # CLI binary tool
│   └── src/extractor.js         # Direct Google RPC engine
├── web/                         # Alive React 19 + Tailwind CSS + Framer Motion Frontend
│   ├── src/App.jsx              # Cyber audio player & live soundwave visualizer
│   └── wrangler.jsonc           # Cloudflare Pages deployment (nocatch.lorapok.tech)
├── server/                      # Express API Gateway (/api/extract, /api/download, /api/bundle)
│   └── src/server.js
├── discord-bot/                 # Discord.js v14 Application
│   ├── src/bot.js               # Auto-detector & slash commands
│   └── test/test-discord-link.js# Discord DM/channel test harness
└── extension/                   # Manifest V3 Extension for Chrome, Firefox, Edge & Brave
    ├── manifest.json
    └── src/content.js           # Social media link injector
```

---

## 🚀 Quick Start

### 1. Command-Line Interface (CLI)

```bash
# Clone the repository
git clone https://github.com/Lorapok/nocatch.git
cd nocatch

# Inspect metadata & stream URLs without downloading
node packages/core/bin/nocatch.js "https://notebook.google.com/notebook/8b88ac32-9785-489b-a224-9d95864fddca/artifact/48e08424-d530-4d98-990c-a08dce8e015d" --info

# Download audio overview directly
node packages/core/bin/nocatch.js "https://notebook.google.com/notebook/8b88ac32-9785-489b-a224-9d95864fddca/artifact/48e08424-d530-4d98-990c-a08dce8e015d" -o ./podcast.m4a
```

### 2. Loragent Agent

Within the Loragent framework:
```bash
node /mnt/NewVolume/Personal_Projects/loragent/bin/loragent-nocatch.js "<notebook_url>"
```

### 3. Running Web Application & API Locally

```bash
# Terminal 1: Start API Server
cd server
npm start

# Terminal 2: Start Web UI (Vite)
cd web
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🤖 Discord Application & Bot

### Slash Commands
- `/nocatch extract <url>`: Generates an interactive Discord Embed with Play/Download buttons and metadata.
- `/nocatch audio <url>`: Immediately fetches and streams the audio overview podcast file into Discord.
- `/nocatch all <url>`: Downloads and bundles all notes and audio into a ZIP archive.

### Testing Channel/DM Links
To test extracting links shared in Discord DMs (such as `https://discord.com/channels/@me/1559338219865112720/1561520181086261368`):
```bash
npm run test:discord
```

---

## 🧩 Browser Extension / Addon for Social Media

Install the extension in **Chrome, Brave, Edge, or Firefox**:
1. Open `chrome://extensions/` (or `edge://extensions/` / `about:debugging`).
2. Enable **Developer mode**.
3. Click **Load unpacked** and select the `/mnt/NewVolume/Personal_Projects/loragent/nocatch/extension` folder.
4. Visit any social media site (**Discord Web, X/Twitter, Reddit, LinkedIn**) or Google NotebookLM:
   - A glowing **⚡ NoCatch** button will automatically appear next to any NotebookLM link!

---

## 🌐 Deployment to nocatch.lorapok.tech

The web interface is ready for Cloudflare Pages:
```bash
cd web
npm run build
npx wrangler pages deploy dist --project-name nocatch
```

---

## 📄 License

Created by **Lorapok Labs** under the **MIT License**.  
*For questions or enterprise deployments, visit [lorapok.tech](https://lorapok.tech).*
