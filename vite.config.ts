import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";
import { NodeModulesPolyfillPlugin } from "@esbuild-plugins/node-modules-polyfill";

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
    include: ['@react-pdf/renderer', 'lenis', 'lenis/react'],
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
    // Generate source maps for production debugging
    sourcemap: true,
    // Ensure CSS gets proper content hash
    cssCodeSplit: true,
    // Force new hash on every build
    rollupOptions: {
      manualChunks: {
        react: ['react', 'react-dom', 'react-router-dom'],
        motion: ['framer-motion'],
        supabase: ['@supabase/supabase-js'],
        ui: ['lucide-react'],
        // Separate waiting list components for better caching
        'waitlist-core': ['@radix-ui/react-dialog', '@radix-ui/react-select'],
        'waitlist-forms': ['@hookform/resolvers', 'react-hook-form'],
        // Split heavy analytics into separate chunk
        analytics: ['@vercel/analytics', '@microsoft/clarity', '@hotjar/browser']
      },
      output: {
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
