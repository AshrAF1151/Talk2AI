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

    const { text, systemPrompt, temperature, model } = body || {};
    if (!text) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ error: 'Missing input text' }));
    }

    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      res.statusCode = 500;
      return res.end(JSON.stringify({ error: 'OPENAI_API_KEY is not set' }));
    }

    const upstream = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model || 'gpt-4o-mini',
        temperature: typeof temperature === 'number' ? temperature : 0.4,
        stream: true,
        messages: [
          { role: 'system', content: systemPrompt || 'You are a helpful AI assistant.' },
          { role: 'user', content: text },
        ],
      }),
    });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    if (!upstream.ok || !upstream.body) {
      const errText = await upstream.text().catch(() => 'Upstream error');
      res.statusCode = 500;
      return res.end(errText);
    }

    upstream.body.pipe(res);
  } catch (err) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: err.message }));
  }
}