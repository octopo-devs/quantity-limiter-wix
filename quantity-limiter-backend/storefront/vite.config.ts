import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import dotenv from 'dotenv';
import { resolve } from 'path';
import checker from 'vite-plugin-checker';

dotenv.config({ path: resolve(__dirname, '.env') });
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), checker({ typescript: true, eslint: { lintCommand: 'eslint "./src/**/*.{ts,tsx}"' } })],
  define: {
    'process.env': JSON.stringify(process.env),
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './src'),
      '@nest': path.resolve(__dirname, './src/shared/types'),
    },
  },
  build: {
    outDir: path.resolve(__dirname, '../../order-limiter/src/site/embedded-scripts/quantity-limiter/assets'),
    emptyOutDir: true,
    target: 'es2015',
    rollupOptions: {
      input: path.resolve(__dirname, 'src/main.tsx'),
      output: {
        format: 'iife',
        name: 'EstimatedShipping',
        assetFileNames: (assetInfo) =>
          assetInfo?.name?.endsWith('.css') ? 'order-limiter-styles.css' : '[name]-[hash][extname]',
        entryFileNames: 'order-limiter.min.js',
        chunkFileNames: 'order-limiter.min.js',
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'styled-components': path.resolve(__dirname, './node_modules/styled-components/dist/styled-components.browser.esm.js'),
          dayjs: 'dayjs',
        },
        extend: true,
        inlineDynamicImports: true,
        plugins: [
          {
            name: 'add-process-var',
            renderChunk(code) {
              return `var process;\n${code}`;
            },
          },
          {
            name: 'remove-html',
            generateBundle(options, bundle) {
              // Iterate over bundle entries and delete HTML files
              Object.keys(bundle).forEach((key) => {
                if (key.endsWith('.html')) delete bundle[key];
              });
            },
          },
        ],
      },
    },
  },
  server: {
    allowedHosts: ['localhost3000.datdh.io.vn'],
  },
});
