import {
  Client,
  GatewayIntentBits,
  Partials,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  SlashCommandBuilder,
  REST,
  Routes,
} from 'discord.js';
import dotenv from 'dotenv';
import { NoCatchExtractor, NOTEBOOK_REGEX } from '@lorapok/nocatch-core';

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
 * Message Event: Auto-detects NotebookLM links in channels or DMs
 */
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const match = message.content.match(NOTEBOOK_REGEX);
  if (!match) return;

  const detectedUrl = match[0];
  console.log(`[NoCatch Discord] Detected Google Notebook link from ${message.author.tag}: ${detectedUrl}`);

  try {
    const data = await extractor.extract(detectedUrl);
    const replyPayload = buildArtifactEmbed(data);
    await message.reply(replyPayload);
  } catch (err) {
    console.error('[NoCatch Discord] Extraction error:', err.message);
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
  }
});

client.once('ready', () => {
  console.log(`⚡ [NoCatch Discord Bot] Online as ${client.user.tag}`);
  console.log(`   Connected to ${client.guilds.cache.size} guilds.`);
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
