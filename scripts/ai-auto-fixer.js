#!/usr/bin/env node

/**
 * 🤖 Lorapok AI Auto-Fixer
 * Autonomous bug triage, code repair, and Pull Request generator powered by Google Gemini.
 * Triggers on:
 *  - GitHub Issues (opened, labeled "bug", or with "/fix" comment)
 *  - GitHub Actions CI workflow failures
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPOSITORY = process.env.GITHUB_REPOSITORY || 'Lorapok/nocatch';

if (!GEMINI_API_KEY) {
  console.error('❌ Error: GEMINI_API_KEY environment variable is required.');
  process.exit(1);
}

/**
 * Calls Gemini 2.5 Flash API with JSON response format
 */
async function callGemini(systemPrompt, userPrompt) {
  const model = process.env.GEMINI_MODEL || 'gemini-flash-latest';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
  
  const payload = {
    contents: [
      {
        role: 'user',
        parts: [{ text: `${systemPrompt}\n\nTask & Context:\n${userPrompt}` }],
      },
    ],
    generationConfig: {
      temperature: 0.1,
      responseMimeType: 'application/json',
    },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('No response text returned from Gemini API.');
  }

  return JSON.parse(text);
}

/**
 * Collects overview of codebase files to supply context
 */
function getCodebaseContext() {
  const candidateFiles = [
    'package.json',
    'packages/core/package.json',
    'packages/core/src/extractor.js',
    'packages/core/bin/nocatch.js',
    'web/package.json',
    'web/src/App.jsx',
    'web/functions/api/extract.js',
    'web/functions/api/health.js',
    'web/functions/api/stream.js',
    'web/functions/api/download.js',
    'discord-bot/src/bot.js',
    'server/src/server.js',
    '.github/dependabot.yml',
    '.github/workflows/ci.yml',
  ];

  let context = '### Codebase Snippets:\n';
  for (const relPath of candidateFiles) {
    if (fs.existsSync(relPath)) {
      const content = fs.readFileSync(relPath, 'utf8');
      context += `\n--- File: ${relPath} ---\n${content.slice(0, 4000)}\n`;
    }
  }
  return context;
}

/**
 * Handles Issue Auto-Fix
 */
async function handleIssue() {
  const issueNumber = process.env.ISSUE_NUMBER;
  const issueTitle = process.env.ISSUE_TITLE;
  const issueBody = process.env.ISSUE_BODY || 'No body provided';
  const issueAuthor = process.env.ISSUE_AUTHOR || 'user';

  console.log(`🤖 AI Auto-Fixer: Processing Issue #${issueNumber}: "${issueTitle}" by @${issueAuthor}`);

  const systemPrompt = `You are the Lorapok Labs Autonomous AI Auto-Fixer.
Your mission is to analyze bug reports or user requests for the NoCatch codebase, diagnose the exact root cause, and produce complete, accurate code modifications to resolve the issue.

Rules:
1. Produce minimal, surgical changes that directly fix the issue without breaking existing functionality.
2. Return ONLY a JSON object adhering to this schema:
{
  "diagnosis": "Concise markdown explanation of root cause and resolution",
  "files_to_modify": [
    {
      "path": "relative/path/to/file",
      "content": "Entire, complete modified file content"
    }
  ],
  "pr_title": "fix(scope): clear description",
  "pr_body": "Detailed pull request description with 'Fixes #<number>'"
}`;

  const userPrompt = `Issue Number: #${issueNumber}
Title: ${issueTitle}
Reported by: ${issueAuthor}
Body:
${issueBody}

${getCodebaseContext()}`;

  console.log('🧠 Querying Gemini 2.5 Flash for code repair...');
  const solution = await callGemini(systemPrompt, userPrompt);

  console.log('💡 Diagnosis:', solution.diagnosis);

  // Apply changes
  for (const file of solution.files_to_modify || []) {
    console.log(`📝 Modifying file: ${file.path}`);
    fs.mkdirSync(path.dirname(file.path), { recursive: true });
    fs.writeFileSync(file.path, file.content, 'utf8');
  }

  // Run tests
  console.log('🧪 Verifying fix with test suite...');
  try {
    execSync('npm run test:core', { stdio: 'inherit' });
    execSync('npm run build:web', { stdio: 'inherit' });
    console.log('✅ All tests passed!');
  } catch (err) {
    console.error('❌ Verification failed after applying fix:', err.message);
    const commentBody = `🤖 **Lorapok AI Auto-Fixer Report**\n\nI investigated this issue and attempted a fix, but local verification tests failed:\n\n**Diagnosis:**\n${solution.diagnosis}\n\n**Error during verification:**\n\`\`\`\n${err.message}\n\`\`\`\n\nManual review required.`;
    execSync(`gh issue comment ${issueNumber} --body "${commentBody.replace(/"/g, '\\"')}"`, { stdio: 'inherit' });
    return;
  }

  // Commit and create PR
  const branchName = `ai-fix/issue-${issueNumber}`;
  execSync(`git config user.name "github-actions[bot]"`);
  execSync(`git config user.email "github-actions[bot]@users.noreply.github.com"`);
  execSync(`git checkout -b ${branchName}`);
  execSync(`git add -A`);
  execSync(`git commit -m "${solution.pr_title.replace(/"/g, '\\"')}"`);
  execSync(`git push -u origin ${branchName} --force`);

  const prBody = `${solution.pr_body}\n\n---\n*Automated fix generated and verified by **Lorapok AI Auto-Fixer** (Gemini 2.5 Flash).*`;
  const prOutput = execSync(`gh pr create --title "${solution.pr_title.replace(/"/g, '\\"')}" --body "${prBody.replace(/"/g, '\\"')}" --head ${branchName} --base main`, { encoding: 'utf8' });
  const prUrl = prOutput.trim();

  console.log(`🚀 Pull Request created: ${prUrl}`);

  // Comment on issue
  const commentBody = `🤖 **Lorapok AI Auto-Fixer has generated a solution!**\n\n**Diagnosis:**\n${solution.diagnosis}\n\n**Pull Request:**\n👉 ${prUrl} (Resolves #${issueNumber})\n\nAll test suites passed cleanly.`;
  execSync(`gh issue comment ${issueNumber} --body "${commentBody.replace(/"/g, '\\"')}"`, { stdio: 'inherit' });
}

/**
 * Handles CI Failure Auto-Fix
 */
async function handleCIFailure() {
  const runId = process.env.FAILED_RUN_ID;
  console.log(`🤖 AI Auto-Fixer: Processing CI Failure for Run #${runId}`);

  let failedLog = '';
  try {
    failedLog = execSync(`gh run view ${runId} --log-failed`, { encoding: 'utf8' }).slice(-6000);
  } catch (e) {
    failedLog = `Unable to fetch log: ${e.message}`;
  }

  const systemPrompt = `You are the Lorapok Labs Autonomous AI Auto-Fixer.
A GitHub Actions CI workflow failed. Your job is to analyze the build/test log, diagnose the failure, and produce the exact file fixes to repair the CI pipeline.

Return ONLY a JSON object:
{
  "diagnosis": "Explanation of CI failure and fix",
  "files_to_modify": [
    {
      "path": "relative/path/to/file",
      "content": "Entire, complete modified file content"
    }
  ],
  "pr_title": "fix(ci): repair pipeline for run #<id>",
  "pr_body": "Detailed pull request description explaining the CI fix"
}`;

  const userPrompt = `Failed Workflow Run ID: ${runId}
Failed Log Tail:
\`\`\`
${failedLog}
\`\`\`

${getCodebaseContext()}`;

  console.log('🧠 Querying Gemini 2.5 Flash to fix CI failure...');
  const solution = await callGemini(systemPrompt, userPrompt);

  console.log('💡 Diagnosis:', solution.diagnosis);

  for (const file of solution.files_to_modify || []) {
    console.log(`📝 Modifying file: ${file.path}`);
    fs.mkdirSync(path.dirname(file.path), { recursive: true });
    fs.writeFileSync(file.path, file.content, 'utf8');
  }

  console.log('🧪 Verifying CI fix with test suite...');
  try {
    execSync('npm run test:core', { stdio: 'inherit' });
    execSync('npm run build:web', { stdio: 'inherit' });
    console.log('✅ All tests passed!');
  } catch (err) {
    console.error('❌ Verification failed after applying CI fix:', err.message);
    return;
  }

  const branchName = `ai-fix/ci-${runId}`;
  execSync(`git config user.name "github-actions[bot]"`);
  execSync(`git config user.email "github-actions[bot]@users.noreply.github.com"`);
  execSync(`git checkout -b ${branchName}`);
  execSync(`git add -A`);
  execSync(`git commit -m "${solution.pr_title.replace(/"/g, '\\"')}"`);
  execSync(`git push -u origin ${branchName} --force`);

  const prBody = `${solution.pr_body}\n\n---\n*Automated CI fix generated and verified by **Lorapok AI Auto-Fixer** (Gemini 2.5 Flash).*`;
  const prOutput = execSync(`gh pr create --title "${solution.pr_title.replace(/"/g, '\\"')}" --body "${prBody.replace(/"/g, '\\"')}" --head ${branchName} --base main`, { encoding: 'utf8' });
  console.log(`🚀 Pull Request created: ${prOutput.trim()}`);
}

async function main() {
  const mode = process.argv[2] || process.env.AUTO_FIX_MODE || 'issue';
  if (mode === 'issue') {
    await handleIssue();
  } else if (mode === 'ci-failure') {
    await handleCIFailure();
  } else {
    console.error(`Unknown mode: ${mode}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('💥 Fatal error in AI Auto-Fixer:', err);
  process.exit(1);
});
