import React from 'react';
import { Routes, Route } from 'react-router-dom';
import type { Module, RouteConfig } from '../types/module.types';
import { ProtectedRoute } from './ProtectedRoute';
import { DefaultLayout } from '../layouts/DefaultLayout';

interface ModuleRouterProps {
  modules: Module[];
}

const wrapWithProtection = (route: RouteConfig, children: React.ReactNode) => (
  <ProtectedRoute
    allowedRoles={route.allowedRoles}
    unauthorizedComponent={route.unauthorizedComponent}
    unauthorizedRedirect={route.unauthorizedRedirect}
  >
    {children}
  </ProtectedRoute>
);

export const ModuleRouter: React.FC<ModuleRouterProps> = ({ modules }) => {
  const allRoutes = modules.flatMap((module) => module.routes);

  return (
    <Routes>
      {allRoutes.map((route) => {
        const Layout = route.layout || DefaultLayout;
        const hasSubModules = route.subModules && route.subModules.length > 0;

        if (hasSubModules) {
          // Родительский лейаут с Outlet
          return (
            <Route
              key={route.path}
              path={route.path}
              element={wrapWithProtection(route, <Layout />)}
            >
              {/* index-страница */}
              <Route
                index
                element={wrapWithProtection(
                  route,
                  <route.component {...(route.props || {})} />
                )}
              />
              {/* дочерние роуты */}
              {route.subModules!.map((subRoute) => (
                <Route
                  key={subRoute.path}
                  path={subRoute.path.replace(`${route.path}/`, '')} // делаем относительный путь
                  element={wrapWithProtection(
                    subRoute,
                    <subRoute.component {...(subRoute.props || {})} />
                  )}
                />
              ))}
            </Route>
          );
        } else {
          // Нет сабмодулей — всё равно оборачиваем в родительский маршрут с Outlet
          return (
            <Route
              key={route.path}
              path={route.path}
              element={wrapWithProtection(route, <Layout />)}
            >
              <Route
                index
                element={wrapWithProtection(
                  route,
                  <route.component {...(route.props || {})} />
                )}
              />
            </Route>
          );
        }
      })}
    </Routes>
  );
};
