// vite.config.ts
import { defineConfig } from "file:///C:/Users/Hikmah-Adepoju/inceptionu/Miss-Buzzie/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/Hikmah-Adepoju/inceptionu/Miss-Buzzie/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
import { copyFileSync } from "fs";
var __vite_injected_original_dirname = "C:\\Users\\Hikmah-Adepoju\\inceptionu\\Miss-Buzzie";
var vite_config_default = defineConfig(() => ({
  // For GitHub Pages: Update 'base' to match your repository name
  // Example: If your repo is "Miss-Buzzie", use base: "/Miss-Buzzie/"
  // For root domain or local dev, use base: "/"
  base: "/Miss-Buzzie/",
  server: {
    host: "::",
    port: 8080
  },
  plugins: [
    react(),
    {
      name: "copy-pwa-files",
      closeBundle() {
        try {
          copyFileSync("public/sw.js", "dist/sw.js");
          copyFileSync("public/manifest.json", "dist/manifest.json");
          console.log("\u2713 PWA files copied to dist/");
        } catch (err) {
          console.error("Failed to copy PWA files:", err);
        }
      }
    }
  ],
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxIaWttYWgtQWRlcG9qdVxcXFxpbmNlcHRpb251XFxcXE1pc3MtQnV6emllXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxIaWttYWgtQWRlcG9qdVxcXFxpbmNlcHRpb251XFxcXE1pc3MtQnV6emllXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9IaWttYWgtQWRlcG9qdS9pbmNlcHRpb251L01pc3MtQnV6emllL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcclxuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcclxuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcclxuaW1wb3J0IHsgY29weUZpbGVTeW5jIH0gZnJvbSBcImZzXCI7XHJcblxyXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKCkgPT4gKHtcclxuICAvLyBGb3IgR2l0SHViIFBhZ2VzOiBVcGRhdGUgJ2Jhc2UnIHRvIG1hdGNoIHlvdXIgcmVwb3NpdG9yeSBuYW1lXHJcbiAgLy8gRXhhbXBsZTogSWYgeW91ciByZXBvIGlzIFwiTWlzcy1CdXp6aWVcIiwgdXNlIGJhc2U6IFwiL01pc3MtQnV6emllL1wiXHJcbiAgLy8gRm9yIHJvb3QgZG9tYWluIG9yIGxvY2FsIGRldiwgdXNlIGJhc2U6IFwiL1wiXHJcbiAgYmFzZTogXCIvTWlzcy1CdXp6aWUvXCIsXHJcbiAgc2VydmVyOiB7XHJcbiAgICBob3N0OiBcIjo6XCIsXHJcbiAgICBwb3J0OiA4MDgwLFxyXG4gIH0sXHJcbiAgcGx1Z2luczogW1xyXG4gICAgcmVhY3QoKSxcclxuICAgIHtcclxuICAgICAgbmFtZTogJ2NvcHktcHdhLWZpbGVzJyxcclxuICAgICAgY2xvc2VCdW5kbGUoKSB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIGNvcHlGaWxlU3luYygncHVibGljL3N3LmpzJywgJ2Rpc3Qvc3cuanMnKTtcclxuICAgICAgICAgIGNvcHlGaWxlU3luYygncHVibGljL21hbmlmZXN0Lmpzb24nLCAnZGlzdC9tYW5pZmVzdC5qc29uJyk7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygnXHUyNzEzIFBXQSBmaWxlcyBjb3BpZWQgdG8gZGlzdC8nKTtcclxuICAgICAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBjb3B5IFBXQSBmaWxlczonLCBlcnIpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXSxcclxuICByZXNvbHZlOiB7XHJcbiAgICBhbGlhczoge1xyXG4gICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcclxuICAgIH0sXHJcbiAgfSxcclxufSkpO1xyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXNVLFNBQVMsb0JBQW9CO0FBQ25XLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFDakIsU0FBUyxvQkFBb0I7QUFIN0IsSUFBTSxtQ0FBbUM7QUFNekMsSUFBTyxzQkFBUSxhQUFhLE9BQU87QUFBQTtBQUFBO0FBQUE7QUFBQSxFQUlqQyxNQUFNO0FBQUEsRUFDTixRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsRUFDUjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ047QUFBQSxNQUNFLE1BQU07QUFBQSxNQUNOLGNBQWM7QUFDWixZQUFJO0FBQ0YsdUJBQWEsZ0JBQWdCLFlBQVk7QUFDekMsdUJBQWEsd0JBQXdCLG9CQUFvQjtBQUN6RCxrQkFBUSxJQUFJLGtDQUE2QjtBQUFBLFFBQzNDLFNBQVMsS0FBSztBQUNaLGtCQUFRLE1BQU0sNkJBQTZCLEdBQUc7QUFBQSxRQUNoRDtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSyxLQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLElBQ3RDO0FBQUEsRUFDRjtBQUNGLEVBQUU7IiwKICAibmFtZXMiOiBbXQp9Cg==
