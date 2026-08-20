import { Pool, QueryResult } from 'pg';
import { Project } from '../entities/Project';
import { InternalServerError } from '../errors';

/**
 * Data layer for Project entity.
 * Handles all database operations with PostgreSQL.
 */
export class ProjectRepository {
  constructor(private dbPool: Pool) {}

  /**
   * Create a new project.
   * @param data Project data
   * @returns Created project
   * @throws InternalServerError if database operation fails
   */
  async create(data: {
    name: string;
    description?: string;
    teamId: string;
    organisationId: string;
    status?: string;
  }): Promise<Project> {
    const query = `
      INSERT INTO projects (name, description, teamId, organisationId, status, createdAt, updatedAt)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING *
    `;

    try {
      const result = await this.dbPool.query(query, [
        data.name,
        data.description || null,
        data.teamId,
        data.organisationId,
        data.status || 'active',
      ]);
      return this.mapRowToProject(result.rows[0]);
    } catch (error) {
      throw new InternalServerError('Failed to create project', error as Error);
    }
  }

  /**
   * Get project by ID.
   * @param id Project ID
   * @returns Project or null if not found
   */
  async getById(id: string, organisationId: string): Promise<Project | null> {
    const query = `
      SELECT * FROM projects 
      WHERE id = $1 AND organisationId = $2
    `;

    try {
      const result = await this.dbPool.query(query, [id, organisationId]);
      return result.rows[0] ? this.mapRowToProject(result.rows[0]) : null;
    } catch (error) {
      throw new InternalServerError('Failed to fetch project', error as Error);
    }
  }

  /**
   * Get projects by team with pagination.
   * @param teamId Team ID
   * @param organisationId Organisation ID (multi-tenant isolation)
   * @param page Page number (1-indexed)
   * @param limit Results per page
   * @returns Paginated projects
   */
  async getByTeam(
    teamId: string,
    organisationId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<{ data: Project[]; total: number }> {
    const offset = (page - 1) * limit;

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as count FROM projects 
      WHERE teamId = $1 AND organisationId = $2
    `;

    // Get paginated data
    const dataQuery = `
      SELECT * FROM projects 
      WHERE teamId = $1 AND organisationId = $2
      ORDER BY createdAt DESC
      LIMIT $3 OFFSET $4
    `;

    try {
      const [countResult, dataResult] = await Promise.all([
        this.dbPool.query(countQuery, [teamId, organisationId]),
        this.dbPool.query(dataQuery, [teamId, organisationId, limit, offset]),
      ]);

      return {
        data: dataResult.rows.map(row => this.mapRowToProject(row)),
        total: parseInt(countResult.rows[0].count, 10),
      };
    } catch (error) {
      throw new InternalServerError('Failed to fetch projects by team', error as Error);
    }
  }

  /**
   * Update project status.
   * @param id Project ID
   * @param status New status
   * @param organisationId Organisation ID (multi-tenant isolation)
   * @returns Updated project
   */
  async updateStatus(
    id: string,
    status: string,
    organisationId: string
  ): Promise<Project> {
    const query = `
      UPDATE projects
      SET status = $1, updatedAt = NOW()
      WHERE id = $2 AND organisationId = $3
      RETURNING *
    `;

    try {
      const result = await this.dbPool.query(query, [status, id, organisationId]);
      if (result.rows.length === 0) {
        return null as any; // Will be handled by service layer
      }
      return this.mapRowToProject(result.rows[0]);
    } catch (error) {
      throw new InternalServerError('Failed to update project status', error as Error);
    }
  }

  /**
   * Delete project.
   * @param id Project ID
   * @param organisationId Organisation ID (multi-tenant isolation)
   * @returns true if deleted, false if not found
   */
  async delete(id: string, organisationId: string): Promise<boolean> {
    const query = 'DELETE FROM projects WHERE id = $1 AND organisationId = $2';

    try {
      const result = await this.dbPool.query(query, [id, organisationId]);
      return result.rowCount! > 0;
    } catch (error) {
      throw new InternalServerError('Failed to delete project', error as Error);
    }
  }

  /**
   * Map database row to Project entity.
   * @private
   */
  private mapRowToProject(row: any): Project {
    return new Project({
      id: row.id,
      name: row.name,
      description: row.description,
      teamId: row.teamId,
      organisationId: row.organisationId,
      status: row.status,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    });
  }
}
