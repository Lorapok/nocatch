export async function onRequestGet() {
  return new Response(
    JSON.stringify({
      status: 'online',
      product: 'NoCatch by Lorapok Labs',
      service: 'Google NotebookLM Harvester Edge API',
      version: '1.0.0',
      runtime: 'Cloudflare Pages Functions',
      timestamp: new Date().toISOString(),
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}
