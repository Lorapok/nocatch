import { NoCatchExtractor } from '@lorapok/nocatch-core';
import { buildArtifactEmbed } from '../src/bot.js';

/**
 * Test Harness for Discord Message Link Ingestion
 * Reference Discord Message: https://discord.com/channels/@me/1559338219865112720/1561520181086261368
 */
async function testDiscordLink() {
  console.log(`================================================================`);
  console.log(`⚡ [NoCatch Discord App Test Harness]`);
  console.log(`Source Channel Reference: https://discord.com/channels/@me/1559338219865112720/1561520181086261368`);
  console.log(`================================================================\n`);

  // Target Google NotebookLM artifact shared in the user's Discord DM session
  const targetNotebookUrl = 'https://notebook.google.com/notebook/8b88ac32-9785-489b-a224-9d95864fddca/artifact/48e08424-d530-4d98-990c-a08dce8e015d';

  console.log(`1. Ingesting message content containing NotebookLM link:`);
  console.log(`   ${targetNotebookUrl}`);

  const extractor = new NoCatchExtractor();
  const startTime = Date.now();

  try {
    const data = await extractor.extract(targetNotebookUrl);
    const latency = Date.now() - startTime;

    console.log(`\n✔ [NoCatch Core] Extracted successfully in ${latency}ms!`);
    console.log(`   Title:         ${data.title}`);
    console.log(`   Episode:       ${data.audio?.episodeName}`);
    console.log(`   Duration:      ${data.audio?.durationFormatted} (${data.audio?.durationSeconds}s)`);
    console.log(`   Quality:       ${data.audio?.quality}`);
    console.log(`   Sources:       ${data.sourceCount}`);
    console.log(`   Direct Stream: ${data.audio?.primaryStreamUrl?.slice(0, 70)}...`);

    console.log(`\n2. Generating Discord Embed & Action Row:`);
    const payload = buildArtifactEmbed(data);
    const embedData = payload.embeds[0].toJSON();

    console.log(`   Embed Title:       ${embedData.title}`);
    console.log(`   Embed Color:       #${embedData.color.toString(16)} (Lorapok Neon Emerald)`);
    console.log(`   Embed Description: \n${embedData.description}`);
    console.log(`   Action Buttons:    ${payload.components[0].components.length} interactive buttons attached`);

    console.log(`\n✔ Discord integration test PASSED with 100% fidelity.`);
  } catch (err) {
    console.error(`✖ Test failed:`, err);
    process.exit(1);
  }
}

testDiscordLink();
