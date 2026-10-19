# 🤖 Official Discord Bot Publishing & Verification Guide
### *NoCatch by Lorapok Labs*

This comprehensive guide outlines the end-to-end procedure for officially registering, configuring, hosting, verifying, and publishing the **NoCatch Discord Bot** into the **Discord App Directory**.

---

## 📑 Table of Contents
1. [Overview & Architecture](#1-overview--architecture)
2. [Phase 1: Discord Developer Portal Registration](#phase-1-discord-developer-portal-registration)
3. [Phase 2: Bot Configuration & Privileged Intents](#phase-2-bot-configuration--privileged-intents)
4. [Phase 3: OAuth2 Invite Link & Permissions](#phase-3-oauth2-invite-link--permissions)
5. [Phase 4: Global Slash Commands Synchronization](#phase-4-global-slash-commands-synchronization)
6. [Phase 5: App Directory Discovery Listing](#phase-5-app-directory-discovery-listing)
7. [Phase 6: Official Bot Verification Badge (75+ Guilds)](#phase-6-official-bot-verification-badge-75-guilds)
8. [Phase 7: 24/7 Production Deployment Options](#phase-7-247-production-deployment-options)
9. [Troubleshooting & Maintenance](#troubleshooting--maintenance)

---

## 1. Overview & Architecture

The NoCatch Discord bot (`discord-bot/src/bot.js`) is built with **Discord.js v14**. It enables Discord communities to harvest, play, and download Google NotebookLM media directly within guild channels and private messages:
- **Slash Commands**: `/nocatch audio`, `/nocatch video`, `/nocatch all`, `/nocatch info`
- **Link Auto-Detector**: Automatically detects any `notebook.google.com` or `utm_source=nlmm_share` link dropped in chat and replies with interactive download buttons.
- **Direct Streaming & File Attachments**: Attaches downloaded `.m4a` podcasts or `.zip` bundles directly to Discord messages (under Discord's 25MB attachment limit, with automatic fallback to direct Google CDN stream links for larger files).

---

## Phase 1: Discord Developer Portal Registration

1. Navigate to the **[Discord Developer Portal](https://discord.com/developers/applications)**.
2. Click **New Application** in the top-right corner.
3. Enter the Application Name: `NoCatch`.
4. Agree to the Discord Developer Terms of Service and Developer Policy.
5. In the **General Information** tab:
   - **App Icon**: Upload `assets/branding/nocatch-discord-bot-avatar.png` (1024x1024, optimized for Discord's circular safe-zone crop).
   - **Description**:
     > Universal Google NotebookLM Harvester by Lorapok Labs. Download high-fidelity Audio Overview podcasts (M4A), Google Video Canvas (MP4), and Markdown study guides in 1-click directly in Discord.
   - **Tags**: `utilities`, `productivity`, `audio`, `podcast`, `ai`, `media`
   - **Terms of Service URL**: `https://nocatch.lorapok.tech/terms` (or `https://github.com/Lorapok/nocatch/blob/main/docs/TERMS.md`)
   - **Privacy Policy URL**: `https://nocatch.lorapok.tech/privacy` (or `https://github.com/Lorapok/nocatch/blob/main/docs/PRIVACY.md`)
6. Click **Save Changes**.

---

## Phase 2: Bot Configuration & Privileged Intents

1. In the left navigation menu, click **Bot**.
2. Click **Reset Token** to generate your `DISCORD_BOT_TOKEN`.
   > ⚠️ **Zero-Trust Security**: Never commit this token into Git. Store it in `.env` or your encrypted vault.
3. Under **Public Bot**:
   - Toggle **PUBLIC BOT** to **ON** (Allows any server owner to add NoCatch to their server).
4. Under **Privileged Gateway Intents**:
   - **Message Content Intent**: Toggle to **ON** (Required for the bot to auto-detect Google Notebook links pasted in server channels).
   - *Note*: Presence Intent and Server Members Intent are **not** needed.
5. Click **Save Changes**.

---

## Phase 3: OAuth2 Invite Link & Permissions

1. In the left navigation, select **OAuth2** $\to$ **URL Generator**.
2. Under **SCOPES**, check:
   - `bot`
   - `applications.commands`
3. Under **BOT PERMISSIONS**, check:
   - **Text Permissions**:
     - `Send Messages`
     - `Send Messages in Threads`
     - `Embed Links`
     - `Attach Files`
     - `Read Message History`
     - `Use External Emojis`
     - `Use Slash Commands`
4. The generated Invite URL at the bottom will look like:
   ```
   https://discord.com/oauth2/authorize?client_id=<YOUR_CLIENT_ID>&permissions=277072787456&scope=bot%20applications.commands
   ```
5. Bookmark this link. Anyone clicking this link can add NoCatch to their Discord server.

---

## Phase 4: Global Slash Commands Synchronization

Discord slash commands must be registered with Discord's REST API.

1. Ensure your `.env` in `discord-bot/` contains:
   ```env
   DISCORD_BOT_TOKEN=your_bot_token_here
   DISCORD_CLIENT_ID=your_client_id_here
   ```
2. When the bot starts via `npm start` in `discord-bot/`, it automatically registers the global commands using `REST.put(Routes.applicationCommands(CLIENT_ID), { body: commands })`:
   - `/nocatch audio <url>`: Extracts and sends the 128kbps stereo M4A podcast.
   - `/nocatch video <url>`: Extracts and sends the synchronized MP4 canvas video.
   - `/nocatch all <url>`: Bundles all 5 studio artifacts into an indexed ZIP archive.
   - `/nocatch info`: Displays latency, engine version, and Lorapok Labs status.

> ⏱ **Propagation Note**: Discord global commands can take up to 60 minutes to propagate across all global Discord data centers on initial registration. Guild-specific commands register instantly.

---

## Phase 5: App Directory Discovery Listing

Listing NoCatch in Discord's official **App Directory** allows 200M+ Discord users to find your bot via the "Add App" button inside Discord:

1. In the Developer Portal, click **App Directory** under Settings.
2. Complete all required fields:
   - **Short Description** (up to 100 characters):
     `Download podcasts, videos, and study guides from Google NotebookLM in 1-click.`
   - **Detailed Description**: Markdown description explaining how `/nocatch audio` and links work.
   - **Media Carousel**: Upload:
     - `assets/branding/social/discord-banner.png` (1280x720)
     - `assets/branding/nocatch-hero-banner.png` (1600x900)
     - `assets/branding/nocatch-studio-map.png` (1200x600)
   - **Supported Languages**: English.
3. In **Installation Options**:
   - Choose **Guild Install** (Servers) and **User Install** (Allows users to use NoCatch in their personal DMs anywhere on Discord!).
4. Click **Publish to App Directory**.

---

## Phase 6: Official Bot Verification Badge (75+ Guilds)

Once NoCatch is added to **75 unique Discord servers**, a prompt will appear in the Developer Portal to **Verify Your Bot**:

1. **Prerequisites Checklist**:
   - [x] Terms of Service URL active (`https://nocatch.lorapok.tech/terms`)
   - [x] Privacy Policy URL active (`https://nocatch.lorapok.tech/privacy`)
   - [x] App Icon and Description configured
   - [x] 2-Factor Authentication (2FA) enabled on your Discord account
2. **Identity Verification**:
   - Discord partners with **Stripe Identity**. You will need a government-issued photo ID (Passport, Driver's License) to verify your developer identity.
3. **Privileged Intent Whitelisting**:
   - For bots in over 100 guilds, Discord requires approval for the `Message Content Intent`.
   - Submit an intent justification:
     > *"NoCatch inspects incoming chat messages solely to detect public notebook.google.com URLs and provide instant download embeds for users. No message content is stored, logged, or transferred to third parties."*
4. **Approval**:
   - Once verified, NoCatch receives the official **Verified Bot Checkmark** (`✔ BOT`) next to its name everywhere across Discord!

---

## Phase 7: 24/7 Production Deployment Options

To keep the bot online with 99.99% uptime, deploy it using one of the following methods:

### Option A: PM2 (Process Manager) on Linux VPS
```bash
# Install PM2 globally
npm install -g pm2

# Start the NoCatch bot process
cd /mnt/NewVolume/Personal_Projects/loragent/nocatch/discord-bot
DISCORD_BOT_TOKEN="your_token" pm2 start src/bot.js --name "nocatch-discord"

# Configure auto-restart on system reboot
pm2 startup
pm2 save
```

### Option B: Systemd Service (`/etc/systemd/system/nocatch-bot.service`)
```ini
[Unit]
Description=NoCatch Discord Bot - Lorapok Labs
After=network.target

[Service]
Type=simple
User=maizied
WorkingDirectory=/mnt/NewVolume/Personal_Projects/loragent/nocatch/discord-bot
ExecStart=/usr/bin/node src/bot.js
Restart=always
RestartSec=10
Environment=DISCORD_BOT_TOKEN="your_token"
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```
Enable and start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable --now nocatch-bot
```

### Option C: Docker Container
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
CMD ["node", "src/bot.js"]
```
Build and run:
```bash
docker build -t nocatch-discord-bot .
docker run -d --name nocatch-bot --restart always -e DISCORD_BOT_TOKEN="your_token" nocatch-discord-bot
```

---

## Troubleshooting & Maintenance

- **Error 401 Unauthorized**: Ensure your `DISCORD_BOT_TOKEN` is current and has not been regenerated in the Developer Portal.
- **Commands Not Showing in Discord**: Global commands take up to 1 hour to propagate. For instant testing in your development server, supply `GUILD_ID` in `bot.js` to register guild commands immediately.
- **Large Files Exceeding 25MB**: Discord limits attachments to 25MB for free bots. NoCatch automatically detects file sizes $\ge 24\text{MB}$ and attaches a direct, authenticated Google CDN streaming link instead of crashing.
