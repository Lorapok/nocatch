const NOTEBOOK_REGEX = /https?:\/\/(?:notebook|notebooklm)\.google\.com\/notebook\/([0-9a-fA-F-]+)(?:\/artifact\/([0-9a-fA-F-]+))?/;
const UUID_REGEX = /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/;

function parseNotebookInput(input) {
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

  const uuidMatch = input.match(UUID_REGEX);
  if (uuidMatch) {
    return {
      notebookId: null,
      artifactId: uuidMatch[0],
      rawUrl: null,
    };
  }

  throw new Error(`Unable to recognize Google Notebook link or ID: "${input}"`);
}

function formatDuration(seconds) {
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

function sanitizeFilename(filename, fallback = 'notebooklm_audio.m4a') {
  if (!filename) return fallback;
  return filename
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
    .replace(/\s+/g, '_')
    .slice(0, 150);
}

export async function onRequestPost({ request }) {
  try {
    const body = await request.json();
    const { url, cookie } = body;

    if (!url) {
      return new Response(JSON.stringify({ success: false, error: 'Missing "url" in request body' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const { notebookId, artifactId } = parseNotebookInput(url);
    if (!artifactId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Artifact ID not detected. Please provide the artifact link: notebook.google.com/notebook/<nb_id>/artifact/<artifact_id>',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const rpcPayload = JSON.stringify([[['v9rmvd', JSON.stringify([artifactId]), null, 'generic']]]);
    const rpcUrl = `https://notebook.google.com/_/LabsTailwindUi/data/batchexecute?rpcids=v9rmvd&hl=en-US`;

    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
    };
    if (cookie) headers['Cookie'] = cookie;

    const rpcRes = await fetch(rpcUrl, {
      method: 'POST',
      headers,
      body: new URLSearchParams({ 'f.req': rpcPayload }).toString(),
    });

    if (!rpcRes.ok) {
      throw new Error(`Google RPC returned HTTP ${rpcRes.status}`);
    }

    const text = await rpcRes.text();
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
        } catch {}
      }
    }

    if (!parsedData || !Array.isArray(parsedData) || parsedData.length === 0) {
      throw new Error('Failed to parse artifact data from Google NotebookLM. The artifact may be private or deleted.');
    }

    const top = parsedData[0];
    const title = top[1] || 'NotebookLM Audio Overview';
    const typeId = top[2];
    const sourcesCount = Array.isArray(top[3]) ? top[3].length : 0;
    const sourcesList = Array.isArray(top[3]) ? top[3].map(s => (Array.isArray(s) && s[0] ? s[0][0] : null)).filter(Boolean) : [];

    const audioBlock = top[6];
    let audio = null;
    let video = null;

    if (audioBlock && Array.isArray(audioBlock)) {
      const episodeName = audioBlock[1]?.[0] || 'Episode';
      const streamUrlM4a = audioBlock[3] || audioBlock[2];
      const streamUrlFallback = audioBlock[2];

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

      let resolvedFilename = sanitizeFilename(`${title}.m4a`);
      let directDownloadUrl = streamUrlM4a;

      try {
        const headRes = await fetch(streamUrlM4a, {
          method: 'HEAD',
          headers: { 'User-Agent': headers['User-Agent'] },
          redirect: 'manual',
        });
        const location = headRes.headers.get('location');
        if (location) {
          directDownloadUrl = location;
          const redirectedRes = await fetch(location, {
            method: 'HEAD',
            headers: { 'User-Agent': headers['User-Agent'] },
          });
          const cd = redirectedRes.headers.get('content-disposition');
          if (cd && cd.includes('filename=')) {
            const m = cd.match(/filename="?([^";]+)"?/);
            if (m && m[1]) resolvedFilename = m[1];
          }
        }
      } catch {}

      // Extract synchronized video track from DASH manifest if available
      const dashStream = streams.find(s => s.url && s.url.includes('dash'));
      if (dashStream) {
        try {
          const dashRes = await fetch(dashStream.url, { headers: { 'User-Agent': headers['User-Agent'] } });
          if (dashRes.ok) {
            const dashXml = await dashRes.text();
            const videoMatch = dashXml.match(/<AdaptationSet[^>]*mimeType="video\/mp4"[^>]*>([\s\S]*?)<\/AdaptationSet>/);
            if (videoMatch) {
              const repMatches = [...videoMatch[1].matchAll(/<Representation[^>]*id="([^"]+)"[^>]*codecs="([^"]+)"[^>]*width="([^"]+)"[^>]*height="([^"]+)"[^>]*>[\s\S]*?<BaseURL[^>]*>([\s\S]*?)<\/BaseURL>/g)];
              if (repMatches.length > 0) {
                const rep = repMatches[repMatches.length - 1];
                const videoUrl = rep[5].trim().replace(/&amp;/g, '&');
                video = {
                  formatId: rep[1],
                  codec: rep[2],
                  width: parseInt(rep[3], 10),
                  height: parseInt(rep[4], 10),
                  quality: `${rep[3]}x${rep[4]} H.264 (${rep[2]})`,
                  streamUrl: videoUrl,
                  filename: sanitizeFilename(`${title}_video.mp4`),
                  mimeType: 'video/mp4',
                  type: 'Google Video Canvas (avc1)'
                };
              }
            }
          }
        } catch (e) {
          console.warn('DASH video track extraction warning:', e);
        }
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

    let textContent = null;
    if (typeof top[5] === 'string') {
      textContent = top[5];
    } else if (Array.isArray(top[5])) {
      textContent = JSON.stringify(top[5]);
    }

    const output = {
      artifactId,
      notebookId,
      title,
      type: typeId === 1 ? 'audio_overview' : 'document',
      typeId,
      sourceCount: sourcesCount,
      sourceIds: sourcesList,
      audio,
      video,
      textContent,
      canonicalUrl: `https://notebook.google.com/notebook/${notebookId || ''}/artifact/${artifactId}`,
      extractedAt: new Date().toISOString(),
      provider: 'NoCatch by Lorapok Labs (Edge)',
    };

    return new Response(JSON.stringify({ success: true, data: output }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
