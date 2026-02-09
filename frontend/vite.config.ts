import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
// Modified to ensure Tailwind config reloads correctly
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // This allows you to use '@' as a shorthand for your src folder
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000, // Optional: specify a port
    open: true, // Optional: opens browser on start
  },
});