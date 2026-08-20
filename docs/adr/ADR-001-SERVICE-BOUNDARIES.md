# ADR-001: Service Boundaries and Event-Driven Architecture

**Date**: 2026-08-20  
**Status**: ACCEPTED  
**Authors**: Senior Developer, Tech Lead  

## Context

TaskBridge API requires three loosely coupled services:
1. **Project Service**: CRUD for projects/milestones
2. **Notification Service**: Real-time alerts to team members
3. **Audit Service**: Immutable event log for compliance

Services must integrate without creating hard dependencies. Changes to one service should not force rebuilds of others.

## Decision

Implement **event-driven architecture** with clear service boundaries:

- **Project Service** owns project/milestone mutations
- **Project Service** emits domain events on state changes
- **Audit Service** subscribes to events and logs immutably
- **Notification Service** subscribes to events and queues messages
- Services communicate only through events and query interfaces

## Architecture Diagram

```
┌──────────────────────────────────────────────────────┐
│                    Client Request                     │
└────────────────────┬─────────────────────────────────┘
                     │
            ┌────────▼────────┐
            │  API Gateway    │
            │ (Auth/Rate Limit)│
            └────────┬────────┘
                     │
        ┌────────────▼─────────────┐
        │   Project Service        │
        ├──────────────────────────┤
        │ 1. Validate Input        │
        │ 2. Authorize Request     │
        │ 3. Update Database       │
        │ 4. Emit Domain Event     │
        └────────────┬─────────────┘
                     │
          ┌──────────┴──────────┐
          │                     │
    ┌─────▼────────┐     ┌─────▼────────┐
    │ Audit Service│     │Notification  │
    │              │     │   Service    │
    ├──────────────┤     ├──────────────┤
    │1.Log Event   │     │1.Queue Alert │
    │2.Store (imm.)│     │2.Send Email/ │
    │3.Index       │     │  Webhook     │
    └──────────────┘     └──────────────┘
```

## Rationale

### Why Event-Driven?

1. **Loose Coupling**: Services don't know about each other
2. **Scalability**: Audit/notification processing independent of writes
3. **Compliance**: Audit trail can't be lost if notification fails
4. **Reliability**: Retry logic per service
5. **Observability**: Events form audit trail

### Why Service Boundaries?

1. **Ownership**: Clear responsibility for each domain
2. **Deployment**: Independent release cycles
3. **Scaling**: Each service scales independently
4. **Testing**: Isolated unit and integration tests

## Implementation Approach

### Project Service
```typescript
// 1. Business logic update
const updated = await projectModel.update(projectId, changes);

// 2. Emit event (fires asynchronously)
await eventBus.publish('ProjectUpdated', {
  projectId,
  changes,
  actor,
  timestamp: new Date(),
});

// 3. Return result immediately to client
return updated;
```

### Audit Service (Event Subscriber)
```typescript
eventBus.subscribe('ProjectUpdated', async (event) => {
  await auditModel.createLog({
    action: 'PROJECT_UPDATED',
    resourceId: event.projectId,
    changes: event.changes,
    actor: event.actor,
    timestamp: event.timestamp,
  });
});
```

### Notification Service (Event Subscriber)
```typescript
eventBus.subscribe('ProjectUpdated', async (event) => {
  const project = await projectService.getProject(event.projectId);
  const members = await teamService.getTeamMembers(project.teamId);
  
  for (const member of members) {
    await notificationQueue.enqueue({
      recipientId: member.id,
      type: 'PROJECT_UPDATED',
      title: `Project "${project.name}" Updated`,
      message: `Changes: ${JSON.stringify(event.changes)}`,
    });
  }
});
```

## Event Types

```typescript
enum ProjectEvent {
  CREATED = 'ProjectCreated',
  UPDATED = 'ProjectUpdated',
  STATUS_CHANGED = 'ProjectStatusChanged',
  DELETED = 'ProjectDeleted',
  MILESTONE_CREATED = 'MilestoneCreated',
  MILESTONE_UPDATED = 'MilestoneUpdated',
  MILESTONE_CLOSED = 'MilestoneClosed',
}

interface DomainEvent {
  id: string; // Unique event ID
  type: ProjectEvent;
  resourceType: 'Project' | 'Milestone';
  resourceId: string;
  actor: Actor;
  changes: Record<string, any>;
  timestamp: Date;
  version: number; // For event versioning
}
```

## Event Bus Implementation Options

### Option A: In-Process EventEmitter
**Pros**: Simple, no external dependencies  
**Cons**: No persistence, lost on restart, single-process only  
**Suitable For**: Development, small deployments

### Option B: Message Queue (RabbitMQ, Kafka)
**Pros**: Persistent, scalable, multi-process  
**Cons**: Operational complexity, eventual consistency  
**Suitable For**: Production, high-volume systems

### Recommended: Option B (Production)
Implement with Kafka/RabbitMQ for reliability and scalability.

## Failure Scenarios

### Scenario 1: Audit Service Down
```
Project Update → Event Published → Audit Service Fails
                                  → Message queued (persistent)
                                  → Audit Service recovers
                                  → Event processed

Outcome: No data loss; slight delay in audit log
```

### Scenario 2: Notification Service Down
```
Project Update → Event Published → Notification Service Fails
                                 → Message queued (persistent)
                                 → Notification Service recovers
                                 → Notifications sent

Outcome: Users receive slightly delayed notifications; no errors
```

### Scenario 3: Project Service Crashes Mid-Update
```
Project Update → Database Updated ✓ → Event Not Published ✗
                                    → Service crashes
                                    → Audit/Notification miss event

Issue: Inconsistent state  
Solution: Implement transactional outbox pattern (see ADR-002)
```

## Related Decisions

- **ADR-002**: Transactional Outbox Pattern (event reliability)
- **ADR-003**: Audit Service Query Interface (compliance)
- **ADR-004**: Notification Delivery Strategy (email, webhook, etc.)

## Consequences

### Positive
- ✓ Services independently deployable
- ✓ Easy to add new subscribers (e.g., analytics, webhooks)
- ✓ Audit trail cannot be lost
- ✓ Notification failures don't block operations
- ✓ Clear separation of concerns

### Negative
- ✗ Eventual consistency (audit log slightly delayed)
- ✗ Operational complexity (message queue required)
- ✗ Debugging distributed flow more difficult
- ✗ Data consistency requires careful design

## Migration Path

1. **Phase 1**: Build with in-process EventEmitter (fast iteration)
2. **Phase 2**: Integrate with message queue (production readiness)
3. **Phase 3**: Implement event sourcing (if needed later)

## Validation Checklist

- [ ] Event schemas defined and versioned
- [ ] Event bus implementation selected
- [ ] Retry logic documented
- [ ] Dead letter queue strategy defined
- [ ] Monitoring/alerting for failed events
- [ ] Integration tests verify event flow
- [ ] Documentation of event handlers per service

---

**Decision Made**: 2026-08-20  
**Next Review**: After Phase 1 implementation
