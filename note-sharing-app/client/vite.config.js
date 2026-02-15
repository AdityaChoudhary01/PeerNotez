import { defineConfig, splitVendorChunkPlugin } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react(), splitVendorChunkPlugin()],
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    // 1. Force aggressive minification to reduce bundle size
    minify: 'terser', 
    terserOptions: {
      compress: {
        drop_console: true, // Removes all console.logs from production build
        drop_debugger: true,
      },
    },
    // 2. Manual Chunks: Splits the massive index.js into smaller, parallel-loadable files
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['react-icons'], // Separates the heavy icon library
          'utils-vendor': ['axios']     // Separates networking logic
        }
      }
    }
  },
  // Keep existing loader settings for JSX in .js files
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.js$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
});
