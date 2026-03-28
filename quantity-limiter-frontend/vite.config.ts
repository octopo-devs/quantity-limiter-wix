import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';

export default defineConfig({
  plugins: [
    react(),
    checker({
      typescript: true,
      eslint: {
        lintCommand: 'eslint --config .eslintrc.cjs --quiet "src/**/*.{js,jsx,ts,tsx}"',
        dev: { logLevel: ['error'] },
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  envPrefix: ['REACT_APP_', 'APP_', 'CANNY_'],
  define: {
    'process.env': 'import.meta.env',
  },
  build: {
    outDir: 'build',
  },
  server: {
    port: 3000,
    allowedHosts: ['localhost3000.datdh.io.vn'],
  },
});
