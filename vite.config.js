import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import tailwindScrollbar from 'tailwind-scrollbar';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    tailwindScrollbar
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: "#0d0d0d",
          card: "#1a1a1a",
        },
      },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
