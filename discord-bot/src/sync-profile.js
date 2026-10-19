import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { registerCommands } from './register-commands.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TOKEN = process.env.DISCORD_BOT_TOKEN;
const TARGET_NAME = process.env.DISCORD_BOT_NAME || 'Lorapok';

async function syncProfile() {
  console.log('⚡ [Lorapok Bot] Synchronizing profile with Lorapok Labs identity...');

  if (!TOKEN) {
    console.error('❌ Error: DISCORD_BOT_TOKEN is required in .env or environment to sync profile.');
    console.log('👉 Obtain your token from https://discord.com/developers/applications/1561581247208099843/bot');
    process.exit(1);
  }

  // 1. Prepare Avatar
  const avatarPath = path.resolve(__dirname, '../../assets/branding/nocatch-discord-bot-avatar.png');
  let avatarData = null;
  if (fs.existsSync(avatarPath)) {
    const buffer = fs.readFileSync(avatarPath);
    avatarData = `data:image/png;base64,${buffer.toString('base64')}`;
    console.log(`🖼️ Loaded official avatar from ${path.basename(avatarPath)}`);
  }

  // 2. Update Bot Profile via Discord API
  const body = { username: TARGET_NAME };
  if (avatarData) {
    body.avatar = avatarData;
  }

  console.log(`🔄 Updating bot username to: "${TARGET_NAME}"...`);
  try {
    const res = await fetch('https://discord.com/api/v10/users/@me', {
      method: 'PATCH',
      headers: {
        Authorization: `Bot ${TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const data = await res.json();
      console.log(`✅ Successfully updated Discord bot user to: ${data.username}#${data.discriminator || '0'}`);
    } else {
      const errorText = await res.text();
      console.warn(`⚠️ Discord user update returned status ${res.status}: ${errorText}`);
      console.log('ℹ️ Note: Discord restricts automated username changes to 2 times per hour.');
    }
  } catch (err) {
    console.error('❌ Failed to update bot user profile:', err.message);
  }

  // 3. Register Slash Commands for full product ecosystem
  console.log('🚀 Synchronizing Lorapok Labs slash commands...');
  try {
    await registerCommands(TOKEN);
    console.log('✨ All Lorapok Labs ecosystem commands synchronized successfully!');
  } catch (err) {
    console.error('❌ Slash command sync failed:', err.message);
  }
}

syncProfile().catch((err) => {
  console.error('Fatal sync error:', err);
  process.exit(1);
});
