import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";
import { NodeModulesPolyfillPlugin } from "@esbuild-plugins/node-modules-polyfill";
import { compression } from "vite-plugin-compression2";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  },
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: [
      '@react-pdf/renderer', 
      'lenis', 
      'lenis/react',
      // Pre-bundle critical dependencies for faster startup
      'framer-motion',
      'simplex-noise',
      '@radix-ui/react-dialog',
      '@radix-ui/react-select'
    ],
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          process: true,
          buffer: true,
        }),
        NodeModulesPolyfillPlugin(),
      ],
    },
  },
  plugins: [
    react(),
    // Temporarily disabled to test visual artifacts
    // mode === 'development' &&
    // componentTagger(),
    
    // Dual compression strategy: Brotli for modern browsers, GZIP for compatibility
    mode === 'production' && compression({
      algorithm: 'brotliCompress',
      exclude: [/\.(br|gz)$/, /\.(png|jpe?g|gif|svg|ico|woff|woff2)$/],
      threshold: 1400, // Only compress files larger than 1.4KB
      deleteOriginalAssets: false,
    }),
    mode === 'production' && compression({
      algorithm: 'gzip',
      exclude: [/\.(br|gz)$/, /\.(png|jpe?g|gif|svg|ico|woff|woff2)$/],
      threshold: 1400, // Only compress files larger than 1.4KB
      deleteOriginalAssets: false,
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Node.js polyfills for React-PDF
      util: 'util',
      stream: 'stream-browserify',
      buffer: 'buffer',
      process: 'process/browser',
    },
  },
  build: {
    // Disable source maps in production for better performance
    sourcemap: false,
    // Aggressive CSS splitting for better caching
    cssCodeSplit: true,
    // Force new hash on every build + optimize chunks
    rollupOptions: {
      // Custom chunk splitting function
      output: {
        manualChunks(id) {
          // Core React libraries
          if (id.includes('node_modules/react')) {
            return 'react';
          }
          // Animation libraries (heavy)
          if (id.includes('framer-motion')) {
            return 'motion';
          }
          if (id.includes('simplex-noise')) {
            return 'canvas';
          }
          // UI libraries
          if (id.includes('@radix-ui')) {
            return 'ui-radix';
          }
          if (id.includes('lucide-react')) {
            return 'ui-core';
          }
          // Heavy utilities
          if (id.includes('lodash') || id.includes('recharts') || id.includes('date-fns')) {
            return 'heavy-utils';
          }
          // Analytics (defer)
          if (id.includes('@vercel/analytics') || id.includes('@microsoft/clarity') || id.includes('@hotjar/browser')) {
            return 'analytics';
          }
          // Backend
          if (id.includes('@supabase/supabase-js')) {
            return 'supabase';
          }
          // Forms
          if (id.includes('react-hook-form') || id.includes('@hookform/resolvers')) {
            return 'forms';
          }
        },
        // Use content hash for all assets
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const extType = info[info.length - 1];
          if (/css/i.test(extType)) {
            return `assets/[name]-[hash].css`;
          }
          return `assets/[name]-[hash].[ext]`;
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
  },
}));
