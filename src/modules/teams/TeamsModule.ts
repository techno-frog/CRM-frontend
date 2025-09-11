import { DashboardLayout } from "../../layouts/DashboardLayout";
import TeamLayout from "../../layouts/Teams/TeamLayout";
import { Role } from "../../types/auth.types";
import type { Module } from "../../types/module.types";
import CreateTeam from "./pages/CreateTeam/CreateTeam";
import Team from "./pages/Team/Team";
import Teams from "./pages/Teams/Teams";
import { RiTeamFill } from "react-icons/ri";

export const teamsModule: Module = {
  id: "teams-module",
  routes: [
    {
      path: '/teams',
      title: 'Команды',
      component: Teams,
      navigable: true,
      icon: RiTeamFill,
      layout: DashboardLayout
    },
    {
      path: '/team/:id',
      title: 'Команда',
      component: Team,
      navigable: false,
      layout: TeamLayout
    },
    {
      path: '/createTeam',
      title: 'Создание команды',
      component: CreateTeam,
      allowedRoles: [Role.USER]
    },
  ]
}