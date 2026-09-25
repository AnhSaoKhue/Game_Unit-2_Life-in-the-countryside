export default async function handler(req: any, res: any) {
  try {
    const text = String(req.query.text || '').trim();
    const tl = String(req.query.tl || 'vi').trim();
    if (!text) {
      return res.status(400).send('Text is required');
    }
    const safeText = text.slice(0, 200);
    const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${encodeURIComponent(tl)}&q=${encodeURIComponent(safeText)}`;

    const upstreamRes = await fetch(googleTtsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Referer': 'https://translate.google.com/',
      },
    });

    if (!upstreamRes.ok) {
      return res.status(upstreamRes.status).send('TTS upstream error');
    }

    const arrayBuffer = await upstreamRes.arrayBuffer();
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(Buffer.from(arrayBuffer));
  } catch (err: any) {
    res.status(500).send('Error in /api/tts: ' + (err?.message || String(err)));
  }
}
