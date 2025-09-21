import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ModuleRouter } from './routing/ModuleRouter';
import { RouteRegistry } from './routing/RouteRegistry';
import { LoginPage } from './modules/auth/';
import CreateTeam from './modules/teams/pages/CreateTeam/CreateTeam';
import Join from './pages/Join/Join';

import { dashboardModule } from './modules/dashboard';
import './App.css';
import { teamsModule } from './modules/teams';
import { rolesModule } from './modules/roles';


RouteRegistry.registerModule(dashboardModule);
// RouteRegistry.registerModule(accountsModule);
RouteRegistry.registerModule(teamsModule)
RouteRegistry.registerModule(rolesModule)

export const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/registration" element={<CreateTeam />} />
      <Route path="/join/:id" element={<Join />} />
      <Route path="/*" element={<ModuleRouter modules={RouteRegistry.getModules()} />} />
    </Routes>
  );
};