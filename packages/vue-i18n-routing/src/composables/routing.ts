/* eslint-disable @typescript-eslint/no-explicit-any */
import { isRef, isVue2 } from 'vue-demi'
import { isString, isSymbol, assign } from '@intlify/shared'
import { useRoute, useRouter } from '@intlify/vue-router-bridge'
import { useI18n } from '@intlify/vue-i18n-bridge'
import { getLocale } from '../utils'
import { getLocaleRouteName, getRouteName } from './utils'

import type {
  RouteLocationNormalizedLoaded,
  RouteLocationRaw,
  Location,
  RouteLocation,
  VueRouter,
  Router,
  Route,
  RawLocation
} from '@intlify/vue-router-bridge'
import { Locale, I18n, Composer, I18nMode, I18nInjectionKey } from '@intlify/vue-i18n-bridge'
import type { VueI18nRoutingOptions, Strategies } from '../types'

export type I18nRoutingOptions = Pick<
  VueI18nRoutingOptions,
  'defaultLocale' | 'strategy' | 'defaultLocaleRouteNameSuffix' | 'trailingSlash' | 'locales' | 'routesNameSeparator'
> & { route?: ReturnType<typeof useRoute>; router?: ReturnType<typeof useRouter>; i18n?: ReturnType<typeof useI18n> }

// TODO: should be implemented useful type API
export interface I18nRouting {
  getRouteBaseName(givenRoute?: Route | RouteLocationNormalizedLoaded): string | null
  localePath(route: RawLocation | RouteLocationRaw, locale?: Locale): string
  localeRoute(route: RawLocation | RouteLocationRaw, locale?: Locale): Route | ReturnType<Router['resolve']>
  localeLocation(route: RawLocation | RouteLocationRaw, locale?: Locale): Location | RouteLocation
  switchLocalePath(locale: Locale): void
}

// TODO: should be implemented useful type API
export function useI18nRouting(options?: I18nRoutingOptions): I18nRouting

export function useI18nRouting(options: I18nRoutingOptions = {}): I18nRouting {
  const $i18n = options.i18n ?? useI18n()
  const $router = (options.router ?? useRouter<Router | VueRouter>()) as Router | VueRouter
  const $route = (options.route ?? useRoute<RouteLocationNormalizedLoaded | Route>()) as
    | RouteLocationNormalizedLoaded
    | Route

  // if option values is undefined, initialize with default value at here
  const defaultLocaleRouteNameSuffix = options.defaultLocaleRouteNameSuffix ?? $router.__defaultLocaleRouteNameSuffix!
  const defaultLocale = options.defaultLocale ?? $router.__defaultLocale!
  const routesNameSeparator = options.routesNameSeparator ?? $router.__routesNameSeparator!
  const strategy = options.strategy ?? $router.__strategy!

  /**
   * define routing utilities with Composition API
   */

  function getRouteBaseName(givenRoute?: Route | RouteLocationNormalizedLoaded) {
    // prettier-ignore
    const route = givenRoute != null
      ? givenRoute
      : isRef<Route>($route)
        ? $route.value
        : $route
    if (!route.name) {
      return null
    }
    const name = getRouteName(route.name)
    return name.split(routesNameSeparator)[0]
  }

  function resolveRoute(route: any, locale?: Locale): any {
    // TODO:
    const _locale = locale || getLocale($i18n as unknown as Composer)

    // if route parameter is a string, check if it's a path or name of route.
    let _route = route
    if (isString(route)) {
      if (route[0] === '/') {
        // if route parameter is a path, create route object with path.
        _route = { path: route }
      } else {
        // else use it as route name.
        _route = { name: route }
      }
    }

    let localizedRoute = assign({}, _route)

    if (localizedRoute.path && !localizedRoute.name) {
      const _resolvedRoute = $router.resolve(localizedRoute) as any
      // prettier-ignore
      const resolvedRoute = !isVue2
        ? _resolvedRoute // for vue-router v4
        : _resolvedRoute.route // for vue-router v3
      const resolvedRouteName = getRouteBaseName(resolvedRoute)
      if (isString(resolvedRouteName)) {
        localizedRoute = {
          name: getLocaleRouteName(resolvedRouteName, _locale, {
            defaultLocale,
            strategy,
            routesNameSeparator,
            defaultLocaleRouteNameSuffix
          }),
          params: resolvedRoute.params,
          query: resolvedRoute.query,
          hash: resolvedRoute.hash
        }
      } else {
        // TODO
      }
    } else {
      localizedRoute.name = getLocaleRouteName(localizedRoute.name, _locale, {
        defaultLocale,
        strategy,
        routesNameSeparator,
        defaultLocaleRouteNameSuffix
      })

      const { params } = localizedRoute
      if (params && params['0'] === undefined && params.pathMatch) {
        params['0'] = params.pathMatch
      }
    }

    const resolvedRoute = $router.resolve(localizedRoute) as any
    // prettier-ignore
    if (isVue2
      ? resolvedRoute.route.name // for vue-router v3
      : resolvedRoute.name // for vue-router v4
    ) {
      return resolvedRoute
    }

    // if didn't resolve to an existing route then just return resolved route based on original input.
    return $router.resolve(route)
  }

  function localePath(route: any, locale: Locale) {
    const localizedRoute = resolveRoute(route, locale)
    // prettier-ignore
    return localizedRoute == null
      ? ''
      : isVue2
        ? localizedRoute.route.redirectedFrom || localizedRoute.route.fullPath
        : localizedRoute.redirectedFrom || localizedRoute.fullPath
  }

  function localeRoute(route: any, locale: Locale) {
    const resolved = resolveRoute(route, locale)
    // prettier-ignore
    return resolved == null
      ? undefined
        : isVue2
          ? resolved.route
          : resolved
  }

  function localeLocation(route: any, locale: Locale) {
    const resolved = resolveRoute(route, locale)
    // prettier-ignore
    return resolved == null
      ? undefined
        : isVue2
          ? resolved.location
          : resolved
  }

  function switchLocalePath(locale: Locale) {
    const name = getRouteBaseName()
    if (!name) {
      return ''
    }

    // prettier-ignore
    const { params, ...routeCopy } = isVue2 && isRef<Route>($route)
      ? $route.value // for vue-router v3
      : ($route as RouteLocationNormalizedLoaded) // for vue-router v4
    const langSwitchParams = {}

    const baseRoute = assign({}, routeCopy, {
      name,
      params: {
        ...params,
        ...langSwitchParams,
        0: params.pathMatch
      }
    })
    const path = localePath(baseRoute, locale)

    console.log('switchLocalePath', $i18n.locale.value, locale, path)
    // TODO: for domainDifference

    return path
  }

  return {
    getRouteBaseName,
    localePath,
    localeRoute,
    localeLocation,
    switchLocalePath
  }
}

/* eslint-enable @typescript-eslint/no-explicit-any */
