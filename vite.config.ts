import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const scssDir = path.resolve(__dirname, 'src/scss').replace(/\\/g, '/');

export default defineConfig({
  plugins: [vue()],
  root: './src',
  build: {
    outDir: '../dist',
    minify: false,
    emptyOutDir: true,
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @use '${scssDir}/variables' as *;
          @use '${scssDir}/mixins' as *;
        `,
      },
    },
  },
});
