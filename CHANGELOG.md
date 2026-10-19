# Changelog

All notable changes to **NoCatch** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.0.0] - 2026-10-19

### Added
- **Direct RPC Protocol Engine**: Sub-second extraction from Google's `v9rmvd` batchExecute protocol without headless browser overhead.
- **Client-Side In-Browser JSZip Engine**: 1-click packaging of all 5 studio artifacts into an organized `.zip` bundle with live progress indicators.
- **Google Video Canvas Support**: Direct streaming and downloading of 320x240 H.264 AVC1 @ 30fps video tracks (`.mp4`).
- **Interactive Cyber Audio Player**: Real-time canvas waveform visualizer, 10-second instant rewind, speed selector (0.75x to 2x), and volume controls.
- **Cross-Browser Social Extension**: Manifest V3 extension injecting download bars on `notebook.google.com` and floating ⚡ NoCatch buttons on Discord Web, X/Twitter, Reddit, and LinkedIn.
- **Discord Bot Application**: Discord.js v14 bot supporting `/nocatch audio`, `/nocatch video`, `/nocatch all`, and interactive message embeds.
- **Studio Architecture Map & Visual Suite**: High-resolution diagrams, social cards, app icons, and hero banners adhering to Lorapok Labs Biological UI.
- **Loragent Ecosystem Integration**: `loragent-nocatch` agent integration for autonomous podcast processing.
- **Complete Developer Documentation**: `docs/TUTORIAL.md`, `docs/DISCORD_BOT_PUBLISHING.md`, `docs/PRIVACY.md`, and `docs/TERMS.md`.

### Changed
- Refactored server streaming proxy to support HTTP Range requests for seamless audio seeking.
- Upgraded web frontend to React 19, Tailwind CSS v4, and Lucide React.
- Solidified sticky navigation header to `bg-[#030712]/95` with `backdrop-blur-xl` and `scroll-mt-24` across all sections.

### Fixed
- Fixed audio seeking and scrubbing crashes caused by unhandled Google CDN open-ended byte ranges.
- Fixed header transparency bleed-through where background hero graphics overlapped navigation text.
- Fixed anchor link scrolling offsets on desktop and mobile.

---

## [1.0.0] - 2026-10-19

### Added
- Initial core harvester CLI (`@lorapok/nocatch-core`).
- Basic M4A audio extraction from Google NotebookLM shared artifacts.
- Express API server and initial web interface.
- MIT License and project repository setup.
