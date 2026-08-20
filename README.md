# TaskBridge API

A B2B SaaS microservices platform for distributed engineering teams. This repository contains the Notification & Audit Service alongside the Project Service.

## Tech Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript 5.x (strict mode)
- **Framework**: Express.js
- **Database**: PostgreSQL 14+
- **Testing**: Jest
- **Linting**: ESLint + Prettier
- **Package Manager**: npm

## Services

### Project Service (Legacy)
CRUD operations for projects and milestones. *Note: Contractor-generated code under review.*

### Notification Service (In Development)
Real-time notifications to team members when project milestones are updated.

### Audit Service (In Development)
Immutable audit log for compliance tracking and historical queries.

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm

### Installation

```bash
npm install
```

### Environment Setup

Create a `.env` file:

```env
DATABASE_URL=postgresql://user:password@localhost/taskbridge
PORT=3000
NODE_ENV=development
LOG_LEVEL=info
```

### Database Migration

```bash
npm run migrate
```

### Running Tests

```bash
npm test
```

### Development Server

```bash
npm run dev
```

## Project Structure

```
taskbridge-api/
├── src/
│   ├── projects/          # Project Service (legacy)
│   ├── notifications/     # Notification Service (new)
│   ├── audit/            # Audit Service (new)
│   └── common/           # Shared utilities, types, middleware
├── tests/                # Integration and e2e tests
├── docs/                 # Architecture and design docs
└── migrations/           # Database migrations
```

## Documentation

- [Copilot Custom Instructions](./.copilot-instructions.md)
- [Prompt Archive](./docs/prompts/)
- [Architecture Decisions](./docs/adr/)

## Review Status

⚠️ **Project Service**: Under architectural and security review. Contractor-generated code awaiting approval.

## License

Proprietary - TaskBridge Inc.
