export function resolveRoutePath(router, options = {}) {
  const {
    preferredPaths = [],
    preferredNames = [],
    exactTitles = [],
    titleKeywords = [],
    requireActiveMenu = false,
    excludePath
  } = options

  const routes = router.getRoutes()
  const routeFilter = (route) => {
    if (!route?.path || route.path === excludePath) {
      return false
    }
    if (requireActiveMenu && !route.meta?.activeMenu) {
      return false
    }
    return true
  }

  for (const path of preferredPaths) {
    const matchedRoute = routes.find(route => route.path === path && routeFilter(route))
    if (matchedRoute?.path) {
      return matchedRoute.path
    }
  }

  for (const name of preferredNames) {
    const matchedRoute = routes.find(route => route.name === name && routeFilter(route))
    if (matchedRoute?.path) {
      return matchedRoute.path
    }
  }

  for (const title of exactTitles) {
    const matchedRoute = routes.find(route => route.meta?.title === title && routeFilter(route))
    if (matchedRoute?.path) {
      return matchedRoute.path
    }
  }

  for (const keyword of titleKeywords) {
    const matchedRoute = routes.find(route => route.meta?.title?.includes(keyword) && routeFilter(route))
    if (matchedRoute?.path) {
      return matchedRoute.path
    }
  }

  return undefined
}
