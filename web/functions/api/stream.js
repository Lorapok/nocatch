export async function onRequestGet({ request }) {
  const urlObj = new URL(request.url);
  const targetUrl = urlObj.searchParams.get('url');

  if (!targetUrl) {
    return new Response('Missing target URL parameter', { status: 400 });
  }

  try {
    const rawRange = request.headers.get('range');
    const fetchHeaders = {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
    };

    // Google UploadServer / CDN crashes with 500 when sent an open-ended Range (e.g. "bytes=0-")
    // If range is open-ended ("bytes=START-"), append a large byte offset (e.g. 50MB chunk)
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

    // If Google rejected the Range request with an error status (>= 400),
    // retry once cleanly without the Range header to guarantee delivery.
    if (!streamRes.ok && fetchHeaders['Range']) {
      delete fetchHeaders['Range'];
      streamRes = await fetch(targetUrl, {
        method: request.method === 'HEAD' ? 'HEAD' : 'GET',
        headers: fetchHeaders,
      });
    }

    const responseHeaders = new Headers();
    responseHeaders.set('Content-Type', 'audio/mp4');
    responseHeaders.set('Content-Disposition', 'inline');
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    responseHeaders.set('Access-Control-Allow-Headers', 'Range, Content-Type');
    responseHeaders.set('Accept-Ranges', 'bytes');
    responseHeaders.set('Cache-Control', 'public, max-age=86400');

    const contentRange = streamRes.headers.get('content-range');
    if (contentRange) {
      responseHeaders.set('Content-Range', contentRange);
    }
    const contentLength = streamRes.headers.get('content-length');
    if (contentLength) {
      responseHeaders.set('Content-Length', contentLength);
    }

    return new Response(request.method === 'HEAD' ? null : streamRes.body, {
      status: streamRes.status,
      headers: responseHeaders,
    });
  } catch (err) {
    return new Response(`Streaming Error: ${err.message}`, { status: 500 });
  }
}

export async function onRequestHead(context) {
  return onRequestGet(context);
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Range, Content-Type',
    },
  });
}
