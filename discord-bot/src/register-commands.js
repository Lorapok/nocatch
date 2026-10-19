import { REST, Routes, SlashCommandBuilder } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

const APPLICATION_ID = process.env.DISCORD_CLIENT_ID || process.env.DISCORD_APPLICATION_ID || '1561581247208099843';
const TOKEN = process.env.DISCORD_BOT_TOKEN;
const GUILD_ID = process.env.DISCORD_GUILD_ID; // Optional: specify for instant dev deployment

export const commands = [
  new SlashCommandBuilder()
    .setName('nocatch')
    .setDescription('⚡ Harvest & extract audio/transcripts from Google NotebookLM')
    .addStringOption((option) =>
      option
        .setName('url')
        .setDescription('Google NotebookLM notebook or artifact share URL')
        .setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName('nocatch-audio')
    .setDescription('🎧 Download audio overview (M4A) directly from a NotebookLM link')
    .addStringOption((option) =>
      option
        .setName('url')
        .setDescription('Google NotebookLM notebook or artifact share URL')
        .setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName('products')
    .setDescription('🚀 Explore the complete Lorapok Labs ecosystem & live products'),
  new SlashCommandBuilder()
    .setName('loragent')
    .setDescription('🦾 Query Loragent — Autonomous AI Multi-Agent Network & Skills'),
  new SlashCommandBuilder()
    .setName('player')
    .setDescription('🎧 Open Lorapok Media Player with soundwave sensory visualization'),
  new SlashCommandBuilder()
    .setName('about')
    .setDescription('🌐 About Lorapok Labs, mission, GitHub repositories, and links'),
].map((cmd) => cmd.toJSON());

export async function registerCommands(token = process.env.DISCORD_BOT_TOKEN) {
  if (!token) {
    console.warn('[NoCatch Discord] DISCORD_BOT_TOKEN not provided, skipping command registration.');
    return;
  }
  const rest = new REST({ version: '10' }).setToken(token);
  try {
    console.log(`⚡ [NoCatch Discord] Registering ${commands.length} application (/) commands...`);

    if (GUILD_ID) {
      console.log(`📌 Registering to development guild: ${GUILD_ID}`);
      await rest.put(
        Routes.applicationGuildCommands(APPLICATION_ID, GUILD_ID),
        { body: commands }
      );
      console.log('✅ Successfully registered guild slash commands (instant update)!');
    } else {
      console.log('🌐 Registering globally across all Discord servers...');
      await rest.put(
        Routes.applicationCommands(APPLICATION_ID),
        { body: commands }
      );
      console.log('✅ Successfully registered global slash commands!');
    }
  } catch (error) {
    console.error('❌ Error registering slash commands:', error);
    process.exit(1);
  }
}

if (process.argv[1]?.endsWith('register-commands.js')) {
  registerCommands();
}
