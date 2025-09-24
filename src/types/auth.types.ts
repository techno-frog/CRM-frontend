import type { Team } from "./teams.types";

export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER',
  MODERATOR = 'MODERATOR'
}

export interface User {
  id: string;
  email: string;
  name: string;
  roles: Role[];
  teams?: Team[]
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}