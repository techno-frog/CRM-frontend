export enum TeamActivityType {
  TEAM_CREATED = 'teamCreated',
  MEMBER_JOINED = 'memberJoined',
  MEMBER_LEFT = 'memberLeft',
  MEMBER_INVITED = 'memberInvited',
  MEMBER_DISMISSED = 'memberDismissed',
  MEMBER_ROLE_CHANGED = 'memberRoleChanged',
  TASK_CREATED = 'taskCreated',
  TASK_COMPLETED = 'taskCompleted',
  TASK_ASSIGNED = 'taskAssigned',
  EVENT_CREATED = 'eventCreated',
  EVENT_STARTED = 'eventStarted',
  EVENT_COMPLETED = 'eventCompleted',
  ROLE_ASSIGNED = 'roleAssigned',
  ROLE_REMOVED = 'roleRemoved',
  INVITATION_CREATED = 'invitationCreated',
  INVITATION_ACCEPTED = 'invitationAccepted',
  INVITATION_DECLINED = 'invitationDeclined',
  INVITATION_REVOKED = 'invitationRevoked',
  INVITATION_EXPIRED = 'invitationExpired',
  DOCUMENT_UPLOADED = 'documentUploaded',
  DOCUMENT_DELETED = 'documentDeleted',
  DOCUMENT_SHARED = 'documentShared',
  TEAM_STATUS_CHANGED = 'teamStatusChanged',
  TEAM_SETTINGS_UPDATED = 'teamSettingsUpdated',
  TEAM_DESCRIPTION_UPDATED = 'teamDescriptionUpdated',
  DEAL_CREATED = 'dealCreated',
  DEAL_UPDATED = 'dealUpdated',
  DEAL_CLOSED = 'dealClosed',
  PROJECT_CREATED = 'projectCreated',
  PROJECT_COMPLETED = 'projectCompleted',
  MILESTONE_REACHED = 'milestoneReached',
  MEETING_SCHEDULED = 'meetingScheduled',
  MEETING_COMPLETED = 'meetingCompleted',
  ANNOUNCEMENT_POSTED = 'announcementPosted',
  INTEGRATION_CONNECTED = 'integrationConnected',
  INTEGRATION_DISCONNECTED = 'integrationDisconnected',
  BACKUP_CREATED = 'backupCreated',
  SECURITY_ALERT = 'securityAlert',
}

export enum TeamActivityPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface TeamActivity {
  id: string;
  teamId: string;
  createdBy: User;
  type: TeamActivityType;
  priority: TeamActivityPriority;
  title: string;
  description?: string;
  metadata?: Record<string, any>;
  targetUserId?: string;
  targetResourceType?: string;
  targetResourceId?: string;
  mentions: string[];
  tags: string[];
  isSystem: boolean;
  isArchived: boolean;
  teamName: string;
  occurredAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTeamActivityDto {
  teamId: string;
  type: TeamActivityType;
  priority?: TeamActivityPriority;
  title: string;
  description?: string;
  metadata?: Record<string, any>;
  targetUserId?: string;
  targetResourceType?: string;
  targetResourceId?: string;
  mentions?: string[];
  tags?: string[];
  isSystem?: boolean;
  occurredAt?: string;
}

export interface UpdateTeamActivityDto {
  priority?: TeamActivityPriority;
  title?: string;
  description?: string;
  metadata?: Record<string, any>;
  mentions?: string[];
  tags?: string[];
  isArchived?: boolean;
}

export interface GetTeamActivitiesParams {
  teamId: string;
  type?: TeamActivityType;
  priority?: TeamActivityPriority;
  createdBy?: string;
  targetUserId?: string;
  targetResourceType?: string;
  tags?: string[];
  isSystem?: boolean;
  isArchived?: boolean;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface GetTeamActivitiesResponse {
  activities: TeamActivity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

export interface TeamActivityResponseDto {
  id: string;
  teamId: string;
  createdBy: User;
  type: TeamActivityType;
  priority: TeamActivityPriority;
  title: string;
  description?: string;
  metadata?: Record<string, any>;
  targetUserId?: string;
  targetResourceType?: string;
  targetResourceId?: string;
  mentions: string[];
  tags: string[];
  isSystem: boolean;
  isArchived: boolean;
  occurredAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeamActivityStatsDto {
  teamId: string;
  totalActivities: number;
  activitiesByType: Record<TeamActivityType, number>;
  activitiesByPriority: Record<TeamActivityPriority, number>;
  mostActiveUsers: Array<{
    userId: string;
    userName: string;
    activityCount: number;
  }>;
  recentActivityTrend: Array<{
    date: string;
    count: number;
  }>;
}