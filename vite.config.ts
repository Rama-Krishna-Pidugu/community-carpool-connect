import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite"; // 1. Import the official Tailwind v4 plugin compiler

export default defineConfig({
  plugins: [
    TanStackRouterVite(),
    tailwindcss(), // 2. Add the compiler plugin to your build stack
    react(),
    tsconfigPaths(),
  ],
  server: {
    port: 5173,
    strictPort: true,
  },
});