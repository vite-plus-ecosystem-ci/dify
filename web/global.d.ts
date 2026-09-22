import './types/i18n'
import './types/jsx'
import './types/assets'
import 'vitest'

declare module 'vitest' {
  interface Assertion<R extends void | Promise<void> = void, T = unknown> {
    toHaveStyle(css: string | Record<string, unknown>): R
    toHaveTextContent(text: string | number | RegExp, options?: { normalizeWhitespace: boolean }): R
  }
}

declare global {
  // Google Analytics gtag types
  type GtagEventParams = {
    [key: string]: unknown
  }

  type Gtag = {
    (command: 'config', targetId: string, config?: GtagEventParams): void
    (command: 'event', eventName: string, eventParams?: GtagEventParams): void
    (command: 'js', date: Date): void
    (command: 'set', config: GtagEventParams): void
  }

  // eslint-disable-next-line ts/consistent-type-definitions -- interface required for declaration merging
  interface Window {
    gtag?: Gtag
    dataLayer?: unknown[]
  }
}
