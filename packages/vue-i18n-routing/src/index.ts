import VueRouter from 'vue-router3'
import { isVue2 } from 'vue-demi'
import { VUE_I18N_ROUTING_DEFAULTS } from './constants'
import { localizeRoutes } from './resolve'

import type { VueI18nRoute, VueI18nRoutingOptions } from './types'
import type { Router, RouteRecordRaw } from 'vue-router'

export { localizeRoutes, VueI18nRoutingOptions, VueI18nRoute }

export function extendRouting<TRouter extends VueRouter | Router>({
  router,
  i18n,
  defaultLocale = VUE_I18N_ROUTING_DEFAULTS.defaultLocale,
  trailingSlash = VUE_I18N_ROUTING_DEFAULTS.trailingSlash,
  routesNameSeparator = VUE_I18N_ROUTING_DEFAULTS.routesNameSeparator,
  defaultLocaleRouteNameSuffix = VUE_I18N_ROUTING_DEFAULTS.defaultLocaleRouteNameSuffix,
  localeCodes = []
}: VueI18nRoutingOptions = {}): TRouter {
  if (router == null) {
    throw new Error('TODO')
  }

  if (isVue2) {
    const _router = router as VueRouter
    const _VueRouter = _router.constructor as any // eslint-disable-line @typescript-eslint/no-explicit-any
    const routes = _router.options.routes || []
    const localizedRoutes = localizeRoutes(routes as VueI18nRoute[], {
      localeCodes,
      defaultLocale,
      trailingSlash,
      routesNameSeparator,
      defaultLocaleRouteNameSuffix
    })
    console.log('vue2 routes', routes, localizedRoutes)
    const newRouter = new _VueRouter({ mode: 'history', base: _router.options.base, routes: localizedRoutes })
    return newRouter as TRouter
  } else {
    const _router = router as Router
    const routes = _router.options.routes || []
    const localizedRoutes = localizeRoutes(routes as VueI18nRoute[], {
      localeCodes,
      defaultLocale,
      trailingSlash,
      routesNameSeparator,
      defaultLocaleRouteNameSuffix
    })
    console.log('vue3 routes', routes, localizedRoutes)
    routes.forEach(r => _router.removeRoute(r.name!))
    localizedRoutes.forEach(route => _router.addRoute(route as RouteRecordRaw))
    return _router as TRouter
  }
}

/**
 * Vue I18n Routing Version
 *
 * @remarks
 * Semver format. Same format as the package.json `version` field.
 */
export const VERSION = __VERSION__
