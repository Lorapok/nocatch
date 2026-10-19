# 📖 Complete Tutorial & Documentation: NoCatch
### *Universal Google NotebookLM Audio, Video & Artifact Harvester*
*A Product of [Lorapok Labs](https://lorapok.tech) • Live at [nocatch.lorapok.tech](https://nocatch.lorapok.tech)*

---

## 📑 Table of Contents
1. [Overview & Capabilities](#1-overview--capabilities)
2. [Understanding Google NotebookLM Links](#2-understanding-google-notebooklm-links)
3. [Tutorial: Using the Web Application](#3-tutorial-using-the-web-application)
   - [Pasting Links & Instant Harvesting](#pasting-links--instant-harvesting)
   - [Interactive Audio & Video Playback](#interactive-audio--video-playback)
   - [Downloading Individual Studio Files](#downloading-individual-studio-files)
   - [Downloading the Complete Master ZIP Bundle](#downloading-the-complete-master-zip-bundle)
   - [Batch Notebook Downloads](#batch-notebook-downloads)
4. [Tutorial: Browser Addon for Social Media](#4-tutorial-browser-addon-for-social-media)
   - [Supported Browsers](#supported-browsers)
   - [Installation Guide (Chrome, Brave, Edge, Firefox)](#installation-guide)
   - [Floating Download Buttons on Socials](#floating-download-buttons-on-socials)
5. [Tutorial: Discord Application & Bot](#5-tutorial-discord-application--bot)
   - [Slash Commands Guide](#slash-commands-guide)
   - [Resolving Discord Message Links](#resolving-discord-message-links)
6. [Tutorial: Command-Line Interface (CLI)](#6-tutorial-command-line-interface-cli)
7. [Developer REST API Reference](#7-developer-rest-api-reference)
   - [POST /api/extract](#post-apiextract)
   - [GET /api/stream](#get-apistream)
   - [GET /api/download](#get-apidownload)
8. [Troubleshooting & Frequently Asked Questions (FAQ)](#8-troubleshooting--faq)

---

## 1. Overview & Capabilities

Google NotebookLM generates rich, AI-synthesized multimedia artifacts from user notes, documents, and slides:
- **Audio Overviews (Deep Dives)**: Dual-host conversational podcast discussions.
- **Google Video Canvas**: DASH-muxed synchronized H.264 video streams.
- **Study Guides & Briefing Docs**: Markdown outlines and synthesized summaries.
- **Citation Manifests**: Grounded reference citations pointing back to source passages.

However, Google NotebookLM provides no native mechanism to download raw MP4 video streams, export Markdown briefing docs directly, or bundle all generated studio assets into an indexed archive.

**NoCatch** solves this completely by communicating directly with Google's low-level RPC endpoint (`v9rmvd`), extracting the uncompressed media streams from Google's content delivery network, and providing instant single-file or 1-click master ZIP bundle downloads.

---

## 2. Understanding Google NotebookLM Links

There are two primary URL formats for Google NotebookLM:

### Format A: Direct Studio Artifact Link *(Recommended)*
```
https://notebook.google.com/notebook/8b88ac32-9785-489b-a224-9d95864fddca/artifact/48e08424-d530-4d98-990c-a08dce8e015d
```
- **How to get it:** Open your notebook in Google NotebookLM, click on your **Audio Overview** or generated note in the right-hand **Studio** panel. Look at your browser address bar: it will contain `/artifact/<uuid>`.
- **Authentication:** **100% public & unauthenticated.** No Google sign-in required.

### Format B: Shared Notebook Link
```
https://notebook.google.com/notebook/8b88ac32-9785-489b-a224-9d95864fddca?utm_source=nlmm_share
```
- **How to get it:** Click the **Share** button in the top right corner of Google NotebookLM and copy the link.
- **How NoCatch handles it:** NoCatch automatically strips the query parameters (`?utm_source=nlmm_share`), resolves known shared notebooks to their primary Studio artifact, or allows session cookie pass-through.

---

## 3. Tutorial: Using the Web Application

The live web application is hosted at [https://nocatch.lorapok.tech](https://nocatch.lorapok.tech).

### Pasting Links & Instant Harvesting
1. Navigate to [nocatch.lorapok.tech](https://nocatch.lorapok.tech).
2. Paste your Google Notebook link into the input field:
   ```
   https://notebook.google.com/notebook/8b88ac32-9785-489b-a224-9d95864fddca/artifact/48e08424-d530-4d98-990c-a08dce8e015d
   ```
   *(Tip: You can also click the quick-test buttons **"Test Shared Notebook Link"** or **"Direct Artifact Link"** to try a live 32-minute episode immediately).*
3. Click **"Extract & Download"** (or press `Enter`).
4. In under 2 seconds, the neural log will verify:
   - Episode title & length
   - Audio stream bitrate (128kbps AAC)
   - Video track presence (320x240 AVC1 @ 30fps)
   - Number of cited sources

### Interactive Audio & Video Playback
Once extracted, you can preview media immediately:
- **Waveform Audio Player:**
  - Scrub through the audio waveform timeline in real-time.
  - Speed multiplier buttons: **0.75x**, **1x**, **1.25x**, **1.5x**, and **2x**.
  - 10-second rewind button for catching quick details.
  - Volume mute toggle and link copying.
- **Google Video Canvas Player:**
  - Click the **"Google Video Canvas (MP4)"** tab to switch from audio-only to the synchronized 30fps video stream.
  - Supports native full-screen, picture-in-picture, and playback scrubbing.

### Downloading Individual Studio Files
In the **Studio Generated Files (All 5 Assets)** catalog, each format can be downloaded individually with a single click:
1. 🎧 **Audio Overview Podcast (.m4a)**:
   - Click **"Download .M4A Audio"**. The file will stream losslessly with `Content-Disposition: attachment` directly to your downloads folder.
2. 🎬 **Google Video Canvas (.mp4)**:
   - Click **"Download .MP4 Video"**. Downloads the internal synchronized 320x240 H.264 video track.
3. 📄 **Study Guide & Briefing Doc (.md)**:
   - Click **"Download .MD Notes"**. Generates and saves a clean Markdown summary document containing episode notes and citations.
4. 📋 **Sources Manifest & Metadata (.json)**:
   - Click **"Download .JSON Manifest"**. Saves machine-readable JSON containing citation IDs, CDN stream links, and timestamps.

### Downloading the Complete Master ZIP Bundle
To download everything at once:
1. Click **"Download Studio Bundle (ZIP)"** (either at the top right of the player or in the Master ZIP hero card).
2. NoCatch's client-side **JSZip engine** will:
   - Stream the pristine `.m4a` audio podcast.
   - Stream the `.mp4` video canvas (if available).
   - Package the `[Title]_Study_Guide.md` Markdown briefing notes.
   - Package the `[Title]_Sources_Manifest.json` schema.
   - Inject an archive `README.txt` with metadata and Lorapok Labs credits.
   - Compress into `[Title]_Studio_Bundle.zip` with real-time compression progress (`Compressing: 65%...`).
3. Your browser triggers an immediate download. **No serverless function timeouts and no file size limits.**

### Batch Notebook Downloads
1. Switch to the **"Batch & Notebooks"** tab in the main input card.
2. Paste multiple NotebookLM URLs (one per line).
3. Click **"Download All Generated Things in Batch"**. NoCatch will queue each URL sequentially.

---

## 4. Tutorial: Browser Addon for Social Media

NoCatch includes a cross-browser extension located in `extension/`.

### Supported Browsers
- Google Chrome
- Brave Browser
- Microsoft Edge
- Mozilla Firefox
- Opera / Arc

### Installation Guide
1. Open your browser's extension management page:
   - Chrome / Brave: `chrome://extensions/`
   - Edge: `edge://extensions/`
   - Firefox: `about:debugging#/runtime/this-firefox`
2. Enable **Developer Mode** (toggle in the top-right corner).
3. Click **"Load unpacked"** (or **"Load Temporary Add-on"** in Firefox).
4. Select the directory:
   ```
   /mnt/NewVolume/Personal_Projects/loragent/nocatch/extension
   ```
5. The extension is now active.

### Floating Download Buttons on Socials
Whenever a Google NotebookLM link is spotted on any of the following platforms, the NoCatch extension automatically inserts a glowing **⚡ NoCatch Download** button next to the link:
- **Discord Web** (`discord.com/channels/...`)
- **X / Twitter** (`x.com` & `twitter.com`)
- **Reddit** (`reddit.com/r/...`)
- **LinkedIn** (`linkedin.com/feed/...`)
- **Google NotebookLM** itself (`notebook.google.com` & `notebooklm.google.com`)

Clicking the button immediately opens NoCatch and initiates background harvesting!

---

## 5. Tutorial: Discord Application & Bot

The NoCatch Discord bot resides in `discord-bot/` and connects to any Discord server or DM channel.

### Slash Commands Guide
| Command | Arguments | Description |
| :--- | :--- | :--- |
| `/nocatch extract` | `<url>` | Renders a rich cyber Discord Embed with episode name, duration, and download links. |
| `/nocatch audio` | `<url>` | Extracts and uploads the raw `.m4a` audio overview podcast directly into chat. |
| `/nocatch all` | `<url>` | Bundles the audio overview, notes, and sources into a `.zip` archive and uploads it. |

### Running the Discord Bot Locally
```bash
cd /mnt/NewVolume/Personal_Projects/loragent/nocatch/discord-bot
npm install
DISCORD_TOKEN="<your_bot_token>" DISCORD_CLIENT_ID="<your_client_id>" npm start
```

### Resolving Discord Message Links
If you have a Discord message link (e.g. `https://discord.com/channels/@me/1559338219865112720/1561520181086261368`):
1. Switch to the **"Discord Link Resolver"** tab on `nocatch.lorapok.tech`.
2. Paste the Discord message link.
3. NoCatch will resolve the underlying shared notebook media and render download triggers.

---

## 6. Tutorial: Command-Line Interface (CLI)

The `@lorapok/nocatch-core` CLI allows automated scraping and downloading from terminals or bash scripts.

### 1. View Metadata & Streams without Downloading
```bash
node packages/core/bin/nocatch.js "https://notebook.google.com/notebook/8b88ac32-9785-489b-a224-9d95864fddca/artifact/48e08424-d530-4d98-990c-a08dce8e015d" --info
```

### 2. Download the Audio Podcast (.m4a)
```bash
node packages/core/bin/nocatch.js "https://notebook.google.com/notebook/8b88ac32-9785-489b-a224-9d95864fddca/artifact/48e08424-d530-4d98-990c-a08dce8e015d" -o ./podcast.m4a
```

### 3. Programmatic Usage in Node.js
```javascript
import { NoCatchExtractor } from '@lorapok/nocatch-core';

const extractor = new NoCatchExtractor();
const result = await extractor.extract('https://notebook.google.com/notebook/8b88ac32-9785-489b-a224-9d95864fddca/artifact/48e08424-d530-4d98-990c-a08dce8e015d');

console.log('Title:', result.title);
console.log('Audio Stream URL:', result.audio.primaryStreamUrl);
if (result.video) {
  console.log('Video Stream URL:', result.video.streamUrl);
}
```

---

## 7. Developer REST API Reference

The NoCatch API runs at the edge on Cloudflare Pages and express servers.

### POST /api/extract
Resolves a Google NotebookLM URL and extracts all media stream URLs, video tracks, and metadata.

#### Request
```bash
curl -X POST https://nocatch.lorapok.tech/api/extract \
  -H "Content-Type: application/json" \
  -d '{"url": "https://notebook.google.com/notebook/8b88ac32-9785-489b-a224-9d95864fddca/artifact/48e08424-d530-4d98-990c-a08dce8e015d"}'
```

#### Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "artifactId": "48e08424-d530-4d98-990c-a08dce8e015d",
    "notebookId": "8b88ac32-9785-489b-a224-9d95864fddca",
    "title": "Tax Lawyer Cybersecurity Expert and Global Photographer",
    "type": "audio_overview",
    "sourceCount": 47,
    "audio": {
      "episodeName": "Diversity of Joy",
      "durationSeconds": 1970.5,
      "durationFormatted": "32:50",
      "primaryStreamUrl": "https://lh3.googleusercontent.com/notebooklm/...",
      "directDownloadUrl": "https://lh3.googleusercontent.com/notebooklm/...",
      "filename": "Tax_Lawyer_Cybersecurity_Expert.m4a",
      "quality": "Original 128kbps AAC (M4A)"
    },
    "video": {
      "codec": "avc1.4d400d",
      "width": 320,
      "height": 240,
      "quality": "320x240 H.264 (avc1.4d400d)",
      "streamUrl": "https://lh3.googleusercontent.com/notebooklm/...",
      "filename": "Tax_Lawyer_Cybersecurity_Expert_video.mp4"
    },
    "canonicalUrl": "https://notebook.google.com/notebook/8b88ac32-9785-489b-a224-9d95864fddca/artifact/48e08424-d530-4d98-990c-a08dce8e015d",
    "extractedAt": "2026-10-19T08:15:23.000Z",
    "provider": "NoCatch by Lorapok Labs (Edge)"
  }
}
```

---

### GET /api/stream
Proxies media streams with HTTP 206 Partial Content range requests, enabling seeking on mobile and desktop HTML5 `<audio>` and `<video>` tags.

```
GET https://nocatch.lorapok.tech/api/stream?url=<encoded_stream_url>
```

---

### GET /api/download
Direct download proxy that attaches `Content-Disposition: attachment; filename="<filename>"` and streams the binary from Google CDN.

```
GET https://nocatch.lorapok.tech/api/download?url=<encoded_stream_url>&filename=podcast.m4a
```

---

## 8. Troubleshooting & FAQ

#### Q1: "Artifact ID not detected" error?
**Answer:** Google NotebookLM has two links: the generic notebook link and the artifact link. If you paste a generic link for an unindexed private notebook, Google will not reveal which note or audio overview you want to download. Click on the Audio Overview in your Studio panel and copy the URL from your browser address bar: it should contain `/artifact/<id>`.

#### Q2: Can NoCatch download from private notebooks?
**Answer:** Yes! For private notebooks where you are signed into Google:
1. Open your browser Developer Tools (F12) on `notebook.google.com`.
2. Inspect the `Cookie` header from any network request.
3. Pass `{"url": "...", "cookie": "..."}` to `/api/extract` or use the browser extension (which shares your active browser session automatically).

#### Q3: Why does Google NotebookLM have a video track for an audio overview?
**Answer:** When Google NotebookLM renders an Audio Overview in DASH format, it includes a lightweight `320x240` H.264 stream (`avc1.4d400d`) for visual canvas players. NoCatch isolates both the pure 128kbps AAC audio and this Google Video Canvas stream so you can choose which one to watch or listen to.

#### Q4: Is there any quality loss when downloading?
**Answer:** **Zero loss.** NoCatch does not transcode, compress, or re-encode your media. It fetches the exact `.m4a` AAC and `.mp4` AVC1 binaries streamed directly by Google's upload servers.

---

*Documentation maintained by **Lorapok Labs**. For feedback, issues, or custom integrations, open an issue on [GitHub](https://github.com/Lorapok/nocatch) or visit [lorapok.tech](https://lorapok.tech).*
