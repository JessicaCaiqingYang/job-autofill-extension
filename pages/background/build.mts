import { resolve } from 'node:path';
import { build } from 'vite';
import { withPageConfig } from '@extension/vite-config';

const rootDir = resolve(__dirname);
const srcDir = resolve(rootDir, 'src');

export default withPageConfig(
  {
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
  },
  {
    enableHmr: false,
  },
);

const buildBackground = async () => {
  console.log('Building background script...');
  await build();
  console.log('Background script built successfully!');
};

if (import.meta.url === `file://${process.argv[1]}`) {
  buildBackground();
}