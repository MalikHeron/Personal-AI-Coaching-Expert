import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import strip from '@rollup/plugin-strip';
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => ({
  base: '/',
  build: {
    // outDir: 'build',
    rollupOptions: {
      plugins: mode === 'production'
        ? [
            strip({
              include: ['**/*.(js|ts|jsx|tsx)'],
              functions: ['console.*', 'debug', 'assert.*'],
              debugger: true,
            }),
          ]
        : [],
    },
  },
  plugins: [
    react({
      babel: {
        plugins: ['babel-plugin-react-compiler'],
      },
    }),
    tailwindcss(),
  ],
  server: {
    host: '0.0.0.0', // Allows external connections
    port: 5173,
    strictPort: true, // Ensures it doesn't try different ports
    watch: {
      usePolling: true, // Fixes file change detection inside Docker
    },
    hmr: {
      clientPort: 5173, // Ensures Hot Module Reloading works
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@tabler/icons-react': '@tabler/icons-react/dist/esm/icons/index.mjs',
    },
  },
}));