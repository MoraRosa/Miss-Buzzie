import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { copyFileSync } from "fs";

// https://vitejs.dev/config/
export default defineConfig(() => ({
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
}));
