import { DashboardLayout } from "../../layouts/DashboardLayout";
import TeamLayout from "./Layouts/Teams/TeamLayout/TeamLayout";

import { Role } from "../../types/auth.types";
import type { Module } from "../../types/module.types";
import CreateTeam from "./pages/CreateTeam/CreateTeam";
import Team from "./pages/Team/Team";
import Teams from "./pages/Teams/Teams";
import TeamCallendarPage from "./pages/Callendar/TeamCallendar";
import { RiTeamFill } from "react-icons/ri";
import TeamCalendarLayout from "./Layouts/Teams/CalendarLayout/TeamCalendarLayout";

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
      layout: TeamLayout,
    },
    {
      path: '/team/:id/callendar',
      title: 'Календарь команды',
      component: TeamCallendarPage,
      navigable: false,
      layout: TeamCalendarLayout,
    },
    {
      path: '/createTeam',
      title: 'Создание команды',
      component: CreateTeam,
      allowedRoles: [Role.USER]
    },
  ]
}
