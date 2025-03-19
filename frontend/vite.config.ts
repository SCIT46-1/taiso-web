import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      // proxy 설정
      "/api": {
        target: "http://taiso.site/",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
