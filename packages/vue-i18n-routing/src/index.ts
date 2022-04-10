/**
 * Vue I18n Routing Version
 *
 * @remarks
 * Semver format. Same format as the package.json `version` field.
 */
export const VERSION = __VERSION__

export * from './compatibles'
export * from './composables'
export * from './resolve'
export * from './types'
export { getLocale, setLocale, resolveBaseUrl, findBrowserLocale } from './utils'
export type {
  I18nCommonRoutingOptions,
  I18nCommonRoutingOptionsWithComposable,
  FindBrowserLocaleOptions,
  BrowserLocale,
  TargetLocale,
  BrowserLocaleMatcher
} from './utils'
export { createRouter, createLocaleFromRouteGetter, registerGlobalOptions, getGlobalOptions } from './extends'
export type { I18nRoutingGlobalOptions } from './extends'
