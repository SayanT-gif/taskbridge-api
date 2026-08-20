/**
 * Project domain entity.
 * Represents the core project data model.
 */
export class Project {
  id!: string;
  name!: string;
  description?: string;
  teamId!: string;
  organisationId!: string; // Multi-tenant isolation
  status!: 'active' | 'archived' | 'closed';
  createdAt!: Date;
  updatedAt!: Date;

  constructor(data?: Partial<Project>) {
    Object.assign(this, data);
  }
}

/**
 * Milestone domain entity.
 */
export class Milestone {
  id!: string;
  projectId!: string;
  organisationId!: string;
  title!: string;
  dueDate!: Date;
  status!: 'pending' | 'in_progress' | 'completed';
  createdAt!: Date;
  updatedAt!: Date;

  constructor(data?: Partial<Milestone>) {
    Object.assign(this, data);
  }
}
