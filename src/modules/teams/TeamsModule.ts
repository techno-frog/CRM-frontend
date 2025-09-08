import { DashboardLayout } from "../../layouts/DashboardLayout";
import { Role } from "../../types/auth.types";
import type { Module } from "../../types/module.types";
import CreateTeam from "./pages/CreateTeam/CreateTeam";
import Teams from "./pages/Teams/Teams";
import { RiTeamFill } from "react-icons/ri";

export const teamsModule: Module = {
  id: "teams-module",
  routes: [
    {
      path: '/teams',
      title: 'Команда',
      component: Teams,
      navigable: true,
      icon: RiTeamFill,
      layout: DashboardLayout
    },
    {
      path: '/createTeam',
      title: 'Создание команды',
      component: CreateTeam,
      allowedRoles: [Role.USER]
    },
  ]
}