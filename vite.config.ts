import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { nitro } from "nitro/vite";
// NITRO_PRESET=cloudflare_module 由 nitro 於 Cloudflare 環境自動偵測，亦可用環境變數指定。
import path from "node:path";

// 獨立部署設定（Portable config）：不依賴任何 Lovable 專屬套件。
// 目標執行環境為 Cloudflare Workers（nitro cloudflare_module preset）。
export default defineConfig({
  plugins: [
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tailwindcss(),
    tanstackStart({ server: { entry: "server" } }),
    viteReact(),
    nitro(),
  ],
  resolve: {
    alias: { "@": path.resolve(process.cwd(), "src") },
    dedupe: ["react", "react-dom", "@tanstack/react-router", "@tanstack/react-start"],
  },
  server: { port: Number(process.env.PORT ?? 3000), host: true },
});
