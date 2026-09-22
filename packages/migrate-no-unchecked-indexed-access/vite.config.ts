import { defineConfig } from 'vite-plus'

export default defineConfig({
  pack: {
    clean: true,
    deps: {
      // tsdown <0.23 compatibility: resolve external dependency subpaths.
      // Remove to preserve subpath imports as written (the new default).
      // https://tsdown.dev/options/dependencies#deps-resolvedepsubpath
      resolveDepSubpath: true,
      neverBundle: ['typescript'],
    },
    entry: ['src/cli.ts'],
    format: ['esm'],
    outDir: 'dist',
    platform: 'node',
    sourcemap: true,
    target: 'node22',
    treeshake: true,
  },
})
