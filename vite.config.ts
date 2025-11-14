import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    open: true, // Automatically open browser on dev start
  },
  build: {
    sourcemap: true, // Optional: helps debug in production builds
  },
  resolve: {
    alias: {
      '@': '/src', // Nice alias for imports
    },
  },
});
