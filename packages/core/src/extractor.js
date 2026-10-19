import fs from 'node:fs';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';

/**
 * Regex patterns for NotebookLM & Google Notebook URLs
 */
export const NOTEBOOK_REGEX = /https?:\/\/(?:notebook|notebooklm)\.google\.com\/notebook\/([0-9a-fA-F-]+)(?:\/artifact\/([0-9a-fA-F-]+))?/;
export const UUID_REGEX = /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/;

/**
 * Parse an input string (URL, text, or UUID) into notebookId and artifactId
 */
export function parseNotebookInput(input) {
  if (!input || typeof input !== 'string') {
    throw new Error('Input URL or ID string is required');
  }

  const match = input.match(NOTEBOOK_REGEX);
  if (match) {
    return {
      notebookId: match[1],
      artifactId: match[2] || null,
      rawUrl: match[0],
    };
  }

  // Check if direct UUID provided
  const uuidMatch = input.match(UUID_REGEX);
  if (uuidMatch) {
    return {
      notebookId: null,
      artifactId: uuidMatch[0],
      rawUrl: null,
    };
  }

  throw new Error(`Unable to recognize Google Notebook / NotebookLM link or ID: "${input}"`);
}

/**
 * Format duration in seconds to MM:SS or HH:MM:SS
 */
export function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return '00:00';
  const sec = Math.floor(seconds);
  const hrs = Math.floor(sec / 3600);
  const mins = Math.floor((sec % 3600) / 60);
  const secs = sec % 60;
  if (hrs > 0) {
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Sanitize filename for local filesystem
 */
export function sanitizeFilename(filename, fallback = 'notebooklm_audio.m4a') {
  if (!filename) return fallback;
  return filename
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
    .replace(/\s+/g, '_')
    .slice(0, 150);
}

/**
 * Core Google NotebookLM Extractor Engine
 */
export class NoCatchExtractor {
  constructor(options = {}) {
    this.userAgent = options.userAgent ||
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';
    this.cookie = options.cookie || '';
    this.timeout = options.timeout || 30000;
  }

  /**
   * Extract metadata and audio/artifact streams from a NotebookLM URL or artifact ID
   */
  async extract(urlOrId) {
    const { notebookId, artifactId } = parseNotebookInput(urlOrId);

    if (!artifactId) {
      throw new Error(
        `Artifact ID not detected. When sharing a podcast audio overview or note, provide the artifact link: ` +
        `https://notebook.google.com/notebook/<notebook_id>/artifact/<artifact_id>`
      );
    }

    // Call Google's v9rmvd RPC
    const rpcPayload = JSON.stringify([[['v9rmvd', JSON.stringify([artifactId]), null, 'generic']]]);
    const rpcUrl = `https://notebook.google.com/_/LabsTailwindUi/data/batchexecute?rpcids=v9rmvd&hl=en-US`;

    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      'User-Agent': this.userAgent,
    };
    if (this.cookie) {
      headers['Cookie'] = this.cookie;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers,
        body: new URLSearchParams({ 'f.req': rpcPayload }).toString(),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Google RPC returned HTTP ${response.status}: ${response.statusText}`);
      }

      const text = await response.text();
      return await this._parseRpcResponse(text, artifactId, notebookId);
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * Parse batchExecute response chunk
   */
  async _parseRpcResponse(text, artifactId, notebookId) {
    let parsedData = null;

    const lines = text.split('\n');
    for (const line of lines) {
      if (line.startsWith('[[') && line.includes('v9rmvd')) {
        try {
          const batch = JSON.parse(line);
          const innerStr = batch[0]?.[2];
          if (innerStr) {
            parsedData = JSON.parse(innerStr);
            break;
          }
        } catch {
          // continue checking other lines
        }
      }
    }

    if (!parsedData || !Array.isArray(parsedData) || parsedData.length === 0) {
      throw new Error(
        `Failed to parse artifact data from Google NotebookLM. The artifact may be private or deleted.`
      );
    }

    const top = parsedData[0];
    const title = top[1] || 'NotebookLM Audio Overview';
    const typeId = top[2]; // 1 = Audio Overview
    const sourcesCount = Array.isArray(top[3]) ? top[3].length : 0;
    const sourcesList = Array.isArray(top[3]) ? top[3].map(s => (Array.isArray(s) && s[0] ? s[0][0] : null)).filter(Boolean) : [];

    const audioBlock = top[6];
    let audio = null;

    if (audioBlock && Array.isArray(audioBlock)) {
      const episodeName = audioBlock[1]?.[0] || 'Episode';
      const streamUrlM4a = audioBlock[3] || audioBlock[2]; // e.g. =m140-dv-mp2
      const streamUrlFallback = audioBlock[2]; // e.g. =mm,140
      
      let durationSec = 0;
      if (Array.isArray(audioBlock[6])) {
        durationSec = audioBlock[6][0] + (audioBlock[6][1] || 0) / 1e9;
      }

      const streams = [];
      if (Array.isArray(audioBlock[5])) {
        for (const item of audioBlock[5]) {
          if (Array.isArray(item)) {
            streams.push({
              url: item[0],
              formatId: item[1],
              mimeType: item[2] || (item[0]?.includes('hls') ? 'application/x-mpegURL' : 'audio/mp4'),
            });
          }
        }
      }

      // Resolve redirect and get clean attachment filename
      let resolvedFilename = sanitizeFilename(`${title}.m4a`);
      let directDownloadUrl = streamUrlM4a;

      try {
        const headRes = await fetch(streamUrlM4a, {
          method: 'HEAD',
          headers: { 'User-Agent': this.userAgent },
          redirect: 'manual',
        });
        const location = headRes.headers.get('location');
        if (location) {
          directDownloadUrl = location;
          // check if redirected target has Content-Disposition
          const redirectedRes = await fetch(location, {
            method: 'HEAD',
            headers: { 'User-Agent': this.userAgent },
          });
          const cd = redirectedRes.headers.get('content-disposition');
          if (cd && cd.includes('filename=')) {
            const m = cd.match(/filename="?([^";]+)"?/);
            if (m && m[1]) {
              resolvedFilename = m[1];
            }
          }
        }
      } catch {
        // Fallback to title-based filename
      }

      audio = {
        episodeName,
        durationSeconds: durationSec,
        durationFormatted: formatDuration(durationSec),
        primaryStreamUrl: streamUrlM4a,
        fallbackStreamUrl: streamUrlFallback,
        directDownloadUrl,
        filename: resolvedFilename,
        streams,
        quality: 'Original 128kbps AAC (M4A)',
      };
    }

    // Written notes / text content if artifact is a document
    let textContent = null;
    if (typeof top[5] === 'string') {
      textContent = top[5];
    } else if (Array.isArray(top[5])) {
      textContent = JSON.stringify(top[5]);
    }

    return {
      artifactId,
      notebookId,
      title,
      type: typeId === 1 ? 'audio_overview' : 'document',
      typeId,
      sourceCount: sourcesCount,
      sourceIds: sourcesList,
      audio,
      textContent,
      canonicalUrl: `https://notebook.google.com/notebook/${notebookId || ''}/artifact/${artifactId}`,
      extractedAt: new Date().toISOString(),
      provider: 'NoCatch by Lorapok Labs',
    };
  }

  /**
   * Download audio stream directly to disk
   */
  async downloadAudio(urlOrId, outputFilePath, onProgress = null) {
    const data = await this.extract(urlOrId);
    if (!data.audio) {
      throw new Error(`The artifact "${data.title}" does not contain an audio overview.`);
    }

    const downloadUrl = data.audio.directDownloadUrl || data.audio.primaryStreamUrl;
    const finalPath = outputFilePath || path.resolve(process.cwd(), data.audio.filename);

    const response = await fetch(downloadUrl, {
      headers: { 'User-Agent': this.userAgent },
    });

    if (!response.ok) {
      throw new Error(`Failed to download audio stream: HTTP ${response.status} ${response.statusText}`);
    }

    const totalBytes = parseInt(response.headers.get('content-length') || '0', 10);
    let receivedBytes = 0;

    const fileStream = fs.createWriteStream(finalPath);
    const bodyStream = Readable.fromWeb(response.body);

    bodyStream.on('data', (chunk) => {
      receivedBytes += chunk.length;
      if (onProgress && totalBytes > 0) {
        onProgress({
          receivedBytes,
          totalBytes,
          percent: Math.min(100, Math.round((receivedBytes / totalBytes) * 100)),
        });
      }
    });

    await pipeline(bodyStream, fileStream);

    return {
      filePath: finalPath,
      filename: path.basename(finalPath),
      sizeBytes: receivedBytes,
      title: data.title,
      duration: data.audio.durationFormatted,
    };
  }
}

export default NoCatchExtractor;
