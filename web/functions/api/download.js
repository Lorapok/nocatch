export async function onRequest({ request }) {
  const urlObj = new URL(request.url);
  const targetUrl = urlObj.searchParams.get('url');
  const filename = urlObj.searchParams.get('filename') || 'notebooklm_file';

  if (!targetUrl) {
    return new Response('Missing target URL', { status: 400 });
  }

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
        'Access-Control-Allow-Headers': 'Range, Content-Type',
      },
    });
  }

  try {
    const rawRange = request.headers.get('range');
    const fetchHeaders = {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
    };

    if (rawRange) {
      const match = rawRange.trim().match(/^bytes=(\d+)-$/);
      if (match) {
        const start = parseInt(match[1], 10);
        fetchHeaders['Range'] = `bytes=${start}-${start + 50000000}`;
      } else {
        fetchHeaders['Range'] = rawRange.trim();
      }
    }

    let streamRes = await fetch(targetUrl, {
      method: request.method === 'HEAD' ? 'HEAD' : 'GET',
      headers: fetchHeaders,
    });

    if (!streamRes.ok && fetchHeaders['Range']) {
      delete fetchHeaders['Range'];
      streamRes = await fetch(targetUrl, {
        method: request.method === 'HEAD' ? 'HEAD' : 'GET',
        headers: fetchHeaders,
      });
    }

    if (!streamRes.ok) {
      return new Response(`Failed to fetch source: ${streamRes.statusText}`, { status: streamRes.status });
    }

    const headers = new Headers();
    const isVideo = filename.endsWith('.mp4') || targetUrl.includes('mime=video');
    const isAudio = filename.endsWith('.m4a') || targetUrl.includes('mime=audio');
    const defaultMime = isVideo ? 'video/mp4' : isAudio ? 'audio/mp4' : 'application/octet-stream';

    headers.set('Content-Type', streamRes.headers.get('content-type') || defaultMime);
    headers.set('Content-Disposition', `attachment; filename="${filename}"`);
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    headers.set('Accept-Ranges', 'bytes');

    const contentRange = streamRes.headers.get('content-range');
    if (contentRange) headers.set('Content-Range', contentRange);
    const contentLength = streamRes.headers.get('content-length');
    if (contentLength) headers.set('Content-Length', contentLength);

    return new Response(request.method === 'HEAD' ? null : streamRes.body, {
      status: streamRes.status,
      headers,
    });
  } catch (err) {
    return new Response(`Error: ${err.message}`, { status: 500 });
  }
}
