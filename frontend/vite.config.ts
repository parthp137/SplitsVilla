import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Production build guard: fail build if VITE_API_URL is missing or does not start with https://
  // (production mode only; dev, vitest and preview keep working)
  if (command === "build" && mode === "production" && !process.env.VITEST) {
    const env = loadEnv(mode, process.cwd(), "");
    const apiUrl = process.env.VITE_API_URL || env.VITE_API_URL;

    if (!apiUrl || !apiUrl.startsWith("https://")) {
      throw new Error(
        `[BUILD GUARD ERROR] VITE_API_URL is missing or invalid (${apiUrl || "undefined"}). ` +
        `Production builds require a secure HTTPS backend URL (e.g. VITE_API_URL=https://splitsvilla.onrender.com/api).`
      );
    }
  }

  return {
    server: {
      host: "::",
      port: 8080,
      proxy: {
        "/api": {
          target: "http://localhost:5000",
          changeOrigin: true,
        },
      },
      hmr: {
        overlay: false,
      },
    },
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      dedupe: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "@tanstack/react-query",
        "@tanstack/query-core",
      ],
    },
  };
});
