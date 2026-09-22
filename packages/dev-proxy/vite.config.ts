import { defineConfig } from 'vite-plus'

export default defineConfig({
  pack: {
    clean: true,
    deps: {
      // tsdown <0.23 compatibility: resolve external dependency subpaths.
      // Remove to preserve subpath imports as written (the new default).
      // https://tsdown.dev/options/dependencies#deps-resolvedepsubpath
      resolveDepSubpath: true,
      neverBundle: ['@hono/node-server', 'c12', 'hono'],
    },
    entry: ['src/index.ts', 'src/cli.ts'],
    format: ['esm'],
    outDir: 'dist',
    platform: 'node',
    sourcemap: true,
    target: 'node22',
    treeshake: true,
  },
  test: {
    // Vitest v4 compatibility: preserve mock call history.
    // Remove after tests no longer rely on calls from setup or earlier tests.
    // https://release-v1-0-0-rc-0-viteplus-dev.voidzero-docs.workers.dev/guide/vitest-v5#remove-unneeded-compatibility-settings
    // https://vitest.dev/guide/migration/#clearmocks-is-enabled-by-default
    clearMocks: false,
    environment: 'node',
  },
})
