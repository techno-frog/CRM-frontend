import type { Module } from '../types/module.types';

class RouteRegistryClass {
  private modules: Module[] = [];

  registerModule(module: Module) {
    this.modules.push(module);
  }

  getModules(): Module[] {
    return this.modules;
  }

  getWidget(id: string) {
    return this.modules.find(e => e.id == id)?.widget
  }

  getNavigableRoutes() {
    const flattenRoutes = (routes: any[], _ = ''): any[] => {
      return routes.reduce((acc, route) => {
        const fullPath = route.path;

        if (route.navigable) {
          acc.push({ ...route, fullPath });
        }

        if (route.subModules) {
          acc.push(...flattenRoutes(route.subModules, fullPath));
        }

        return acc;
      }, []);
    };

    return this.modules.flatMap(module =>
      flattenRoutes(module.routes)
    ).map(route => ({
      ...route,
      path: route.fullPath || route.path
    }));
  }
}

export const RouteRegistry = new RouteRegistryClass();