import 'vitest'

declare module 'vitest' {
  interface Assertion<R extends void | Promise<void> = void, T = unknown> {
    toHaveStyle(css: string | Record<string, unknown>): R
    toHaveTextContent(text: string | number | RegExp, options?: { normalizeWhitespace: boolean }): R
  }
}
