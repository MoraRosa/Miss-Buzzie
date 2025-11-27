import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { copyFileSync } from "fs";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  // Optimize dependency pre-bundling
  optimizeDeps: {
    include: ['@radix-ui/react-toast'],
  },
  // For GitHub Pages: Update 'base' to match your repository name
  // Example: If your repo is "Miss-Buzzie", use base: "/Miss-Buzzie/"
  // For root domain or local dev, use base: "/"
  base: "/Miss-Buzzie/",
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    {
      name: 'copy-pwa-files',
      closeBundle() {
        try {
          copyFileSync('public/sw.js', 'dist/sw.js');
          copyFileSync('public/manifest.json', 'dist/manifest.json');
          console.log('✓ PWA files copied to dist/');
        } catch (err) {
          console.error('Failed to copy PWA files:', err);
        }
      },
    },
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // UI framework (Radix UI primitives)
          'vendor-radix': [
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-label',
            '@radix-ui/react-popover',
            '@radix-ui/react-progress',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-select',
            '@radix-ui/react-separator',
            '@radix-ui/react-slot',
            '@radix-ui/react-switch',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
            '@radix-ui/react-tooltip',
          ],
          // Charts and visualization
          'vendor-charts': ['recharts'],
          // Icons
          'vendor-icons': ['lucide-react'],
          // Utilities
          'vendor-utils': ['clsx', 'tailwind-merge', 'class-variance-authority', 'zod', 'date-fns'],
          // Image export
          'vendor-html2canvas': ['html2canvas'],
          // PDF export
          'vendor-jspdf': ['jspdf'],
        },
      },
    },
  },
}));
