export enum ActivityType {
  INVITE = 'invite',
  CALENDAR = 'calendar',
  SYSTEM = 'system',
  NOTIFICATION = 'notification'
}

export enum ActivityImportance {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum ActivityStatus {
  READ = 'read',
  UNREAD = 'unread'
}

export interface UserActivity {
  id: string;
  userId: string;
  type: ActivityType;
  importance: ActivityImportance;
  text: string;
  status: ActivityStatus;
  data: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface GetActivitiesParams {
  status?: ActivityStatus;
  type?: ActivityType;
  page?: number;
  limit?: number;
}

export interface GetActivitiesResponse {
  activities: UserActivity[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

