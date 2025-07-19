import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [tailwindcss, react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "^/auth/v1": {
        target: "https://jnptpnspdhpitvsygnwt.supabase.co",
        changeOrigin: true,
        secure: false,
      },
      "^/rest/v1": {
        target: "https://jnptpnspdhpitvsygnwt.supabase.co",
        changeOrigin: true,
      },
    },
  },
});
