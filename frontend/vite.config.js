import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  server: { proxy: { '/api': 'http://localhost:8080' } },
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    include: ['src/**/*.{test,spec}.{js,jsx}'],
  },
});