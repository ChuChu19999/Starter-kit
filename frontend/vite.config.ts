import react from '@vitejs/plugin-react-swc';
import { defineConfig, loadEnv } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const basePath = env.VITE_BASE_PATH || '/';
  const base = basePath.endsWith('/') ? basePath : `${basePath}/`;

  return {
    base,
    server: {
      port: 5173,
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    },
    plugins: [
      react(),
      nodePolyfills({
        // Включаем полифиллы для модулей, используемых @peculiar/webcrypto
        globals: {
          Buffer: true,
          global: true,
          process: true,
        },
        // Полифиллы для Node.js модулей
        protocolImports: true,
      }),
    ],
  };
});
