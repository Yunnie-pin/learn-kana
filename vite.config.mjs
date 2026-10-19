import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// The app is a static build in ./build (served by nginx in Docker, or GitHub
// Pages), from any address: the root of a domain or a sub-path such as
// /learn-kana (see src/routes.js), hence the relative base.
export default defineConfig({
  base: './',
  // The build settings read from .env and the CI / Docker build args keep
  // their Create React App names (REACT_APP_UMAMI_...)
  envPrefix: ['VITE_', 'REACT_APP_'],
  plugins: [
    // The components are .js files with JSX
    react({ include: /\.(js|jsx)$/ }),
    // The service worker is src/service-worker.js, with the list of files to
    // precache injected into it; it is registered by serviceWorkerRegistration.js
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'service-worker.js',
      injectRegister: false,
      manifest: false,
      injectManifest: {
        // Everything the app needs offline, also the subset Japanese fonts
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,ttf,otf,woff,woff2}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
    }),
  ],
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.jsx?$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: { loader: { '.js': 'jsx' } },
  },
  server: { port: 3000 },
  preview: { port: 3000 },
  build: {
    outDir: 'build',
    // A warning above this size: the menu chunk is about 170 kB gzipped
    chunkSizeWarningLimit: 1500,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['src/setupTests.js'],
    include: ['src/**/*.test.js'],
    // The game tests render the whole app; some take a few seconds
    testTimeout: 15000,
  },
});
