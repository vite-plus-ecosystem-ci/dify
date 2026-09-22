import { fileURLToPath } from 'node:url'
import { configDefaults, defineConfig, lazyPlugins } from 'vite-plus'
import { playwright } from 'vite-plus/test/browser-playwright'
import {
  createCodeInspectorPlugin,
  createForceInspectorClientInjectionPlugin,
} from './plugins/vite/code-inspector.ts'
import { customI18nHmrPlugin } from './plugins/vite/custom-i18n-hmr.ts'
import { getRootClientInjectTarget } from './plugins/vite/inject-target.ts'
import { nextStaticImageTestPlugin } from './plugins/vite/next-static-image-test.ts'

const projectRoot = fileURLToPath(new URL('.', import.meta.url))
const isCI = !!process.env.CI
const rootClientInjectTarget = getRootClientInjectTarget(projectRoot)
const browserTestPattern = 'app/**/*.browser.spec.{ts,tsx}'

export default defineConfig(({ mode }) => {
  const isTest = mode === 'test'
  const isStorybook =
    process.env.STORYBOOK === 'true' ||
    process.argv.some((arg) => arg.toLowerCase().includes('storybook'))

  return {
    plugins: lazyPlugins(async () => {
      const { default: react } = await import('@vitejs/plugin-react')

      if (isTest) return [nextStaticImageTestPlugin({ projectRoot }), react()]

      if (isStorybook) return [react()]

      const [{ default: tailwindcss }, { default: vinext }, { default: Inspect }] =
        await Promise.all([
          import('@tailwindcss/vite'),
          import('vinext'),
          import('vite-plugin-inspect'),
        ])

      return [
        Inspect(),
        createCodeInspectorPlugin({
          injectTarget: rootClientInjectTarget,
        }),
        createForceInspectorClientInjectionPlugin({
          injectTarget: rootClientInjectTarget,
          projectRoot,
        }),
        tailwindcss(),
        react(),
        vinext({ react: false }),
        customI18nHmrPlugin({ injectTarget: rootClientInjectTarget }),
        // reactGrabOpenFilePlugin({
        //   injectTarget: rootClientInjectTarget,
        //   projectRoot,
        // }),
      ]
    }),
    resolve: {
      tsconfigPaths: true,
      alias: [
        // Use the base64 build in Vite-based pipelines (vinext/vitest) to avoid wasm loader incompatibilities.
        { find: /^loro-crdt$/, replacement: 'loro-crdt/base64' },
      ],
    },

    // vinext related config
    ...(!isTest && !isStorybook
      ? {
          optimizeDeps: {
            exclude: ['@tanstack/react-query'],
          },
          server: {
            port: 3000,
          },
          ssr: {
            // SyntaxError: Named export not found. The requested module is a CommonJS module, which may not support all module.exports as named exports
            noExternal: ['emoji-mart'],
          },
        }
      : {}),

    // Vitest config
    test: {
      // Vitest v4 compatibility: preserve mock call history.
      // Remove after tests no longer rely on calls from setup or earlier tests.
      // https://release-v1-0-0-rc-0-viteplus-dev.voidzero-docs.workers.dev/guide/vitest-v5#remove-unneeded-compatibility-settings
      // https://vitest.dev/guide/migration/#clearmocks-is-enabled-by-default
      clearMocks: false,
      // Vitest v4 compatibility: keep separate Vite servers for inline projects.
      // Remove when plugins and config hooks can run once for shared projects.
      // https://release-v1-0-0-rc-0-viteplus-dev.voidzero-docs.workers.dev/guide/vitest-v5#remove-unneeded-compatibility-settings
      // https://vitest.dev/guide/migration/#inline-projects-share-the-vite-server-by-default
      sharedViteServer: false,
      coverage: {
        provider: 'v8',
        reporter: isCI ? ['json', 'json-summary'] : ['text', 'json', 'json-summary'],
        exclude: ['**/__mocks__/**'],
      },
      projects: [
        {
          extends: true,
          test: {
            name: 'unit',
            pool: 'threads',
            environment: 'happy-dom',
            globals: true,
            setupFiles: ['./vitest.setup.ts'],
            exclude: [...configDefaults.exclude, browserTestPattern],
          },
        },
        {
          extends: true,
          define: {
            'process.env': '{}',
          },
          plugins: lazyPlugins(async () => {
            const { default: tailwindcss } = await import('@tailwindcss/vite')
            return [tailwindcss()]
          }),
          optimizeDeps: {
            include: ['vite-plus/test/browser'],
          },
          test: {
            name: 'browser',
            globals: true,
            setupFiles: ['./vitest.browser.setup.ts'],
            include: [browserTestPattern],
            browser: {
              locators: {
                // Vitest v4 compatibility: keep partial, case-insensitive locator matching.
                // Remove after updating locators for full, case-sensitive matches.
                // https://release-v1-0-0-rc-0-viteplus-dev.voidzero-docs.workers.dev/guide/vitest-v5#remove-unneeded-compatibility-settings
                // https://vitest.dev/guide/migration/#locators-are-strict-by-default
                exact: false
              },
              expect: { toMatchScreenshot: { screenshotDirectory: './.vitest-browser/screenshots' } },
              enabled: true,
              provider: playwright(),
              instances: [{ browser: 'chromium' }],
              headless: true,
              screenshotDirectory: './.vitest-browser/screenshots',
              screenshotFailures: true,
              trace: {
                mode: 'retain-on-failure',
                tracesDir: './.vitest-browser/traces',
              },
            },
          },
        },
      ],
    },
  }
})
