import {
  Client,
  GatewayIntentBits,
  Partials,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  SlashCommandBuilder,
  ActivityType,
  REST,
  Routes,
} from 'discord.js';
import dotenv from 'dotenv';
import { NoCatchExtractor, NOTEBOOK_REGEX } from '@lorapok/nocatch-core';
import { registerCommands } from './register-commands.js';

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel, Partials.Message],
});

const extractor = new NoCatchExtractor();

/**
 * Build rich cybernetic Discord Embed for a NotebookLM artifact
 */
export function buildArtifactEmbed(data) {
  const embed = new EmbedBuilder()
    .setColor(0x39ff14) // Lorapok signature neon emerald
    .setTitle(`⚡ ${data.title}`)
    .setURL(data.canonicalUrl)
    .setDescription(
      `**Google NotebookLM Artifact Harvested**\n` +
      `Episode: **${data.audio ? data.audio.episodeName : 'Written Notes'}**\n` +
      `Sources Cited: **${data.sourceCount} verified sources**`
    )
    .addFields(
      { name: '⏱ Duration', value: data.audio ? data.audio.durationFormatted : 'N/A', inline: true },
      { name: '🎙 Quality', value: data.audio ? data.audio.quality : 'Text Document', inline: true },
      { name: '📦 Type', value: data.type === 'audio_overview' ? 'Audio Overview' : 'Document', inline: true }
    )
    .setFooter({
      text: 'NoCatch by Lorapok Labs • nocatch.lorapok.tech',
      iconURL: 'https://raw.githubusercontent.com/Lorapok/nocatch/main/assets/branding/nocatch-logo.svg',
    })
    .setTimestamp();

  const row = new ActionRowBuilder();

  if (data.audio) {
    row.addComponents(
      new ButtonBuilder()
        .setLabel('⚡ Download Audio (M4A)')
        .setStyle(ButtonStyle.Link)
        .setURL(data.audio.directDownloadUrl || data.audio.primaryStreamUrl)
        .setEmoji('🎧')
    );
  }

  row.addComponents(
    new ButtonBuilder()
      .setLabel('Open in NoCatch Web')
      .setStyle(ButtonStyle.Link)
      .setURL(`https://nocatch.lorapok.tech/?url=${encodeURIComponent(data.canonicalUrl)}`)
      .setEmoji('🌐'),
    new ButtonBuilder()
      .setLabel('Google Notebook')
      .setStyle(ButtonStyle.Link)
      .setURL(data.canonicalUrl)
      .setEmoji('📓')
  );

  return { embeds: [embed], components: [row] };
}

/**
 * Build rich Cybernetic Embed for Lorapok Labs Products Ecosystem
 */
export function buildProductsEmbed() {
  const embed = new EmbedBuilder()
    .setColor(0x39ff14) // Lorapok signature neon emerald
    .setTitle('🚀 Lorapok Labs — Product Ecosystem')
    .setURL('https://lorapok.tech')
    .setDescription(
      '*"Open-source products that feel alive."*\n' +
      'Exploring sensory computing, biological UI, and autonomous engineering.'
    )
    .addFields(
      {
        name: '⚡ NoCatch',
        value: '[nocatch.lorapok.tech](https://nocatch.lorapok.tech)\nUniversal Google NotebookLM Harvester (Podcasts, Videos & Study Guides in 1-click).',
        inline: false,
      },
      {
        name: '🦾 Loragent',
        value: '[github.com/Lorapok/loragent](https://github.com/Lorapok/loragent)\nAutonomous Multi-Agent AI Ecosystem with self-healing CI/CD and 50+ specialized skills.',
        inline: false,
      },
      {
        name: '🎧 Lorapok Player',
        value: '[media.lorapok.tech](https://media.lorapok.tech)\nSensory acoustic audio player with real-time waveform scrubbing and neon aesthetics.',
        inline: false,
      },
      {
        name: '📊 ReportKit',
        value: '[reportkit.lorapok.tech](https://reportkit.lorapok.tech/brand/)\nHigh-performance reporting engine and UI visualization suite.',
        inline: false,
      },
      {
        name: '🎬 SubtitleMaster & XSnap',
        value: 'Firefox & Chrome browser extensions for instant media downloading and subtitle translation.',
        inline: false,
      },
      {
        name: '🛸 Mission Control',
        value: '[mission-control.lorapok.tech](https://mission-control.lorapok.tech)\nUnified telemetry, deployment orchestration, and security hub.',
        inline: false,
      }
    )
    .setFooter({
      text: 'Lorapok Labs • lorapok.tech',
      iconURL: 'https://raw.githubusercontent.com/Lorapok/nocatch/main/assets/branding/nocatch-logo.svg',
    })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel('Lorapok Portal')
      .setStyle(ButtonStyle.Link)
      .setURL('https://lorapok.tech')
      .setEmoji('🌐'),
    new ButtonBuilder()
      .setLabel('NoCatch Web')
      .setStyle(ButtonStyle.Link)
      .setURL('https://nocatch.lorapok.tech')
      .setEmoji('⚡'),
    new ButtonBuilder()
      .setLabel('GitHub (@Lorapok)')
      .setStyle(ButtonStyle.Link)
      .setURL('https://github.com/Lorapok')
      .setEmoji('🐙')
  );

  return { embeds: [embed], components: [row] };
}

/**
 * Build rich Loragent Network Embed
 */
export function buildLoragentEmbed() {
  const embed = new EmbedBuilder()
    .setColor(0x00f3ff) // Neon Cyan
    .setTitle('🦾 Loragent — Autonomous AI Multi-Agent Network')
    .setURL('https://github.com/Lorapok/loragent')
    .setDescription(
      '**Autonomous Pair-Programming, Self-Healing CI/CD & Continuous Codebase Learning**\n\n' +
      'Loragent orchestrates autonomous agents across IDEs, CLI, CI pipelines, and cloud runners.'
    )
    .addFields(
      { name: '🧠 Core Reasoning', value: 'Google Gemini 2.5 Flash / Flash-Lite / Pro', inline: true },
      { name: '🛠 Active Skills', value: '50+ Autonomous Capabilities', inline: true },
      { name: '📦 Distribution', value: 'npm, PyPI, Snap Store, AMO, VSCE, Open VSX', inline: true }
    )
    .setFooter({
      text: 'Lorapok Labs • lorapok.tech',
      iconURL: 'https://raw.githubusercontent.com/Lorapok/nocatch/main/assets/branding/nocatch-logo.svg',
    })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel('Loragent Repository')
      .setStyle(ButtonStyle.Link)
      .setURL('https://github.com/Lorapok/loragent')
      .setEmoji('🦾'),
    new ButtonBuilder()
      .setLabel('Mission Control')
      .setStyle(ButtonStyle.Link)
      .setURL('https://mission-control.lorapok.tech')
      .setEmoji('🛸')
  );

  return { embeds: [embed], components: [row] };
}

/**
 * Build rich Lorapok Player Embed
 */
export function buildPlayerEmbed() {
  const embed = new EmbedBuilder()
    .setColor(0xbc13fe) // Neon Violet
    .setTitle('🎧 Lorapok Media Player')
    .setURL('https://media.lorapok.tech')
    .setDescription(
      '**Sensory Soundwave & Acoustic Player**\n\n' +
      'Experience dynamic acoustic visualization with real-time waveform rendering and tactile audio controls.'
    )
    .setFooter({
      text: 'Lorapok Labs • lorapok.tech',
      iconURL: 'https://raw.githubusercontent.com/Lorapok/nocatch/main/assets/branding/nocatch-logo.svg',
    })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel('Launch Media Player')
      .setStyle(ButtonStyle.Link)
      .setURL('https://media.lorapok.tech')
      .setEmoji('▶️')
  );

  return { embeds: [embed], components: [row] };
}

/**
 * Build rich About Embed
 */
export function buildAboutEmbed() {
  const embed = new EmbedBuilder()
    .setColor(0x39ff14)
    .setTitle('⚡ Lorapok Labs — About Us')
    .setURL('https://lorapok.tech')
    .setDescription(
      '**Lorapok Labs** builds open-source developer tools, sensory applications, and autonomous AI agents designed to feel alive.\n\n' +
      'Founded with a focus on biological interface design, open engineering, and zero-trust reliability.'
    )
    .addFields(
      { name: '🌐 Official Portal', value: '[lorapok.tech](https://lorapok.tech)', inline: true },
      { name: '🐙 GitHub Org', value: '[github.com/Lorapok](https://github.com/Lorapok)', inline: true },
      { name: '💬 Discord Community', value: '[discord.gg/lorapok](https://lorapok.tech)', inline: true }
    )
    .setFooter({
      text: 'Lorapok Labs • lorapok.tech',
      iconURL: 'https://raw.githubusercontent.com/Lorapok/nocatch/main/assets/branding/nocatch-logo.svg',
    })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel('Explore All Products')
      .setStyle(ButtonStyle.Link)
      .setURL('https://lorapok.tech')
      .setEmoji('🚀'),
    new ButtonBuilder()
      .setLabel('GitHub Profile')
      .setStyle(ButtonStyle.Link)
      .setURL('https://github.com/Lorapok')
      .setEmoji('🐙')
  );

  return { embeds: [embed], components: [row] };
}

/**
 * Message Event: Auto-detects NotebookLM links in channels or DMs
 */
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const match = message.content.match(NOTEBOOK_REGEX);
  if (!match) return;

  const detectedUrl = match[0];
  console.log(`[Lorapok Bot] Detected Google Notebook link from ${message.author.tag}: ${detectedUrl}`);

  try {
    const data = await extractor.extract(detectedUrl);
    const replyPayload = buildArtifactEmbed(data);
    await message.reply(replyPayload);
  } catch (err) {
    console.error('[Lorapok Bot] Extraction error:', err.message);
    await message.reply({
      content: `❌ **NoCatch Extraction Failed**: ${err.message}`,
    });
  }
});

/**
 * Slash Command Handler
 */
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'nocatch' || commandName === 'nocatch-audio') {
    const url = interaction.options.getString('url');
    await interaction.deferReply();

    try {
      const data = await extractor.extract(url);
      const replyPayload = buildArtifactEmbed(data);
      await interaction.editReply(replyPayload);
    } catch (err) {
      await interaction.editReply({
        content: `❌ **Failed to extract artifact**: ${err.message}`,
      });
    }
  } else if (commandName === 'products') {
    await interaction.reply(buildProductsEmbed());
  } else if (commandName === 'loragent') {
    await interaction.reply(buildLoragentEmbed());
  } else if (commandName === 'player') {
    await interaction.reply(buildPlayerEmbed());
  } else if (commandName === 'about') {
    await interaction.reply(buildAboutEmbed());
  }
});

client.once('ready', async () => {
  console.log(`⚡ [Lorapok Bot] Online as ${client.user.tag}`);
  console.log(`   Connected to ${client.guilds.cache.size} guilds.`);
  console.log(`   Server Invite Link: https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=277025770560&integration_type=0&scope=bot+applications.commands`);
  console.log(`   User App Install:   https://discord.com/oauth2/authorize?client_id=${client.user.id}&integration_type=1&scope=applications.commands`);

  try {
    client.user.setPresence({
      activities: [{ name: 'lorapok.tech | /products • /nocatch', type: ActivityType.Watching }],
      status: 'online',
    });
  } catch (err) {
    console.warn('[Lorapok Bot] Activity status note:', err.message);
  }

  try {
    await registerCommands();
  } catch (err) {
    console.warn('[Lorapok Bot] Slash command registration note:', err.message);
  }
});

export async function startBot(token = process.env.DISCORD_BOT_TOKEN) {
  if (!token) {
    console.warn('[NoCatch Discord Bot] DISCORD_BOT_TOKEN not provided. Bot standing by in offline mode.');
    return;
  }
  await client.login(token);
}

if (process.argv[1]?.endsWith('bot.js')) {
  startBot();
}
