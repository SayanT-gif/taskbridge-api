# Copilot Prompt Archive

This directory preserves all GitHub Copilot prompts used during development for transparency, reproducibility, and learning.

## Purpose

- **Traceability**: Link generated code to input prompts
- **Quality Control**: Evaluate prompt quality and outcomes
- **Knowledge Base**: Reference for effective/ineffective prompt patterns
- **Compliance**: Demonstrate code provenance for audits

## Directory Structure

```
docs/prompts/
├── README.md (this file)
├── contractor-project-service.md     # Low-effort generation
└── [new prompts documented here]
```

## Format

Each prompt file includes:

1. **Prompt Text** (verbatim)
2. **Context** (who, when, why, what generated)
3. **Output Files** (what was created)
4. **Review Status** (any issues identified)
5. **Lessons Learned** (effectiveness analysis)

## Naming Convention

```
{purpose}-{service}-{date}.md
```

Examples:
- `contractor-project-service.md` — Original contractor code
- `refactor-project-service.md` — Refactored version
- `new-audit-service.md` — New service generation

## Adding New Prompts

When using Copilot to generate code:

1. Save the exact prompt text
2. Note context (date, purpose, author)
3. List files generated
4. Create a `.md` file in this directory
5. Commit together with generated code

Example:

```markdown
# Audit Service Generation

## Prompt
```
Generate an Audit Service with the following capabilities:
- Log immutable events
- Query by date range
- Query by event type
- Support filtering by actor
```

## Context
- **Date**: 2026-08-22
- **Author**: Senior Developer
- **Purpose**: Implement audit logging for compliance

## Output Files
- `src/audit/AuditModel.ts`
- `src/audit/AuditService.ts`
- `tests/audit/AuditService.spec.ts`

## Status
UNDER REVIEW
```

## Prompt Quality Assessment

### High-Quality Prompt Characteristics
- Clear requirements
- Specifies constraints and edge cases
- Defines input/output contracts
- Mentions testing expectations
- References architectural patterns

### Low-Quality Prompt Characteristics (Avoid)
- Vague scope
- No constraints
- Missing error handling expectations
- No mention of testing
- Generic template requests

### Example: Low-Effort Prompt Analysis

**Prompt**: *"Generate a Project model and a Project service with create, update status, get by team, and delete functions. Use a database."*

**Issues**:
- No auth requirements mentioned
- No error handling guidance
- No logging/audit mentioned
- No testing expectations
- Database type unspecified
- Transaction handling not mentioned

**Outcome**: Produced functional but unsafe code requiring extensive review.

## Lessons Learned

1. **Prompt Specificity Matters**: Vague prompts produce vague code
2. **Always Request Testing**: Copilot excels with explicit test requirements
3. **Mention Cross-Cutting Concerns**: Auth, logging, error handling must be explicit
4. **Reference Patterns**: Naming established architectural patterns helps
5. **Validate Generated Code**: Even good prompts produce code requiring review

## Best Practices for Effective Copilot Prompts

### Template

```
# Service: [Name]

## Requirements
- [Functional requirement]
- [Functional requirement]

## Constraints
- Error handling: [strategy]
- Logging: [what, how]
- Authorization: [requirements]
- Validation: [schema]

## Implementation Details
- Use [framework/pattern]
- Database: [type]
- Transactions: [when needed]

## Testing
- Unit tests: [coverage target]
- Integration tests: [key workflows]
- Error scenarios: [list]

## Output Deliverables
- [File 1]: [Purpose]
- [File 2]: [Purpose]
```

---

**Last Updated**: 2026-08-20
