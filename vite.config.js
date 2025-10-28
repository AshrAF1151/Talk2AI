import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import tailwindScrollbar from 'tailwind-scrollbar';

export default defineConfig(async ({ command }) => {
  const isDev = command === 'serve' && !process.env.VERCEL;

  // Load .env only for local dev so server handlers see process.env
  if (isDev) {
    const { config } = await import('dotenv');
    config();
  }

  return {
    plugins: [
      react(),
      tailwindcss(),
      tailwindScrollbar,
      isDev && {
        name: 'dev-api-middleware',
        async configureServer(server) {
          // Lazy-import handlers only in dev server to avoid bundling into build
          const chatHandler = (await import('./api/chat.js')).default;
          const ttsHandler = (await import('./api/tts.js')).default;

          server.middlewares.use('/api/chat', (req, res) => {
            if (req.method !== 'POST') {
              res.statusCode = 405;
              res.setHeader('Allow', 'POST');
              return res.end('Method Not Allowed');
            }
            return chatHandler(req, res);
          });

          server.middlewares.use('/api/tts', (req, res) => {
            if (req.method !== 'POST') {
              res.statusCode = 405;
              res.setHeader('Allow', 'POST');
              return res.end('Method Not Allowed');
            }
            return ttsHandler(req, res);
          });
        },
      },
    ].filter(Boolean),
  };
});