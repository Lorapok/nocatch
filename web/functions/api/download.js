export async function onRequestGet({ request }) {
  const urlObj = new URL(request.url);
  const targetUrl = urlObj.searchParams.get('url');
  const filename = urlObj.searchParams.get('filename') || 'notebooklm_audio.m4a';

  if (!targetUrl) {
    return new Response('Missing target URL', { status: 400 });
  }

  try {
    const streamRes = await fetch(targetUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
      },
    });

    if (!streamRes.ok) {
      return new Response(`Failed to fetch source: ${streamRes.statusText}`, { status: streamRes.status });
    }

    const headers = new Headers(streamRes.headers);
    headers.set('Content-Disposition', `attachment; filename="${filename}"`);
    headers.set('Access-Control-Allow-Origin', '*');

    return new Response(streamRes.body, {
      status: streamRes.status,
      headers,
    });
  } catch (err) {
    return new Response(`Error: ${err.message}`, { status: 500 });
  }
}
