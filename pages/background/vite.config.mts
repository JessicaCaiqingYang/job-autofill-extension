import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { withPageConfig } from '@extension/vite-config';

const rootDir = resolve(__dirname);
const srcDir = resolve(rootDir, 'src');

export default withPageConfig(
  defineConfig({
    resolve: {
      alias: {
        '@': srcDir,
      },
    },
    build: {
      lib: {
        entry: resolve(srcDir, 'index.ts'),
        name: 'background',
        formats: ['iife'],
        fileName: 'index',
      },
      rollupOptions: {
        output: {
          entryFileNames: 'background.js',
        },
      },
    },
  }),
  {
    enableHmr: false,
  },
);