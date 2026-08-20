import { IsString, IsUUID, MinLength, MaxLength, IsOptional } from 'class-validator';

/**
 * Data Transfer Object for creating a new project.
 * Enforces strict validation rules for input data.
 */
export class CreateProjectInput {
  @IsString()
  @MinLength(3, { message: 'Project name must be at least 3 characters' })
  @MaxLength(255, { message: 'Project name must not exceed 255 characters' })
  name!: string;

  @IsString()
  @MaxLength(2000, { message: 'Description must not exceed 2000 characters' })
  @IsOptional()
  description?: string;

  @IsUUID()
  teamId!: string;
}

/**
 * Data Transfer Object for updating project status.
 */
export class UpdateProjectStatusInput {
  @IsString()
  status!: 'active' | 'archived' | 'closed';
}
