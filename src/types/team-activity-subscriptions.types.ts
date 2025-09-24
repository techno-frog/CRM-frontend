import { TeamActivityType } from './team-activities.types';

export interface CreateTeamActivitySubscriptionDto {
  teamId: string;
  subscribedActivityTypes: TeamActivityType[];
  isActive?: boolean;
}

export interface UpdateTeamActivitySubscriptionDto {
  subscribedActivityTypes?: TeamActivityType[];
  isActive?: boolean;
}

export interface GetTeamActivitySubscriptionResponseDto {
  id: string;
  userId: string;
  teamId: string;
  subscribedActivityTypes: TeamActivityType[];
  isActive: boolean;
  lastNotificationAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetTeamSubscribersResponseDto {
  userId: string;
  subscribedActivityTypes: TeamActivityType[];
  isActive: boolean;
  lastNotificationAt?: string;
}

export interface TeamActivitySubscriptionStatsDto {
  totalSubscribers: number;
  activeSubscribers: number;
  subscriptionsByType: Record<TeamActivityType, number>;
}