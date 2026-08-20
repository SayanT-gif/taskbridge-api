// Shared types and interfaces across services

export interface AuditEvent {
  id: string;
  timestamp: Date;
  actor: Actor;
  action: AuditAction;
  resourceType: string;
  resourceId: string;
  changes: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface Actor {
  userId: string;
  email: string;
  name: string;
}

export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'STATUS_CHANGE'
  | 'MILESTONE_CREATED'
  | 'MILESTONE_UPDATED'
  | 'MILESTONE_CLOSED';

export interface Notification {
  id: string;
  recipientId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedResource: {
    type: string;
    id: string;
  };
  read: boolean;
  createdAt: Date;
}

export type NotificationType =
  | 'MILESTONE_CREATED'
  | 'MILESTONE_UPDATED'
  | 'MILESTONE_CLOSED'
  | 'PROJECT_CREATED'
  | 'PROJECT_ARCHIVED';

export interface ErrorResponse {
  code: string;
  message: string;
  details?: Record<string, any>;
}
