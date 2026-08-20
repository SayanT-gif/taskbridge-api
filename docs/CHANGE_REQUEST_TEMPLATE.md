# Change Request Impact Analysis Template

**Status**: Template for sprint change requests  
**Purpose**: Evaluate scope, risk, and effort before code changes  
**Audience**: Tech Lead, Product Team, Engineering Team

---

## Change Request Details

| Field | Value |
|-------|-------|
| **Request ID** | CR-YYYY-MM-DD-NNN |
| **Submitted By** | [Name] |
| **Submission Date** | [Date] |
| **Priority** | Critical / High / Medium / Low |
| **Deadline** | [Date, if applicable] |

---

## Description

### Current Behavior
[What does the system currently do?]

### Requested Behavior
[What should the system do instead?]

### Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

---

## Impact Analysis

### Services Affected

| Service | Impact Level | Reason |
|---------|--------------|--------|
| Project Service | [None/Low/Medium/High] | [Explanation] |
| Audit Service | [None/Low/Medium/High] | [Explanation] |
| Notification Service | [None/Low/Medium/High] | [Explanation] |
| Database | [None/Low/Medium/High] | [Explanation] |
| API Contracts | [None/Low/Medium/High] | [Explanation] |

### Files Modified (Estimated)

```
src/
├── projects/
│   └── [Files affected]
├── audit/
│   └── [Files affected]
├── notifications/
│   └── [Files affected]
└── common/
    └── [Files affected]
```

### Database Changes Required

- [ ] Schema modifications (list)
- [ ] Data migration (yes/no)
- [ ] Backward compatibility (required/not required)

**Details**:
```sql
-- Migration SQL if applicable
```

### API Contract Changes

- [ ] New endpoints: [List]
- [ ] Modified endpoints: [List with changes]
- [ ] Deprecated endpoints: [List]

**Breaking Changes**:
- [List any breaking changes]

---

## Risk Assessment

### Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| [Risk 1] | Low/Med/High | Low/Med/High | [Mitigation] |
| [Risk 2] | Low/Med/High | Low/Med/High | [Mitigation] |
| [Risk 3] | Low/Med/High | Low/Med/High | [Mitigation] |

### Compliance & Security Risks

- [ ] GDPR impact (yes/no): [Details]
- [ ] SOC 2 impact (yes/no): [Details]
- [ ] Authentication changes (yes/no): [Details]
- [ ] Authorization changes (yes/no): [Details]
- [ ] Data exposure risk (yes/no): [Details]

### Performance Risks

- [ ] Query performance impact: [Details]
- [ ] Memory usage impact: [Details]
- [ ] Scalability impact: [Details]

---

## Effort Estimation

### Development

| Task | Estimated Hours | Notes |
|------|-----------------|-------|
| Analysis & Design | [Hours] | |
| Implementation | [Hours] | |
| Unit Testing | [Hours] | |
| Integration Testing | [Hours] | |
| Code Review | [Hours] | |
| **Total** | **[Hours]** | |

### Timeline

- **Design Phase**: [Days]
- **Implementation Phase**: [Days]
- **Testing Phase**: [Days]
- **Review Phase**: [Days]
- **Total Duration**: [Days]

**Can we complete within sprint?** Yes / No / Conditional

---

## Dependencies

### Internal Dependencies
- [ ] Dependency 1: [Service/Component]
- [ ] Dependency 2: [Service/Component]
- [ ] Dependency 3: [Service/Component]

### External Dependencies
- [ ] Dependency 1: [Third-party service]
- [ ] Dependency 2: [Third-party service]

### Blocked By
- [ ] Issue #XXX: [Description]
- [ ] Issue #YYY: [Description]

---

## Testing Strategy

### Unit Tests
- [ ] New tests required: [Describe]
- [ ] Modified tests: [Describe]
- [ ] Coverage impact: [Current: X% → Expected: Y%]

### Integration Tests
- [ ] New scenarios: [List]
- [ ] Modified scenarios: [List]

### E2E Tests
- [ ] User workflows affected: [List]
- [ ] New test cases: [List]

### Regression Testing
- [ ] Critical paths to verify: [List]
- [ ] Services to regression test: [List]

---

## Rollback Plan

### Can This Be Rolled Back?
**Yes / No / Partial** (explain)

### Rollback Procedure
1. [Step 1]
2. [Step 2]
3. [Step 3]

### Data Rollback (if applicable)
- Database migration reversal: [Procedure]
- Data restoration: [Procedure]
- State recovery: [Procedure]

### Rollback Risks
- [Risk 1]
- [Risk 2]

---

## Recommendation

### Decision
- [ ] **APPROVE** — Proceed immediately
- [ ] **APPROVE WITH CONDITIONS** — Proceed if conditions met
- [ ] **DEFER** — Plan for future sprint
- [ ] **REJECT** — Do not proceed

### Rationale
[Explain the decision]

### Conditions (if applicable)
1. [Condition 1]
2. [Condition 2]
3. [Condition 3]

### Alternative Approaches
1. [Alternative 1]: [Pros/Cons]
2. [Alternative 2]: [Pros/Cons]
3. [Alternative 3]: [Pros/Cons]

---

## Sign-Off

| Role | Name | Date | Signature |
|------|------|------|----------|
| Tech Lead | | | |
| Product Owner | | | |
| Senior Engineer | | | |

---

## Appendix: Detailed Analysis

### A. Service Impact Details

#### Project Service
[Detailed explanation of how this change affects Project Service]

#### Audit Service
[Detailed explanation of how this change affects Audit Service]

#### Notification Service
[Detailed explanation of how this change affects Notification Service]

### B. Code Changes Preview

**Pseudocode of proposed changes**:
```typescript
// Example of proposed changes
```

### C. Configuration Changes

**New environment variables** (if any):
```env
NEW_VAR=value
ANOTHER_VAR=value
```

### D. Documentation Updates Needed

- [ ] README.md
- [ ] API Documentation
- [ ] Architecture Decision Record (ADR)
- [ ] Deployment Guide
- [ ] Migration Guide

---

**Template Version**: 1.0  
**Last Updated**: 2026-08-20
