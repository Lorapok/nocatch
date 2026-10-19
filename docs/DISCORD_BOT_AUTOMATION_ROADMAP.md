# 🚀 Discord Developer Portal Automation & Hand-off Roadmap
### *NoCatch by Lorapok Labs*

---

## 📌 Executive Summary & Current Status

This document records the exact state of the **NoCatch** ecosystem, the website runtime resolution, and the step-by-step checklist to complete the Discord Bot setup via Browser MCP on `https://discord.com/developers/applications/1561581247208099843/bot`.

| Component | Status | URL / Target | Notes |
|---|---|---|---|
| **Website Frontend** | 🟢 100% Operational | [nocatch.lorapok.tech](https://nocatch.lorapok.tech/) | React 19 + Vite 8 + Tailwind CSS |
| **Edge API Functions** | 🟢 100% Operational | `/api/extract`, `/api/health`, `/api/stream` | Cloudflare Pages `_worker.js` |
| **Discord Bot Code** | 🟢 Ready | `discord-bot/src/bot.js` | Discord.js v14 Gateway Client |
| **Discord Bot Portal** | 🟡 Pending Toggles | [Discord Dev Portal](https://discord.com/developers/applications/1561581247208099843/bot) | Requires Privileged Intents & Permissions |

---

## 🛠️ 1. What Was Fixed on the Website

### Root Cause of the Website Error:
1. **Missing `_worker.js` Compilation**: When `vite build` ran, it generated static frontend assets in `dist/`, but wiped the compiled Pages Functions.
2. **HTTP 405 on API Endpoints**: Because `dist/_worker.js` was missing during earlier deployments, Cloudflare Pages treated the `/api/*` requests as static file lookups, resulting in `HTTP 405 Method Not Allowed` on POST requests to `/api/extract`.
3. **Multipart Form-Data Artifact in `--outfile`**: Running `wrangler pages functions build --outfile dist/_worker.js` produced a multipart form-data bundle rather than a standalone JavaScript module, causing esbuild syntax errors.

### Applied Solutions:
1. **Automated Pipeline in `web/package.json`**:
   ```json
   "scripts": {
     "dev": "vite",
     "build": "vite build && wrangler pages functions build --outdir dist && mv dist/index.js dist/_worker.js",
     "preview": "vite preview"
   }
   ```
2. **Production Deployment Verified**:
   - `GET https://nocatch.lorapok.tech/api/health` -> `200 OK` (Edge Runtime online).
   - `POST https://nocatch.lorapok.tech/api/extract` -> `200 OK` (Extracts Google NotebookLM audio, video, transcripts, and metadata in real-time).

---

## 🔍 2. Browser MCP Analysis & Root Cause

When automating `https://discord.com/developers/applications/1561581247208099843/bot` using Browser MCP:

### The Problem:
- `browser_snapshot` and `browser_hover` worked instantly (< 3s).
- `browser_click` timed out after 30,000ms (`WebSocket response timeout after 30000ms`).

### Root Cause in Extension Script (`content.js`):
1. In `background.js`, `browser_click` invokes:
   ```javascript
   const s = await Gr("getElementCoordinates", { selector: i, options: { clickable: true } }, tabId);
   ```
2. When `{ clickable: true }` is passed, `content.js` verifies that the DOM element is the topmost layer using `document.elementsFromPoint(x, y)`:
   ```javascript
   function vg(a) {
     const r = yg(a);
     return r ? [r, ...pa(r)].includes(a) : false;
   }
   ```
3. Discord's Developer Portal styles toggle switches using a hidden `<input type="checkbox">` layered beneath custom pseudo-elements and slider `<div>` containers. `elementsFromPoint` returns the slider track rather than the `<input>`, so `vg(a)` returns `false` perpetually.
4. `_l` enters a `requestAnimationFrame` loop until the 30-second timeout fires.

### Browser MCP Solution for Next Run:
- Call `browser_hover` to scroll the target switch into view and position the cursor directly over it.
- Use `browser_press_key` (`Space` or `Enter`) to toggle the focused switch without encountering the `clickable: true` DOM check, OR apply the patch to `vg` in `~/.config/google-chrome/Default/Extensions/bjfgambnhccakkhmkepdoekmckoijdlc/1.3.4_0/content-scripts/content.js`.

---

## 📋 3. Step-by-Step Procedure to Continue & Complete

When resuming on `https://discord.com/developers/applications/1561581247208099843/bot`:

### Step 1: Enable Privileged Gateway Intents (`/bot`)
1. On the **Bot** page, scroll down to **Privileged Gateway Intents**.
2. Locate **Message Content Intent**.
3. Toggle **Message Content Intent** to **ON** (Required for `GatewayIntentBits.MessageContent` in `bot.js`).
4. Keep **Presence Intent** and **Server Members Intent** **OFF**.
5. Click **Save Changes** (floating bottom bar).

### Step 2: Configure Bot Permissions Integer (`/bot`)
Under **Bot Permissions** on the same page, select the following permissions:
- **General Permissions:**
  - `View Channels`
- **Text Permissions:**
  - `Send Messages`
  - `Send Messages in Threads`
  - `Embed Links`
  - `Attach Files`
  - `Read Message History`
  - `Use External Emojis`
  - `Add Reactions`
  - `Use Slash Commands`
- **Voice Permissions:**
  - None required.

> **Calculated Permissions Integer:**
> ```text
> 277025770560
> ```

### Step 3: Default Install Settings (`/installation`)
Navigate to `https://discord.com/developers/applications/1561581247208099843/installation`:
1. **Install Scopes**:
   - **User Install**: `applications.commands`
   - **Guild Install**: `applications.commands`, `bot`
2. **Default Guild Permissions**:
   - Paste permissions integer: `277025770560`
3. Click **Save Changes**.

### Step 4: Discord Activity Settings (`/embedded/settings`)
Navigate to `https://discord.com/developers/applications/1561581247208099843/embedded/settings`:
1. Toggle **Enable Activity** to **ON**.
2. Supported Platforms: Check **Desktop**, **Mobile**, and **Web**.
3. URL Mapping:
   - Prefix: `/`
   - Target: `nocatch.lorapok.tech`
4. Click **Save Changes**.

### Step 5: Test Bot Deployment
Run the automated link test:
```bash
npm --prefix discord-bot run test-link
```
Run the bot with the generated bot token:
```bash
DISCORD_BOT_TOKEN="<YOUR_TOKEN>" npm --prefix discord-bot start
```
