import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// During development, API calls to /api are proxied to the Express server so
// the front-end and back-end can run on separate ports without CORS friction.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
});
