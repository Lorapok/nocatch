#!/usr/bin/env node

import { NoCatchExtractor } from '../src/index.js';
import path from 'node:path';

const args = process.argv.slice(2);

function printHelp() {
  console.log(`
╔════════════════════════════════════════════════════════════════════════════╗
║   ⚡ NoCatch by Lorapok Labs — Google NotebookLM Universal Harvester       ║
║   https://nocatch.lorapok.tech | Loragent Ecosystem                        ║
╚════════════════════════════════════════════════════════════════════════════╝

Usage:
  nocatch <notebook_or_artifact_url> [options]

Commands & Options:
  --info, -i         Extract and print full metadata without downloading
  --output, -o <dir> Directory or destination file path to save audio
  --json             Output raw extraction result in JSON format
  --help, -h         Show this help manual

Examples:
  nocatch https://notebook.google.com/notebook/8b88ac32-9785-489b-a224-9d95864fddca/artifact/48e08424-d530-4d98-990c-a08dce8e015d
  nocatch 48e08424-d530-4d98-990c-a08dce8e015d --info
  nocatch "https://notebook.google.com/..." -o ./downloads
`);
}

async function main() {
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    printHelp();
    process.exit(0);
  }

  const inputUrl = args[0];
  const isInfoOnly = args.includes('--info') || args.includes('-i');
  const isJson = args.includes('--json');
  
  let outputTarget = null;
  const outIdx = args.findIndex(a => a === '--output' || a === '-o');
  if (outIdx !== -1 && args[outIdx + 1]) {
    outputTarget = args[outIdx + 1];
  }

  const extractor = new NoCatchExtractor();

  if (!isJson) {
    console.log(`\x1b[36m⚡ [NoCatch]\x1b[0m Resolving Google NotebookLM Artifact...`);
  }

  try {
    const data = await extractor.extract(inputUrl);

    if (isJson) {
      console.log(JSON.stringify(data, null, 2));
      return;
    }

    console.log(`\x1b[32m✔ Artifact Resolved Successfully!\x1b[0m`);
    console.log(`  \x1b[1mTitle:\x1b[0m         ${data.title}`);
    console.log(`  \x1b[1mType:\x1b[0m          ${data.type}`);
    console.log(`  \x1b[1mSources:\x1b[0m       ${data.sourceCount} sources cited`);
    if (data.audio) {
      console.log(`  \x1b[1mAudio Title:\x1b[0m   ${data.audio.episodeName}`);
      console.log(`  \x1b[1mDuration:\x1b[0m      ${data.audio.durationFormatted} (${Math.round(data.audio.durationSeconds)}s)`);
      console.log(`  \x1b[1mQuality:\x1b[0m       ${data.audio.quality}`);
      console.log(`  \x1b[1mFilename:\x1b[0m      ${data.audio.filename}`);
    }

    if (isInfoOnly) {
      return;
    }

    if (!data.audio) {
      console.log(`\x1b[33mℹ This artifact does not contain an audio overview stream.\x1b[0m`);
      if (data.textContent) {
        console.log(`\x1b[1mContent:\x1b[0m\n${data.textContent}`);
      }
      return;
    }

    console.log(`\n\x1b[36m⚡ [NoCatch]\x1b[0m Downloading audio stream...`);
    const result = await extractor.downloadAudio(inputUrl, outputTarget, (prog) => {
      const bars = Math.round(prog.percent / 5);
      const empty = 20 - bars;
      process.stdout.write(
        `\r  [\x1b[32m${'█'.repeat(bars)}\x1b[0m${'░'.repeat(empty)}] ${prog.percent}% (${(prog.receivedBytes / (1024 * 1024)).toFixed(1)}MB)`
      );
    });

    console.log(`\n\x1b[32m✔ Download Complete!\x1b[0m Saved to: \x1b[1m${result.filePath}\x1b[0m (${(result.sizeBytes / (1024 * 1024)).toFixed(1)}MB)`);
  } catch (err) {
    console.error(`\x1b[31m✖ Extraction Error:\x1b[0m ${err.message}`);
    process.exit(1);
  }
}

main();
