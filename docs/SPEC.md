# TaskBridge Notification & Audit Service — Technical Specification

**Version**: 1.0  
**Date**: 2026-08-20  
**Author**: Senior Developer (Copilot-Assisted)  
**Status**: APPROVED FOR IMPLEMENTATION

---

## 1. Overview

The Notification & Audit Service is a companion to the Project Service, providing:

1. **Real-time Notifications**: Alert team members when project milestones change (created, updated, closed)
2. **Immutable Audit Log**: Maintain a tamper-proof record of all state changes for compliance (GDPR, SOC 2)
3. **Audit Queries**: Allow authorized users to query audit history by date range or event type

### Constraints

- **Immutability**: Audit events cannot be modified or deleted (write-once semantics)
- **Authorization**: Only team members of a project can view its audit history
- **Data Retention**: Audit logs retained per compliance policy (default: 7 years)
- **Latency**: Notifications may be slightly delayed (eventual consistency acceptable)

---

## 2. Data Models

### 2.1 AuditEvent

**Table**: `audit_events` (immutable, append-only)  
**Purpose**: Record all state changes in the system

```typescript
interface AuditEvent {
  // Primary Key
  id: UUID;                    // Unique, immutable
  
  // Temporal
  timestamp: Date;             // ISO 8601, UTC
  createdAt: Date;             // Same as timestamp (immutable)
  
  // Actor
  actor: {
    userId: UUID;              // Who made the change
    email: string;             // Actor's email (snapshot)
    name: string;              // Actor's name (snapshot)
  };
  
  // Resource
  action: AuditAction;         // CREATE | UPDATE | DELETE | STATUS_CHANGE | ...
  resourceType: string;        // 'Project' | 'Milestone'
  resourceId: UUID;            // ID of changed resource
  organisationId: UUID;        // Multi-tenant isolation
  
  // Changes
  changes: {
    fieldName: {
      from: any;               // Previous value (null if CREATE)
      to: any;                 // New value
    };
  };
  
  // Context
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    requestId?: string;        // Correlation ID
  };
}

type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'STATUS_CHANGE'
  | 'MILESTONE_CREATED'
  | 'MILESTONE_UPDATED'
  | 'MILESTONE_CLOSED';
```

### 2.2 Notification

**Table**: `notifications` (mutable, read-tracked)  
**Purpose**: Track notifications sent to users

```typescript
interface Notification {
  // Primary Key
  id: UUID;
  
  // Recipient
  recipientId: UUID;           // User receiving notification
  organisationId: UUID;        // Multi-tenant isolation
  
  // Content
  type: NotificationType;      // MILESTONE_CREATED | MILESTONE_UPDATED | ...
  title: string;               // e.g., "Milestone 'v1.0' Created"
  message: string;             // Rich notification body
  
  // Resource Reference
  relatedResource: {
    type: string;              // 'Project' | 'Milestone'
    id: UUID;
  };
  
  // State
  read: boolean;               // Default: false
  readAt?: Date;               // When user marked as read
  
  // Temporal
  createdAt: Date;             // When notification was created
  sentAt?: Date;               // When notification was sent (email/webhook)
  expiresAt: Date;             // Retention policy (default: 30 days)
}

type NotificationType =
  | 'MILESTONE_CREATED'
  | 'MILESTONE_UPDATED'
  | 'MILESTONE_CLOSED'
  | 'PROJECT_CREATED'
  | 'PROJECT_ARCHIVED'
  | 'PROJECT_DELETED';
```

---

## 3. API Contracts

### 3.1 Audit Queries API

**Endpoint**: `GET /api/v1/projects/{projectId}/audit`  
**Authentication**: Required (JWT)  
**Authorization**: User must be member of project's team

**Request Query Parameters**:

```typescript
interface AuditQueryRequest {
  // Date Range (optional, default: last 30 days)
  startDate?: ISO8601String;   // e.g., "2026-08-20T00:00:00Z"
  endDate?: ISO8601String;     // e.g., "2026-08-20T23:59:59Z"
  
  // Filtering (optional)
  action?: AuditAction;        // Filter by action type
  actorId?: UUID;              // Filter by actor
  resourceType?: string;       // Filter by resource type
  
  // Pagination (required)
  page: number;                // 1-indexed, default: 1
  limit: number;               // 1-100, default: 50
  
  // Sorting (optional)
  sortBy?: 'timestamp' | 'action';  // default: timestamp
  sortOrder?: 'asc' | 'desc';       // default: desc
}
```

**Response (200 OK)**:

```typescript
interface AuditQueryResponse {
  data: AuditEvent[];
  pagination: {
    page: number;
    limit: number;
    total: number;              // Total matching records
    hasMore: boolean;           // true if more pages available
  };
  meta: {
    queryTime: number;          // Query execution time (ms)
    generatedAt: ISO8601String;
  };
}
```

### 3.2 Notification API

**Endpoint**: `GET /api/v1/notifications`  
**Authentication**: Required (JWT)  
**Authorization**: Implicit (user can only see their own notifications)

**Response (200 OK)**:

```typescript
interface NotificationListResponse {
  data: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
  meta: {
    unreadCount: number;       // Count of unread notifications
    generatedAt: ISO8601String;
  };
}
```

---

## 4. Integration Points

### 4.1 Project Service Events

Project Service emits domain events on state changes:

```typescript
interface ProjectServiceEvent {
  id: string;                  // Unique event ID
  type: string;                // ProjectCreated | ProjectUpdated | MilestoneCreated | etc.
  projectId: UUID;
  organisationId: UUID;        // Multi-tenant context
  actor: {
    userId: UUID;
    email: string;
    name: string;
  };
  timestamp: ISO8601String;
  data: {
    changes?: Record<string, { from: any; to: any }>;
    resourceId?: UUID;         // For milestone events
    status?: string;           // For status change events
  };
}
```

Audit & Notification services subscribe to these events via event bus.

---

## 5. Validation Rules

### 5.1 Input Validation

**Audit Query Parameters**:
- `startDate` must be valid ISO 8601 date and before `endDate`
- `endDate` must be valid ISO 8601 date and not in future
- `page` must be positive integer (min: 1)
- `limit` must be between 1 and 100
- `action` must be one of defined AuditAction enum values

**Notification Mark as Read**:
- `notificationId` must be valid UUID
- User can only update own notifications
- Cannot update `read` status back to false (write-once for read state)

### 5.2 Authorization Rules

**Audit Query Access**:
- User must be authenticated
- User must belong to project's team
- User organisation must match resource organisation

**Notification Access**:
- User must be authenticated
- User can only view own notifications
- User can only modify own notifications

---

## 6. Design Notes

### Where Copilot Helped

- **Data Model Structure**: Copilot suggested the layered approach and field naming conventions
- **SQL Schema**: Database constraints and indexes were proposed by Copilot
- **API Contract Examples**: Request/response shapes were scaffolded by Copilot

### Where Human Judgment Applied

1. **Immutability Enforcement**: Added database constraints — AI didn't propose this
2. **Multi-Tenant Isolation**: Explicitly required `organisationId` on all queries
3. **Event Mapping**: Manual mapping from Project Service events to Audit actions
4. **Authorization**: Policies defined by compliance requirements
5. **Data Retention Policy**: Legal/compliance decision (7 years retention)
6. **Query Filtering Options**: Based on anticipated user workflows

---

## 7. Testing Expectations

- **Unit Tests**: >80% coverage of validation, mapping, error handling
- **Integration Tests**: Event flow, multi-tenant isolation, authorization
- **E2E Tests**: Full audit trail and notification workflows

---

**Specification Approved**: 2026-08-20  
**Ready for Implementation**: YES
