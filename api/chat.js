import { Readable } from 'node:stream';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    return res.end('Method Not Allowed');
  }

  try {
    let body = req.body;

    // ✅ If body is empty, parse it manually
    if (!body || Object.keys(body).length === 0) {
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

    // ✅ Make sure fetch exists in Node (Vite polyfills it, but just to be safe)
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

    if (!upstream.ok || !upstream.body) {
      const errText = await upstream.text().catch(() => 'Upstream error');
      console.error('OpenAI upstream failed:', upstream.status, errText);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ error: 'OpenAI upstream failed', status: upstream.status, details: errText }));
    }

    // Set SSE headers only when streaming will proceed
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
      if (upstream.body && typeof upstream.body.getReader === 'function') {
        const reader = upstream.body.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) res.write(value);
        }
        res.end();
      } else if (upstream.body && Readable && typeof Readable.fromWeb === 'function') {
        Readable.fromWeb(upstream.body).pipe(res);
      } else {
        console.warn('Upstream body not readable as stream; falling back to text relay');
        const text = await upstream.text().catch(() => '');
        res.write(text);
        res.end();
      }
    } catch (streamErr) {
      console.error('Stream relay error:', streamErr);
      res.end();
    }
  } catch (err) {
    console.error('Chat API error:', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: err?.message || 'Internal Server Error' }));
  }
}