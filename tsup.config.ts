import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: false,
  clean: true,
  external: ['react', 'react-dom'],
  sourcemap: true,
  minify: false,
  treeshake: true,
  outDir: 'dist',
  splitting: false,
  outExtension({ format }) {
    return { js: format === 'cjs' ? '.cjs' : '.js' };
  },
  esbuildOptions(options) {
    options.jsx = 'automatic';
  },
});
