import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

function crossOriginIsolationMiddleware(_, response, next) {
  response.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  response.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  next();
}

const crossOriginIsolation  = () => ({
  name: 'cross-origin-isolation',
  configureServer: server => { server.middlewares.use(crossOriginIsolationMiddleware); },
  configurePreviewServer: server => { server.middlewares.use(crossOriginIsolationMiddleware); },
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    crossOriginIsolation()
  ],
  build: {
    outDir: "build",
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`,
      },
    },
  },
  server: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
    watch: {
      ignored: ['!**/node_modules/@webcontainer/**']
    }
  },
  optimizeDeps: {
    exclude: ['@webcontainer']
  }
});
