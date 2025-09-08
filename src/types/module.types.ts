import type { ComponentType } from 'react';
import { Role } from './auth.types';

export interface RouteConfig {
  path: string;
  component: ComponentType<any>;
  props?: Record<string, any>;
  title: string;
  layout?: ComponentType<any>;
  navigable?: boolean;
  icon?: ComponentType;
  allowedRoles?: Role[];
  unauthorizedComponent?: ComponentType;
  unauthorizedRedirect?: string;
  topWidget?: ComponentType;
  dashboardWidget?: ComponentType;
  subModules?: RouteConfig[];
}

export interface Module {
  id: string;
  routes: RouteConfig[];
  widget?: ComponentType;
}