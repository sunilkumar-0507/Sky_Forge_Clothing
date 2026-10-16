import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          motion: ['framer-motion'],
          gsap: ['gsap', 'lenis', '@gsap/react'],
          data: ['@tanstack/react-query', 'zustand', 'zod', 'react-hook-form', '@hookform/resolvers', 'embla-carousel-react'],
        },
      },
    },
  },
  server: {
    port: 5173,
    // Point /api at the ASP.NET Core backend once it exists (VITE_USE_MOCK=false).
    proxy: {
      '/api': { target: 'https://localhost:7001', changeOrigin: true, secure: false },
    },
  },
});
