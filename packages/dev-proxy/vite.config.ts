import { defineConfig } from 'vite-plus'

export default defineConfig({
  pack: {
    clean: true,
    deps: { resolveDepSubpath: true, neverBundle: ['@hono/node-server', 'c12', 'hono'] },
    entry: ['src/index.ts', 'src/cli.ts'],
    format: ['esm'],
    outDir: 'dist',
    platform: 'node',
    sourcemap: true,
    target: 'node24',
    treeshake: true,
  },
  test: {
    // Vitest v4 compatibility: preserve mock call history.
    // Remove after tests no longer rely on calls from setup or earlier tests.
    // https://vitest.dev/guide/migration/#clearmocks-is-enabled-by-default
    clearMocks: false,
    environment: 'node',
  },
})
