export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    return res.end('Method Not Allowed');
  }

  try {
    let body = req.body;
    if (!body) {
      body = await new Promise((resolve, reject) => {
        let data = '';
        req.on('data', chunk => (data += chunk));
        req.on('end', () => {
          try { resolve(JSON.parse(data || '{}')); } catch (e) { reject(e); }
        });
        req.on('error', reject);
      });
    }

    const { text, voiceId } = body || {};
    if (!text || !voiceId) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ error: 'Missing text or voiceId' }));
    }

    const elevenKey = process.env.ELEVENLABS_API_KEY;
    if (!elevenKey) {
      res.statusCode = 500;
      return res.end(JSON.stringify({ error: 'ELEVENLABS_API_KEY is not set' }));
    }

    const upstream = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': elevenKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: { stability: 0.4, similarity_boost: 0.9 },
      }),
    });

    if (!upstream.ok) {
      const errText = await upstream.text().catch(() => 'Upstream error');
      res.statusCode = 500;
      return res.end(errText);
    }

    const audioBuffer = Buffer.from(await upstream.arrayBuffer());
    res.setHeader('Content-Type', 'audio/mpeg');
    res.end(audioBuffer);
  } catch (err) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: err.message }));
  }
}