import winston from 'winston';
import { ProjectRepository } from '../repository';
import { Project } from '../entities';
import {
  CreateProjectInput,
  UpdateProjectStatusInput,
} from '../dto';
import {
  ValidationError,
  ForbiddenError,
  NotFoundError,
  InternalServerError,
} from '../errors';
import { Actor } from '../types';

/**
 * Service layer for Project business logic.
 * Handles authorization, validation, and coordination.
 */
export class ProjectService {
  private logger: winston.Logger;

  constructor(
    private projectRepository: ProjectRepository,
    logger?: winston.Logger
  ) {
    this.logger =
      logger ||
      winston.createLogger({
        level: process.env.LOG_LEVEL || 'info',
        format: winston.format.json(),
        defaultMeta: { service: 'project-service' },
        transports: [
          new winston.transports.Console(),
          new winston.transports.File({
            filename: 'error.log',
            level: 'error',
          }),
        ],
      });
  }

  /**
   * Create a new project.
   * Authorization: User must belong to the organisation.
   *
   * @param input Project creation data
   * @param actor User performing the action
   * @returns Created project
   * @throws ValidationError if input is invalid
   * @throws ForbiddenError if actor not authorized
   */
  async createProject(input: CreateProjectInput, actor: Actor): Promise<Project> {
    this.logger.info('Creating project', {
      actorId: actor.userId,
      organisationId: actor.organisationId,
      projectName: input.name,
    });

    try {
      // Validation is done by class-validator decorators
      // Authorization: implicitly allowed for organisation members

      const project = await this.projectRepository.create({
        name: input.name,
        description: input.description,
        teamId: input.teamId,
        organisationId: actor.organisationId,
        status: 'active',
      });

      this.logger.info('Project created successfully', {
        projectId: project.id,
        actorId: actor.userId,
      });

      return project;
    } catch (error) {
      if (error instanceof ValidationError || error instanceof InternalServerError) {
        throw error;
      }
      this.logger.error('Failed to create project', {
        actorId: actor.userId,
        organisationId: actor.organisationId,
        error: (error as Error).message,
      });
      throw new InternalServerError('Failed to create project', error as Error);
    }
  }

  /**
   * Get project by ID.
   * Authorization: User must belong to the same organisation.
   *
   * @param projectId Project ID
   * @param actor User performing the action
   * @returns Project
   * @throws ForbiddenError if actor not authorized
   * @throws NotFoundError if project doesn't exist
   */
  async getProject(projectId: string, actor: Actor): Promise<Project> {
    this.logger.info('Fetching project', {
      projectId,
      actorId: actor.userId,
    });

    try {
      const project = await this.projectRepository.getById(
        projectId,
        actor.organisationId
      );

      if (!project) {
        throw new NotFoundError('Project');
      }

      return project;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      this.logger.error('Failed to fetch project', {
        projectId,
        error: (error as Error).message,
      });
      throw new InternalServerError('Failed to fetch project', error as Error);
    }
  }

  /**
   * Get projects by team with pagination.
   * Authorization: User must belong to the same organisation.
   *
   * @param teamId Team ID
   * @param actor User performing the action
   * @param page Page number (1-indexed)
   * @param limit Results per page (1-100)
   * @returns Paginated projects
   * @throws ForbiddenError if actor not authorized
   * @throws ValidationError if pagination params invalid
   */
  async getProjectsByTeam(
    teamId: string,
    actor: Actor,
    page: number = 1,
    limit: number = 50
  ): Promise<{ data: Project[]; total: number; page: number; limit: number }> {
    this.logger.info('Fetching projects by team', {
      teamId,
      actorId: actor.userId,
      page,
      limit,
    });

    // Validate pagination params
    if (page < 1) {
      throw new ValidationError('Page must be >= 1', { field: 'page' });
    }
    if (limit < 1 || limit > 100) {
      throw new ValidationError('Limit must be between 1 and 100', {
        field: 'limit',
      });
    }

    try {
      const result = await this.projectRepository.getByTeam(
        teamId,
        actor.organisationId,
        page,
        limit
      );

      return {
        data: result.data,
        total: result.total,
        page,
        limit,
      };
    } catch (error) {
      if (error instanceof ValidationError) throw error;
      this.logger.error('Failed to fetch projects by team', {
        teamId,
        error: (error as Error).message,
      });
      throw new InternalServerError(
        'Failed to fetch projects by team',
        error as Error
      );
    }
  }

  /**
   * Update project status.
   * Authorization: User must belong to the same organisation.
   *
   * @param projectId Project ID
   * @param input Update data
   * @param actor User performing the action
   * @returns Updated project
   * @throws ValidationError if status invalid
   * @throws ForbiddenError if actor not authorized
   * @throws NotFoundError if project doesn't exist
   */
  async updateProjectStatus(
    projectId: string,
    input: UpdateProjectStatusInput,
    actor: Actor
  ): Promise<Project> {
    this.logger.info('Updating project status', {
      projectId,
      newStatus: input.status,
      actorId: actor.userId,
    });

    try {
      // Validate status
      const validStatuses = ['active', 'archived', 'closed'];
      if (!validStatuses.includes(input.status)) {
        throw new ValidationError('Invalid status', {
          field: 'status',
          validValues: validStatuses,
        });
      }

      // Fetch old state for audit trail
      const oldProject = await this.projectRepository.getById(
        projectId,
        actor.organisationId
      );

      if (!oldProject) {
        throw new NotFoundError('Project');
      }

      // Update status
      const updated = await this.projectRepository.updateStatus(
        projectId,
        input.status,
        actor.organisationId
      );

      this.logger.info('Project status updated', {
        projectId,
        newStatus: input.status,
        actorId: actor.userId,
      });

      return updated;
    } catch (error) {
      if (
        error instanceof ValidationError ||
        error instanceof NotFoundError
      ) {
        throw error;
      }
      this.logger.error('Failed to update project status', {
        projectId,
        error: (error as Error).message,
      });
      throw new InternalServerError(
        'Failed to update project status',
        error as Error
      );
    }
  }

  /**
   * Delete project.
   * Authorization: User must belong to the same organisation.
   *
   * @param projectId Project ID
   * @param actor User performing the action
   * @returns true if deleted, false if not found
   * @throws ForbiddenError if actor not authorized
   */
  async deleteProject(projectId: string, actor: Actor): Promise<boolean> {
    this.logger.info('Deleting project', {
      projectId,
      actorId: actor.userId,
    });

    try {
      // Verify project exists in actor's organisation
      const project = await this.projectRepository.getById(
        projectId,
        actor.organisationId
      );

      if (!project) {
        throw new NotFoundError('Project');
      }

      const deleted = await this.projectRepository.delete(
        projectId,
        actor.organisationId
      );

      if (deleted) {
        this.logger.info('Project deleted', {
          projectId,
          actorId: actor.userId,
        });
      }

      return deleted;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      this.logger.error('Failed to delete project', {
        projectId,
        error: (error as Error).message,
      });
      throw new InternalServerError('Failed to delete project', error as Error);
    }
  }
}
